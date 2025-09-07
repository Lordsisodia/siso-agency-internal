
import { motion } from 'framer-motion';

export const HeaderTitle = () => {
  return (
    <motion.div 
      className="text-center space-y-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-siso-red to-siso-orange text-transparent bg-clip-text tracking-tight">
        Tools and Platforms
      </h1>
      <p className="text-siso-text/80 max-w-2xl mx-auto text-lg sm:text-xl">
        Discover powerful tools and platforms to enhance your workflow
      </p>
    </motion.div>
  );
};
