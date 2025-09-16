export {};

declare global {
  interface Window {
    ALLOWED_ORIGINS?: string[];
  }
}