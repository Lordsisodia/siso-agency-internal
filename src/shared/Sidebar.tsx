import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import SidebarLogo from './sidebar/SidebarLogo';
import { SidebarNavigation } from './sidebar/SidebarNavigation';
import { SidebarFooter } from './sidebar/SidebarFooter';
import { Menu, X, FolderOpen, ChevronDown, User, LogOut } from 'lucide-react';
import { useIsMobile } from '@/shared/hooks/use-mobile';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelectedProject } from '@/ecosystem/internal/projects/hooks/useSelectedProject';
import { CollapsedProjectCard } from '@/client/client/CollapsedProjectCard';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { Badge } from '@/shared/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';

export const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNavigation, setShowNavigation] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [wasManuallyExpanded, setWasManuallyExpanded] = useState(false);
  const [isProjectMenuOpen, setIsProjectMenuOpen] = useState(false);
  const ignoreMouseLeaveUntil = useRef<number>(0);
  const projectMenuButtonRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const { selectedProject, projects, selectProject } = useSelectedProject();

  const handleItemClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    
    // Set the sidebar to stay expanded when clicking navigation items
    if (!isMobile) {
      ignoreMouseLeaveUntil.current = Date.now() + 2000; // 2 seconds
      setWasManuallyExpanded(true);
      setIsExpanded(true);
    }
    
    const href = e.currentTarget.getAttribute('href');
    if (!href) return;

    console.log('Navigating to:', href); // Debug log

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
  }, [location.pathname]);

  const sidebarVariants = {
    expanded: {
      width: isMobile ? "16rem" : "16rem",
      transition: {
        type: "tween" as const,
        duration: 0.1,
        ease: "easeOut"
      }
    },
    collapsed: {
      width: isMobile ? "0" : "4rem",
      transition: {
        type: "tween" as const,
        duration: 0.1,
        ease: "easeIn"
      }
    }
  };

  const handleMouseEnter = () => {
    if (!isMobile && !isProfileOpen && !wasManuallyExpanded) {
      setIsExpanded(true);
    }
  };

  const handleMouseLeave = () => {
    // Prevent sidebar from collapsing if we recently had a manual click
    if (!isMobile && !isProfileOpen && Date.now() > ignoreMouseLeaveUntil.current) {
      setIsExpanded(false);
      setWasManuallyExpanded(false);
      setIsProjectMenuOpen(false);
    }
  };

  const handleProjectIconClick = () => {
    // Set a timestamp to ignore mouseLeave events for a short period
    ignoreMouseLeaveUntil.current = Date.now() + 2000; // Increase to 2 seconds
    
    // Expand the sidebar
    setIsExpanded(true);
    setWasManuallyExpanded(true);
    
    // Use a small timeout to ensure the expanded view is rendered before opening dropdown
    setTimeout(() => {
      setIsProjectMenuOpen(true);
      
      // Simulate click on the project menu button to open the dropdown
      if (projectMenuButtonRef.current) {
        projectMenuButtonRef.current.click();
      }
    }, 300);
  };

  // For programmatic navigation without closing sidebar
  const handleManualNavigation = (path: string) => {
    ignoreMouseLeaveUntil.current = Date.now() + 2000;
    setWasManuallyExpanded(true);
    navigate(path);
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case "active": return "bg-green-500/20 text-green-400 border-green-500/20";
      case "paused": return "bg-amber-500/20 text-amber-400 border-amber-500/20";
      case "completed": return "bg-blue-500/20 text-blue-400 border-blue-500/20";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/20";
    }
  };

  return (
    <>
      {/* Mobile Menu Button with smooth icon transition */}
      {isMobile && (
        <motion.div
          initial={false}
          animate={{ scale: 1 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            variant="ghost"
            size="icon"
            className="fixed top-4 right-4 z-50 bg-siso-bg/80 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <AnimatePresence initial={false} mode="sync">
              <motion.div
                key={isMobileMenuOpen ? 'close' : 'menu'}
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 90 }}
                transition={{ duration: 0.1 }}
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

      {/* Sidebar with improved animations */}
      <motion.div 
        initial={false}
        animate={
          isMobile 
            ? isMobileMenuOpen ? "expanded" : "collapsed"
            : isExpanded ? "expanded" : "collapsed"
        }
        variants={sidebarVariants}
        className={`
          fixed top-0 h-screen overflow-y-auto
          bg-gradient-to-b from-siso-bg to-siso-bg/95 
          border-r border-siso-text/10 shadow-lg
          ${isMobile ? 'left-0 z-40' : ''}
        `}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <SidebarLogo 
          collapsed={!isExpanded} 
          setCollapsed={() => {
            setIsExpanded(!isExpanded);
            if (!isExpanded) {
              // When expanding via logo click, treat as manual expansion
              setWasManuallyExpanded(true);
              ignoreMouseLeaveUntil.current = Date.now() + 2000;
            }
          }}
          onLogoClick={() => setShowNavigation(!showNavigation)}
        />
        
        {/* Project Selector - Expanded View */}
        {isExpanded ? (
          <div className="mx-4 my-4">
            <DropdownMenu open={isProjectMenuOpen} onOpenChange={setIsProjectMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button 
                  ref={projectMenuButtonRef}
                  variant="outline" 
                  className="w-full h-16 justify-between bg-siso-bg-alt border-siso-border hover:bg-siso-bg-alt/80 hover:border-siso-border-hover group transition-all duration-150"
                  onClick={() => {
                    // When clicking project button, keep sidebar open
                    ignoreMouseLeaveUntil.current = Date.now() + 2000;
                    setWasManuallyExpanded(true);
                  }}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    {selectedProject?.logo ? (
                      <Avatar className="h-10 w-10 rounded-md border border-siso-border/30">
                        <AvatarImage src={selectedProject.logo} alt={selectedProject.name} />
                        <AvatarFallback className="rounded-md bg-siso-orange/20 text-siso-orange">
                          {selectedProject?.name.substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <FolderOpen className="h-5 w-5 flex-shrink-0 text-siso-orange group-hover:text-siso-red transition-colors" />
                    )}
                    <div className="flex flex-col items-start">
                      <span className="truncate text-siso-text-bold group-hover:text-siso-text-bold transition-colors">
                        {selectedProject ? selectedProject.name : "Select a Project"}
                      </span>
                      <span className="text-xs text-siso-text-muted">
                        {selectedProject?.status === 'active' ? 'Active Project' : 
                         selectedProject?.status === 'paused' ? 'Paused' : 
                         selectedProject?.status === 'completed' ? 'Completed' : 'Select Project'}
                      </span>
                    </div>
                  </div>
                  <ChevronDown className="h-4 w-4 text-siso-text-muted group-hover:text-siso-text transition-colors" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="start" 
                className="w-64 bg-siso-bg-alt border-siso-border"
                onCloseAutoFocus={(e) => {
                  // Prevent focus from automatically closing the sidebar
                  e.preventDefault();
                  ignoreMouseLeaveUntil.current = Date.now() + 1000;
                }}
              >
                <div className="py-2 px-3 text-xs font-medium text-siso-text-muted uppercase tracking-wider">
                  Your Projects
                </div>
                
                {projects.map((project) => (
                  <DropdownMenuItem 
                    key={project.id}
                    className="flex items-center justify-between cursor-pointer hover:bg-black/20 py-2"
                    onClick={() => {
                      selectProject(project.id);
                      setIsProjectMenuOpen(false);
                      ignoreMouseLeaveUntil.current = Date.now() + 2000;
                    }}
                  >
                    <div className="flex items-center gap-2">
                      {project.logo ? (
                        <Avatar className="h-6 w-6 rounded-md">
                          <AvatarImage src={project.logo} />
                          <AvatarFallback className="rounded-md bg-siso-bg-alt text-siso-text-muted">
                            {project.name.substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <FolderOpen className={`h-4 w-4 ${project.status === 'active' ? 'text-siso-orange' : 'text-siso-text-muted'}`} />
                      )}
                      <span className="text-siso-text">{project.name}</span>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`text-xs py-0 px-1.5 ${getStatusColor(project.status)}`}
                    >
                      {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                    </Badge>
                  </DropdownMenuItem>
                ))}
                
                <DropdownMenuSeparator className="bg-siso-border" />
                <DropdownMenuItem 
                  className="flex items-center gap-2 cursor-pointer text-siso-orange hover:text-siso-red hover:bg-black/20"
                  onClick={() => {
                    navigate('/onboarding-chat');
                    setIsProjectMenuOpen(false);
                    ignoreMouseLeaveUntil.current = Date.now() + 2000;
                  }}
                >
                  <FolderOpen className="h-4 w-4" />
                  <span>Create New Project</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <div className="px-2 my-2">
            <CollapsedProjectCard 
              projectName={selectedProject?.name || "Select Project"}
              projectLogo={selectedProject?.logo}
              onClick={handleProjectIconClick}
            />
          </div>
        )}
        
        <AnimatePresence mode="sync">
          <SidebarNavigation 
            collapsed={!isExpanded} 
            onItemClick={handleItemClick}
            visible={showNavigation}
          />
        </AnimatePresence>
        <SidebarFooter 
          collapsed={!isExpanded} 
          onProfileOpen={(isOpen) => {
            setIsProfileOpen(isOpen);
            if (isOpen) {
              setIsExpanded(true);
              setWasManuallyExpanded(true);
              ignoreMouseLeaveUntil.current = Date.now() + 2000;
            }
          }}
        />
      </motion.div>

      {/* Main Content Wrapper with smooth margin transition */}
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
        {/* Mobile Overlay with improved backdrop blur */}
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
