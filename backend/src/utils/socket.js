import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const initializeSocket = (server) => {
  const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  const localOriginPattern = /^https?:\/\/(?:localhost|127\.0\.0\.1|0\.0\.0\.0|(?:\d{1,3}\.){3}\d{1,3})(?::\d+)?$/;

  const io = new Server(server, {
    cors: {
      origin(origin, callback) {
        if (
          !origin
          || allowedOrigins.includes(origin)
          || (process.env.NODE_ENV !== 'production' && localOriginPattern.test(origin))
        ) {
          callback(null, true);
          return;
        }

        callback(new Error(`Socket CORS blocked for origin: ${origin}`));
      },
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('_id fullName email role');
      
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  });

  // Connection handling
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.fullName}`);

    // Join user's personal room
    socket.join(`user_${socket.user._id}`);

    // Join chat rooms
    socket.on('join_room', (roomId) => {
      socket.join(roomId);
      console.log(`User ${socket.user.fullName} joined room: ${roomId}`);
    });

    socket.on('leave_room', (roomId) => {
      socket.leave(roomId);
    });

    // Send message
    socket.on('send_message', async (data) => {
      const { roomId, receiverId, content, bookingId, type = 'text' } = data;
      
      // Emit to room
      io.to(roomId).emit('new_message', {
        senderId: socket.user._id,
        senderName: socket.user.fullName,
        content,
        type,
        bookingId,
        timestamp: new Date()
      });

      // Also emit to receiver's personal room for notifications
      if (receiverId) {
        io.to(`user_${receiverId}`).emit('message_notification', {
          senderId: socket.user._id,
          senderName: socket.user.fullName,
          content,
          roomId,
          timestamp: new Date()
        });
      }
    });

    // Typing indicator
    socket.on('typing', (data) => {
      socket.to(data.roomId).emit('user_typing', {
        userId: socket.user._id,
        userName: socket.user.fullName
      });
    });

    socket.on('stop_typing', (data) => {
      socket.to(data.roomId).emit('user_stop_typing', {
        userId: socket.user._id
      });
    });

    // Read receipts
    socket.on('mark_read', (data) => {
      socket.to(data.roomId).emit('message_read', {
        readerId: socket.user._id,
        messageId: data.messageId
      });
    });

    // Online status
    socket.on('go_online', () => {
      socket.broadcast.emit('user_online', { userId: socket.user._id });
    });

    socket.on('go_offline', () => {
      socket.broadcast.emit('user_offline', { userId: socket.user._id });
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.fullName}`);
      socket.broadcast.emit('user_offline', { userId: socket.user._id });
    });
  });

  return io;
};

// Helper to emit events from controllers
export const emitToUser = (io, userId, event, data) => {
  io.to(`user_${userId}`).emit(event, data);
};

export const emitToRoom = (io, roomId, event, data) => {
  io.to(roomId).emit(event, data);
};
