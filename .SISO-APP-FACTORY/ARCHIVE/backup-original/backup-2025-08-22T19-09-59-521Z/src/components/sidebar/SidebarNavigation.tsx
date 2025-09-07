import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { SidebarSection } from './SidebarSection';
import { NavigationProps } from './types';
import { getMenuSections } from './navigationData';

export const SidebarNavigation = ({ collapsed, onItemClick, visible }: NavigationProps) => {
  const location = useLocation();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const menuSections = getMenuSections();

  // [Analysis] Only use IntersectionObserver for hash-based navigation
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

  // [Analysis] Enhanced debugging for route matching
  useEffect(() => {
    console.log('Current pathname:', location.pathname);
    
    // Test some key routes for debugging
    const testRoutes = ['/economy/leaderboards', '/economy/crypto-exchange', '/economy/earn'];
    testRoutes.forEach(route => {
      const isActive = isItemActive(route);
      console.log(`Route ${route} active?`, isActive);
    });
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

  const isItemActive = (href: string, isMainItem = false) => {
    // Always use the URL pathname for matching, not the hash fragment
    if (href.startsWith('#')) {
      return href === activeSection;
    }

    // Perfect match for dashboard items
    if (location.pathname === href) {
      return true;
    }

    // For main items, do a more permissive match
    if (isMainItem) {
      return location.pathname.startsWith(href);
    }

    // For sub-items that are top-level paths with slugs, match the pattern
    if (href.includes(':') && location.pathname.startsWith(href.split(':')[0])) {
      return true;
    }

    // Otherwise, use exact or prefix match depending on the specificity needed
    return location.pathname.startsWith(href);
  };

  return (
    <motion.nav
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className={cn("px-2 py-4 pb-24", collapsed && "px-1")}
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
              section.type === 'section' && "border-b border-siso-border pb-2"
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
