# Coziyoo (Cazi)

Coziyoo is a home-cooked food marketplace app built with Expo + React Native. It supports buyer and seller flows, Firebase-backed auth and data, chat, reviews, and order management. The app uses expo-router for navigation and Firestore for storage and real-time updates.

## What this app is about
- Buyers can browse meals, add items to cart, place orders, and track order status.
- Sellers can manage listings, orders, and earnings in a dedicated seller area.
- Chat, reviews, notifications, and wallet-related UI are included.

## Tech stack
- Expo + React Native (expo-router)
- Backend pending (Mock adapters in place for Supabase migration)
- Expo Notifications (client-side/local)

## Requirements
- Node.js (LTS recommended)
- npm
- Expo CLI (optional, `npx expo` works)

## Install
```bash
npm install
```

## Run
```bash
# Dev server
npm run start

# Platform shortcuts
npm run ios
npm run android
npm run web
```

## Backend setup
The project currently uses temporary in-memory mocks (`src/services/backend/`) in preparation for Supabase integration.
Firebase SDKs and config have been removed.

- Data is mock-only and resets on app reload (unless cached in AsyncStorage).
- Auth allows any email/password (mock logic).

## Useful docs
- Routes: `ROUTES.md`
- Cache reset: `CLEAR_CACHE.md`
- Migration Plan: `Documents/FirebaseRemovalPlan.md`

## Notes
- Payment service is a demo/mock implementation.
- Notifications are local-only unless you add a backend push flow.
