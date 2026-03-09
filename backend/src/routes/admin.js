import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import User from '../models/User.js';
import Worker from '../models/Worker.js';
import Booking from '../models/Booking.js';
import Category from '../models/Category.js';
import Service from '../models/Service.js';
import VerificationDocument from '../models/VerificationDocument.js';
import WorkerService from '../models/WorkerService.js';
import Message from '../models/Message.js';

const router = express.Router();

// All routes require admin authentication
router.use(authenticate);
router.use(authorize('admin'));

// Dashboard stats
router.get('/stats', async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalWorkers,
      totalBookings,
      pendingVerifications,
      completedBookings,
      cancelledBookings
    ] = await Promise.all([
      User.countDocuments(),
      Worker.countDocuments(),
      Booking.countDocuments(),
      Worker.countDocuments({ verificationStatus: 'pending' }),
      Booking.countDocuments({ status: 'completed' }),
      Booking.countDocuments({ status: 'cancelled' })
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalWorkers,
        totalBookings,
        pendingVerifications,
        completedBookings,
        cancelledBookings,
        completionRate: totalBookings > 0 
          ? Math.round((completedBookings / totalBookings) * 100) 
          : 0
      }
    });
  } catch (error) {
    next(error);
  }
});

// Manage workers - verification
router.get('/workers/pending-verification', async (req, res, next) => {
  try {
    const workers = await Worker.find({ verificationStatus: 'pending' })
      .populate('userId', 'fullName email phone createdAt')
      .sort({ createdAt: 1 });

    res.json({ success: true, data: workers });
  } catch (error) {
    next(error);
  }
});

router.put('/workers/:id/verify', async (req, res, next) => {
  try {
    const { status, badges } = req.body;
    
    const worker = await Worker.findById(req.params.id);
    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }

    worker.verificationStatus = status;
    
    if (status === 'verified') {
      worker.badges = badges || ['NIN Verified'];
      worker.faceMatchVerified = true;
      worker.backgroundCheckPassed = true;
    }

    await worker.save();

    res.json({ success: true, worker });
  } catch (error) {
    next(error);
  }
});

// Manage categories
router.post('/categories', async (req, res, next) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json({ success: true, category });
  } catch (error) {
    next(error);
  }
});

router.put('/categories/:id', async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json({ success: true, category });
  } catch (error) {
    next(error);
  }
});

router.delete('/categories/:id', async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Also delete related services
    await Service.deleteMany({ categoryId: req.params.id });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// Manage services
router.post('/services', async (req, res, next) => {
  try {
    const service = await Service.create(req.body);
    res.status(201).json({ success: true, service });
  } catch (error) {
    next(error);
  }
});

router.put('/services/:id', async (req, res, next) => {
  try {
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    res.json({ success: true, service });
  } catch (error) {
    next(error);
  }
});

// Manage bookings
router.get('/bookings', async (req, res, next) => {
  try {
    const { page = 1, limit = 50, status, dateFrom, dateTo } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    const bookings = await Booking.find(query)
      .populate('userId', 'fullName email phone')
      .populate('workerId')
      .populate('serviceId', 'name')
      .sort({ createdAt: -1 })
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

// Admin chat monitoring: all conversations (worker <-> user)
router.get('/chats/conversations', async (req, res, next) => {
  try {
    const { limit = 100 } = req.query;

    const conversations = await Message.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$roomId',
          lastMessage: { $first: '$$ROOT' },
          messageCount: { $sum: 1 },
          startedAt: { $last: '$createdAt' },
        }
      },
      { $sort: { 'lastMessage.createdAt': -1 } },
      { $limit: parseInt(limit, 10) || 100 },
    ]);

    const participantIds = new Set();
    conversations.forEach((conversation) => {
      if (conversation.lastMessage?.senderId) {
        participantIds.add(String(conversation.lastMessage.senderId));
      }
      if (conversation.lastMessage?.receiverId) {
        participantIds.add(String(conversation.lastMessage.receiverId));
      }
    });

    const users = await User.find({ _id: { $in: Array.from(participantIds) } })
      .select('_id fullName email phone profilePhotoUrl role')
      .lean();
    const workers = await Worker.find({ userId: { $in: Array.from(participantIds) } })
      .select('_id userId verificationStatus profilePhotoUrl')
      .lean();

    const usersById = new Map(users.map((user) => [String(user._id), user]));
    const workersByUserId = new Map(workers.map((worker) => [String(worker.userId), worker]));

    const data = conversations.map((conversation) => {
      const senderId = String(conversation.lastMessage.senderId);
      const receiverId = String(conversation.lastMessage.receiverId);
      const uniqueParticipantIds = Array.from(new Set([senderId, receiverId]));

      const participants = uniqueParticipantIds.map((participantId) => {
        const user = usersById.get(participantId);
        const worker = workersByUserId.get(participantId);
        return {
          _id: participantId,
          fullName: user?.fullName || 'Unknown User',
          email: user?.email || '',
          phone: user?.phone || '',
          profilePhotoUrl: worker?.profilePhotoUrl || user?.profilePhotoUrl || null,
          role: user?.role || 'user',
          isWorker: !!worker,
          workerId: worker?._id || null,
          verificationStatus: worker?.verificationStatus || null,
        };
      });

      return {
        roomId: conversation._id,
        participants,
        messageCount: conversation.messageCount,
        startedAt: conversation.startedAt,
        lastMessage: {
          _id: conversation.lastMessage._id,
          senderId: conversation.lastMessage.senderId,
          receiverId: conversation.lastMessage.receiverId,
          content: conversation.lastMessage.content,
          type: conversation.lastMessage.type,
          read: conversation.lastMessage.read,
          createdAt: conversation.lastMessage.createdAt,
        }
      };
    });

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

router.get('/chats/messages/:roomId', async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const { page = 1, limit = 200 } = req.query;

    const messages = await Message.find({ roomId })
      .populate('senderId', 'fullName email phone profilePhotoUrl role')
      .populate('receiverId', 'fullName email phone profilePhotoUrl role')
      .sort({ createdAt: -1 })
      .skip((parseInt(page, 10) - 1) * (parseInt(limit, 10) || 200))
      .limit(parseInt(limit, 10) || 200)
      .lean();

    const total = await Message.countDocuments({ roomId });

    res.json({
      success: true,
      data: messages.reverse(),
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10) || 200,
        total,
        pages: Math.ceil(total / (parseInt(limit, 10) || 200)),
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
