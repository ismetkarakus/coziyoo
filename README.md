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

## PostgreSQL Backend (Remote API)
You can run the app against a real PostgreSQL-backed API server.

### 1) Configure environment
Create `.env` (or export vars) based on `.env.example`:
- `EXPO_PUBLIC_API_MODE=remote`
- `EXPO_PUBLIC_API_BASE_URL=http://localhost:4000` (or your deployed API URL)
- `DATABASE_URL=postgresql://USERNAME:PASSWORD@proxy.drascom.uk:45432/DATABASE_NAME`

Important:
- Keep DB credentials only in backend/server environment.
- Do not expose DB credentials in Expo client env vars.

### 2) Start backend API
```bash
npm run server
```

### 3) Start Expo app
```bash
npm run start
```

## Admin Panel (Web)
The admin panel is a separate React + Vite app under `admin-panel/`.

### Install & Run
```bash
cd admin-panel
npm install
npm run dev
```

Then open the local URL shown in the terminal (usually `http://localhost:5173`).

## Firebase setup
Firebase configuration is currently hardcoded for web and native:
- `src/config/firebase.ts`
- `src/config/firebaseWeb.ts`

## Useful docs
- Routes: `ROUTES.md`
- Cache reset: `CLEAR_CACHE.md`
- Firebase guide: `FIREBASE_GUIDE.md`

## Notes
- Payment service is a demo/mock implementation.
- Notifications are local-only unless you add a backend push flow.

## Test Data Layer (More Robust Than Static JSON)
The internal app API now supports a pluggable data mode for testing:
- `sqlite` (default): Persistent local SQLite database, seeded once from mock JSON.
- `mock`: In-memory mock JSON database (previous behavior).
- `remote`: Network API via `EXPO_PUBLIC_API_MODE=remote` (PostgreSQL backend server).

Web note:
- If `SharedArrayBuffer` is unavailable in the browser/runtime, web automatically falls back to `mock`.
- `sqlite` mode remains available on native (iOS/Android).

Set mode with:
```bash
EXPO_PUBLIC_DATA_MODE=sqlite npm run start
```

or:
```bash
EXPO_PUBLIC_DATA_MODE=mock npm run start
```
