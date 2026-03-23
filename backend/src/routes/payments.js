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
    if (['paid', 'held', 'released'].includes(booking.paymentStatus)) {
      throw new AppError('Booking is already funded', 400);
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

    const authorizationUrl =
      response?.data?.authorization_url
      || response?.data?.authorizationUrl
      || response?.authorization_url
      || response?.authorizationUrl;

    if (!authorizationUrl) {
      throw new AppError('Payment provider did not return an authorization URL', 502);
    }
    
    res.json({
      success: true,
      authorizationUrl,
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
        
        if (booking && !['paid', 'held', 'released'].includes(booking.paymentStatus)) {
          booking.paymentStatus = 'held';
          booking.paymentAmount = amount / 100; // Convert from kobo
          booking.paidAt = new Date();
          booking.escrowHeldAt = new Date();
          await booking.save();
          
          // Notify user
          await Notification.create({
            userId: metadata.userId,
            type: 'payment',
            title: 'Payment Successful',
            message: `Your payment of ₦${booking.paymentAmount} is now held in escrow`,
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
        booking.paymentStatus = 'released';
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
      verified: response.data.status === 'success',
      escrowHeld: ['held', 'paid'].includes(booking.paymentStatus),
      released: booking.paymentStatus === 'released'
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

// Release escrow to worker after customer confirmation
router.post(['/release-escrow', '/pay-worker'], authenticate, async (req, res, next) => {
  try {
    const { bookingId } = req.body;
    
    const booking = await Booking.findById(bookingId)
      .populate('workerId');
    
    if (!booking) {
      throw new AppError('Booking not found', 404);
    }
    
    const isCustomer = booking.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isCustomer && !isAdmin) {
      throw new AppError('Only customer or admin can release escrow', 403);
    }
    
    // Verify booking lifecycle conditions
    if (booking.status !== 'completed') {
      throw new AppError('Customer confirmation is required before release', 400);
    }
    
    if (!booking.customerConfirmedAt) {
      throw new AppError('Customer has not confirmed completion yet', 400);
    }

    if (!['held', 'paid'].includes(booking.paymentStatus)) {
      throw new AppError('Payment is not currently held in escrow', 400);
    }
    
    if (booking.workerPaid) {
      throw new AppError('Worker already paid for this booking', 400);
    }
    
    const worker = booking.workerId;
    
    if (!worker.paystackRecipientCode) {
      throw new AppError('Worker has not added bank details', 400);
    }
    
    // Calculate worker payout using booking commission settings.
    const gross = booking.paymentAmount || booking.price;
    const commissionRate = booking.commissionRate || 0.2;
    const platformFee = Math.round(gross * commissionRate * 100) / 100;
    const workerPayout = Math.round((gross - platformFee) * 100) / 100;
    
    const reference = generateReference();
    
    const response = await transferToWorker({
      amount: workerPayout,
      recipient: worker.paystackRecipientCode,
      reference
    });
    
    booking.workerPayoutReference = reference;
    booking.platformFee = platformFee;
    booking.workerPayoutAmount = workerPayout;
    booking.workerEarnings = workerPayout;
    booking.paymentStatus = 'released';
    booking.workerPaid = true;
    booking.workerPaidAt = new Date();
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
      message: 'Escrow released successfully',
      transferReference: reference,
      amount: workerPayout,
      commission: platformFee
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
      paymentStatus: { $in: ['paid', 'held', 'released'] }
    })
    .populate('serviceId', 'name')
    .populate('workerId', 'profilePhotoUrl')
    .sort({ paidAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));
    
    const total = await Booking.countDocuments({ 
      userId: req.user._id,
      paymentStatus: { $in: ['paid', 'held', 'released'] }
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
