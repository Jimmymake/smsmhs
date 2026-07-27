# SemaSMS backend

This repository now deploys the SemaSMS API and MongoDB database only. The user
interface lives in the ShilingiBet dashboard under `/agent/sms`.

## Required backend environment

Copy `.env.example` to `.env` and configure:

- `MONGO_URI`
- `SEMASMS_USERNAME`, `SEMASMS_PASSWORD`, and `SEMASMS_SENDER_ID`
- `BET_DASH_JWT_SECRET` with the same value as `JWT_SECRET` in `shilingi-back`
- `CORS_ALLOWED_ORIGINS` with the bet-dash frontend origin(s), comma separated

## Run locally

Start MongoDB, then:

```bash
npm install
npm run dev
```

The API runs at `http://localhost:3002` by default. Set this URL as
`VITE_SMS_API_URL` in bet-dash.

## Run with Docker

```bash
docker compose up --build -d
```

Docker exposes the backend at `http://localhost:3010`. The frontend is no longer
built or served by this Compose stack.

The health endpoint remains public at `GET /api/health`. All `/api/sms/*`
endpoints require a valid ShilingiBet staff bearer token.
