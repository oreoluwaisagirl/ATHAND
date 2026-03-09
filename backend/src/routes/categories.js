import express from 'express';
import { optionalAuth } from '../middleware/auth.js';
import Category from '../models/Category.js';
import Service from '../models/Service.js';

const router = express.Router();

// Get all categories
router.get('/', async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort({ displayOrder: 1, name: 1 });

    const categoriesWithServices = await Promise.all(
      categories.map(async (category) => {
        const services = await Service.find({ 
          categoryId: category._id, 
          isActive: true 
        }).sort({ displayOrder: 1 });
        
        return {
          ...category.toObject(),
          services
        };
      })
    );

    res.json({ success: true, data: categoriesWithServices });
  } catch (error) {
    next(error);
  }
});

// Get category by slug
router.get('/slug/:slug', async (req, res, next) => {
  try {
    const category = await Category.findOne({ 
      slug: req.params.slug, 
      isActive: true 
    });
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const services = await Service.find({ 
      categoryId: category._id, 
      isActive: true 
    }).sort({ displayOrder: 1 });

    res.json({ success: true, category, services });
  } catch (error) {
    next(error);
  }
});

// Get category by ID
router.get('/:id', async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const services = await Service.find({ 
      categoryId: category._id, 
      isActive: true 
    }).sort({ displayOrder: 1 });

    res.json({ success: true, category, services });
  } catch (error) {
    next(error);
  }
});

export default router;
