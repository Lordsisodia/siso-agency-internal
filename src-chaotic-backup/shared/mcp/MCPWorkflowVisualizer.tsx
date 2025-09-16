import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Progress } from '@/shared/ui/progress';
import { 
  GitBranch, 
  Database, 
  FileText, 
  MessageSquare,
  ArrowRight,
  CheckCircle,
  XCircle,
  Clock,
  Play,
  RefreshCw
} from 'lucide-react';

interface WorkflowStep {
  id: string;
  mcp: string;
  action: string;
  status: 'pending' | 'running' | 'success' | 'error' | 'skipped';
  dependsOn?: string[];
  duration?: number;
  result?: any;
  error?: string;
}

interface WorkflowVisualization {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  status: 'idle' | 'running' | 'completed' | 'failed';
  progress: number;
}

const MCPWorkflowVisualizer: React.FC = () => {
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>('deployFeature');
  const [workflow, setWorkflow] = useState<WorkflowVisualization | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const workflows = {
    deployFeature: {
      id: 'deploy-feature',
      name: 'Deploy Feature',
      description: 'Create branches, setup database, fetch docs, and create tasks',
      steps: [
        {
          id: 'create-github-branch',
          mcp: 'github',
          action: 'Create feature branch',
          status: 'pending'
        },
        {
          id: 'create-supabase-branch',
          mcp: 'supabase',
          action: 'Create database branch',
          status: 'pending'
        },
        {
          id: 'fetch-docs',
          mcp: 'context7',
          action: 'Fetch documentation',
          status: 'pending'
        },
        {
          id: 'create-tasks',
          mcp: 'notion',
          action: 'Create task list',
          status: 'pending',
          dependsOn: ['create-github-branch']
        }
      ]
    },
    codeReview: {
      id: 'code-review',
      name: 'Code Review',
      description: 'Analyze PR changes, run security checks, search best practices',
      steps: [
        {
          id: 'get-pr',
          mcp: 'github',
          action: 'Get PR changes',
          status: 'pending'
        },
        {
          id: 'security-check',
          mcp: 'supabase',
          action: 'Run security advisors',
          status: 'pending',
          dependsOn: ['get-pr']
        },
        {
          id: 'best-practices',
          mcp: 'exa',
          action: 'Search best practices',
          status: 'pending',
          dependsOn: ['get-pr']
        },
        {
          id: 'create-summary',
          mcp: 'notion',
          action: 'Create review summary',
          status: 'pending',
          dependsOn: ['security-check', 'best-practices']
        }
      ]
    }
  };

  const mcpColors: Record<string, string> = {
    github: 'bg-gray-500',
    supabase: 'bg-green-500',
    context7: 'bg-blue-500',
    notion: 'bg-black',
    exa: 'bg-purple-500'
  };

  const mcpIcons: Record<string, React.ReactNode> = {
    github: <GitBranch className="w-4 h-4" />,
    supabase: <Database className="w-4 h-4" />,
    context7: <FileText className="w-4 h-4" />,
    notion: <MessageSquare className="w-4 h-4" />,
    exa: <FileText className="w-4 h-4" />
  };

  const simulateWorkflow = async () => {
    if (!workflow) return;
    
    setIsRunning(true);
    const steps = [...workflow.steps];
    let completedSteps = 0;

    // Reset all steps
    steps.forEach(step => step.status = 'pending');
    setWorkflow({ ...workflow, status: 'running', steps, progress: 0 });

    // Process steps considering dependencies
    const processStep = async (stepIndex: number) => {
      const step = steps[stepIndex];
      
      // Check dependencies
      if (step.dependsOn) {
        const dependenciesMet = step.dependsOn.every(depId => 
          steps.find(s => s.id === depId)?.status === 'success'
        );
        
        if (!dependenciesMet) {
          step.status = 'skipped';
          return;
        }
      }

      // Update step to running
      step.status = 'running';
      setWorkflow(prev => ({ ...prev!, steps: [...steps] }));

      // Simulate execution
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      // Simulate result (90% success rate)
      if (Math.random() > 0.1) {
        step.status = 'success';
        step.duration = Math.floor(Math.random() * 3000) + 500;
        step.result = { data: `Result from ${step.mcp}` };
      } else {
        step.status = 'error';
        step.error = 'Simulated error for demonstration';
      }

      completedSteps++;
      const progress = (completedSteps / steps.length) * 100;
      
      setWorkflow(prev => ({ 
        ...prev!, 
        steps: [...steps],
        progress,
        status: step.status === 'error' ? 'failed' : prev!.status
      }));
    };

    // Execute steps based on dependencies
    const executeInOrder = async () => {
      const executed = new Set<string>();
      
      while (executed.size < steps.length) {
        const readySteps = steps.filter((step, index) => {
          if (executed.has(step.id)) return false;
          
          if (!step.dependsOn || step.dependsOn.length === 0) return true;
          
          return step.dependsOn.every(dep => {
            const depStep = steps.find(s => s.id === dep);
            return depStep && executed.has(depStep.id) && depStep.status === 'success';
          });
        });

        if (readySteps.length === 0) break;

        // Execute ready steps in parallel
        await Promise.all(
          readySteps.map(async (step) => {
            const index = steps.findIndex(s => s.id === step.id);
            await processStep(index);
            executed.add(step.id);
          })
        );
      }
    };

    await executeInOrder();

    // Final status
    const allSuccess = steps.every(s => s.status === 'success' || s.status === 'skipped');
    setWorkflow(prev => ({ 
      ...prev!, 
      status: allSuccess ? 'completed' : 'failed',
      progress: 100
    }));
    
    setIsRunning(false);
  };

  useEffect(() => {
    const selected = workflows[selectedWorkflow as keyof typeof workflows];
    setWorkflow({
      ...selected,
      status: 'idle',
      progress: 0
    });
  }, [selectedWorkflow]);

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'running':
        return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'skipped':
        return <Clock className="w-5 h-5 text-gray-400" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const renderDependencyLines = (step: WorkflowStep, index: number) => {
    if (!step.dependsOn || step.dependsOn.length === 0) return null;

    return (
      <>
        {step.dependsOn.map(depId => {
          const depIndex = workflow!.steps.findIndex(s => s.id === depId);
          if (depIndex === -1) return null;
          
          return (
            <svg
              key={`${step.id}-${depId}`}
              className="absolute pointer-events-none"
              style={{
                top: `${Math.min(depIndex, index) * 120 + 60}px`,
                height: `${Math.abs(index - depIndex) * 120}px`,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 0
              }}
            >
              <path
                d={`M 150 ${depIndex < index ? 0 : Math.abs(index - depIndex) * 120} 
                    L 150 ${depIndex < index ? Math.abs(index - depIndex) * 120 : 0}`}
                stroke="#94a3b8"
                strokeWidth="2"
                strokeDasharray="5,5"
                fill="none"
              />
            </svg>
          );
        })}
      </>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">MCP Workflow Visualizer</h2>
          <p className="text-muted-foreground">See how workflows execute across multiple MCPs</p>
        </div>
        <div className="flex space-x-2">
          <select
            value={selectedWorkflow}
            onChange={(e) => setSelectedWorkflow(e.target.value)}
            className="px-3 py-2 border rounded-md"
            disabled={isRunning}
          >
            <option value="deployFeature">Deploy Feature</option>
            <option value="codeReview">Code Review</option>
          </select>
          <Button onClick={simulateWorkflow} disabled={isRunning}>
            {isRunning ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Run Workflow
              </>
            )}
          </Button>
        </div>
      </div>

      {workflow && (
        <Card>
          <CardHeader>
            <CardTitle>{workflow.name}</CardTitle>
            <CardDescription>{workflow.description}</CardDescription>
            <div className="flex items-center space-x-4 mt-4">
              <Badge variant={
                workflow.status === 'completed' ? 'default' :
                workflow.status === 'failed' ? 'destructive' :
                workflow.status === 'running' ? 'secondary' : 'outline'
              }>
                {workflow.status}
              </Badge>
              {workflow.status === 'running' && (
                <div className="flex-1">
                  <Progress value={workflow.progress} className="h-2" />
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative space-y-4">
              {workflow.steps.map((step, index) => (
                <div key={step.id} className="relative z-10">
                  {renderDependencyLines(step, index)}
                  <div className={`
                    flex items-center space-x-4 p-4 rounded-lg border
                    ${step.status === 'running' ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' : ''}
                    ${step.status === 'success' ? 'border-green-500 bg-green-50 dark:bg-green-950' : ''}
                    ${step.status === 'error' ? 'border-red-500 bg-red-50 dark:bg-red-950' : ''}
                    ${step.status === 'skipped' ? 'opacity-50' : ''}
                  `}>
                    <div className={`p-2 rounded-full text-white ${mcpColors[step.mcp]}`}>
                      {mcpIcons[step.mcp]}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{step.action}</h4>
                        <Badge variant="outline" className="text-xs">
                          {step.mcp}
                        </Badge>
                        {step.duration && (
                          <span className="text-xs text-muted-foreground">
                            {step.duration}ms
                          </span>
                        )}
                      </div>
                      {step.dependsOn && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Depends on: {step.dependsOn.join(', ')}
                        </p>
                      )}
                      {step.error && (
                        <p className="text-xs text-red-500 mt-1">{step.error}</p>
                      )}
                    </div>
                    {getStepIcon(step.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Steps execute in parallel when possible</span>
          </div>
          <div className="flex items-center space-x-2">
            <ArrowRight className="w-4 h-4 text-blue-500" />
            <span>Dependencies ensure proper execution order</span>
          </div>
          <div className="flex items-center space-x-2">
            <RefreshCw className="w-4 h-4 text-orange-500" />
            <span>Failed steps can be retried automatically</span>
          </div>
          <div className="flex items-center space-x-2">
            <Database className="w-4 h-4 text-purple-500" />
            <span>Each MCP handles its specific domain</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MCPWorkflowVisualizer;