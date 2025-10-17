import { useParams } from 'react-router-dom';
import { AdminLayout } from '@/ecosystem/internal/admin/layout/AdminLayout';
import { ClientWorkspacePage } from '@/ecosystem/internal/clients';

export default function ClientDetailPage() {
  const { clientId } = useParams<{ clientId: string }>();

  return (
    <AdminLayout>
      <ClientWorkspacePage clientId={clientId ?? null} />
    </AdminLayout>
  );
}
