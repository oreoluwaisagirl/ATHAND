import mongoose from 'mongoose';

const providerSignupRequestSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  requestedRole: {
    type: String,
    enum: ['worker'],
    default: 'worker',
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  reviewedAt: {
    type: Date,
    default: null,
  },
  adminNotes: {
    type: String,
    default: '',
  },
  approvedUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  approvedWorkerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker',
    default: null,
  },
}, {
  timestamps: true,
});

providerSignupRequestSchema.index({ status: 1, createdAt: 1 });

const ProviderSignupRequest = mongoose.model('ProviderSignupRequest', providerSignupRequestSchema);

export default ProviderSignupRequest;
