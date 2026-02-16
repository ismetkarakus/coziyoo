# Coziyoo API Server (PostgreSQL)

This server exposes the same endpoint contract used by the mobile/web app services:
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me/:uid`
- `GET /foods`
- `POST /foods`
- `GET /foods/:id`
- `POST /orders`
- `GET /orders?userId=...&type=buyer|seller`
- `PUT /orders/:id/status`
- `GET /chats?userId=...`
- `POST /chats`
- `GET /chats/:id/messages`
- `POST /chats/:id/messages`
- `POST /reviews`
- `GET /reviews?foodId=...`
- `GET /health`

## Run
```bash
npm run server
```

## Required env
- `DATABASE_URL` (or `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`)
- `API_PORT` (default: `4000`)
- `PGSSL=true|false` (default: `false`)
- `AUTO_SEED_MOCK=true|false` (default: `true`)

## Notes
- Schema is auto-created on server startup.
- If DB is empty and `AUTO_SEED_MOCK=true`, seed data is imported from `src/mock/*.json`.
