/**
 * TasksErrorFallback Component
 * Error boundary fallback for task-related errors
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  RefreshCw, 
  Home, 
  Bug, 
  HelpCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TasksErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
  className?: string;
  showDetails?: boolean;
  onGoHome?: () => void;
  onReportBug?: () => void;
}

export const TasksErrorFallback: React.FC<TasksErrorFallbackProps> = ({
  error,
  resetErrorBoundary,
  className,
  showDetails = false,
  onGoHome,
  onReportBug
}) => {
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(showDetails);
  
  // Determine error type and appropriate message
  const getErrorInfo = (error: Error) => {
    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('fetch')) {
      return {
        type: 'network',
        title: 'Network Error',
        description: 'Unable to connect to the server. Please check your internet connection.',
        suggestion: 'Try refreshing the page or check your network connection.',
        icon: '🌐',
        severity: 'warning'
      };
    }
    
    if (message.includes('permission') || message.includes('unauthorized')) {
      return {
        type: 'permission',
        title: 'Access Denied',
        description: 'You don\'t have permission to access this resource.',
        suggestion: 'Please contact your administrator or try logging in again.',
        icon: '🔒',
        severity: 'error'
      };
    }
    
    if (message.includes('not found') || message.includes('404')) {
      return {
        type: 'notfound',
        title: 'Not Found',
        description: 'The requested resource could not be found.',
        suggestion: 'The task or resource you\'re looking for may have been deleted or moved.',
        icon: '🔍',
        severity: 'warning'
      };
    }
    
    if (message.includes('timeout')) {
      return {
        type: 'timeout',
        title: 'Request Timeout',
        description: 'The request took too long to complete.',
        suggestion: 'The server might be busy. Please try again in a moment.',
        icon: '⏱️',
        severity: 'warning'
      };
    }
    
    // Generic error
    return {
      type: 'generic',
      title: 'Something went wrong',
      description: 'An unexpected error occurred while loading your tasks.',
      suggestion: 'Please try refreshing the page or contact support if the problem persists.',
      icon: '⚠️',
      severity: 'error'
    };
  };

  const errorInfo = getErrorInfo(error);
  
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const handleRetry = () => {
    resetErrorBoundary();
  };

  const handleGoHome = () => {
    if (onGoHome) {
      onGoHome();
    } else {
      window.location.href = '/';
    }
  };

  const handleReportBug = () => {
    if (onReportBug) {
      onReportBug();
    } else {
      // Default bug report action
      const subject = encodeURIComponent(`Task Error: ${errorInfo.title}`);
      const body = encodeURIComponent(
        `Error Details:\n\nType: ${errorInfo.type}\nMessage: ${error.message}\nStack: ${error.stack}\n\nPlease describe what you were doing when this error occurred:`
      );
      window.open(`mailto:support@sisoagency.com?subject=${subject}&body=${body}`);
    }
  };

  return (
    <div className={cn(
      'tasks-error-fallback flex items-center justify-center min-h-96 p-8',
      className
    )}>
      <Card className={cn('max-w-lg w-full', getSeverityColor(errorInfo.severity))}>
        <CardContent className="p-6">
          {/* Error Header */}
          <div className="text-center mb-6">
            <div className="text-4xl mb-3">{errorInfo.icon}</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {errorInfo.title}
            </h2>
            <p className="text-gray-600 mb-4">
              {errorInfo.description}
            </p>
            
            <Badge 
              variant="outline" 
              className={cn(
                'mb-4',
                errorInfo.severity === 'error' ? 'border-red-300 text-red-700' : 'border-yellow-300 text-yellow-700'
              )}
            >
              Error Type: {errorInfo.type}
            </Badge>
            
            <p className="text-sm text-gray-500">
              {errorInfo.suggestion}
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3 mb-4">
            <Button 
              onClick={handleRetry} 
              className="w-full bg-orange-600 hover:bg-orange-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                onClick={handleGoHome}
                className="border-gray-300"
              >
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleReportBug}
                className="border-gray-300"
              >
                <Bug className="w-4 h-4 mr-2" />
                Report Bug
              </Button>
            </div>
          </div>

          {/* Error Details Toggle */}
          <div className="border-t border-gray-200 pt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDetailsOpen(!isDetailsOpen)}
              className="w-full text-gray-500 hover:text-gray-700"
            >
              <HelpCircle className="w-4 h-4 mr-2" />
              Technical Details
              {isDetailsOpen ? (
                <ChevronUp className="w-4 h-4 ml-2" />
              ) : (
                <ChevronDown className="w-4 h-4 ml-2" />
              )}
            </Button>
            
            {isDetailsOpen && (
              <div className="mt-3 p-3 bg-gray-100 rounded-lg">
                <div className="space-y-2 text-xs text-gray-600">
                  <div>
                    <strong>Error Message:</strong>
                    <p className="font-mono bg-white p-2 rounded border mt-1">
                      {error.message}
                    </p>
                  </div>
                  
                  {error.stack && (
                    <div>
                      <strong>Stack Trace:</strong>
                      <pre className="font-mono bg-white p-2 rounded border mt-1 overflow-x-auto text-xs">
                        {error.stack}
                      </pre>
                    </div>
                  )}
                  
                  <div>
                    <strong>Timestamp:</strong>
                    <p className="font-mono">{new Date().toISOString()}</p>
                  </div>
                  
                  <div>
                    <strong>User Agent:</strong>
                    <p className="font-mono break-all">{navigator.userAgent}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Help Text */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              If this problem persists, please contact{' '}
              <a 
                href="mailto:support@sisoagency.com" 
                className="text-orange-600 hover:underline"
              >
                support@sisoagency.com
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TasksErrorFallback;