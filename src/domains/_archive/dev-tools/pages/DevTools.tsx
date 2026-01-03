import React from 'react';
import { AdminLayout } from '@/domains/admin/layout/AdminLayout';

export default function DevTools() {
  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white mb-4">Developer Tools</h1>
        <p className="text-gray-400">Development tools coming soon...</p>
      </div>
    </AdminLayout>
  );
}