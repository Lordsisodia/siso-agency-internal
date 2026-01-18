
import React from 'react';
import { AdminLayout } from '@/domains/admin/layout/AdminLayout';
import { useParams } from 'react-router-dom';
import { TimelineTaskView } from '@/domains/admin/dashboard/components/TimelineTaskView';

export default function TeamMemberTasksPage() {
  const { memberId } = useParams();

  return (
    <AdminLayout>
      <div className="container mx-auto p-6">
        <TimelineTaskView memberId={memberId} />
      </div>
    </AdminLayout>
  );
}
