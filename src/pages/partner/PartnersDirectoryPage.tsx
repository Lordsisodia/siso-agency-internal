import { Suspense } from 'react';
import { PartnersDirectoryPage as PartnersDirectory } from '@/ecosystem/internal/partners';

export default function PartnerDirectoryRoute() {
  return (
    <Suspense fallback={<div className="p-6 text-white/70">Loading partners…</div>}>
      <PartnersDirectory />
    </Suspense>
  );
}
