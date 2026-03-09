import express from 'express';
import Service from '../models/Service.js';
import WorkerService from '../models/WorkerService.js';
import Worker from '../models/Worker.js';

const router = express.Router();

// Get all services
router.get('/', async (req, res, next) => {
  try {
    const { categoryId, search, page = 1, limit = 50 } = req.query;
    
    const query = { isActive: true };
    if (categoryId) query.categoryId = categoryId;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const services = await Service.find(query)
      .populate('categoryId', 'name slug')
      .sort({ displayOrder: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Service.countDocuments(query);

    res.json({
      success: true,
      data: services,
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

// Get service by ID
router.get('/:id', async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('categoryId', 'name slug');

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    res.json({ success: true, service });
  } catch (error) {
    next(error);
  }
});

// Get workers offering a specific service
router.get('/:id/workers', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, location, minRating, available } = req.query;

    // First find worker services for this service
    const workerServices = await WorkerService.find({ 
      serviceId: req.params.id,
      isActive: true
    }).populate('workerId');

    let workerIds = workerServices.map(ws => ws.workerId._id);

    // Build worker query
    const workerQuery = { 
      _id: { $in: workerIds },
      isAvailable: true 
    };

    if (location) {
      workerQuery.serviceArea = { $regex: location, $options: 'i' };
    }

    if (minRating) {
      workerQuery.averageRating = { $gte: parseFloat(minRating) };
    }

    if (available === 'true') {
      workerQuery.isAvailable = true;
    }

    const workers = await Worker.find(workerQuery)
      .populate('userId', 'fullName profilePhotoUrl')
      .sort({ trustScore: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Worker.countDocuments(workerQuery);

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

export default router;
