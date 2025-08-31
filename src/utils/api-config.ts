/**
 * 🌐 API Configuration Utility
 * 
 * Centralized configuration for API base URLs
 * Handles development vs production environment detection
 */

export function getApiBaseURL(): string {
  // In production (Vercel), use relative paths
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return ''; // Use relative paths on Vercel (/api/...)
  }
  // Use Vite dev server for local development
  return 'http://localhost:5174';
}

/**
 * Create full API URL with base URL handling
 */
export function createApiUrl(path: string): string {
  const baseURL = getApiBaseURL();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  return baseURL ? `${baseURL}${cleanPath}` : cleanPath;
}

/**
 * Environment detection utilities
 */
export const isProduction = () => {
  if (typeof window === 'undefined') return false;
  const hostname = window.location.hostname;
  return hostname.includes('vercel.app') || hostname !== 'localhost';
};

export const isDevelopment = () => !isProduction();