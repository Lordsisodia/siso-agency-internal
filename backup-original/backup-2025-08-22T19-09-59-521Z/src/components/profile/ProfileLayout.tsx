
import { SidebarProvider } from '@/components/ui/sidebar';
import { Sidebar } from '@/components/Sidebar';
import { FloatingOrbs } from '@/components/effects/FloatingOrbs';

interface ProfileLayoutProps {
  children: React.ReactNode;
}

export const ProfileLayout = ({ children }: ProfileLayoutProps) => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gradient-to-b from-siso-bg to-siso-bg/95">
        <Sidebar />
        <div className="flex-1 relative">
          <FloatingOrbs />
          <div className="container mx-auto px-4 py-8 relative z-10">
            <div className="space-y-8 max-w-7xl mx-auto">
              {children}
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};
