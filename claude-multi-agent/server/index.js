import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { spawn } from 'child_process';
import fs from 'fs/promises';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

app.use(cors());
app.use(express.json());

// Store active agents and their state
const agents = new Map();
const agentProcesses = new Map();

// Agent class to manage individual Claude instances
class ClaudeAgent {
  constructor(id, name, projectPath, prompt) {
    this.id = id;
    this.name = name;
    this.projectPath = projectPath;
    this.prompt = prompt;
    this.status = 'idle';
    this.messages = [];
    this.process = null;
    this.sessionId = null;
    this.clients = new Set();
  }

  async start() {
    if (this.status === 'running') return;
    
    this.status = 'starting';
    this.notifyClients({ type: 'status', status: this.status });

    try {
      const args = ['--output-format', 'stream-json', '--verbose'];
      
      if (this.prompt) {
        args.unshift('--print', this.prompt);
      }

      if (this.sessionId) {
        args.push('--resume', this.sessionId);
      }

      this.process = spawn('claude', args, {
        cwd: this.projectPath,
        env: { ...process.env }
      });

      this.status = 'running';
      this.notifyClients({ type: 'status', status: this.status });

      // Handle stdout
      this.process.stdout.on('data', (data) => {
        const lines = data.toString().split('\n').filter(line => line.trim());
        
        for (const line of lines) {
          try {
            const message = JSON.parse(line);
            this.handleMessage(message);
          } catch (e) {
            // Handle non-JSON output
            if (line.trim()) {
              this.addMessage({ type: 'raw', content: line });
            }
          }
        }
      });

      // Handle stderr
      this.process.stderr.on('data', (data) => {
        this.addMessage({ type: 'error', content: data.toString() });
      });

      // Handle process exit
      this.process.on('exit', (code, signal) => {
        this.status = 'stopped';
        this.process = null;
        this.notifyClients({ 
          type: 'status', 
          status: this.status,
          exitCode: code,
          signal: signal
        });
      });

    } catch (error) {
      this.status = 'error';
      this.addMessage({ type: 'error', content: error.message });
      this.notifyClients({ type: 'status', status: this.status, error: error.message });
    }
  }

  handleMessage(message) {
    // Extract session ID if present
    if (message.session_id && !this.sessionId) {
      this.sessionId = message.session_id;
      this.notifyClients({ type: 'session', sessionId: this.sessionId });
    }

    // Store message
    this.messages.push({
      ...message,
      timestamp: new Date().toISOString()
    });

    // Notify all connected clients
    this.notifyClients({ type: 'message', message });
  }

  addMessage(message) {
    const fullMessage = {
      ...message,
      timestamp: new Date().toISOString()
    };
    this.messages.push(fullMessage);
    this.notifyClients({ type: 'message', message: fullMessage });
  }

  stop() {
    if (this.process) {
      this.process.kill();
      this.process = null;
    }
    this.status = 'stopped';
    this.notifyClients({ type: 'status', status: this.status });
  }

  sendInput(input) {
    if (this.process && this.process.stdin) {
      this.process.stdin.write(input + '\n');
      this.addMessage({ type: 'user_input', content: input });
    }
  }

  addClient(ws) {
    this.clients.add(ws);
    // Send current state to new client
    ws.send(JSON.stringify({
      type: 'initial_state',
      agentId: this.id,
      status: this.status,
      messages: this.messages,
      sessionId: this.sessionId
    }));
  }

  removeClient(ws) {
    this.clients.delete(ws);
  }

  notifyClients(data) {
    const message = JSON.stringify({ ...data, agentId: this.id });
    this.clients.forEach(client => {
      if (client.readyState === client.OPEN) {
        client.send(message);
      }
    });
  }
}

// API Routes
app.get('/api/projects', async (req, res) => {
  try {
    const claudeProjectsPath = path.join(os.homedir(), '.claude', 'projects');
    const projects = [];

    try {
      const entries = await fs.readdir(claudeProjectsPath);
      
      for (const entry of entries) {
        const projectPath = path.join(claudeProjectsPath, entry);
        const stats = await fs.stat(projectPath);
        
        if (stats.isDirectory()) {
          // Extract actual project directory from metadata
          const metadataPath = path.join(projectPath, 'project.metadata');
          let actualPath = entry.replace(/-/g, '/');
          
          try {
            const metadata = await fs.readFile(metadataPath, 'utf8');
            const metadataJson = JSON.parse(metadata);
            if (metadataJson.directory) {
              actualPath = metadataJson.directory;
            }
          } catch (e) {
            // Use default path if metadata reading fails
          }

          projects.push({
            name: entry,
            path: actualPath,
            metadataPath: projectPath
          });
        }
      }
    } catch (e) {
      console.error('Error reading projects:', e);
    }

    res.json({ projects });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/agents', (req, res) => {
  const agentList = Array.from(agents.values()).map(agent => ({
    id: agent.id,
    name: agent.name,
    projectPath: agent.projectPath,
    status: agent.status,
    messageCount: agent.messages.length,
    sessionId: agent.sessionId
  }));
  
  res.json({ agents: agentList });
});

app.post('/api/agents', (req, res) => {
  const { name, projectPath, prompt } = req.body;
  
  if (!name || !projectPath) {
    return res.status(400).json({ error: 'Name and projectPath are required' });
  }

  const id = uuidv4();
  const agent = new ClaudeAgent(id, name, projectPath, prompt);
  agents.set(id, agent);

  res.json({ 
    id,
    name: agent.name,
    projectPath: agent.projectPath,
    status: agent.status
  });
});

app.post('/api/agents/:id/start', (req, res) => {
  const agent = agents.get(req.params.id);
  
  if (!agent) {
    return res.status(404).json({ error: 'Agent not found' });
  }

  agent.start();
  res.json({ status: agent.status });
});

app.post('/api/agents/:id/stop', (req, res) => {
  const agent = agents.get(req.params.id);
  
  if (!agent) {
    return res.status(404).json({ error: 'Agent not found' });
  }

  agent.stop();
  res.json({ status: agent.status });
});

app.delete('/api/agents/:id', (req, res) => {
  const agent = agents.get(req.params.id);
  
  if (!agent) {
    return res.status(404).json({ error: 'Agent not found' });
  }

  agent.stop();
  agents.delete(req.params.id);
  res.json({ success: true });
});

// WebSocket handling
wss.on('connection', (ws) => {
  console.log('New WebSocket connection');
  
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      
      switch (message.type) {
        case 'subscribe':
          const agent = agents.get(message.agentId);
          if (agent) {
            agent.addClient(ws);
            ws.agentId = message.agentId;
          }
          break;
          
        case 'input':
          const inputAgent = agents.get(message.agentId);
          if (inputAgent) {
            inputAgent.sendInput(message.input);
          }
          break;
          
        case 'unsubscribe':
          const unsubAgent = agents.get(message.agentId);
          if (unsubAgent) {
            unsubAgent.removeClient(ws);
          }
          break;
      }
    } catch (error) {
      console.error('WebSocket message error:', error);
    }
  });

  ws.on('close', () => {
    // Remove from all agents
    if (ws.agentId) {
      const agent = agents.get(ws.agentId);
      if (agent) {
        agent.removeClient(ws);
      }
    }
  });
});

// Serve static files
app.use(express.static(path.join(__dirname, '../dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Claude Multi-Agent server running on http://0.0.0.0:${PORT}`);
});