
import { motion } from 'framer-motion';
import { Spotlight } from '@/components/ui/spotlight';

export const PortfolioHero = () => {
  return (
    <div className="relative py-20 px-4">
      <Spotlight className="-top-40 left-0 md:left-60" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 max-w-4xl mx-auto text-center space-y-6"
      >
        <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-siso-red to-siso-orange bg-clip-text text-transparent">
          Project Portfolio
        </h1>
        <p className="text-lg md:text-xl text-siso-text/80 max-w-2xl mx-auto">
          Explore our diverse collection of web development projects, spanning across various industries from fitness and construction to web3 and hospitality.
        </p>
      </motion.div>
    </div>
  );
};
