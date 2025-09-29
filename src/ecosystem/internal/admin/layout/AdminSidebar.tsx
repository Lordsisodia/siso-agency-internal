import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AdminSidebarLogo from './AdminSidebarLogo';
import { AdminSidebarNavigation } from './AdminSidebarNavigation';
import { SidebarFooter } from '@/shared/sidebar/SidebarFooter';
import { Menu, X } from 'lucide-react';
import { useIsMobile } from '@/shared/hooks/use-mobile';
import { Button } from '@/shared/ui/button';
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
  }, [location.pathname, isMobile]);

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
    // Keep desktop sidebar collapsed (icons-only) - no hover expand
  };

  const handleMouseLeave = () => {
    // Keep desktop sidebar collapsed (icons-only) - no hover expand
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

  // Don't render sidebar at all on mobile - complete override
  if (isMobile || window.innerWidth < 768) {
    return (
      <>
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 right-4 z-50 bg-siso-bg/90 backdrop-blur-sm border border-siso-border"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            
            if (isToggling) return;
            
            setIsToggling(true);
            setIsMobileMenuOpen(prev => !prev);
            
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

        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0, x: "-100%" }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: "-100%" }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="fixed top-0 left-0 h-screen w-64 z-40 bg-gradient-to-b from-siso-bg via-siso-bg to-siso-bg-alt backdrop-blur-sm border-r border-siso-border shadow-xl flex flex-col"
              >
                <AdminSidebarLogo collapsed={false} setCollapsed={() => {}} onLogoClick={() => setShowNavigation(!showNavigation)} />
                <div className="flex-1 overflow-y-auto admin-sidebar">
                  <AdminSidebarNavigation collapsed={false} onItemClick={handleItemClick} visible={showNavigation} />
                </div>
                <SidebarFooter collapsed={false} onProfileOpen={(isOpen) => setIsProfileOpen(isOpen)} />
              </motion.div>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
                onClick={() => setIsMobileMenuOpen(false)}
              />
            </>
          )}
        </AnimatePresence>
      </>
    );
  }

  return (
    <>

      <motion.div 
        initial={false}
        animate={
          isMobile 
            ? isMobileMenuOpen ? "expanded" : "collapsed"
            : "collapsed"  // Always keep desktop sidebar collapsed (icons-only)
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
          collapsed={isMobile ? !isMobileMenuOpen : true}  // Always collapsed on desktop 
          setCollapsed={() => setIsExpanded(!isExpanded)}
          onLogoClick={() => setShowNavigation(!showNavigation)}
        />
        <div className="flex-1 overflow-y-auto admin-sidebar">
          <AnimatePresence mode="wait">
            <AdminSidebarNavigation 
              collapsed={isMobile ? !isMobileMenuOpen : true}  // Always collapsed on desktop 
              onItemClick={handleItemClick}
              visible={showNavigation}
            />
          </AnimatePresence>
        </div>
        <SidebarFooter 
          collapsed={isMobile ? !isMobileMenuOpen : true}  // Always collapsed on desktop 
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
