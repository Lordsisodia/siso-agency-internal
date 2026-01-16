import React from 'react'
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';
import { ClerkProvider } from '@/domains/auth';
import App from './App';
import './index.css';
import { ErrorFallback } from '@/components/shared/ErrorFallback';
import { checkEnv } from '@/lib/utils/envCheck';
import { registerServiceWorker } from '@/lib/utils/registerServiceWorker';

// Check environment on load
if (import.meta.env.PROD) {
  checkEnv();
}

// Register service worker for PWA functionality
registerServiceWorker();

// Optimized QueryClient for super-fast performance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 15 * 60 * 1000, // 15 minutes - aggressive caching
      gcTime: 30 * 60 * 1000, // 30 minutes - keep in memory longer
      retry: 2,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: 'always',
      // Use background refetch for better UX
      refetchInterval: false,
      refetchIntervalInBackground: false,
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
})

// Filter out harmless development errors in console
if (import.meta.env.DEV) {
  const originalError = console.error;
  console.error = (...args) => {
    const message = args.join(' ');
    // Suppress common development tool connection errors and missing API endpoints
    if (message.includes('net::ERR_CONNECTION_REFUSED') ||
        message.includes('18883') ||
        message.includes('Failed to load resource') ||
        message.includes('Unexpected token') && message.includes('<!DOCTYPE') ||
        message.includes('fetchCompletions') ||
        message.includes('wake-up time')) {
      return; // Suppress these specific errors
    }
    originalError.apply(console, args);
  };
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <ClerkProvider>
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        >
          <QueryClientProvider client={queryClient}>
            <App />
          </QueryClientProvider>
        </BrowserRouter>
      </ClerkProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
