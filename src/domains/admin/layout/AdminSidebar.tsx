import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AdminSidebarLogo from './AdminSidebarLogo';
import { AdminSidebarNavigation } from './AdminSidebarNavigation';
import { SidebarFooter } from '@/components/sidebar/SidebarFooter';
import { Menu, X } from 'lucide-react';
import { useIsMobile } from '@/lib/hooks/use-mobile';
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

  // TEMPORARILY HIDDEN: Burger menu button - moved to More menu in bottom nav
  const renderBurgerMenu = () => null;

  // Desktop & Mobile: TEMPORARILY HIDDEN sidebar - moved to More menu in bottom nav
  return null;
};
