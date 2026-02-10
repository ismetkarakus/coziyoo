# Coziyoo (Cazi) Memory Bank - Brief

## Project Overview
**Coziyoo (Cazi)** is a home-cooked food marketplace mobile application built with **Expo** and **React Native**. It connects buyers looking for homemade meals with sellers (home cooks) who want to sell their food.

### Key Features
- **Buyer Flow**: Browse meals, add to cart, place orders, track status, chat with sellers.
- **Seller Flow**: Manage listings, track orders, view earnings, manage wallet.
- **Dual User Support**: Users can be buyers, sellers, or both.
- **Internationalization**: Supports Turkey (TR) and United Kingdom (UK) with different compliance requirements.
- **Real-time Chat**: Built-in messaging between buyers and sellers.
- **Payment Integration**: Mock/demo payment system.

## Technology Stack
- **Framework**: Expo ~54.0.31 + React Native 0.81.5
- **Navigation**: expo-router ~6.0.21 (file-based routing)
- **Language**: TypeScript 5.x (strict mode)
- **Backend**: Firebase (Auth, Firestore, Storage)
- **State Management**: React Context API
- **Styling**: React Native StyleSheet + Custom Theme

## Project Structure
- `app/`: Expo Router screens (file-based routing)
  - `(auth)/`: Auth route group
  - `(buyer)/`: Buyer tab navigation
  - `(seller)/`: Seller route group
- `src/`: Source code
  - `components/`: UI and layout components
  - `config/`: Firebase and country configurations
  - `context/`: Auth, Cart, Country, Notification, Wallet contexts
  - `services/`: API and Firebase service logic
  - `theme/`: Styling tokens

## Development Rules
- **TypeScript**: Strict mode, interfaces over types, explicit return types.
- **Naming**: PascalCase for components, camelCase for files/utilities.
- **Imports**: React/Expo -> Libraries -> Absolute (@/*) -> Relative.
- **Routing**: Use route groups for auth, buyer (buyer), and seller.
- **i18n**: Support TR and UK locales via `CountryContext` and `useTranslation`.
