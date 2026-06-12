param(
  [Parameter(Mandatory = $true)]
  [string]$ApiUrl
)

$ApiUrl = $ApiUrl.Trim().TrimEnd('/')

if ($ApiUrl -match '\.railway\.internal$') {
  Write-Host ''
  Write-Host 'That looks like a private Railway address (.railway.internal).'
  Write-Host 'Browsers and Vercel cannot reach it.'
  Write-Host ''
  Write-Host 'In Railway: open your backend service -> Settings -> Networking -> Public Networking'
  Write-Host 'Copy the https://....up.railway.app URL and run this script again.'
  Write-Host ''
  exit 1
}

if ($ApiUrl -notmatch '^https?://') {
  $ApiUrl = "https://$ApiUrl"
}

Set-Location (Split-Path $PSScriptRoot -Parent)

Write-Host "Deploying SIFOS frontend to Vercel..."
Write-Host "API URL: $ApiUrl"
Write-Host ''

vercel deploy --prod --yes --build-env "VITE_API_URL=$ApiUrl"

if ($LASTEXITCODE -ne 0) {
  Write-Host 'Deploy failed. Run: vercel login'
  exit $LASTEXITCODE
}

Write-Host ''
Write-Host 'Done. Open the production URL shown above.'
Write-Host "Then set CLIENT_URL on Railway to your Vercel URL and redeploy the backend."
