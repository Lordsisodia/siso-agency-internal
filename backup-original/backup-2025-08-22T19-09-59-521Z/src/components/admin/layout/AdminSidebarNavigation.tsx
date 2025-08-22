import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { SidebarSection } from '@/components/sidebar/SidebarSection';
import { NavigationProps } from '@/components/sidebar/types';
import { getAdminMenuSections } from '@/components/sidebar/adminNavigationData';

export const AdminSidebarNavigation = ({ collapsed, onItemClick, visible }: NavigationProps) => {
  const location = useLocation();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const menuSections = getAdminMenuSections();

  // Only use IntersectionObserver for hash-based navigation
  useEffect(() => {
    if (location.hash) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveSection(`#${entry.target.id}`);
            }
          });
        },
        { threshold: 0.5 }
      );

      document.querySelectorAll('section[id]').forEach((section) => {
        observer.observe(section);
      });

      return () => observer.disconnect();
    }
  }, [location.hash]);
  
  // Log current pathname for debugging
  useEffect(() => {
    console.log('Admin - Current pathname:', location.pathname);
  }, [location.pathname]);

  if (!visible) return null;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  // Improved route matching
  const isItemActive = (href: string, isMainRoute: boolean = false) => {
    // Handle hash-based navigation
    if (href.startsWith('#')) {
      return href === activeSection;
    }

    // Remove trailing slashes for consistency
    const currentPath = location.pathname.replace(/\/$/, '');
    const targetPath = href.replace(/\/$/, '');

    // Check if the current path exactly matches the target path
    const exactMatch = currentPath === targetPath;
    
    // Check if the current path is a child of the target path
    const isChildPath = currentPath.startsWith(targetPath + '/');
    
    // For main routes, match both exact and child routes
    if (isMainRoute) {
      return exactMatch || isChildPath;
    }
    
    // For section items, use strict matching by default
    return exactMatch;
  };

  return (
    <motion.nav
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className={cn("px-2 py-4", collapsed && "px-1")}
    >
      <div className="space-y-2">
        {menuSections.map((section, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              "space-y-1",
              section.type === 'section' && "border-b border-siso-border/50 pb-2"
            )}
          >
            <SidebarSection
              section={section}
              collapsed={collapsed}
              onItemClick={onItemClick}
              isItemActive={(href) => isItemActive(href, section.type === 'main')}
            />
          </motion.div>
        ))}
      </div>
    </motion.nav>
  );
};
