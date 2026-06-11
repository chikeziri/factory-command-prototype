# Factory Command — Industrial Operations Platform

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

### Backend

```bash
cd backend
cp .env.example .env
npm install
npx prisma migrate deploy
npm run db:seed
npm run dev
```

### Frontend

```bash
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
├── DEPLOY.md         # Step-by-step demo deployment
└── README.md
```

## License

Proprietary — Factory Command Systems
