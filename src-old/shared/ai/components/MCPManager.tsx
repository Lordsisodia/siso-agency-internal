import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { 
  MessageSquare, 
  Server, 
  Settings, 
  Plus, 
  RefreshCw, 
  CheckCircle, 
  XCircle,
  Activity,
  Database,
  Network,
  Terminal
} from 'lucide-react';

interface MCPServer {
  id: string;
  name: string;
  url: string;
  status: 'connected' | 'disconnected' | 'error';
  lastSeen: string;
  tools: string[];
  resources: string[];
}

export const MCPManager: React.FC = () => {
  const [servers, setServers] = useState<MCPServer[]>([
    {
      id: '1',
      name: 'Supabase MCP',
      url: 'npx @anthropic-ai/mcp-server-supabase',
      status: 'connected',
      lastSeen: new Date().toISOString(),
      tools: ['execute_sql', 'list_tables', 'get_schema'],
      resources: ['databases', 'schemas', 'tables']
    },
    {
      id: '2', 
      name: 'File System MCP',
      url: 'npx @anthropic-ai/mcp-server-filesystem',
      status: 'connected',
      lastSeen: new Date().toISOString(),
      tools: ['read_file', 'write_file', 'list_directory'],
      resources: ['files', 'directories']
    },
    {
      id: '3',
      name: 'Desktop Commander',
      url: 'npx @anthropic-ai/mcp-server-desktop-commander',
      status: 'disconnected',
      lastSeen: '2 hours ago',
      tools: ['execute_command', 'read_file', 'write_file'],
      resources: ['processes', 'files', 'system']
    }
  ]);

  const [newServerName, setNewServerName] = useState('');
  const [newServerUrl, setNewServerUrl] = useState('');
  const [activeTab, setActiveTab] = useState('servers');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-500';
      case 'disconnected': return 'text-gray-500';
      case 'error': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="h-4 w-4" />;
      case 'disconnected': return <XCircle className="h-4 w-4" />;
      case 'error': return <XCircle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const addServer = () => {
    if (!newServerName || !newServerUrl) return;
    
    const newServer: MCPServer = {
      id: Date.now().toString(),
      name: newServerName,
      url: newServerUrl,
      status: 'disconnected',
      lastSeen: 'Never',
      tools: [],
      resources: []
    };
    
    setServers([...servers, newServer]);
    setNewServerName('');
    setNewServerUrl('');
  };

  const connectServer = (serverId: string) => {
    setServers(servers.map(server => 
      server.id === serverId 
        ? { ...server, status: 'connected', lastSeen: new Date().toISOString() }
        : server
    ));
  };

  const disconnectServer = (serverId: string) => {
    setServers(servers.map(server => 
      server.id === serverId 
        ? { ...server, status: 'disconnected' }
        : server
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <MessageSquare className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">MCP Manager</h1>
            <p className="text-muted-foreground">Manage Model Context Protocol servers and integrations</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Server className="h-3 w-3" />
            {servers.filter(s => s.status === 'connected').length} Connected
          </Badge>
          <Button size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh All
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="servers">Servers</TabsTrigger>
          <TabsTrigger value="tools">Tools</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="servers" className="space-y-4">
          {/* Add New Server */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add New MCP Server
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="serverName">Server Name</Label>
                  <Input
                    id="serverName"
                    placeholder="e.g., My Custom MCP Server"
                    value={newServerName}
                    onChange={(e) => setNewServerName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="serverUrl">Server URL/Command</Label>
                  <Input
                    id="serverUrl"
                    placeholder="e.g., npx @my/mcp-server"
                    value={newServerUrl}
                    onChange={(e) => setNewServerUrl(e.target.value)}
                  />
                </div>
              </div>
              <Button onClick={addServer} disabled={!newServerName || !newServerUrl}>
                <Plus className="h-4 w-4 mr-2" />
                Add Server
              </Button>
            </CardContent>
          </Card>

          {/* Server List */}
          <div className="grid grid-cols-1 gap-4">
            {servers.map((server) => (
              <Card key={server.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-full ${server.status === 'connected' ? 'bg-green-100' : 'bg-gray-100'}`}>
                        <span className={getStatusColor(server.status)}>
                          {getStatusIcon(server.status)}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold">{server.name}</h3>
                        <p className="text-sm text-muted-foreground font-mono">{server.url}</p>
                        <p className="text-xs text-muted-foreground">Last seen: {server.lastSeen}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Badge variant={server.status === 'connected' ? 'default' : 'secondary'}>
                        {server.status}
                      </Badge>
                      {server.status === 'connected' ? (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => disconnectServer(server.id)}
                        >
                          Disconnect
                        </Button>
                      ) : (
                        <Button 
                          size="sm"
                          onClick={() => connectServer(server.id)}
                        >
                          Connect
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {server.tools.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium mb-2">Available Tools:</p>
                      <div className="flex flex-wrap gap-1">
                        {server.tools.map((tool) => (
                          <Badge key={tool} variant="outline" className="text-xs">
                            <Terminal className="h-3 w-3 mr-1" />
                            {tool}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tools" className="space-y-4">
          <Alert>
            <Terminal className="h-4 w-4" />
            <AlertDescription>
              MCP tools provide Claude Code with capabilities to interact with external systems.
            </AlertDescription>
          </Alert>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {servers
              .filter(s => s.status === 'connected')
              .flatMap(s => s.tools)
              .filter((tool, index, arr) => arr.indexOf(tool) === index)
              .map((tool) => (
                <Card key={tool}>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Terminal className="h-5 w-5 text-primary" />
                      <span className="font-medium">{tool}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Available from {servers.filter(s => s.tools.includes(tool)).length} server(s)
                    </p>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <Alert>
            <Database className="h-4 w-4" />
            <AlertDescription>
              MCP resources provide Claude Code with access to data and file systems.
            </AlertDescription>
          </Alert>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {servers
              .filter(s => s.status === 'connected')
              .flatMap(s => s.resources)
              .filter((resource, index, arr) => arr.indexOf(resource) === index)
              .map((resource) => (
                <Card key={resource}>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Database className="h-5 w-5 text-primary" />
                      <span className="font-medium">{resource}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Available from {servers.filter(s => s.resources.includes(resource)).length} server(s)
                    </p>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                MCP Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Network className="h-4 w-4" />
                <AlertDescription>
                  MCP servers are configured in your Claude Code settings. Changes here will update your local configuration.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-reconnect servers</Label>
                    <p className="text-sm text-muted-foreground">Automatically reconnect to MCP servers on startup</p>
                  </div>
                  <input type="checkbox" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Debug mode</Label>
                    <p className="text-sm text-muted-foreground">Enable verbose logging for MCP communications</p>
                  </div>
                  <input type="checkbox" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};