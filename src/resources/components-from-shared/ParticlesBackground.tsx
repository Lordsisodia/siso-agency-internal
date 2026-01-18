/**
 * ParticlesBackground Component
 * Simple placeholder for visual background effect
 */

import React from 'react';

export interface ParticlesBackgroundProps {
  className?: string;
}

export const ParticlesBackground: React.FC<ParticlesBackgroundProps> = ({ className = '' }) => {
  return (
    <div className={`particles-background ${className}`}>
      {/* Simple background effect - can be enhanced later */}
      <div className="absolute inset-0 bg-gradient-to-br from-siso-orange/5 to-blue-500/5 pointer-events-none" />
    </div>
  );
};

export default ParticlesBackground;
