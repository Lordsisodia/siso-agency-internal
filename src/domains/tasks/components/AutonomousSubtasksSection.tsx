import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Bot,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Loader2,
  Play,
  Pause,
  Sparkles,
  Code,
  Search,
  Eye,
  Building2,
  ClipboardCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase/client';
import { RefreshCw } from 'lucide-react';

interface AutonomousSubtask {
  id: string;
  parent_task_id: string;
  title: string;
  description: string | null;
  status: 'pending' | 'planned' | 'executing' | 'verifying' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high' | 'critical' | null;
  agent_metadata: Record<string, any>;
  summary: string | null;
  assigned_agent_role: 'researcher' | 'coder' | 'reviewer' | 'architect' | 'planner' | 'verifier' | null;
  started_at: string | null;
  completed_at: string | null;
  estimated_duration_min: number | null;
  verification_required: boolean;
  verification_notes: string | null;
  created_at: string;
  updated_at: string;
}

interface AutonomousSubtasksSectionProps {
  taskId: string;
}

const statusConfig = {
  pending: {
    color: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
    icon: Clock,
    label: 'Pending'
  },
  planned: {
    color: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    icon: Sparkles,
    label: 'Planned'
  },
  executing: {
    color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    icon: Loader2,
    label: 'Executing'
  },
  verifying: {
    color: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    icon: Eye,
    label: 'Verifying'
  },
  completed: {
    color: 'bg-green-500/20 text-green-300 border-green-500/30',
    icon: CheckCircle2,
    label: 'Completed'
  },
  failed: {
    color: 'bg-red-500/20 text-red-300 border-red-500/30',
    icon: AlertCircle,
    label: 'Failed'
  }
};

const roleConfig = {
  researcher: { icon: Search, color: 'text-blue-400', label: 'Researcher' },
  coder: { icon: Code, color: 'text-green-400', label: 'Coder' },
  reviewer: { icon: Eye, color: 'text-yellow-400', label: 'Reviewer' },
  architect: { icon: Building2, color: 'text-purple-400', label: 'Architect' },
  planner: { icon: Sparkles, color: 'text-cyan-400', label: 'Planner' },
  verifier: { icon: ClipboardCheck, color: 'text-orange-400', label: 'Verifier' }
};

const priorityConfig = {
  low: 'bg-gray-500/20 text-gray-300',
  medium: 'bg-blue-500/20 text-blue-300',
  high: 'bg-orange-500/20 text-orange-300',
  critical: 'bg-red-500/20 text-red-300'
};

