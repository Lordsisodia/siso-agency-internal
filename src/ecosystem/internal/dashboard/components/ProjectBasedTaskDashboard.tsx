import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { 
  FolderOpen, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Plus, 
  Brain,
  Sun,
  Moon,
  Users,
  Palette,
  Wrench,
  Target,
  Calendar,
  TrendingUp,
  Timer
} from 'lucide-react';
import { useToast } from '@/shared/ui/use-toast';
import { useAuthSession } from '@/shared/hooks/useAuthSession';
import { 
  ProjectBasedTaskAgent,
  ProjectTaskSummary, 
  WorkTypeTaskSummary, 
  ProjectConfig, 
  WorkTypeConfig 
} from '@/core/task.service';
// Removed framer-motion import for performance

export function ProjectBasedTaskDashboard() {
  const { user } = useAuthSession();
  const { toast } = useToast();
  const [agent] = useState(() => new ProjectBasedTaskAgent(user?.id));
  
  const [projectSummaries, setProjectSummaries] = useState<ProjectTaskSummary[]>([]);
  const [workTypeSummaries, setWorkTypeSummaries] = useState<WorkTypeTaskSummary[]>([]);
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // New task creation state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedWorkType, setSelectedWorkType] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');

  const projects = agent.getProjects();
  const workTypes = agent.getWorkTypes();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [projectData, workTypeData, insightData] = await Promise.all([
        agent.getTasksByProjects(),
        agent.getTasksByWorkTypes(),
        agent.getProjectInsights()
      ]);
      
      setProjectSummaries(projectData);
      setWorkTypeSummaries(workTypeData);
      setInsights(insightData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        variant: "destructive",
        title: "Error loading task data",
        description: "Could not load project task data. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  const createProjectTask = async () => {
    if (!newTaskTitle.trim() || !selectedProject || !selectedWorkType) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please fill in all required fields"
      });
      return;
    }

    try {
      await agent.createProjectTask(
        newTaskTitle,
        newTaskDescription,
        selectedProject,
        selectedWorkType,
        selectedPriority
      );

      toast({
        title: "Task created successfully",
        description: `Created task for ${projects.find(p => p.id === selectedProject)?.name}`
      });

      // Reset form
      setNewTaskTitle('');
      setNewTaskDescription('');
      setSelectedProject('');
      setSelectedWorkType('');
      setSelectedPriority('medium');
      
      // Refresh data
      loadDashboardData();
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        variant: "destructive",
        title: "Error creating task",
        description: "Could not create task. Please try again."
      });
    }
  };

  const getWorkTypeIcon = (workTypeId: string) => {
    switch (workTypeId) {
      case 'light-work': return <Sun className="h-4 w-4" />;
      case 'deep-work': return <Brain className="h-4 w-4" />;
      case 'client-communication': return <Users className="h-4 w-4" />;
      case 'creative-work': return <Palette className="h-4 w-4" />;
      case 'maintenance': return <Wrench className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
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
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Projects</p>
                  <p className="text-2xl font-bold">{projectSummaries.filter(p => p.totalTasks > 0).length}</p>
                </div>
                <FolderOpen className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Tasks</p>
                  <p className="text-2xl font-bold">{projectSummaries.reduce((sum, p) => sum + p.totalTasks, 0)}</p>
                </div>
                <Target className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Est. Work Time</p>
                  <p className="text-2xl font-bold">
                    {Math.round(projectSummaries.reduce((sum, p) => sum + p.estimatedTime, 0) / 60)}h
                  </p>
                </div>
                <Timer className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">High Priority</p>
                  <p className="text-2xl font-bold text-orange-500">
                    {projectSummaries.reduce((sum, p) => sum + p.highPriorityTasks, 0)}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="projects" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="projects">By Projects</TabsTrigger>
          <TabsTrigger value="worktypes">By Work Type</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="create">Create Task</TabsTrigger>
        </TabsList>

        {/* Projects Tab */}
        <TabsContent value="projects" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {projectSummaries.map((summary, index) => (
              <div
                key={summary.project.id}
              >
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span className={`${summary.project.color} text-white p-2 rounded`}>
                        {summary.project.icon}
                      </span>
                      {summary.project.name}
                    </CardTitle>
                    <CardDescription>{summary.project.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Project Stats */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-600">{summary.totalTasks}</p>
                          <p className="text-xs text-muted-foreground">Total Tasks</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-orange-600">{summary.highPriorityTasks}</p>
                          <p className="text-xs text-muted-foreground">High Priority</p>
                        </div>
                      </div>

                      {/* Time Estimate */}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Estimated Time:</span>
                        <Badge variant="outline">
                          <Clock className="h-3 w-3 mr-1" />
                          {Math.round(summary.estimatedTime / 60 * 10) / 10}h
                        </Badge>
                      </div>

                      {/* Recent Tasks Preview */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Recent Tasks:</h4>
                        {summary.tasks.slice(0, 3).map((task) => (
                          <div key={task.id} className="p-2 bg-muted rounded text-xs">
                            <div className="flex items-center justify-between">
                              <span className="truncate flex-1">{task.title}</span>
                              <Badge className={`ml-2 ${getPriorityColor(task.priority || 'medium')} text-xs`}>
                                {task.priority || 'medium'}
                              </Badge>
                            </div>
                          </div>
                        ))}
                        {summary.tasks.length > 3 && (
                          <p className="text-xs text-muted-foreground">
                            +{summary.tasks.length - 3} more tasks
                          </p>
                        )}
                        {summary.tasks.length === 0 && (
                          <p className="text-xs text-muted-foreground">No active tasks</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Work Types Tab */}
        <TabsContent value="worktypes" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {workTypeSummaries.map((summary, index) => (
              <div
                key={summary.workType.id}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {getWorkTypeIcon(summary.workType.id)}
                      {summary.workType.name}
                      <Badge className={summary.workType.color}>
                        {summary.workType.focusLevel}
                      </Badge>
                    </CardTitle>
                    <CardDescription>{summary.workType.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Work Type Stats */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-600">{summary.totalTasks}</p>
                          <p className="text-xs text-muted-foreground">Tasks</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-600">
                            {Math.round(summary.estimatedTime / 60 * 10) / 10}h
                          </p>
                          <p className="text-xs text-muted-foreground">Est. Time</p>
                        </div>
                      </div>

                      {/* Recommended Time Block */}
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm font-medium text-blue-800">Recommended Schedule:</p>
                        <p className="text-sm text-blue-600">{summary.recommendedTimeBlock}</p>
                      </div>

                      {/* Tasks Preview */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Tasks:</h4>
                        {summary.tasks.slice(0, 4).map((task) => (
                          <div key={task.id} className="p-2 bg-muted rounded text-xs">
                            <div className="flex items-center justify-between">
                              <span className="truncate flex-1">{task.title}</span>
                              <Badge className={`ml-2 ${getPriorityColor(task.priority || 'medium')} text-xs`}>
                                {task.priority || 'medium'}
                              </Badge>
                            </div>
                          </div>
                        ))}
                        {summary.tasks.length > 4 && (
                          <p className="text-xs text-muted-foreground">
                            +{summary.tasks.length - 4} more tasks
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          {/* Daily Schedule Suggestion */}
          {workTypeSummaries.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Suggested Daily Schedule
                </CardTitle>
                <CardDescription>Optimal time blocks based on your work types</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Morning */}
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <h4 className="font-medium text-yellow-800 flex items-center gap-2">
                      <Sun className="h-4 w-4" />
                      Morning (9-12 PM)
                    </h4>
                    <p className="text-sm text-yellow-600 mt-2">
                      Deep work and complex tasks when energy is highest
                    </p>
                    <div className="mt-2 space-y-1">
                      {workTypeSummaries
                        .filter(w => w.workType.focusLevel === 'deep')
                        .map(w => (
                          <Badge key={w.workType.id} variant="outline" className="mr-1">
                            {w.workType.name} ({w.totalTasks})
                          </Badge>
                        ))}
                    </div>
                  </div>

                  {/* Afternoon */}
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-800 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Afternoon (1-5 PM)
                    </h4>
                    <p className="text-sm text-blue-600 mt-2">
                      Client communication and collaborative work
                    </p>
                    <div className="mt-2 space-y-1">
                      {workTypeSummaries
                        .filter(w => w.workType.id === 'client-communication')
                        .map(w => (
                          <Badge key={w.workType.id} variant="outline" className="mr-1">
                            {w.workType.name} ({w.totalTasks})
                          </Badge>
                        ))}
                    </div>
                  </div>

                  {/* Evening */}
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-medium text-purple-800 flex items-center gap-2">
                      <Moon className="h-4 w-4" />
                      Evening (5-7 PM)
                    </h4>
                    <p className="text-sm text-purple-600 mt-2">
                      Light work, admin tasks, and planning
                    </p>
                    <div className="mt-2 space-y-1">
                      {workTypeSummaries
                        .filter(w => w.workType.focusLevel === 'light' && w.workType.id !== 'client-communication')
                        .map(w => (
                          <Badge key={w.workType.id} variant="outline" className="mr-1">
                            {w.workType.name} ({w.totalTasks})
                          </Badge>
                        ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Project Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FolderOpen className="h-5 w-5" />
                  Project Insights
                </CardTitle>
                <CardDescription>AI analysis of your project workload</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {insights?.projectRecommendations?.map((recommendation: string, index: number) => (
                    <div key={index} className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">{recommendation}</p>
                    </div>
                  ))}
                  {(!insights?.projectRecommendations?.length) && (
                    <p className="text-muted-foreground text-sm">
                      Your projects are well balanced! 🎉
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Work Type Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Work Type Analysis
                </CardTitle>
                <CardDescription>Optimize your workflow and focus</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {insights?.workTypeRecommendations?.map((recommendation: string, index: number) => (
                    <div key={index} className="p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-800">{recommendation}</p>
                    </div>
                  ))}
                  {(!insights?.workTypeRecommendations?.length) && (
                    <p className="text-muted-foreground text-sm">
                      Your work types are optimally distributed! ⚡
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Time Management Tips */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Time Management Tips
                </CardTitle>
                <CardDescription>Smart scheduling recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {insights?.timeManagementTips?.map((tip: string, index: number) => (
                    <div key={index} className="p-3 bg-purple-50 rounded-lg">
                      <p className="text-sm text-purple-800">{tip}</p>
                    </div>
                  ))}
                  {(!insights?.timeManagementTips?.length) && (
                    <p className="text-muted-foreground text-sm">
                      Your time management is on point! 🕒
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Create Task Tab */}
        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create Project Task
              </CardTitle>
              <CardDescription>Add a new task with project and work type classification</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Task Details */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Task Title *</label>
                    <Input
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      placeholder="e.g., 'Implement user authentication'"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      value={newTaskDescription}
                      onChange={(e) => setNewTaskDescription(e.target.value)}
                      placeholder="Detailed description of the task..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Priority</label>
                    <select 
                      value={selectedPriority}
                      onChange={(e) => setSelectedPriority(e.target.value as any)}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                {/* Project and Work Type Selection */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Project *</label>
                    <select 
                      value={selectedProject}
                      onChange={(e) => setSelectedProject(e.target.value)}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="">Select a project...</option>
                      {projects.map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.icon} {project.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Work Type *</label>
                    <select 
                      value={selectedWorkType}
                      onChange={(e) => setSelectedWorkType(e.target.value)}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="">Select work type...</option>
                      {workTypes.map((workType) => (
                        <option key={workType.id} value={workType.id}>
                          {workType.icon} {workType.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Preview */}
                  {selectedProject && selectedWorkType && (
                    <div className="p-3 bg-muted rounded-lg">
                      <h4 className="text-sm font-medium mb-2">Task Preview:</h4>
                      <div className="space-y-1 text-xs">
                        <p><strong>Project:</strong> {projects.find(p => p.id === selectedProject)?.name}</p>
                        <p><strong>Work Type:</strong> {workTypes.find(w => w.id === selectedWorkType)?.name}</p>
                        <p><strong>Est. Duration:</strong> {workTypes.find(w => w.id === selectedWorkType)?.estimatedDuration} min</p>
                        <p><strong>Focus Level:</strong> {workTypes.find(w => w.id === selectedWorkType)?.focusLevel}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <Button onClick={createProjectTask} className="w-full" size="lg">
                Create Project Task
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ProjectBasedTaskDashboard;