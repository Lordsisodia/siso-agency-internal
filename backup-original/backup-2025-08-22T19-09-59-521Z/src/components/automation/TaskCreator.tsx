import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Zap, Code, TestTube, Rocket, BarChart, Wrench } from 'lucide-react';

interface TaskCreatorProps {
  onSubmit: (taskData: any) => void;
  onCancel: () => void;
}

const TASK_CATEGORIES = [
  { id: 'development', label: 'Development', icon: Code, color: 'bg-blue-600' },
  { id: 'testing', label: 'Testing', icon: TestTube, color: 'bg-green-600' },
  { id: 'deployment', label: 'Deployment', icon: Rocket, color: 'bg-purple-600' },
  { id: 'analysis', label: 'Analysis', icon: BarChart, color: 'bg-yellow-600' },
  { id: 'maintenance', label: 'Maintenance', icon: Wrench, color: 'bg-red-600' }
];

const PRIORITY_LEVELS = [
  { id: 'low', label: 'Low', color: 'bg-gray-600' },
  { id: 'medium', label: 'Medium', color: 'bg-blue-600' },
  { id: 'high', label: 'High', color: 'bg-orange-600' },
  { id: 'urgent', label: 'Urgent', color: 'bg-red-600' }
];

const COMMON_TOOLS = [
  'ReadFile', 'Edit', 'Bash(git:*)', 'Bash(npm:*)', 'Bash(ls:*)', 
  'Bash(grep:*)', 'Bash(find:*)', 'mcp_supabase_execute_sql',
  'mcp_supabase_list_tables', 'WebFetch'
];

const PROMPT_TEMPLATES = {
  development: `Implement a new feature that adds {feature_name} to the {component_name} component.

Requirements:
- Use TypeScript with proper typing
- Follow existing code patterns
- Implement error handling
- Add dark theme styling with Tailwind CSS
- Ensure responsive design
- Update relevant documentation

Please analyze the existing codebase structure and implement this feature following best practices.`,

  testing: `Create comprehensive tests for the {component_name} functionality.

Requirements:
- Write unit tests covering edge cases
- Add integration tests if applicable
- Ensure good test coverage (>80%)
- Mock external dependencies
- Test error scenarios
- Document test scenarios

Use Jest/Vitest and React Testing Library where applicable.`,

  deployment: `Set up deployment pipeline for {environment} environment.

Requirements:
- Configure environment variables
- Set up build process
- Implement security best practices
- Add health checks
- Configure monitoring
- Document deployment process

Consider containerization and CI/CD best practices.`,

  analysis: `Analyze {data_source} and provide insights.

Requirements:
- Examine the data/code structure
- Identify patterns and anomalies
- Generate performance metrics
- Provide actionable recommendations
- Create visualizations if helpful
- Document findings

Focus on performance optimization and user experience improvements.`,

  maintenance: `Perform maintenance on {system_component}.

Requirements:
- Assess current system state
- Update dependencies safely
- Optimize performance
- Clean up unused code/files
- Fix any technical debt
- Document changes made

Prioritize system stability and backward compatibility.`
};

export function TaskCreator({ onSubmit, onCancel }: TaskCreatorProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    priority: 'medium',
    prompt: '',
    allowedTools: ['ReadFile', 'Edit'],
    estimatedTokens: 5000
  });

  const [customTool, setCustomTool] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category || !formData.prompt) {
      return;
    }

    onSubmit(formData);
  };

  const handleCategoryChange = (category: string) => {
    setFormData(prev => ({
      ...prev,
      category,
      prompt: PROMPT_TEMPLATES[category as keyof typeof PROMPT_TEMPLATES] || ''
    }));
  };

  const addTool = (tool: string) => {
    if (tool && !formData.allowedTools.includes(tool)) {
      setFormData(prev => ({
        ...prev,
        allowedTools: [...prev.allowedTools, tool]
      }));
    }
  };

  const removeTool = (tool: string) => {
    setFormData(prev => ({
      ...prev,
      allowedTools: prev.allowedTools.filter(t => t !== tool)
    }));
  };

  const addCustomTool = () => {
    if (customTool) {
      addTool(customTool);
      setCustomTool('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-800 border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white flex items-center">
            <Zap className="w-5 h-5 mr-2 text-orange-500" />
            Create Automation Task
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Task Name *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Add user authentication"
                  className="bg-gray-700 border-gray-600 text-white"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Estimated Tokens
                </label>
                <Input
                  type="number"
                  value={formData.estimatedTokens}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimatedTokens: parseInt(e.target.value) }))}
                  className="bg-gray-700 border-gray-600 text-white"
                  min={100}
                  max={50000}
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of what this task should accomplish"
                className="bg-gray-700 border-gray-600 text-white"
                rows={3}
              />
            </div>

            {/* Category and Priority */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Category *
                </label>
                <Select value={formData.category} onValueChange={handleCategoryChange}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    {TASK_CATEGORIES.map((cat) => {
                      const Icon = cat.icon;
                      return (
                        <SelectItem key={cat.id} value={cat.id} className="text-white hover:bg-gray-600">
                          <div className="flex items-center">
                            <Icon className="w-4 h-4 mr-2" />
                            {cat.label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Priority
                </label>
                <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    {PRIORITY_LEVELS.map((priority) => (
                      <SelectItem key={priority.id} value={priority.id} className="text-white hover:bg-gray-600">
                        <Badge className={`${priority.color} text-white`}>
                          {priority.label}
                        </Badge>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Allowed Tools */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Allowed Tools
              </label>
              
              {/* Selected Tools */}
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.allowedTools.map((tool) => (
                  <Badge
                    key={tool}
                    variant="secondary"
                    className="bg-blue-600 text-white cursor-pointer hover:bg-blue-700"
                    onClick={() => removeTool(tool)}
                  >
                    {tool}
                    <X className="w-3 h-3 ml-1" />
                  </Badge>
                ))}
              </div>
              
              {/* Add Common Tools */}
              <div className="space-y-2">
                <div className="text-sm text-gray-400">Quick add:</div>
                <div className="flex flex-wrap gap-2">
                  {COMMON_TOOLS.filter(tool => !formData.allowedTools.includes(tool)).map((tool) => (
                    <Button
                      key={tool}
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => addTool(tool)}
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      {tool}
                    </Button>
                  ))}
                </div>
              </div>
              
              {/* Custom Tool */}
              <div className="flex gap-2 mt-3">
                <Input
                  value={customTool}
                  onChange={(e) => setCustomTool(e.target.value)}
                  placeholder="Custom tool name"
                  className="bg-gray-700 border-gray-600 text-white"
                />
                <Button
                  type="button"
                  onClick={addCustomTool}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  Add
                </Button>
              </div>
            </div>

            {/* Prompt */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Task Prompt *
              </label>
              <Textarea
                value={formData.prompt}
                onChange={(e) => setFormData(prev => ({ ...prev, prompt: e.target.value }))}
                placeholder="Detailed instructions for Claude Code..."
                className="bg-gray-700 border-gray-600 text-white"
                rows={8}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Use placeholder tokens like {`{feature_name}`}, {`{component_name}`} etc. that you can customize.
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-orange-600 hover:bg-orange-700 text-white"
                disabled={!formData.name || !formData.category || !formData.prompt}
              >
                Create Task
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}