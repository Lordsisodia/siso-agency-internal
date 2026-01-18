import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
  ChevronRight,
  FileText,
  RefreshCw,
  PanelRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Types for our agency steps
interface AgencyStep {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'pending' | 'blocked';
  estimatedTime: string;
  resources: Array<{
    id: string;
    title: string;
    type: 'document' | 'template' | 'checklist' | 'video';
    url: string;
  }>;
  assignee?: {
    name: string;
    avatar: string;
  };
  dueDate?: string;
  completionDate?: string;
}

interface AgencyPhase {
  id: string;
  title: string;
  description: string;
  progress: number;
  steps: AgencyStep[];
}

// Sample data for agency steps
const AGENCY_PHASES: AgencyPhase[] = [
  {
    id: 'discovery',
    title: 'Discovery & Planning',
    description: 'Initial client consultation, requirements gathering, and project planning',
    progress: 100,
    steps: [
      {
        id: 'step1',
        title: 'Initial Client Consultation',
        description: 'Schedule and conduct an initial meeting with the client to understand their business goals and project requirements.',
        status: 'completed',
        estimatedTime: '2-3 hours',
        resources: [
          {
            id: 'res1',
            title: 'Client Questionnaire',
            type: 'document',
            url: '#'
          },
          {
            id: 'res2',
            title: 'Meeting Agenda Template',
            type: 'template',
            url: '#'
          }
        ],
        completionDate: '2023-10-15'
      },
      {
        id: 'step2',
        title: 'Requirements Document',
        description: 'Compile all client requirements into a comprehensive document for reference.',
        status: 'completed',
        estimatedTime: '3-5 hours',
        resources: [
          {
            id: 'res3',
            title: 'Requirements Template',
            type: 'template',
            url: '#'
          }
        ],
        completionDate: '2023-10-18'
      }
    ]
  },
  {
    id: 'design',
    title: 'Design Phase',
    description: 'Creating wireframes, mockups, and design systems for the project',
    progress: 65,
    steps: [
      {
        id: 'step3',
        title: 'Wireframe Creation',
        description: 'Develop low-fidelity wireframes to establish layout and user flow.',
        status: 'completed',
        estimatedTime: '8-12 hours',
        resources: [
          {
            id: 'res4',
            title: 'Wireframing Guide',
            type: 'document',
            url: '#'
          }
        ],
        completionDate: '2023-10-25'
      },
      {
        id: 'step4',
        title: 'UI Design Mockups',
        description: 'Create high-fidelity design mockups based on approved wireframes.',
        status: 'in-progress',
        estimatedTime: '20-30 hours',
        resources: [
          {
            id: 'res5',
            title: 'Brand Guidelines',
            type: 'document',
            url: '#'
          },
          {
            id: 'res6',
            title: 'Design System',
            type: 'document',
            url: '#'
          }
        ],
        assignee: {
          name: 'Alex Miller',
          avatar: 'https://ui.shadcn.com/avatars/01.png'
        },
        dueDate: '2023-11-05'
      }
    ]
  },
  {
    id: 'development',
    title: 'Development',
    description: 'Frontend and backend implementation of the designed features',
    progress: 20,
    steps: [
      {
        id: 'step5',
        title: 'Frontend Development',
        description: 'Build the user interface components and interactions according to approved designs.',
        status: 'in-progress',
        estimatedTime: '40-60 hours',
        resources: [
          {
            id: 'res7',
            title: 'Frontend Development Guide',
            type: 'document',
            url: '#'
          },
          {
            id: 'res8',
            title: 'Code Standards',
            type: 'checklist',
            url: '#'
          }
        ],
        assignee: {
          name: 'Jamie Chen',
          avatar: 'https://ui.shadcn.com/avatars/03.png'
        },
        dueDate: '2023-11-20'
      },
      {
        id: 'step6',
        title: 'Backend API Development',
        description: 'Develop the server-side APIs and database integrations.',
        status: 'pending',
        estimatedTime: '30-50 hours',
        resources: [
          {
            id: 'res9',
            title: 'API Documentation',
            type: 'document',
            url: '#'
          }
        ],
        dueDate: '2023-11-30'
      }
    ]
  },
  {
    id: 'testing',
    title: 'Testing & QA',
    description: 'Quality assurance, bug fixing, and client feedback cycles',
    progress: 0,
    steps: [
      {
        id: 'step7',
        title: 'Quality Assurance Testing',
        description: 'Conduct thorough testing to identify and fix bugs or issues.',
        status: 'pending',
        estimatedTime: '15-25 hours',
        resources: [
          {
            id: 'res10',
            title: 'QA Checklist',
            type: 'checklist',
            url: '#'
          }
        ],
        dueDate: '2023-12-10'
      },
      {
        id: 'step8',
        title: 'Client Review Session',
        description: 'Present the project to the client for feedback and adjustments.',
        status: 'pending',
        estimatedTime: '2-4 hours',
        resources: [
          {
            id: 'res11',
            title: 'Feedback Collection Template',
            type: 'template',
            url: '#'
          }
        ],
        dueDate: '2023-12-15'
      }
    ]
  },
  {
    id: 'launch',
    title: 'Deployment & Launch',
    description: 'Final preparations, deployment, and launch activities',
    progress: 0,
    steps: [
      {
        id: 'step9',
        title: 'Deployment Preparation',
        description: 'Prepare all assets and configurations for deployment.',
        status: 'pending',
        estimatedTime: '4-8 hours',
        resources: [
          {
            id: 'res12',
            title: 'Deployment Checklist',
            type: 'checklist',
            url: '#'
          }
        ],
        dueDate: '2023-12-20'
      },
      {
        id: 'step10',
        title: 'Launch and Monitoring',
        description: 'Deploy the final project and monitor for any issues.',
        status: 'pending',
        estimatedTime: '4-6 hours',
        resources: [
          {
            id: 'res13',
            title: 'Launch Plan',
            type: 'document',
            url: '#'
          },
          {
            id: 'res14',
            title: 'Post-Launch Checklist',
            type: 'checklist',
            url: '#'
          }
        ],
        dueDate: '2023-12-22'
      }
    ]
  }
];

const StepStatusIcon = ({ status }: { status: AgencyStep['status'] }) => {
  switch (status) {
    case 'completed':
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    case 'in-progress':
      return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin-slow" />;
    case 'blocked':
      return <AlertCircle className="h-5 w-5 text-red-500" />;
    default:
      return <Circle className="h-5 w-5 text-gray-400" />;
  }
};

const ResourceIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'document':
      return <FileText className="h-4 w-4" />;
    case 'template':
      return <PanelRight className="h-4 w-4" />;
    case 'checklist':
      return <CheckCircle2 className="h-4 w-4" />;
    case 'video':
      return <FileText className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
};

export function AgencyStepsSection() {
  const [activePhase, setActivePhase] = useState<string>(AGENCY_PHASES[0].id);
  const [expandedSteps, setExpandedSteps] = useState<Record<string, boolean>>({});
  
  const toggleStepExpanded = (stepId: string) => {
    setExpandedSteps(prev => ({
      ...prev,
      [stepId]: !prev[stepId]
    }));
  };
  
  const currentPhase = AGENCY_PHASES.find(phase => phase.id === activePhase);
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1 
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-[280px_1fr]">
        {/* Left Sidebar - Phase Navigation */}
        <Card className="bg-siso-bg-alt border-siso-border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-siso-text-bold">Project Phases</CardTitle>
            <CardDescription>Navigate through the agency process</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              <div className="p-4 space-y-1">
                {AGENCY_PHASES.map((phase) => (
                  <button
                    key={phase.id}
                    onClick={() => setActivePhase(phase.id)}
                    className={`w-full flex items-start gap-3 text-left p-3 rounded-lg transition-all ${
                      activePhase === phase.id
                        ? 'bg-black/40 border border-siso-border-hover text-siso-text-bold'
                        : 'text-siso-text hover:bg-black/20 hover:text-siso-text-bold'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="relative">
                        <span className={`flex h-7 w-7 items-center justify-center rounded-full border ${
                          phase.progress === 100 
                            ? 'border-green-500 text-green-500' 
                            : phase.progress > 0 
                              ? 'border-blue-500 text-blue-500' 
                              : 'border-gray-600 text-gray-500'
                        }`}>
                          {phase.progress === 100 ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            <span className="text-xs font-medium">{phase.progress}%</span>
                          )}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium">{phase.title}</p>
                      <p className="text-xs text-siso-text-muted">{phase.steps.length} steps</p>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Main Content - Steps for Selected Phase */}
        {currentPhase && (
          <Card className="bg-siso-bg-alt border-siso-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold text-siso-text-bold">
                    {currentPhase.title}
                  </CardTitle>
                  <CardDescription className="text-sm text-siso-text-muted mt-1">
                    {currentPhase.description}
                  </CardDescription>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="text-sm font-medium text-siso-text">
                    {currentPhase.progress}% Complete
                  </div>
                </div>
              </div>
              <Progress 
                value={currentPhase.progress} 
                className="h-2 bg-siso-bg"
              />
            </CardHeader>
            <CardContent>
              <motion.div 
                className="space-y-4"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <Tabs defaultValue="list" className="w-full">
                  <TabsList className="mb-4 bg-siso-bg">
                    <TabsTrigger value="list">List View</TabsTrigger>
                    <TabsTrigger value="board">Board View</TabsTrigger>
                    <TabsTrigger value="timeline">Timeline</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="list" className="mt-0">
                    {currentPhase.steps.map((step, index) => (
                      <motion.div 
                        key={step.id}
                        variants={itemVariants}
                        className={`mb-4 rounded-lg bg-siso-bg border border-siso-border overflow-hidden transition-all duration-300 ${
                          expandedSteps[step.id] ? 'shadow-md' : ''
                        }`}
                      >
                        <div 
                          className="p-4 flex items-center justify-between cursor-pointer"
                          onClick={() => toggleStepExpanded(step.id)}
                        >
                          <div className="flex items-center gap-3">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-siso-bg-alt border border-siso-border">
                              {String(index + 1).padStart(2, '0')}
                            </span>
                            <div>
                              <h3 className="font-medium text-siso-text-bold">{step.title}</h3>
                              <p className="text-xs text-siso-text-muted">
                                {step.estimatedTime} · {step.status === 'completed' ? 'Completed' : 
                                  step.status === 'in-progress' ? 'In Progress' : 
                                  step.status === 'blocked' ? 'Blocked' : 'Pending'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <StepStatusIcon status={step.status} />
                            <ChevronRight 
                              className={`h-5 w-5 text-siso-text-muted transition-transform ${
                                expandedSteps[step.id] ? 'rotate-90' : ''
                              }`} 
                            />
                          </div>
                        </div>
                        
                        {expandedSteps[step.id] && (
                          <div className="px-4 pb-4 pt-0">
                            <div className="pl-11 space-y-4">
                              <p className="text-sm text-siso-text">
                                {step.description}
                              </p>
                              
                              {step.resources.length > 0 && (
                                <div className="space-y-2">
                                  <h4 className="text-xs uppercase tracking-wider text-siso-text-muted">Resources</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {step.resources.map(resource => (
                                      <TooltipProvider key={resource.id}>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Button 
                                              variant="outline" 
                                              size="sm"
                                              className="h-8 gap-1.5 text-xs border-siso-border hover:bg-siso-bg-alt hover:border-siso-border-hover"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                window.open(resource.url, '_blank');
                                              }}
                                            >
                                              <ResourceIcon type={resource.type} />
                                              <span className="truncate max-w-[140px]">{resource.title}</span>
                                            </Button>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p className="text-xs">{resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  {step.assignee && (
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-siso-text-muted">Assigned to:</span>
                                      <div className="flex items-center gap-1.5">
                                        <img 
                                          src={step.assignee.avatar} 
                                          alt={step.assignee.name}
                                          className="h-6 w-6 rounded-full"
                                        />
                                        <span className="text-xs font-medium">{step.assignee.name}</span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                                
                                <div className="flex items-center gap-4">
                                  {step.dueDate && (
                                    <div className="flex items-center gap-1.5">
                                      <Clock className="h-3.5 w-3.5 text-siso-text-muted" />
                                      <span className="text-xs text-siso-text-muted">Due: {new Date(step.dueDate).toLocaleDateString()}</span>
                                    </div>
                                  )}
                                  
                                  {step.status !== 'completed' ? (
                                    <Button 
                                      size="sm"
                                      variant={step.status === 'in-progress' ? 'default' : 'outline'}
                                      className="h-8 px-3 text-xs"
                                    >
                                      {step.status === 'in-progress' ? 'Mark Complete' : 'Start Step'}
                                    </Button>
                                  ) : (
                                    <div className="flex items-center gap-1.5">
                                      <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                                      <span className="text-xs text-green-500">Completed on {new Date(step.completionDate!).toLocaleDateString()}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </TabsContent>
                  
                  <TabsContent value="board" className="mt-0">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between px-2 py-1.5 rounded bg-green-500/10 text-green-500">
                          <h3 className="text-sm font-medium">Completed</h3>
                          <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-green-500/20">
                            {currentPhase.steps.filter(s => s.status === 'completed').length}
                          </span>
                        </div>
                        
                        {currentPhase.steps.filter(s => s.status === 'completed').map(step => (
                          <Card key={step.id} className="bg-siso-bg border-siso-border">
                            <CardHeader className="p-3 pb-2">
                              <CardTitle className="text-sm">{step.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="p-3 pt-0">
                              <p className="text-xs text-siso-text-muted line-clamp-3">{step.description}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between px-2 py-1.5 rounded bg-blue-500/10 text-blue-500">
                          <h3 className="text-sm font-medium">In Progress</h3>
                          <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-blue-500/20">
                            {currentPhase.steps.filter(s => s.status === 'in-progress').length}
                          </span>
                        </div>
                        
                        {currentPhase.steps.filter(s => s.status === 'in-progress').map(step => (
                          <Card key={step.id} className="bg-siso-bg border-siso-border">
                            <CardHeader className="p-3 pb-2">
                              <CardTitle className="text-sm">{step.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="p-3 pt-0">
                              <p className="text-xs text-siso-text-muted line-clamp-3">{step.description}</p>
                              {step.assignee && (
                                <div className="flex items-center gap-1.5 mt-2">
                                  <img 
                                    src={step.assignee.avatar} 
                                    alt={step.assignee.name}
                                    className="h-5 w-5 rounded-full"
                                  />
                                  <span className="text-xs">{step.assignee.name}</span>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between px-2 py-1.5 rounded bg-gray-500/10 text-gray-400">
                          <h3 className="text-sm font-medium">Pending</h3>
                          <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-gray-500/20">
                            {currentPhase.steps.filter(s => s.status === 'pending').length}
                          </span>
                        </div>
                        
                        {currentPhase.steps.filter(s => s.status === 'pending').map(step => (
                          <Card key={step.id} className="bg-siso-bg border-siso-border">
                            <CardHeader className="p-3 pb-2">
                              <CardTitle className="text-sm">{step.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="p-3 pt-0">
                              <p className="text-xs text-siso-text-muted line-clamp-3">{step.description}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="timeline" className="mt-0">
                    <div className="relative pl-5 space-y-6">
                      {/* Timeline line */}
                      <div className="absolute left-2.5 top-0 bottom-4 w-px bg-gradient-to-b from-siso-orange/50 via-siso-red/50 to-transparent"></div>
                      
                      {currentPhase.steps.map((step, index) => (
                        <div key={step.id} className="relative">
                          {/* Timeline marker */}
                          <div className={`absolute -left-5 h-5 w-5 rounded-full border-2 ${
                            step.status === 'completed' ? 'bg-green-500 border-green-500/50' :
                            step.status === 'in-progress' ? 'bg-blue-500 border-blue-500/50' :
                            'bg-siso-bg-alt border-siso-border'
                          }`} />
                          
                          <Card className="ml-4 bg-siso-bg border-siso-border">
                            <CardHeader className="p-4 pb-2">
                              <div className="flex items-start justify-between">
                                <CardTitle className="text-base font-medium">
                                  {step.title}
                                </CardTitle>
                                <StepStatusIcon status={step.status} />
                              </div>
                              {step.status === 'completed' && step.completionDate && (
                                <div className="text-xs text-green-500">
                                  Completed on {new Date(step.completionDate).toLocaleDateString()}
                                </div>
                              )}
                              {step.status === 'in-progress' && step.dueDate && (
                                <div className="text-xs text-siso-text-muted">
                                  Due by {new Date(step.dueDate).toLocaleDateString()}
                                </div>
                              )}
                            </CardHeader>
                            <CardContent className="p-4 pt-2">
                              <p className="text-sm text-siso-text">{step.description}</p>
                              
                              {step.resources.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-2">
                                  {step.resources.map(resource => (
                                    <Button 
                                      key={resource.id}
                                      variant="outline" 
                                      size="sm"
                                      className="h-7 gap-1.5 text-xs border-siso-border"
                                    >
                                      <ResourceIcon type={resource.type} />
                                      <span>{resource.title}</span>
                                    </Button>
                                  ))}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </motion.div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 