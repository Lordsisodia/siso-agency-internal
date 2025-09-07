import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface SidebarSectionHeaderProps {
  icon: LucideIcon;
  title: string;
}

export const SidebarSectionHeader = ({ icon: Icon, title }: SidebarSectionHeaderProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-siso-text-bold"
    >
      <Icon className="w-4 h-4 text-siso-text-muted" />
      {title}
    </motion.div>
  );
};
