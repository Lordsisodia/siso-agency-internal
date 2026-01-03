import { useState, useEffect } from 'react';
import { Activity, AlertTriangle, CheckCircle, XCircle, Power } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Conditional imports for Tauri-specific features
let invoke: any;
let listen: any;

if (typeof window !== 'undefined' && window.__TAURI__) {
  import('@tauri-apps/api/core').then(module => {
    invoke = module.invoke;
  });
  import('@tauri-apps/api/event').then(module => {
    listen = module.listen;
  });
}

interface SupervisorConfig {
  health_check_interval: number;
  idle_timeout: number;
  max_retries: number;
  enable_auto_recovery: boolean;
  enable_load_balancing: boolean;
}

interface AgentHealth {
  session_name: string;
  status: 'healthy' | 'warning' | 'error' | 'dead';
  last_activity: string;
  cpu_usage?: number;
  memory_usage?: number;
  error_count: number;
  restart_count: number;
}

interface SupervisorStatus {
  is_running: boolean;
  uptime_seconds: number;
  total_agents: number;
  healthy_agents: number;
  failed_agents: number;
  last_check: string;
  agents: AgentHealth[];
}

export function SupervisorDashboard() {
  const [status, setStatus] = useState<SupervisorStatus | null>(null);
  const [config, setConfig] = useState<SupervisorConfig>({
    health_check_interval: 60,
    idle_timeout: 1800,
    max_retries: 3,
    enable_auto_recovery: true,
    enable_load_balancing: true,
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [commandOutput, setCommandOutput] = useState('');
  const [customCommand, setCustomCommand] = useState('');

  // Load supervisor status
  const loadStatus = async () => {
    try {
      const supervisorStatus = await invoke<SupervisorStatus>('get_supervisor_status');
      setStatus(supervisorStatus);
    } catch (error) {
      console.error('Failed to load supervisor status:', error);
    }
  };

  // Initialize supervisor
  const initSupervisor = async () => {
    setLoading(true);
    try {
      await invoke('init_supervisor', { config });
      await loadStatus();
    } catch (error) {
      console.error('Failed to initialize supervisor:', error);
    } finally {
      setLoading(false);
    }
  };

  // Kill supervisor
  const killSupervisor = async () => {
    if (!confirm('Are you sure you want to stop the supervisor system?')) return;
    
    try {
      await invoke('kill_supervisor');
      setStatus(null);
    } catch (error) {
      console.error('Failed to kill supervisor:', error);
    }
  };

  // Update configuration
  const updateConfig = async () => {
    try {
      await invoke('update_supervisor_config', { config });
    } catch (error) {
      console.error('Failed to update config:', error);
    }
  };

  // Send custom command
  const sendCommand = async () => {
    if (!customCommand) return;
    
    try {
      const output = await invoke<string>('send_supervisor_command', { 
        command: customCommand 
      });
      setCommandOutput(output);
      setCustomCommand('');
    } catch (error) {
      console.error('Failed to send command:', error);
    }
  };

  // Setup event listeners
  useEffect(() => {
    loadStatus();
    const interval = setInterval(loadStatus, 5000);

    // Listen for supervisor events
    const unlisten1 = listen('supervisor-initialized', () => {
      loadStatus();
    });

    const unlisten2 = listen('supervisor-recovered', () => {
      loadStatus();
    });

    return () => {
      clearInterval(interval);
      unlisten1.then(fn => fn());
      unlisten2.then(fn => fn());
    };
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'dead':
        return <XCircle className="h-4 w-4 text-gray-500" />;
      default:
        return null;
    }
  };

  const getHealthPercentage = () => {
    if (!status || status.total_agents === 0) return 0;
    return Math.round((status.healthy_agents / status.total_agents) * 100);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Supervisor Dashboard
            </CardTitle>
            <CardDescription>
              Monitor and manage the multi-agent supervisor system
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {status?.is_running ? (
              <>
                <Badge variant="default" className="bg-green-500">
                  Running
                </Badge>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={killSupervisor}
                >
                  <Power className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Button
                onClick={initSupervisor}
                disabled={loading}
                size="sm"
              >
                {loading ? 'Starting...' : 'Start Supervisor'}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="agents">Agents</TabsTrigger>
            <TabsTrigger value="config">Config</TabsTrigger>
            <TabsTrigger value="console">Console</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            {status?.is_running ? (
              <>
                {/* Health Overview */}
                <div className="grid grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold">{status.total_agents}</div>
                      <p className="text-sm text-muted-foreground">Total Agents</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-green-500">
                        {status.healthy_agents}
                      </div>
                      <p className="text-sm text-muted-foreground">Healthy</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-red-500">
                        {status.failed_agents}
                      </div>
                      <p className="text-sm text-muted-foreground">Failed</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold">
                        {Math.floor(status.uptime_seconds / 60)}m
                      </div>
                      <p className="text-sm text-muted-foreground">Uptime</p>
                    </CardContent>
                  </Card>
                </div>
                
                {/* System Health */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">System Health</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Overall Health</span>
                        <span className="text-sm font-medium">
                          {getHealthPercentage()}%
                        </span>
                      </div>
                      <Progress value={getHealthPercentage()} />
                    </div>
                  </CardContent>
                </Card>
                
                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Last check: {new Date(status.last_check).toLocaleTimeString()}
                    </p>
                  </CardContent>
                </Card>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Supervisor is not running. Click "Start Supervisor" to begin.
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="agents" className="space-y-4">
            {status?.agents.length ? (
              <div className="space-y-2">
                {status.agents.map((agent) => (
                  <Card key={agent.session_name}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(agent.status)}
                          <div>
                            <p className="font-medium">{agent.session_name}</p>
                            <p className="text-sm text-muted-foreground">
                              Errors: {agent.error_count} | Restarts: {agent.restart_count}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={
                            agent.status === 'healthy' ? 'default' :
                            agent.status === 'warning' ? 'secondary' :
                            'destructive'
                          }>
                            {agent.status}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(agent.last_activity).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No agents found
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="config" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Supervisor Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Health Check Interval (seconds)</Label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded"
                    value={config.health_check_interval}
                    onChange={(e) => setConfig({
                      ...config,
                      health_check_interval: parseInt(e.target.value) || 60
                    })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Idle Timeout (seconds)</Label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded"
                    value={config.idle_timeout}
                    onChange={(e) => setConfig({
                      ...config,
                      idle_timeout: parseInt(e.target.value) || 1800
                    })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label>Auto Recovery</Label>
                  <Switch
                    checked={config.enable_auto_recovery}
                    onCheckedChange={(checked) => setConfig({
                      ...config,
                      enable_auto_recovery: checked
                    })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label>Load Balancing</Label>
                  <Switch
                    checked={config.enable_load_balancing}
                    onCheckedChange={(checked) => setConfig({
                      ...config,
                      enable_load_balancing: checked
                    })}
                  />
                </div>
                
                <Button onClick={updateConfig} className="w-full">
                  Update Configuration
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="console" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Supervisor Console</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="flex-1 p-2 border rounded"
                    placeholder="Enter command for supervisor..."
                    value={customCommand}
                    onChange={(e) => setCustomCommand(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') sendCommand();
                    }}
                  />
                  <Button onClick={sendCommand}>Send</Button>
                </div>
                
                {commandOutput && (
                  <div className="bg-black/5 p-4 rounded font-mono text-xs whitespace-pre-wrap">
                    {commandOutput}
                  </div>
                )}
                
                <div className="text-sm text-muted-foreground">
                  <p>Example commands:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>tmux ls</li>
                    <li>restart agent_name</li>
                    <li>kill idle agents</li>
                    <li>generate status report</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}