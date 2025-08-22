
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useParams, useNavigate } from 'react-router-dom';
import { TaskBank } from './TaskBank';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export function TeamMemberTasksView() {
  const { userId } = useParams();
  const navigate = useNavigate();
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          onClick={() => navigate('/admin/tasks')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" /> Back to All Tasks
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-6">
          <TaskBank userId={userId} />
        </CardContent>
      </Card>
    </div>
  );
}
