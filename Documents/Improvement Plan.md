# Coziyoo Prototype Improvement Plan

> **Goal:** Fast-to-market prototype implementation for Proof of Concept (PoC)
> **Document Version:** 1.0
> **Date:** 2026-02-02

---

## Executive Summary

This plan outlines the technical approach to rapidly prototype three core improvements:
1. **Database Architecture** - Optimized for quick development while maintaining scalability path
2. **Admin Panel** - Web-based management system for monitoring seller-buyer flows
3. **Multi-Language Support** - Location-aware language switching (Turkish/English)

---

## 1. Database Approach

### Current State
- Using Firebase Firestore (NoSQL)
- Collections: `users`, `meals`, `orders`, `chats`, `messages`
- Mixed use of Firebase SDK versions

### Recommended Approach: **Hybrid Firebase Strategy**

For a **fast prototype**, stick with Firebase but optimize the architecture:

#### 1.1 Keep Firebase Firestore (Pros for Prototype)
| Advantage | Why It Matters |
|-----------|----------------|
| Real-time | Instant order updates, chat messages |
| Auth Built-in | Authentication handled in hours, not days |
| Offline Support | Works without internet (important for mobile) |
| Free Tier | Generous Spark plan for prototyping |
| Cloud Functions | Serverless backend logic |

#### 1.2 Data Model Improvements for Seller-Buyer Flow

```
users (collection)
  ├── userId (document)
  │     ├── role: 'buyer' | 'seller' | 'admin'
  │     ├── profile: {...}
  │     ├── sellerStatus: 'pending' | 'approved' | 'suspended'
  │     ├── compliance: {...}  // UK council reg, TR food license
  │     └── stats: {totalOrders, rating, etc.}

foods (collection) [rename from meals]
  ├── foodId (document)
  │     ├── sellerId (ref)
  │     ├── status: 'active' | 'sold_out' | 'paused'
  │     ├── pricing: {amount, currency}
  │     └── availability: {...}

orders (collection)
  ├── orderId (document)
  │     ├── buyerId (ref)
  │     ├── sellerId (ref)
  │     ├── items: [...]
  │     ├── status: 'pending' → 'confirmed' → 'preparing' → 'ready' → 'completed'
  │     ├── timeline: [...]  // status history
  │     ├── payment: {...}
  │     └── dispute: {...}   // if any issue

transactions (collection) [NEW - for financial tracking]
  ├── transactionId
  │     ├── orderId (ref)
  │     ├── type: 'order_payment' | 'seller_payout' | 'refund'
  │     ├── amount
  │     ├── status: 'pending' | 'completed' | 'failed'
  │     └── platformFee: number  // % commission
```

#### 1.3 Firebase Security Rules (Quick Implementation)

```javascript
// firestore.rules - Quick but secure for prototype
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    
    // Sellers manage their own foods
    match /foods/{foodId} {
      allow read: if true;  // Public
      allow write: if request.auth != null && 
                      resource.data.sellerId == request.auth.uid;
    }
    
    // Orders - both buyer and seller can read
    match /orders/{orderId} {
      allow read: if request.auth != null && 
                    (resource.data.buyerId == request.auth.uid ||
                     resource.data.sellerId == request.auth.uid);
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
                       (resource.data.sellerId == request.auth.uid ||
                        resource.data.buyerId == request.auth.uid);
    }
  }
}
```

#### 1.4 Future Scaling Path (Post-Prototype)

If the PoC succeeds and you need to scale:

| Phase | When | Action |
|-------|------|--------|
| Phase 1 | Now | Firebase Firestore (current) |
| Phase 2 | >1000 daily orders | Add Redis for caching hot data |
| Phase 3 | >10k daily orders | Migrate transactional data to PostgreSQL via Supabase |
| Phase 4 | >100k daily orders | Microservices + dedicated DB per service |

---

## 2. Admin Panel Implementation

### Current State
- Basic `AdminPanel.tsx` screen in mobile app
- Only seller approval workflow
- Mock data only

