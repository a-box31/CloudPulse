# cloudpulse

Access files from your home server anywhere with cloudpulse.

A self-hosted cloud storage system with two components:

- **Frontend** (Next.js) — Web UI deployed to Vercel/cloud or run via Docker. Handles auth, server directory, and file browsing.
- **Backend** (Express) — Runs on your machine via Docker. Serves your actual files with UPnP/NAT-PMP auto port forwarding.

## Quick Start (Docker)

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/) installed on each machine

### Frontend (Cloud / VPS)

```bash
cd frontend
cp .env.example .env    # Edit with your database URL and JWT secret
docker compose up -d
```

This starts both the **PostgreSQL** database and the **Next.js frontend** behind a single `docker compose up`. Migrations run automatically on startup.

### Backend (Your Machine)

```bash
cd backend
cp .env.example .env    # Add SERVER_ID and API_KEY from the web UI
docker compose up -d
```

### Setup

1. Register at the frontend, go to **Settings > Servers**, and add a server.
2. Copy the `SERVER_ID` and `API_KEY` into the backend's `.env`.
3. Start the backend — it auto-connects via UPnP and sends heartbeats.
4. Browse your files from anywhere.

## Development (without Docker)

If you prefer running things directly:

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
docker compose up -d db   # Start only PostgreSQL
npx prisma migrate deploy
npm run dev
```

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

## Project Structure

```
cloudpulse/
├── cloudpulse/
│   ├── Dockerfile
│   ├── docker-compose.yml   # Frontend + PostgreSQL
│   ├── .env.example
│   └── ...
├── server/
│   ├── Dockerfile
│   ├── docker-compose.yml   # Backend only
│   ├── .env.example
│   └── ...
└── README.md
```

## Tech Stack

| Layer          | Choice                          |
| -------------- | ------------------------------- |
| Frontend       | Next.js 16, Tailwind CSS, TypeScript |
| Backend        | Express 5, TypeScript           |
| Database       | PostgreSQL 17 via Prisma ORM    |
| Auth           | Custom JWT (jose)               |
| NAT Traversal  | UPnP / NAT-PMP (nat-api)       |
| Containerization | Docker, Docker Compose        |
