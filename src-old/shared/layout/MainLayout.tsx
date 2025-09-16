
import React from 'react';
import { Toaster } from 'sonner';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1">
        {children}
      </main>
      <Toaster position="top-right" />
    </div>
  );
};
