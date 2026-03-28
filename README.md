# PersonalCloud

Access files from your home server anywhere with PersonalCloud.

A self-hosted cloud storage system with two components:

- **Frontend** (Next.js) — Web UI deployed to Vercel/cloud. Handles auth, server directory, and file browsing.
- **Backend** (Express) — Runs on your machine. Serves your actual files with UPnP/NAT-PMP auto port forwarding.

## Quick Start

### Frontend (Cloud)

```bash
cd frontend
cp .env.example .env    # Edit with your database URL and JWT secret
npm install
docker compose up -d db # Start PostgreSQL
npx prisma migrate deploy
npm run dev
```

### Backend (Your Machine)

```bash
cd backend
cp .env.example .env    # Add SERVER_ID and API_KEY from the web UI
npm install
npm run dev
```

1. Register at the frontend, go to Settings > Servers, add a server
2. Copy the `SERVER_ID` and `API_KEY` into the backend's `.env`
3. Start the backend — it auto-connects via UPnP and sends heartbeats
4. Browse your files from anywhere

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | Next.js 16, Tailwind CSS, TypeScript |
| Backend | Express 5, TypeScript |
| Database | PostgreSQL 17 via Prisma ORM |
| Auth | Custom JWT (jose) |
| NAT Traversal | UPnP / NAT-PMP (nat-api) |
