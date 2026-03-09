import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate, authorize, optionalAuth } from '../middleware/auth.js';
import Worker from '../models/Worker.js';
import User from '../models/User.js';
import Service from '../models/Service.js';
import WorkerService from '../models/WorkerService.js';
import Review from '../models/Review.js';
import Booking from '../models/Booking.js';

const router = express.Router();

// Get all workers (public)
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      category,
      search,
      location,
      minRating,
      verified,
      emergency,
      sortBy = 'trustScore'
    } = req.query;

    const query = { isAvailable: true };

    if (search) {
      const matchedUsers = await User.find({
        fullName: { $regex: search, $options: 'i' }
      }).select('_id');

      const matchedUserIds = matchedUsers.map((user) => user._id);

      query.$or = [
        { userId: { $in: matchedUserIds } },
        { bio: { $regex: search, $options: 'i' } },
        { skills: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    if (location) {
      query.serviceArea = { $in: [new RegExp(location, 'i')] };
    }

    if (minRating) {
      query.averageRating = { $gte: parseFloat(minRating) };
    }

    if (verified === 'true') {
      query.verificationStatus = 'verified';
    }

    if (emergency === 'true') {
      query.emergencyServices = true;
    }

    if (category) {
      const services = await Service.find({
        $or: [{ slug: category }, { categoryId: category }]
      }).select('_id');

      const serviceIds = services.map((service) => service._id);

      if (serviceIds.length > 0) {
        const workerServices = await WorkerService.find({
          serviceId: { $in: serviceIds },
          isActive: true
        }).select('workerId');

        const workerIds = workerServices.map((ws) => ws.workerId);
        query._id = { $in: workerIds };
      } else {
        query._id = { $in: [] };
      }
    }

    const sortOptions = {
      trustScore: { trustScore: -1 },
      rating: { averageRating: -1 },
      experience: { yearsExperience: -1 },
      price: { hourlyRate: 1 },
      newest: { createdAt: -1 }
    };

    const workers = await Worker.find(query)
      .populate('userId', 'fullName email phone profilePhotoUrl')
      .sort(sortOptions[sortBy] || { trustScore: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Worker.countDocuments(query);

    res.json({
      success: true,
      data: workers,
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

// Create worker profile (admin only)
router.post('/', authenticate, authorize('admin'), [
  body('fullName').trim().notEmpty(),
  body('email').isEmail().normalizeEmail(),
  body('phone').trim().notEmpty(),
  body('password').optional().isLength({ min: 6 }),
  body('occupation').optional().trim().isLength({ min: 1, max: 120 }),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      fullName,
      email,
      phone,
      password,
      occupation,
      bio,
      yearsExperience,
      profilePhotoUrl,
      location,
      hourlyRate,
      languages,
      skills,
      emergencyServices,
      isAvailable,
      verificationStatus
    } = req.body;

    const existingUser = await User.findOne({
      $or: [{ email }, { phone }]
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Email or phone already exists' });
    }

    const user = await User.create({
      fullName,
      email,
      phone,
      role: 'worker',
      passwordHash: password || Math.random().toString(36).slice(-10)
    });

    const worker = await Worker.create({
      userId: user._id,
      occupation: occupation ? String(occupation).trim() : '',
      bio: bio || '',
      yearsExperience: Number(yearsExperience || 0),
      profilePhotoUrl: profilePhotoUrl || null,
      serviceArea: location ? [location] : [],
      hourlyRate: hourlyRate ? Number(hourlyRate) : null,
      languages: Array.isArray(languages) ? languages : [],
      skills: Array.isArray(skills) ? skills : [],
      emergencyServices: !!emergencyServices,
      isAvailable: isAvailable !== undefined ? !!isAvailable : true,
      verificationStatus: verificationStatus || 'pending'
    });

    const populatedWorker = await Worker.findById(worker._id)
      .populate('userId', 'fullName email phone profilePhotoUrl');

    res.status(201).json({
      success: true,
      worker: populatedWorker
    });
  } catch (error) {
    next(error);
  }
});

// Get featured workers
router.get('/featured', async (req, res, next) => {
  try {
    const workers = await Worker.find({ isFeatured: true, isAvailable: true })
      .populate('userId', 'fullName profilePhotoUrl')
      .sort({ trustScore: -1 })
      .limit(10);

    res.json({ success: true, data: workers });
  } catch (error) {
    next(error);
  }
});

// Get current authenticated worker profile
router.get('/me', authenticate, async (req, res, next) => {
  try {
    if (req.user.role !== 'worker') {
      return res.status(403).json({ message: 'Worker access required' });
    }

    const worker = await Worker.findOne({ userId: req.user._id })
      .populate('userId', 'fullName email phone profilePhotoUrl createdAt');

    if (!worker) {
      return res.status(404).json({ message: 'Worker profile not found' });
    }

    res.json({ success: true, worker });
  } catch (error) {
    next(error);
  }
});

// Get worker by ID
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const worker = await Worker.findById(req.params.id)
      .populate('userId', 'fullName email phone profilePhotoUrl createdAt');

    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }

    // Get worker services
    const workerServices = await WorkerService.find({ workerId: worker._id })
      .populate('serviceId');

    // Get worker reviews
    const reviews = await Review.find({ workerId: worker._id, isPublic: true })
      .populate('userId', 'fullName profilePhotoUrl')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({ 
      success: true, 
      worker, 
      services: workerServices,
      reviews 
    });
  } catch (error) {
    next(error);
  }
});

// Update worker profile
router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const worker = await Worker.findById(req.params.id);
    
    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }

    // Only the worker themselves or admin can update
    if (worker.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const allowedFields = [
      'occupation', 'bio', 'yearsExperience', 'profilePhotoUrl', 'introVideoUrl',
      'serviceArea', 'availability', 'hourlyRate', 'languages', 'skills',
      'emergencyServices', 'isAvailable'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        worker[field] = req.body[field];
      }
    });

    await worker.save();

    res.json({ success: true, worker });
  } catch (error) {
    next(error);
  }
});

