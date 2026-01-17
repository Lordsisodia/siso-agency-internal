import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Zap, Award, TrendingUp, Settings, LogOut, ExternalLink } from 'lucide-react';
import { format, isToday } from 'date-fns';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface UserProfileDropdownProps {
  user: any;
  totalXP: number;
  completionPercentage: number;
  selectedDate: Date;
  userId?: string | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

interface XPLevelData {
  currentLevel: number;
  currentXP: number;
  xpForNextLevel: number;
  progress: number;
  xpToNext: number;
}

// Calculate level based on total XP (simple progression: level * 1000 XP)
const calculateLevel = (totalXP: number): XPLevelData => {
  const currentLevel = Math.floor(totalXP / 1000) + 1;
  const xpForCurrentLevel = (currentLevel - 1) * 1000;
  const currentXP = totalXP - xpForCurrentLevel;
  const xpForNextLevel = 1000;
  const progress = (currentXP / xpForNextLevel) * 100;
  const xpToNext = xpForNextLevel - currentXP;

  return {
    currentLevel,
    currentXP,
    xpForNextLevel,
    progress,
    xpToNext
  };
};

export const UserProfileDropdown: React.FC<UserProfileDropdownProps> = ({
  user,
  totalXP,
  completionPercentage,
  selectedDate,
  userId,
  isOpen,
  onOpenChange
}) => {
  const navigate = useNavigate();
  const [hasNewXP, setHasNewXP] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const levelData = useMemo(() => calculateLevel(totalXP), [totalXP]);

  // Check if today's date
  const isTodayDate = isToday(selectedDate);
  const todayXP = isTodayDate ? totalXP : 0; // Simplified - in real app would fetch from DB

  // Simulate new XP notification (in real app, this would come from state/context)
  useEffect(() => {
    if (totalXP > 0 && !hasNewXP) {
      setHasNewXP(true);
    }
  }, [totalXP]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onOpenChange(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onOpenChange]);

  const handleNavigateToXP = () => {
    navigate('/admin/lifelock/analytics');
    onOpenChange(false);
  };

  const handleNavigateToSettings = () => {
    // Navigate to settings
    onOpenChange(false);
  };

  const handleLogout = () => {
    // Handle logout
    onOpenChange(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Avatar Button */}
      <motion.button
        onClick={() => onOpenChange(!isOpen)}
        className="relative flex-shrink-0"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <img
          src={user?.imageUrl || 'https://via.placeholder.com/36'}
          alt={user?.fullName || 'Profile'}
          className="w-9 h-9 rounded-lg object-cover"
        />

        {/* Red dot indicator for new XP */}
        <AnimatePresence>
          {hasNewXP && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full border-2 border-gray-900"
            />
          )}
        </AnimatePresence>
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-40" onClick={() => onOpenChange(false)} />

            {/* Dropdown Content */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-full mt-2 w-72 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
            >
              {/* Header with Level */}
              <div className="px-5 pt-5 pb-4 border-b border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={user?.imageUrl || 'https://via.placeholder.com/48'}
                    alt={user?.fullName || 'Profile'}
                    className="w-12 h-12 rounded-xl object-cover ring-2 ring-white/10"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold truncate">{user?.fullName || 'User'}</p>
                    <p className="text-xs text-gray-400 truncate">{user?.emailAddresses?.[0]?.emailAddress || ''}</p>
                  </div>
                </div>

                {/* Level Badge */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    <span className="text-white font-bold">Level {levelData.currentLevel}</span>
                  </div>
                  <span className="text-sm text-gray-400">
                    {levelData.xpToNext} XP to next level
                  </span>
                </div>

                {/* Level Progress Bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-gray-500">Progress</span>
                    <span className="text-xs text-gray-400">
                      {levelData.currentXP} / {levelData.xpForNextLevel} XP
                    </span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${levelData.progress}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                  </div>
                </div>

                {/* Today's Stats */}
                {isTodayDate && (
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Zap className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="text-xs text-gray-400">Today</span>
                      </div>
                      <p className="text-lg font-bold text-white">+{todayXP.toLocaleString()}</p>
                      <p className="text-[10px] text-gray-500">XP earned</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                      <div className="flex items-center gap-1.5 mb-1">
                        <TrendingUp className="w-3.5 h-3.5 text-green-400" />
                        <span className="text-xs text-gray-400">Progress</span>
                      </div>
                      <p className="text-lg font-bold text-white">{Math.round(completionPercentage)}%</p>
                      <p className="text-[10px] text-gray-500">Day complete</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Menu Items */}
              <div className="py-2">
                {/* XP Analytics Link */}
                <button
                  onClick={handleNavigateToXP}
                  className="w-full px-5 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors group"
                >
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-yellow-500/20 to-amber-500/20 flex items-center justify-center flex-shrink-0">
                    <Award className="w-4 h-4 text-yellow-400" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-white group-hover:text-yellow-400 transition-colors">
                      XP Analytics
                    </p>
                    <p className="text-xs text-gray-500">View detailed stats</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-yellow-400 transition-colors" />
                </button>

                {/* Settings */}
                <button
                  onClick={handleNavigateToSettings}
                  className="w-full px-5 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors group"
                >
                  <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                    <Settings className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-white">Settings</p>
                  </div>
                </button>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="w-full px-5 py-3 flex items-center gap-3 hover:bg-red-500/10 transition-colors group"
                >
                  <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
                    <LogOut className="w-4 h-4 text-red-400" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-red-400 group-hover:text-red-300 transition-colors">
                      Logout
                    </p>
                  </div>
                </button>
              </div>

              {/* Footer */}
              <div className="px-5 py-3 bg-white/5 border-t border-white/10">
                <p className="text-[10px] text-gray-500 text-center">
                  Total XP: <span className="text-gray-400 font-semibold">{totalXP.toLocaleString()}</span>
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

UserProfileDropdown.displayName = 'UserProfileDropdown';