export const AutonomousSubtasksSection: React.FC<AutonomousSubtasksSectionProps> = ({ taskId }) => {
  const [subtasks, setSubtasks] = useState<AutonomousSubtask[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedMetadata, setExpandedMetadata] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSubtasks();

    // Subscribe to realtime updates
    const subscription = supabase
      .channel(`autonomous-subtasks-${taskId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'autonomous_subtasks',
          filter: `parent_task_id=eq.${taskId}`
        },
        () => {
          fetchSubtasks();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [taskId]);

  const fetchSubtasks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('autonomous_subtasks')
        .select('*')
        .eq('parent_task_id', taskId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubtasks(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch subtasks');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (minutes: number | null): string => {
    if (!minutes) return 'N/A';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const calculateDuration = (startedAt: string | null, completedAt: string | null): string => {
    if (!startedAt || !completedAt) return 'In progress';
    const start = new Date(startedAt);
    const end = new Date(completedAt);
    const minutes = Math.round((end.getTime() - start.getTime()) / 60000);
    return formatDuration(minutes);
  };

  const toggleMetadata = (subtaskId: string) => {
    setExpandedMetadata(expandedMetadata === subtaskId ? null : subtaskId);
  };

  const handleRefresh = async () => {
    setLoading(true);
    await fetchSubtasks();
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
        <span className="ml-2 text-gray-400">Loading autonomous subtasks...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-300">
        <AlertCircle className="w-5 h-5 inline mr-2" />
        {error}
      </div>
    );
  }

  const completedCount = subtasks.filter(s => s.status === 'completed').length;
  const totalCount = subtasks.length;

  return (
    <div className="space-y-4">
      {/* Header with stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bot className="w-5 h-5 text-cyan-400" />
          <h3 className="font-semibold text-gray-200">Autonomous Work</h3>
          {totalCount > 0 && (
            <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
              {completedCount}/{totalCount} Complete
            </Badge>
          )}
        </div>

        <Button
          size="sm"
          variant="ghost"
          onClick={handleRefresh}
          disabled={loading}
          className="text-gray-400 hover:text-white"
        >
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
        </Button>
      </div>

      {/* Subtasks list */}
      <div className="space-y-3">
        <AnimatePresence>
          {subtasks.map((subtask) => {
            const status = statusConfig[subtask.status];
            const StatusIcon = status.icon;
            const role = subtask.assigned_agent_role ? roleConfig[subtask.assigned_agent_role] : null;
            const RoleIcon = role?.icon;

            return (
              <motion.div
                key={subtask.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={cn(
                  "rounded-lg border transition-all overflow-hidden",
                  subtask.status === 'completed'
                    ? "bg-green-900/10 border-green-500/20"
                    : subtask.status === 'failed'
                    ? "bg-red-900/10 border-red-500/20"
                    : "bg-gray-800/50 border-gray-700/50"
                )}
              >
                {/* Main card content */}
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Status icon */}
                    <div className={cn(
                      "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center",
                      status.color
                    )}>
                      <StatusIcon className={cn("w-4 h-4", subtask.status === 'executing' && "animate-spin")} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={cn(
                          "font-medium text-sm",
                          subtask.status === 'completed' && "line-through opacity-60"
                        )}>
                          {subtask.title}
                        </h4>

                        {role && RoleIcon && (
                          <Badge className={cn("text-xs", role.color, "bg-transparent border-0")}>
                            <RoleIcon className="w-3 h-3 mr-1" />
                            {role.label}
                          </Badge>
                        )}
                      </div>

                      {/* User-visible summary */}
                      {subtask.summary && (
                        <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                          {subtask.summary}
                        </p>
                      )}

                      {/* Meta info */}
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                        {subtask.priority && (
                          <Badge className={cn("text-xs", priorityConfig[subtask.priority])}>
                            {subtask.priority}
                          </Badge>
                        )}

                        {subtask.estimated_duration_min && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Est: {formatDuration(subtask.estimated_duration_min)}
                          </span>
                        )}

                        {(subtask.status === 'completed' || subtask.status === 'failed') && subtask.started_at && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Took: {calculateDuration(subtask.started_at, subtask.completed_at)}
                          </span>
                        )}

                        {subtask.verification_required && subtask.status === 'completed' && (
                          <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">
                            Needs Verification
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Expand button */}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleMetadata(subtask.id)}
                      className="text-gray-400 hover:text-white flex-shrink-0"
                    >
                      {expandedMetadata === subtask.id ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Expandable agent metadata */}
                <AnimatePresence>
                  {expandedMetadata === subtask.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-gray-700/50"
                    >
                      <div className="p-4 bg-gray-900/50">
                        <div className="flex items-center gap-2 mb-2 text-xs text-gray-500">
                          <Bot className="w-3 h-3" />
                          <span>Agent Metadata (visible to agents, expandable for users)</span>
                        </div>
                        <pre className="text-xs text-gray-400 bg-gray-950 p-3 rounded-lg overflow-x-auto">
                          {JSON.stringify(subtask.agent_metadata, null, 2)}
                        </pre>

                        {subtask.verification_notes && (
                          <div className="mt-3">
                            <div className="text-xs text-gray-500 mb-1">Verification Notes:</div>
                            <p className="text-sm text-gray-300 bg-purple-500/10 p-2 rounded">
                              {subtask.verification_notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {subtasks.length === 0 && (
          <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-700 rounded-lg">
            <Bot className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p className="text-sm mb-1">No autonomous work yet</p>
            <p className="text-xs opacity-70">
              The task agent will analyze this task and create subtasks automatically
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AutonomousSubtasksSection;