
import React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TimelineDemo } from "@/components/ui/timeline.demo";
import { AdminLayout } from "@/components/admin/layout/AdminLayout";
import { AdminPageTitle } from "@/components/admin/layout/AdminPageTitle";
import { Settings } from "lucide-react";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { Loader2 } from "lucide-react";

export default function ChangelogPage() {
  const { isAdmin, isLoading } = useAdminCheck();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-siso-orange" />
        <span className="ml-4">Loading...</span>
      </div>
    );
  }

  if (isAdmin) {
    return (
      <AdminLayout>
        <div className="container mx-auto py-8 px-2 md:px-12">
          <AdminPageTitle icon={Settings} title="Changelog" />
          <div className="max-w-5xl mx-auto mt-6 glass-morphism rounded-xl shadow-lg border border-white/10">
            <TimelineDemo />
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Fall back to the original non-admin sidebar layout for regular users
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gradient-to-b from-black via-[#18181b] to-[#09090a]">
        {/* Sidebar is only needed in non-admin mode */}
        {/* Hidden here but could be restored if you want a sidebar for regular users */}
        <main className="flex-1 relative py-10 px-2 md:px-12 bg-transparent">
          <div className="max-w-5xl mx-auto mt-6 glass-morphism rounded-xl shadow-lg border border-white/10">
            <TimelineDemo />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
