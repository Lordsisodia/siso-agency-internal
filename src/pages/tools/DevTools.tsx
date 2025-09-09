import React from 'react';
import { AdminLayout } from '@/archive/ecosystem-backup/internal/admin/layout/AdminLayout';
import { ClaudiaMain } from '@/archive/ecosystem-backup/internal/claudia/components/ClaudiaMain';

export default function DevTools() {
  return (
    <AdminLayout>
      {/* Just render the full Claudia app directly - no intermediate UI */}
      <ClaudiaMain />
    </AdminLayout>
  );
}