// Delete worker profile (admin only)
router.delete('/:id', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const worker = await Worker.findById(req.params.id);

    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }

    await WorkerService.deleteMany({ workerId: worker._id });
    await Review.deleteMany({ workerId: worker._id });

    const userId = worker.userId;
    await worker.deleteOne();

    if (userId) {
      await User.findByIdAndUpdate(userId, { isActive: false });
    }

    res.json({
      success: true,
      message: 'Worker deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Get worker's bookings (for worker)
router.get('/:id/bookings', authenticate, async (req, res, next) => {
  try {
    const worker = await Worker.findById(req.params.id);
    
    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }

    // Only the worker themselves or admin can view
    if (worker.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { page = 1, limit = 20, status } = req.query;
    const query = { workerId: worker._id };
    if (status) query.status = status;

    const bookings = await Booking.find(query)
      .populate('userId', 'fullName phone profilePhotoUrl')
      .populate('serviceId', 'name')
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

// Add services to worker
router.post('/:id/services', authenticate, async (req, res, next) => {
  try {
    const worker = await Worker.findById(req.params.id);
    
    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }

    if (worker.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { serviceIds, customPrices } = req.body;

    for (const serviceId of serviceIds) {
      await WorkerService.findOneAndUpdate(
        { workerId: worker._id, serviceId },
        { customPrice: customPrices?.[serviceId] || null, isActive: true },
        { upsert: true }
      );
    }

    const workerServices = await WorkerService.find({ workerId: worker._id })
      .populate('serviceId');

    res.json({ success: true, services: workerServices });
  } catch (error) {
    next(error);
  }
});

// Submit verification documents (worker only)
router.post('/:id/verify', authenticate, async (req, res, next) => {
  try {
    const worker = await Worker.findById(req.params.id);
    
    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }

    // Only the worker themselves can submit verification
    if (worker.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { documentType, documentUrl, ninNumber, ninImageUrl } = req.body;

    // Update worker verification status
    worker.verificationStatus = 'pending';
    
    if (documentType) worker.documentType = documentType;
    if (documentUrl) worker.documentUrl = documentUrl;
    if (ninNumber) worker.ninNumber = ninNumber;
    if (ninImageUrl) worker.ninImageUrl = ninImageUrl;

    await worker.save();

    res.json({ 
      success: true, 
      message: 'Verification documents submitted successfully',
      worker 
    });
  } catch (error) {
    next(error);
  }
});

// Update availability (worker only)
router.put('/:id/availability', authenticate, async (req, res, next) => {
  try {
    const worker = await Worker.findById(req.params.id);
    
    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }

    // Only the worker themselves can update availability
    if (worker.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { isAvailable, availability } = req.body;

    if (typeof isAvailable === 'boolean') {
      worker.isAvailable = isAvailable;
    }
    
    if (availability) {
      worker.availability = availability;
    }

    await worker.save();

    res.json({ success: true, worker });
  } catch (error) {
    next(error);
  }
});

export default router;
