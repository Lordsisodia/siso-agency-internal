import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Square, Clock, Cpu, RefreshCw, Eye, ArrowLeft, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from "@/hooks/use-toast";
import { SessionOutputViewer } from './SessionOutputViewer';
import { api } from '@/lib/api';
import type { AgentRun } from '@/lib/api';

interface RunningSessionsViewProps {
  className?: string;
  showBackButton?: boolean;
  onBack?: () => void;
}

export function RunningSessionsView({ className, showBackButton = false, onBack }: RunningSessionsViewProps) {
  const [runningSessions, setRunningSessions] = useState<AgentRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSession, setSelectedSession] = useState<AgentRun | null>(null);
  const { toast } = useToast();

  const loadRunningSessions = async () => {
    try {
      const sessions = await api.listRunningAgentSessions();
      setRunningSessions(sessions);
    } catch (error) {
      console.error('Failed to load running sessions:', error);
      toast({
        title: "Error",
        description: "Failed to load running sessions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshSessions = async () => {
    setRefreshing(true);
    try {
      // First cleanup finished processes
      await api.cleanupFinishedProcesses();
      // Then reload the list
      await loadRunningSessions();
      toast({
        title: "Success",
        description: "Running sessions list has been updated"
      });
    } catch (error) {
      console.error('Failed to refresh sessions:', error);
      toast({
        title: "Error",
        description: "Failed to refresh sessions",
        variant: "destructive"
      });
    } finally {
      setRefreshing(false);
    }
  };

  const killSession = async (runId: number, agentName: string) => {
    try {
      const success = await api.killAgentSession(runId);
      if (success) {
        toast({
          title: "Success",
          description: `${agentName} session has been stopped`
        });
        // Refresh the list after killing
        await loadRunningSessions();
      } else {
        toast({
          title: "Warning",
          description: "Session may have already finished",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Failed to kill session:', error);
      toast({
        title: "Error",
        description: "Failed to terminate session",
        variant: "destructive"
      });
    }
  };

  const formatDuration = (startTime: string) => {
    const start = new Date(startTime);
    const now = new Date();
    const durationMs = now.getTime() - start.getTime();
    const minutes = Math.floor(durationMs / (1000 * 60));
    const seconds = Math.floor((durationMs % (1000 * 60)) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'running':
        return <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">Running</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  useEffect(() => {
    loadRunningSessions();
    
    // Set up auto-refresh every 5 seconds
    const interval = setInterval(() => {
      if (!refreshing) {
        loadRunningSessions();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [refreshing]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Loading running sessions...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {showBackButton && onBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div className="relative">
            <Play className="h-5 w-5" />
            {runningSessions.length > 0 && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            )}
          </div>
          <h2 className="text-lg font-semibold">Live Agent Sessions</h2>
          <Badge 
            variant={runningSessions.length > 0 ? "default" : "secondary"}
            className={runningSessions.length > 0 ? "bg-green-100 text-green-800 border-green-200" : ""}
          >
            {runningSessions.length} {runningSessions.length === 1 ? 'active' : 'active'}
          </Badge>
          {runningSessions.length > 0 && (
            <span className="text-xs text-green-600 font-medium">● Live</span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-muted-foreground">
            Auto-refresh every 5s
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshSessions}
            disabled={refreshing}
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh Now</span>
          </Button>
        </div>
      </div>

      {runningSessions.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center p-12">
            <div className="text-center space-y-4">
              <div className="relative">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground" />
                <div className="absolute inset-0 rounded-full border-2 border-dashed border-muted-foreground/30"></div>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-medium">All Quiet</h3>
                <p className="text-muted-foreground text-sm">
                  No agent sessions are currently running
                </p>
                <p className="text-xs text-muted-foreground">
                  Start an agent execution to see live sessions here
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {runningSessions.map((session) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="hover:shadow-md transition-shadow border-l-4 border-l-green-500">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="relative flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-100 to-green-100 rounded-full">
                        <Bot className="h-5 w-5 text-blue-600" />
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                      </div>
                      <div>
                        <CardTitle className="text-base flex items-center gap-2">
                          {session.agent_name}
                          <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full">
                            ● LIVE
                          </span>
                        </CardTitle>
                        <div className="flex items-center space-x-2 mt-1">
                          {getStatusBadge(session.status)}
                          {session.pid && (
                            <Badge variant="outline" className="text-xs">
                              <Cpu className="h-3 w-3 mr-1" />
                              PID {session.pid}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedSession(session)}
                        className="flex items-center space-x-2"
                      >
                        <Eye className="h-4 w-4" />
                        <span>View Output</span>
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => session.id && killSession(session.id, session.agent_name)}
                        className="flex items-center space-x-2"
                      >
                        <Square className="h-4 w-4" />
                        <span>Stop</span>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Task</p>
                      <p className="text-sm font-medium truncate">{session.task}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Model</p>
                        <p className="font-medium">{session.model}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Duration</p>
                        <p className="font-medium">
                          {session.process_started_at 
                            ? formatDuration(session.process_started_at)
                            : 'Unknown'
                          }
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground">Project Path</p>
                      <p className="text-xs font-mono bg-muted px-2 py-1 rounded truncate">
                        {session.project_path}
                      </p>
                    </div>
                    
                    {session.session_id && (
                      <div>
                        <p className="text-sm text-muted-foreground">Session ID</p>
                        <p className="text-xs font-mono bg-muted px-2 py-1 rounded truncate">
                          {session.session_id}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Session Output Viewer */}
      <AnimatePresence>
        {selectedSession && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-4xl h-full max-h-[90vh]">
              <SessionOutputViewer
                session={selectedSession}
                onClose={() => setSelectedSession(null)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}