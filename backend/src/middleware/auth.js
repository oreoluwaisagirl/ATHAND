import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'oreoluwaisagirl@gmail.com').toLowerCase();

const hasAdminAccess = (user) => {
  if (!user) return false;
  if (user.role === 'admin') return true;
  return typeof user.email === 'string' && user.email.toLowerCase() === ADMIN_EMAIL;
};

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select('-passwordHash');
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is deactivated' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    next(error);
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const isAllowed =
      roles.includes(req.user.role) ||
      (roles.includes('admin') && hasAdminAccess(req.user));

    if (!isAllowed) {
      return res.status(403).json({ message: 'Access denied' });
    }

    next();
  };
};

export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-passwordHash');
    
    if (user && user.isActive) {
      req.user = user;
    }
    
    next();
  } catch {
    next();
  }
};
