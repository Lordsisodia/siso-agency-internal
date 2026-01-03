import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Square, Plus, Trash2, Cpu, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface Agent {
  id: string;
  name: string;
  type: 'researcher' | 'coder' | 'tester' | 'architect' | 'coordinator';
  status: 'running' | 'idle' | 'error';
  projectId: string;
  cpuUsage: number;
  memoryUsage: number;
}

interface Project {
  id: string;
  name: string;
  path: string;
  status: 'active' | 'idle' | 'error';
  agents: number;
  lastActivity: string;
}

interface AgentManagerProps {
  agents: Agent[];
  projects: Project[];
  onAgentUpdate: (agents: Agent[]) => void;
}

export const AgentManager: React.FC<AgentManagerProps> = ({
  agents,
  projects,
  onAgentUpdate
}) => {
  const [selectedProject, setSelectedProject] = useState<string>('all');

  const filteredAgents = selectedProject === 'all' 
    ? agents 
    : agents.filter(agent => agent.projectId === selectedProject);

  const getAgentTypeColor = (type: string) => {
    switch (type) {
      case 'researcher': return 'text-blue-400';
      case 'coder': return 'text-green-400';
      case 'tester': return 'text-purple-400';
      case 'architect': return 'text-orange-400';
      case 'coordinator': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-500';
      case 'idle': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const handleAgentAction = (agentId: string, action: 'start' | 'stop' | 'delete') => {
    if (action === 'delete') {
      onAgentUpdate(agents.filter(a => a.id !== agentId));
    } else {
      onAgentUpdate(agents.map(a => 
        a.id === agentId 
          ? { ...a, status: action === 'start' ? 'running' : 'idle' as const }
          : a
      ));
    }
  };

  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : 'Unknown Project';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Agent Manager</h3>
          <p className="text-sm text-gray-400">Monitor and control your AI development agents</p>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="bg-gray-800 border-gray-600 text-white rounded px-3 py-1 text-sm"
          >
            <option value="all">All Projects</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
          
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Deploy Agent
          </Button>
        </div>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredAgents.map((agent) => (
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base text-white">{agent.name}</CardTitle>
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(agent.status)}`}></div>
                    <Badge variant="secondary" className="text-xs">
                      {agent.status}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className={`text-xs ${getAgentTypeColor(agent.type)}`}>
                    {agent.type}
                  </Badge>
                  <span className="text-xs text-gray-400">
                    {getProjectName(agent.projectId)}
                  </span>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Resource Usage */}
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                      <span>CPU Usage</span>
                      <span>{agent.cpuUsage}%</span>
                    </div>
                    <Progress value={agent.cpuUsage} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                      <span>Memory</span>
                      <span>{agent.memoryUsage}MB</span>
                    </div>
                    <Progress value={(agent.memoryUsage / 1024) * 100} className="h-2" />
                  </div>
                </div>
                
                {/* Agent Actions */}
                <div className="flex items-center gap-2">
                  {agent.status === 'running' ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAgentAction(agent.id, 'stop')}
                      className="flex items-center gap-1"
                    >
                      <Square className="h-3 w-3" />
                      Stop
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleAgentAction(agent.id, 'start')}
                      className="flex items-center gap-1"
                    >
                      <Play className="h-3 w-3" />
                      Start
                    </Button>
                  )}
                  
                  <Button size="sm" variant="outline">
                    <BarChart3 className="h-3 w-3" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleAgentAction(agent.id, 'delete')}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredAgents.length === 0 && (
        <div className="text-center py-12">
          <Cpu className="h-12 w-12 mx-auto text-gray-500 mb-4" />
          <p className="text-gray-400">
            {selectedProject === 'all' 
              ? 'No agents deployed yet. Deploy your first agent to get started.'
              : 'No agents for this project. Deploy an agent to begin development.'
            }
          </p>
        </div>
      )}
    </div>
  );
};