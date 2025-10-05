
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarDays, CheckSquare, BarChart2, MessageSquare, List } from 'lucide-react';
import { CalendarView } from './CalendarView';
import { TaskView } from './TaskView';
import { CheckInsView } from './CheckInsView';
import { AnalyticsView } from './AnalyticsView';
import { MessagingView } from './MessagingView';

export function DailyPlannerTabs() {
  return (
    <Tabs defaultValue="tasks" className="space-y-4">
      <TabsList className="grid grid-cols-5 w-full max-w-3xl mx-auto">
        <TabsTrigger value="tasks" className="flex items-center gap-2 justify-center">
          <List className="h-4 w-4" />
          <span className="hidden sm:inline">Tasks</span>
        </TabsTrigger>
        <TabsTrigger value="calendar" className="flex items-center gap-2 justify-center">
          <CalendarDays className="h-4 w-4" />
          <span className="hidden sm:inline">Calendar</span>
        </TabsTrigger>
        <TabsTrigger value="check-ins" className="flex items-center gap-2 justify-center">
          <CheckSquare className="h-4 w-4" />
          <span className="hidden sm:inline">Check-Ins</span>
        </TabsTrigger>
        <TabsTrigger value="analytics" className="flex items-center gap-2 justify-center">
          <BarChart2 className="h-4 w-4" />
          <span className="hidden sm:inline">Analytics</span>
        </TabsTrigger>
        <TabsTrigger value="messaging" className="flex items-center gap-2 justify-center">
          <MessageSquare className="h-4 w-4" />
          <span className="hidden sm:inline">Messaging</span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="tasks">
        <TaskView />
      </TabsContent>
      
      <TabsContent value="calendar">
        <CalendarView />
      </TabsContent>
      
      <TabsContent value="check-ins">
        <CheckInsView />
      </TabsContent>
      
      <TabsContent value="analytics">
        <AnalyticsView />
      </TabsContent>
      
      <TabsContent value="messaging">
        <MessagingView />
      </TabsContent>
    </Tabs>
  );
}
