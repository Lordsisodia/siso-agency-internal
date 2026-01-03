
import { ReactNode } from 'react';
import { Sidebar } from '@/components/shared/Sidebar';
import { MainLayout } from './MainLayout';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <MainLayout>
      <div className="flex min-h-screen w-full bg-gradient-to-b from-siso-bg to-black/95">
        <Sidebar />
        <main className="flex-1 overflow-y-auto py-4 px-2 sm:p-8">
          <div className="container mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </MainLayout>
  );
}
