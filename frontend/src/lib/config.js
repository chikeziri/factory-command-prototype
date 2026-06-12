export function getApiUrl() {
  const raw = import.meta.env.VITE_API_URL || ''
  return raw.replace(/\/$/, '')
}

export function isApiConfigured() {
  return Boolean(getApiUrl())
}

export function requireApiUrl() {
  const url = getApiUrl()

  if (url) {
    return url
  }

  if (import.meta.env.PROD) {
    throw new Error(
      'VITE_API_URL is not set on Vercel. Add your Railway backend URL in Project Settings → Environment Variables, then redeploy.'
    )
  }

  return ''
}
