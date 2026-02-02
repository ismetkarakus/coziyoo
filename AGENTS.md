# Agent Notes (Coziyoo/Cazi)

> Personal working notes for AI coding agents. This file contains essential information about the project architecture, conventions, and development workflows.

## Quick Orientation
- App is Expo + React Native using expo-router.
- Routes live in `app/` (route files are screens).
- Feature screens and components are under `src/features` and `src/components`.

---

## Project Overview

**Coziyoo (Cazi)** is a home-cooked food marketplace mobile application built with **Expo** and **React Native**. It connects buyers looking for homemade meals with sellers (home cooks) who want to sell their food.

### Key Features
- **Buyer Flow**: Browse meals, add to cart, place orders, track status, chat with sellers
- **Seller Flow**: Manage listings, track orders, view earnings, manage wallet
- **Dual User Support**: Users can be buyers, sellers, or both
- **Internationalization**: Supports Turkey (TR) and United Kingdom (UK) with different compliance requirements
- **Real-time Chat**: Built-in messaging between buyers and sellers
- **Payment Integration**: Mock/demo payment system (not production-ready)

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| Framework | Expo ~54.0.31 + React Native 0.81.5 |
| Navigation | expo-router ~6.0.21 (file-based routing) |
| Language | TypeScript 5.x (strict mode) |
| Backend | Firebase (Auth, Firestore, Storage) |
| State Management | React Context API |
| Styling | React Native StyleSheet + Custom Theme |
| Testing | Jest + jest-expo |
| Deployment | Firebase Hosting (web) |

### Major Dependencies
- `firebase` ^12.7.0 - Backend services
- `expo-router` ~6.0.21 - Navigation
- `expo-notifications` ~0.32.16 - Push notifications
- `expo-image-picker` ~17.0.10 - Image selection
- `expo-location` ~19.0.8 - GPS/location services
- `@react-native-async-storage/async-storage` ^2.2.0 - Local storage
- `react-native-reanimated` ~4.1.1 - Animations
- `react-native-calendars` ^1.1313.0 - Calendar components

---

## Project Structure

