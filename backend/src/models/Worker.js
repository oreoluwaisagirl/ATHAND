import mongoose from 'mongoose';

const workerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  bio: {
    type: String,
    default: '',
    maxlength: 1000
  },
  occupation: {
    type: String,
    default: '',
    trim: true,
    maxlength: 120
  },
  onboardingCompleted: {
    type: Boolean,
    default: false
  },
  yearsExperience: {
    type: Number,
    default: 0,
    min: 0
  },
  profilePhotoUrl: {
    type: String,
    default: null
  },
  introVideoUrl: {
    type: String,
    default: null
  },
  serviceArea: {
    type: [String],
    default: []
  },
  availability: {
    type: Map,
    of: {
      start: String,
      end: String,
      available: Boolean
    },
    default: {}
  },
  trustScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  badges: [{
    type: String
  }],
  ninNumber: {
    type: String,
    default: null
  },
  ninImageUrl: {
    type: String,
    default: null
  },
  ninFirstName: {
    type: String,
    default: null
  },
  ninLastName: {
    type: String,
    default: null
  },
  ninDob: {
    type: String,
    default: null
  },
  ninVerified: {
    type: Boolean,
    default: false
  },
  governmentIdNumber: {
    type: String,
    default: null
  },
  idImageUrl: {
    type: String,
    default: null
  },
  idType: {
    type: String,
    enum: ['drivers_license', 'international_passport', 'voters_card', null],
    default: null
  },
  idNumber: {
    type: String,
    default: null
  },
  idVerified: {
    type: Boolean,
    default: false
  },
  selfieUrl: {
    type: String,
    default: null
  },
  faceMatchVerified: {
    type: Boolean,
    default: false
  },
  backgroundCheckPassed: {
    type: Boolean,
    default: false
  },
  rejectionReason: {
    type: String,
    default: null
  },
  hourlyRate: {
    type: Number,
    default: null
  },
  languages: [{
    type: String
  }],
  skills: [{
    type: String
  }],
  emergencyServices: {
    type: Boolean,
    default: false
  },
  totalBookings: {
    type: Number,
    default: 0
  },
  completedBookings: {
    type: Number,
    default: 0
  },
  cancelledBookings: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  availableNow: {
    type: Boolean,
    default: false,
    index: true
  },
  autoAccept: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  responseTime: {
    type: Number,
    default: null
  },
  // Bank details for payouts
  bankAccount: {
    type: String,
    default: null
  },
  bankCode: {
    type: String,
    default: null
  },
  bankAccountName: {
    type: String,
    default: null
  },
  paystackRecipientCode: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Indexes
workerSchema.index({ verificationStatus: 1 });
workerSchema.index({ trustScore: -1 });
workerSchema.index({ averageRating: -1 });
workerSchema.index({ isFeatured: -1 });
workerSchema.index({ isAvailable: 1 });
workerSchema.index({ serviceArea: 1 });
workerSchema.index({ emergencyServices: 1 });

// Trust Score Weights
const TRUST_WEIGHTS = {
  verification: 0.40,
  rating: 0.40,
  repeatBookings: 0.20
};

const BOOKING_THRESHOLD = 10; // Threshold for max repeat booking score

// Calculate trust score method
// trust_score = (verification_weight * verification_factor) + (rating_weight * avg_rating) + (booking_weight * repeat_bookings_factor)
workerSchema.methods.calculateTrustScore = function() {
  // Verification factor (0-5): based on verification status
  let verificationFactor = 0;
  if (this.verificationStatus === 'verified') {
    verificationFactor = 5;
  } else if (this.verificationStatus === 'pending') {
    // Partial verification - check what's verified
    let verifiedCount = 0;
    if (this.ninVerified) verifiedCount++;
    if (this.idVerified) verifiedCount++;
    if (this.faceMatchVerified) verifiedCount++;
    verificationFactor = (verifiedCount / 3) * 5; // Max 5 for partial
  }
  
  // Rating factor (0-5): already normalized to 0-5
  const ratingFactor = this.averageRating || 0;
  
  // Repeat bookings factor (0-5): completed bookings / threshold, capped at 5
  const repeatBookingsFactor = Math.min(
    (this.completedBookings || 0) / BOOKING_THRESHOLD,
    5
  );
  
  // Calculate weighted trust score (0-100)
  const trustScore = Math.round(
    (TRUST_WEIGHTS.verification * verificationFactor * 20) +
    (TRUST_WEIGHTS.rating * ratingFactor * 20) +
    (TRUST_WEIGHTS.repeatBookings * repeatBookingsFactor * 20)
  );
  
  this.trustScore = Math.min(trustScore, 100);
  return this.trustScore;
};

// Static method to recalculate all trust scores (for cron job)
workerSchema.statics.recalculateAllTrustScores = async function() {
  const workers = await this.find({});
  for (const worker of workers) {
    await worker.calculateTrustScore();
    await worker.save();
  }
  console.log(`Recalculated trust scores for ${workers.length} workers`);
};

const Worker = mongoose.model('Worker', workerSchema);

export default Worker;
