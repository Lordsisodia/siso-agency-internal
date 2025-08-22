import React from 'react';
import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { ClaudiaMain } from '@/ai-first/features/claudia/components/ClaudiaMain';

export default function DevTools() {
  return (
    <AdminLayout>
      {/* Just render the full Claudia app directly - no intermediate UI */}
      <ClaudiaMain />
    </AdminLayout>
  );
}