```
/Users/drascom/Work Folder/coziyoo/
├── app/                          # Expo Router screens (file-based routing)
│   ├── (auth)/                   # Auth route group (sign-in, sign-up, etc.)
│   ├── (tabs)/                   # Buyer tab navigation (home, explore, cart, etc.)
│   ├── (seller)/                 # Seller route group (dashboard, products, etc.)
│   ├── _layout.tsx               # Root layout with providers
│   └── *.tsx                     # Other screens (modal, checkout, etc.)
├── src/
│   ├── components/
│   │   ├── auth/                 # AuthGuard, auth-related components
│   │   ├── forms/                # Form components (FormField, etc.)
│   │   ├── layout/               # Layout components (TopBar, etc.)
│   │   ├── ui/                   # Reusable UI components (Button, Card, etc.)
│   │   └── wallet/               # Wallet-specific components
│   ├── config/
│   │   ├── firebase.ts           # Firebase native config (with AsyncStorage persistence)
│   │   ├── firebaseWeb.ts        # Firebase web config
│   │   └── countries.ts          # Country configurations (TR/UK)
│   ├── constants/
│   │   └── allergens.ts          # UK/TR allergen definitions (14 major allergens)
│   ├── context/
│   │   ├── AuthContext.tsx       # Authentication state & auto-redirect logic
│   │   ├── CartContext.tsx       # Shopping cart state
│   │   ├── CountryContext.tsx    # Country/locale state (TR/UK switching)
│   │   ├── NotificationContext.tsx # Notification state
│   │   └── WalletContext.tsx     # Wallet state
│   ├── features/
│   │   ├── auth/screens/         # Auth screens (SignIn, SignUp, etc.)
│   │   ├── buyer/screens/        # Buyer screens (Home, FoodDetail, etc.)
│   │   ├── seller/screens/       # Seller screens (SellerPanel, AddMeal, etc.)
│   │   ├── cart/screens/         # Cart screens
│   │   ├── chat/screens/         # Chat screens
│   │   ├── checkout/screens/     # Checkout flow
│   │   ├── legal/screens/        # Legal screens (TermsAndConditions)
│   │   ├── notifications/screens/ # Notification screens
│   │   ├── onboarding/screens/   # Onboarding (CountrySelection)
│   │   ├── orders/screens/       # Order management
│   │   ├── payment/screens/      # Payment screens
│   │   └── wallet/screens/       # Wallet dashboard
│   ├── hooks/
│   │   └── useTranslation.ts     # i18n hook
│   ├── i18n/
│   │   └── translations.ts       # TR/EN translations
│   ├── services/
│   │   ├── authService.ts        # Auth operations (sign in, sign up, etc.)
│   │   ├── chatService.ts        # Chat operations
│   │   ├── firebaseService.ts    # Generic Firebase operations
│   │   ├── foodService.ts        # Food/meal CRUD
│   │   ├── notificationService.ts # Local notifications
│   │   ├── paymentService.ts     # Mock payment service
│   │   ├── reviewService.ts      # Reviews and ratings
│   │   ├── searchService.ts      # Search functionality
│   │   └── storageService.ts     # Firebase Storage uploads
│   ├── theme/
│   │   ├── colors.ts             # Color palette (light/dark)
│   │   ├── typography.ts         # Font definitions
│   │   ├── spacing.ts            # Spacing tokens
│   │   └── index.ts              # Theme exports
│   ├── types/
│   │   └── index.ts              # TypeScript type definitions
│   └── utils/
│       ├── firebaseUtils.ts      # Firebase utilities
│       ├── seedData.ts           # Seed data for development
│       └── strings.ts            # String utilities
├── assets/
│   ├── fonts/                    # Custom fonts (SpaceMono)
│   └── images/                   # App images, icons, splash
├── constants/
│   └── Colors.ts                 # Default Expo colors (legacy)
├── app.json                      # Expo app configuration
├── babel.config.js               # Babel preset: babel-preset-expo
├── tsconfig.json                 # TypeScript config (strict mode, path alias @/*)
├── storage.rules                 # Firebase Storage security rules
└── .firebaserc                   # Firebase project config (project: cazi-app)
```

---

## Build and Development Commands

```bash
# Development
npm run start          # Start Expo dev server
npm run ios            # Start iOS simulator
npm run android        # Start Android emulator
npm run web            # Start web development

# Testing
npm run test           # Run Jest tests in watch mode

# Building
npm run build:web      # Export web build (static)

# Firebase
npm run firebase:login    # Login to Firebase
npm run firebase:deploy   # Build web and deploy to Firebase Hosting
npm run firebase:serve    # Serve Firebase locally
```

---

## Code Style Guidelines

### TypeScript Conventions
- **Strict mode enabled** - No implicit any
- Path alias: `@/*` maps to project root
- Prefer `interface` over `type` for object shapes
- Use explicit return types on public functions
- Use `as const` for constant arrays/objects

### Naming Conventions
- **Components**: PascalCase (e.g., `AuthGuard.tsx`)
- **Files**: camelCase for utilities, PascalCase for components
- **Interfaces**: PascalCase with descriptive names
- **Constants**: UPPER_SNAKE_CASE for true constants
- **Firebase collections**: lowercase (users, foods, orders, reviews, chats, messages)

### Import Order
1. React/Expo imports
2. Third-party libraries
3. Absolute imports (`@/...`)
4. Relative imports (`../...`)

### Component Structure
```tsx
// 1. Imports
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/src/components/ui';

// 2. Types/Interfaces
interface Props {
  title: string;
}

// 3. Component
export const MyComponent: React.FC<Props> = ({ title }) => {
  return (
    <View style={styles.container}>
      <Text>{title}</Text>
    </View>
  );
};

// 4. Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
```

