
import { ReactNode } from "react";
import { AdminLayout } from "@/components/admin/layout/AdminLayout";

interface ClientLayoutProps {
  children: ReactNode;
}

// Use the shared AdminLayout for consistent client/admin experience
export function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <AdminLayout>
      {children}
    </AdminLayout>
  );
}