### Recommended Approach: **Separate Web Admin (React + Firebase Admin SDK)**

#### 2.1 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    ADMIN PANEL (Web)                        │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │   Dashboard  │ │   User Mgmt  │ │ Order Monitor│        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │   Analytics  │ │  Disputes    │ │  Compliance  │        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Firebase Admin SDK (Node.js)                   │
│         - User impersonation                                │
│         - Cross-user data access                            │
│         - Custom claims (admin role)                        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Firebase Services                        │
│     Firestore ◄────► Auth ◄────► Storage ◄────► Functions   │
└─────────────────────────────────────────────────────────────┘
```

#### 2.2 Admin Panel Structure (New Folder)

```
admin-panel/                          # Separate React app
├── public/
├── src/
│   ├── components/
│   │   ├── Layout/
│   │   ├── Dashboard/
│   │   ├── Users/
│   │   ├── Orders/
│   │   ├── Sellers/
│   │   └── Analytics/
│   ├── hooks/
│   │   ├── useAdminAuth.ts
│   │   ├── useFirestore.ts
│   │   └── useAnalytics.ts
│   ├── services/
│   │   ├── adminService.ts       # Firebase Admin SDK
│   │   ├── userService.ts
│   │   ├── orderService.ts
│   │   └── sellerService.ts
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Users.tsx
│   │   ├── Orders.tsx
│   │   ├── Sellers.tsx
│   │   └── Disputes.tsx
│   ├── utils/
│   └── App.tsx
├── package.json
└── firebase.json                   # Hosting config
```

#### 2.3 Core Features for Prototype

| Feature | Priority | Description |
|---------|----------|-------------|
| **Dashboard** | P0 | Real-time stats: active users, pending orders, revenue |
| **User Management** | P0 | View all users, filter by role, suspend/activate |
| **Seller Approval** | P0 | Review compliance docs, approve/reject with reason |
| **Order Monitor** | P0 | View all orders, filter by status, intervene if stuck |
| **Dispute Resolution** | P1 | Handle buyer-seller conflicts, issue refunds |
| **Analytics** | P2 | Charts: daily orders, top sellers, popular foods |

#### 2.4 Key Admin Capabilities

```typescript
// Core admin operations (using Firebase Admin SDK)

// 1. Impersonate seller/buyer to debug issues
const impersonateUser = async (userId: string) => {
  // Generate custom token to login as user
  const customToken = await admin.auth().createCustomToken(userId);
  return customToken;
};

// 2. Force-cancel order and refund
const cancelAndRefundOrder = async (orderId: string) => {
  // Update order status
  // Process refund via payment provider
  // Notify both parties
};

// 3. Compliance enforcement
const suspendSeller = async (sellerId: string, reason: string) => {
  // Update user document
  // Send notification
  // Hide all their foods from search
};

// 4. Platform analytics
const getDailyStats = async (date: string) => {
  // Aggregate orders, revenue, new users
  // Return for dashboard charts
};
```

#### 2.5 Deployment Strategy

```bash
# Admin panel hosted on Firebase Hosting
# URL: https://admin.cazi-app.web.app

# Commands to deploy:
npm run build:admin      # Build admin panel
firebase deploy --only hosting:admin
```

---

## 3. Two-Language Support (TR/EN)

### Current State
- `translations.ts` with TR/EN keys
- `CountryContext` handles country detection (TR/UK)
- `useTranslation` hook for accessing translations
- Auto-detection based on device language

### Recommended Approach: **Enhanced i18n with Language Switcher**

#### 3.1 Enhanced Translation System

```typescript
// src/i18n/translations.ts - Extended Structure

