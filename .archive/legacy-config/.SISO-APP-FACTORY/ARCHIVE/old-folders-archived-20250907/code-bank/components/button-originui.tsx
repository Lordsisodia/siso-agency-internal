/**
 * Button Component (OriginUI Enhanced)
 * 
 * Enhanced button component with OriginUI styling, improved shadows, and modern design patterns.
 * Features updated border radius, shadow effects, and optimized focus states.
 * 
 * Changes from Standard shadcn Button:
 * - Rounded corners changed from rounded-md to rounded-lg
 * - Added shadow-sm shadow-black/5 for subtle depth
 * - Enhanced focus-visible styles with outline instead of ring
 * - SVG pointer events and shrink handling
 * - Improved size variants with more precise dimensions
 * - Better accessibility with outline-offset-2
 * 
 * Features:
 * - Multiple variants: default, destructive, outline, secondary, ghost, link
 * - Size options: default, sm, lg, icon
 * - AsChild support via Radix Slot
 * - Full TypeScript support with VariantProps
 * - Accessible focus indicators
 * - Consistent with OriginUI design system
 * 
 * Dependencies:
 * - @radix-ui/react-slot (asChild functionality)
 * - class-variance-authority (variant management)
 * - Tailwind CSS (styling)
 * 
 * Usage Examples:
 * ```tsx
 * import { Button } from '@/components/ui/button';
 * 
 * // Basic button
 * <Button>Click me</Button>
 * 
 * // Variant and size
 * <Button variant="outline" size="lg">Large Outline</Button>
 * 
 * // With icon
 * <Button size="icon">
 *   <PlusIcon className="h-4 w-4" />
 * </Button>
 * 
 * // As child (render as different element)
 * <Button asChild>
 *   <a href="/link">Link Button</a>
 * </Button>
 * ```
 */

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-sm shadow-black/5 hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm shadow-black/5 hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm shadow-black/5 hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm shadow-black/5 hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-10 rounded-lg px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };