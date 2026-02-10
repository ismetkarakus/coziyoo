# Coziyoo (Cazi) Project Workflow Report

## 1) Executive Summary
Coziyoo is an Expo + React Native app using expo-router for navigation and Firebase for auth, Firestore data, and storage. The codebase splits routes under `app/` (expo-router) and feature logic/components under `src/`. Auth is centralized in `AuthProvider` with an `AuthGuard` that redirects users into buyer tabs or seller tabs. Many app features are wired to Firestore via service classes (foods, reviews, chats, storage). Notifications are handled with Expo Notifications and are local-only in the client. Payment service is currently a mock/demo implementation.

## 2) Tech Stack
- Runtime: Expo (React Native 0.81) with expo-router
- UI: React, React Native, custom UI kit under `src/components/ui`
- State: React Context providers (`Auth`, `Cart`, `Wallet`, `Country`, `Notification`)
- Backend: Mock Adapters (Pending Supabase)
- Notifications: Expo Notifications (local + push token retrieval)
- Build/Deploy: Expo export for web

## 3) High-Level Architecture
- `app/` = route definitions and screen composition (expo-router).
- `src/features/` = feature-specific screens used by routes.
- `src/components/` = reusable UI + layout + auth guard.
- `src/services/` = App domain services (auth, food, chat, storage, reviews, notifications, payments).
- `src/services/backend/` = Temporary backend adapters (Auth, DB, Storage).
- `src/context/` = global state and side-effects (auth, cart, wallet, notification, country).
- `src/theme/` = spacing/colors/typography tokens.

## 4) App Startup Workflow
1) `app/_layout.tsx` loads fonts and keeps the splash screen until ready.
2) Root layout wraps all routes with providers:
   - `CountryProvider` -> `AuthProvider` -> `NotificationProvider` -> `AuthGuard` -> `WalletProvider` -> `CartProvider`
3) `AuthProvider` initializes auth state and caches user profile from AsyncStorage. It attempts to fetch Firestore user data in the background and redirects based on user type (buyer vs seller).
4) `AuthGuard` enforces that:
   - unauthenticated users are forced to `(auth)` routes
   - authenticated users are sent to buyer tabs (unless seller) or seller dashboard

## 5) Navigation & Routing
- Routing uses expo-router with route groups:
  - Buyer tabs: `app/(buyer)/` (home, explore, cart, notifications, profile, etc.)
  - Seller tabs: `app/(seller)/` (dashboard, orders, products, analytics, etc.)
  - Auth flow: `app/(auth)/` (sign-in, sign-up, forgot-password)
  - Standalone screens: `app/food-detail.tsx`, `app/checkout.tsx`, `app/order-history.tsx`, etc.
- `ROUTES.md` documents the overall map.

## 6) Authentication Workflow (Key Flow)
- Auth is handled by mock adapter in `src/services/backend/auth.ts`.
- `AuthProvider` listens to `onAuthStateChanged` (mocked):
  - Sets a fast fallback `userData` to keep UI responsive.
  - Tries cache (`AsyncStorage`) for `user_{uid}`.
  - Refreshes from backend via `getUserDataSafe`.
  - Auto-redirects to seller or buyer entry point.
- `AuthService` handles sign-in, sign-up, password reset using mock implementation.

## 7) Core Domain Flows
### Buyer Flow
1) Browse foods (Firestore `foods` collection) via `foodService`.
2) Add to cart via `CartContext`.
3) Checkout creates order record (`orders` collection).
4) Order tracking and history use order reads from Firestore.

### Seller Flow
1) Seller dashboard and manage meals screens are under `app/(seller)/`.
2) Food CRUD in Firestore via `foodService`.
3) Order management reads/writes `orders` for seller.

### Chat Flow
- `chatService` handles chat rooms and message documents.
- Screens under `app/chat*.tsx` and `src/features/chat`.

### Reviews
- `reviewService` manages `reviews` collection and rating calculations.

### Storage
- `storageService` handles image selection and upload to Firebase Storage.

### Notifications
- `notificationService` requests permissions and uses Expo local notifications.
- Server-side push is not implemented; tokens are retrieved and logged.

### Payments
- `paymentService` is a mock with simulated delays; integrate a real provider later.

## 8) Data Model (Firestore)
From `FIREBASE_GUIDE.md`:
- `foods`     : food items with availability, pricing, images
- `orders`    : buyer/seller order data, status, timestamps
- `reviews`   : rating and feedback per food
- `chats`     : chat rooms
- `messages`  : chat messages
- `users`     : user profiles (buyer/seller)

## 9) Configuration & Environment
- Firebase config is hardcoded in:
  - `src/config/firebase.ts` (native)
  - `src/config/firebaseWeb.ts` (web)
- Firebase rules files: `firestore.rules`, `storage.rules`
- App config: `app.json`

## 10) Build & Run Workflow
Common commands (from `package.json`):
- `npm run start`        : Expo dev server
- `npm run ios`          : Expo iOS
- `npm run android`      : Expo Android
- `npm run web`          : Expo web
- `npm run test`         : Jest watch mode
- `npm run build:web`    : Expo export for web
- `npm run firebase:deploy` : Build + Firebase deploy (web)

Cache troubleshooting:
- See `CLEAR_CACHE.md` for Expo cache reset and test scenarios.

## 11) Key Files for Development
- Routing: `app/_layout.tsx`, `app/(buyer)/_layout.tsx`, `app/(seller)/_layout.tsx`
- Auth: `src/context/AuthContext.tsx`, `src/components/auth/AuthGuard.tsx`, `src/services/authService.ts`
- Data: `src/services/foodService.ts`, `src/services/chatService.ts`, `src/services/reviewService.ts`
- UI kit: `src/components/ui/*`
- Theme: `src/theme/*`

## 12) Typical Developer Workflow
1) Start Expo: `npm run start`.
2) Open Expo DevTools and run on device/emulator.
3) Update screens under `app/` or `src/features/`.
4) Use service classes to interact with Firestore.
5) Validate auth and routing behavior using AuthGuard logs.
6) If auth fails, follow `DEBUG_AUTH.md` + `FIREBASE_AUTH_SETUP.md`.

## 13) Known Implementation Notes
- Auth uses cache-first strategy to avoid slow Firestore reads.
- Firestore operations have timeout fallback to mock data for Expo Go.
- Payment logic is demo-only.
- Notifications are local-only; push is not wired to backend.

---
End of report.
