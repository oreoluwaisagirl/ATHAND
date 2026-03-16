import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from './models/Category.js';
import Service from './models/Service.js';
import User from './models/User.js';
import Worker from './models/Worker.js';
import WorkerService from './models/WorkerService.js';

dotenv.config();

const categories = [
  {
    name: 'House Helps',
    slug: 'house-helps',
    description: 'Professional house help services including cleaning, cooking, childcare, and domestic support.',
    icon: 'home',
    displayOrder: 1,
  },
  {
    name: 'Other Helps',
    slug: 'other-helps',
    description: 'Technical and mobile services including electrical, mechanical, gardening, and moving support.',
    icon: 'wrench',
    displayOrder: 2,
  },
];

const services = [
  { categorySlug: 'house-helps', name: 'Full-Time Maid', slug: 'full-time-maid', description: 'Full-time domestic helper for daily household tasks.', basePrice: 50000, duration: 480, displayOrder: 1 },
  { categorySlug: 'house-helps', name: 'Part-Time Maid', slug: 'part-time-maid', description: 'Part-time domestic helper for scheduled household support.', basePrice: 25000, duration: 240, displayOrder: 2 },
  { categorySlug: 'house-helps', name: 'Deep Cleaning', slug: 'deep-cleaning', description: 'Thorough home cleaning with room-by-room attention.', basePrice: 15000, duration: 180, displayOrder: 3 },
  { categorySlug: 'house-helps', name: 'Cook', slug: 'cook', description: 'Professional cooking services for daily meals and events.', basePrice: 35000, duration: 360, displayOrder: 4 },
  { categorySlug: 'house-helps', name: 'Childcare', slug: 'childcare', description: 'Professional childcare and babysitting support.', basePrice: 40000, duration: 480, displayOrder: 5 },
  { categorySlug: 'house-helps', name: 'Driver', slug: 'driver', description: 'Reliable personal and family driving services.', basePrice: 30000, duration: 360, displayOrder: 6 },
  { categorySlug: 'other-helps', name: 'Cleaner', slug: 'cleaner', description: 'Fast residential and office cleaning support.', basePrice: 5000, duration: 120, displayOrder: 1 },
  { categorySlug: 'other-helps', name: 'Plumber', slug: 'plumber', description: 'Plumbing repair and installation services.', basePrice: 5000, duration: 60, displayOrder: 2 },
  { categorySlug: 'other-helps', name: 'Electrician', slug: 'electrician', description: 'Electrical repair and installation services.', basePrice: 5000, duration: 60, displayOrder: 3 },
  { categorySlug: 'other-helps', name: 'Mechanic', slug: 'mechanic', description: 'Emergency vehicle diagnosis and repair.', basePrice: 8000, duration: 90, displayOrder: 4 },
  { categorySlug: 'other-helps', name: 'Gardener', slug: 'gardener', description: 'Garden maintenance and light landscaping.', basePrice: 7000, duration: 150, displayOrder: 5 },
  { categorySlug: 'other-helps', name: 'Painting', slug: 'painting', description: 'Painting and surface finishing support.', basePrice: 12000, duration: 240, displayOrder: 6 },
];

