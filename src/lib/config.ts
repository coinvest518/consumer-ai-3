/**
 * Base API URL for backend requests
 * In development: Use relative /api path (proxied by Vite to Vercel dev server)
 * In production: Use VITE_API_BASE_URL environment variable or production URL
 */

// IMPORTANT: Do NOT include /api at the end, it will be added by the API client or fetcher
// Get API URL from environment variable or use default (should NOT end with /api)
const getApiBaseUrl = () => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    if (import.meta.env.VITE_API_URL) {
      let url = import.meta.env.VITE_API_URL;
      // Remove trailing /api if present
      if (url.endsWith('/api')) {
        url = url.replace(/\/api$/, '');
      }
      console.log('[Config] Using API URL from env:', url);
      return url;
    }
  }
  // Default fallback for development
  return 'https://consumer-ai-render.onrender.com';
};

// Get the API base URL
const API_BASE = getApiBaseUrl();
console.log('[Config] API Base URL:', API_BASE);

// Log the API base URL
console.log('[Config] Using API base URL:', API_BASE);

/**
 * API_BASE_URL for all API requests
 */
export const API_BASE_URL = API_BASE;

// Get API URL based on environment and endpoint
// Returns the full API URL for a given endpoint (does NOT add /api twice)
export const getApiUrl = (endpoint: string) => {
  let cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  // Remove any /api prefix from endpoint to avoid double /api
  if (cleanEndpoint.startsWith('/api/')) {
    cleanEndpoint = cleanEndpoint.replace(/^\/api\//, '/');
  }
  return `${API_BASE_URL}${cleanEndpoint}`;
};

/**
 * Log environment state during initialization
 */
console.log('Environment:', {
  isProd: import.meta.env.PROD,
  isDev: import.meta.env.DEV,
  baseUrl: API_BASE_URL,
  deploymentUrl: import.meta.env.BASE_URL,
  hasSupabaseUrl: !!import.meta.env.VITE_SUPABASE_URL,
  hasAstraToken: !!import.meta.env.VITE_ASTRA_DB_APPLICATION_TOKEN,
  viteApiBaseUrl: import.meta.env.VITE_API_BASE_URL,
});

/**
 * Base URL for the application
 * Always returns empty string (root path) regardless of environment
 */
export const getBaseUrl = (): string => {
  // Always use root path
  return '';
};