import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { 
  Zap, 
  Play, 
  Square, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Users, 
  Code, 
  Settings, 
  Search,
  Filter,
  RotateCcw,
  BookOpen,
  Terminal,
  Shield,
  Cpu,
  Gauge,
  Workflow
} from 'lucide-react';

import { 
  SUPERCLAUDE_COMMANDS, 
  SUPERCLAUDE_PERSONAS, 
  SUPERCLAUDE_WORKFLOWS,
  SuperClaudeCommand,
  SuperClaudePersona,
  SuperClaudeWorkflow,
  SuperClaudeExecution
} from '@/types/superclaude';
import { api as claudiaApi } from '@/lib/claudia-api';

interface SuperClaudeInterfaceProps {
  className?: string;
}

export const SuperClaudeInterface: React.FC<SuperClaudeInterfaceProps> = ({ className }) => {
  const [selectedCommand, setSelectedCommand] = useState<SuperClaudeCommand | null>(null);
  const [selectedPersona, setSelectedPersona] = useState<SuperClaudePersona | null>(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState<SuperClaudeWorkflow | null>(null);
  const [customFlags, setCustomFlags] = useState<string>('');
  const [projectPath, setProjectPath] = useState<string>('/Users/shaansisodia/Desktop/Cursor/siso-agency-onboarding-app-main-dev');
  const [executions, setExecutions] = useState<SuperClaudeExecution[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [activeTab, setActiveTab] = useState('commands');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Filter commands based on search and category
  const filteredCommands = SUPERCLAUDE_COMMANDS.filter(cmd => {
    const matchesSearch = cmd.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cmd.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || cmd.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Execute a SuperClaude command
  const executeCommand = async (command: SuperClaudeCommand, flags: string[] = [], persona?: string) => {
    setIsExecuting(true);
    try {
      const execution: SuperClaudeExecution = {
        id: `exec-${Date.now()}`,
        command: command.id,
        flags,
        persona,
        projectPath,
        timestamp: new Date().toISOString(),
        status: 'running'
      };

      setExecutions(prev => [execution, ...prev]);

      // Execute via Claudia API
      const result = await claudiaApi.executeSuperClaudeCommand(command.id, flags, persona);
      
      // Update execution status
      setExecutions(prev => prev.map(exec => 
        exec.id === execution.id 
          ? { ...exec, status: result.success ? 'completed' : 'failed', output: result.output }
          : exec
      ));

    } catch (error) {
      console.error('SuperClaude execution failed:', error);
      setExecutions(prev => prev.map(exec => 
        exec.id === executions[0]?.id 
          ? { ...exec, status: 'failed', output: error.message }
          : exec
      ));
    } finally {
      setIsExecuting(false);
    }
  };

  // Execute a workflow
  const executeWorkflow = async (workflow: SuperClaudeWorkflow) => {
    setIsExecuting(true);
    try {
      const result = await claudiaApi.executeSuperClaudeWorkflow(workflow.id);
      
      const execution: SuperClaudeExecution = {
        id: `workflow-${Date.now()}`,
        command: `workflow:${workflow.id}`,
        flags: [],
        projectPath,
        timestamp: new Date().toISOString(),
        status: result.success ? 'completed' : 'failed',
        output: result.output
      };

      setExecutions(prev => [execution, ...prev]);
    } catch (error) {
      console.error('SuperClaude workflow execution failed:', error);
    } finally {
      setIsExecuting(false);
    }
  };

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'development': return <Code className="w-4 h-4" />;
      case 'analysis': return <Search className="w-4 h-4" />;
      case 'operations': return <Settings className="w-4 h-4" />;
      case 'design': return <BookOpen className="w-4 h-4" />;
      default: return <Terminal className="w-4 h-4" />;
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'running': return <Clock className="w-4 h-4 text-blue-500 animate-spin" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className={`w-full h-full flex flex-col space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-6 h-6 text-orange-500" />
          <h2 className="text-2xl font-bold">SuperClaude Development Framework</h2>
        </div>
        <Badge variant="outline" className="bg-orange-50">
          {SUPERCLAUDE_COMMANDS.length} Commands • {SUPERCLAUDE_PERSONAS.length} Personas • {SUPERCLAUDE_WORKFLOWS.length} Workflows
        </Badge>
      </div>

      {/* Project Path Input */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="project-path" className="text-sm font-medium">Project Path:</Label>
            <Input
              id="project-path"
              value={projectPath}
              onChange={(e) => setProjectPath(e.target.value)}
              placeholder="/path/to/your/project"
              className="flex-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Main Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="commands" className="flex items-center gap-2">
            <Terminal className="w-4 h-4" />
            Commands
          </TabsTrigger>
          <TabsTrigger value="personas" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Personas
          </TabsTrigger>
          <TabsTrigger value="workflows" className="flex items-center gap-2">
            <Workflow className="w-4 h-4" />
            Workflows
          </TabsTrigger>
          <TabsTrigger value="executions" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Executions ({executions.length})
          </TabsTrigger>
        </TabsList>

        {/* Commands Tab */}
        <TabsContent value="commands" className="space-y-4">
          {/* Search and Filter */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search commands..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="development">Development</SelectItem>
                <SelectItem value="analysis">Analysis</SelectItem>
                <SelectItem value="operations">Operations</SelectItem>
                <SelectItem value="design">Design</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Commands Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCommands.map((command) => (
              <Card key={command.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(command.category)}
                      <CardTitle className="text-lg">{command.name}</CardTitle>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {command.category}
                    </Badge>
                  </div>
                  <CardDescription className="text-sm">
                    {command.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-1">
                    {command.flags.slice(0, 3).map((flag) => (
                      <Badge key={flag.name} variant="outline" className="text-xs">
                        --{flag.name}
                      </Badge>
                    ))}
                    {command.flags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{command.flags.length - 3} more
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {command.mcpSupport && (
                        <Badge variant="outline" className="text-xs bg-green-50">
                          MCP
                        </Badge>
                      )}
                    </div>
                    <Button
                      size="sm"
                      onClick={() => setSelectedCommand(command)}
                      disabled={isExecuting}
                    >
                      <Play className="w-3 h-3 mr-1" />
                      Execute
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Personas Tab */}
        <TabsContent value="personas" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SUPERCLAUDE_PERSONAS.map((persona) => (
              <Card key={persona.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-500" />
                    <CardTitle className="text-lg">{persona.name}</CardTitle>
                  </div>
                  <CardDescription>{persona.focusArea}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium">Tools:</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {persona.tools.map((tool) => (
                        <Badge key={tool} variant="outline" className="text-xs">
                          {tool}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Use Cases:</Label>
                    <ul className="text-sm text-gray-600 mt-1">
                      {persona.useCases.map((useCase, index) => (
                        <li key={index} className="text-xs">• {useCase}</li>
                      ))}
                    </ul>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedPersona(persona)}
                    className="w-full"
                  >
                    Select Persona
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Workflows Tab */}
        <TabsContent value="workflows" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SUPERCLAUDE_WORKFLOWS.map((workflow) => (
              <Card key={workflow.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Workflow className="w-5 h-5 text-purple-500" />
                    <CardTitle className="text-lg">{workflow.name}</CardTitle>
                  </div>
                  <CardDescription>{workflow.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium">Steps ({workflow.steps.length}):</Label>
                    <div className="space-y-2 mt-2">
                      {workflow.steps.map((step) => (
                        <div key={step.order} className="flex items-center gap-2 text-sm">
                          <Badge variant="outline" className="text-xs w-6 h-6 rounded-full flex items-center justify-center">
                            {step.order}
                          </Badge>
                          <span className="text-xs">{step.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => executeWorkflow(workflow)}
                    disabled={isExecuting}
                    className="w-full"
                  >
                    <Play className="w-3 h-3 mr-1" />
                    Execute Workflow
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Executions Tab */}
        <TabsContent value="executions" className="space-y-4">
          {executions.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No executions yet. Execute a command or workflow to see results here.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {executions.map((execution) => (
                <Card key={execution.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(execution.status)}
                        <span className="font-medium">{execution.command}</span>
                        {execution.persona && (
                          <Badge variant="outline" className="text-xs">
                            {execution.persona}
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(execution.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    {execution.flags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {execution.flags.map((flag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {flag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {execution.output && (
                      <div className="bg-gray-50 rounded p-2 text-xs font-mono max-h-32 overflow-y-auto">
                        {execution.output}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Command Execution Modal */}
      {selectedCommand && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl m-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getCategoryIcon(selectedCommand.category)}
                Execute {selectedCommand.name}
              </CardTitle>
              <CardDescription>{selectedCommand.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Persona Selection */}
              <div>
                <Label className="text-sm font-medium">Persona (Optional):</Label>
                <Select onValueChange={(value) => setSelectedPersona(SUPERCLAUDE_PERSONAS.find(p => p.id === value) || null)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a persona" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUPERCLAUDE_PERSONAS.map((persona) => (
                      <SelectItem key={persona.id} value={persona.id}>
                        {persona.name} - {persona.focusArea}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Flags */}
              <div>
                <Label className="text-sm font-medium">Available Flags:</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {selectedCommand.flags.map((flag) => (
                    <div key={flag.name} className="text-sm">
                      <Badge variant="outline" className="text-xs mr-2">
                        --{flag.name}
                      </Badge>
                      <span className="text-xs text-gray-600">{flag.description}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom Flags */}
              <div>
                <Label htmlFor="custom-flags" className="text-sm font-medium">Custom Flags:</Label>
                <Input
                  id="custom-flags"
                  value={customFlags}
                  onChange={(e) => setCustomFlags(e.target.value)}
                  placeholder="--flag1 --flag2 value"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={() => setSelectedCommand(null)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    const flags = customFlags.split(' ').filter(f => f.trim());
                    executeCommand(selectedCommand, flags, selectedPersona?.id);
                    setSelectedCommand(null);
                    setCustomFlags('');
                  }}
                  disabled={isExecuting}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Execute Command
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};