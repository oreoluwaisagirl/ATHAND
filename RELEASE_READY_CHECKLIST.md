# Release-Ready Checklist

## 1. Build and Lint
- [x] Frontend lint passes: `npm run lint`
- [x] Frontend production build passes: `npm run build`
- [x] Backend source syntax checks pass (`node --check` across `backend/src`)

## 2. Service Availability
- [x] Frontend dev server starts and serves routes
- [x] Backend API health endpoint responds: `GET /api/health`

## 3. Frontend Route Smoke Test
Validated HTTP 200 responses for key routes:
- [x] `/`
- [x] `/house-help-search`
- [x] `/other-help`
- [x] `/category/electrician`
- [x] `/worker/electrician/:workerId`
- [x] `/booking-summary`
- [x] `/booking-datetime`
- [x] `/booking-location`
- [x] `/booking-confirmation`
- [x] `/messages`
- [x] `/chat/:conversationId`
- [x] `/profile`
- [x] `/login`
- [x] `/signup`
- [x] `/help-center`
- [x] `/payment-methods`
- [x] `/notification-settings`
- [x] `/language-region`
- [x] `/terms-of-service`
- [x] `/about-athand`
- [x] `/admin`
- [x] `/worker-panel`
- [x] `/worker-onboarding`
- [x] `/otp-test`

## 4. End-to-End Worker Onboarding -> User Listing
Test flow executed against live backend API:
- [x] Register/login worker account (`role: worker`)
- [x] Confirm `requiresWorkerOnboarding: true`
- [x] Submit worker onboarding payload successfully
- [x] Verify onboarded worker appears in public `GET /api/workers` response
- [x] Verify occupation persisted (`Private Chef`) and availability is true

## 5. Data and Category Behavior
- [x] Worker sync fetches all pages (not only first page)
- [x] Category inference supports electrician/mechanic/trade roles
- [x] Chef/private-chef map to cook category for user-side listing
- [x] Explore page uses live data (not static provider fixtures)

## 6. Operational Notes Before Production Deploy
- [ ] Set production `VITE_API_BASE_URL`
- [ ] Confirm production MongoDB + network access
- [ ] Confirm production CORS origins
- [ ] Rotate/verify secrets (`JWT_SECRET`, Paystack keys, email credentials)
- [ ] Enable monitoring/logging and backup strategy
- [ ] Run a manual UX pass on mobile + desktop
- [ ] Run admin and worker role permission regression checks

## 7. Sign-off Summary
- Current status: **Ready for staging/production candidate validation**
- Blocking issues discovered in this pass: **None**
