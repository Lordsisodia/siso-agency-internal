
import { ReactNode, useState, useEffect } from 'react';
import { Sidebar } from './AdminSidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLocation } from 'react-router-dom';

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  const location = useLocation();

  // Save current admin page as preferred page for future logins
  useEffect(() => {
    // Only save admin routes as preferences
    if (location.pathname.startsWith('/admin/')) {
      localStorage.setItem('preferredAdminPage', location.pathname);
    }
  }, [location.pathname]);

  // Calculate margin based on sidebar state
  const getMainMargin = () => {
    if (isMobile) {
      return 'ml-0'; // Mobile has no margin, sidebar overlays
    }
    return sidebarExpanded ? 'ml-64' : 'ml-16'; // Desktop: 16rem expanded, 4rem collapsed
  };

  return (
    <div className="min-h-screen w-full relative">
      <Sidebar 
        onExpandedChange={setSidebarExpanded}
        onMobileMenuChange={setMobileMenuOpen}
      />
      <main className={`${getMainMargin()} overflow-y-auto admin-scrollbar min-h-screen transition-all duration-100 relative`}>
        {children}
      </main>
    </div>
  );
}
