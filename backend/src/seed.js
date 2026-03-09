import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from './models/Category.js';
import Service from './models/Service.js';

dotenv.config();

const categories = [
  {
    name: 'House Helps',
    slug: 'house-helps',
    description: 'Professional house help services including cleaning, cooking, and childcare',
    icon: 'home',
    displayOrder: 1
  },
  {
    name: 'Other Helps',
    slug: 'other-helps',
    description: 'Other professional services including plumbing, electrical, and more',
    icon: 'wrench',
    displayOrder: 2
  }
];

const services = [
  // House Helps services
  {
    categorySlug: 'house-helps',
    name: 'Full-Time Maid',
    slug: 'full-time-maid',
    description: 'Full-time domestic helper for daily household tasks',
    basePrice: 50000,
    duration: 480,
    displayOrder: 1
  },
  {
    categorySlug: 'house-helps',
    name: 'Part-Time Maid',
    slug: 'part-time-maid',
    description: 'Part-time domestic helper for specific hours',
    basePrice: 25000,
    duration: 240,
    displayOrder: 2
  },
  {
    categorySlug: 'house-helps',
    name: 'Deep Cleaning',
    slug: 'deep-cleaning',
    description: 'Thorough cleaning of entire house',
    basePrice: 15000,
    duration: 180,
    displayOrder: 3
  },
  {
    categorySlug: 'house-helps',
    name: 'Cook',
    slug: 'cook',
    description: 'Professional cooking services',
    basePrice: 35000,
    duration: 360,
    displayOrder: 4
  },
  {
    categorySlug: 'house-helps',
    name: 'Childcare',
    slug: 'childcare',
    description: 'Professional childcare and babysitting',
    basePrice: 40000,
    duration: 480,
    displayOrder: 5
  },
  {
    categorySlug: 'house-helps',
    name: 'Elderly Care',
    slug: 'elderly-care',
    description: 'Care for elderly family members',
    basePrice: 45000,
    duration: 480,
    displayOrder: 6
  },
  // Other Helps services
  {
    categorySlug: 'other-helps',
    name: 'Plumber',
    slug: 'plumber',
    description: 'Plumbing repair and installation services',
    basePrice: 5000,
    duration: 60,
    displayOrder: 1
  },
  {
    categorySlug: 'other-helps',
    name: 'Electrician',
    slug: 'electrician',
    description: 'Electrical repair and installation services',
    basePrice: 5000,
    duration: 60,
    displayOrder: 2
  },
  {
    categorySlug: 'other-helps',
    name: 'Locksmith',
    slug: 'locksmith',
    description: 'Lock repair and replacement services',
    basePrice: 3000,
    duration: 30,
    displayOrder: 3
  },
  {
    categorySlug: 'other-helps',
    name: 'AC Repair',
    slug: 'ac-repair',
    description: 'Air conditioning repair and maintenance',
    basePrice: 8000,
    duration: 90,
    displayOrder: 4
  },
  {
    categorySlug: 'other-helps',
    name: 'Gardener',
    slug: 'gardener',
    description: 'Garden maintenance and landscaping',
    basePrice: 5000,
    duration: 120,
    displayOrder: 5
  },
  {
    categorySlug: 'other-helps',
    name: 'Driver',
    slug: 'driver',
    description: 'Professional driving services',
    basePrice: 15000,
    duration: 240,
    displayOrder: 6
  }
];

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/athand';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Category.deleteMany({});
    await Service.deleteMany({});
    console.log('Cleared existing data');

    // Create categories
    const createdCategories = await Category.insertMany(categories);
    console.log(`Created ${createdCategories.length} categories`);

    // Create services
    const categoryMap = {};
    createdCategories.forEach(cat => {
      categoryMap[cat.slug] = cat._id;
    });

    const servicesToInsert = services.map(s => ({
      ...s,
      categoryId: categoryMap[s.categorySlug]
    }));

    await Service.insertMany(servicesToInsert);
    console.log(`Created ${services.length} services`);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
