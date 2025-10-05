import React from 'react';
import { AdminLayout } from '@/ecosystem/internal/admin/layout/AdminLayout';
import { TasksPage } from '@/ecosystem/internal/tasks/pages/TasksPage';

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