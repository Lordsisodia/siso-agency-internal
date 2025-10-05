
import React from 'react';
import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { useParams } from 'react-router-dom';
import { TimelineTaskView } from '@/components/admin/teams/TimelineTaskView';

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
