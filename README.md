# Coziyoo (Cazi)

Coziyoo is a home-cooked food marketplace app built with Expo + React Native. It supports buyer and seller flows, Firebase-backed auth and data, chat, reviews, and order management. The app uses expo-router for navigation and Firestore for storage and real-time updates.

## What this app is about
- Buyers can browse meals, add items to cart, place orders, and track order status.
- Sellers can manage listings, orders, and earnings in a dedicated seller area.
- Chat, reviews, notifications, and wallet-related UI are included.

## Tech stack
- Expo + React Native (expo-router)
- Firebase Auth / Firestore / Storage
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

## Firebase setup
Firebase configuration is currently hardcoded for web and native:
- `src/config/firebase.ts`
- `src/config/firebaseWeb.ts`

If auth fails in dev, follow:
- `FIREBASE_AUTH_SETUP.md`
- `DEBUG_AUTH.md`

## Useful docs
- Routes: `ROUTES.md`
- Cache reset: `CLEAR_CACHE.md`
- Firebase guide: `FIREBASE_GUIDE.md`

## Notes
- Payment service is a demo/mock implementation.
- Notifications are local-only unless you add a backend push flow.
