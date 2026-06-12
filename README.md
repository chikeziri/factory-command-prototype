# SIFOS — Smart Integrated Factory Operations System

A unified cloud-based platform for factory management: access control, attendance, production machines, inventory, environmental sensors, company assets, and ERP — all in one dashboard.

**Live demo stack:** React PWA on Vercel + Node API on Railway + PostgreSQL

> Full deployment steps: see [DEPLOY.md](./DEPLOY.md)

## Architecture

- **Frontend:** React 18 PWA (Vercel)
- **Backend:** Node.js + Express + Prisma (Railway)
- **Database:** PostgreSQL (Railway managed)
- **Real-time:** Socket.io
- **Demo Mode:** Auto-generates live sensor and machine data

## Quick Start (Local)

### 1. Start PostgreSQL (Docker)

```powershell
cd c:\Users\HomePC\Documents\Jobs\factory-command-prototype
docker compose up -d
```

### 2. Backend

```powershell
cd backend
cp .env.example .env
npm install
$env:NODE_TLS_REJECT_UNAUTHORIZED="0"
npx prisma migrate deploy
npm run db:seed
npm run dev
```

### 3. Frontend

```powershell
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

## Demo Accounts

| Email | Role | Password |
|-------|------|----------|
| owner@factory.ng | Factory Owner | demo123 |
| manager@factory.ng | Factory Manager | demo123 |
| operator@factory.ng | Machine Operator | demo123 |

## Features

- Real-time machine telemetry with OEE calculation
- Environmental sensor monitoring with threshold alerts
- Attendance system with clock in/out
- Access control with remote unlock
- Inventory management with low-stock alerts
- ERP: Chart of Accounts, Journal Entries, Trial Balance, P&L
- Role-based access control
- Mobile-responsive PWA
- Live demo data simulator

## Project Structure

```
factory-command-prototype/
├── backend/          # Express API + Prisma + Socket.io
├── frontend/         # React PWA dashboard
├── docker-compose.yml
├── DEPLOY.md         # Step-by-step demo deployment
└── README.md
```

## License

Proprietary — SIFOS
