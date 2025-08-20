import React from 'react';

export const SISOBranding = () => {
  return (
    <div className="siso-header p-4 rounded-lg mb-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black">🧠 SISO IDE</h1>
          <p className="text-black/80 text-sm">Mobile-First AI Development Environment</p>
        </div>
        <div className="siso-badge">
          v1.0-beta
        </div>
      </div>
    </div>
  );
};

export const SISOButton = ({ children, variant = 'primary', onClick, className = '' }) => {
  const baseClass = variant === 'secondary' ? 'siso-button-secondary' : 'siso-button';
  
  return (
    <button 
      className={`${baseClass} px-4 py-2 ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export const SISOCard = ({ children, className = '' }) => {
  return (
    <div className={`siso-card p-4 ${className}`}>
      {children}
    </div>
  );
};

export const SISONavItem = ({ children, active = false, onClick, className = '' }) => {
  return (
    <div 
      className={`siso-nav-item cursor-pointer ${active ? 'active' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};