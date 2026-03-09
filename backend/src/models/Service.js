import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    lowercase: true
  },
  description: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: null
  },
  basePrice: {
    type: Number,
    default: null
  },
  duration: {
    type: Number, // in minutes
    default: 60
  },
  isActive: {
    type: Boolean,
    default: true
  },
  displayOrder: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

serviceSchema.index({ categoryId: 1 });
serviceSchema.index({ slug: 1 });
serviceSchema.index({ isActive: 1 });

const Service = mongoose.model('Service', serviceSchema);

export default Service;
