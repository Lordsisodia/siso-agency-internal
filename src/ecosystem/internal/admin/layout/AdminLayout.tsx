
import { ReactNode, useState, useEffect } from 'react';
import { Sidebar } from './AdminSidebar';
import { useIsMobile } from '@/shared/hooks/use-mobile';
import { useLocation } from 'react-router-dom';
import { SimpleFeedbackButton } from '@/ecosystem/internal/feedback/SimpleFeedbackButton';

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
    return 'ml-16'; // Desktop: Always collapsed (4rem width)
  };

  return (
    <div className="min-h-screen w-full relative bg-gray-900">
      <Sidebar
        onExpandedChange={setSidebarExpanded}
        onMobileMenuChange={setMobileMenuOpen}
      />
      <main className={`${getMainMargin()} overflow-y-auto admin-scrollbar min-h-screen transition-all duration-100 relative bg-gray-900`}>
        {children}
        {/* Global Feedback Button - appears on every page */}
        <div className="fixed bottom-48 left-1/2 transform -translate-x-1/2 z-[100]">
          <SimpleFeedbackButton />
        </div>
      </main>
    </div>
  );
}
