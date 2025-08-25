import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Plus, 
  TrendingUp, 
  Users, 
  Instagram,
  Calendar,
  Target,
  Lightbulb
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuthSession } from '@/hooks/useAuthSession';
import TaskManagementAgent, { TaskRecommendation, DailyWorkflowSummary } from '@/ai-first/core/task.service';
import { motion } from 'framer-motion';

export function IntelligentTaskDashboard() {
  const { user } = useAuthSession();
  const { toast } = useToast();
  const [agent] = useState(() => new TaskManagementAgent(user?.id));
  
  const [analysis, setAnalysis] = useState<{
    summary: DailyWorkflowSummary;
    insights: string[];
    recommendations: TaskRecommendation[];
  } | null>(null);
  
  const [todaysPriorities, setTodaysPriorities] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskContext, setNewTaskContext] = useState<'client' | 'development' | 'marketing' | 'maintenance'>('development');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [analysisData, prioritiesData] = await Promise.all([
        agent.analyzeCurrentTasks(),
        agent.getTodaysPriorities()
      ]);
      
      setAnalysis(analysisData);
      setTodaysPriorities(prioritiesData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        variant: "destructive",
        title: "Error loading task data",
        description: "Could not load task analysis. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  const createIntelligentTask = async () => {
    if (!newTaskTitle.trim()) {
      toast({
        variant: "destructive",
        title: "Task title required",
        description: "Please enter a task title"
      });
      return;
    }

    try {
      const taskData = await agent.createIntelligentTask(
        newTaskTitle,
        `Intelligently created task with context: ${newTaskContext}`,
        newTaskContext
      );

      toast({
        title: "Intelligent task created",
        description: `Created ${taskData.category} task with ${taskData.priority} priority`
      });

      setNewTaskTitle('');
      loadDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        variant: "destructive",
        title: "Error creating task",
        description: "Could not create task. Please try again."
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'instagram': return <Instagram className="h-4 w-4" />;
      case 'siso_app_dev':
      case 'onboarding_app': return <Brain className="h-4 w-4" />;
      case 'weekly': return <Calendar className="h-4 w-4" />;
      case 'daily': return <Clock className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Active</p>
                  <p className="text-2xl font-bold">{analysis?.summary.totalTasks || 0}</p>
                </div>
                <Target className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">High Priority</p>
                  <p className="text-2xl font-bold text-orange-500">{analysis?.summary.highPriorityTasks || 0}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completed Today</p>
                  <p className="text-2xl font-bold text-green-500">{analysis?.summary.completedToday || 0}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Overdue</p>
                  <p className="text-2xl font-bold text-red-500">{analysis?.summary.overdueTasks || 0}</p>
                </div>
                <Clock className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="priorities">Today's Priorities</TabsTrigger>
          <TabsTrigger value="recommendations">AI Suggestions</TabsTrigger>
          <TabsTrigger value="create">Create Task</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* AI Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  AI Insights
                </CardTitle>
                <CardDescription>Intelligent analysis of your current workflow</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analysis?.insights.map((insight, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-3 bg-muted rounded-lg"
                    >
                      <p className="text-sm">{insight}</p>
                    </motion.div>
                  ))}
                  {(!analysis?.insights.length) && (
                    <p className="text-muted-foreground text-sm">No specific insights at this time. Keep up the great work!</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Focus Areas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Focus Areas
                </CardTitle>
                <CardDescription>Key areas requiring your attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analysis?.summary.focusAreas.map((area, index) => (
                    <Badge key={index} variant="outline" className="block text-center py-2">
                      {area}
                    </Badge>
                  ))}
                  {(!analysis?.summary.focusAreas.length) && (
                    <p className="text-muted-foreground text-sm">All areas are well balanced. Consider planning ahead!</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Time Allocation Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Time Allocation by Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(analysis?.summary.timeAllocation || {}).map(([category, minutes]) => (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(category)}
                        <span className="font-medium capitalize">{category.replace('_', ' ')}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {Math.round(minutes / 60 * 10) / 10}h
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${Math.min((minutes / Math.max(...Object.values(analysis?.summary.timeAllocation || {}))) * 100, 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Today's Priorities Tab */}
        <TabsContent value="priorities" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Urgent Tasks */}
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600">🚨 Urgent Tasks</CardTitle>
                <CardDescription>{todaysPriorities?.urgent?.length || 0} tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {todaysPriorities?.urgent?.map((task: any) => (
                    <div key={task.id} className="p-2 bg-red-50 rounded border-l-4 border-red-500">
                      <p className="font-medium text-sm">{task.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {getCategoryIcon(task.category)}
                        <span className="text-xs text-muted-foreground">{task.category}</span>
                      </div>
                    </div>
                  ))}
                  {(!todaysPriorities?.urgent?.length) && (
                    <p className="text-muted-foreground text-sm">No urgent tasks! 🎉</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* High Priority Tasks */}
            <Card className="border-orange-200">
              <CardHeader>
                <CardTitle className="text-orange-600">🔥 High Priority</CardTitle>
                <CardDescription>{todaysPriorities?.high?.length || 0} tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {todaysPriorities?.high?.slice(0, 5).map((task: any) => (
                    <div key={task.id} className="p-2 bg-orange-50 rounded border-l-4 border-orange-500">
                      <p className="font-medium text-sm">{task.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {getCategoryIcon(task.category)}
                        <span className="text-xs text-muted-foreground">{task.category}</span>
                      </div>
                    </div>
                  ))}
                  {(!todaysPriorities?.high?.length) && (
                    <p className="text-muted-foreground text-sm">No high priority tasks</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Medium Priority Tasks */}
            <Card className="border-yellow-200">
              <CardHeader>
                <CardTitle className="text-yellow-600">📋 Medium Priority</CardTitle>
                <CardDescription>{todaysPriorities?.medium?.length || 0} tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {todaysPriorities?.medium?.slice(0, 5).map((task: any) => (
                    <div key={task.id} className="p-2 bg-yellow-50 rounded border-l-4 border-yellow-500">
                      <p className="font-medium text-sm">{task.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {getCategoryIcon(task.category)}
                        <span className="text-xs text-muted-foreground">{task.category}</span>
                      </div>
                    </div>
                  ))}
                  {(!todaysPriorities?.medium?.length) && (
                    <p className="text-muted-foreground text-sm">No medium priority tasks</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Daily Suggestions */}
          {todaysPriorities?.suggestions?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Daily Workflow Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {todaysPriorities.suggestions.map((suggestion: string, index: number) => (
                    <div key={index} className="p-2 bg-blue-50 rounded-lg">
                      <p className="text-sm">{suggestion}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* AI Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI-Generated Task Recommendations
              </CardTitle>
              <CardDescription>Smart suggestions based on your current workflow and business context</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysis?.recommendations.map((recommendation, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium">{recommendation.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{recommendation.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getPriorityColor(recommendation.priority)}>
                          {recommendation.priority}
                        </Badge>
                        <Badge variant="outline">
                          {getCategoryIcon(recommendation.category)}
                          <span className="ml-1">{recommendation.category}</span>
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>💡 {recommendation.reasoning}</span>
                      <div className="flex items-center gap-4">
                        <span>⏱️ {recommendation.estimatedDuration}min</span>
                        {recommendation.dueDate && (
                          <span>📅 Due: {new Date(recommendation.dueDate).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    {recommendation.clientContext && (
                      <div className="mt-2">
                        <Badge variant="secondary">👥 {recommendation.clientContext}</Badge>
                      </div>
                    )}
                  </motion.div>
                ))}
                {(!analysis?.recommendations.length) && (
                  <p className="text-muted-foreground text-center py-8">
                    No specific recommendations at this time. Your workflow is well optimized! 🎉
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Create Task Tab */}
        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create Intelligent Task
              </CardTitle>
              <CardDescription>Create a task with AI-powered suggestions for category, priority, and timeline</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Task Title</label>
                <Input
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g., 'Review client wireframes for ProjectX'"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Context</label>
                <select 
                  value={newTaskContext}
                  onChange={(e) => setNewTaskContext(e.target.value as any)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="client">Client Work</option>
                  <option value="development">Development</option>
                  <option value="marketing">Marketing/Instagram</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>

              <Button onClick={createIntelligentTask} className="w-full">
                Create Smart Task
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default IntelligentTaskDashboard;