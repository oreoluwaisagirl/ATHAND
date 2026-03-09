import mongoose from 'mongoose';

const workerServiceSchema = new mongoose.Schema({
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
  customPrice: {
    type: Number,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

workerServiceSchema.index({ workerId: 1, serviceId: 1 }, { unique: true });
workerServiceSchema.index({ serviceId: 1 });

const WorkerService = mongoose.model('WorkerService', workerServiceSchema);

export default WorkerService;
