import React, { useState, Suspense } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Card } from "@/shared/ui/card";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";
import { 
  Home, 
  Terminal, 
  Users, 
  Activity, 
  Settings as SettingsIcon,
  FolderOpen,
  Zap,
  BarChart,
  MessageSquare,
  Layers,
  Sparkles,
  UserCheck,
  Play,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';

// Import all Claudia components
import { ClaudeCodeSession } from './ClaudeCodeSession';
import { FloatingPromptInput } from './FloatingPromptInput';
import { SessionList } from './SessionList';
import { ProjectList } from './ProjectList';
import { CCAgents } from './CCAgents';
import { AgentExecution } from './AgentExecution';
import { AgentRunsList } from './AgentRunsList';
import { AutonomousAgentMonitor } from './AutonomousAgentMonitor';
import { SupervisorDashboard } from './SupervisorDashboard';
import { SwarmDashboard } from './SwarmDashboard';
import { UsageDashboard } from './UsageDashboard';
import { TokenCounter } from './TokenCounter';
import { Settings } from './Settings';
import { MCPManager } from './MCPManager';
import { RunningSessionsView } from './RunningSessionsView';
import { SuperClaudeInterface } from './SuperClaudeInterface';
import { TeamWorkflowDashboard } from './TeamWorkflowDashboard';
import { ClaudeExecutionInterface } from './ClaudeExecutionInterface';

// Import styles
import '@/claudia-styles.css';

interface ClaudiaMainProps {
  className?: string;
}

// Loading component for lazy-loaded tabs
const LoadingTab = () => (
  <div className="flex items-center justify-center h-64">
    <div className="flex flex-col items-center space-y-4">
      <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Loading...</p>
    </div>
  </div>
);

// Error boundary component for individual tabs
const TabErrorBoundary: React.FC<{ children: React.ReactNode; tabName: string }> = ({ children, tabName }) => {
  const [hasError, setHasError] = useState(false);

  React.useEffect(() => {
    const handleError = () => setHasError(true);
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return (
      <div className="flex items-center justify-center h-64">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to load {tabName}. 
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-2"
              onClick={() => {
                setHasError(false);
                window.location.reload();
              }}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
};

export const ClaudiaMain: React.FC<ClaudiaMainProps> = ({ className }) => {
  const [activeTab, setActiveTab] = useState("session");
  const [showFloatingPrompt, setShowFloatingPrompt] = useState(false);

  return (
    <div className={`w-full h-full flex flex-col ${className}`}>
      {/* Header with Dev Tools branding */}
      <div className="border-b border-border bg-card">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Terminal className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">Claude Code Dev Tools</h1>
            </div>
            <div className="h-6 w-px bg-border" />
            <p className="text-sm text-muted-foreground">
              Integrated development environment with AI assistance
            </p>
          </div>
          {/* Token Counter - Header positioned */}
          <TokenCounter />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-6 lg:grid-cols-13 gap-2 p-2">
          <TabsTrigger value="session" className="flex items-center gap-2">
            <Terminal className="w-4 h-4" />
            <span className="hidden lg:inline">Session</span>
          </TabsTrigger>
          <TabsTrigger value="projects" className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4" />
            <span className="hidden lg:inline">Projects</span>
          </TabsTrigger>
          <TabsTrigger value="agents" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span className="hidden lg:inline">Agents</span>
          </TabsTrigger>
          <TabsTrigger value="monitor" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            <span className="hidden lg:inline">Monitor</span>
          </TabsTrigger>
          <TabsTrigger value="supervisor" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            <span className="hidden lg:inline">Supervisor</span>
          </TabsTrigger>
          <TabsTrigger value="swarm" className="flex items-center gap-2">
            <Layers className="w-4 h-4" />
            <span className="hidden lg:inline">Swarm</span>
          </TabsTrigger>
          <TabsTrigger value="usage" className="flex items-center gap-2">
            <BarChart className="w-4 h-4" />
            <span className="hidden lg:inline">Usage</span>
          </TabsTrigger>
          <TabsTrigger value="execute" className="flex items-center gap-2">
            <Play className="w-4 h-4" />
            <span className="hidden lg:inline">Execute</span>
          </TabsTrigger>
          <TabsTrigger value="mcp" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            <span className="hidden lg:inline">MCP</span>
          </TabsTrigger>
          <TabsTrigger value="running" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            <span className="hidden lg:inline">Running</span>
          </TabsTrigger>
          <TabsTrigger value="superclaude" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span className="hidden lg:inline">SuperClaude</span>
          </TabsTrigger>
          <TabsTrigger value="teamworkflow" className="flex items-center gap-2">
            <UserCheck className="w-4 h-4" />
            <span className="hidden lg:inline">Team</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <SettingsIcon className="w-4 h-4" />
            <span className="hidden lg:inline">Settings</span>
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="session" className="h-full">
            <TabErrorBoundary tabName="Session">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full p-4">
                <Card className="p-4 overflow-auto">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Terminal className="h-5 w-5 text-primary" />
                    Claude Code Session
                  </h3>
                  <Suspense fallback={<LoadingTab />}>
                    <ClaudeCodeSession />
                  </Suspense>
                </Card>
                <Card className="p-4 overflow-auto">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <FolderOpen className="h-5 w-5 text-primary" />
                    Session History
                  </h3>
                  <Suspense fallback={<LoadingTab />}>
                    <SessionList />
                  </Suspense>
                </Card>
              </div>
            </TabErrorBoundary>
          </TabsContent>

          <TabsContent value="projects" className="h-full">
            <TabErrorBoundary tabName="Projects">
              <Card className="h-full m-4 p-4 overflow-auto">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FolderOpen className="h-5 w-5 text-primary" />
                  Project Explorer
                </h3>
                <Suspense fallback={<LoadingTab />}>
                  <ProjectList />
                </Suspense>
              </Card>
            </TabErrorBoundary>
          </TabsContent>

          <TabsContent value="agents" className="h-full">
            <TabErrorBoundary tabName="Agents">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full p-4">
                <Card className="p-4 overflow-auto">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Claude Code Agents
                  </h3>
                  <Suspense fallback={<LoadingTab />}>
                    <CCAgents />
                  </Suspense>
                </Card>
                <Card className="p-4 overflow-auto">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    Agent Runs
                  </h3>
                  <Suspense fallback={<LoadingTab />}>
                    <AgentRunsList />
                  </Suspense>
                </Card>
              </div>
            </TabErrorBoundary>
          </TabsContent>

          <TabsContent value="monitor" className="h-full">
            <TabErrorBoundary tabName="Monitor">
              <div className="h-full p-4">
                <Suspense fallback={<LoadingTab />}>
                  <AutonomousAgentMonitor />
                </Suspense>
              </div>
            </TabErrorBoundary>
          </TabsContent>

          <TabsContent value="supervisor" className="h-full">
            <TabErrorBoundary tabName="Supervisor">
              <div className="h-full p-4">
                <Suspense fallback={<LoadingTab />}>
                  <SupervisorDashboard />
                </Suspense>
              </div>
            </TabErrorBoundary>
          </TabsContent>

          <TabsContent value="swarm" className="h-full">
            <TabErrorBoundary tabName="Swarm">
              <div className="h-full p-4">
                <Suspense fallback={<LoadingTab />}>
                  <SwarmDashboard />
                </Suspense>
              </div>
            </TabErrorBoundary>
          </TabsContent>

          <TabsContent value="usage" className="h-full">
            <TabErrorBoundary tabName="Usage Dashboard">
              <div className="h-full p-4">
                <Suspense fallback={<LoadingTab />}>
                  <UsageDashboard onBack={() => setActiveTab("session")} />
                </Suspense>
              </div>
            </TabErrorBoundary>
          </TabsContent>

          <TabsContent value="execute" className="h-full">
            <TabErrorBoundary tabName="Execute">
              <div className="h-full p-4">
                <Suspense fallback={<LoadingTab />}>
                  <ClaudeExecutionInterface />
                </Suspense>
              </div>
            </TabErrorBoundary>
          </TabsContent>

          <TabsContent value="mcp" className="h-full">
            <TabErrorBoundary tabName="MCP Manager">
              <div className="h-full p-4">
                <Suspense fallback={<LoadingTab />}>
                  <MCPManager />
                </Suspense>
              </div>
            </TabErrorBoundary>
          </TabsContent>

          <TabsContent value="running" className="h-full">
            <TabErrorBoundary tabName="Running Sessions">
              <div className="h-full p-4">
                <Suspense fallback={<LoadingTab />}>
                  <RunningSessionsView />
                </Suspense>
              </div>
            </TabErrorBoundary>
          </TabsContent>

          <TabsContent value="superclaude" className="h-full">
            <TabErrorBoundary tabName="SuperClaude">
              <div className="h-full p-4">
                <Suspense fallback={<LoadingTab />}>
                  <SuperClaudeInterface />
                </Suspense>
              </div>
            </TabErrorBoundary>
          </TabsContent>

          <TabsContent value="teamworkflow" className="h-full">
            <TabErrorBoundary tabName="Team Workflow">
              <div className="h-full p-4">
                <Suspense fallback={<LoadingTab />}>
                  <TeamWorkflowDashboard />
                </Suspense>
              </div>
            </TabErrorBoundary>
          </TabsContent>

          <TabsContent value="settings" className="h-full">
            <TabErrorBoundary tabName="Settings">
              <div className="h-full p-4">
                <Suspense fallback={<LoadingTab />}>
                  <Settings />
                </Suspense>
              </div>
            </TabErrorBoundary>
          </TabsContent>
        </div>
      </Tabs>

      {/* Floating Prompt Input */}
      {showFloatingPrompt && (
        <FloatingPromptInput
          onClose={() => setShowFloatingPrompt(false)}
          onSubmit={(prompt) => {
            console.log('Prompt submitted:', prompt);
            setShowFloatingPrompt(false);
          }}
        />
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => setShowFloatingPrompt(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-orange-500 hover:bg-orange-600 rounded-full shadow-lg flex items-center justify-center text-white transition-all hover:scale-110 z-40"
      >
        <Terminal className="w-6 h-6" />
      </button>
    </div>
  );
};