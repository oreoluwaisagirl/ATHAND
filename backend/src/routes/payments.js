import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { authenticate } from '../middleware/auth.js';
import Booking from '../models/Booking.js';
import Worker from '../models/Worker.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { initializePayment, verifyPayment, createTransferRecipient, transferToWorker } from '../utils/paystack.js';
import { AppError } from '../middleware/errorHandler.js';

const router = express.Router();

// Generate unique reference
const generateReference = () => `ATH_${Date.now()}_${uuidv4().slice(0, 8)}`;

// Initialize payment for booking
router.post('/initialize', authenticate, async (req, res, next) => {
  try {
    const { bookingId } = req.body;
    
    const booking = await Booking.findById(bookingId)
      .populate('workerId')
      .populate('serviceId');
    
    if (!booking) {
      throw new AppError('Booking not found', 404);
    }
    
    // Verify ownership
    if (booking.userId.toString() !== req.user._id.toString()) {
      throw new AppError('Access denied', 403);
    }
    
    // Check if already paid
    if (booking.paymentStatus === 'paid') {
      throw new AppError('Booking is already paid', 400);
    }
    
    const user = await User.findById(req.user._id);
    
    const reference = generateReference();
    
    const response = await initializePayment({
      email: user.email,
      amount: booking.price,
      reference,
      callbackUrl: `${process.env.FRONTEND_URL}/payment-callback?reference=${reference}`,
      metadata: {
        bookingId: booking._id.toString(),
        userId: req.user._id.toString(),
        type: 'booking_payment'
      }
    });
    
    // Save payment reference to booking
    booking.paymentReference = reference;
    await booking.save();
    
    res.json({
      success: true,
      authorizationUrl: response.data.authorization_url,
      reference
    });
  } catch (error) {
    next(error);
  }
});

// Paystack webhook handler (must use raw body for signature verification compatibility)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res, next) => {
  try {
    const event = Buffer.isBuffer(req.body)
      ? JSON.parse(req.body.toString('utf8'))
      : req.body;
    
    // Handle payment success
    if (event.event === 'charge.success') {
      const { reference, metadata, amount, status } = event.data;
      
      if (metadata?.type === 'booking_payment') {
        const booking = await Booking.findById(metadata.bookingId);
        
        if (booking && booking.paymentStatus !== 'paid') {
          booking.paymentStatus = 'paid';
          booking.paymentAmount = amount / 100; // Convert from kobo
          booking.paidAt = new Date();
          await booking.save();
          
          // Notify user
          await Notification.create({
            userId: metadata.userId,
            type: 'payment',
            title: 'Payment Successful',
            message: `Your payment of ₦${booking.paymentAmount} has been confirmed`,
            data: { bookingId: booking._id }
          });
        }
      }
    }
    
    // Handle transfer success
    if (event.event === 'transfer.success') {
      const { reference, amount, recipient } = event.data;
      
      // Update booking with transfer info
      const booking = await Booking.findOne({ workerPayoutReference: reference });
      if (booking) {
        booking.workerPaid = true;
        booking.workerPaidAt = new Date();
        await booking.save();
      }
    }
    
    res.json({ received: true });
  } catch (error) {
    next(error);
  }
});

// Verify payment status
router.get('/verify/:reference', authenticate, async (req, res, next) => {
  try {
    const { reference } = req.params;
    
    const booking = await Booking.findOne({ paymentReference: reference });
    
    if (!booking) {
      throw new AppError('Booking not found', 404);
    }
    
    if (booking.userId.toString() !== req.user._id.toString()) {
      throw new AppError('Access denied', 403);
    }
    
    const response = await verifyPayment(reference);
    
    res.json({
      success: true,
      paymentStatus: booking.paymentStatus,
      verified: response.data.status === 'success'
    });
  } catch (error) {
    next(error);
  }
});

// Add bank details for worker payouts
router.post('/worker/bank-details', authenticate, async (req, res, next) => {
  try {
    const { accountNumber, bankCode, accountName } = req.body;
    
    const worker = await Worker.findOne({ userId: req.user._id });
    
    if (!worker) {
      throw new AppError('Worker profile not found', 404);
    }
    
    // Create Paystack recipient
    const response = await createTransferRecipient({
      name: accountName,
      accountNumber,
      bankCode
    });
    
    // Save to worker
    worker.bankAccount = accountNumber;
    worker.bankCode = bankCode;
    worker.bankAccountName = accountName;
    worker.paystackRecipientCode = response.data.recipient_code;
    await worker.save();
    
    res.json({
      success: true,
      message: 'Bank details saved successfully',
      recipientCode: response.data.recipient_code
    });
  } catch (error) {
    next(error);
  }
});

// Pay worker after service completion
router.post('/pay-worker', authenticate, async (req, res, next) => {
  try {
    const { bookingId } = req.body;
    
    const booking = await Booking.findById(bookingId)
      .populate('workerId');
    
    if (!booking) {
      throw new AppError('Booking not found', 404);
    }
    
    // Only admin can initiate worker payment
    if (req.user.role !== 'admin') {
      throw new AppError('Access denied', 403);
    }
    
    // Verify booking is completed and paid
    if (booking.status !== 'completed') {
      throw new AppError('Booking must be completed first', 400);
    }
    
    if (booking.paymentStatus !== 'paid') {
      throw new AppError('Booking must be paid first', 400);
    }
    
    if (booking.workerPaid) {
      throw new AppError('Worker already paid for this booking', 400);
    }
    
    const worker = booking.workerId;
    
    if (!worker.paystackRecipientCode) {
      throw new AppError('Worker has not added bank details', 400);
    }
    
    // Calculate worker payout (after platform fee)
    const platformFee = booking.price * 0.15; // 15% platform fee
    const workerPayout = booking.price - platformFee;
    
    const reference = generateReference();
    
    const response = await transferToWorker({
      amount: workerPayout,
      recipient: worker.paystackRecipientCode,
      reference
    });
    
    booking.workerPayoutReference = reference;
    booking.platformFee = platformFee;
    booking.workerPayoutAmount = workerPayout;
    await booking.save();
    
    // Notify worker
    await Notification.create({
      userId: worker.userId,
      type: 'payment',
      title: 'Payment Initiated',
      message: `Your payment of ₦${workerPayout} has been initiated`,
      data: { bookingId: booking._id }
    });
    
    res.json({
      success: true,
      message: 'Payment initiated successfully',
      transferReference: reference,
      amount: workerPayout
    });
  } catch (error) {
    next(error);
  }
});

// Get payment history for user
router.get('/history', authenticate, async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const bookings = await Booking.find({ 
      userId: req.user._id,
      paymentStatus: 'paid'
    })
    .populate('serviceId', 'name')
    .populate('workerId', 'profilePhotoUrl')
    .sort({ paidAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));
    
    const total = await Booking.countDocuments({ 
      userId: req.user._id,
      paymentStatus: 'paid'
    });
    
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

export default router;
