import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Github, Search, Download } from 'lucide-react';

interface GitHubAgent {
  name: string;
  description: string;
  url: string;
}

interface GitHubAgentBrowserProps {
  onImport: (agent: GitHubAgent) => void;
  onClose: () => void;
}

export const GitHubAgentBrowser: React.FC<GitHubAgentBrowserProps> = ({ onImport, onClose }) => {
  const [search, setSearch] = useState('');
  
  // Mock agents for now
  const mockAgents: GitHubAgent[] = [
    {
      name: 'Code Review Agent',
      description: 'Automated code review and suggestions',
      url: 'https://github.com/example/code-review-agent'
    },
    {
      name: 'Test Generator',
      description: 'Generates unit tests for your code',
      url: 'https://github.com/example/test-generator'
    }
  ];

  const filteredAgents = mockAgents.filter(agent => 
    agent.name.toLowerCase().includes(search.toLowerCase()) ||
    agent.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Github className="w-5 h-5" />
          Browse GitHub Agents
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search agents..."
            className="pl-10"
          />
        </div>
        
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredAgents.map((agent, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold">{agent.name}</h4>
                  <p className="text-sm text-gray-600">{agent.description}</p>
                </div>
                <Button
                  size="sm"
                  onClick={() => onImport(agent)}
                >
                  <Download className="w-4 h-4 mr-1" />
                  Import
                </Button>
              </div>
            </Card>
          ))}
        </div>
        
        <div className="flex justify-end">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};