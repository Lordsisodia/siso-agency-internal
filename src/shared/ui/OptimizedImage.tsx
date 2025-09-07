import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/shared/lib/utils';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  fallback?: string;
}

export const OptimizedImage = React.memo(function OptimizedImage({
  src,
  alt,
  className,
  priority = false,
  quality = 80,
  placeholder = 'empty',
  fallback,
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);

  // Generate WebP source if available
  const getOptimizedSrc = (originalSrc: string) => {
    if (originalSrc.includes('lovable-uploads')) {
      // Try WebP first, fall back to original
      return originalSrc.replace(/\.(png|jpg|jpeg)$/i, '.webp');
    }
    return originalSrc;
  };

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority) return; // Skip lazy loading for priority images

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px', // Start loading 50px before entering view
        threshold: 0.1,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    setHasError(false);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(false);
  };

  // Show placeholder while not in view or loading
  if (!isInView) {
    return (
      <div
        ref={imgRef}
        className={cn(
          'bg-gray-800/50 animate-pulse flex items-center justify-center',
          className
        )}
        {...props}
      >
        {placeholder === 'blur' && (
          <div className="w-full h-full bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded"></div>
        )}
      </div>
    );
  }

  return (
    <picture className={cn('relative', className)}>
      {/* WebP source for modern browsers */}
      <source srcSet={getOptimizedSrc(src)} type="image/webp" />
      
      {/* Fallback for browsers that don't support WebP */}
      <img
        ref={imgRef}
        src={hasError && fallback ? fallback : src}
        alt={alt}
        className={cn(
          'transition-opacity duration-300',
          isLoaded ? 'opacity-100' : 'opacity-0',
          className
        )}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
      
      {/* Loading placeholder */}
      {!isLoaded && !hasError && (
        <div className={cn(
          'absolute inset-0 bg-gray-800/50 animate-pulse flex items-center justify-center',
          placeholder === 'blur' && 'bg-gradient-to-r from-gray-800/50 to-gray-700/50'
        )}>
          <div className="w-6 h-6 border-2 border-gray-600 border-t-gray-400 rounded-full animate-spin"></div>
        </div>
      )}
      
      {/* Error state */}
      {hasError && !fallback && (
        <div className={cn(
          'absolute inset-0 bg-gray-800/50 flex items-center justify-center text-gray-400 text-sm',
          className
        )}>
          Failed to load image
        </div>
      )}
    </picture>
  );
});