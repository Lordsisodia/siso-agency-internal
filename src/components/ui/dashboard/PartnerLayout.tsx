import React, { ReactNode, useState } from 'react';
import { PartnerSidebar } from './PartnerSidebar';
import { PartnerHeader } from './PartnerHeader';

interface PartnerLayoutProps {
  children: ReactNode;
}

export function PartnerLayout({ children }: PartnerLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-900">
      {/* Sidebar */}
      <PartnerSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <PartnerHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-gray-900 p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
      
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
} 