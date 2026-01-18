
import { useEffect } from 'react';
import { AdminLayout } from '@/components/ui/admin/AdminLayout';
import { useAdminCheck } from '@/domains/admin/hooks/useAdminCheck';
import { Loader2, Users } from 'lucide-react';
import { useToast } from '@/lib/hooks/ui/useToast';
import { AdminClientsView } from '@/domains/analytics/components/AdminClientsView';
import { AdminPageTitle } from '@/components/ui/admin/AdminPageTitle';

export default function AdminClients() {
  const { isAdmin, isLoading } = useAdminCheck();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      toast({
        variant: 'destructive',
        title: 'Access Denied',
        description: 'You must be an admin to view this page.',
      });
    }
  }, [isAdmin, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-siso-orange mb-4" />
        <p className="text-siso-text">Verifying admin access...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  // Clients Dashboard: black background (modern)
  return (
    <AdminLayout>
      <div className="min-h-screen pb-12"
        style={{
          background: "linear-gradient(90deg, #000000 0%, #221F26 100%)"
        }}>
        <div className="container mx-auto px-2 py-6">
          <AdminPageTitle
            icon={Users}
            title="Clients Dashboard"
            subtitle="Manage your organization's clients and view details"
          />
          <AdminClientsView isAdmin={isAdmin} />
        </div>
      </div>
    </AdminLayout>
  );
}
