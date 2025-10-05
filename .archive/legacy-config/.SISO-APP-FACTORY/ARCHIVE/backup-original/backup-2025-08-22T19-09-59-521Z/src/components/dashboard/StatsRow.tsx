import React from 'react';
import { StatCard } from './StatCard';
import { 
  FolderOpen, 
  PoundSterling, 
  CheckSquare, 
  Star 
} from 'lucide-react';
import { useMainUserProject } from '@/hooks/useUserProjects';
import { useRealTasks } from '@/hooks/useRealTasks';

export function StatsRow() {
  const { projectCount } = useMainUserProject();
  const { remainingTasks } = useRealTasks();

  // Sample data - in a real app, these would come from actual data sources
  const monthlyRevenue = 12450; // Could come from financial API
  const clientSatisfaction = 4.8; // Could come from feedback system

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard
        title="Active Projects"
        value={projectCount || 0}
        trend={projectCount > 0 ? 15 : undefined}
        icon={FolderOpen}
        color="blue"
        subtitle={projectCount === 1 ? "project" : "projects"}
      />
      
      <StatCard
        title="Revenue This Month"
        value={`£${monthlyRevenue.toLocaleString()}`}
        trend={28}
        icon={PoundSterling}
        color="green"
        subtitle="vs last month"
      />
      
      <StatCard
        title="Pending Tasks"
        value={remainingTasks || 0}
        trend={remainingTasks > 0 ? -12 : undefined}
        icon={CheckSquare}
        color="orange"
        subtitle={remainingTasks === 1 ? "task remaining" : "tasks remaining"}
      />
      
      <StatCard
        title="Client Satisfaction"
        value={`${clientSatisfaction}★`}
        trend={5}
        icon={Star}
        color="purple"
        subtitle="average rating"
      />
    </div>
  );
} 