const workerSeeds = [
  {
    fullName: 'Amaka Okafor',
    email: 'amaka.okafor@athand.test',
    phone: '08030000001',
    profilePhotoUrl: '/uploads/seed/workers/amaka-okafor.jpg',
    occupation: 'Cleaner',
    bio: 'Detailed home cleaner known for same-day apartment resets and post-event cleanup.',
    yearsExperience: 6,
    serviceArea: ['Lekki, Lagos', 'Victoria Island, Lagos'],
    hourlyRate: 7000,
    languages: ['English', 'Igbo'],
    skills: ['Deep cleaning', 'Laundry', 'Apartment turnover'],
    emergencyServices: false,
    verificationStatus: 'verified',
    averageRating: 4.9,
    totalReviews: 126,
    completedBookings: 184,
    totalBookings: 191,
    trustScore: 95,
    isFeatured: true,
    availableNow: true,
    serviceSlugs: ['cleaner', 'deep-cleaning', 'part-time-maid'],
  },
  {
    fullName: 'Tunde Balogun',
    email: 'tunde.balogun@athand.test',
    phone: '08030000002',
    profilePhotoUrl: '/uploads/seed/workers/tunde-balogun.jpg',
    occupation: 'Electrician',
    bio: 'Emergency electrician for home wiring faults, inverter troubleshooting, and power restoration.',
    yearsExperience: 8,
    serviceArea: ['Yaba, Lagos', 'Surulere, Lagos'],
    hourlyRate: 12000,
    languages: ['English', 'Yoruba'],
    skills: ['Electrical repair', 'Generator wiring', 'Inverter support'],
    emergencyServices: true,
    verificationStatus: 'verified',
    averageRating: 4.8,
    totalReviews: 98,
    completedBookings: 163,
    totalBookings: 170,
    trustScore: 93,
    isFeatured: true,
    availableNow: true,
    responseTime: 12,
    serviceSlugs: ['electrician'],
  },
  {
    fullName: 'Aisha Bello',
    email: 'aisha.bello@athand.test',
    phone: '08030000003',
    profilePhotoUrl: '/uploads/seed/workers/aisha-bello.jpg',
    occupation: 'Nanny',
    bio: 'Experienced childcare professional trusted for newborn care, after-school support, and family routines.',
    yearsExperience: 7,
    serviceArea: ['Ikoyi, Lagos', 'Lekki, Lagos'],
    hourlyRate: 9000,
    languages: ['English', 'Hausa'],
    skills: ['Childcare', 'Homework support', 'Infant care'],
    emergencyServices: false,
    verificationStatus: 'verified',
    averageRating: 4.9,
    totalReviews: 111,
    completedBookings: 149,
    totalBookings: 154,
    trustScore: 96,
    isFeatured: true,
    serviceSlugs: ['childcare'],
  },
  {
    fullName: 'Chinedu Eze',
    email: 'chinedu.eze@athand.test',
    phone: '08030000004',
    profilePhotoUrl: '/uploads/seed/workers/chinedu-eze.jpg',
    occupation: 'Mechanic',
    bio: 'Mobile mechanic focused on breakdown rescue, battery issues, and roadside engine checks.',
    yearsExperience: 9,
    serviceArea: ['Ikeja, Lagos', 'Ogba, Lagos'],
    hourlyRate: 15000,
    languages: ['English', 'Igbo'],
    skills: ['Engine diagnostics', 'Battery replacement', 'Roadside repair'],
    emergencyServices: true,
    verificationStatus: 'verified',
    averageRating: 4.7,
    totalReviews: 87,
    completedBookings: 143,
    totalBookings: 151,
    trustScore: 91,
    isFeatured: true,
    availableNow: true,
    responseTime: 10,
    serviceSlugs: ['mechanic'],
  },
  {
    fullName: 'Bolanle Adeyemi',
    email: 'bolanle.adeyemi@athand.test',
    phone: '08030000005',
    profilePhotoUrl: '/uploads/seed/workers/bolanle-adeyemi.jpg',
    occupation: 'Cook',
    bio: 'Private cook for family meal plans, small events, and weekly food prep.',
    yearsExperience: 5,
    serviceArea: ['Magodo, Lagos', 'Maryland, Lagos'],
    hourlyRate: 11000,
    languages: ['English', 'Yoruba'],
    skills: ['Meal prep', 'Continental dishes', 'Nigerian cuisine'],
    emergencyServices: false,
    verificationStatus: 'verified',
    averageRating: 4.8,
    totalReviews: 75,
    completedBookings: 132,
    totalBookings: 138,
    trustScore: 90,
    serviceSlugs: ['cook'],
  },
  {
    fullName: 'Samuel Peters',
    email: 'samuel.peters@athand.test',
    phone: '08030000006',
    profilePhotoUrl: '/uploads/seed/workers/samuel-peters.jpg',
    occupation: 'Driver',
    bio: 'Professional driver for school runs, corporate movement, and scheduled city transfers.',
    yearsExperience: 10,
    serviceArea: ['Ajah, Lagos', 'Victoria Island, Lagos'],
    hourlyRate: 10000,
    languages: ['English'],
    skills: ['Defensive driving', 'School runs', 'Corporate transport'],
    emergencyServices: false,
    verificationStatus: 'verified',
    averageRating: 4.6,
    totalReviews: 66,
    completedBookings: 117,
    totalBookings: 122,
    trustScore: 88,
    availableNow: true,
    serviceSlugs: ['driver'],
  },
  {
    fullName: 'Grace Udo',
    email: 'grace.udo@athand.test',
    phone: '08030000007',
    profilePhotoUrl: '/uploads/seed/workers/grace-udo.jpg',
    occupation: 'House Maid',
    bio: 'Reliable domestic support worker for daily chores, room organization, and laundry management.',
    yearsExperience: 4,
    serviceArea: ['Gwarinpa, Abuja', 'Wuse, Abuja'],
    hourlyRate: 6500,
    languages: ['English'],
    skills: ['Laundry', 'Housekeeping', 'General home support'],
    emergencyServices: false,
    verificationStatus: 'verified',
    averageRating: 4.7,
    totalReviews: 54,
    completedBookings: 109,
    totalBookings: 114,
    trustScore: 87,
    serviceSlugs: ['full-time-maid', 'part-time-maid'],
  },
  {
    fullName: 'Moses Danjuma',
    email: 'moses.danjuma@athand.test',
    phone: '08030000008',
    profilePhotoUrl: '/uploads/seed/workers/moses-danjuma.jpg',
    occupation: 'Gardener',
    bio: 'Gardener for lawn care, compound cleanup, and soft landscaping maintenance.',
    yearsExperience: 6,
    serviceArea: ['Asokoro, Abuja', 'Maitama, Abuja'],
    hourlyRate: 8500,
    languages: ['English', 'Hausa'],
    skills: ['Landscaping', 'Lawn care', 'Compound maintenance'],
    emergencyServices: false,
    verificationStatus: 'verified',
    averageRating: 4.6,
    totalReviews: 41,
    completedBookings: 84,
    totalBookings: 88,
    trustScore: 85,
    serviceSlugs: ['gardener', 'painting'],
  },
  {
    fullName: 'Kemi Arowolo',
    email: 'kemi.arowolo@athand.test',
    phone: '08030000009',
    profilePhotoUrl: '/uploads/seed/workers/kemi-arowolo.jpg',
    occupation: 'Cleaner',
    bio: 'Office and post-renovation cleaner who handles intensive resets and recurring maintenance.',
    yearsExperience: 5,
    serviceArea: ['Ilupeju, Lagos', 'Ikeja, Lagos'],
    hourlyRate: 7500,
    languages: ['English', 'Yoruba'],
    skills: ['Office cleaning', 'Post-renovation cleanup', 'Sanitization'],
    emergencyServices: false,
    verificationStatus: 'verified',
    averageRating: 4.8,
    totalReviews: 63,
    completedBookings: 103,
    totalBookings: 108,
    trustScore: 89,
    serviceSlugs: ['cleaner', 'deep-cleaning'],
  },
  {
    fullName: 'Ibrahim Yusuf',
    email: 'ibrahim.yusuf@athand.test',
    phone: '08030000010',
    profilePhotoUrl: '/uploads/seed/workers/ibrahim-yusuf.jpg',
    occupation: 'Plumber',
    bio: 'Fast-response plumber for leaks, blocked drainage, and bathroom fixture repairs.',
    yearsExperience: 8,
    serviceArea: ['Kubwa, Abuja', 'Jabi, Abuja'],
    hourlyRate: 13000,
    languages: ['English', 'Hausa'],
    skills: ['Pipe repair', 'Drainage work', 'Bathroom fittings'],
    emergencyServices: true,
    verificationStatus: 'verified',
    averageRating: 4.7,
    totalReviews: 58,
    completedBookings: 97,
    totalBookings: 101,
    trustScore: 90,
    availableNow: true,
    responseTime: 14,
    serviceSlugs: ['plumber'],
  },
];

