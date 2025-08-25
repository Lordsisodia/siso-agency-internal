import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ExternalLink, 
  Monitor, 
  Terminal, 
  Code, 
  Cpu, 
  Maximize2,
  Minimize2,
  X,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

// Simplified version for now - will fix the full integration later
const useWindowManager = () => {
  return {
    windows: [],
    isChildWindow: false,
    openDevTools: async () => 'dev-tools',
    openAgentMonitor: async () => 'agent-monitor',
    openTerminal: async () => 'terminal',
    openCodeEditor: async () => 'code-editor',
    openAgencyDashboard: async () => 'dashboard',
    openAITeamAgents: async () => 'ai-agents',
    focusWindow: () => {},
    closeWindow: () => {}
  };
};

interface WindowControlsProps {
  currentTab?: string;
  projectId?: string;
}

export const WindowControls: React.FC<WindowControlsProps> = ({ 
  currentTab = 'overview',
  projectId 
}) => {
  const { 
    windows, 
    isChildWindow, 
    openDevTools, 
    openAgentMonitor, 
    openTerminal, 
    openCodeEditor,
    openAgencyDashboard,
    openAITeamAgents,
    focusWindow,
    closeWindow 
  } = useWindowManager();
  const { toast } = useToast();
  const [isOpening, setIsOpening] = useState<string | null>(null);

  const handleOpenWindow = async (type: string, action: () => Promise<string>) => {
    setIsOpening(type);
    try {
      const windowId = await action();
      toast({
        title: "Window Opened",
        description: `${type} opened in new window`,
      });
    } catch (error) {
      toast({
        title: "Failed to Open Window",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsOpening(null);
    }
  };

  const quickActions = [
    {
      id: 'agency-dashboard',
      label: 'Agency Dashboard',
      icon: Monitor,
      description: 'Open agency dashboard in new window',
      action: () => openAgencyDashboard()
    },
    {
      id: 'ai-team-agents',
      label: 'AI Team Agents',
      icon: Cpu,
      description: 'Open AI team agents in new window',
      action: () => openAITeamAgents()
    },
    {
      id: 'terminal',
      label: 'Terminal',
      icon: Terminal,
      description: 'Open terminal in new window',
      action: () => openTerminal(projectId)
    },
    {
      id: 'code-editor',
      label: 'Code Editor',
      icon: Code,
      description: 'Open code editor in new window',
      action: () => openCodeEditor(projectId)
    }
  ];

  const activeWindows = windows.filter(w => w.id !== 'main' && w.isActive);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {/* Quick Actions */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <ExternalLink className="h-5 w-5 text-blue-400" />
            Multi-Window Controls
          </CardTitle>
          <p className="text-sm text-gray-400">
            Open agency dashboard and AI team agents in separate windows for better workflow
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {quickActions.map((action) => (
              <Button
                key={action.id}
                variant="outline"
                size="sm"
                onClick={() => handleOpenWindow(action.label, action.action)}
                disabled={isOpening === action.label}
                className="h-auto p-3 flex flex-col items-center gap-2 hover:bg-gray-700/50 transition-colors"
              >
                <action.icon className="h-5 w-5" />
                <div className="text-center">
                  <div className="text-sm font-medium">{action.label}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {action.description}
                  </div>
                </div>
                {isOpening === action.label && (
                  <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                )}
              </Button>
            ))}
          </div>

          {/* Pro tip */}
          <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-blue-400 text-sm font-medium mb-1">
              <Maximize2 className="h-4 w-4" />
              Pro Tip
            </div>
            <p className="text-xs text-blue-200">
              Open multiple windows to monitor different aspects of your development workflow simultaneously. 
              Each window maintains its own state and can be positioned on different monitors.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Active Windows */}
      {activeWindows.length > 0 && (
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Monitor className="h-5 w-5 text-green-400" />
              Active Windows
              <Badge variant="secondary" className="ml-2">
                {activeWindows.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeWindows.map((window) => (
                <div
                  key={window.id}
                  className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                    <div>
                      <div className="font-medium text-white">{window.title}</div>
                      <div className="text-sm text-gray-400 capitalize">{window.type}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => focusWindow(window.id)}
                      className="h-8 px-2"
                    >
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => closeWindow(window.id)}
                      className="h-8 px-2 hover:bg-red-900/20 hover:border-red-700"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Window Management Tips */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Maximize2 className="h-5 w-5 text-purple-400" />
            Window Management Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0" />
              <div>
                <div className="font-medium text-white">Multi-Monitor Setup</div>
                <div className="text-gray-400">Drag windows to different monitors for optimal workflow</div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0" />
              <div>
                <div className="font-medium text-white">Window Synchronization</div>
                <div className="text-gray-400">All windows share real-time data and project state</div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0" />
              <div>
                <div className="font-medium text-white">Keyboard Shortcuts</div>
                <div className="text-gray-400">Use Cmd/Ctrl + Shift + T for new terminal window</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Window Info */}
      {isChildWindow && (
        <Card className="bg-yellow-900/20 border-yellow-700/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-yellow-400 text-sm font-medium mb-2">
              <Minimize2 className="h-4 w-4" />
              Child Window
            </div>
            <p className="text-xs text-yellow-200">
              This window is running as a child of the main SISO Agency dashboard. 
              Changes made here will be synchronized with the parent window.
            </p>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
};