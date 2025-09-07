
import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface GradientHeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  variant?: 'primary' | 'secondary';
}

export function GradientHeading({ 
  children, 
  className, 
  variant = 'primary', 
  ...props 
}: GradientHeadingProps) {
  return (
    <h2 
      className={cn(
        "font-bold tracking-tight bg-clip-text text-transparent",
        variant === 'primary' 
          ? "bg-gradient-to-r from-siso-red to-siso-orange" 
          : "bg-gradient-to-r from-siso-orange to-siso-red",
        className
      )}
      {...props}
    >
      {children}
    </h2>
  );
}

