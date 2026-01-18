/**
 * 📋 WorkProtocolCard Component
 * 
 * Extracted from UnifiedWorkSection.tsx (Phase 4B Refactoring)
 * Displays work protocol and rules in a structured format
 * 
 * Benefits:
 * - Reusable protocol display component
 * - Configurable for different work types
 * - Clean separation of protocol logic
 * - Easy to customize per work type
 */

import React from 'react';
import { TaskSeparator } from './TaskSeparator';
import type { WorkTheme } from '@/lib/config/work-themes';

export interface WorkProtocolCardProps {
  themeConfig: WorkTheme;
}

export const WorkProtocolCard: React.FC<WorkProtocolCardProps> = ({
  themeConfig
}) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className={`font-bold ${themeConfig.colors.textSecondary} mb-2 text-sm sm:text-base`}>
          {themeConfig.protocol.title}
        </h3>
        <p className="text-gray-200 text-xs sm:text-sm leading-relaxed">
          {themeConfig.protocol.description}
        </p>
      </div>
      
      <TaskSeparator spacing="loose" />
      
      <div>
        <h3 className={`font-bold ${themeConfig.colors.textSecondary} mb-2 text-sm sm:text-base`}>
          {themeConfig.rules.title}
        </h3>
        <ul className="text-gray-200 text-xs sm:text-sm space-y-1">
          {themeConfig.rules.items.map((rule, index) => (
            <li key={index}>{rule}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};