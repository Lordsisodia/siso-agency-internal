/**
 * AI Legacy Orb Button Component
 *
 * Animated center piece for the 3x3 grid More menu
 * Features pulsing glow, rotating gradient, and sparkle effects
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Brain } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AIOrbButtonProps {
  onClick?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const AIOrbButton: React.FC<AIOrbButtonProps> = ({
  onClick,
  className = '',
  size = 'md'
}) => {
  const [pulsePhase, setPulsePhase] = useState(0);

  // Continuous pulse animation
  useEffect(() => {
    const interval = setInterval(() => {
      setPulsePhase(prev => (prev + 1) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-20 h-20',
    lg: 'w-24 h-24'
  };

  const iconSizes = {
    sm: 20,
    md: 24,
    lg: 28
  };

  // Calculate pulsing values
  const scale = 1 + Math.sin(pulsePhase * 0.1) * 0.05;
  const glowOpacity = 0.3 + Math.sin(pulsePhase * 0.08) * 0.2;
  const rotation = pulsePhase * 2;

  return (
    <motion.button
      onClick={onClick}
      className={cn(
        'relative rounded-full flex items-center justify-center',
        'bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500',
        'border-2 border-white/30',
        'shadow-lg shadow-purple-500/50',
        'transition-transform duration-200',
        'hover:scale-110 active:scale-95',
        sizeClasses[size],
        className
      )}
      style={{
        transform: `scale(${scale})`,
        boxShadow: `0 0 ${30 + pulsePhase * 0.5}px rgba(168, 85, 247, ${glowOpacity})`
      }}
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Rotating gradient overlay */}
      <motion.div
        className="absolute inset-0 rounded-full opacity-50"
        style={{
          background: 'conic-gradient(from 0deg, transparent, rgba(255,255,255,0.3), transparent)',
          transform: `rotate(${rotation}deg)`
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
      />

      {/* Inner glow */}
      <div className="absolute inset-2 rounded-full bg-gradient-to-br from-purple-400/20 to-cyan-400/20 blur-sm" />

      {/* Icon */}
      <motion.div
        animate={{ rotate: [0, 5, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Sparkles
          className={cn('text-white drop-shadow-lg', `w-${iconSizes[size]} h-${iconSizes[size]}`)}
          style={{ width: iconSizes[size], height: iconSizes[size] }}
          strokeWidth={2.5}
        />
      </motion.div>

      {/* Sparkle particles */}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white rounded-full"
          style={{
            top: '50%',
            left: '50%',
          }}
          animate={{
            x: [0, Math.cos((i * Math.PI * 2) / 4) * 35],
            y: [0, Math.sin((i * Math.PI * 2) / 4) * 35],
            opacity: [0, 1, 0],
            scale: [0, 1, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.3,
            ease: 'easeOut'
          }}
        />
      ))}

      {/* Outer ring */}
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-white/20"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 0, 0.5]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeOut'
        }}
      />
    </motion.button>
  );
};

export default AIOrbButton;
