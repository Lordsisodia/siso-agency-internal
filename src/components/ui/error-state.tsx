/**
 * Unified Error State Component
 * 
 * Replaces 50+ instances of custom error UI across the codebase
 * with a consistent, reusable component.
 * 
 * Benefits:
 * - Consistent error experience across all components
 * - Better error handling with action buttons
 * - Reduces code duplication
 * - Better accessibility and UX
 */

import React from 'react';
import { AlertTriangle, RefreshCw, Home, ArrowLeft, Bug, Wifi, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface ErrorStateProps {
  /**
   * Error title/heading
   */
  title?: string;
  
  /**
   * Error message to display
   */
  message?: string;
  
  /**
   * Error type determines icon and styling
   */
  type?: 'generic' | 'network' | 'permission' | 'notFound' | 'server' | 'validation';
  
  /**
   * Show retry button
   */
  showRetry?: boolean;
  
  /**
   * Retry button handler
   */
  onRetry?: () => void;
  
  /**
   * Show home/back navigation
   */
  showNavigation?: boolean;
  
  /**
   * Navigation handler (defaults to going back)
   */
  onNavigate?: () => void;
  
  /**
   * Custom actions to display
   */
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'destructive' | 'ghost';
  }>;
  
  /**
   * Size variant
   */
  size?: 'sm' | 'md' | 'lg';
  
  /**
   * Show as card (with border and background)
   */
  asCard?: boolean;
  
  /**
   * Custom className
   */
  className?: string;
  
  /**
   * Show full page error (takes full height)
   */
  fullPage?: boolean;
  
  /**
   * Custom icon override
   */
  icon?: React.ComponentType<{ className?: string }>;
}

// Error type configurations
const ERROR_CONFIGS = {
  generic: {
    icon: AlertTriangle,
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20'
  },
  network: {
    icon: Wifi,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/20'
  },
  permission: {
    icon: Shield,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/20'
  },
  notFound: {
    icon: AlertTriangle,
    color: 'text-gray-400',
    bgColor: 'bg-gray-500/10',
    borderColor: 'border-gray-500/20'
  },
  server: {
    icon: Bug,
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20'
  },
  validation: {
    icon: AlertTriangle,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20'
  }
};

const SIZE_CONFIGS = {
  sm: {
    icon: 'w-8 h-8',
    title: 'text-lg',
    message: 'text-sm',
    spacing: 'space-y-3',
    padding: 'p-4'
  },
  md: {
    icon: 'w-12 h-12',
    title: 'text-xl',
    message: 'text-base',
    spacing: 'space-y-4',
    padding: 'p-6'
  },
  lg: {
    icon: 'w-16 h-16',
    title: 'text-2xl',
    message: 'text-lg',
    spacing: 'space-y-6',
    padding: 'p-8'
  }
};

// Default error messages by type
const DEFAULT_MESSAGES = {
  generic: {
    title: 'Something went wrong',
    message: 'An unexpected error occurred. Please try again or contact support if the problem persists.'
  },
  network: {
    title: 'Connection Error',
    message: 'Unable to connect to the server. Please check your internet connection and try again.'
  },
  permission: {
    title: 'Access Denied',
    message: 'You don\'t have permission to access this resource. Please contact an administrator.'
  },
  notFound: {
    title: 'Not Found',
    message: 'The requested resource could not be found. It may have been moved or deleted.'
  },
  server: {
    title: 'Server Error',
    message: 'The server encountered an error. Our team has been notified and is working to fix it.'
  },
  validation: {
    title: 'Invalid Data',
    message: 'The provided data is invalid. Please check your input and try again.'
  }
};

/**
 * Unified Error State Component
 */
