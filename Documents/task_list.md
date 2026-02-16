# Coziyoo Prototype Task List

Date: 2026-02-02
Source: Improvement Plan.md

## Phase 1: Foundation (Week 1)
- [x] Refactor Firestore data model (users/foods/orders/transactions)
- [x] Update Firestore security rules for prototype
- [x] Unify Firebase SDK usage to v9+ modular
- [x] Implement enhanced translation structure (TR/EN)
- [x] Add language detection (saved > country > device)
- [x] Build Language Switcher UI component
- [x] Update screens to use translation keys (replace hardcoded text)

## Phase 2: Admin Panel (Week 2)
- [x] Scaffold admin-panel React app (TypeScript)
- [ ] Configure Firebase Admin SDK access
- [ ] Build Dashboard (real-time stats)
- [ ] Build User Management (filter/suspend)
- [ ] Build Seller Approval workflow
- [ ] Build Order Monitor + basic analytics
- [ ] Deploy admin panel to Firebase Hosting

## Phase 3: Polish & Testing (Week 3)
- [ ] Test language switching across all screens
- [ ] Test seller-buyer flow end-to-end
- [ ] Test admin panel operations end-to-end
- [ ] Fix bugs and optimize performance
- [ ] Update documentation (API + admin guide)

## Quick Start / Ops
- [ ] Deploy Firestore rules
- [ ] Add i18n extraction script (if needed)
- [ ] Add admin start script (port 3001)

## Decisions / Review
- [ ] Review plan with stakeholders
- [ ] Re-prioritize features if timeline is tight
