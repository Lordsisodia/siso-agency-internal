import { useParams } from 'react-router-dom';
import { Suspense } from 'react';
import { PartnerWorkspacePage } from '@/domains/partners';

export default function PartnerDetailPage() {
  const { partnerId } = useParams<{ partnerId: string }>();

  return (
    <Suspense fallback={<div className="p-6 text-white/70">Loading partner workspace…</div>}>
      <PartnerWorkspacePage partnerId={partnerId ?? null} />
    </Suspense>
  );
}
