
import { SidebarProvider } from '@/components/ui/sidebar';
import { Sidebar } from '@/components/Sidebar';

export const ProfileSkeleton = () => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gradient-to-b from-siso-bg to-siso-bg/95">
        <Sidebar />
        <div className="flex-1 p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-siso-text/10 rounded w-1/4"></div>
            <div className="h-32 bg-siso-text/10 rounded"></div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};
