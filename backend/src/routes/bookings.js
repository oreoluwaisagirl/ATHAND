import express from 'express';
import { body, validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { authenticate, authorize } from '../middleware/auth.js';
import Booking from '../models/Booking.js';
import Worker from '../models/Worker.js';
import Service from '../models/Service.js';
import Notification from '../models/Notification.js';
import { AppError } from '../middleware/errorHandler.js';
import { transferToWorker } from '../utils/paystack.js';

const router = express.Router();
const generateReference = () => `ATH_PAYOUT_${Date.now()}_${uuidv4().slice(0, 8)}`;

// Check slot availability
const checkSlotAvailability = async (workerId, scheduledDate, scheduledTime, duration, excludeBookingId = null) => {
  const startTime = scheduledTime;
  // Calculate end time (simplified - assumes duration in minutes)
  const [hours, minutes] = startTime.split(':').map(Number);
  const endMinutes = hours * 60 + minutes + duration;
  const endHours = Math.floor(endMinutes / 60);
  const endMins = endMinutes % 60;
  const endTime = `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;
  
  // Find overlapping bookings
  const query = {
    workerId,
    scheduledDate,
    status: { $nin: ['cancelled', 'rejected'] },
    $or: [
      // New booking starts during existing booking
      { 
        scheduledTime: { $lt: endTime },
        $expr: { 
          $gt: [
            { $add: [{ $convert: { input: "$scheduledTime", to: "int", onError: 0 } }, "$duration"] },
            startTime
          ]
        }
      },
      // New booking ends during existing booking  
      {
        scheduledTime: { $gte: startTime, $lt: endTime }
      }
    ]
  };
  
  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }
  
  const conflictingBookings = await Booking.find(query);
  return conflictingBookings.length === 0;
};

// Create booking
router.post('/', authenticate, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      workerId,
      serviceId,
      address,
      scheduledDate,
      scheduledTime,
      duration,
      notes,
      emergency,
      emergencyType
    } = req.body;

    // Verify worker exists and is available
    const worker = await Worker.findById(workerId);
    if (!worker) {
      throw new AppError('Worker not found', 404);
    }
    
    // For non-emergency bookings, check availability
    if (!emergency) {
      if (!worker.isAvailable) {
        throw new AppError('Worker is not available', 400);
      }
      
      // Check slot availability
      const slotAvailable = await checkSlotAvailability(workerId, scheduledDate, scheduledTime, duration);
      if (!slotAvailable) {
        throw new AppError('This time slot is not available. Please choose another time.', 400);
      }
    }

    // Verify service exists
    const service = await Service.findById(serviceId);
    if (!service) {
      throw new AppError('Service not found', 404);
    }

    // Calculate price
    const price = worker.hourlyRate 
      ? (worker.hourlyRate / 60) * duration 
      : service.basePrice;

    // Determine initial status (auto-confirm for emergency or if worker has auto-accept enabled)
    const initialStatus = (emergency || worker.autoAccept) ? 'confirmed' : 'pending';

    const booking = await Booking.create({
      userId: req.user._id,
      workerId,
      serviceId,
      address,
      scheduledDate,
      scheduledTime,
      duration,
      notes,
      emergency: emergency || false,
      emergencyType: emergency ? emergencyType || null : null,
      emergencyStatus: emergency ? (initialStatus === 'confirmed' ? 'assigned' : 'requested') : null,
      price,
      status: initialStatus
    });

    // Create notification for worker
    const notificationMessage = initialStatus === 'confirmed' 
      ? `New booking confirmed for ${service.name}`
      : `New booking request for ${service.name} - please accept or reject`;

    await Notification.create({
      userId: worker.userId,
      type: 'booking',
      title: emergency ? 'Emergency Booking!' : 'New Booking Request',
      message: notificationMessage,
      data: { bookingId: booking._id }
    });

    // If emergency, also notify admins
    if (emergency) {
      await Notification.create({
        userId: req.user._id, // This will be overridden by admin notification system
        type: 'emergency',
        title: 'Emergency Booking Created',
        message: `Emergency booking created by user ${req.user.fullName} with worker ${worker.userId.fullName}`,
        data: { bookingId: booking._id }
      });
    }

    const populatedBooking = await Booking.findById(booking._id)
      .populate('workerId')
      .populate('serviceId')
      .populate('userId', 'fullName phone email');

    res.status(201).json({ 
      success: true, 
      booking: populatedBooking,
      autoConfirmed: initialStatus === 'confirmed'
    });
  } catch (error) {
    next(error);
  }
});

// Check availability for a specific slot
router.get('/availability', authenticate, async (req, res, next) => {
  try {
    const { workerId, date, time, duration } = req.query;
    
    if (!workerId || !date || !time || !duration) {
      throw new AppError('Missing required parameters', 400);
    }

    const worker = await Worker.findById(workerId);
    if (!worker) {
      throw new AppError('Worker not found', 404);
    }

    const isAvailable = await checkSlotAvailability(workerId, date, time, parseInt(duration));
    
    res.json({ 
      success: true,
      available: isAvailable,
      workerAvailable: worker.isAvailable
    });
  } catch (error) {
    next(error);
  }
});

// Worker accepts a booking (convenience endpoint)
router.post('/:id/accept', authenticate, async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('workerId')
      .populate('userId', '_id fullName');

    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    // Only the assigned worker can accept
    if (booking.workerId.userId.toString() !== req.user._id.toString()) {
      throw new AppError('Only the assigned worker can accept this booking', 403);
    }

    if (booking.status !== 'pending') {
      throw new AppError('This booking cannot be accepted', 400);
    }

    booking.status = 'confirmed';
    booking.confirmedAt = new Date();
    await booking.save();

    // Notify user
    await Notification.create({
      userId: booking.userId._id,
      type: 'booking',
      title: 'Booking Accepted',
      message: `Your booking for ${booking.workerId.serviceId?.name || 'service'} has been accepted!`,
      data: { bookingId: booking._id }
    });

    res.json({ success: true, booking });
  } catch (error) {
    next(error);
  }
});

// Worker rejects a booking (convenience endpoint)
router.post('/:id/reject', authenticate, async (req, res, next) => {
  try {
    const { reason } = req.body;
    
    const booking = await Booking.findById(req.params.id)
      .populate('workerId')
      .populate('userId', '_id fullName');

    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    // Only the assigned worker can reject
    if (booking.workerId.userId.toString() !== req.user._id.toString()) {
      throw new AppError('Only the assigned worker can reject this booking', 403);
    }

    if (booking.status !== 'pending') {
      throw new AppError('This booking cannot be rejected', 400);
    }

    booking.status = 'rejected';
    booking.cancellationReason = reason || 'Rejected by worker';
    booking.cancelledBy = 'worker';
    await booking.save();

    // Notify user
    await Notification.create({
      userId: booking.userId._id,
      type: 'booking',
      title: 'Booking Rejected',
      message: `Your booking for ${booking.workerId.serviceId?.name || 'service'} has been rejected. ${reason ? 'Reason: ' + reason : ''}`,
      data: { bookingId: booking._id }
    });

    res.json({ success: true, booking });
  } catch (error) {
    next(error);
  }
});

// Get user's bookings
router.get('/my-bookings', authenticate, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    
    const query = { userId: req.user._id };
    if (status) query.status = status;

    const bookings = await Booking.find(query)
      .populate('workerId', 'userId profilePhotoUrl trustScore averageRating')
      .populate('serviceId', 'name duration')
      .sort({ scheduledDate: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(query);

    res.json({
      success: true,
      data: bookings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get booking by ID
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('workerId')
      .populate('serviceId')
      .populate('userId', 'fullName phone email');

    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    // Check access
    const isOwner = booking.userId._id.toString() === req.user._id.toString();
    const isWorker = booking.workerId.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isWorker && !isAdmin) {
      throw new AppError('Access denied', 403);
    }

    res.json({ success: true, booking });
  } catch (error) {
    next(error);
  }
});

// Update booking status
router.put('/:id/status', authenticate, async (req, res, next) => {
  try {
    const { status, cancellationReason } = req.body;
    
    const booking = await Booking.findById(req.params.id)
      .populate('workerId')
      .populate('userId', '_id');

    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    // Check permissions
    const isOwner = booking.userId._id.toString() === req.user._id.toString();
    const isWorker = booking.workerId.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    // Validate status transitions
    const validTransitions = {
      pending: ['confirmed', 'cancelled', 'rejected'],
      confirmed: ['in_progress', 'cancelled'],
      in_progress: ['awaiting_confirmation', 'cancelled'],
      awaiting_confirmation: ['completed', 'cancelled'],
      completed: [],
      cancelled: [],
      rejected: []
    };

    if (!isOwner && !isWorker && !isAdmin) {
      throw new AppError('Access denied', 403);
    }

    if (!validTransitions[booking.status].includes(status)) {
      throw new AppError(`Cannot change status from ${booking.status} to ${status}`, 400);
    }

    // Role-based transition rules for escrow flow
    if (status === 'in_progress' && !isWorker && !isAdmin) {
      throw new AppError('Only worker or admin can start this booking', 403);
    }

    if (status === 'confirmed' && !isWorker && !isAdmin) {
      throw new AppError('Only worker or admin can confirm this booking', 403);
    }

    if (status === 'rejected' && !isWorker && !isAdmin) {
      throw new AppError('Only worker or admin can reject this booking', 403);
    }

    if (status === 'awaiting_confirmation' && !isWorker && !isAdmin) {
      throw new AppError('Only worker or admin can mark job as completed', 403);
    }

    if (status === 'completed' && !isOwner && !isAdmin) {
      throw new AppError('Only customer or admin can confirm completion', 403);
    }

    booking.status = status;

    if (status === 'confirmed') {
      booking.confirmedAt = new Date();
      if (booking.emergency) booking.emergencyStatus = 'assigned';
    } else if (status === 'in_progress') {
      booking.startedAt = new Date();
      if (booking.emergency) booking.emergencyStatus = 'in_progress';
    } else if (status === 'awaiting_confirmation') {
      booking.completedAt = new Date();
      if (booking.emergency) booking.emergencyStatus = 'awaiting_confirmation';
    } else if (status === 'completed') {
      booking.customerConfirmedAt = new Date();
      if (booking.emergency) booking.emergencyStatus = 'completed';
      // Keep completedAt populated even for old bookings where worker skipped awaiting_confirmation.
      if (!booking.completedAt) {
        booking.completedAt = new Date();
      }
      // Update worker stats when customer confirms completion.
      await Worker.findByIdAndUpdate(booking.workerId._id, {
        $inc: { completedBookings: 1, totalBookings: 1 }
      });

      // Auto-release escrow on customer confirmation.
      if (['held', 'paid'].includes(booking.paymentStatus) && !booking.workerPaid) {
        const worker = await Worker.findById(booking.workerId._id);
        if (!worker?.paystackRecipientCode) {
          throw new AppError('Worker payout account is not configured', 400);
        }

        const gross = booking.paymentAmount || booking.price;
        const commissionRate = booking.commissionRate || 0.2;
        const platformFee = Math.round(gross * commissionRate * 100) / 100;
        const workerPayout = Math.round((gross - platformFee) * 100) / 100;
        const payoutReference = generateReference();

        await transferToWorker({
          amount: workerPayout,
          recipient: worker.paystackRecipientCode,
          reference: payoutReference
        });

        booking.platformFee = platformFee;
        booking.workerEarnings = workerPayout;
        booking.workerPayoutAmount = workerPayout;
        booking.workerPayoutReference = payoutReference;
        booking.workerPaid = true;
        booking.workerPaidAt = new Date();
        booking.paymentStatus = 'released';

        await Notification.create({
          userId: worker.userId,
          type: 'payment',
          title: 'Escrow Released',
          message: `₦${workerPayout} has been released to your account`,
          data: { bookingId: booking._id }
        });
      }
    } else if (status === 'cancelled') {
      if (isOwner) booking.cancelledBy = 'user';
      else if (isWorker) booking.cancelledBy = 'worker';
      else booking.cancelledBy = 'admin';
      booking.cancellationReason = cancellationReason;
      if (booking.emergency) booking.emergencyStatus = 'cancelled';
      // Update worker stats
      await Worker.findByIdAndUpdate(booking.workerId._id, {
        $inc: { cancelledBookings: 1, totalBookings: 1 }
      });
    }

    await booking.save();

    // Create notification
    const notifyUserId = isOwner ? booking.workerId.userId._id : booking.userId._id;
    await Notification.create({
      userId: notifyUserId,
      type: 'booking',
      title: 'Booking Status Updated',
      message: `Your booking status has been updated to ${status}`,
      data: { bookingId: booking._id }
    });

    res.json({ success: true, booking });
  } catch (error) {
    next(error);
  }
});

// Update emergency dispatch status (worker/admin)
router.put('/:id/emergency-status', authenticate, async (req, res, next) => {
  try {
    const { emergencyStatus } = req.body;
    const allowed = ['requested', 'assigned', 'en_route', 'arrived', 'in_progress', 'awaiting_confirmation', 'cancelled'];

    if (!allowed.includes(emergencyStatus)) {
      throw new AppError('Invalid emergency status', 400);
    }

    const booking = await Booking.findById(req.params.id)
      .populate('workerId')
      .populate('userId', '_id');

    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    if (!booking.emergency) {
      throw new AppError('This booking is not an emergency booking', 400);
    }

    const isOwner = booking.userId._id.toString() === req.user._id.toString();
    const isWorker = booking.workerId.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    const currentEmergencyStatus = booking.emergencyStatus || (booking.status === 'confirmed' ? 'assigned' : 'requested');
    const validEmergencyTransitions = {
      requested: ['assigned', 'cancelled'],
      assigned: ['en_route', 'cancelled'],
      en_route: ['arrived', 'cancelled'],
      arrived: ['in_progress', 'cancelled'],
      in_progress: ['awaiting_confirmation', 'cancelled'],
      awaiting_confirmation: ['cancelled'],
      cancelled: [],
      completed: []
    };

    if (!validEmergencyTransitions[currentEmergencyStatus]?.includes(emergencyStatus)) {
      throw new AppError(`Cannot change emergency status from ${currentEmergencyStatus} to ${emergencyStatus}`, 400);
    }

    const workerOnlyStatuses = ['assigned', 'en_route', 'arrived', 'in_progress', 'awaiting_confirmation'];
    if (workerOnlyStatuses.includes(emergencyStatus) && !isWorker && !isAdmin) {
      throw new AppError('Only worker or admin can update this emergency stage', 403);
    }

    if (emergencyStatus === 'cancelled' && !isOwner && !isWorker && !isAdmin) {
      throw new AppError('Access denied', 403);
    }

    booking.emergencyStatus = emergencyStatus;

    if (['in_progress', 'awaiting_confirmation', 'completed', 'cancelled'].includes(emergencyStatus)) {
      const statusMap = {
        in_progress: 'in_progress',
        awaiting_confirmation: 'awaiting_confirmation',
        completed: 'completed',
        cancelled: 'cancelled'
      };
      booking.status = statusMap[emergencyStatus];
    }

    if (emergencyStatus === 'in_progress' && !booking.startedAt) {
      booking.startedAt = new Date();
    }

    if (emergencyStatus === 'awaiting_confirmation' && !booking.completedAt) {
      booking.completedAt = new Date();
    }

    await booking.save();
    res.json({ success: true, booking });
  } catch (error) {
    next(error);
  }
});

export default router;
