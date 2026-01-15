
import { ReactNode, useState, useEffect } from 'react';
import { Sidebar } from './AdminSidebar';
import { useIsMobile } from '@/lib/hooks/use-mobile';
import { useLocation } from 'react-router-dom';

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  const location = useLocation();

  useEffect(() => {
    console.log('[AdminLayout] rendering path:', location.pathname);
    return () => {
      console.log('[AdminLayout] unmounting path:', location.pathname);
    };
  }, [location.pathname]);

  // Save current admin page as preferred page for future logins
  useEffect(() => {
    // Only save admin routes as preferences
    if (location.pathname.startsWith('/admin/')) {
      localStorage.setItem('preferredAdminPage', location.pathname);
    }
  }, [location.pathname]);

  // Calculate margin based on sidebar state
  const getMainMargin = () => {
    // TEMPORARY: No margin since sidebar is hidden
    return 'ml-0';
  };

  return (
    <div className="min-h-screen w-full relative" style={{ backgroundColor: '#121212' }}>
      <Sidebar
        onExpandedChange={setSidebarExpanded}
        onMobileMenuChange={setMobileMenuOpen}
      />
      <main className={`${getMainMargin()} overflow-y-auto admin-scrollbar min-h-screen transition-all duration-100 relative pb-24`} style={{ backgroundColor: '#121212' }}>
        <div key={location.pathname} className="min-h-screen">
          {children}
        </div>
      </main>
    </div>
  );
}
