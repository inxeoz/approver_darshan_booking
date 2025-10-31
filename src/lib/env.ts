

export const env = typeof window !== 'undefined' ? window.__ENV__ || {} : {};
export const isProd = import.meta.env.PROD;
export const API_BASE = env.API_URL || import.meta.env.VITE_TARGET;

if (typeof window !== 'undefined')
  console.log(`Mode: ${isProd ? 'prod' : 'dev'} | API_BASE=${API_BASE}`);