const adminUser = {
  fullName: 'ATHAND Admin',
  email: 'admin@athand.test',
  phone: '08039999999',
  role: 'admin',
  passwordHash: 'Admin@123',
};

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/athand';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    await WorkerService.deleteMany({});
    await Worker.deleteMany({});
    await User.deleteMany({ role: { $in: ['worker', 'admin'] } });
    await Category.deleteMany({});
    await Service.deleteMany({});
    console.log('Cleared existing seedable data');

    const createdCategories = await Category.insertMany(categories);
    const categoryMap = createdCategories.reduce((acc, category) => {
      acc[category.slug] = category._id;
      return acc;
    }, {});
    console.log(`Created ${createdCategories.length} categories`);

    const servicesToInsert = services.map((service) => ({
      ...service,
      categoryId: categoryMap[service.categorySlug],
    }));
    const createdServices = await Service.insertMany(servicesToInsert);
    const serviceMap = createdServices.reduce((acc, service) => {
      acc[service.slug] = service._id;
      return acc;
    }, {});
    console.log(`Created ${createdServices.length} services`);

    await User.create(adminUser);
    console.log('Created demo admin user: admin@athand.test / Admin@123');

    for (const seed of workerSeeds) {
      const user = await User.create({
        fullName: seed.fullName,
        email: seed.email,
        phone: seed.phone,
        role: 'worker',
        passwordHash: 'Worker@123',
        profilePhotoUrl: seed.profilePhotoUrl || null,
      });

      const worker = await Worker.create({
        userId: user._id,
        bio: seed.bio,
        occupation: seed.occupation,
        yearsExperience: seed.yearsExperience,
        profilePhotoUrl: seed.profilePhotoUrl || null,
        serviceArea: seed.serviceArea,
        hourlyRate: seed.hourlyRate,
        languages: seed.languages,
        skills: seed.skills,
        emergencyServices: seed.emergencyServices,
        verificationStatus: seed.verificationStatus,
        averageRating: seed.averageRating,
        totalReviews: seed.totalReviews,
        completedBookings: seed.completedBookings,
        totalBookings: seed.totalBookings,
        trustScore: seed.trustScore,
        isFeatured: !!seed.isFeatured,
        isAvailable: true,
        availableNow: !!seed.availableNow,
        responseTime: seed.responseTime || null,
        onboardingCompleted: true,
        badges: seed.verificationStatus === 'verified' ? ['Verified', 'Trusted Pro'] : [],
      });

      const workerServices = seed.serviceSlugs
        .map((slug) => serviceMap[slug])
        .filter(Boolean)
        .map((serviceId) => ({
          workerId: worker._id,
          serviceId,
          customPrice: seed.hourlyRate,
          isActive: true,
        }));

      if (workerServices.length > 0) {
        await WorkerService.insertMany(workerServices);
      }
    }

    console.log(`Created ${workerSeeds.length} worker profiles`);
    console.log('Default worker password: Worker@123');
    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
