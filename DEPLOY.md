# SIFOS — Demo Deployment Guide

Smart Integrated Factory Operations System — deployment checklist for client presentations.

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
7. Copy your public Railway URL (e.g. `https://sifos-api.up.railway.app`)
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

## 5. Local testing (PowerShell)

### Start database

```powershell
cd c:\Users\HomePC\Documents\Jobs\factory-command-prototype
docker compose up -d
```

### Backend (Terminal 1)

```powershell
cd c:\Users\HomePC\Documents\Jobs\factory-command-prototype\backend
$env:NODE_TLS_REJECT_UNAUTHORIZED="0"
npx prisma migrate deploy
npm run db:seed
npm run dev
```

### Frontend (Terminal 2)

```powershell
cd c:\Users\HomePC\Documents\Jobs\factory-command-prototype\frontend
npm run dev
```

Open http://localhost:5173

## 6. Troubleshooting

| Problem | Fix |
|---------|-----|
| `Authentication failed` on startup | Run `docker compose up -d` and use the `DATABASE_URL` in `backend/.env` |
| Login fails | Check `VITE_API_URL` matches Railway URL exactly |
| CORS errors | Set `CLIENT_URL` on Railway to your Vercel URL |
| Empty dashboard | Confirm `DEMO_MODE=true` and run `npm run db:seed` |
| Socket not connecting | Ensure `VITE_API_URL` is set on Vercel |
