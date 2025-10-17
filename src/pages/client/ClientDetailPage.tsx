import { useParams } from 'react-router-dom';
import { ClientWorkspacePage } from '@/ecosystem/internal/clients';

export default function ClientDetailPage() {
  const { clientId } = useParams<{ clientId: string }>();

  return <ClientWorkspacePage clientId={clientId ?? null} />;
}
