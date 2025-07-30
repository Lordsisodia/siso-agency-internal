import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Box,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

function AgentCard({ agent, selected, onSelect, onStart, onStop, onDelete }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'running':
        return 'success';
      case 'stopped':
        return 'default';
      case 'starting':
        return 'warning';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Card
      sx={{
        mb: 1,
        cursor: 'pointer',
        backgroundColor: selected ? 'action.selected' : undefined,
        '&:hover': {
          backgroundColor: 'action.hover',
        },
      }}
      onClick={onSelect}
    >
      <CardContent sx={{ pb: 1, '&:last-child': { pb: 1 } }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="subtitle1" component="div">
              {agent.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {agent.projectPath}
            </Typography>
          </Box>
          <Chip
            label={agent.status}
            color={getStatusColor(agent.status)}
            size="small"
          />
        </Box>
        
        <Box display="flex" alignItems="center" justifyContent="space-between" mt={1}>
          <Typography variant="caption" color="text.secondary">
            {agent.messageCount} messages
          </Typography>
          <Box>
            {agent.status === 'running' ? (
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onStop();
                }}
              >
                <StopIcon fontSize="small" />
              </IconButton>
            ) : (
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onStart();
                }}
              >
                <PlayIcon fontSize="small" />
              </IconButton>
            )}
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default AgentCard;