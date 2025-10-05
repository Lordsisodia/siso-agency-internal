import { useLocation, useNavigate } from 'react-router-dom';
import { useMemo } from 'react';

interface NavigationItem {
  name: string;
  href: string;
  icon: string;
  description?: string;
}

interface BreadcrumbItem {
  name: string;
  href?: string;
}

export const usePartnerNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navigationItems: NavigationItem[] = [
    { 
      name: 'Dashboard', 
      href: '/dashboard', 
      icon: 'Home',
      description: 'Overview of your partner performance'
    },
    { 
      name: 'Leaderboard', 
      href: '/dashboard/leaderboard', 
      icon: 'Trophy',
      description: 'See how you rank against other partners'
    },
    { 
      name: 'Coming Soon', 
      href: '/dashboard/coming-soon', 
      icon: 'Clock',
      description: 'Preview upcoming features and tools'
    },
    { 
      name: 'Education Hub', 
      href: '/dashboard/education', 
      icon: 'GraduationCap',
      description: 'Learning resources and training materials'
    },
    { 
      name: 'Templates', 
      href: '/dashboard/templates', 
      icon: 'FileText',
      description: 'Ready-to-use templates for your projects'
    },
    { 
      name: 'App Plan Generator', 
      href: '/dashboard/app-plan-generator', 
      icon: 'Zap',
      description: 'AI-powered app planning tool'
    },
    { 
      name: 'Pipeline', 
      href: '/dashboard/pipeline', 
      icon: 'BarChart3',
      description: 'Track your referral pipeline and progress'
    },
    { 
      name: 'Profile Settings', 
      href: '/dashboard/profile', 
      icon: 'User',
      description: 'Manage your partner profile and preferences'
    },
  ];

  const currentPath = location.pathname;
  
  const activeItem = useMemo(() => {
    return navigationItems.find(item => item.href === currentPath);
  }, [currentPath]);

  const breadcrumbs = useMemo((): BreadcrumbItem[] => {
    const pathSegments = currentPath.split('/').filter(Boolean);
    const breadcrumbItems: BreadcrumbItem[] = [];

    // Always start with Dashboard
    breadcrumbItems.push({ name: 'Dashboard', href: '/dashboard' });

    // Add current page if not dashboard
    if (currentPath !== '/dashboard') {
      const currentItem = navigationItems.find(item => item.href === currentPath);
      if (currentItem) {
        breadcrumbItems.push({ name: currentItem.name });
      } else {
        // Handle dynamic routes or unknown paths
        const lastSegment = pathSegments[pathSegments.length - 1];
        const formattedName = lastSegment
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        breadcrumbItems.push({ name: formattedName });
      }
    }

    return breadcrumbItems;
  }, [currentPath]);

  const navigateTo = (href: string) => {
    navigate(href);
  };

  const isActive = (href: string): boolean => {
    return currentPath === href;
  };

  const getPageTitle = (): string => {
    if (activeItem) {
      return `${activeItem.name} | Partner Portal`;
    }
    return 'Partner Portal | SISO';
  };

  const getPageDescription = (): string => {
    return activeItem?.description || 'SISO Partner Portal Dashboard';
  };

  return {
    navigationItems,
    currentPath,
    activeItem,
    breadcrumbs,
    navigateTo,
    isActive,
    getPageTitle,
    getPageDescription,
  };
}; 