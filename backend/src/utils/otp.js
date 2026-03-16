import crypto from 'crypto';

const OTP_LENGTH = 6;

export const normalizePhone = (phone) => {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');

  if (digits.startsWith('0') && digits.length === 11) {
    return `+234${digits.slice(1)}`;
  }

  if (digits.startsWith('234')) {
    return `+${digits}`;
  }

  if (phone.startsWith('+')) {
    return `+${digits}`;
  }

  return `+${digits}`;
};

export const normalizeEmail = (email) => {
  if (!email) return '';
  return String(email).trim().toLowerCase();
};

const normalizeOtpIdentifier = (identifier) => {
  if (!identifier) return '';
  return identifier.includes('@') ? normalizeEmail(identifier) : normalizePhone(identifier);
};

export const generateOtp = () => {
  const min = 10 ** (OTP_LENGTH - 1);
  const max = (10 ** OTP_LENGTH) - 1;
  return String(Math.floor(Math.random() * (max - min + 1)) + min);
};

export const hashOtp = (phone, purpose, code) => {
  const secret = process.env.OTP_HASH_SECRET || process.env.JWT_SECRET || 'otp_secret';
  return crypto
    .createHmac('sha256', secret)
    .update(`${normalizeOtpIdentifier(phone)}:${purpose}:${code}`)
    .digest('hex');
};
