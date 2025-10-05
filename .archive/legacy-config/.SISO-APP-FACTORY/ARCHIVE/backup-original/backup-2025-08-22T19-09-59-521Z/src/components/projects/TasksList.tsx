import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { RealTaskManager } from '@/components/tasks/RealTaskManager';
import { useUserPreferences } from '@/hooks/useLocalStorage';

interface TasksListProps {
  viewMode: "table" | "cards";
}

export function TasksList({ viewMode }: TasksListProps) {
  const { preferences, updatePreference } = useUserPreferences();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Use persistent preferences
  const filter = preferences.taskFilter || 'all';
  
  const handleFilterChange = (value: 'all' | 'active' | 'completed') => {
    updatePreference('taskFilter', value);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full sm:w-[250px] bg-white/90"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Tabs value={filter} onValueChange={handleFilterChange}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      
      {/* Simple Task Layout - Like Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <RealTaskManager 
          title="All Your Tasks"
          className="h-fit"
          showAddTask={true}
          maxTasks={10}
          filterType="all"
        />
        <RealTaskManager 
          title="High Priority"
          className="h-fit"
          showAddTask={false}
          maxTasks={5}
          filterType="high-priority"
        />
        <RealTaskManager 
          title="Due Soon"
          className="h-fit"
          showAddTask={false}
          maxTasks={5}
          filterType="due-soon"
        />
      </div>
      
      {/* Full Task List */}
      <div className="mt-8">
        <RealTaskManager 
          title="Complete Task List"
          className="w-full"
          showAddTask={true}
          maxTasks={50}
          filterType="all"
        />
      </div>
    </div>
  );
} 