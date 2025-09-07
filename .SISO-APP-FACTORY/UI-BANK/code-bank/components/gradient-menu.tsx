/**
 * Gradient Menu Component
 * 
 * A beautiful animated menu with gradient hover effects, smooth transitions, and expandable labels.
 * Perfect for navigation menus, action bars, or icon-based interfaces.
 * 
 * Features:
 * - Expandable menu items on hover (60px → 180px width)
 * - Custom gradient colors for each menu item
 * - Blur glow effects for enhanced visual appeal
 * - Smooth CSS transitions and scaling animations
 * - Icon-first design with expandable text labels
 * - TypeScript support with proper type safety
 * 
 * Dependencies:
 * - react-icons (for IoHomeOutline, IoVideocamOutline, etc.)
 * - Tailwind CSS (for styling and animations)
 * 
 * Usage Example:
 * ```tsx
 * import GradientMenu from '@/components/ui/gradient-menu';
 * 
 * // Basic usage
 * <GradientMenu />
 * 
 * // In a demo container
 * <div className="flex w-full h-screen justify-center items-center">
 *   <GradientMenu />
 * </div>
 * ```
 * 
 * Customization:
 * You can modify the menuItems array to add/remove items or change colors:
 * ```tsx
 * const menuItems = [
 *   { title: 'Home', icon: <IoHomeOutline />, gradientFrom: '#a955ff', gradientTo: '#ea51ff' },
 *   // Add more items...
 * ];
 * ```
 */

import React from 'react';
import { IoHomeOutline, IoVideocamOutline, IoCameraOutline, IoShareSocialOutline, IoHeartOutline } from 'react-icons/io5';

const menuItems = [
  { title: 'Home', icon: <IoHomeOutline />, gradientFrom: '#a955ff', gradientTo: '#ea51ff' },
  { title: 'Video', icon: <IoVideocamOutline />, gradientFrom: '#56CCF2', gradientTo: '#2F80ED' },
  { title: 'Photo', icon: <IoCameraOutline />, gradientFrom: '#FF9966', gradientTo: '#FF5E62' },
  { title: 'Share', icon: <IoShareSocialOutline />, gradientFrom: '#80FF72', gradientTo: '#7EE8FA' },
  { title: 'Tym', icon: <IoHeartOutline />, gradientFrom: '#ffa9c6', gradientTo: '#f434e2' }
];

export default function GradientMenu() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-background">
      <ul className="flex gap-6">
        {menuItems.map(({ title, icon, gradientFrom, gradientTo }, idx) => (
          <li
            key={idx}
            style={{ '--gradient-from': gradientFrom, '--gradient-to': gradientTo } as React.CSSProperties}
            className="relative w-[60px] h-[60px] bg-white shadow-lg rounded-full flex items-center justify-center transition-all duration-500 hover:w-[180px] hover:shadow-none group cursor-pointer"
          >
            {/* Gradient background on hover */}
            <span className="absolute inset-0 rounded-full bg-[linear-gradient(45deg,var(--gradient-from),var(--gradient-to))] opacity-0 transition-all duration-500 group-hover:opacity-100"></span>
            {/* Blur glow */}
            <span className="absolute top-[10px] inset-x-0 h-full rounded-full bg-[linear-gradient(45deg,var(--gradient-from),var(--gradient-to))] blur-[15px] opacity-0 -z-10 transition-all duration-500 group-hover:opacity-50"></span>

            {/* Icon */}
            <span className="relative z-10 transition-all duration-500 group-hover:scale-0 delay-0">
              <span className="text-2xl text-gray-500">{icon}</span>
            </span>

            {/* Title */}
            <span className="absolute text-white uppercase tracking-wide text-sm transition-all duration-500 scale-0 group-hover:scale-100 delay-150">
              {title}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}