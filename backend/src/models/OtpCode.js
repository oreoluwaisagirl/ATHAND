import mongoose from 'mongoose';

const otpCodeSchema = new mongoose.Schema({
  phone: {
    type: String,
    default: null,
    index: true,
  },
  email: {
    type: String,
    default: null,
    lowercase: true,
    trim: true,
    index: true,
  },
  channel: {
    type: String,
    enum: ['phone', 'email'],
    default: 'phone',
    required: true,
    index: true,
  },
  purpose: {
    type: String,
    enum: ['login', 'signup', 'password_reset'],
    required: true,
    index: true,
  },
  codeHash: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true,
  },
  attempts: {
    type: Number,
    default: 0,
  },
  maxAttempts: {
    type: Number,
    default: 5,
  },
  verifiedAt: {
    type: Date,
    default: null,
  },
  usedAt: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

otpCodeSchema.pre('validate', function(next) {
  if (this.channel === 'email' && !this.email) {
    return next(new Error('Email is required for email OTP'));
  }

  if (this.channel === 'phone' && !this.phone) {
    return next(new Error('Phone is required for phone OTP'));
  }

  return next();
});

otpCodeSchema.index({ createdAt: 1 }, { expireAfterSeconds: 3600 });
otpCodeSchema.index({ phone: 1, purpose: 1, createdAt: -1 });
otpCodeSchema.index({ email: 1, purpose: 1, createdAt: -1 });

const OtpCode = mongoose.model('OtpCode', otpCodeSchema);

export default OtpCode;
