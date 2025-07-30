
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useTasks } from '@/hooks/useTasks';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

interface TaskAnalyticsProps {
  teamMember?: string | null;
}

export function TaskAnalytics({ teamMember }: TaskAnalyticsProps) {
  const { useTaskStatsQuery } = useTasks();
  const { data: taskStats, isLoading } = useTaskStatsQuery(teamMember || undefined);
  
  // If loading, show placeholder charts
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card className="p-4">
          <div className="h-[350px] bg-muted/20 animate-pulse rounded-md"></div>
        </Card>
      </div>
    );
  }

  // Convert task stats data for charts
  const taskStatusData = [
    { name: 'Completed', value: taskStats?.byStatus.completed || 0, color: '#10b981' },
    { name: 'In Progress', value: taskStats?.byStatus.in_progress || 0, color: '#3b82f6' },
    { name: 'Pending', value: taskStats?.byStatus.pending || 0, color: '#9ca3af' },
  ];

  const tasksByDayData = taskStats?.byDay || [];
  const tasksByPriorityData = [
    { name: 'Low', value: taskStats?.byPriority.low || 0, color: '#60a5fa' },
    { name: 'Medium', value: taskStats?.byPriority.medium || 0, color: '#f59e0b' },
    { name: 'High', value: taskStats?.byPriority.high || 0, color: '#ef4444' },
    { name: 'Urgent', value: taskStats?.byPriority.urgent || 0, color: '#dc2626' },
  ];

  // Only render if we have data
  if (!taskStats) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No task data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Tabs defaultValue="taskStatus">
        <TabsList>
          <TabsTrigger value="taskStatus">Status Distribution</TabsTrigger>
          <TabsTrigger value="taskTrend">Completion Trend</TabsTrigger>
          <TabsTrigger value="taskPriority">Priority Distribution</TabsTrigger>
        </TabsList>

        <TabsContent value="taskStatus" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Task Status Distribution</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={taskStatusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={150}
                    fill="#8884d8"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {taskStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="taskTrend" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Task Completion Trend</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={tasksByDayData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="completed" 
                    stroke="#10b981" 
                    name="Completed"
                    activeDot={{ r: 8 }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="created" 
                    stroke="#3b82f6" 
                    name="Created" 
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="taskPriority" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Task Priority Distribution</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={tasksByPriorityData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar 
                    dataKey="value" 
                    name="Tasks" 
                    radius={[4, 4, 0, 0]}
                  >
                    {tasksByPriorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Task Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-md border border-green-100">
              <h3 className="text-sm font-medium text-green-800">Completed Tasks</h3>
              <p className="text-2xl font-bold text-green-600">{taskStats.totals.completed}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
              <h3 className="text-sm font-medium text-blue-800">In Progress</h3>
              <p className="text-2xl font-bold text-blue-600">{taskStats.totals.in_progress}</p>
            </div>
            <div className="bg-amber-50 p-4 rounded-md border border-amber-100">
              <h3 className="text-sm font-medium text-amber-800">Pending Tasks</h3>
              <p className="text-2xl font-bold text-amber-600">{taskStats.totals.pending}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default TaskAnalytics;
