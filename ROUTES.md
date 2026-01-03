# Cazi App Navigation Map

## Route Structure

The app uses expo-router with route groups for clean organization:

### Root Stack
- `app/_layout.tsx` - Main app layout with theme provider
- `app/modal.tsx` - Modal screen
- `app/+not-found.tsx` - 404 screen

### Route Groups

#### 1. Buyer Tabs - `app/(tabs)/`
Bottom tab navigation for buyers:
- **Home** (`index.tsx`) - Main landing page
- **Explore** (`explore.tsx`) - Product discovery
- **Cart** (`cart.tsx`) - Shopping cart
- **Notifications** (`notifications.tsx`) - User notifications
- **Profile** (`profile.tsx`) - User profile and settings

#### 2. Authentication Stack - `app/(auth)/`
Authentication flow:
- **Sign In** (`sign-in.tsx`) - User login
- **Sign Up** (`sign-up.tsx`) - User registration
- **Forgot Password** (`forgot-password.tsx`) - Password reset

#### 3. Seller Tabs - `app/(seller)/`
Bottom tab navigation for sellers:
- **Dashboard** (`dashboard.tsx`) - Seller overview
- **Products** (`products.tsx`) - Product management
- **Orders** (`orders.tsx`) - Order management
- **Analytics** (`analytics.tsx`) - Sales analytics

## Navigation Features

### Theme Integration
- All layouts use centralized theme system
- Dark/light mode support
- Consistent colors and styling

### Layout Components
- **TopBar** - Consistent header across screens
- Safe area handling
- Status bar configuration

### Route Groups Benefits
- Clean URL structure
- Logical feature separation
- Easy to extend and maintain
- Type-safe navigation

## Future Extensions

The route structure supports easy addition of:
- Product detail screens
- Checkout flow
- Chat screens
- Settings screens
- Admin panels

## File Organization

```
app/
├── _layout.tsx          # Root layout
├── (tabs)/              # Buyer navigation
│   ├── _layout.tsx      # Tab layout
│   ├── index.tsx        # Home
│   ├── explore.tsx      # Explore
│   ├── cart.tsx         # Cart
│   ├── notifications.tsx # Notifications
│   └── profile.tsx      # Profile
├── (auth)/              # Authentication
│   ├── _layout.tsx      # Auth stack
│   ├── sign-in.tsx      # Sign in
│   ├── sign-up.tsx      # Sign up
│   └── forgot-password.tsx # Password reset
├── (seller)/            # Seller navigation
│   ├── _layout.tsx      # Seller tabs
│   ├── dashboard.tsx    # Dashboard
│   ├── products.tsx     # Products
│   ├── orders.tsx       # Orders
│   └── analytics.tsx    # Analytics
├── modal.tsx            # Modal screen
└── +not-found.tsx       # 404 screen
```

