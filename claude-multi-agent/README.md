# Claude Multi-Agent System

A web-based UI for running multiple Claude Code agents concurrently on different projects. This system allows you to spawn multiple Claude instances, each working on different projects with different prompts simultaneously.

## Features

- **Multi-Agent Management**: Create and manage multiple Claude agents
- **Concurrent Execution**: Run multiple agents simultaneously on different projects
- **Real-time Communication**: WebSocket-based real-time updates from each agent
- **Project Selection**: Choose from existing Claude projects for each agent
- **Interactive Chat**: Send messages to running agents and see responses
- **Status Tracking**: Monitor the status of each agent (idle, starting, running, stopped, error)
- **Session Persistence**: Agents maintain their Claude session IDs for continuity

## Prerequisites

- Node.js v20 or higher
- Claude Code CLI installed and configured
- Existing Claude projects in `~/.claude/projects/`

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser to `http://localhost:3000`

## Usage

1. **Create an Agent**: Click the + button to create a new agent
   - Give it a name (e.g., "Frontend Agent", "Backend API")
   - Select a project from your Claude projects
   - Optionally provide an initial prompt

2. **Start the Agent**: Click the play button on the agent card to start it

3. **Interact**: Select an agent to view its chat and send messages

4. **Manage Multiple Agents**: Create multiple agents for different projects and run them concurrently

## Architecture

- **Backend**: Express server with WebSocket support for real-time communication
- **Frontend**: React with Material-UI for a modern, responsive interface
- **Agent Management**: Each agent runs its own Claude process with isolated state
- **Real-time Updates**: WebSocket connections provide live updates from each agent

## API Endpoints

- `GET /api/projects` - List available Claude projects
- `GET /api/agents` - List all agents
- `POST /api/agents` - Create a new agent
- `POST /api/agents/:id/start` - Start an agent
- `POST /api/agents/:id/stop` - Stop an agent
- `DELETE /api/agents/:id` - Delete an agent

## WebSocket Protocol

- `subscribe` - Subscribe to an agent's updates
- `unsubscribe` - Unsubscribe from an agent
- `input` - Send input to a running agent
- Messages include: `initial_state`, `message`, `status`, `session`

## Development

The project uses:
- Vite for fast frontend development
- Express for the backend API
- WebSockets for real-time communication
- Material-UI for the user interface

## Notes

- Each agent runs independently with its own Claude process
- Agents maintain their session IDs for conversation continuity
- The UI updates in real-time as agents process messages
- You can run as many agents as your system can handle