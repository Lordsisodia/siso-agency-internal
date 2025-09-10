import React from 'react';
import { motion } from 'framer-motion';
import type { ProgressIndicatorProps } from '../types';

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  tasks,
  showXP = true
}) => {
  // Calculate total progress
  const getTotalProgress = () => {
    let totalTasks = 0;
    let completedTasks = 0;
    
    tasks.forEach(task => {
      if (task.subTasks.length > 0) {
        totalTasks += task.subTasks.length;
        completedTasks += task.subTasks.filter(sub => sub.completed).length;
      } else {
        totalTasks += 1;
        if (task.completed) completedTasks += 1;
      }
    });
    
    return totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  };

  // Calculate XP progress
  const getXPProgress = () => {
    let totalXP = 0;
    let earnedXP = 0;
    
    tasks.forEach(task => {
      // Main task XP (base points)
      const mainTaskXP = 10;
      totalXP += mainTaskXP;
      if (task.completed) earnedXP += mainTaskXP;
      
      // Subtask XP (smaller points per subtask)
      task.subTasks.forEach(subtask => {
        const subtaskXP = 5;
        totalXP += subtaskXP;
        if (subtask.completed) earnedXP += subtaskXP;
      });
    });
    
    return { earnedXP, totalXP, percentage: totalXP > 0 ? (earnedXP / totalXP) * 100 : 0 };
  };

  const xpProgress = getXPProgress();

  return (
    <div className="space-y-4">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-green-300">Progress</span>
          <span className="text-green-400">{Math.round(getTotalProgress())}%</span>
        </div>
        <div className="w-full bg-green-900/30 rounded-full h-2">
          <motion.div 
            className="bg-green-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${getTotalProgress()}%` }}
            initial={{ width: 0 }}
            animate={{ width: `${getTotalProgress()}%` }}
          />
        </div>
      </div>

      {/* XP Bar */}
      {showXP && (
        <div className="space-y-2 mt-4">
          <div className="flex justify-between text-sm">
            <span className="text-green-300 flex items-center">
              ⚡ XP Today
            </span>
            <span className="text-green-400 font-bold">
              {xpProgress.earnedXP} / {xpProgress.totalXP} XP
            </span>
          </div>
          <div className="w-full bg-green-900/30 rounded-full h-3 border border-green-700/30">
            <motion.div 
              className="bg-gradient-to-r from-green-400 via-green-500 to-emerald-400 h-full rounded-full transition-all duration-500 shadow-sm relative overflow-hidden"
              style={{ width: `${xpProgress.percentage}%` }}
              initial={{ width: 0 }}
              animate={{ width: `${xpProgress.percentage}%` }}
            >
              {/* Shimmer effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{
                  x: ['-100%', '100%'],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
            </motion.div>
          </div>
          <div className="flex justify-between text-xs text-green-300/70">
            <span>Level 1</span>
            <span>{Math.round(xpProgress.percentage)}% Complete</span>
          </div>
        </div>
      )}
    </div>
  );
};