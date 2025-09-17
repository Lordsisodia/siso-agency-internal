import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { ScrollArea } from '@/shared/ui/scroll-area';
import { Progress } from '@/shared/ui/progress';
import { 
  Brain, Code, Shield, Rocket, TestTube, 
  GitBranch, Database, Cloud, Search, FileCode,
  Activity, Users, MessageSquare, Zap, Network
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';

// SPARC Mode definitions
const SPARC_MODES = [
  { id: 'architect', name: 'Architect', icon: Brain, color: 'blue', description: 'System design and architecture' },
  { id: 'coder', name: 'Coder', icon: Code, color: 'green', description: 'Code implementation' },
  { id: 'tdd', name: 'TDD', icon: TestTube, color: 'purple', description: 'Test-driven development' },
  { id: 'security', name: 'Security', icon: Shield, color: 'red', description: 'Security analysis' },
  { id: 'devops', name: 'DevOps', icon: Rocket, color: 'orange', description: 'Deployment and CI/CD' },
  { id: 'integration', name: 'Integration', icon: GitBranch, color: 'cyan', description: 'System integration' },
  { id: 'database', name: 'Database', icon: Database, color: 'indigo', description: 'Database design' },
  { id: 'cloud', name: 'Cloud', icon: Cloud, color: 'sky', description: 'Cloud architecture' },
  { id: 'research', name: 'Research', icon: Search, color: 'yellow', description: 'Research and analysis' },
  { id: 'refactor', name: 'Refactor', icon: FileCode, color: 'pink', description: 'Code refactoring' },
];

interface SwarmAgent {
  id: string;
  name: string;
  type: string;
  status: 'idle' | 'thinking' | 'executing' | 'completed' | 'error';
  currentTask: string;
  progress: number;
  messages: AgentMessage[];
  stats: {
    tasksCompleted: number;
    avgResponseTime: number;
    successRate: number;
  };
}

interface AgentMessage {
  id: string;
  timestamp: Date;
  type: 'input' | 'output' | 'thinking' | 'error';
  content: string;
}


export function SwarmDashboard() {
  const [agents, setAgents] = useState<SwarmAgent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isSwarmActive, setIsSwarmActive] = useState(false);
  const [swarmCommand, setSwarmCommand] = useState('');
  const [selectedModes, setSelectedModes] = useState<string[]>([]);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Simulate agent activity for demo
  useEffect(() => {
    if (isSwarmActive && agents.length === 0) {
      // Create initial agents based on selected modes
      const initialAgents = selectedModes.map((modeId, index) => {
        const mode = SPARC_MODES.find(m => m.id === modeId)!;
        return {
          id: `agent-${index}`,
          name: `${mode.name} Agent`,
          type: modeId,
          status: 'idle' as const,
          currentTask: '',
          progress: 0,
          messages: [],
          stats: {
            tasksCompleted: 0,
            avgResponseTime: 0,
            successRate: 100
          }
        };
      });
      setAgents(initialAgents);
    }
  }, [isSwarmActive, selectedModes, agents.length]);

  // Simulate agent messages
  useEffect(() => {
    if (!isSwarmActive) return;

    const interval = setInterval(() => {
      setAgents(prevAgents => 
        prevAgents.map(agent => {
          if (agent.status === 'idle' && Math.random() > 0.7) {
            return {
              ...agent,
              status: 'thinking',
              currentTask: 'Analyzing requirements...',
              messages: [...agent.messages, {
                id: Date.now().toString(),
                timestamp: new Date(),
                type: 'thinking',
                content: `Starting analysis for ${swarmCommand}...`
              }]
            };
          } else if (agent.status === 'thinking' && Math.random() > 0.5) {
            return {
              ...agent,
              status: 'executing',
              progress: Math.min(agent.progress + 20, 100),
              messages: [...agent.messages, {
                id: Date.now().toString(),
                timestamp: new Date(),
                type: 'output',
                content: `Implementing ${agent.type} solution...`
              }]
            };
          }
          return agent;
        })
      );
    }, 2000);

    return () => clearInterval(interval);
  }, [isSwarmActive, swarmCommand]);

  const startSwarm = () => {
    if (!swarmCommand || selectedModes.length === 0) return;
    setIsSwarmActive(true);
  };

  const stopSwarm = () => {
    setIsSwarmActive(false);
    setAgents([]);
  };

  const getAgentIcon = (type: string) => {
    const mode = SPARC_MODES.find(m => m.id === type);
    return mode ? mode.icon : Brain;
  };

  const getAgentColor = (type: string) => {
    const mode = SPARC_MODES.find(m => m.id === type);
    return mode ? mode.color : 'gray';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'idle': return 'text-gray-500';
      case 'thinking': return 'text-yellow-500';
      case 'executing': return 'text-blue-500';
      case 'completed': return 'text-green-500';
      case 'error': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <Card className="w-full h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Network className="h-5 w-5" />
              Claude-Flow Swarm Dashboard
            </CardTitle>
            <CardDescription>
              Orchestrate multiple AI agents for complex development tasks
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {isSwarmActive ? (
              <>
                <Badge variant="default" className="bg-green-500">
                  <Activity className="h-3 w-3 mr-1 animate-pulse" />
                  Active
                </Badge>
                <Button variant="destructive" size="sm" onClick={stopSwarm}>
                  Stop Swarm
                </Button>
              </>
            ) : (
              <Badge variant="secondary">Inactive</Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="agents">Agents</TabsTrigger>
            <TabsTrigger value="chat">Chat Streams</TabsTrigger>
            <TabsTrigger value="sparc">SPARC Modes</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Quick Start */}
            {!isSwarmActive && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Start</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Swarm Command</label>
                    <input
                      type="text"
                      className="w-full p-2 mt-1 border rounded"
                      placeholder="e.g., Build a REST API with authentication"
                      value={swarmCommand}
                      onChange={(e) => setSwarmCommand(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Select Agent Modes</label>
                    <div className="grid grid-cols-5 gap-2 mt-2">
                      {SPARC_MODES.slice(0, 5).map((mode) => (
                        <button
                          key={mode.id}
                          onClick={() => {
                            setSelectedModes(prev => 
                              prev.includes(mode.id) 
                                ? prev.filter(id => id !== mode.id)
                                : [...prev, mode.id]
                            );
                          }}
                          className={cn(
                            "p-3 rounded-lg border transition-all",
                            selectedModes.includes(mode.id)
                              ? "border-primary bg-primary/10"
                              : "border-border hover:border-primary/50"
                          )}
                        >
                          <mode.icon className={cn("h-6 w-6 mx-auto mb-1", `text-${mode.color}-500`)} />
                          <p className="text-xs">{mode.name}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button 
                    onClick={startSwarm} 
                    className="w-full"
                    disabled={!swarmCommand || selectedModes.length === 0}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Deploy Swarm
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Active Swarm Stats */}
            {isSwarmActive && (
              <>
                <div className="grid grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <Users className="h-8 w-8 text-blue-500" />
                        <div className="text-right">
                          <div className="text-2xl font-bold">{agents.length}</div>
                          <p className="text-xs text-muted-foreground">Active Agents</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <Activity className="h-8 w-8 text-green-500" />
                        <div className="text-right">
                          <div className="text-2xl font-bold">
                            {agents.filter(a => a.status === 'executing').length}
                          </div>
                          <p className="text-xs text-muted-foreground">Working</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <MessageSquare className="h-8 w-8 text-purple-500" />
                        <div className="text-right">
                          <div className="text-2xl font-bold">
                            {agents.reduce((acc, agent) => acc + agent.messages.length, 0)}
                          </div>
                          <p className="text-xs text-muted-foreground">Messages</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <Brain className="h-8 w-8 text-orange-500" />
                        <div className="text-right">
                          <div className="text-2xl font-bold">
                            {Math.round(agents.reduce((acc, agent) => acc + agent.progress, 0) / agents.length)}%
                          </div>
                          <p className="text-xs text-muted-foreground">Progress</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Agent Network Visualization */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Agent Network</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-center space-x-4 p-8">
                      {agents.map((agent, index) => {
                        const Icon = getAgentIcon(agent.type);
                        return (
                          <motion.div
                            key={agent.id}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className="relative"
                          >
                            <div className={cn(
                              "p-4 rounded-full border-2 transition-all cursor-pointer",
                              agent.status === 'executing' ? "border-primary animate-pulse" : "border-border",
                              selectedAgent === agent.id && "ring-2 ring-primary"
                            )}
                            onClick={() => setSelectedAgent(agent.id)}
                            >
                              <Icon className={cn("h-8 w-8", getStatusColor(agent.status))} />
                            </div>
                            <p className="text-xs text-center mt-2">{agent.name}</p>
                            {agent.status === 'executing' && (
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-ping" />
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                    
                    {/* Connection lines */}
                    <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: -1 }}>
                      {agents.map((agent, i) => 
                        agents.slice(i + 1).map((otherAgent) => (
                          <line
                            key={`${agent.id}-${otherAgent.id}`}
                            x1="0" y1="0" x2="100" y2="100"
                            stroke="#e5e7eb"
                            strokeWidth="1"
                            strokeDasharray="5,5"
                            className="animate-pulse"
                          />
                        ))
                      )}
                    </svg>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          <TabsContent value="agents" className="space-y-4">
            {agents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No active agents. Start a swarm to see agent details.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {agents.map((agent) => {
                  const Icon = getAgentIcon(agent.type);
                  return (
                    <Card key={agent.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Icon className={cn("h-5 w-5", `text-${getAgentColor(agent.type)}-500`)} />
                            <CardTitle className="text-lg">{agent.name}</CardTitle>
                          </div>
                          <Badge variant="outline" className={getStatusColor(agent.status)}>
                            {agent.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Current Task</p>
                          <p className="text-sm font-medium">{agent.currentTask || 'Idle'}</p>
                        </div>
                        
                        {agent.progress > 0 && (
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Progress</span>
                              <span>{agent.progress}%</span>
                            </div>
                            <Progress value={agent.progress} />
                          </div>
                        )}
                        
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div>
                            <p className="text-lg font-bold">{agent.stats.tasksCompleted}</p>
                            <p className="text-xs text-muted-foreground">Tasks</p>
                          </div>
                          <div>
                            <p className="text-lg font-bold">{agent.stats.avgResponseTime}s</p>
                            <p className="text-xs text-muted-foreground">Avg Time</p>
                          </div>
                          <div>
                            <p className="text-lg font-bold">{agent.stats.successRate}%</p>
                            <p className="text-xs text-muted-foreground">Success</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="chat" className="space-y-4">
            <div className="grid grid-cols-2 gap-4 h-[600px]">
              {/* Agent Selector */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Select Agent</h3>
                <div className="space-y-2">
                  {agents.map((agent) => {
                    const Icon = getAgentIcon(agent.type);
                    return (
                      <button
                        key={agent.id}
                        onClick={() => setSelectedAgent(agent.id)}
                        className={cn(
                          "w-full p-3 rounded-lg border text-left transition-all",
                          selectedAgent === agent.id
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className={cn("h-4 w-4", `text-${getAgentColor(agent.type)}-500`)} />
                          <span className="font-medium">{agent.name}</span>
                          <Badge variant="outline" className="ml-auto text-xs">
                            {agent.messages.length} msgs
                          </Badge>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Chat Stream */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">
                    {selectedAgent 
                      ? agents.find(a => a.id === selectedAgent)?.name 
                      : 'Select an agent'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px] pr-4" ref={chatScrollRef}>
                    {selectedAgent && (
                      <div className="space-y-3">
                        {agents
                          .find(a => a.id === selectedAgent)
                          ?.messages.map((msg) => (
                            <div
                              key={msg.id}
                              className={cn(
                                "p-3 rounded-lg",
                                msg.type === 'input' && "bg-blue-50 dark:bg-blue-950",
                                msg.type === 'output' && "bg-green-50 dark:bg-green-950",
                                msg.type === 'thinking' && "bg-yellow-50 dark:bg-yellow-950",
                                msg.type === 'error' && "bg-red-50 dark:bg-red-950"
                              )}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <Badge variant="outline" className="text-xs">
                                  {msg.type}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {msg.timestamp.toLocaleTimeString()}
                                </span>
                              </div>
                              <p className="text-sm">{msg.content}</p>
                            </div>
                          ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sparc" className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {SPARC_MODES.map((mode) => (
                <Card 
                  key={mode.id}
                  className="cursor-pointer transition-all hover:shadow-lg"
                  onClick={() => {
                    // TODO: Launch specific SPARC mode
                  }}
                >
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <mode.icon className={cn("h-8 w-8", `text-${mode.color}-500`)} />
                      <div>
                        <CardTitle className="text-lg">{mode.name}</CardTitle>
                        <CardDescription className="text-xs">
                          {mode.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full" size="sm">
                      Launch {mode.name} Mode
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}