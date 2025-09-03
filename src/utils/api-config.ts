/**
 * 🌐 API Configuration Utility
 * 
 * Centralized configuration for API base URLs
 * Handles development vs production environment detection
 */

export function getApiBaseURL(): string {
  // Always use relative paths - Vite proxy handles local development routing
  return '';
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