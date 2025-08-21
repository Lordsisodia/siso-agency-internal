import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AdminSidebarLogo from './AdminSidebarLogo';
import { AdminSidebarNavigation } from './AdminSidebarNavigation';
import { SidebarFooter } from '@/components/sidebar/SidebarFooter';
import { Menu, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
  onExpandedChange?: (expanded: boolean) => void;
  onMobileMenuChange?: (open: boolean) => void;
}

export const Sidebar = ({ onExpandedChange, onMobileMenuChange }: SidebarProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNavigation, setShowNavigation] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  const handleItemClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const href = e.currentTarget.getAttribute('href');
    
    if (!href) return;

    // Always navigate for admin routes - no smooth scrolling needed
    if (href.startsWith('/') || href.startsWith('#/')) {
      const path = href.startsWith('#/') ? href.substring(1) : href;
      navigate(path);
      if (isMobile) {
        setIsMobileMenuOpen(false);
      }
      return;
    }

    // Only try querySelector for actual hash fragments (not routes)
    if (href.startsWith('#') && !href.startsWith('#/')) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
        if (isMobile) {
          setIsMobileMenuOpen(false);
        }
      }
    }
  };

  useEffect(() => {
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  }, [location.pathname]);

  const sidebarVariants = {
    expanded: {
      width: "16rem",
      x: 0,
      transition: {
        type: "tween" as const,
        duration: 0.1,
        ease: "easeOut"
      }
    },
    collapsed: {
      width: isMobile ? "16rem" : "4rem",
      x: isMobile ? "-16rem" : 0,
      transition: {
        type: "tween" as const,
        duration: 0.1,
        ease: "easeIn"
      }
    }
  };

  const handleMouseEnter = () => {
    if (!isMobile && !isProfileOpen) {
      setIsExpanded(true);
      onExpandedChange?.(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile && !isProfileOpen) {
      setIsExpanded(false);
      onExpandedChange?.(false);
    }
  };

  // Notify parent when mobile menu state changes
  useEffect(() => {
    onMobileMenuChange?.(isMobileMenuOpen);
  }, [isMobileMenuOpen, onMobileMenuChange]);

  // Notify parent when desktop expanded state changes
  useEffect(() => {
    if (!isMobile) {
      onExpandedChange?.(isExpanded);
    }
  }, [isExpanded, isMobile, onExpandedChange]);

  return (
    <>
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 right-4 z-50 bg-siso-bg/90 backdrop-blur-sm border border-siso-border"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Prevent double-clicks
            if (isToggling) return;
            
            setIsToggling(true);
            setIsMobileMenuOpen(prev => !prev);
            
            // Reset toggle lock after animation
            setTimeout(() => setIsToggling(false), 200);
          }}
          disabled={isToggling}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={isMobileMenuOpen ? 'close' : 'menu'}
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 90 }}
              transition={{ duration: 0.15 }}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6 text-siso-text" />
              ) : (
                <Menu className="h-6 w-6 text-siso-text" />
              )}
            </motion.div>
          </AnimatePresence>
        </Button>
      )}

      <motion.div 
        initial={false}
        animate={
          isMobile 
            ? isMobileMenuOpen ? "expanded" : "collapsed"
            : isExpanded ? "expanded" : "collapsed"
        }
        variants={sidebarVariants}
        className={`
          fixed top-0 left-0 h-screen
          bg-gradient-to-b from-siso-bg via-siso-bg to-siso-bg-alt backdrop-blur-sm
          border-r border-siso-border shadow-xl
          flex flex-col
          ${isMobile ? 'z-40' : 'z-50'}
          ${isMobile && !isMobileMenuOpen ? 'pointer-events-none' : ''}
        `}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <AdminSidebarLogo 
          collapsed={isMobile ? !isMobileMenuOpen : !isExpanded} 
          setCollapsed={() => setIsExpanded(!isExpanded)}
          onLogoClick={() => setShowNavigation(!showNavigation)}
        />
        <div className="flex-1 overflow-y-auto admin-sidebar">
          <AnimatePresence mode="wait">
            <AdminSidebarNavigation 
              collapsed={isMobile ? !isMobileMenuOpen : !isExpanded} 
              onItemClick={handleItemClick}
              visible={showNavigation}
            />
          </AnimatePresence>
        </div>
        <SidebarFooter 
          collapsed={isMobile ? !isMobileMenuOpen : !isExpanded} 
          onProfileOpen={(isOpen) => {
            setIsProfileOpen(isOpen);
            if (isOpen) setIsExpanded(true);
          }}
        />
      </motion.div>

      <AnimatePresence>
        {isMobile && isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};
