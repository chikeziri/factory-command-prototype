# Factory Command — Demo Deployment Guide

Use this checklist to deploy the live demo for client presentations.

## What gets deployed

| Part | Platform | Folder |
|------|----------|--------|
| Frontend (React PWA) | Vercel | `frontend/` |
| Backend (Node API) | Railway | `backend/` |
| Database | Railway PostgreSQL | linked to backend |

## 1. Push to GitHub

The repo should contain both `frontend/` and `backend/` folders.

## 2. Deploy backend on Railway

1. Create a new project on [Railway](https://railway.app)
2. Add **PostgreSQL** service
3. Add a **GitHub repo** service pointing to this repository
4. Set the service **root directory** to `backend`
5. Add environment variables:

```
DATABASE_URL=<from Railway PostgreSQL>
JWT_SECRET=<generate a long random string>
CLIENT_URL=https://your-vercel-app.vercel.app
DEMO_MODE=true
NODE_ENV=production
PORT=3001
```

6. Deploy — Railway runs migrations, seeds demo data, and starts the API
7. Copy your public Railway URL (e.g. `https://factory-command-api.up.railway.app`)
8. Verify: open `https://YOUR-RAILWAY-URL/health`

## 3. Deploy frontend on Vercel

1. Import the GitHub repo on [Vercel](https://vercel.com)
2. Set **root directory** to `frontend`
3. Add environment variable:

```
VITE_API_URL=https://YOUR-RAILWAY-URL
```

4. Deploy
5. Go back to Railway and update `CLIENT_URL` to your Vercel URL, then redeploy backend

## 4. Demo login credentials

| Email | Role | Password |
|-------|------|----------|
| owner@factory.ng | Factory Owner | demo123 |
| manager@factory.ng | Factory Manager | demo123 |
| operator@factory.ng | Machine Operator | demo123 |

## 5. Demo talking points

- Dashboard shows live KPIs, attendance, machines, inventory, and finance
- Real-time updates every 5 seconds (machines, sensors, access logs, alerts)
- Modules: Attendance, Access Control, Production, Inventory, Environment, Assets, ERP, Alerts, Reports
- Mobile-friendly PWA — installable on phone/tablet

## 6. Local development

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

Open http://localhost:5173 and log in with demo credentials.

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Login fails | Check `VITE_API_URL` matches Railway URL exactly |
| CORS errors | Set `CLIENT_URL` on Railway to your Vercel URL |
| Empty dashboard | Confirm `DEMO_MODE=true` and check Railway logs for seed output |
| Socket not connecting | Ensure `VITE_API_URL` is set (not empty) on Vercel |
| 500 on KPIs | Redeploy backend after database migration completes |
