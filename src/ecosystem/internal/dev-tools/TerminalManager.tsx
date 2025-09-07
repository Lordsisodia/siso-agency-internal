import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, X, Terminal, Settings, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Badge } from '@/shared/ui/badge';

interface Project {
  id: string;
  name: string;
  path: string;
  status: 'active' | 'idle' | 'error';
  agents: number;
  lastActivity: string;
}

interface TerminalSession {
  id: string;
  name: string;
  projectId: string;
  isActive: boolean;
  output: string[];
  currentCommand: string;
}

interface TerminalManagerProps {
  projects: Project[];
}

export const TerminalManager: React.FC<TerminalManagerProps> = ({ projects }) => {
  const [terminals, setTerminals] = useState<TerminalSession[]>([
    {
      id: 'term-1',
      name: 'SISO Main',
      projectId: 'siso-main',
      isActive: true,
      output: [
        '$ npm run dev',
        'Starting development server...',
        'Server running on http://localhost:5173',
        '$ '
      ],
      currentCommand: ''
    }
  ]);
  
  const [activeTerminal, setActiveTerminal] = useState('term-1');
  const [isMaximized, setIsMaximized] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);

  const createTerminal = (projectId?: string) => {
    const project = projects.find(p => p.id === projectId) || projects[0];
    const newTerminal: TerminalSession = {
      id: `term-${Date.now()}`,
      name: project ? project.name : 'New Terminal',
      projectId: project ? project.id : '',
      isActive: true,
      output: [
        `$ cd ${project?.path || '/workspace'}`,
        `Welcome to ${project?.name || 'Terminal'}`,
        '$ '
      ],
      currentCommand: ''
    };
    
    setTerminals(prev => [...prev, newTerminal]);
    setActiveTerminal(newTerminal.id);
  };

  const closeTerminal = (terminalId: string) => {
    setTerminals(prev => prev.filter(t => t.id !== terminalId));
    if (activeTerminal === terminalId) {
      const remaining = terminals.filter(t => t.id !== terminalId);
      setActiveTerminal(remaining.length > 0 ? remaining[0].id : '');
    }
  };

  const executeCommand = (terminalId: string, command: string) => {
    setTerminals(prev => prev.map(terminal => {
      if (terminal.id === terminalId) {
        const newOutput = [
          ...terminal.output.slice(0, -1), // Remove the current prompt
          `$ ${command}`,
          `Executed: ${command}`, // Mock execution
          '$ '
        ];
        return {
          ...terminal,
          output: newOutput,
          currentCommand: ''
        };
      }
      return terminal;
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent, terminalId: string) => {
    if (e.key === 'Enter') {
      const terminal = terminals.find(t => t.id === terminalId);
      if (terminal && terminal.currentCommand.trim()) {
        executeCommand(terminalId, terminal.currentCommand);
      }
    }
  };

  const updateCommand = (terminalId: string, command: string) => {
    setTerminals(prev => prev.map(terminal => 
      terminal.id === terminalId 
        ? { ...terminal, currentCommand: command }
        : terminal
    ));
  };

  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : 'Unknown';
  };

  const currentTerminal = terminals.find(t => t.id === activeTerminal);

  // Auto-scroll to bottom when output changes
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [currentTerminal?.output]);

  return (
    <div className={`${isMaximized ? 'fixed inset-0 z-50 bg-gray-900' : 'h-96'} flex flex-col`}>
      {/* Terminal Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-700 bg-gray-800">
        <div className="flex items-center gap-3">
          <Terminal className="h-4 w-4 text-blue-400" />
          <span className="text-sm font-medium text-white">Terminal Manager</span>
          <Badge variant="secondary" className="text-xs">
            {terminals.length} session{terminals.length !== 1 ? 's' : ''}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => createTerminal()}
            className="flex items-center gap-1"
          >
            <Plus className="h-3 w-3" />
            New
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsMaximized(!isMaximized)}
          >
            {isMaximized ? (
              <Minimize2 className="h-3 w-3" />
            ) : (
              <Maximize2 className="h-3 w-3" />
            )}
          </Button>
          
          <Button size="sm" variant="outline">
            <Settings className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {terminals.length === 0 ? (
        <div className="flex-1 flex items-center justify-center bg-gray-900">
          <div className="text-center">
            <Terminal className="h-12 w-12 mx-auto text-gray-500 mb-4" />
            <p className="text-gray-400">No terminal sessions</p>
            <Button 
              onClick={() => createTerminal()}
              className="mt-3"
            >
              Create Terminal
            </Button>
          </div>
        </div>
      ) : (
        <Tabs value={activeTerminal} onValueChange={setActiveTerminal} className="flex-1 flex flex-col">
          {/* Terminal Tabs */}
          <div className="px-3 pt-2 border-b border-gray-700 bg-gray-850">
            <TabsList className="bg-transparent p-0 h-auto">
              {terminals.map((terminal) => (
                <div key={terminal.id} className="relative">
                  <TabsTrigger
                    value={terminal.id}
                    className="data-[state=active]:bg-gray-700 data-[state=active]:text-white px-4 py-2 rounded-t-lg border-x border-t border-gray-600 data-[state=active]:border-gray-600 flex items-center gap-2"
                  >
                    <span className="text-xs">{terminal.name}</span>
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        closeTerminal(terminal.id);
                      }}
                      className="h-4 w-4 flex items-center justify-center hover:bg-gray-600 rounded cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                    </span>
                  </TabsTrigger>
                </div>
              ))}
            </TabsList>
          </div>

          {/* Terminal Content */}
          {terminals.map((terminal) => (
            <TabsContent
              key={terminal.id}
              value={terminal.id}
              className="flex-1 m-0 data-[state=active]:flex data-[state=active]:flex-col"
            >
              <div className="flex-1 bg-black text-green-400 font-mono text-sm overflow-hidden flex flex-col">
                {/* Terminal Output */}
                <div
                  ref={terminalRef}
                  className="flex-1 p-4 overflow-y-auto"
                  style={{ scrollbarWidth: 'thin' }}
                >
                  {terminal.output.map((line, index) => (
                    <div key={index} className="whitespace-pre-wrap">
                      {line}
                    </div>
                  ))}
                  {/* Current command input */}
                  <div className="flex">
                    <span>$ </span>
                    <input
                      type="text"
                      value={terminal.currentCommand}
                      onChange={(e) => updateCommand(terminal.id, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, terminal.id)}
                      className="flex-1 bg-transparent border-none outline-none text-green-400 font-mono"
                      placeholder="Enter command..."
                      autoFocus={activeTerminal === terminal.id}
                    />
                  </div>
                </div>
                
                {/* Terminal Footer */}
                <div className="px-4 py-2 bg-gray-800 border-t border-gray-700 text-xs text-gray-400">
                  <div className="flex items-center justify-between">
                    <span>Project: {getProjectName(terminal.projectId)}</span>
                    <span>Session: {terminal.id}</span>
                  </div>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
};