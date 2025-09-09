import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Activity, 
  Bot, 
  Clock, 
  Database, 
  FileText, 
  MessageSquare, 
  Trash2,
  Zap,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users,
  Globe,
  Smartphone
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Progress } from "@/shared/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { autonomousAPI, type AutonomousAgent, type TaskItem, type ResearchSession, type DatabaseStats } from "@/shared/lib/autonomous-api";

export function AutonomousAgentMonitor() {
  const [agents, setAgents] = useState<AutonomousAgent[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [research, setResearch] = useState<ResearchSession[]>([]);
  const [dbStats, setDbStats] = useState<DatabaseStats | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);
  const [activeTab, setActiveTab] = useState("agents");

  // Fetch data from Mac Mini server
  const fetchData = async () => {
    try {
      const [tasksData, researchData, statsData] = await Promise.all([
        autonomousAPI.getTasks(),
        autonomousAPI.getResearchSessions(),
        autonomousAPI.getDatabaseStats()
      ]);

      setTasks(tasksData);
      setResearch(researchData);
      setDbStats(statsData);

      // Generate agent summaries from tasks
      const agentSummaries = autonomousAPI.generateAgentSummaries(tasksData);
      setAgents(agentSummaries);
      setIsConnected(true);
    } catch (error) {
      console.error("Failed to fetch agent data:", error);
      setIsConnected(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Refresh every 5 seconds
    setRefreshInterval(interval);

    return () => {
      if (refreshInterval) clearInterval(refreshInterval);
      if (interval) clearInterval(interval);
    };
  }, []);

  const deleteTask = async (taskId: string) => {
    try {
      const success = await autonomousAPI.deleteTask(taskId);
      if (success) {
        fetchData(); // Refresh data
      }
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };


  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": case "running": case "completed": return "text-green-500";
      case "error": case "failed": return "text-red-500";
      case "pending": return "text-yellow-500";
      default: return "text-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": case "running": return <Activity className="h-4 w-4" />;
      case "completed": return <CheckCircle className="h-4 w-4" />;
      case "error": case "failed": return <XCircle className="h-4 w-4" />;
      case "pending": return <Clock className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header with Connection Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Bot className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Autonomous Agent Monitor</h1>
            <p className="text-muted-foreground">Real-time monitoring of Mac Mini autonomous agents</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className={`flex items-center space-x-2 ${isConnected ? 'text-green-500' : 'text-red-500'}`}>
            <div className={`h-3 w-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
            <span className="text-sm font-medium">
              {isConnected ? 'Connected to Mac Mini' : 'Disconnected'}
            </span>
          </div>
          <Button onClick={fetchData} size="sm">
            <Activity className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Agents</p>
                <p className="text-2xl font-bold">{agents.filter(a => a.status === "active").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tasks Completed</p>
                <p className="text-2xl font-bold">{tasks.filter(t => t.status === "completed").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Research Sessions</p>
                <p className="text-2xl font-bold">{research.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Tokens</p>
                <p className="text-2xl font-bold">{agents.reduce((sum, a) => sum + a.tokensUsed, 0).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="agents">
            <Bot className="h-4 w-4 mr-2" />
            Agents ({agents.length})
          </TabsTrigger>
          <TabsTrigger value="tasks">
            <Activity className="h-4 w-4 mr-2" />
            Tasks ({tasks.length})
          </TabsTrigger>
          <TabsTrigger value="research">
            <FileText className="h-4 w-4 mr-2" />
            Research ({research.length})
          </TabsTrigger>
          <TabsTrigger value="database">
            <Database className="h-4 w-4 mr-2" />
            Database
          </TabsTrigger>
        </TabsList>

        {/* Agents Tab */}
        <TabsContent value="agents" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {agents.map((agent) => (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="cursor-pointer"
                onClick={() => console.log("Agent clicked:", agent.name)}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{agent.name}</CardTitle>
                      <Badge variant={agent.status === "active" ? "default" : "secondary"}>
                        {agent.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Success Rate</span>
                      <span className="font-medium">{agent.successRate.toFixed(1)}%</span>
                    </div>
                    <Progress value={agent.successRate} className="h-2" />
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Tasks</p>
                        <p className="font-medium">{agent.tasksCompleted}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Claude Calls</p>
                        <p className="font-medium">{agent.claudeCalls}</p>
                      </div>
                    </div>

                    <div className="text-sm">
                      <p className="text-muted-foreground">Tokens Used</p>
                      <p className="font-medium">{agent.tokensUsed.toLocaleString()}</p>
                    </div>

                    {agent.currentTask && (
                      <div className="text-sm">
                        <p className="text-muted-foreground">Current Task</p>
                        <p className="font-medium truncate" title={agent.currentTask}>
                          {agent.currentTask}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-4">
          <div className="space-y-4">
            {tasks.map((task) => (
              <Card key={task.taskId}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <span className={getStatusColor(task.status)}>
                          {getStatusIcon(task.status)}
                        </span>
                        <div>
                          <h3 className="font-medium">{task.description}</h3>
                          <p className="text-sm text-muted-foreground">
                            {task.agentType} • {task.taskType} • {formatTime(task.createdAt)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-2 flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>Project: {task.projectPath.split('/').pop()}</span>
                        {task.tokensUsed && <span>Tokens: {task.tokensUsed.toLocaleString()}</span>}
                        {task.executionTime && <span>Duration: {Math.round(task.executionTime / 1000)}s</span>}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Badge variant={task.priority === "high" ? "destructive" : "secondary"}>
                        {task.priority}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteTask(task.taskId)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Research Tab */}
        <TabsContent value="research" className="space-y-4">
          <div className="space-y-4">
            {research.map((session) => (
              <Card key={session.researchId}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <span className={getStatusColor(session.status)}>
                          {getStatusIcon(session.status)}
                        </span>
                        <div>
                          <h3 className="font-medium">{session.topic}</h3>
                          <p className="text-sm text-muted-foreground">
                            {session.phase} • {session.scope} • {formatTime(session.createdAt)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-2 flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>Claude Calls: {session.claudeCalls}</span>
                        <span>Tokens: {session.tokensUsed.toLocaleString()}</span>
                        <span>Sources: {session.sourcesFound}</span>
                        {session.verificationRate > 0 && (
                          <span>Verification: {Math.round(session.verificationRate * 100)}%</span>
                        )}
                      </div>
                    </div>
                    
                    <Badge variant={session.priority === "high" ? "destructive" : "secondary"}>
                      {session.priority}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Database Tab */}
        <TabsContent value="database" className="space-y-4">
          {dbStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Tasks Table</p>
                      <p className="text-2xl font-bold">{dbStats.tasksTableSize}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-purple-500" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Research Table</p>
                      <p className="text-2xl font-bold">{dbStats.researchTableSize}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Agents Table</p>
                      <p className="text-2xl font-bold">{dbStats.agentsTableSize}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Database className="h-5 w-5 text-orange-500" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Records</p>
                      <p className="text-2xl font-bold">{dbStats.totalRecords}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Mobile Integration Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Smartphone className="h-5 w-5" />
            <span>Mobile Integration Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm">Telegram Bot Active</span>
            </div>
            <div className="flex items-center space-x-2">
              <Globe className="h-4 w-4 text-blue-500" />
              <span className="text-sm">Mac Mini Server: {isConnected ? 'Online' : 'Offline'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4 text-purple-500" />
              <span className="text-sm">Real-time Updates: Enabled</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}