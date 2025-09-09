/**
 * 🔘 Button Component
 */

import React from 'react';

export const AI_INTERFACE = {
  purpose: "Generic button component",
  exports: ["Button"],
  patterns: ["ui-component"]
};

export interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
}

export function Button({ children, onClick, variant = 'primary' }: ButtonProps) {
  return (
    <button 
      onClick={onClick}
      className={`btn btn-${variant}`}
    >
      {children}
    </button>
  );
}

export default Button;
