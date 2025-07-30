import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
} from '@mui/material';
import {
  Add as AddIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import axios from 'axios';
import AgentCard from './components/AgentCard';
import AgentChat from './components/AgentChat';

function App() {
  const [agents, setAgents] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newAgent, setNewAgent] = useState({
    name: '',
    projectPath: '',
    prompt: ''
  });

  // Load projects on mount
  useEffect(() => {
    loadProjects();
    loadAgents();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await axios.get('/api/projects');
      setProjects(response.data.projects);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const loadAgents = async () => {
    try {
      const response = await axios.get('/api/agents');
      setAgents(response.data.agents);
    } catch (error) {
      console.error('Error loading agents:', error);
    }
  };

  const createAgent = async () => {
    try {
      const response = await axios.post('/api/agents', newAgent);
      await loadAgents();
      setCreateDialogOpen(false);
      setNewAgent({ name: '', projectPath: '', prompt: '' });
    } catch (error) {
      console.error('Error creating agent:', error);
    }
  };

  const startAgent = async (agentId) => {
    try {
      await axios.post(`/api/agents/${agentId}/start`);
      await loadAgents();
    } catch (error) {
      console.error('Error starting agent:', error);
    }
  };

  const stopAgent = async (agentId) => {
    try {
      await axios.post(`/api/agents/${agentId}/stop`);
      await loadAgents();
    } catch (error) {
      console.error('Error stopping agent:', error);
    }
  };

  const deleteAgent = async (agentId) => {
    try {
      await axios.delete(`/api/agents/${agentId}`);
      await loadAgents();
      if (selectedAgent?.id === agentId) {
        setSelectedAgent(null);
      }
    } catch (error) {
      console.error('Error deleting agent:', error);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Claude Multi-Agent System
          </Typography>
          <IconButton color="inherit" onClick={loadAgents}>
            <RefreshIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 2, mb: 2, flex: 1, overflow: 'hidden' }}>
        <Grid container spacing={2} sx={{ height: '100%' }}>
          <Grid item xs={12} md={4} lg={3}>
            <Paper sx={{ p: 2, height: '100%', overflow: 'auto' }}>
              <Typography variant="h6" gutterBottom>
                Active Agents
              </Typography>
              
              {agents.map((agent) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  selected={selectedAgent?.id === agent.id}
                  onSelect={() => setSelectedAgent(agent)}
                  onStart={() => startAgent(agent.id)}
                  onStop={() => stopAgent(agent.id)}
                  onDelete={() => deleteAgent(agent.id)}
                />
              ))}

              {agents.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  No agents created yet. Click the + button to create one.
                </Typography>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12} md={8} lg={9}>
            {selectedAgent ? (
              <AgentChat agent={selectedAgent} />
            ) : (
              <Paper sx={{ p: 4, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="h6" color="text.secondary">
                  Select an agent to view its chat
                </Typography>
              </Paper>
            )}
          </Grid>
        </Grid>
      </Container>

      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setCreateDialogOpen(true)}
      >
        <AddIcon />
      </Fab>

      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Agent</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Agent Name"
            fullWidth
            variant="outlined"
            value={newAgent.name}
            onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Project</InputLabel>
            <Select
              value={newAgent.projectPath}
              onChange={(e) => setNewAgent({ ...newAgent, projectPath: e.target.value })}
              label="Project"
            >
              {projects.map((project) => (
                <MenuItem key={project.name} value={project.path}>
                  {project.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            margin="dense"
            label="Initial Prompt"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={newAgent.prompt}
            onChange={(e) => setNewAgent({ ...newAgent, prompt: e.target.value })}
            helperText="The initial prompt to send to Claude when the agent starts"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={createAgent} 
            variant="contained"
            disabled={!newAgent.name || !newAgent.projectPath}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default App;