# ATHAND

ATHAND is a two-part project:
- Frontend: React + Vite (`/`)
- Backend: Express + MongoDB (`/backend`)

## Run Locally

Frontend:
```bash
cd /Users/oreoluwa/ATHAND
npm install
npm run dev
```

Backend:
```bash
cd /Users/oreoluwa/ATHAND/backend
npm install
npm run dev
```

## Required Environment Variables

### Frontend (`/Users/oreoluwa/ATHAND/.env.local`)
```env
VITE_API_URL=https://athand-1.onrender.com
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_javascript_api_key
```

### Backend (`/Users/oreoluwa/ATHAND/backend/.env`)
```env
MONGODB_URI=...
JWT_SECRET=...
FRONTEND_URL=http://localhost:5173

# Paystack (required for payment init/verify/payout transfer)
PAYSTACK_SECRET_KEY=sk_live_or_test_key
PAYSTACK_PUBLIC_KEY=pk_live_or_test_key
```

Paystack keys are required because backend payment utilities call Paystack APIs directly in:
- `backend/src/utils/paystack.js`
- `backend/src/routes/payments.js`

Without `PAYSTACK_SECRET_KEY`, payment initialize/verify/transfer routes will fail.

## Maps and Live Markers

Emergency and tracking screens now use Google Maps JavaScript SDK with live markers.

For markers to appear for workers, workers should have coordinates:
- `worker.latitude`
- `worker.longitude`

These are now supported in the backend worker model/routes.

## Build

Frontend build:
```bash
cd /Users/oreoluwa/ATHAND
npm run build
```

Backend has no compile step; deploy with:
```bash
cd /Users/oreoluwa/ATHAND/backend
npm run start
```
