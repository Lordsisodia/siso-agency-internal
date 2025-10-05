
import React from 'react';
import { Card } from '@/components/ui/card';
import { TaskList } from '@/components/admin/tasks/TaskList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { TimelineTaskView } from './TimelineTaskView';

interface TeamTaskViewProps {
  memberId?: string;
}

export function TeamTaskView({ memberId }: TeamTaskViewProps) {
  const navigate = useNavigate();
  const memberName = memberId === 'siso' ? 'SISO' : 
                     memberId === 'sam' ? 'Sam' : 
                     'Team Member';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/admin/tasks')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Tasks
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="bg-gradient-to-r from-purple-900/40 via-purple-800/30 to-indigo-900/40 border-purple-500/20">
          <div className="p-6">
            <Tabs defaultValue="timeline" className="space-y-6">
              <TabsList>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="daily">Daily Tasks</TabsTrigger>
                <TabsTrigger value="overall">Overall Tasks</TabsTrigger>
                <TabsTrigger value="goals">Goals</TabsTrigger>
              </TabsList>

              <TabsContent value="timeline" className="space-y-4">
                <TimelineTaskView memberId={memberId} />
              </TabsContent>

              <TabsContent value="daily" className="space-y-4">
                <TaskList category="daily" userId={memberId} />
              </TabsContent>

              <TabsContent value="overall" className="space-y-4">
                <TaskList category="main" userId={memberId} />
              </TabsContent>

              <TabsContent value="goals" className="space-y-4">
                <TaskList category="weekly" userId={memberId} />
              </TabsContent>
            </Tabs>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
