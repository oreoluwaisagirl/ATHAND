import mongoose from 'mongoose';

const verificationDocumentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  workerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker',
    required: true
  },
  documentType: {
    type: String,
    enum: ['nin', 'id_card', 'passport', 'drivers_license', 'voters_card'],
    required: true
  },
  documentNumber: {
    type: String,
    required: true
  },
  documentImageUrl: {
    type: String,
    required: true
  },
  selfieUrl: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  verificationResult: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  rejectionReason: {
    type: String,
    default: null
  },
  verifiedAt: {
    type: Date,
    default: null
  },
  expiresAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Indexes
verificationDocumentSchema.index({ userId: 1 });
verificationDocumentSchema.index({ workerId: 1 });
verificationDocumentSchema.index({ status: 1 });
verificationDocumentSchema.index({ documentType: 1 });

const VerificationDocument = mongoose.model('VerificationDocument', verificationDocumentSchema);

export default VerificationDocument;