export const translations = {
  tr: {
    // Navigation
    tabs: {
      home: 'Ana Sayfa',
      search: 'Ara',
      cart: 'Sepet',
      orders: 'Siparişler',
      profile: 'Profil',
    },
    
    // Auth
    auth: {
      welcome: 'Hoş Geldiniz',
      login: 'Giriş Yap',
      register: 'Kayıt Ol',
      email: 'E-posta',
      password: 'Şifre',
      forgotPassword: 'Şifremi Unuttum',
    },
    
    // Home
    home: {
      greeting: 'Merhaba {{name}}!',
      nearYou: 'Yakınınızdaki Yemekler',
      categories: 'Kategoriler',
      popular: 'Popüler',
    },
    
    // Food
    food: {
      addToCart: 'Sepete Ekle',
      ingredients: 'İçindekiler',
      allergens: 'Alerjenler',
      portions: 'Porsiyon',
      pickup: 'Gel Al',
      delivery: 'Teslimat',
    },
    
    // Order
    order: {
      status: {
        pending: 'Bekliyor',
        confirmed: 'Onaylandı',
        preparing: 'Hazırlanıyor',
        ready: 'Hazır',
        completed: 'Tamamlandı',
        cancelled: 'İptal Edildi',
      },
    },
    
    // Seller
    seller: {
      panel: 'Satıcı Paneli',
      addFood: 'Yemek Ekle',
      earnings: 'Kazançlar',
      orders: 'Gelen Siparişler',
      compliance: 'İş Yeri Belgeleri',
    },
    
    // Error messages
    errors: {
      networkError: 'İnternet bağlantınızı kontrol edin',
      serverError: 'Bir hata oluştu, lütfen tekrar deneyin',
      authError: 'Giriş bilgileriniz hatalı',
    },
  },
  
  en: {
    // Same structure as Turkish
    tabs: {
      home: 'Home',
      search: 'Search',
      cart: 'Cart',
      orders: 'Orders',
      profile: 'Profile',
    },
    // ... (full English translations)
  },
};
```

#### 3.2 Language Detection Priority

```typescript
// src/i18n/languageDetector.ts

export const detectLanguage = async (): Promise<'tr' | 'en'> => {
  // Priority 1: User's explicit selection (saved in AsyncStorage)
  const savedLanguage = await AsyncStorage.getItem('userLanguage');
  if (savedLanguage && ['tr', 'en'].includes(savedLanguage)) {
    return savedLanguage as 'tr' | 'en';
  }
  
  // Priority 2: Country context (from CountryContext)
  const countryLanguage = currentCountry.language;
  if (countryLanguage === 'tr' || countryLanguage === 'en') {
    return countryLanguage;
  }
  
  // Priority 3: Device locale
  const deviceLocale = Localization.locale; // 'tr-TR', 'en-GB', etc.
  const deviceLang = deviceLocale.split('-')[0];
  if (deviceLang === 'tr') return 'tr';
  if (deviceLang === 'en') return 'en';
  
  // Fallback
  return 'tr';
};
```

#### 3.3 Language Switcher UI Component

```typescript
// src/components/ui/LanguageSwitcher.tsx

export const LanguageSwitcher: React.FC = () => {
  const { currentLanguage, setLanguage } = useLanguage();
  
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[styles.button, currentLanguage === 'tr' && styles.active]}
        onPress={() => setLanguage('tr')}
      >
        <Text>🇹🇷 Türkçe</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.button, currentLanguage === 'en' && styles.active]}
        onPress={() => setLanguage('en')}
      >
        <Text>🇬🇧 English</Text>
      </TouchableOpacity>
    </View>
  );
};
```

#### 3.4 Enhanced Translation Hook

```typescript
// src/hooks/useTranslation.ts - Enhanced

import { useCallback } from 'react';
import { translations } from '../i18n/translations';

