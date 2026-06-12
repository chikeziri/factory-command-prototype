function getAllowedOrigins() {
  const defaults = ['http://localhost:5173', 'http://127.0.0.1:5173'];
  const configured = (process.env.CLIENT_URL || '')
    .split(',')
    .map((origin) => origin.trim().replace(/\/$/, ''))
    .filter(Boolean);

  return [...new Set([...defaults, ...configured])];
}

function isOriginAllowed(origin) {
  if (!origin) {
    return true;
  }

  const normalized = origin.replace(/\/$/, '');

  if (getAllowedOrigins().includes(normalized)) {
    return true;
  }

  if (process.env.DEMO_MODE === 'true') {
    try {
      const { hostname } = new URL(normalized);
      if (hostname.endsWith('.vercel.app')) {
        return true;
      }
    } catch {
      return false;
    }
  }

  return false;
}

function createCorsOriginChecker() {
  return (origin, callback) => {
    if (isOriginAllowed(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`Origin not allowed by CORS: ${origin}`));
  };
}

module.exports = {
  getAllowedOrigins,
  isOriginAllowed,
  createCorsOriginChecker,
};
