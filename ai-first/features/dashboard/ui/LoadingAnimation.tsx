import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Calendar, Target, TrendingUp } from 'lucide-react';

interface LoadingAnimationProps {
  message?: string;
  className?: string;
}

export const LoadingAnimation: React.FC<LoadingAnimationProps> = ({
  message = "Loading your LifeLock data...",
  className = ""
}) => {
  return (
    <div className={`min-h-screen w-full bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center ${className}`}>
      <div className="text-center space-y-8 max-w-md mx-auto px-6">
        {/* Animated Lock Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative mx-auto w-24 h-24"
        >
          {/* Glowing background */}
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute inset-0 bg-gradient-to-br from-orange-500/30 to-yellow-500/30 rounded-full blur-lg"
          />
          
          {/* Main icon container */}
          <div className="relative w-full h-full bg-gradient-to-br from-orange-500 via-orange-400 to-yellow-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-orange-500/50 border border-orange-300/30 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
            <Lock className="h-12 w-12 text-white relative z-10" />
          </div>
        </motion.div>

        {/* Floating Icons */}
        <div className="relative h-16">
          <motion.div
            animate={{ 
              y: [-10, 10, -10],
              rotate: [0, 5, -5, 0],
              opacity: [0.4, 0.8, 0.4]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0
            }}
            className="absolute left-0 top-0"
          >
            <Calendar className="h-6 w-6 text-orange-400" />
          </motion.div>
          
          <motion.div
            animate={{ 
              y: [10, -10, 10],
              rotate: [0, -5, 5, 0],
              opacity: [0.4, 0.8, 0.4]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
            className="absolute right-0 top-0"
          >
            <Target className="h-6 w-6 text-yellow-400" />
          </motion.div>
          
          <motion.div
            animate={{ 
              y: [-5, 15, -5],
              rotate: [0, 10, -10, 0],
              opacity: [0.4, 0.8, 0.4]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
            className="absolute left-1/2 transform -translate-x-1/2 top-0"
          >
            <TrendingUp className="h-6 w-6 text-emerald-400" />
          </motion.div>
        </div>

        {/* Loading Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="space-y-4"
        >
          <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-500 bg-clip-text text-transparent">
            Life Lock
          </h2>
          
          <p className="text-gray-300 text-lg font-medium">
            {message}
          </p>
          
          {/* Animated Progress Dots */}
          <div className="flex items-center justify-center space-x-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.3, 1, 0.3]
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut"
                }}
                className="w-2 h-2 bg-gradient-to-r from-orange-400 to-yellow-500 rounded-full"
              />
            ))}
          </div>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: "100%" }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="relative"
        >
          <div className="w-full bg-gray-800/60 rounded-full h-2 overflow-hidden border border-orange-400/30">
            <motion.div
              animate={{
                x: ["-100%", "100%"]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="h-full bg-gradient-to-r from-transparent via-orange-400 to-transparent w-1/3"
            />
          </div>
        </motion.div>

        {/* Subtle hint text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="text-gray-500 text-sm"
        >
          Preparing your daily dashboard...
        </motion.p>
      </div>
    </div>
  );
};

export default LoadingAnimation;