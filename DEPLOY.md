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
4. Set the backend service **root directory** to `backend`
5. Link the database to the backend service:
   - Open the **backend/API service** (not the Postgres service)
   - Go to **Variables**
   - Click **Add Reference** (or **New Variable** → **Reference**)
   - Select your **PostgreSQL** service
   - Choose **`DATABASE_URL`**
   - Save — Railway will create a reference like `${{Postgres.DATABASE_URL}}`
6. Add these variables on the **same backend service**:

```
JWT_SECRET=<generate a long random string>
CLIENT_URL=https://your-vercel-app.vercel.app
DEMO_MODE=true
NODE_ENV=production
PORT=3001
```

7. Deploy — Railway runs migrations, seeds demo data, and starts the API
8. Copy your public Railway URL (e.g. `https://sifos-api.up.railway.app`)
9. Verify: open `https://YOUR-RAILWAY-URL/health`

**Important:** `DATABASE_URL` must exist on the **backend service**. If it is only on the Postgres service, Prisma will fail with `Environment variable not found: DATABASE_URL`.

## 3. Deploy frontend on Vercel

### A. Create the project

1. Import the GitHub repo on [Vercel](https://vercel.com)
2. On the import screen, open **Configure Project**
3. Set these values:

| Setting | Value |
|---------|-------|
| Root Directory | `frontend` |
| Framework Preset | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

4. Before deploying, add this environment variable:

| Name | Value | Environments |
|------|-------|--------------|
| `VITE_API_URL` | `https://YOUR-RAILWAY-URL` | Production, Preview, Development |

**Rules for `VITE_API_URL`:**
- Use your public Railway URL exactly
- No trailing slash
- Example: `https://sifos-api-production.up.railway.app`
- Vite bakes this in at **build time** — if you change it later, you must **Redeploy**

5. Click **Deploy**

### B. Connect backend and frontend

1. Copy your live Vercel URL (example: `https://factory-command-prototype.vercel.app`)
2. On Railway backend service, set:

```
CLIENT_URL=https://YOUR-VERCEL-URL
```

3. Redeploy the Railway backend
4. Test in this order:
   - `https://YOUR-RAILWAY-URL/health` → should return JSON
   - Open your Vercel URL → login page should load
   - Login with `owner@factory.ng` / `demo123`

### C. If Vercel still fails

| Symptom | Fix |
|---------|-----|
| Build fails | Confirm root directory is `frontend`, not repo root |
| Login page loads but login fails | Set `VITE_API_URL` on Vercel, then **Redeploy** |
| Yellow warning on login page | `VITE_API_URL` was missing during the last build |
| CORS error in browser console | Set `CLIENT_URL` on Railway to your exact Vercel URL and redeploy backend |
| 404 on `/api/...` from Vercel domain | `VITE_API_URL` is wrong or missing — API calls must go to Railway, not Vercel |
| Blank page after deploy | Hard refresh, or clear site data / unregister service worker |
| Works locally, not on Vercel | Local uses Vite proxy; production needs `VITE_API_URL` |

### D. Deploy without GitHub (Vercel CLI)

Use this if Vercel will not connect to your GitHub repo.

1. Install and log in:

```powershell
npm install -g vercel
vercel login
```

2. Get your **public** Railway URL (not `.railway.internal`):
   - Railway → backend service → **Settings** → **Networking** → **Public Networking**
   - Copy the URL like `https://your-service.up.railway.app`

3. Deploy from the frontend folder:

```powershell
cd frontend
.\scripts\deploy-vercel.ps1 -ApiUrl "https://YOUR-PUBLIC-RAILWAY-URL.up.railway.app"
```

Or manually:

```powershell
cd frontend
vercel deploy --prod --yes --build-env "VITE_API_URL=https://YOUR-PUBLIC-RAILWAY-URL.up.railway.app"
```

4. Copy the Vercel URL from the deploy output
5. On Railway backend, set `CLIENT_URL` to that Vercel URL and redeploy

**Note:** `humorous-recreation.railway.internal` is private to Railway only. Vercel and your browser need the public `https://....up.railway.app` address.

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
| `Environment variable not found: DATABASE_URL` on Railway | On the **backend service**, add a **Variable Reference** to PostgreSQL → `DATABASE_URL`, then redeploy |
| `Authentication failed` on startup | Run `docker compose up -d` and use the `DATABASE_URL` in `backend/.env` |
| Login fails | Check `VITE_API_URL` matches Railway URL exactly |
| CORS errors | Set `CLIENT_URL` on Railway to your Vercel URL |
| Empty dashboard | Confirm `DEMO_MODE=true` and run `npm run db:seed` |
| Socket not connecting | Ensure `VITE_API_URL` is set on Vercel |
