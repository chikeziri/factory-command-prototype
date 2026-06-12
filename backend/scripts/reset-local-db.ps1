# Reset a failed local migration and re-apply (run from backend folder)
# Usage: .\scripts\reset-local-db.ps1

$ErrorActionPreference = "Stop"
$backendRoot = Split-Path $PSScriptRoot -Parent
$envFile = Join-Path $backendRoot ".env"

if (-not (Test-Path $envFile)) {
  Write-Error "Missing backend/.env"
}

Get-Content $envFile | ForEach-Object {
  if ($_ -match '^\s*DATABASE_URL="(.+)"\s*$') {
    $env:DATABASE_URL = $matches[1]
  }
}

if (-not $env:DATABASE_URL) {
  Write-Error "DATABASE_URL not found in backend/.env"
}

$sql = @'
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
'@

Write-Host "Resetting public schema..."
$sql | npx prisma db execute --stdin

Write-Host "Applying migrations..."
npx prisma migrate deploy

Write-Host "Seeding demo data..."
npm run db:seed

Write-Host "Done. Start the API with: npm run dev"
