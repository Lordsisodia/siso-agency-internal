import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  Menu, 
  X, 
  ChevronDown, 
  User, 
  LogOut,
  Shield,
  Building2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

export interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  children?: NavigationItem[];
}

export interface SidebarConfig {
  title: string;
  logo?: {
    icon: React.ComponentType<{ className?: string }>;
    text: string;
    bgColor?: string;
  };
  navigation: NavigationItem[];
  user?: {
    name: string;
    email: string;
    avatar?: string;
    role: string;
  };
  stats?: {
    title: string;
    value: string | number;
    subtitle: string;
    icon: React.ComponentType<{ className?: string }>;
  };
  theme?: {
    bgColor: string;
    borderColor: string;
    textColor: string;
    accentColor: string;
  };
}

interface UnifiedSidebarProps {
  config: SidebarConfig;
  isOpen?: boolean;
  onClose?: () => void;
  collapsible?: boolean;
  className?: string;
}

export function UnifiedSidebar({ 
  config, 
  isOpen = true, 
  onClose, 
  collapsible = true,
  className 
}: UnifiedSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const theme = config.theme || {
    bgColor: 'bg-gray-800',
    borderColor: 'border-gray-700',
    textColor: 'text-white',
    accentColor: 'bg-orange-600'
  };

  useEffect(() => {
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  }, [location.pathname, isMobile]);

  const handleSignOut = async () => {
    // TODO: Implement sign out logic
    navigate('/auth');
  };

  const sidebarVariants = {
    expanded: {
      width: isMobile ? "16rem" : "16rem",
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 25,
        mass: 0.8
      }
    },
    collapsed: {
      width: isMobile ? "0" : "4rem",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 35,
        mass: 0.8
      }
    }
  };

  const handleMouseEnter = () => {
    if (!isMobile && collapsible) {
      setIsExpanded(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile && collapsible) {
      setIsExpanded(false);
    }
  };

  const renderNavigationItem = (item: NavigationItem, isCollapsed: boolean) => {
    const isActive = location.pathname === item.href || 
      (item.children && item.children.some(child => location.pathname === child.href));
    const Icon = item.icon;

    if (item.children && item.children.length > 0) {
      return (
        <div key={item.name} className="space-y-1">
          {!isCollapsed && (
            <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {item.name}
            </div>
          )}
          {item.children.map((child) => renderNavigationItem(child, isCollapsed))}
        </div>
      );
    }

    return (
      <Link
        key={item.name}
        to={item.href}
        onClick={() => {
          if (isMobile && onClose) onClose();
        }}
        className={cn(
          "flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200",
          "min-h-[48px] relative group",
          isActive 
            ? `${theme.accentColor} text-white shadow-lg shadow-orange-500/30` 
            : `text-gray-300 hover:bg-orange-500/10 hover:text-orange-300`,
          isCollapsed && "justify-center"
        )}
        title={isCollapsed ? item.name : undefined}
      >
        <Icon className={cn(
          "flex-shrink-0 transition-colors",
          isCollapsed ? "h-6 w-6" : "h-5 w-5 mr-3"
        )} />
        
        <AnimatePresence>
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="truncate"
            >
              {item.name}
            </motion.span>
          )}
        </AnimatePresence>

        {item.badge && !isCollapsed && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="ml-auto bg-orange-500 text-white text-xs px-2 py-1 rounded-full"
          >
            {item.badge}
          </motion.span>
        )}

        {/* Tooltip for collapsed state */}
        {isCollapsed && (
          <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
            {item.name}
          </div>
        )}
      </Link>
    );
  };

  const isCollapsed = collapsible ? !isExpanded : false;

  return (
    <>
      {/* Mobile Menu Button */}
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 right-4 z-50 bg-black/90 backdrop-blur-sm border border-orange-500/40"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={isMobileMenuOpen ? 'close' : 'menu'}
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 90 }}
              transition={{ duration: 0.2 }}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6 text-white" />
              ) : (
                <Menu className="h-6 w-6 text-white" />
              )}
            </motion.div>
          </AnimatePresence>
        </Button>
      )}

      {/* Sidebar */}
      <motion.div 
        initial={false}
        animate={
          isMobile 
            ? isMobileMenuOpen ? "expanded" : "collapsed"
            : isCollapsed ? "collapsed" : "expanded"
        }
        variants={sidebarVariants}
        className={cn(
          "fixed top-0 h-screen overflow-y-auto z-40",
          theme.bgColor,
          `border-r ${theme.borderColor}`,
          "shadow-xl",
          isMobile ? 'left-0' : '',
          className
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="flex flex-col h-full">
          {/* Logo Header */}
          <div className={`p-4 border-b ${theme.borderColor} flex items-center`}>
            {config.logo && (
              <div className={cn(
                "flex items-center",
                isCollapsed ? "justify-center w-full" : "space-x-3"
              )}>
                <div className={cn(
                  "rounded-lg flex items-center justify-center",
                  config.logo.bgColor || "bg-orange-600",
                  isCollapsed ? "h-10 w-10" : "h-8 w-8"
                )}>
                  <config.logo.icon className={cn(
                    "text-white",
                    isCollapsed ? "h-6 w-6" : "h-5 w-5"
                  )} />
                </div>
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className={cn("font-semibold text-lg", theme.textColor)}
                    >
                      {config.logo.text}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {config.navigation.map((item) => renderNavigationItem(item, isCollapsed))}
          </nav>

          {/* Stats Section */}
          {config.stats && (
            <div className={`p-4 border-t ${theme.borderColor}`}>
              <AnimatePresence>
                {!isCollapsed ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="bg-gray-900 border border-orange-500/20 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-300 text-sm">{config.stats.title}</span>
                      <config.stats.icon className="h-5 w-5 text-orange-500" />
                    </div>
                    <div className="text-2xl font-bold text-white">{config.stats.value}</div>
                    <div className="text-sm text-gray-400">{config.stats.subtitle}</div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-center"
                  >
                    <config.stats.icon className="h-6 w-6 text-orange-500" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* User Profile */}
          {config.user && (
            <div className={`p-4 border-t ${theme.borderColor}`}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className={cn(
                      "w-full justify-start px-2 hover:bg-orange-500/10",
                      isCollapsed && "justify-center px-0"
                    )}
                  >
                    <div className={cn(
                      "flex items-center",
                      isCollapsed ? "" : "gap-3 w-full"
                    )}>
                      <Avatar className="h-8 w-8 border border-gray-600">
                        <AvatarImage src={config.user.avatar} />
                        <AvatarFallback className="bg-gray-600 text-white">
                          {config.user.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <AnimatePresence>
                        {!isCollapsed && (
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="flex flex-col items-start text-left min-w-0 flex-1"
                          >
                            <span className="text-sm font-medium text-white truncate">
                              {config.user.name}
                            </span>
                            <span className="text-xs text-gray-400">{config.user.role}</span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      {!isCollapsed && <ChevronDown className="ml-auto h-4 w-4 opacity-50" />}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="w-56 bg-black border-orange-500/20"
                >
                  <DropdownMenuItem 
                    className="text-gray-300 focus:bg-orange-500/10"
                    onClick={() => navigate('/dashboard/profile')}
                  >
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile & Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-orange-500/20" />
                  <DropdownMenuItem 
                    className="text-gray-300 focus:bg-orange-500/10 cursor-pointer"
                    onClick={handleSignOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </motion.div>

      {/* Mobile Overlay */}
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
} 