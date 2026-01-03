import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, LineChart, PieChart } from 'recharts';

export function AnalyticsView() {
  // Sample data for charts
  const completionData = [
    { name: 'Mon', completed: 5, total: 8 },
    { name: 'Tue', completed: 7, total: 9 },
    { name: 'Wed', completed: 3, total: 7 },
    { name: 'Thu', completed: 6, total: 8 },
    { name: 'Fri', completed: 4, total: 6 },
  ];

  const categoryData = [
    { name: 'Client Work', value: 12 },
    { name: 'Admin', value: 8 },
    { name: 'Marketing', value: 5 },
    { name: 'Learning', value: 4 },
  ];

  const checkInData = [
    { name: 'Week 1', consistency: 2 },
    { name: 'Week 2', consistency: 4 },
    { name: 'Week 3', consistency: 3 },
    { name: 'Week 4', consistency: 5 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Task Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">67%</div>
            <p className="text-xs text-muted-foreground">+5% from last week</p>
            <div className="h-[60px] mt-4">
              {/* Placeholder for mini chart */}
              <div className="w-full h-full bg-slate-100 rounded-md flex items-center justify-center text-xs text-muted-foreground">
                Bar Chart
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tasks by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24 Tasks</div>
            <p className="text-xs text-muted-foreground">12 completed, 12 pending</p>
            <div className="h-[60px] mt-4">
              {/* Placeholder for mini chart */}
              <div className="w-full h-full bg-slate-100 rounded-md flex items-center justify-center text-xs text-muted-foreground">
                Pie Chart
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Check-In Consistency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3/7 Days</div>
            <p className="text-xs text-muted-foreground">42% consistent this week</p>
            <div className="h-[60px] mt-4">
              {/* Placeholder for mini chart */}
              <div className="w-full h-full bg-slate-100 rounded-md flex items-center justify-center text-xs text-muted-foreground">
                Line Chart
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Performance Trends</CardTitle>
          <CardDescription>
            Track productivity and task management patterns over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="tasks">
            <TabsList className="w-full max-w-md mb-4">
              <TabsTrigger value="tasks">Task Completion</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
              <TabsTrigger value="priorities">Priorities</TabsTrigger>
              <TabsTrigger value="checkins">Check-Ins</TabsTrigger>
            </TabsList>
            
            <TabsContent value="tasks">
              <div className="h-[300px] w-full border rounded-md flex items-center justify-center text-muted-foreground">
                <ChartContainer 
                  className="w-full h-full" 
                  config={{
                    completed: { label: "Completed" },
                    total: { label: "Total" }
                  }}
                >
                  <BarChart
                    width={500}
                    height={300}
                    data={completionData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <ChartTooltip content={<ChartTooltipContent />} />
                    {/* Other chart elements would go here */}
                  </BarChart>
                </ChartContainer>
              </div>
            </TabsContent>
            
            <TabsContent value="categories">
              <div className="h-[300px] w-full border rounded-md flex items-center justify-center text-muted-foreground">
                <ChartContainer 
                  className="w-full h-full"
                  config={{
                    value: { label: "Tasks" }
                  }}
                >
                  <PieChart
                    width={500}
                    height={300}
                  >
                    <ChartTooltip content={<ChartTooltipContent />} />
                    {/* Pie chart elements would go here */}
                  </PieChart>
                </ChartContainer>
              </div>
            </TabsContent>
            
            <TabsContent value="priorities">
              <div className="h-[300px] w-full border rounded-md flex items-center justify-center text-muted-foreground">
                Task distribution by priority chart
              </div>
            </TabsContent>
            
            <TabsContent value="checkins">
              <div className="h-[300px] w-full border rounded-md flex items-center justify-center text-muted-foreground">
                <ChartContainer 
                  className="w-full h-full"
                  config={{
                    consistency: { label: "Check-in Days" }
                  }}
                >
                  <LineChart
                    width={500}
                    height={300}
                    data={checkInData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <ChartTooltip content={<ChartTooltipContent />} />
                    {/* Line chart elements would go here */}
                  </LineChart>
                </ChartContainer>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Productivity Insights</CardTitle>
          <CardDescription>
            AI-powered observations based on your task and check-in data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border rounded-md bg-purple-50">
              <h3 className="text-sm font-semibold mb-1">Consistency Pattern</h3>
              <p className="text-sm text-muted-foreground">
                You tend to complete more tasks on Tuesdays and Wednesdays, while Fridays show lower completion rates.
              </p>
            </div>
            
            <div className="p-4 border rounded-md bg-blue-50">
              <h3 className="text-sm font-semibold mb-1">Category Focus</h3>
              <p className="text-sm text-muted-foreground">
                Client Work tasks receive the highest completion priority, while Administrative tasks are often delayed.
              </p>
            </div>
            
            <div className="p-4 border rounded-md bg-amber-50">
              <h3 className="text-sm font-semibold mb-1">Improvement Suggestion</h3>
              <p className="text-sm text-muted-foreground">
                Consider allocating specific time blocks for Administrative tasks to improve overall completion rates.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