---

## Routing Architecture

Uses **expo-router** with file-based routing and route groups:

### Route Groups
- `(auth)/` - Authentication stack (sign-in, sign-up, forgot-password)
- `(tabs)/` - Buyer bottom tab navigation (home, explore, cart, notifications, profile)
- `(seller)/` - Seller bottom tab navigation (dashboard, products, orders, analytics)

### Key Route Files
- `app/_layout.tsx` - Root layout with all providers (AuthProvider, CartProvider, etc.)
- `app/(tabs)/_layout.tsx` - Buyer tab bar configuration
- `app/(seller)/_layout.tsx` - Seller tab bar configuration
- `app/(auth)/_layout.tsx` - Auth stack configuration

### Navigation Flow
1. App starts at `(auth)` group (configured in `unstable_settings.initialRouteName`)
2. AuthGuard redirects authenticated users to appropriate group:
   - Sellers → `/(seller)/dashboard`
   - Buyers → `/(tabs)/`
3. Unauthenticated users trying to access protected routes are redirected to sign-in

---

## Authentication & Authorization

### Auth Flow
1. Firebase Auth with Email/Password
2. Auth persistence via AsyncStorage (native)
3. User data stored in Firestore `users` collection
4. Smart redirect based on `userType` (buyer/seller/both)

### User Types
- `buyer` - Can only buy food
- `seller` - Can sell food (has seller dashboard)
- `both` - Can do both (switches between modes)

### AuthService Features
- Automatic user document creation on signup
- Cache + mock data fallback for offline/timeout scenarios
- Turkish error messages for auth errors
- Email-based smart user type detection (emails containing "satici" or "seller" become sellers)

### AuthGuard Behavior
- Blocks access to protected routes for unauthenticated users
- Redirects authenticated users away from auth screens
- Shows loading state while auth initializes
- Uses cached user data for instant redirects

---

## Firebase Configuration

### Project
- **Project ID**: `cazi-app`
- **Auth Domain**: `cazi-app.firebaseapp.com`

### Services Used
- **Authentication**: Email/Password provider
- **Firestore**: Main database (users, foods, orders, reviews, chats, messages)
- **Storage**: Image uploads (profile pictures, meal images, identity documents)

### Collections
| Collection | Description |
|------------|-------------|
| `users` | User profiles with type and settings |
| `foods` | Meal listings with seller info |
| `orders` | Order records with status tracking |
| `reviews` | Reviews and ratings for meals |
| `chats` | Chat room metadata |
| `messages` | Individual chat messages |

### Storage Rules Summary
- `/users/{userId}/profile/**` - Public read, owner-only write
- `/meals/{mealId}/**` - Public read, authenticated write
- `/identity/{userId}/**` - Owner-only read/write

---

## Internationalization (i18n)

### Supported Countries
- **Turkey (TR)**: Turkish language, ₺ currency, Turkish business compliance
- **United Kingdom (UK)**: English language, £ currency, UK food business compliance

