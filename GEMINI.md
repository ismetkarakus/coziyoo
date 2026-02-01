# Agent Notes (Coziyoo)

## Purpose
Personal working notes for future tasks in this repo.

## Quick Orientation
- App is Expo + React Native using expo-router.
- Routes live in `app/` (route files are screens).
- Feature screens and components are under `src/features` and `src/components`.
- Firebase integration is in `src/config` and `src/services`.

## Start/Run
- `npm run start` for Expo dev server
- `npm run ios` or `npm run android` for device/emulator
- `npm run web` for web

## Auth + Routing
- Auth state is handled by `src/context/AuthContext.tsx`.
- Redirect logic is enforced by `src/components/auth/AuthGuard.tsx`.
- Seller vs buyer flow depends on `userType` and `sellerEnabled`.

## Data + Services
- Firestore collections used: `users`, `foods`, `orders`, `reviews`, `chats`, `messages`.
- CRUD is through service classes in `src/services/*`.
- Storage uploads are in `src/services/storageService.ts`.
- Payments are mock-only in `src/services/paymentService.ts`.

## Where to Change Things
- Add or update screens in `app/` and `src/features/*/screens/`.
- Update UI components in `src/components/ui/`.
- Adjust theme tokens in `src/theme/`.
- Update Firebase config in `src/config/firebase.ts` and `src/config/firebaseWeb.ts`.

## Debugging
- Auth setup: see `FIREBASE_AUTH_SETUP.md` and `DEBUG_AUTH.md`.
- Cache reset: see `CLEAR_CACHE.md`.
- Routes overview: see `ROUTES.md`.

## Cautions
- Auth service uses cache + mock fallback for offline/timeout cases.
- Notification service only triggers local notifications.
- Payment service is a demo stub; do not treat as real payments.

