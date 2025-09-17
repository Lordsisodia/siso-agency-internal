import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PartnershipSidebarLogo from './PartnershipSidebarLogo';
import { PartnershipSidebarNavigation } from './PartnershipSidebarNavigation';
import { SidebarFooter } from '@/shared/sidebar/SidebarFooter';
import { Menu, X, DollarSign, ArrowUpRight } from 'lucide-react';
import { useIsMobile } from '@/shared/hooks/use-mobile';
import { Button } from '@/shared/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

export const PartnershipSidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNavigation, setShowNavigation] = useState(true);
  const [navigationMode, setNavigationMode] = useState<'partnership' | 'affiliate'>('partnership');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [commissionStats] = useState({
    total: 2450,
    growth: 12,
    period: 'this month'
  });
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  const handleItemClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const href = e.currentTarget.getAttribute('href');
    
    if (!href) return;

    if (href.startsWith('/')) {
      navigate(href);
      if (isMobile) {
        setIsMobileMenuOpen(false);
      }
      return;
    }

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
  };

  useEffect(() => {
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  }, [location.pathname, isMobile]);

  const sidebarVariants = {
    expanded: {
      width: isMobile ? "16rem" : "16rem",
      transition: {
        type: "spring" as const,
        stiffness: 200,
        damping: 25,
        mass: 0.8
      }
    },
    collapsed: {
      width: isMobile ? "0" : "4rem",
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 35,
        mass: 0.8
      }
    }
  };

  const handleMouseEnter = () => {
    if (!isMobile && !isProfileOpen) {
      setIsExpanded(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile && !isProfileOpen) {
      setIsExpanded(false);
    }
  };

  return (
    <>
      {isMobile && (
        <motion.div
          initial={false}
          animate={{ scale: 1 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            variant="ghost"
            size="icon"
            className="fixed top-4 right-4 z-50 bg-siso-bg/90 backdrop-blur-sm border border-siso-border"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={isMobileMenuOpen ? 'close' : 'menu'}
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 90 }}
                transition={{ duration: 0.2 }}
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6 text-siso-text" />
                ) : (
                  <Menu className="h-6 w-6 text-siso-text" />
                )}
              </motion.div>
            </AnimatePresence>
          </Button>
        </motion.div>
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
          fixed top-0 h-screen overflow-hidden
          bg-gradient-to-b from-siso-bg via-siso-bg to-siso-bg-alt backdrop-blur-sm
          border-r border-siso-border shadow-xl
          flex flex-col
          ${isMobile ? 'left-0 z-40' : ''}
        `}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <PartnershipSidebarLogo 
          collapsed={!isExpanded} 
          setCollapsed={() => setIsExpanded(!isExpanded)}
          onLogoClick={() => {
            if (showNavigation) {
              setNavigationMode(navigationMode === 'partnership' ? 'affiliate' : 'partnership');
            } else {
              setShowNavigation(true);
            }
          }}
          navigationMode={navigationMode}
        />
        
        <div className="flex-1 flex flex-col min-h-0 relative">
          <div className="flex-1 overflow-y-auto pb-32">
            <AnimatePresence mode="wait">
              <PartnershipSidebarNavigation 
                collapsed={!isExpanded} 
                onItemClick={handleItemClick}
                visible={showNavigation}
                navigationMode={navigationMode}
              />
            </AnimatePresence>
          </div>
          
          {/* Commission Stats Box - Fixed above footer with proper clearance */}
          <div className="absolute bottom-24 left-0 right-0 px-3 py-3">
            <AnimatePresence>
              {!isExpanded ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex justify-center mb-2"
                >
                  <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center shadow-lg">
                    <DollarSign className="h-4 w-4 text-white" />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="bg-gradient-to-r from-orange-600/20 to-yellow-600/20 border border-orange-500/30 rounded-lg p-4 shadow-lg mb-2"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300 text-sm font-medium">Total Commission</span>
                    <DollarSign className="h-4 w-4 text-orange-500" />
                  </div>
                  <div className="text-2xl font-bold text-white">£{commissionStats.total.toLocaleString()}</div>
                  <div className="text-sm text-green-400 flex items-center mt-1">
                    <ArrowUpRight className="w-3 h-3 mr-1" />
                    +{commissionStats.growth}% {commissionStats.period}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <SidebarFooter 
            collapsed={!isExpanded} 
            onProfileOpen={(isOpen) => {
              setIsProfileOpen(isOpen);
              if (isOpen) setIsExpanded(true);
            }}
          />
        </div>
      </motion.div>

      <motion.div 
        className="min-h-screen"
        animate={{
          marginLeft: !isMobile ? (isExpanded ? '16rem' : '4rem') : 0
        }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 25
        }}
      >
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
      </motion.div>
    </>
  );
};