# Firebase Removal Plan (Prep for Supabase)

## Goals
- Remove Firebase SDK usage, config, and scripts.
- Keep app compiling with temporary stubs/mocks.
- Prepare clean seam for later Supabase integration.

## Scope (current Firebase touchpoints)
- Config: `src/config/firebase.ts`, `src/config/firebaseWeb.ts`
- Services: `src/services/authService.ts`, `src/services/searchService.ts`, `src/services/storageService.ts`, `src/services/firebaseService.ts`
- Utilities: `src/utils/firebaseUtils.ts`, `src/utils/seedData.ts`
- Context/guards: `src/context/AuthContext.tsx`, `src/components/auth/AuthGuard.tsx`
- App screens referencing Firebase data (`src/features/**`)
- Build/config: `firebase.json`, `firestore.rules`, `firestore.indexes.json`, `storage.rules`
- Native configs: `google-services.json`, `GoogleService-Info.plist`
- Docs: `README.md`, `FIREBASE_AUTH_SETUP.md`, `FIREBASE_GUIDE.md`, `DEBUG_AUTH.md`, `Documents/Flow.md`, `AGENTS.md`
- Package deps/scripts: `firebase`, `firebase-tools` and `firebase:*` npm scripts

## Plan
1) Inventory and freeze touchpoints
   - Confirm all imports of `firebase/*` and `@react-native-firebase/*`.
   - List all service calls used in UI screens to avoid missing replacements.

2) Create temporary backend adapters (to keep build green)
   - Add `src/services/backend/` with mock interfaces: `auth`, `db`, `storage`.
   - Provide no-op or AsyncStorage-backed implementations to match current return shapes.

3) Remove Firebase config and SDK usage
   - Delete Firebase config files in `src/config/`.
   - Replace imports in services with adapter interfaces.
   - Remove `src/utils/firebaseUtils.ts` and any Firebase-specific helpers.

4) Refactor auth and data flows to adapters
   - Update `AuthContext` + `AuthGuard` to use adapter auth.
   - Update services (auth, search, storage, food/orders/chats/reviews) to use adapters.

5) Clean up UI screens
   - Remove “Firebase reset/online” UI and references.
   - Ensure screens use mock/local data sources until Supabase is added.

6) Remove Firebase build and native config
   - Delete `firebase.json`, rules/indexes, and Google service files.
   - Remove related scripts from `package.json`.

7) Update docs
   - Replace Firebase references with “backend pending / Supabase planned”.
   - Add a migration note in `README.md` and `Documents/Flow.md`.

8) Verify
   - `npm run lint` (if present) and `npm run start`.
   - Navigate auth flows, buyer/seller flows, storage upload placeholders.

## Risk Checklist
- Auth guard redirect logic depends on user profile data shape.
- Screens expect Firestore IDs and timestamps; keep consistent mock shapes.
- Storage upload URLs used in UI; return stable placeholder URLs.
- Search service uses Firestore query API; replace with in-memory filter.

## Follow-up for Supabase
- Map collections (`users`, `foods`, `orders`, `reviews`, `chats`, `messages`) to Supabase tables.
- Replace adapters with Supabase client implementation.
- Revisit auth caching + offline fallback strategy.
