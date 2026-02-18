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
- `POST /media/register`
- `GET /media/:id`
- `GET /health`

## Run
```bash
npm run server
```

## Required env
- `DATABASE_URL` (or `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`)
- `API_PORT` (default: `4000`)
- `PGSSL=true|false` (default: `false`)
- `STORAGE_PROVIDER=mock|firebase` (firebase placeholder, currently falls back to mock)
- `PG_SEARCH_PATH` (default: `public`)

## Notes
- Schema is auto-created on server startup.
- DB-only mode is enabled; JSON mock seed import has been removed.
- Storage is provider-agnostic. Current `mock` provider stores media metadata and returns placeholder URLs.
