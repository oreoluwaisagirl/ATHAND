import express from 'express';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import Worker from '../models/Worker.js';
import OtpCode from '../models/OtpCode.js';
import { authenticate } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import { generateOtp, hashOtp, normalizeEmail, normalizePhone, sendOtpSms } from '../utils/otp.js';
import { sendEmail } from '../utils/email.js';

const router = express.Router();

const OTP_EXPIRY_MINUTES = parseInt(process.env.OTP_EXPIRY_MINUTES || '10', 10);
const OTP_RESEND_SECONDS = parseInt(process.env.OTP_RESEND_SECONDS || '60', 10);
const OTP_MAX_PER_HOUR = parseInt(process.env.OTP_MAX_PER_HOUR || '5', 10);
const OTP_TOKEN_EXPIRES_IN = process.env.OTP_TOKEN_EXPIRES_IN || '15m';
const OTP_EXPOSE_CODE = String(process.env.OTP_EXPOSE_CODE || '').toLowerCase() === 'true';
const OTP_DISABLE_RATE_LIMIT = String(process.env.OTP_DISABLE_RATE_LIMIT || '').toLowerCase() === 'true';
const OTP_TEST_MODE = String(process.env.OTP_TEST_MODE || '').toLowerCase() === 'true';
const OTP_TEST_CODE = process.env.OTP_TEST_CODE || '123456';
const OTP_DEBUG_API = String(process.env.OTP_DEBUG_API || '').toLowerCase() === 'true';
const WORKER_EMAIL_ALLOWLIST = new Set(
  (process.env.WORKER_EMAIL_ALLOWLIST || '')
    .split(',')
    .map((email) => String(email || '').trim().toLowerCase())
    .filter(Boolean)
);

const isWorkerEmail = (email) => WORKER_EMAIL_ALLOWLIST.has(String(email || '').trim().toLowerCase());
const isWorkerOnboardingComplete = (worker) => {
  if (!worker) return false;
  return Boolean(worker.onboardingCompleted && String(worker.occupation || '').trim());
};

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const generateOtpSessionToken = ({ phone = null, email = null, purpose }) => {
  return jwt.sign(
    {
      phone,
      email,
      purpose,
      verified: true,
      type: 'otp',
    },
    process.env.OTP_JWT_SECRET || process.env.JWT_SECRET,
    { expiresIn: OTP_TOKEN_EXPIRES_IN }
  );
};

const validateOtpSessionToken = ({ token, expectedPurpose, phone, email }) => {
  try {
    const payload = jwt.verify(token, process.env.OTP_JWT_SECRET || process.env.JWT_SECRET);
    if (payload.type !== 'otp' || payload.verified !== true) {
      throw new AppError('Invalid OTP session token', 401);
    }

    if (payload.purpose !== expectedPurpose) {
      throw new AppError('OTP token purpose mismatch', 401);
    }

    if (phone && payload.phone !== normalizePhone(phone)) {
      throw new AppError('OTP token phone mismatch', 401);
    }

    if (email && payload.email !== normalizeEmail(email)) {
      throw new AppError('OTP token email mismatch', 401);
    }

    return payload;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('OTP token is invalid or expired', 401);
  }
};

const enforceOtpRateLimit = async ({ phone, email, purpose }) => {
  if (OTP_DISABLE_RATE_LIMIT) {
    return;
  }
  if (!phone && !email) {
    throw new AppError('Phone or email is required for OTP', 400);
  }

  const now = Date.now();
  const targetQuery = phone ? { phone } : { email };

  const latest = await OtpCode.findOne({ ...targetQuery, purpose }).sort({ createdAt: -1 });
  if (latest) {
    const secondsSinceLast = Math.floor((now - new Date(latest.createdAt).getTime()) / 1000);
    if (secondsSinceLast < OTP_RESEND_SECONDS) {
      const retryAfter = OTP_RESEND_SECONDS - secondsSinceLast;
      throw new AppError(`Please wait ${retryAfter}s before requesting another OTP`, 429);
    }
  }

  const oneHourAgo = new Date(now - (60 * 60 * 1000));
  const recentCount = await OtpCode.countDocuments({
    ...targetQuery,
    purpose,
    createdAt: { $gte: oneHourAgo },
  });

  if (recentCount >= OTP_MAX_PER_HOUR) {
    throw new AppError('Too many OTP requests. Please try again later.', 429);
  }
};

