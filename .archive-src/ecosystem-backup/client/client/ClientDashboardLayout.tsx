
import { ReactNode } from "react";
import { ClientDashboardSidebar } from "./ClientDashboardSidebar";

/**
 * Custom layout for client dashboard, matches admin dashboard glassmorphism and padding.
 */
interface ClientDashboardLayoutProps {
  children: ReactNode;
}

export function ClientDashboardLayout({ children }: ClientDashboardLayoutProps) {
  return (
    <div className="flex min-h-screen w-full bg-gradient-to-b from-siso-bg to-black/95">
      <ClientDashboardSidebar />
      <main className="flex-1 overflow-y-auto py-4 px-2 sm:p-8 bg-transparent">
        <div className="container mx-auto max-w-6xl">
          {children}
        </div>
      </main>
    </div>
  );
}
