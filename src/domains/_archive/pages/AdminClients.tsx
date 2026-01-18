
import { useEffect } from 'react';
import { useAdminCheck } from '@/domains/admin/hooks/useAdminCheck';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/lib/hooks/ui/useToast';
import { AdminClientsView } from '@/domains/admin/clients/AdminClientsView';
import { AdminLayout } from '@/domains/admin/layout/AdminLayout';

export function AdminClientsContent() {
  const { isAdmin, isLoading } = useAdminCheck();
  const { toast } = useToast();

  useEffect(() => {
    console.log('[AdminClients] mount');
    return () => console.log('[AdminClients] unmount');
  }, []);

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

  return <AdminClientsView isAdmin={isAdmin} />;
}

export default function AdminClients() {
  return (
    <AdminLayout>
      <AdminClientsContent />
    </AdminLayout>
  );
}
