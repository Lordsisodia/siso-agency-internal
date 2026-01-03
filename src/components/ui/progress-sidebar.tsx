import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ProgressSidebarProps {
  totalTasks?: number;
  completedTasks?: number;
  className?: string;
}

export const ProgressSidebar: React.FC<ProgressSidebarProps> = ({
  totalTasks = 0,
  completedTasks = 0,
  className = ''
}) => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const winScroll = document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      setScrollProgress(Math.min(scrolled, 100));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const taskProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <div className={`fixed left-0 top-0 h-screen w-2 z-40 ${className}`}>
      {/* Background track */}
      <div className="absolute inset-0 bg-gray-800/30 backdrop-blur-sm" />
      
      {/* Scroll Progress (Orange) */}
      <motion.div
        className="absolute left-0 top-0 w-full bg-gradient-to-b from-orange-500 to-orange-600 shadow-lg"
        initial={{ height: 0 }}
        animate={{ height: `${scrollProgress}%` }}
        transition={{ duration: 0.1, ease: "easeOut" }}
      />
      
      {/* Task Completion Progress (Green overlay) */}
      {totalTasks > 0 && (
        <motion.div
          className="absolute left-0 top-0 w-full bg-gradient-to-b from-emerald-500 to-emerald-600 opacity-80 shadow-lg"
          initial={{ height: 0 }}
          animate={{ height: `${taskProgress}%` }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          style={{
            boxShadow: '2px 0 8px rgba(16, 185, 129, 0.3)'
          }}
        />
      )}
      
      {/* Glow effects */}
      <div 
        className="absolute left-0 top-0 w-1 bg-orange-400/50 blur-sm"
        style={{ height: `${scrollProgress}%` }}
      />
      {totalTasks > 0 && (
        <div 
          className="absolute left-0 top-0 w-1 bg-emerald-400/50 blur-sm"
          style={{ height: `${taskProgress}%` }}
        />
      )}
      
      {/* Progress indicators */}
      <div className="absolute -right-20 top-4 text-xs text-gray-400 bg-gray-900/80 backdrop-blur-sm px-2 py-1 rounded-r-md border border-gray-700">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-orange-500 rounded-full" />
            <span>Scroll: {Math.round(scrollProgress)}%</span>
          </div>
          {totalTasks > 0 && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-emerald-500 rounded-full" />
              <span>Tasks: {completedTasks}/{totalTasks}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};