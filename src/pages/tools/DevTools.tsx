import React from 'react';
import { AdminLayout } from '@/ecosystem/internal/admin/layout/AdminLayout';
import { ClaudiaMain } from '@/ecosystem/internal/claudia/components/ClaudiaMain';

export default function DevTools() {
  return (
    <AdminLayout>
      {/* Just render the full Claudia app directly - no intermediate UI */}
      <ClaudiaMain />
    </AdminLayout>
  );
}