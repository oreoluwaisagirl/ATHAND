# ATHAND Backend API

A comprehensive Node.js/Express backend for the ATHAND house help booking platform.

## Features

- **User Management**: Registration, login, profile management
- **Worker Profiles**: Worker registration, verification, services
- **Service Listings**: Categories and services management
- **Booking System**: Create, manage, and track bookings
- **Reviews & Ratings**: Worker ratings and reviews
- **Notifications**: Real-time notifications for users and workers
- **Admin Panel**: Full admin controls for platform management
- **Emergency Bookings**: Priority booking for urgent needs
- **Trust & Verification**: Worker verification system

## Prerequisites

- Node.js 18+
- MongoDB 6+
- npm or yarn

## Installation

1. Navigate to the backend directory:
   
```
bash
   cd backend
   
```

2. Install dependencies:
   
```
bash
   npm install
   
```

3. Create environment file:
   
```
bash
   cp .env.example .env
   
```

4. Update `.env` with your configuration:
   
```
env
   MONGODB_URI=mongodb://localhost:27017/athand
   JWT_SECRET=your-secret-key
   WORKER_EMAIL_ALLOWLIST=kayworkinter@gmail.com,shobayoramon27@gmail.com
   PORT=5000
   
```

5. Seed the database with initial data:
   
```
bash
   npm run seed
   
```

6. Start the development server:
   
```
bash
   npm run dev
   
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/password` - Change password

### Users
- `GET /api/users` - Get all users (admin)
- `GET /api/users/:id` - Get user by ID (admin)
- `PUT /api/users/:id` - Update user (admin)
- `DELETE /api/users/:id` - Delete user (admin)

### Workers
- `GET /api/workers` - Get all workers
- `GET /api/workers/featured` - Get featured workers
- `GET /api/workers/:id` - Get worker by ID
- `PUT /api/workers/:id` - Update worker profile
- `POST /api/workers/:id/services` - Add worker services

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get category by ID
- `GET /api/categories/slug/:slug` - Get category by slug

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/my-bookings` - Get user's bookings
- `GET /api/bookings/:id` - Get booking by ID
- `PUT /api/bookings/:id/status` - Update booking status

### Reviews
- `POST /api/reviews` - Create review
- `GET /api/reviews/worker/:workerId` - Get worker reviews
- `GET /api/reviews/my-reviews` - Get user's reviews

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read

### Admin
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/workers/pending-verification` - Pending verifications
- `PUT /api/admin/workers/:id/verify` - Verify worker
- `POST /api/admin/categories` - Create category
- `GET /api/admin/bookings` - Get all bookings

## Database Models

- **User**: User accounts and authentication
- **Worker**: Worker profiles and verification
- **Category**: Service categories
- **Service**: Available services
- **Booking**: Booking records
- **Review**: Worker reviews and ratings
- **Notification**: User notifications
- **VerificationDocument**: Worker verification documents
- **WorkerService**: Worker-specific services and pricing

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: express-validator
- **CORS**: cors middleware
- **Environment**: dotenv

## Project Structure

```
backend/
├── src/
│   ├── index.js          # Main application entry
│   ├── seed.js           # Database seeder
│   ├── models/           # Mongoose models
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   └── utils/           # Utility functions
├── package.json
├── .env.example
└── README.md
```

## License

MIT
