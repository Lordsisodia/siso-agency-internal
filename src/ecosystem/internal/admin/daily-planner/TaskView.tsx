
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { TaskBank } from './TaskBank';
import { TeamMemberSelector } from '@/ai-first/features/dashboard/components/TeamMemberSelector';

export function TaskView() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Team Member Tasks</CardTitle>
          <CardDescription>
            View and manage tasks for specific team members
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TeamMemberSelector />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Task Overview</CardTitle>
          <CardDescription>
            View and manage all tasks across different categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TaskBank />
        </CardContent>
      </Card>
    </div>
  );
}
