import express from 'express';
import { authenticate } from '../middleware/auth.js';
import Message from '../models/Message.js';
import User from '../models/User.js';
import Worker from '../models/Worker.js';
import { AppError } from '../middleware/errorHandler.js';

const router = express.Router();

// Generate unique room ID for two users
const generateRoomId = (userId1, userId2) => {
  const sorted = [userId1.toString(), userId2.toString()].sort();
  return `chat_${sorted[0]}_${sorted[1]}`;
};

// Get or create chat room with a user/worker
router.post('/room', authenticate, async (req, res, next) => {
  try {
    const { participantId } = req.body;
    
    if (!participantId) {
      throw new AppError('Participant ID is required', 400);
    }

    const roomId = generateRoomId(req.user._id, participantId);

    // Get participant info
    let participant;
    const worker = await Worker.findOne({ userId: participantId });
    
    if (worker) {
      participant = {
        _id: worker.userId,
        fullName: worker.bio?.slice(0, 30) || 'Worker',
        profilePhotoUrl: worker.profilePhotoUrl,
        isWorker: true
      };
    } else {
      participant = await User.findById(participantId).select('fullName email profilePhotoUrl');
    }

    res.json({
      success: true,
      roomId,
      participant
    });
  } catch (error) {
    next(error);
  }
});

// Get messages for a room
router.get('/messages/:roomId', authenticate, async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const messages = await Message.find({ roomId })
      .populate('senderId', 'fullName profilePhotoUrl')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // Mark messages as read
    await Message.updateMany(
      { roomId, receiverId: req.user._id, read: false },
      { read: true, readAt: new Date() }
    );

    const total = await Message.countDocuments({ roomId });

    res.json({
      success: true,
      data: messages.reverse(),
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

// Get all conversations
router.get('/conversations', authenticate, async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Get unique conversations
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ senderId: userId }, { receiverId: userId }]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: '$roomId',
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$receiverId', userId] }, { $eq: ['$read', false] }] },
                1,
                0
              ]
            }
          }
        }
      },
      { $sort: { 'lastMessage.createdAt': -1 } }
    ]);

    // Populate participant info
    const enrichedConversations = await Promise.all(
      conversations.map(async (conv) => {
        const otherUserId = conv.lastMessage.senderId.toString() === userId.toString()
          ? conv.lastMessage.receiverId
          : conv.lastMessage.senderId;

        const worker = await Worker.findOne({ userId: otherUserId });
        
        let participant;
        if (worker) {
          participant = {
            _id: worker.userId,
            fullName: worker.bio?.slice(0, 30) || 'Worker',
            profilePhotoUrl: worker.profilePhotoUrl,
            isWorker: true
          };
        } else {
          const user = await User.findById(otherUserId).select('fullName profilePhotoUrl');
          participant = user;
        }

        return {
          roomId: conv._id,
          lastMessage: {
            content: conv.lastMessage.content,
            type: conv.lastMessage.type,
            createdAt: conv.lastMessage.createdAt,
            senderId: conv.lastMessage.senderId
          },
          unreadCount: conv.unreadCount,
          participant
        };
      })
    );

    res.json({
      success: true,
      data: enrichedConversations
    });
  } catch (error) {
    next(error);
  }
});

// Send a message (REST fallback - prefer Socket.io)
router.post('/message', authenticate, async (req, res, next) => {
  try {
    const { receiverId, content, type = 'text', bookingId } = req.body;

    if (!receiverId || !content) {
      throw new AppError('Receiver ID and content are required', 400);
    }

    const roomId = generateRoomId(req.user._id, receiverId);

    const message = await Message.create({
      senderId: req.user._id,
      receiverId,
      content,
      type,
      roomId,
      bookingId: bookingId || null
    });

    const populatedMessage = await Message.findById(message._id)
      .populate('senderId', 'fullName profilePhotoUrl');

    res.status(201).json({
      success: true,
      message: populatedMessage,
      roomId
    });
  } catch (error) {
    next(error);
  }
});

// Mark messages as read
router.put('/read/:roomId', authenticate, async (req, res, next) => {
  try {
    const { roomId } = req.params;

    await Message.updateMany(
      { roomId, receiverId: req.user._id, read: false },
      { read: true, readAt: new Date() }
    );

    res.json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    next(error);
  }
});

// Delete a message
router.delete('/message/:messageId', authenticate, async (req, res, next) => {
  try {
    const message = await Message.findById(req.params.messageId);

    if (!message) {
      throw new AppError('Message not found', 404);
    }

    // Only sender can delete
    if (message.senderId.toString() !== req.user._id.toString()) {
      throw new AppError('Access denied', 403);
    }

    await message.deleteOne();

    res.json({
      success: true,
      message: 'Message deleted'
    });
  } catch (error) {
    next(error);
  }
});

export default router;

