// Centralized API Base URL configuration
// Note: No .env file is needed on Vercel!
// In local dev, Vite automatically proxies /api calls to http://localhost:5000 via vite.config.js.
// In Vercel production, vercel.json rewrites /api calls directly to your Render backend.
export const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export const getApiUrl = (endpoint) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  if (!API_BASE_URL) return cleanEndpoint;
  return `${API_BASE_URL}${cleanEndpoint}`;
};

