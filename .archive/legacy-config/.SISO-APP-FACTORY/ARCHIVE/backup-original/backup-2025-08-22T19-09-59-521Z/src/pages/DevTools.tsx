import React from 'react';
import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { ClaudiaMain } from '@/components/claudia/ClaudiaMain';

export default function DevTools() {
  return (
    <AdminLayout>
      {/* Just render the full Claudia app directly - no intermediate UI */}
      <ClaudiaMain />
    </AdminLayout>
  );
}