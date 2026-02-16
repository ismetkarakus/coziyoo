# Agent DB Sync Rule

When any UI field is added, removed, renamed, or behavior is changed in forms/screens/components:

1. Update PostgreSQL schema/migrations in `server/migrations/`.
2. Update backend read/write mapping in `server/index.js` (and related scripts).
3. Update seed script in `server/scripts/seed-sample.js` if sample data shape changed.
4. Update API contracts/types used by frontend (`src/api`, `src/services`, relevant models).
5. Run and verify:
   - `npm run db:migrate`
   - `npm run db:seed` (if sample data impacted)
6. Document the field/schema change in `Documents/postgresql-schema-plan.md`.

Do not ship UI field changes without matching database and migration updates.