const sendOtpEmail = async ({ email, code, purpose }) => {
  const ttl = parseInt(process.env.OTP_EXPIRY_MINUTES || '10', 10);
  const title = purpose.replace('_', ' ').toUpperCase();
  const subject = `ATHAND ${title} OTP`;
  const text = `Your ATHAND ${purpose.replace('_', ' ')} code is ${code}. Expires in ${ttl} minutes.`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto;">
      <h2 style="margin: 0 0 12px; color: #0B1C2D;">ATHAND Verification Code</h2>
      <p style="margin: 0 0 12px;">Use this code to continue your ${purpose.replace('_', ' ')}:</p>
      <p style="font-size: 28px; letter-spacing: 6px; font-weight: 700; margin: 16px 0;">${code}</p>
      <p style="margin: 0; color: #555;">This code expires in ${ttl} minutes.</p>
    </div>
  `;

  const result = await sendEmail({ to: email, subject, text, html });
  if (!result?.success) {
    throw new Error(result?.error || 'Failed to send OTP email');
  }

  return { success: true, provider: 'email' };
};

const getOtpChannelForPurpose = (purpose) => (purpose === 'login' ? 'phone' : 'email');

// Debug/Test OTP generator (no SMS/email delivery)
router.post('/otp/generate', [
  body('phone').optional().trim().notEmpty(),
  body('email').optional().isEmail().normalizeEmail(),
  body('purpose').isIn(['login', 'signup', 'password_reset']),
], async (req, res, next) => {
  try {
    if (process.env.NODE_ENV === 'production' && !OTP_DEBUG_API) {
      throw new AppError('OTP debug endpoint is disabled', 403);
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const rawPhone = req.body.phone;
    const rawEmail = req.body.email;
    const phone = rawPhone ? normalizePhone(rawPhone) : null;
    const email = rawEmail ? normalizeEmail(rawEmail) : null;
    const { purpose } = req.body;

    const channel = getOtpChannelForPurpose(purpose);
    if (channel === 'email' && !email) throw new AppError('Email is required for this OTP purpose', 400);
    if (channel === 'phone' && !phone) throw new AppError('Phone is required for this OTP purpose', 400);

    if (purpose === 'login') {
      const existingUser = await User.findOne({ phone });
      if (!existingUser) {
        throw new AppError('No user found with this phone number', 404);
      }
    }

    if (purpose === 'signup') {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new AppError('Email already registered', 400);
      }
    }
    if (purpose === 'password_reset') {
      const existingUser = await User.findOne({ email });
      if (!existingUser) {
        throw new AppError('No user found with this email', 404);
      }
    }

    await enforceOtpRateLimit({ phone, email, purpose });

    if (OTP_TEST_MODE && !/^\d{6}$/.test(OTP_TEST_CODE)) {
      throw new AppError('OTP_TEST_CODE must be a 6-digit numeric string', 500);
    }

    const code = OTP_TEST_MODE ? OTP_TEST_CODE : generateOtp();
    const otpTarget = channel === 'email' ? email : phone;
    const codeHash = hashOtp(otpTarget, purpose, code);
    const expiresAt = new Date(Date.now() + (OTP_EXPIRY_MINUTES * 60 * 1000));

    await OtpCode.create({
      channel,
      phone,
      email,
      purpose,
      codeHash,
      expiresAt,
    });

    res.json({
      success: true,
      message: 'OTP generated successfully (debug)',
      purpose,
      channel,
      expiresInSeconds: OTP_EXPIRY_MINUTES * 60,
      otp: code,
    });
  } catch (error) {
    next(error);
  }
});

// Request OTP
router.post('/otp/request', [
  body('phone').optional().trim().notEmpty(),
  body('email').optional().isEmail().normalizeEmail(),
  body('purpose').isIn(['login', 'signup', 'password_reset']),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const rawPhone = req.body.phone;
    const rawEmail = req.body.email;
    const phone = rawPhone ? normalizePhone(rawPhone) : null;
    const email = rawEmail ? normalizeEmail(rawEmail) : null;
    const { purpose } = req.body;

    const channel = getOtpChannelForPurpose(purpose);
    if (channel === 'email' && !email) throw new AppError('Email is required for this OTP purpose', 400);
    if (channel === 'phone' && !phone) throw new AppError('Phone is required for this OTP purpose', 400);

    if (purpose === 'login') {
      const existingUser = await User.findOne({ phone });
      if (!existingUser) {
        throw new AppError('No user found with this phone number', 404);
      }
    }

    if (purpose === 'signup') {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new AppError('Email already registered', 400);
      }
    }
    if (purpose === 'password_reset') {
      const existingUser = await User.findOne({ email });
      if (!existingUser) {
        throw new AppError('No user found with this email', 404);
      }
    }

    await enforceOtpRateLimit({ phone, email, purpose });

    if (OTP_TEST_MODE && !/^\d{6}$/.test(OTP_TEST_CODE)) {
      throw new AppError('OTP_TEST_CODE must be a 6-digit numeric string', 500);
    }

    const code = OTP_TEST_MODE ? OTP_TEST_CODE : generateOtp();
    const otpTarget = channel === 'email' ? email : phone;
    const codeHash = hashOtp(otpTarget, purpose, code);
    const expiresAt = new Date(Date.now() + (OTP_EXPIRY_MINUTES * 60 * 1000));

    await OtpCode.create({
      channel,
      phone,
      email,
      purpose,
      codeHash,
      expiresAt,
    });

    const delivery = OTP_TEST_MODE
      ? { success: true, provider: 'test-mode', skippedSms: true }
      : channel === 'email'
        ? await sendOtpEmail({ email, code, purpose })
        : await sendOtpSms({ phone, code, purpose });

    res.json({
      success: true,
      message: 'OTP sent successfully',
      expiresInSeconds: OTP_EXPIRY_MINUTES * 60,
      deliveryProvider: delivery?.provider || 'unknown',
      ...(delivery?.skippedSms && { skippedSms: true }),
      ...(delivery?.fallback && { deliveryFallback: true, deliveryReason: delivery?.reason || null }),
      ...((process.env.NODE_ENV !== 'production' || OTP_EXPOSE_CODE) && { devOtp: code }),
    });
  } catch (error) {
    next(error);
  }
});

// Verify OTP
router.post('/otp/verify', [
  body('phone').optional().trim().notEmpty(),
  body('email').optional().isEmail().normalizeEmail(),
  body('purpose').isIn(['login', 'signup', 'password_reset']),
  body('code').isLength({ min: 6, max: 6 }).isNumeric(),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const rawPhone = req.body.phone;
    const rawEmail = req.body.email;
    const phone = rawPhone ? normalizePhone(rawPhone) : null;
    const email = rawEmail ? normalizeEmail(rawEmail) : null;
    const { purpose, code } = req.body;
    const channel = getOtpChannelForPurpose(purpose);
    const otpTarget = channel === 'email' ? email : phone;

    if (!otpTarget) {
      throw new AppError(channel === 'email' ? 'Email is required' : 'Phone is required', 400);
    }

    const otpRecord = await OtpCode.findOne({
      channel,
      ...(channel === 'email' ? { email } : { phone }),
      purpose,
      verifiedAt: null,
      usedAt: null,
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      throw new AppError('OTP not found. Request a new code.', 404);
    }

    if (otpRecord.expiresAt < new Date()) {
      otpRecord.usedAt = new Date();
      await otpRecord.save();
      throw new AppError('OTP has expired. Request a new code.', 400);
    }

    if (otpRecord.attempts >= otpRecord.maxAttempts) {
      throw new AppError('Maximum OTP attempts exceeded. Request a new code.', 429);
    }

    const submittedHash = hashOtp(otpTarget, purpose, code);
    if (submittedHash !== otpRecord.codeHash) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      throw new AppError('Invalid OTP code', 401);
    }

    otpRecord.verifiedAt = new Date();
    otpRecord.usedAt = new Date();
    await otpRecord.save();

    const otpToken = generateOtpSessionToken({ phone, email, purpose });

    res.json({
      success: true,
      message: 'OTP verified successfully',
      otpToken,
    });
  } catch (error) {
    next(error);
  }
});

// Phone login using verified OTP token
router.post('/phone-login', [
  body('phone').trim().notEmpty(),
  body('otpToken').notEmpty(),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const phone = normalizePhone(req.body.phone);
    const { otpToken } = req.body;

    validateOtpSessionToken({ token: otpToken, expectedPurpose: 'login', phone });

    const user = await User.findOne({ phone });
    if (!user) {
      throw new AppError('No user found with this phone number', 404);
    }

    if (!user.isActive) {
      throw new AppError('Account is deactivated', 403);
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    next(error);
  }
});

// Register new user
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('fullName').trim().notEmpty(),
  body('phone').trim().notEmpty(),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, fullName, role } = req.body;

    const phone = normalizePhone(req.body.phone);

    const existingUser = await User.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingUser) {
      throw new AppError('Email or phone already registered', 400);
    }

    const resolvedRole = isWorkerEmail(email) ? 'worker' : (role || 'user');

    const user = await User.create({
      email,
      passwordHash: password,
      fullName,
      phone,
      role: resolvedRole,
      isEmailVerified: false,
    });

    let worker = null;
    if (resolvedRole === 'worker') {
      worker = await Worker.create({ userId: user._id, onboardingCompleted: false });
    }

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: user.toJSON(),
      ...(worker && { worker }),
      requiresWorkerOnboarding: resolvedRole === 'worker',
    });
  } catch (error) {
    next(error);
  }
});

// Login (email + password)
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new AppError('Invalid credentials', 401);
    }

    if (!user.isActive) {
      throw new AppError('Account is deactivated', 403);
    }

    if (isWorkerEmail(email) && user.role !== 'worker') {
      user.role = 'worker';
    }

    user.lastLogin = new Date();
    await user.save();

    let workerProfile = null;
    if (user.role === 'worker') {
      workerProfile = await Worker.findOne({ userId: user._id });
      if (!workerProfile) {
        workerProfile = await Worker.create({ userId: user._id, onboardingCompleted: false });
      }
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: user.toJSON(),
      ...(workerProfile && { worker: workerProfile }),
      requiresWorkerOnboarding: user.role === 'worker' && !isWorkerOnboardingComplete(workerProfile),
    });
  } catch (error) {
    next(error);
  }
});

// Reset password after OTP verification (purpose: password_reset)
router.post('/password-reset', [
  body('email').isEmail().normalizeEmail(),
  body('otpToken').notEmpty(),
  body('newPassword').isLength({ min: 6 }),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const email = normalizeEmail(req.body.email);
    const { otpToken, newPassword } = req.body;

    validateOtpSessionToken({ token: otpToken, expectedPurpose: 'password_reset', email });

    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError('No user found with this email', 404);
    }

    user.passwordHash = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successful',
    });
  } catch (error) {
    next(error);
  }
});

// Get current user
router.get('/me', authenticate, async (req, res) => {
  const user = req.user;

  if (user.role === 'worker') {
    const worker = await Worker.findOne({ userId: user._id });
    res.json({
      success: true,
      user,
      worker,
      requiresWorkerOnboarding: !isWorkerOnboardingComplete(worker),
    });
  } else {
    res.json({ success: true, user });
  }
});

// Complete worker onboarding (worker only)
router.post('/worker-onboarding', authenticate, [
  body('occupation').trim().notEmpty(),
  body('yearsExperience').optional().isFloat({ min: 0, max: 60 }),
  body('hourlyRate').optional().isFloat({ min: 0 }),
  body('bio').optional().isLength({ max: 1000 }),
  body('serviceArea').optional().isArray(),
  body('skills').optional().isArray(),
  body('languages').optional().isArray(),
], async (req, res, next) => {
  try {
    if (req.user.role !== 'worker') {
      throw new AppError('Worker access required', 403);
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let worker = await Worker.findOne({ userId: req.user._id });
    if (!worker) {
      worker = await Worker.create({ userId: req.user._id, onboardingCompleted: false });
    }

    const {
      occupation,
      yearsExperience,
      hourlyRate,
      bio,
      serviceArea,
      skills,
      languages,
    } = req.body;

    worker.occupation = String(occupation || '').trim();
    if (yearsExperience !== undefined) worker.yearsExperience = Number(yearsExperience);
    if (hourlyRate !== undefined) worker.hourlyRate = Number(hourlyRate);
    if (bio !== undefined) worker.bio = String(bio || '').trim();
    if (Array.isArray(serviceArea)) worker.serviceArea = serviceArea.map((item) => String(item || '').trim()).filter(Boolean);
    if (Array.isArray(skills)) worker.skills = skills.map((item) => String(item || '').trim()).filter(Boolean);
    if (Array.isArray(languages)) worker.languages = languages.map((item) => String(item || '').trim()).filter(Boolean);

    worker.onboardingCompleted = isWorkerOnboardingComplete({
      ...worker.toObject(),
      onboardingCompleted: true,
    });

    await worker.save();

    res.json({
      success: true,
      worker,
      requiresWorkerOnboarding: !isWorkerOnboardingComplete(worker),
    });
  } catch (error) {
    next(error);
  }
});

// Update profile
router.put('/profile', authenticate, [
  body('fullName').optional().trim().notEmpty(),
  body('phone').optional().trim().notEmpty(),
], async (req, res, next) => {
  try {
    const { fullName, phone, profilePhotoUrl } = req.body;

    const user = await User.findById(req.user._id);
    if (fullName) user.fullName = fullName;
    if (phone) user.phone = normalizePhone(phone);
    if (profilePhotoUrl) user.profilePhotoUrl = profilePhotoUrl;

    await user.save();

    res.json({ success: true, user: user.toJSON() });
  } catch (error) {
    next(error);
  }
});

// Change password
router.put('/password', authenticate, [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 6 }),
], async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      throw new AppError('Current password is incorrect', 400);
    }

    user.passwordHash = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
