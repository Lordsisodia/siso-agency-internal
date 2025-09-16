import React from 'react';
import { AdminLayout } from '@/features/admin/layout/AdminLayout';
import { ClaudiaMain } from '@/features/claudia/components/ClaudiaMain';

export default function DevTools() {
  return (
    <AdminLayout>
      {/* Just render the full Claudia app directly - no intermediate UI */}
      <ClaudiaMain />
    </AdminLayout>
  );
}