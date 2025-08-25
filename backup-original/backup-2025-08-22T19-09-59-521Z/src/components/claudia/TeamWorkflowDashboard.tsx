import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  Play, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Workflow,
  GitBranch,
  Shield,
  Gauge,
  Code,
  Eye,
  ArrowRight
} from 'lucide-react';

import { SUPERCLAUDE_WORKFLOWS } from '@/types/superclaude';
import { api as claudiaApi } from '@/lib/claudia-api';

interface TeamWorkflowDashboardProps {
  className?: string;
}

interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  startedAt: string;
  completedAt?: string;
  currentStep?: number;
  totalSteps: number;
  assignedTo?: string;
}

export const TeamWorkflowDashboard: React.FC<TeamWorkflowDashboardProps> = ({ className }) => {
  const [workflowExecutions, setWorkflowExecutions] = useState<WorkflowExecution[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);

  // Sample team workflow executions
  useEffect(() => {
    const sampleExecutions: WorkflowExecution[] = [
      {
        id: 'exec-1',
        workflowId: 'code-review',
        status: 'running',
        progress: 65,
        startedAt: new Date(Date.now() - 900000).toISOString(), // 15 min ago
        currentStep: 2,
        totalSteps: 3,
        assignedTo: 'QA Specialist'
      },
      {
        id: 'exec-2',
        workflowId: 'security-audit',
        status: 'completed',
        progress: 100,
        startedAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        completedAt: new Date(Date.now() - 1800000).toISOString(), // 30 min ago
        currentStep: 3,
        totalSteps: 3,
        assignedTo: 'Security Expert'
      },
      {
        id: 'exec-3',
        workflowId: 'performance-optimization',
        status: 'pending',
        progress: 0,
        startedAt: new Date().toISOString(),
        currentStep: 0,
        totalSteps: 3,
        assignedTo: 'Performance Specialist'
      }
    ];
    setWorkflowExecutions(sampleExecutions);
  }, []);

  const executeTeamWorkflow = async (workflowId: string) => {
    setIsExecuting(true);
    try {
      const result = await claudiaApi.executeSuperClaudeWorkflow(workflowId);
      
      // Add new execution
      const newExecution: WorkflowExecution = {
        id: `exec-${Date.now()}`,
        workflowId,
        status: 'running',
        progress: 0,
        startedAt: new Date().toISOString(),
        currentStep: 0,
        totalSteps: SUPERCLAUDE_WORKFLOWS.find(w => w.id === workflowId)?.steps.length || 1,
        assignedTo: 'Team Lead'
      };

      setWorkflowExecutions(prev => [newExecution, ...prev]);

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setWorkflowExecutions(prev => prev.map(exec => {
          if (exec.id === newExecution.id && exec.status === 'running') {
            const newProgress = Math.min(exec.progress + 20, 100);
            const newStep = Math.floor((newProgress / 100) * exec.totalSteps);
            
            if (newProgress >= 100) {
              clearInterval(progressInterval);
              return {
                ...exec,
                progress: 100,
                status: 'completed' as const,
                currentStep: exec.totalSteps,
                completedAt: new Date().toISOString()
              };
            }
            
            return {
              ...exec,
              progress: newProgress,
              currentStep: newStep
            };
          }
          return exec;
        }));
      }, 2000);

    } catch (error) {
      console.error('Team workflow execution failed:', error);
    } finally {
      setIsExecuting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'running': return <Clock className="w-4 h-4 text-blue-500 animate-pulse" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getWorkflowIcon = (workflowId: string) => {
    switch (workflowId) {
      case 'code-review': return <Eye className="w-5 h-5 text-blue-500" />;
      case 'security-audit': return <Shield className="w-5 h-5 text-red-500" />;
      case 'performance-optimization': return <Gauge className="w-5 h-5 text-green-500" />;
      case 'architecture-review': return <GitBranch className="w-5 h-5 text-purple-500" />;
      case 'deployment-pipeline': return <Workflow className="w-5 h-5 text-orange-500" />;
      default: return <Code className="w-5 h-5 text-gray-500" />;
    }
  };

  const getWorkflowName = (workflowId: string) => {
    const workflow = SUPERCLAUDE_WORKFLOWS.find(w => w.id === workflowId);
    return workflow?.name || workflowId;
  };

  const formatTimeAgo = (isoString: string) => {
    const diff = Date.now() - new Date(isoString).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <div className={`w-full h-full space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-6 h-6 text-orange-500" />
          <h2 className="text-2xl font-bold">Team Workflow Dashboard</h2>
        </div>
        <Badge variant="outline" className="bg-orange-50">
          {workflowExecutions.filter(e => e.status === 'running').length} Running
        </Badge>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {SUPERCLAUDE_WORKFLOWS.map((workflow) => (
          <Card key={workflow.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-2">
                {getWorkflowIcon(workflow.id)}
                <span className="font-medium text-sm">{workflow.name}</span>
              </div>
              <p className="text-xs text-gray-600 mb-3">{workflow.description}</p>
              <Button
                size="sm"
                onClick={() => executeTeamWorkflow(workflow.id)}
                disabled={isExecuting}
                className="w-full"
              >
                <Play className="w-3 h-3 mr-1" />
                Start
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Active Executions */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Active & Recent Executions</h3>
        <div className="space-y-4">
          {workflowExecutions.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <Workflow className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No workflow executions yet. Start a workflow to see progress here.</p>
              </CardContent>
            </Card>
          ) : (
            workflowExecutions.map((execution) => (
              <Card key={execution.id}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getWorkflowIcon(execution.workflowId)}
                      <div>
                        <h4 className="font-medium">{getWorkflowName(execution.workflowId)}</h4>
                        <p className="text-sm text-gray-600">
                          Step {execution.currentStep} of {execution.totalSteps}
                          {execution.assignedTo && (
                            <span className="ml-2">• {execution.assignedTo}</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(execution.status)}
                      <Badge variant="outline" className="text-xs">
                        {execution.status}
                      </Badge>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{execution.progress}%</span>
                    </div>
                    <Progress value={execution.progress} className="w-full" />
                  </div>

                  {/* Timeline */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Started {formatTimeAgo(execution.startedAt)}</span>
                    {execution.completedAt && (
                      <span>Completed {formatTimeAgo(execution.completedAt)}</span>
                    )}
                    {execution.status === 'running' && (
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        <span>In progress</span>
                      </div>
                    )}
                  </div>

                  {/* Current Step Details */}
                  {execution.status === 'running' && (
                    <div className="mt-3 p-2 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2 text-sm">
                        <ArrowRight className="w-3 h-3 text-blue-500" />
                        <span className="font-medium">Current Step:</span>
                        <span>{SUPERCLAUDE_WORKFLOWS.find(w => w.id === execution.workflowId)?.steps[execution.currentStep - 1]?.description || 'Processing...'}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Team Collaboration Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Completed Today</p>
                <p className="text-2xl font-bold">
                  {workflowExecutions.filter(e => e.status === 'completed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">In Progress</p>
                <p className="text-2xl font-bold">
                  {workflowExecutions.filter(e => e.status === 'running').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium">Team Members</p>
                <p className="text-2xl font-bold">5</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Gauge className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium">Avg. Completion</p>
                <p className="text-2xl font-bold">
                  {Math.round(workflowExecutions.reduce((acc, e) => acc + e.progress, 0) / workflowExecutions.length || 0)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};