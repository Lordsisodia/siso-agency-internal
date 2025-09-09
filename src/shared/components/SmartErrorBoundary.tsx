/**
 * Smart Error Boundary with intelligent error reporting and recovery
 * Part of 87→92/100 architecture improvement strategy
 */
import React, { ErrorInfo, PropsWithChildren } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useLocation } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
  context?: string;
}

function ErrorFallback({ error, resetErrorBoundary, context }: ErrorFallbackProps) {
  const location = useLocation();
  const { user } = useUser();

  const handleReportError = () => {
    // In a real app, this would send to your error reporting service
    console.error('User reported error:', {
      error: error.message,
      stack: error.stack,
      route: location.pathname,
      user: user?.id,
      context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    });
  };

  const goHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <CardTitle className="text-red-900">Something went wrong</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600 text-center">
            We're sorry, but something unexpected happened. 
            {context && ` This error occurred in: ${context}`}
          </p>
          
          <div className="bg-gray-100 p-3 rounded-md">
            <p className="text-sm font-mono text-gray-700 break-all">
              {error.message}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Button 
              onClick={resetErrorBoundary} 
              className="w-full"
              variant="default"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            
            <Button 
              onClick={goHome} 
              variant="outline"
              className="w-full"
            >
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
            
            <Button 
              onClick={handleReportError} 
              variant="ghost"
              size="sm"
              className="w-full text-gray-500"
            >
              <Bug className="w-4 h-4 mr-2" />
              Report This Error
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface SmartErrorBoundaryProps extends PropsWithChildren {
  context?: string;
}

export function SmartErrorBoundary({ children, context }: SmartErrorBoundaryProps) {
  const location = useLocation();
  const { user } = useUser();

  const handleError = (error: Error, errorInfo: ErrorInfo) => {
    // Smart error reporting with context
    const errorReport = {
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      },
      errorInfo: {
        componentStack: errorInfo.componentStack
      },
      context: {
        route: location.pathname,
        user: user?.id,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        buildVersion: import.meta.env.VITE_BUILD_VERSION || 'unknown',
        context: context || 'unknown'
      }
    };

    // Log to console in development
    if (import.meta.env.DEV) {
      console.group('🚨 Error Boundary Triggered');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Context:', errorReport.context);
      console.groupEnd();
    }

    // In production, send to error reporting service
    // Example: Sentry, LogRocket, or custom endpoint
    // reportError(errorReport);
  };

  return (
    <ErrorBoundary
      FallbackComponent={(props) => (
        <ErrorFallback {...props} context={context} />
      )}
      onError={handleError}
      onReset={() => {
        // Clear any error state
        window.location.reload();
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

// Convenience wrapper for route-level error boundaries
export function RouteErrorBoundary({ children }: PropsWithChildren) {
  const location = useLocation();
  
  return (
    <SmartErrorBoundary context={`route:${location.pathname}`}>
      {children}
    </SmartErrorBoundary>
  );
}

// Feature-specific error boundary
export function FeatureErrorBoundary({ 
  children, 
  featureName 
}: PropsWithChildren<{ featureName: string }>) {
  return (
    <SmartErrorBoundary context={`feature:${featureName}`}>
      {children}
    </SmartErrorBoundary>
  );
}