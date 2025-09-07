/**
 * Gradient Menu Demo Component
 * 
 * A beautiful animated menu with gradient hover effects and smooth transitions.
 * 
 * Features:
 * - Expandable menu items on hover
 * - Custom gradient colors for each item
 * - Blur glow effects
 * - Smooth animations and transitions
 * - Icon-first design with expandable text
 * 
 * Dependencies:
 * - react-icons
 * - Tailwind CSS
 * 
 * Usage Example:
 * ```tsx
 * import { DemoOne } from '@/components/ui/gradient-menu-demo';
 * 
 * <DemoOne />
 * ```
 */

import GradientMenu from "@/components/ui/gradient-menu";

const DemoOne = () => {
  return (
    <div className="flex w-full h-screen justify-center items-center">
      <GradientMenu />
    </div>
  );
};

export { DemoOne };