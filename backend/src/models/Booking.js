import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
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
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  address: {
    street: { type: String, required: true },
    city: { type: String, default: 'Lagos' },
    state: { type: String, default: 'Lagos' },
    lga: { type: String },
    landmark: { type: String }
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  scheduledTime: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true,
    min: 15
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in_progress', 'awaiting_confirmation', 'completed', 'cancelled', 'rejected'],
    default: 'pending'
  },
  emergency: {
    type: Boolean,
    default: false
  },
  emergencyType: {
    type: String,
    enum: ['mechanic', 'plumber', 'electrician', 'generator_repair', null],
    default: null
  },
  emergencyStatus: {
    type: String,
    enum: ['requested', 'assigned', 'en_route', 'arrived', 'in_progress', 'awaiting_confirmation', 'completed', 'cancelled', null],
    default: null
  },
  notes: {
    type: String,
    default: ''
  },
  price: {
    type: Number,
    default: null
  },
  platformFee: {
    type: Number,
    default: 0
  },
  workerEarnings: {
    type: Number,
    default: 0
  },
  cancelledBy: {
    type: String,
    enum: ['user', 'worker', 'admin', null],
    default: null
  },
  cancellationReason: {
    type: String,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  },
  customerConfirmedAt: {
    type: Date,
    default: null
  },
  startedAt: {
    type: Date,
    default: null
  },
  confirmedAt: {
    type: Date,
    default: null
  },
  // Payment fields
  paymentStatus: {
    type: String,
    // `paid` retained for backward compatibility with existing records.
    enum: ['pending', 'paid', 'held', 'released', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentReference: {
    type: String,
    default: null
  },
  paymentAmount: {
    type: Number,
    default: null
  },
  paidAt: {
    type: Date,
    default: null
  },
  escrowHeldAt: {
    type: Date,
    default: null
  },
  // Worker payout fields
  workerPaid: {
    type: Boolean,
    default: false
  },
  workerPayoutReference: {
    type: String,
    default: null
  },
  workerPaidAt: {
    type: Date,
    default: null
  },
  workerPayoutAmount: {
    type: Number,
    default: null
  },
  commissionRate: {
    type: Number,
    default: 0.2
  }
}, {
  timestamps: true
});

// Indexes
bookingSchema.index({ userId: 1 });
bookingSchema.index({ workerId: 1 });
bookingSchema.index({ serviceId: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ scheduledDate: 1 });
bookingSchema.index({ emergency: 1 });
bookingSchema.index({ createdAt: -1 });

// Calculate price before saving
bookingSchema.pre('save', function(next) {
  if (this.isModified('price') && this.price) {
    this.platformFee = Math.round(this.price * (this.commissionRate || 0.2) * 100) / 100;
    this.workerEarnings = this.price - this.platformFee;
  }
  next();
});

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
