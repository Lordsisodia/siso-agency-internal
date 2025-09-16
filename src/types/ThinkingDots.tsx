
import { motion } from 'framer-motion';

export const ThinkingDots = () => (
  <div className="flex gap-1.5 items-center h-4">
    {[0, 1, 2].map((i) => (
      <motion.div
        key={i}
        className="w-1.5 h-1.5 bg-siso-orange/50 rounded-full"
        animate={{ 
          opacity: [0.2, 1, 0.2], 
          scale: [0.8, 1.2, 0.8],
          y: [0, -3, 0]
        }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          delay: i * 0.2,
          ease: "easeInOut"
        }}
      />
    ))}
  </div>
);
