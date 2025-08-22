
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AreaChart, Area, BarChart, Bar, LineChart, Line, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

export function TeamAnalyticsSection() {
  // Mock data for productivity trend over time
  const productivityData = [
    { date: 'Mon', tasks: 12, hours: 7.5 },
    { date: 'Tue', tasks: 15, hours: 8.2 },
    { date: 'Wed', tasks: 18, hours: 9.0 },
    { date: 'Thu', tasks: 16, hours: 8.5 },
    { date: 'Fri', tasks: 14, hours: 7.8 },
    { date: 'Sat', tasks: 6, hours: 4.2 },
    { date: 'Sun', tasks: 3, hours: 2.1 },
  ];

  // Mock data for task distribution by status
  const taskStatusData = [
    { name: 'Completed', value: 45, color: '#10b981' },
    { name: 'In Progress', value: 30, color: '#3b82f6' },
    { name: 'Todo', value: 20, color: '#9ca3af' },
    { name: 'Blocked', value: 5, color: '#ef4444' },
  ];

  // Mock data for department workload
  const departmentData = [
    { name: 'Engineering', tasks: 45, people: 5 },
    { name: 'Design', tasks: 30, people: 3 },
    { name: 'Marketing', tasks: 25, people: 2 },
    { name: 'Management', tasks: 15, people: 2 },
  ];

  // Mock data for team performance
  const performanceData = [
    { month: 'Jan', actual: 40, target: 45 },
    { month: 'Feb', actual: 55, target: 50 },
    { month: 'Mar', actual: 60, target: 55 },
    { month: 'Apr', actual: 58, target: 60 },
    { month: 'May', actual: 70, target: 65 },
    { month: 'Jun', actual: 75, target: 70 },
  ];

  // Mock team member performance
  const teamMembersData = [
    { name: 'Alex J.', tasks: 32, efficiency: 95 },
    { name: 'Sam R.', tasks: 28, efficiency: 90 },
    { name: 'Jamie T.', tasks: 24, efficiency: 85 },
    { name: 'Morgan L.', tasks: 26, efficiency: 88 },
    { name: 'Casey W.', tasks: 30, efficiency: 92 },
  ];

  return (
    <div>
      <Tabs defaultValue="productivity">
        <TabsList className="mb-4 w-full justify-start overflow-x-auto">
          <TabsTrigger value="productivity">Productivity</TabsTrigger>
          <TabsTrigger value="tasks">Task Distribution</TabsTrigger>
          <TabsTrigger value="departments">Department Workload</TabsTrigger>
          <TabsTrigger value="performance">Team Performance</TabsTrigger>
          <TabsTrigger value="members">Member Comparison</TabsTrigger>
        </TabsList>
        
        <TabsContent value="productivity">
          <Card>
            <CardHeader>
              <CardTitle>Team Productivity</CardTitle>
              <CardDescription>Tasks completed and hours worked over the last week</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={productivityData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Area 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="tasks" 
                      stackId="1"
                      stroke="#8884d8" 
                      fill="#8884d8" 
                    />
                    <Area 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="hours" 
                      stackId="2"
                      stroke="#82ca9d" 
                      fill="#82ca9d" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="tasks">
          <Card>
            <CardHeader>
              <CardTitle>Task Status Distribution</CardTitle>
              <CardDescription>Current status of all team tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={taskStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {taskStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="departments">
          <Card>
            <CardHeader>
              <CardTitle>Department Workload</CardTitle>
              <CardDescription>Current task distribution across departments</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={departmentData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="tasks" name="Tasks" fill="#8884d8" />
                    <Bar dataKey="people" name="Team Members" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Team Performance</CardTitle>
              <CardDescription>Actual performance vs. targets over time</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={performanceData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="actual" 
                      stroke="#8884d8" 
                      activeDot={{ r: 8 }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="target" 
                      stroke="#82ca9d" 
                      strokeDasharray="5 5" 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="members">
          <Card>
            <CardHeader>
              <CardTitle>Team Member Comparison</CardTitle>
              <CardDescription>Tasks completed and efficiency by team member</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={teamMembersData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                    <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="tasks" name="Tasks Completed" fill="#8884d8" />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="efficiency"
                      name="Efficiency Score"
                      stroke="#82ca9d"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
