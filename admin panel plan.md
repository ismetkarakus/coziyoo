# Admin Panel Plan - Task List

## Completed
- [x] Review existing `admin-panel` implementation and routes
- [x] Audit current data sources (Firebase + mock JSON)
- [x] Inspect backend API capabilities and gaps
- [x] Define V1 scope decisions (Core Ops, API JWT RBAC, Full CRUD, hard delete, realtime, audit, big-bang cutover)
- [x] Produce decision-complete implementation plan

## Pending - Backend
- [x] Add admin auth endpoints: `POST /admin/auth/login`, `GET /admin/auth/me`
- [x] Implement RBAC middleware for all `/admin/*` routes
- [ ] Add admin CRUD endpoints for users, sellers, foods, orders, chats, reviews, media (partial: read endpoints + order status update shipped)
- [ ] Add dashboard endpoints: summary, alerts, activity (partial: summary shipped at `GET /admin/dashboard`)
- [ ] Add WebSocket endpoint `/admin/ws` with event contracts
- [ ] Add `admin_audit_logs` table and write-on-mutation logging
- [ ] Add indexes for admin filtering/sorting performance
- [ ] Add backend tests for auth/RBAC, CRUD, audit, realtime

## Pending - Frontend (admin-panel)
- [x] Remove Firebase/mock JSON dependencies from admin pages
- [ ] Create API client layer with JWT handling (partial: API client shipped without JWT)
- [ ] Add React Query data layer and cache invalidation
- [ ] Implement protected routes + permission-aware navigation
- [ ] Build shared components: `EntityTable`, `EntityForm`, danger confirm modal, audit drawer (partial: reusable `EntityTablePage` shipped)
- [ ] Implement modules in priority order:
  - [x] Orders (first)
  - [x] Sellers (second)
  - [x] Users
  - [x] Foods/Reviews
  - [x] Chats/Media + dashboard polish
- [ ] Add WebSocket subscription integration for realtime UI updates
- [ ] Add frontend tests (guards, query state, mutation flows, error handling)

## Pending - Release/Cutover
- [ ] Configure env vars for admin panel and backend JWT/CORS
- [ ] Execute big-bang cutover from current admin routes
- [ ] Run UAT scenarios and sign off
