import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import Review from '../models/Review.js';
import Booking from '../models/Booking.js';
import Worker from '../models/Worker.js';
import Notification from '../models/Notification.js';
import { AppError } from '../middleware/errorHandler.js';

const router = express.Router();

// Create review
router.post('/', authenticate, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { bookingId, rating, comment } = req.body;

    // Verify booking exists and is completed
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      throw new AppError('Booking not found', 404);
    }
    if (booking.status !== 'completed') {
      throw new AppError('Can only review completed bookings', 400);
    }
    if (booking.userId.toString() !== req.user._id.toString()) {
      throw new AppError('Only the customer can leave a review', 403);
    }

    // Check if review already exists
    const existingReview = await Review.findOne({ bookingId });
    if (existingReview) {
      throw new AppError('Review already exists for this booking', 400);
    }

    const review = await Review.create({
      bookingId,
      userId: req.user._id,
      workerId: booking.workerId,
      rating,
      comment
    });

    // Update worker rating
    const workerReviews = await Review.find({ workerId: booking.workerId });
    const totalRating = workerReviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalRating / workerReviews.length;

    await Worker.findByIdAndUpdate(booking.workerId, {
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: workerReviews.length
    });

    // Create notification for worker
    await Notification.create({
      userId: (await Worker.findById(booking.workerId)).userId,
      type: 'review',
      title: 'New Review',
      message: `You received a ${rating}-star review`,
      data: { reviewId: review._id }
    });

    const populatedReview = await Review.findById(review._id)
      .populate('userId', 'fullName profilePhotoUrl');

    res.status(201).json({ success: true, review: populatedReview });
  } catch (error) {
    next(error);
  }
});

// Get reviews for a worker
router.get('/worker/:workerId', async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const reviews = await Review.find({ 
      workerId: req.params.workerId,
      isPublic: true 
    })
      .populate('userId', 'fullName profilePhotoUrl')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Review.countDocuments({ 
      workerId: req.params.workerId,
      isPublic: true 
    });

    res.json({
      success: true,
      data: reviews,
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

// Get user's reviews
router.get('/my-reviews', authenticate, async (req, res, next) => {
  try {
    const reviews = await Review.find({ userId: req.user._id })
      .populate('workerId')
      .populate({
        path: 'bookingId',
        populate: { path: 'serviceId', select: 'name' }
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, data: reviews });
  } catch (error) {
    next(error);
  }
});

export default router;
