/**
 * XP Pill Component
 *
 * Displays XP earned for a task with color-coded tiers and glow animation
 */

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface XPPillProps {
  xp: number;
  earned: boolean; // true = earned, false = potential
  emoji?: string;
  showGlow?: boolean; // Trigger glow animation
}

export const XPPill: React.FC<XPPillProps> = ({ xp, earned, emoji, showGlow = false }) => {
  // Color tiers based on XP amount
  const getTierStyles = (amount: number) => {
    if (amount >= 200) {
      return {
        bg: 'bg-orange-500/20',
        text: 'text-orange-300',
        border: 'border-orange-500/40',
        emoji: '💎'
      };
    } else if (amount >= 100) {
      return {
        bg: 'bg-orange-500/20',
        text: 'text-orange-300',
        border: 'border-orange-500/40',
        emoji: '⭐'
      };
    } else if (amount >= 50) {
      return {
        bg: 'bg-blue-500/20',
        text: 'text-blue-300',
        border: 'border-blue-500/40',
        emoji: '⚡'
      };
    } else if (amount >= 25) {
      return {
        bg: 'bg-green-500/20',
        text: 'text-green-300',
        border: 'border-green-500/40',
        emoji: '✨'
      };
    } else {
      return {
        bg: 'bg-gray-500/20',
        text: 'text-gray-400',
        border: 'border-gray-500/40',
        emoji: '🌟'
      };
    }
  };

  const styles = getTierStyles(xp);
  const displayEmoji = emoji || styles.emoji;

  return (
    <motion.div
      className={cn(
        "px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap border flex items-center gap-1",
        earned ? [styles.bg, styles.text, styles.border] : "bg-gray-800/30 text-gray-500 border-gray-700/40"
      )}
      initial={false}
      animate={showGlow && earned ? {
        boxShadow: [
          "0 0 0px rgba(234, 179, 8, 0)",
          "0 0 12px rgba(234, 179, 8, 0.6)",
          "0 0 0px rgba(234, 179, 8, 0)"
        ]
      } : {}}
      transition={{ duration: 0.5 }}
    >
      {earned ? '+' : 'up to '}
      {xp} XP
      {earned && displayEmoji && <span>{displayEmoji}</span>}
    </motion.div>
  );
};
