
import { motion } from "framer-motion";
import { Tab } from "./types";

interface TabNavigationProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (value: string) => void;
}

export const TabNavigation = ({ tabs, activeTab, onTabChange }: TabNavigationProps) => {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 sm:flex-row md:gap-8 mb-8">
      {tabs.map((tab, index) => (
        <motion.button
          key={tab.value}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          onClick={() => onTabChange(tab.value)}
          className={`flex items-center gap-2 rounded-xl px-6 py-4 text-sm font-semibold 
            transition-all duration-300 hover:scale-105 border
            ${activeTab === tab.value 
              ? 'text-siso-text-bold border-siso-orange bg-gradient-to-r from-siso-red/20 to-siso-orange/20 shadow-lg shadow-siso-red/10' 
              : 'text-siso-text border-transparent hover:text-siso-text-bold hover:bg-gradient-to-r hover:from-siso-red/10 hover:to-siso-orange/10'
            }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {tab.icon} {tab.label}
        </motion.button>
      ))}
    </div>
  );
};
