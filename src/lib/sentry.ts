import * as Sentry from "@sentry/react";

// Initialize Sentry
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN || "",
  
  // Set sample rate for performance monitoring
  tracesSampleRate: 1.0,
  
  // Set sample rate for session replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  
  // Environment
  environment: import.meta.env.VITE_ENVIRONMENT || "development",
  
  // Enable Session Replay
  integrations: [
    Sentry.replayIntegration({
      // Mask all text content and user input
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  
  // Set the release version
  release: import.meta.env.VITE_APP_VERSION || "1.0.0",
  
  // Configure which URLs to trace
  beforeSend(event, hint) {
    // Don't send errors in development
    if (import.meta.env.VITE_ENVIRONMENT === "development") {
      console.log("Sentry Event (dev mode):", event);
      return null;
    }
    return event;
  },
});

export default Sentry; 