### Compliance Differences
| Feature | Turkey | UK |
|---------|--------|-----|
| Allergens | 14 major (Turkish Food Safety Law) | 14 major (Natasha's Law) |
| Business Docs | Gıda İşletme Belgesi, Vergi Levhası, KVKK | Council Registration, Hygiene Rating, Allergen Declaration, Public Liability Insurance |
| Compliance | Optional | Mandatory for sellers |

### Translation System
- Translations in `src/i18n/translations.ts`
- Hook: `useTranslation()` returns `t(key)` function
- Country context in `CountryContext` with currency and locale info

---

## Theme System

### Colors
Primary palette uses sage green (`#8B9D8A`) with warm beige background (`#E8E6E1`).

### Color Schemes
- `light` - Default light theme
- `dark` - Dark mode support

### Theme Tokens
- `Colors` - Color palette
- `Typography` - Font sizes and weights
- `Spacing` - Spacing scale (xs, sm, md, lg, xl, xxl)
- `commonStyles` - Shadow, borderRadius, flex utilities

---

## Testing Strategy

### Current Setup
- **Framework**: Jest with jest-expo preset
- **Command**: `npm run test` (watch mode)

### Test Conventions
- Place tests next to source files or in `__tests__` directories
- Use `*.test.ts` or `*.test.tsx` naming

### No Tests Currently
The project currently has no test files. When adding tests:
1. Test service functions with mocked Firebase
2. Test component rendering with React Native Testing Library
3. Test hooks in isolation

---

## Development Conventions

### Adding a New Screen
1. Create screen component in `src/features/{feature}/screens/`
2. Export from `src/features/{feature}/screens/index.ts`
3. Create route file in `app/` or appropriate route group
4. Add screen configuration to `app/_layout.tsx` Stack if needed

### Adding a New Service
1. Create service class in `src/services/{name}Service.ts`
2. Export singleton instance
3. Handle Firebase errors with user-friendly messages
4. Add timeout handling for network resilience

### Adding a New Component
1. Create in appropriate `src/components/{category}/` folder
2. Export from `src/components/{category}/index.ts`
3. Use theme tokens for styling
4. Define TypeScript interface for props

---

## Security Considerations

### ⚠️ Important Notes

1. **Firebase Config is Hardcoded**
   - API keys are in `src/config/firebase.ts` and `firebaseWeb.ts`
   - These are client-side keys (acceptable for Firebase)
   - Do NOT expose server secrets in this file

2. **Payment Service is Mock Only**
   - `src/services/paymentService.ts` is a demo stub
   - Do NOT use for real transactions
   - Integrate with real payment provider (Stripe, etc.) for production

3. **Storage Rules**
   - Profile/meal images are publicly readable
   - Identity documents are private to owner
   - Review `storage.rules` before production

4. **Notifications**
   - Only local notifications are implemented
   - Push notifications require backend FCM integration

---

## Debugging Resources

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Auth not working | See `DEBUG_AUTH.md` for Firebase Auth troubleshooting |
| Cache issues | See `CLEAR_CACHE.md` for cache clearing steps |
| Firestore timeout | Normal in Expo Go; mock data fallback activates automatically |
| Routing issues | Check `ROUTES.md` for route structure |

### Debug Commands
```bash
# Clear Metro cache and start
npx expo start --clear

# With specific port
npx expo start --clear --port 8082

# Check Firebase logs
npx firebase login
npx firebase projects:list
```

### Test Accounts
```
Buyer: test@cazi.com / 123456
Seller: satici@cazi.com / 123456
```

---

## Deployment

### Web Deployment (Firebase Hosting)
```bash
npm run firebase:deploy
```
This runs `expo export --platform web` then deploys to Firebase.

### Mobile Deployment
- iOS: Build with EAS or Xcode
- Android: Build APK/AAB with EAS or Android Studio

---

## Useful Documentation Files

| File | Purpose |
|------|---------|
| `README.md` | User-facing quick start |
| `ROUTES.md` | Navigation structure reference |
| `DEBUG_AUTH.md` | Firebase Auth troubleshooting (Turkish) |
| `CLEAR_CACHE.md` | Cache clearing guide (Turkish) |
| `storage.rules` | Firebase Storage security rules |

---

## Quick Reference

### Start Developing
```bash
npm install
npm run start
```

### Add a New Feature
1. Add screens to `src/features/{feature}/screens/`
2. Add routes to `app/` or route group
3. Add service methods to `src/services/`
4. Update `AGENTS.md` if needed

### Troubleshooting Checklist
- [ ] `npm install` completed successfully
- [ ] Firebase Auth enabled in console
- [ ] Test user created in Firebase
- [ ] Metro cache cleared (`--clear` flag)
- [ ] Check console for error messages
