/**
 * TaskSeparator - Ultra Simple UI Component
 * 
 * Reusable separator lines for task sections
 * Consistent styling across all task components
 */

import React from 'react';

interface TaskSeparatorProps {
  /** Thickness of the line - 'thin' or 'thick' */
  thickness?: 'thin' | 'thick';
  /** Opacity level of the line */
  opacity?: 'light' | 'medium' | 'strong';
  /** Additional margin spacing */
  spacing?: 'tight' | 'normal' | 'loose';
}

export const TaskSeparator: React.FC<TaskSeparatorProps> = ({
  thickness = 'thick',
  opacity = 'medium',
  spacing = 'normal'
}) => {
  const thicknessClass = thickness === 'thick' ? 'border-t-2' : 'border-t';
  const opacityClass = {
    light: 'border-white/10',
    medium: 'border-white/30', 
    strong: 'border-white/50'
  }[opacity];
  const spacingClass = {
    tight: 'my-2',
    normal: 'my-3',
    loose: 'my-4'
  }[spacing];

  return (
    <div className={`${thicknessClass} ${opacityClass} ${spacingClass}`}></div>
  );
};