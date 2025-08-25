import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Play,
  Bot,
  ArrowLeft,
  History,
  Download,
  Upload,
  Globe,
  FileJson,
  ChevronDown,
  Terminal,
  Code,
  Cpu,
  Zap,
  ExternalLink,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { api as claudiaApi } from "@/lib/claudia-api";

interface Agent {
  id: string;
  name: string;
  description: string;
  icon: string;
  created_at: string;
  status: 'active' | 'idle' | 'running';
  executions: number;
  model?: string;
  system_prompt?: string;
}

interface ClaudiaCCAgentsProps {
  onBack: () => void;
  className?: string;
}

const iconMap = {
  code: Code,
  cpu: Cpu,
  zap: Zap,
  bot: Bot,
  terminal: Terminal
};

export const ClaudiaCCAgents: React.FC<ClaudiaCCAgentsProps> = ({ onBack, className }) => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"welcome" | "agents" | "projects" | "claude-session" | "running" | "history">("welcome");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [agentToDelete, setAgentToDelete] = useState<Agent | null>(null);
  const [claudiaStatus, setClaudiaStatus] = useState<any>(null);
  const [launchingClaudia, setLaunchingClaudia] = useState(false);

  // Load Claudia data on component mount
  useEffect(() => {
    loadClaudiaData();
  }, []);

  const loadClaudiaData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check Claude Code version status
      const versionStatus = await claudiaApi.checkClaudeVersion();
      setClaudiaStatus(versionStatus);

      // Load projects from Claudia
      const projects = await claudiaApi.listProjects();
      
      // Load agents from Claudia
      const agents = await claudiaApi.listAgents();
      
      // If we have real agents, use them
      if (agents && agents.length > 0) {
        const transformedAgents: Agent[] = agents.map(agent => ({
          id: agent.id?.toString() || '',
          name: agent.name,
          description: agent.system_prompt.substring(0, 100) + '...',
          icon: agent.icon,
          created_at: agent.created_at,
          status: 'active' as const,
          executions: 0,
          model: agent.model,
          system_prompt: agent.system_prompt
        }));
        setAgents(transformedAgents);
      } else {
        // Fallback: Transform projects into agents for display
        const transformedAgents: Agent[] = projects.slice(0, 5).map((project, index) => ({
          id: project.id,
          name: `Project: ${project.path.split('/').pop() || 'Unknown'}`,
          description: `Claude Code project at ${project.path}`,
          icon: 'code',
          created_at: new Date(project.created_at * 1000).toISOString(),
          status: 'active' as const,
          executions: project.sessions.length,
          model: 'claude-3-sonnet',
          system_prompt: 'Claude Code Agent for project management'
        }));
        setAgents(transformedAgents);
      }

    } catch (err) {
      console.error('Failed to load Claudia data:', err);
      setError('Failed to connect to Claudia backend. Make sure the app is running in Tauri mode.');
    } finally {
      setLoading(false);
    }
  };

  const handleLaunchClaudia = async () => {
    try {
      setLaunchingClaudia(true);
      
      // Launch Claude Code session
      await claudiaApi.openNewSession(process.cwd());
      
      // Refresh status after launch
      const versionStatus = await claudiaApi.checkClaudeVersion();
      setClaudiaStatus(versionStatus);
      
      // Reload data
      await loadClaudiaData();
      
    } catch (err) {
      console.error('Error launching Claudia:', err);
      setError('Error launching Claude Code session');
    } finally {
      setLaunchingClaudia(false);
    }
  };

  const handleDeleteAgent = (agent: Agent) => {
    setAgentToDelete(agent);
    setShowDeleteDialog(true);
  };

  const confirmDeleteAgent = () => {
    if (agentToDelete) {
      setAgents(prev => prev.filter(a => a.id !== agentToDelete.id));
      setShowDeleteDialog(false);
      setAgentToDelete(null);
    }
  };

  const handleExecuteAgent = async (agent: Agent) => {
    try {
      // Update agent status to running
      setAgents(prev => prev.map(a => 
        a.id === agent.id 
          ? { ...a, status: 'running' as const, executions: a.executions + 1 }
          : a
      ));

      // Execute the agent via Claudia API
      const task = `Execute agent: ${agent.name}`;
      const success = await claudiaApi.executeAgent(parseInt(agent.id), process.cwd(), task);

      if (!success) {
        setError(`Failed to execute agent: ${agent.name}`);
        // Revert status on failure
        setAgents(prev => prev.map(a => 
          a.id === agent.id ? { ...a, status: 'active' as const } : a
        ));
        return;
      }

      // Simulate execution completion after 3 seconds (in real implementation, this would be event-driven)
      setTimeout(() => {
        setAgents(prev => prev.map(a => 
          a.id === agent.id ? { ...a, status: 'active' as const } : a
        ));
      }, 3000);

    } catch (err) {
      console.error('Error executing agent:', err);
      setError(`Error executing agent: ${agent.name}`);
      // Revert status on error
      setAgents(prev => prev.map(a => 
        a.id === agent.id ? { ...a, status: 'active' as const } : a
      ));
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/20';
      case 'running': return 'bg-blue-500/20 text-blue-400 border-blue-500/20';
      case 'idle': return 'bg-gray-500/20 text-gray-400 border-gray-500/20';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/20';
    }
  };

  const renderIcon = (iconName: string) => {
    const Icon = iconMap[iconName as keyof typeof iconMap] || Bot;
    return <Icon className="h-12 w-12" />;
  };

  const runningAgents = agents.filter(a => a.status === 'running');

  // Render welcome screen similar to original Claudia app
  const renderWelcomeScreen = () => (
    <div className="flex items-center justify-center p-4 h-full">
      <div className="w-full max-w-4xl">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <h1 className="text-4xl font-bold tracking-tight text-siso-text-bold">
            <Bot className="inline-block mr-3 h-10 w-10 text-siso-orange" />
            Welcome to Claudia
          </h1>
          <p className="text-lg text-siso-text-muted mt-4">
            Your comprehensive Claude Code development environment
          </p>
          
          {/* Claudia Status */}
          {claudiaStatus && (
            <div className="mt-6 flex items-center justify-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${claudiaStatus.running ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
                <span className="text-sm text-siso-text-muted">
                  Claudia Desktop: {claudiaStatus.running ? 'Running' : 'Available'}
                </span>
              </div>
              {!claudiaStatus.running && (
                <Button
                  onClick={handleLaunchClaudia}
                  disabled={launchingClaudia}
                  size="sm"
                  className="bg-siso-orange hover:bg-siso-red"
                >
                  {launchingClaudia ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Launching...
                    </>
                  ) : (
                    <>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Launch Claudia
                    </>
                  )}
                </Button>
              )}
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-siso-orange" />
              <span className="text-sm text-siso-text-muted">Loading Claudia data...</span>
            </div>
          )}
        </motion.div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {/* CC Agents Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card 
              className="h-64 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-siso-orange/20 border border-siso-border hover:border-siso-orange/40 bg-siso-bg-alt"
              onClick={() => setActiveTab("agents")}
            >
              <div className="h-full flex flex-col items-center justify-center p-8">
                <Bot className="h-16 w-16 mb-4 text-siso-orange" />
                <h2 className="text-xl font-semibold text-siso-text-bold">CC Agents</h2>
                <p className="text-sm text-siso-text-muted mt-2">Manage AI development agents</p>
              </div>
            </Card>
          </motion.div>

          {/* CC Projects Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card 
              className="h-64 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-siso-orange/20 border border-siso-border hover:border-siso-orange/40 bg-siso-bg-alt"
              onClick={() => setActiveTab("projects")}
            >
              <div className="h-full flex flex-col items-center justify-center p-8">
                <Code className="h-16 w-16 mb-4 text-siso-orange" />
                <h2 className="text-xl font-semibold text-siso-text-bold">CC Projects</h2>
                <p className="text-sm text-siso-text-muted mt-2">Browse Claude Code sessions</p>
              </div>
            </Card>
          </motion.div>

          {/* Claude Session Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card 
              className="h-64 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-siso-orange/20 border border-siso-border hover:border-siso-orange/40 bg-siso-bg-alt"
              onClick={() => setActiveTab("claude-session")}
            >
              <div className="h-full flex flex-col items-center justify-center p-8">
                <Terminal className="h-16 w-16 mb-4 text-siso-orange" />
                <h2 className="text-xl font-semibold text-siso-text-bold">New Session</h2>
                <p className="text-sm text-siso-text-muted mt-2">Start new Claude Code session</p>
              </div>
            </Card>
          </motion.div>

          {/* Running Sessions Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card 
              className="h-64 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-siso-orange/20 border border-siso-border hover:border-siso-orange/40 bg-siso-bg-alt"
              onClick={() => setActiveTab("running")}
            >
              <div className="h-full flex flex-col items-center justify-center p-8">
                <div className="relative">
                  <Zap className="h-16 w-16 mb-4 text-siso-orange" />
                  {runningAgents.length > 0 && (
                    <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                  )}
                </div>
                <h2 className="text-xl font-semibold text-siso-text-bold">Running Sessions</h2>
                <p className="text-sm text-siso-text-muted mt-2">{runningAgents.length} active sessions</p>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );

  // Show welcome screen by default
  if (activeTab === "welcome") {
    return (
      <div className={cn("flex flex-col h-screen bg-siso-bg", className)}>
        {/* Header */}
        <div className="border-b border-siso-border bg-siso-bg-alt px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
                className="h-8 w-8 text-siso-text hover:text-siso-text-bold"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-siso-text-bold">SISO Dev Tools - Claudia Dashboard</h1>
                <p className="text-sm text-siso-text-muted">
                  Integrated Claude Code development environment
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Welcome Content */}
        <div className="flex-1 overflow-hidden">
          {renderWelcomeScreen()}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col h-screen bg-siso-bg", className)}>
      <div className="w-full flex flex-col h-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="border-b border-siso-border bg-siso-bg-alt px-6 py-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setActiveTab("welcome")}
                className="h-8 w-8 text-siso-text hover:text-siso-text-bold"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-siso-text-bold">Claudia Dashboard</h1>
                <p className="text-sm text-siso-text-muted">
                  Manage your Claude Code agents and development workflow
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="default"
                    variant="outline"
                    className="flex items-center gap-2 border-siso-border hover:border-siso-border-hover"
                  >
                    <Download className="h-4 w-4" />
                    Import
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-siso-bg-alt border-siso-border">
                  <DropdownMenuItem className="text-siso-text hover:bg-siso-bg">
                    <FileJson className="h-4 w-4 mr-2" />
                    From Claudia Desktop
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-siso-text hover:bg-siso-bg">
                    <Globe className="h-4 w-4 mr-2" />
                    From GitHub
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                size="default"
                className="flex items-center gap-2 bg-siso-orange hover:bg-siso-red"
              >
                <Plus className="h-4 w-4" />
                Create Agent
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <div className="border-b border-siso-border">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab("agents")}
              className={cn(
                "py-2 px-1 border-b-2 font-medium text-sm transition-colors",
                activeTab === "agents"
                  ? "border-siso-orange text-siso-orange"
                  : "border-transparent text-siso-text-muted hover:text-siso-text hover:border-siso-text-muted"
              )}
            >
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4" />
                Agents
                <Badge variant="secondary" className="bg-siso-bg-alt text-siso-text-muted">
                  {agents.length}
                </Badge>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("running")}
              className={cn(
                "py-2 px-1 border-b-2 font-medium text-sm transition-colors relative",
                activeTab === "running"
                  ? "border-siso-orange text-siso-orange"
                  : "border-transparent text-siso-text-muted hover:text-siso-text hover:border-siso-text-muted"
              )}
            >
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Play className="h-4 w-4" />
                  {runningAgents.length > 0 && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  )}
                </div>
                Running Sessions
                <Badge variant="secondary" className="bg-green-100 text-green-800 border border-green-200">
                  {runningAgents.length}
                </Badge>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={cn(
                "py-2 px-1 border-b-2 font-medium text-sm transition-colors",
                activeTab === "history"
                  ? "border-siso-orange text-siso-orange"
                  : "border-transparent text-siso-text-muted hover:text-siso-text hover:border-siso-text-muted"
              )}
            >
              <div className="flex items-center gap-2">
                <History className="h-4 w-4" />
                Execution History
                <Badge variant="secondary" className="bg-siso-bg-alt text-siso-text-muted">
                  {agents.reduce((sum, a) => sum + a.executions, 0)}
                </Badge>
              </div>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {activeTab === "projects" && (
              <motion.div
                key="projects"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="text-center py-16">
                  <Code className="h-16 w-16 text-siso-text-muted mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2 text-siso-text-bold">CC Projects</h3>
                  <p className="text-sm text-siso-text-muted mb-6">
                    Browse your Claude Code project sessions (Feature coming soon)
                  </p>
                  <Button 
                    onClick={() => setActiveTab("welcome")} 
                    size="default"
                    className="bg-siso-orange hover:bg-siso-red"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Home
                  </Button>
                </div>
              </motion.div>
            )}

            {activeTab === "claude-session" && (
              <motion.div
                key="claude-session"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="text-center py-16">
                  <Terminal className="h-16 w-16 text-siso-text-muted mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2 text-siso-text-bold">Claude Code Session</h3>
                  <p className="text-sm text-siso-text-muted mb-6">
                    Interactive Claude Code development environment (Feature coming soon)
                  </p>
                  <Button 
                    onClick={() => setActiveTab("welcome")} 
                    size="default"
                    className="bg-siso-orange hover:bg-siso-red"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Home
                  </Button>
                </div>
              </motion.div>
            )}

            {activeTab === "agents" && (
              <motion.div
                key="agents"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <AnimatePresence mode="popLayout">
                    {agents.map((agent, index) => (
                      <motion.div
                        key={agent.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                      >
                        <Card className="h-full bg-siso-bg-alt border-siso-border hover:border-siso-border-hover hover:shadow-lg transition-all">
                          <CardContent className="p-6 flex flex-col items-center text-center">
                            <div className="mb-4 p-4 rounded-full bg-siso-orange/10 text-siso-orange">
                              {renderIcon(agent.icon)}
                            </div>
                            <h3 className="text-lg font-semibold mb-2 text-siso-text-bold">
                              {agent.name}
                            </h3>
                            <p className="text-sm text-siso-text-muted mb-3">
                              {agent.description}
                            </p>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={getStatusColor(agent.status)}>
                                {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
                              </Badge>
                              <Badge variant="secondary" className="bg-siso-bg text-siso-text-muted">
                                {agent.executions} runs
                              </Badge>
                            </div>
                            <p className="text-xs text-siso-text-muted">
                              Created: {new Date(agent.created_at).toLocaleDateString()}
                            </p>
                          </CardContent>
                          <CardFooter className="p-4 pt-0 flex justify-center gap-1 flex-wrap">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleExecuteAgent(agent)}
                              className="flex items-center gap-1 text-siso-text hover:text-siso-text-bold"
                              disabled={agent.status === 'running'}
                            >
                              <Play className="h-3 w-3" />
                              {agent.status === 'running' ? 'Running...' : 'Execute'}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="flex items-center gap-1 text-siso-text hover:text-siso-text-bold"
                            >
                              <Edit className="h-3 w-3" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="flex items-center gap-1 text-siso-text hover:text-siso-text-bold"
                            >
                              <Upload className="h-3 w-3" />
                              Export
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteAgent(agent)}
                              className="flex items-center gap-1 text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="h-3 w-3" />
                              Delete
                            </Button>
                          </CardFooter>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {activeTab === "running" && (
              <motion.div
                key="running"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Play className="h-5 w-5 text-siso-text-muted" />
                      <h2 className="text-lg font-semibold text-siso-text-bold">Running Sessions</h2>
                    </div>
                  </div>
                  
                  {runningAgents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                      <Play className="h-16 w-16 text-siso-text-muted mb-4" />
                      <h3 className="text-lg font-medium mb-2 text-siso-text-bold">No running sessions</h3>
                      <p className="text-sm text-siso-text-muted mb-4">
                        Execute an agent to see live sessions here
                      </p>
                      <Button 
                        onClick={() => setActiveTab("agents")} 
                        size="default"
                        className="flex items-center gap-2 bg-siso-orange hover:bg-siso-red"
                      >
                        <Bot className="h-4 w-4" />
                        View Agents
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {runningAgents.map((agent) => (
                        <Card key={agent.id} className="bg-siso-bg-alt border-siso-border">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-full bg-blue-500/10 text-blue-400">
                                {renderIcon(agent.icon)}
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold text-siso-text-bold">{agent.name}</h3>
                                <p className="text-sm text-siso-text-muted">Currently executing...</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                <span className="text-sm text-blue-400">Running</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === "history" && (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <History className="h-5 w-5 text-siso-text-muted" />
                      <h2 className="text-lg font-semibold text-siso-text-bold">Execution History</h2>
                      <Badge variant="secondary" className="bg-siso-bg-alt text-siso-text-muted">
                        {agents.reduce((sum, a) => sum + a.executions, 0)} total runs
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {agents.map((agent) => (
                      <Card key={agent.id} className="bg-siso-bg-alt border-siso-border">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-full bg-siso-orange/10 text-siso-orange">
                                {renderIcon(agent.icon)}
                              </div>
                              <div>
                                <h3 className="font-semibold text-siso-text-bold">{agent.name}</h3>
                                <p className="text-sm text-siso-text-muted">Last executed: {new Date().toLocaleDateString()}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-semibold text-siso-text-bold">{agent.executions}</p>
                              <p className="text-sm text-siso-text-muted">executions</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md bg-siso-bg-alt border-siso-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-siso-text-bold">
              <Trash2 className="h-5 w-5 text-red-400" />
              Delete Agent
            </DialogTitle>
            <DialogDescription className="text-siso-text-muted">
              Are you sure you want to delete the agent "{agentToDelete?.name}"? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              className="w-full sm:w-auto border-siso-border text-siso-text"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteAgent}
              className="w-full sm:w-auto bg-red-500 hover:bg-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Agent
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};