import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { SidebarSection } from '@/components/sidebar/SidebarSection';
import { NavigationProps } from '@/components/sidebar/types';
import { getPartnershipMenuSections } from '@/components/sidebar/partnershipNavigationData';
import { affiliateNavigationItems } from '@/data/affiliateNavigation';

interface PartnershipNavigationProps extends NavigationProps {
  navigationMode?: 'partnership' | 'affiliate';
}

export const PartnershipSidebarNavigation = ({ collapsed, onItemClick, visible, navigationMode = 'partnership' }: PartnershipNavigationProps) => {
  const location = useLocation();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const menuSections = getPartnershipMenuSections();
  const affiliateItems = affiliateNavigationItems;

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
    console.log('Partnership - Current pathname:', location.pathname);
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

  // Render affiliate navigation mode (flat list)
  const renderAffiliateNavigation = () => (
    <motion.nav
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className={cn("px-2 py-2", collapsed && "px-1")}
    >
      <div className="space-y-1">
        {affiliateItems.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <a
              href={item.href}
              onClick={onItemClick}
              className={cn(
                "flex items-center px-2 py-2 rounded-lg text-sm font-medium transition-colors",
                isItemActive(item.href) 
                  ? "bg-orange-600/20 text-orange-400 border border-orange-500/30" 
                  : "text-gray-300 hover:bg-siso-bg-alt hover:text-white",
                collapsed && "justify-center px-2"
              )}
            >
              <item.icon className={cn("h-4 w-4", !collapsed && "mr-3")} />
              {!collapsed && (
                <span className="flex-1">{item.name}</span>
              )}
              {!collapsed && item.badge && (
                <span className="px-2 py-0.5 text-xs bg-orange-600 text-white rounded-full">
                  {item.badge}
                </span>
              )}
            </a>
          </motion.div>
        ))}
      </div>
    </motion.nav>
  );

  // Render partnership navigation mode (sectioned)
  const renderPartnershipNavigation = () => (
    <motion.nav
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className={cn("px-2 py-2", collapsed && "px-1")}
    >
      <div className="space-y-1">
        {menuSections.map((section, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              "space-y-0.5",
              section.type === 'section' && "border-b border-siso-border/50 pb-1 mb-1"
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

  return navigationMode === 'affiliate' ? renderAffiliateNavigation() : renderPartnershipNavigation();
};