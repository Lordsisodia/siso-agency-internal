/**
 * Agent Plan Demo Component
 * 
 * Demo wrapper for the Agent Plan component with proper container layout.
 * 
 * Features:
 * - Full height container for optimal display
 * - Padding for visual breathing room
 * - Responsive width handling
 * 
 * Usage Example:
 * ```tsx
 * import { Demo } from '@/components/ui/agent-plan-demo';
 * 
 * <Demo />
 * ```
 */

"use client";

import Plan from "@/components/ui/agent-plan";

export function Demo() {
  return (
    <div className="flex flex-col p-4 w-full h-full">
      <Plan />
    </div>
  );
}