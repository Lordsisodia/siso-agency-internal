import React, { useState, useEffect, useRef } from 'react';
import {
  Paper,
  Typography,
  Box,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
} from '@mui/material';
import {
  Send as SendIcon,
} from '@mui/icons-material';

function AgentChat({ agent }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [connected, setConnected] = useState(false);
  const ws = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Connect to WebSocket
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      setConnected(true);
      // Subscribe to this agent
      ws.current.send(JSON.stringify({
        type: 'subscribe',
        agentId: agent.id
      }));
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.agentId !== agent.id) return;

      switch (data.type) {
        case 'initial_state':
          setMessages(data.messages || []);
          break;
          
        case 'message':
          setMessages(prev => [...prev, data.message]);
          break;
          
        case 'status':
          // Handle status updates if needed
          break;
      }
    };

    ws.current.onclose = () => {
      setConnected(false);
    };

    return () => {
      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify({
          type: 'unsubscribe',
          agentId: agent.id
        }));
        ws.current.close();
      }
    };
  }, [agent.id]);

  const sendMessage = () => {
    if (!input.trim() || !connected) return;

    ws.current.send(JSON.stringify({
      type: 'input',
      agentId: agent.id,
      input: input
    }));

    setInput('');
  };

  const renderMessage = (message) => {
    if (message.type === 'user_input') {
      return (
        <ListItem>
          <ListItemText
            primary={
              <Box display="flex" alignItems="center" gap={1}>
                <Chip label="User" size="small" color="primary" />
                <Typography variant="body2">{message.content}</Typography>
              </Box>
            }
          />
        </ListItem>
      );
    }

    if (message.type === 'assistant') {
      const content = message.message?.content || [];
      const text = content
        .filter(item => item.type === 'text')
        .map(item => item.text)
        .join('');

      return (
        <ListItem>
          <ListItemText
            primary={
              <Box display="flex" alignItems="center" gap={1}>
                <Chip label="Claude" size="small" color="secondary" />
                <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
                  {text}
                </Typography>
              </Box>
            }
          />
        </ListItem>
      );
    }

    if (message.type === 'error') {
      return (
        <ListItem>
          <ListItemText
            primary={
              <Box display="flex" alignItems="center" gap={1}>
                <Chip label="Error" size="small" color="error" />
                <Typography variant="body2" color="error">
                  {message.content}
                </Typography>
              </Box>
            }
          />
        </ListItem>
      );
    }

    if (message.type === 'raw') {
      return (
        <ListItem>
          <ListItemText
            primary={
              <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.9em' }}>
                {message.content}
              </Typography>
            }
          />
        </ListItem>
      );
    }

    // For other message types, show a simplified view
    return (
      <ListItem>
        <ListItemText
          primary={
            <Typography variant="caption" color="text.secondary">
              {message.type}: {JSON.stringify(message).substring(0, 100)}...
            </Typography>
          }
        />
      </ListItem>
    );
  };

  return (
    <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6">
          {agent.name}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {agent.projectPath} • {connected ? 'Connected' : 'Disconnected'}
        </Typography>
      </Box>

      <List sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {messages.map((message, index) => (
          <React.Fragment key={index}>
            {renderMessage(message)}
            {index < messages.length - 1 && <Divider />}
          </React.Fragment>
        ))}
        <div ref={messagesEndRef} />
      </List>

      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Box display="flex" gap={1}>
          <TextField
            fullWidth
            size="small"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            disabled={!connected || agent.status !== 'running'}
          />
          <IconButton
            color="primary"
            onClick={sendMessage}
            disabled={!connected || agent.status !== 'running'}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Box>
    </Paper>
  );
}

export default AgentChat;