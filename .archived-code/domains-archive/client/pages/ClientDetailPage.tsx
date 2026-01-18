import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AdminLayout } from '@/domains/admin/layout/AdminLayout';
import { ClientWorkspacePage } from '@/domains/clients';
import { supabase } from '@/services/integrations/supabase/client';
import { PageLoader } from '@/components/ui/PageLoader';

// Check if value is a valid UUID
const isUuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

export default function ClientDetailPage() {
  const { clientId: paramValue } = useParams<{ clientId: string }>();
  const [resolvedClientId, setResolvedClientId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function resolveClient() {
      if (!paramValue) {
        setResolvedClientId(null);
        setLoading(false);
        return;
      }

      // If it's already a UUID, use it directly
      if (isUuid(paramValue)) {
        setResolvedClientId(paramValue);
        setLoading(false);
        return;
      }

      // Otherwise, it's a slug - look up the client ID
      try {
        const { data, error } = await supabase
          .from('client_onboarding')
          .select('id')
          .eq('slug', paramValue)
          .single();

        if (error || !data) {
          console.error('Failed to resolve client slug:', error);
          setResolvedClientId(null);
        } else {
          setResolvedClientId(data.id);
        }
      } catch (err) {
        console.error('Error resolving client slug:', err);
        setResolvedClientId(null);
      }

      setLoading(false);
    }

    resolveClient();
  }, [paramValue]);

  if (loading) {
    return (
      <AdminLayout>
        <PageLoader />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <ClientWorkspacePage clientId={resolvedClientId} />
    </AdminLayout>
  );
}