export const ErrorState: React.FC<ErrorStateProps> = ({
  title,
  message,
  type = 'generic',
  showRetry = true,
  onRetry,
  showNavigation = false,
  onNavigate,
  actions = [],
  size = 'md',
  asCard = false,
  className,
  fullPage = false,
  icon: CustomIcon
}) => {
  const config = ERROR_CONFIGS[type] || ERROR_CONFIGS.generic;
  const sizeConfig = SIZE_CONFIGS[size] || SIZE_CONFIGS.md;
  const defaultMessage = DEFAULT_MESSAGES[type] || DEFAULT_MESSAGES.generic;
  
  const IconComponent = CustomIcon || config.icon;
  
  const handleNavigate = () => {
    if (onNavigate) {
      onNavigate();
    } else {
      // Default navigation behavior
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = '/';
      }
    }
  };

  const content = (
    <div 
      className={cn(
        'text-center',
        sizeConfig.spacing,
        sizeConfig.padding,
        fullPage && 'min-h-screen flex flex-col justify-center',
        className
      )}
      role="alert"
      aria-live="assertive"
    >
      {/* Error Icon */}
      <div className="flex justify-center">
        <div className={cn(
          'rounded-full p-3',
          config.bgColor,
          config.borderColor,
          'border'
        )}>
          <IconComponent className={cn(sizeConfig.icon, config.color)} />
        </div>
      </div>
      
      {/* Error Title */}
      <div>
        <h3 className={cn(
          'font-semibold text-white',
          sizeConfig.title
        )}>
          {title || defaultMessage.title}
        </h3>
        
        {/* Error Message */}
        {(message || defaultMessage.message) && (
          <p className={cn(
            'mt-2 text-gray-400',
            sizeConfig.message
          )}>
            {message || defaultMessage.message}
          </p>
        )}
      </div>
      
      {/* Actions */}
      {(showRetry || showNavigation || actions.length > 0) && (
        <div className="flex flex-wrap gap-3 justify-center">
          {/* Retry Button */}
          {showRetry && onRetry && (
            <Button 
              onClick={onRetry} 
              variant="default"
              size={size === 'lg' ? 'default' : 'sm'}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>
          )}
          
          {/* Navigation Button */}
          {showNavigation && (
            <Button 
              onClick={handleNavigate} 
              variant="outline"
              size={size === 'lg' ? 'default' : 'sm'}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </Button>
          )}
          
          {/* Custom Actions */}
          {actions.map((action, index) => (
            <Button
              key={index}
              onClick={action.onClick}
              variant={action.variant || 'outline'}
              size={size === 'lg' ? 'default' : 'sm'}
            >
              {action.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );

  // Card wrapper
  if (asCard) {
    return (
      <Card className={cn(config.borderColor, 'border-2')}>
        <CardContent className="p-0">
          {content}
        </CardContent>
      </Card>
    );
  }

  return content;
};

// Common error states for frequent use cases
export const NetworkErrorState: React.FC<Partial<ErrorStateProps>> = (props) => (
  <ErrorState
    type="network"
    showRetry={true}
    {...props}
  />
);

export const NotFoundErrorState: React.FC<Partial<ErrorStateProps>> = (props) => (
  <ErrorState
    type="notFound"
    showNavigation={true}
    showRetry={false}
    {...props}
  />
);

export const PermissionErrorState: React.FC<Partial<ErrorStateProps>> = (props) => (
  <ErrorState
    type="permission"
    showNavigation={true}
    showRetry={false}
    {...props}
  />
);

export const ServerErrorState: React.FC<Partial<ErrorStateProps>> = (props) => (
  <ErrorState
    type="server"
    showRetry={true}
    actions={[
      {
        label: 'Contact Support',
        onClick: () => window.location.href = 'mailto:support@siso.ai',
        variant: 'outline'
      }
    ]}
    {...props}
  />
);

export const ValidationErrorState: React.FC<Partial<ErrorStateProps>> = (props) => (
  <ErrorState
    type="validation"
    showRetry={false}
    size="sm"
    {...props}
  />
);

export default ErrorState;