export const useTranslation = () => {
  const { currentLanguage } = useLanguage(); // New context for language
  
  const t = useCallback((
    key: string, 
    params?: Record<string, string | number>
  ): string => {
    // Navigate nested keys: 'auth.login' -> translations[lang].auth.login
    const keys = key.split('.');
    let value: any = translations[currentLanguage];
    
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) {
        // Fallback to Turkish if key missing
        value = translations.tr;
        for (const fk of keys) {
          value = value?.[fk];
        }
        break;
      }
    }
    
    // Replace params {{name}}
    if (typeof value === 'string' && params) {
      return value.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => 
        String(params[paramKey] ?? match)
      );
    }
    
    return value || key;
  }, [currentLanguage]);
  
  return { t, currentLanguage };
};
```

#### 3.5 RTL Support Consideration (Future)

For future expansion to Arabic/Hebrew:

```typescript
// src/i18n/config.ts

export const RTL_LANGUAGES = ['ar', 'he', 'fa'];

export const isRTL = (language: string): boolean => 
  RTL_LANGUAGES.includes(language);

// In app initialization:
I18nManager.forceRTL(isRTL(currentLanguage));
```

#### 3.6 Integration Points

Update these files for full i18n integration:

| File | Changes |
|------|---------|
| `CountryContext.tsx` | Sync country change with language |
| `Profile screen` | Add Language Switcher in settings |
| `Onboarding` | Show language selection on first launch |
| `All Screens` | Replace hardcoded text with `t('key')` |

---

## 4. Implementation Roadmap

### Phase 1: Foundation (Week 1)

| Day | Task | Deliverable |
|-----|------|-------------|
| 1-2 | Refactor Firestore data model | Updated collections, security rules |
| 3 | Fix Firebase SDK inconsistencies | Unified Firebase v9+ modular SDK |
| 4 | Implement enhanced translation system | New i18n structure, language switcher |
| 5 | Update all screens with translation keys | All text uses `t()` function |

### Phase 2: Admin Panel (Week 2)

| Day | Task | Deliverable |
|-----|------|-------------|
| 6-7 | Set up React admin panel project | Basic routing, Firebase Admin SDK |
| 8-9 | Build Dashboard + User Management | Real-time stats, user list |
| 10 | Seller Approval workflow | Compliance review, approve/reject |
| 11 | Order Monitor + basic analytics | Order list, status filters |
| 12 | Deploy admin panel to Firebase Hosting | Live admin URL |

### Phase 3: Polish & Testing (Week 3)

| Day | Task | Deliverable |
|-----|------|-------------|
| 13-14 | Test language switching TR/EN | All screens display correctly |
| 15 | Test seller-buyer flow | End-to-end order flow works |
| 16 | Test admin panel operations | All admin functions work |
| 17 | Bug fixes & performance | Optimized queries, fixed issues |
| 18 | Documentation | API docs, admin user guide |

---

## 5. Quick Start Commands

```bash
# 1. Database - Update Firebase rules
npx firebase deploy --only firestore:rules

# 2. Admin Panel - Setup
mkdir admin-panel && cd admin-panel
npx create-react-app . --template typescript
npm install firebase firebase-admin @mui/material @mui/icons-material recharts

# 3. Language files - Generate missing keys
npm run i18n:extract  # Custom script to find untranslated strings

# 4. Run everything
npm run start         # Mobile app
npm run admin:start   # Admin panel (port 3001)
```

---

## 6. Key Decisions Summary

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Database | Firebase Firestore | Fastest to implement, real-time, free tier |
| Admin Panel | Separate React web app | Better UX for management, secure with Admin SDK |
| Languages | TR/EN with auto-detect | Covers primary markets, easy to extend |
| Authentication | Firebase Auth | Built-in, supports social login |
| Hosting | Firebase Hosting | Free, automatic HTTPS, CDN |

---

## 7. Success Metrics for PoC

| Metric | Target |
|--------|--------|
| Admin can approve seller | < 2 clicks |
| Language switch | Instant, no restart |
| Order visibility | Real-time updates |
| Time to deploy prototype | < 3 weeks |

---

**Next Steps:**
1. Review this plan with stakeholders
2. Prioritize features if timeline is tight
3. Start with Phase 1 (Foundation) immediately

---

*Document created for Coziyoo prototype development.*
