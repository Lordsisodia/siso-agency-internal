import React from 'react';
import { AdminLayout } from '@/domains/admin/layout/AdminLayout';
import { ClaudiaMain } from '@/domains/claudia/components/ClaudiaMain';

export default function DevTools() {
  return (
    <AdminLayout>
      {/* Just render the full Claudia app directly - no intermediate UI */}
      <ClaudiaMain />
    </AdminLayout>
  );
}