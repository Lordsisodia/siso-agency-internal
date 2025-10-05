import { Link } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SidebarMenuItemProps {
  href: string;
  icon: LucideIcon;
  label: string;
  collapsed: boolean;
  onClick: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  className?: string;
  isMain?: boolean;
  isActive?: boolean;
}

export const SidebarMenuItem = ({
  href,
  icon: Icon,
  label,
  collapsed,
  onClick,
  className,
  isMain,
  isActive
}: SidebarMenuItemProps) => {
  // [Analysis] Improved spring animations for smoother transitions
  const menuItemVariants = {
    initial: { 
      opacity: 0, 
      x: -20 
    },
    animate: { 
      opacity: 1, 
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25,
        mass: 1.2
      }
    },
    exit: { 
      opacity: 0, 
      x: -20,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    }
  };

  // [Analysis] Enhanced highlight animation with better spring physics
  const highlightVariants = {
    initial: {
      opacity: 0,
      scale: 0.95,
      y: "-50%"
    },
    animate: {
      opacity: 1,
      scale: 1,
      y: "-50%",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25,
        mass: 1.2
      }
    }
  };

  const menuItem = (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={menuItemVariants}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="relative pointer-events-none"
    >
      <Link
        to={href}
        onClick={onClick}
        className={cn(
          'relative flex items-center gap-3 rounded-lg px-3 py-2 text-siso-text transition-all duration-300',
          'pointer-events-auto cursor-pointer z-10', // Ensure clickability in Electron
          isActive && 'bg-gradient-to-r from-siso-red/10 to-siso-orange/10 text-siso-text-bold shadow-sm',
          !isActive && 'hover:bg-gradient-to-r hover:from-siso-red/5 hover:to-siso-orange/5 hover:text-siso-text-bold',
          isMain ? 'text-base font-semibold' : 'text-sm',
          collapsed ? 'justify-center' : '',
          className
        )}
      >
        <motion.div
          whileHover={{ scale: 1.1 }}
          transition={{ 
            type: "spring", 
            stiffness: 400, 
            damping: 17 
          }}
          className="relative"
        >
          <Icon 
            className={cn(
              isMain ? "w-5 h-5" : "w-4 h-4",
              isActive ? "text-siso-orange" : "text-siso-text group-hover:text-siso-orange",
              "transition-colors duration-300"
            )} 
          />
          {isActive && (
            <motion.div 
              className="absolute inset-0 blur-lg bg-siso-orange/30 -z-10 pointer-events-none"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          )}
        </motion.div>

        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 25,
                mass: 1.2
              }}
              className="truncate font-medium"
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>

        {isActive && (
          <motion.div
            layoutId="sidebar-highlight"
            className="absolute left-0 top-0 h-full w-full rounded-lg bg-gradient-to-r from-siso-red/5 to-siso-orange/5 -z-10 pointer-events-none"
            initial="initial"
            animate="animate"
            variants={highlightVariants}
          >
            <motion.div 
              className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-gradient-to-b from-siso-red to-siso-orange rounded-r-full pointer-events-none"
              animate={{
                boxShadow: [
                  "0 0 10px rgba(255, 87, 34, 0.3)",
                  "0 0 20px rgba(255, 167, 38, 0.5)",
                  "0 0 10px rgba(255, 87, 34, 0.3)"
                ],
                opacity: [0.7, 1, 0.7]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <div className="absolute w-8 h-8 bg-siso-orange/20 rounded-full blur-xl -left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </motion.div>
          </motion.div>
        )}
      </Link>
    </motion.div>
  );

  if (collapsed) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {menuItem}
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={20}>
            <motion.p
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="font-medium"
            >
              {label}
            </motion.p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return menuItem;
};
