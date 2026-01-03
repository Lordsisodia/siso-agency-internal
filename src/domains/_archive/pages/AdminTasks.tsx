import React from 'react';
import { AdminLayout } from '@/domains/admin/layout/AdminLayout';
import { TasksPage } from '@/domains/tasks/pages/TasksPage';

export default function AdminTasks() {
  return (
    <AdminLayout>
      <TasksPage 
        enableRealtime={true}
        enableOptimisticUpdates={true}
        showSidebar={true}
        showAI={true}
        showHeader={true}
        showFilters={true}
        layout="default"
      />
    </AdminLayout>
  );
}