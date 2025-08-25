import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  Loader2, 
  MessageSquare, 
  FileEdit, 
  Folder,
  CheckCircle,
  AlertCircle,
  Code
} from "lucide-react";

interface Project {
  name: string;
  path: string;
  type: string;
}

interface ExecutionResult {
  success: boolean;
  output: string;
  error?: string;
  code?: number;
}

/**
 * Claude Code Execution Interface
 * 
 * Provides a web interface to execute Claude Code commands directly
 * from your dashboard, integrating with the local execution API.
 */
export const ClaudeExecutionInterface: React.FC = () => {
  const [prompt, setPrompt] = useState("");
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [executionMode, setExecutionMode] = useState<"chat" | "edit">("chat");
  const [filePath, setFilePath] = useState("");
  const [apiStatus, setApiStatus] = useState<"unknown" | "connected" | "disconnected">("unknown");

  // Check API connection status
  useEffect(() => {
    checkApiConnection();
    loadProjects();
  }, []);

  const checkApiConnection = async () => {
    try {
      const response = await fetch('http://localhost:3002/health');
      if (response.ok) {
        setApiStatus("connected");
      } else {
        setApiStatus("disconnected");
      }
    } catch (error) {
      setApiStatus("disconnected");
    }
  };

  const loadProjects = async () => {
    try {
      const response = await fetch('http://localhost:3002/projects');
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects || []);
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  };

  const executeClaudeCommand = async () => {
    if (!prompt.trim()) return;

    setIsExecuting(true);
    setExecutionResult(null);

    try {
      const endpoint = executionMode === "chat" ? "/execute/chat" : "/execute/edit";
      const body: any = {
        prompt: prompt.trim(),
        projectPath: selectedProject || undefined
      };

      if (executionMode === "edit" && filePath.trim()) {
        body.filePath = filePath.trim();
      }

      const response = await fetch(`http://localhost:3002${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
      });

      const result = await response.json();

      if (response.ok) {
        setExecutionResult({
          success: true,
          output: result.output || 'Command executed successfully',
          error: result.error,
          code: result.code
        });
      } else {
        setExecutionResult({
          success: false,
          output: '',
          error: result.error || 'Execution failed',
          code: response.status
        });
      }
    } catch (error) {
      setExecutionResult({
        success: false,
        output: '',
        error: error instanceof Error ? error.message : 'Network error',
        code: -1
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected": return "bg-green-500";
      case "disconnected": return "bg-red-500";
      default: return "bg-yellow-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "connected": return "Connected";
      case "disconnected": return "Disconnected";
      default: return "Checking...";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Code className="h-6 w-6 text-orange-500" />
            Claude Code Execution
            <Badge 
              variant="outline" 
              className={`ml-auto ${getStatusColor(apiStatus)} text-white`}
            >
              {getStatusText(apiStatus)}
            </Badge>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Connection Status */}
      {apiStatus === "disconnected" && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <div>
                <p className="font-medium">Claude Execution API Not Connected</p>
                <p className="text-sm mt-1">
                  Start the execution server: <code>./scripts/start-claude-execution-api.sh</code>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Execution Interface */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Execute Claude Command</CardTitle>
            <Select 
              value={executionMode} 
              onValueChange={(value: "chat" | "edit") => setExecutionMode(value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="chat">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Chat
                  </div>
                </SelectItem>
                <SelectItem value="edit">
                  <div className="flex items-center gap-2">
                    <FileEdit className="h-4 w-4" />
                    Edit
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Project Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">Project (Optional)</label>
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger>
                <SelectValue placeholder="Select a project..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">
                  <div className="flex items-center gap-2">
                    <Folder className="h-4 w-4" />
                    No specific project
                  </div>
                </SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.path} value={project.path}>
                    <div className="flex items-center gap-2">
                      <Folder className="h-4 w-4" />
                      <span>{project.name}</span>
                      <Badge variant="outline" className="ml-auto">
                        {project.type}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* File Path (for edit mode) */}
          {executionMode === "edit" && (
            <div>
              <label className="text-sm font-medium mb-2 block">File Path</label>
              <input
                type="text"
                value={filePath}
                onChange={(e) => setFilePath(e.target.value)}
                placeholder="src/components/MyComponent.tsx"
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
          )}

          {/* Prompt */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              {executionMode === "chat" ? "Chat Prompt" : "Edit Instructions"}
            </label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={
                executionMode === "chat" 
                  ? "Ask Claude anything..."
                  : "Describe the changes you want to make to the file..."
              }
              rows={4}
              className="w-full"
            />
          </div>

          {/* Execute Button */}
          <Button
            onClick={executeClaudeCommand}
            disabled={isExecuting || !prompt.trim() || apiStatus !== "connected"}
            className="w-full"
          >
            {isExecuting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Executing...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Execute Claude Command
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Execution Result */}
      {executionResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {executionResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500" />
              )}
              Execution Result
            </CardTitle>
          </CardHeader>
          <CardContent>
            {executionResult.success ? (
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <h4 className="font-medium text-green-800 mb-2">Success</h4>
                <pre className="text-sm text-green-700 whitespace-pre-wrap overflow-x-auto">
                  {executionResult.output}
                </pre>
                {executionResult.error && (
                  <div className="mt-3 pt-3 border-t border-green-200">
                    <h5 className="text-sm font-medium text-green-800">Additional Info:</h5>
                    <pre className="text-xs text-green-600 whitespace-pre-wrap">
                      {executionResult.error}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <h4 className="font-medium text-red-800 mb-2">Error</h4>
                <pre className="text-sm text-red-700 whitespace-pre-wrap overflow-x-auto">
                  {executionResult.error}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};