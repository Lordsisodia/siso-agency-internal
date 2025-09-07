
import React from 'react';
import { CalendarClock, ListTodo } from 'lucide-react';

export function DailyPlannerHeader() {
  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900">
          <CalendarClock className="h-6 w-6 text-purple-700 dark:text-purple-300" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Daily Planner & Life Banking</h1>
          <p className="text-sm text-muted-foreground">
            Manage your tasks, reflect on performance, and plan your day
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 rounded-lg bg-green-100 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-900 dark:text-green-300">
          <ListTodo className="h-3 w-3" />
          <span>Today's Tasks: 0</span>
        </div>
      </div>
    </div>
  );
}
