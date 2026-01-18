
import { motion } from 'framer-motion';
import { Package, Star, Download, Grid } from 'lucide-react';
import CountUp from 'react-countup';

interface StatsDisplayProps {
  totalTools: number;
  categoryStats: { [key: string]: number };
}

export const StatsDisplay = ({ totalTools, categoryStats }: StatsDisplayProps) => {
  const featuredCount = Object.values(categoryStats).find(count => count > 0) || 0;
  const activeCategories = Object.keys(categoryStats).length;
  
  // Helper function to format numbers with thousand separators
  const formatNumber = (num: number) => num.toLocaleString('en-US');

  const stats = [
    {
      icon: Package,
      label: "Total Tools",
      value: totalTools,
      color: "text-siso-orange"
    },
    {
      icon: Grid,
      label: "Categories",
      value: activeCategories,
      color: "text-blue-500"
    },
    {
      icon: Star,
      label: "Featured",
      value: featuredCount,
      color: "text-yellow-500"
    },
    {
      icon: Download,
      label: "Downloads",
      value: totalTools * 10, // Example calculation
      color: "text-green-500"
    }
  ];

  return (
    <motion.div 
      className="flex justify-center gap-4 flex-wrap py-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-siso-text/5 hover:bg-siso-text/10 transition-all duration-300"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Icon className={`w-4 h-4 ${stat.color}`} />
            <div className="flex items-baseline gap-1.5">
              <CountUp
                end={stat.value}
                delay={0}
                decimals={0}
                className="text-lg font-semibold text-siso-text-bold"
              />
              <span className="text-sm text-siso-text/70">{stat.label}</span>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
};
