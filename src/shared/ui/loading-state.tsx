/**
 * Unified Loading State Component
 * 
 * Replaces 100+ instances of custom loading UI across the codebase
 * with a consistent, reusable component.
 * 
 * Benefits:
 * - Consistent loading experience across all components
 * - Easy to update loading UI globally
 * - Reduces code duplication
 * - Better accessibility with proper ARIA attributes
 */

import React from 'react';
import { Loader2, Clock, Zap } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export interface LoadingStateProps {
  /**
   * Loading message to display
   */
  message?: string;
  
  /**
   * Size variant of the loading spinner
   */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  
  /**
   * Loading spinner variant
   */
  variant?: 'spinner' | 'pulse' | 'dots' | 'bars';
  
  /**
   * Show/hide the loading message
   */
  showMessage?: boolean;
  
  /**
   * Custom className for styling
   */
  className?: string;
  
  /**
   * Center the loading state in its container
   */
  centered?: boolean;
  
  /**
   * Overlay the loading state over existing content
   */
  overlay?: boolean;
  
  /**
   * Custom icon to use instead of default spinner
   */
  icon?: React.ComponentType<{ className?: string }>;
}

const SIZE_CLASSES = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6', 
  lg: 'w-8 h-8',
  xl: 'w-12 h-12'
};

const TEXT_SIZE_CLASSES = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg', 
  xl: 'text-xl'
};

// Loading spinner variants
const SpinnerLoader: React.FC<{ size: LoadingStateProps['size']; className?: string }> = ({ size = 'md', className }) => (
  <Loader2 className={cn('animate-spin', SIZE_CLASSES[size], className)} />
);

const PulseLoader: React.FC<{ size: LoadingStateProps['size']; className?: string }> = ({ size = 'md', className }) => (
  <div className={cn('animate-pulse rounded-full bg-current', SIZE_CLASSES[size], className)} />
);

const DotsLoader: React.FC<{ size: LoadingStateProps['size']; className?: string }> = ({ size = 'md', className }) => (
  <div className={cn('flex space-x-1', className)}>
    {[0, 1, 2].map(i => (
      <div
        key={i}
        className={cn(
          'animate-bounce rounded-full bg-current',
          size === 'sm' ? 'w-1 h-1' : size === 'lg' ? 'w-3 h-3' : size === 'xl' ? 'w-4 h-4' : 'w-2 h-2'
        )}
        style={{ animationDelay: `${i * 0.1}s` }}
      />
    ))}
  </div>
);

const BarsLoader: React.FC<{ size: LoadingStateProps['size']; className?: string }> = ({ size = 'md', className }) => (
  <div className={cn('flex space-x-1', className)}>
    {[0, 1, 2].map(i => (
      <div
        key={i}
        className={cn(
          'animate-pulse bg-current',
          size === 'sm' ? 'w-1 h-4' : size === 'lg' ? 'w-2 h-8' : size === 'xl' ? 'w-3 h-12' : 'w-1.5 h-6'
        )}
        style={{ animationDelay: `${i * 0.15}s` }}
      />
    ))}
  </div>
);

/**
 * Unified Loading State Component
 */
export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading...',
  size = 'md',
  variant = 'spinner',
  showMessage = true,
  className,
  centered = true,
  overlay = false,
  icon: CustomIcon
}) => {
  // Select the appropriate loader component
  const LoaderComponent = CustomIcon ? 
    () => <CustomIcon className={cn(SIZE_CLASSES[size], 'text-current')} /> :
    variant === 'pulse' ? PulseLoader :
    variant === 'dots' ? DotsLoader :
    variant === 'bars' ? BarsLoader :
    SpinnerLoader;

  const content = (
    <div 
      className={cn(
        'flex flex-col items-center justify-center gap-3 text-gray-400',
        centered && 'min-h-[120px]',
        className
      )}
      role="status"
      aria-live="polite"
      aria-label={showMessage ? message : 'Loading'}
    >
      {/* Loading animation */}
      <LoaderComponent size={size} />
      
      {/* Loading message */}
      {showMessage && (
        <div className={cn('text-center', TEXT_SIZE_CLASSES[size])}>
          {message}
        </div>
      )}
    </div>
  );

  // Overlay version
  if (overlay) {
    return (
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return content;
};

// Common loading states for frequent use cases
export const TableLoadingState: React.FC<Partial<LoadingStateProps>> = (props) => (
  <LoadingState
    message="Loading data..."
    size="md"
    variant="spinner"
    centered={true}
    {...props}
  />
);

export const ButtonLoadingState: React.FC<Partial<LoadingStateProps>> = (props) => (
  <LoadingState
    message=""
    size="sm"
    variant="spinner"
    showMessage={false}
    centered={false}
    className="inline-flex"
    {...props}
  />
);

export const PageLoadingState: React.FC<Partial<LoadingStateProps>> = (props) => (
  <LoadingState
    message="Loading page..."
    size="lg"
    variant="spinner"
    centered={true}
    className="min-h-screen"
    {...props}
  />
);

export const CardLoadingState: React.FC<Partial<LoadingStateProps>> = (props) => (
  <LoadingState
    message="Loading..."
    size="md"
    variant="dots"
    centered={true}
    className="py-8"
    {...props}
  />
);

export default LoadingState;