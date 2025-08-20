# Session Management Architecture Documentation

## Overview
This document explains how the left sidebar connects to all Claude sessions and manages real-time updates. This architecture can be replicated for future features requiring session management.

## Complete Data Flow

### 1. Backend Data Discovery (`server/projects.js`)

**Claude Projects Discovery:**
- Scans `~/.claude/projects/` directory for project folders
- Each project folder name encodes the actual project path (/ replaced with -)
- Extracts real project path from `.jsonl` files using `cwd` field
- Parses session data from JSONL conversation history

**Session Parsing Process:**
```javascript
// From parseJsonlSessions function
sessions.set(entry.sessionId, {
  id: entry.sessionId,
  summary: 'New Session',
  messageCount: 0,
  lastActivity: new Date(),
  cwd: entry.cwd || ''
});
```

**API Endpoints:**
- `GET /api/projects` - Returns all projects with first 5 sessions each
- `GET /api/projects/:projectName/sessions` - Returns paginated sessions for a project
- `GET /api/projects/:projectName/sessions/:sessionId/messages` - Returns messages for a session

### 2. Frontend State Management (`src/App.jsx`)

**Initial Data Loading:**
```javascript
const fetchProjects = async () => {
  const response = await api.projects();
  const data = await response.json();
  setProjects(data);
};
```

**State Structure:**
```javascript
const [projects, setProjects] = useState([]);
const [selectedProject, setSelectedProject] = useState(null);
const [selectedSession, setSelectedSession] = useState(null);
```

**Session Protection System:**
- Tracks active conversations to prevent WebSocket updates from interrupting chats
- Uses `activeSessions` Set to store session IDs currently in use
- Pauses project updates during active conversations

### 3. WebSocket Integration (`src/utils/websocket.js`)

**Real-time Updates:**
- Connects to WebSocket server with authentication token
- Receives `projects_updated` messages when sessions change
- Automatically reconnects on connection loss

**WebSocket Message Handling:**
```javascript
// In App.jsx useEffect
if (latestMessage.type === 'projects_updated') {
  // Session protection: skip updates during active conversations
  const hasActiveSession = (selectedSession && activeSessions.has(selectedSession.id));
  if (!hasActiveSession) {
    setProjects(latestMessage.projects);
  }
}
```

### 4. UI Components

**Sidebar Component (`src/components/Sidebar.jsx`):**
- Renders project list with nested session trees
- Handles project/session selection events
- Manages loading states and refresh functionality

**Data Flow in Sidebar:**
```javascript
// Receives projects data as props
<Sidebar
  projects={projects}
  selectedProject={selectedProject}
  selectedSession={selectedSession}
  onProjectSelect={handleProjectSelect}
  onSessionSelect={handleSessionSelect}
/>
```

**Session Selection Handler:**
```javascript
const handleSessionSelect = (session) => {
  setSelectedSession(session);
  navigate(`/session/${session.id}`);
};
```

## Session Navigation Flow

### URL-Based Session Loading
1. User clicks session in sidebar → `navigate(/session/:sessionId)`
2. App.jsx detects URL change via `useParams()`
3. Searches all projects for matching session ID
4. Sets selectedProject and selectedSession
5. ChatInterface loads with session data

### Session State Management
```javascript
// URL detection in App.jsx
useEffect(() => {
  if (sessionId && projects.length > 0) {
    for (const project of projects) {
      let session = project.sessions?.find(s => s.id === sessionId);
      if (session) {
        setSelectedProject(project);
        setSelectedSession(session);
        return;
      }
    }
  }
}, [sessionId, projects]);
```

## Session Protection System

### Purpose
Prevents automatic project updates from clearing chat messages during active conversations.

### Implementation
```javascript
// Mark session as active when user sends message
const markSessionAsActive = (sessionId) => {
  setActiveSessions(prev => new Set([...prev, sessionId]));
};

// Check for active sessions before applying updates
const hasActiveSession = selectedSession && activeSessions.has(selectedSession.id);
if (hasActiveSession) {
  // Skip updates that would modify existing selected session
  return;
}
```

### Lifecycle Management
1. **User sends message** → `markSessionAsActive(sessionId)`
2. **Conversation active** → WebSocket updates paused for that session
3. **Conversation completes** → `markSessionAsInactive(sessionId)`
4. **Updates resume** → Normal WebSocket update processing

## Data Optimization Patterns

### Object Reference Preservation
```javascript
// Only update state when data actually changes
setProjects(prevProjects => {
  const hasChanges = data.some((newProject, index) => {
    const prevProject = prevProjects[index];
    return newProject.name !== prevProject.name || 
           JSON.stringify(newProject.sessions) !== JSON.stringify(prevProject.sessions);
  });
  return hasChanges ? data : prevProjects;
});
```

### Performance Optimizations
- **Pagination**: Load only first 5 sessions per project initially
- **Caching**: Project directory extraction cached in memory
- **Early Exit**: Stop processing files when enough sessions found
- **Reference Equality**: Preserve object references to prevent unnecessary re-renders

## Replication Guide for Future Features

### 1. Data Layer Setup
```javascript
// Create API endpoint in server
export async function getYourData() {
  // Scan filesystem or database
  // Return structured data with IDs
}

// Add to API routes
app.get('/api/your-endpoint', async (req, res) => {
  const data = await getYourData();
  res.json(data);
});
```

### 2. Frontend State Management
```javascript
// Add to App.jsx state
const [yourData, setYourData] = useState([]);
const [selectedItem, setSelectedItem] = useState(null);

// Add fetch function
const fetchYourData = async () => {
  const response = await api.yourEndpoint();
  const data = await response.json();
  setYourData(data);
};
```

### 3. WebSocket Integration
```javascript
// Add message type to WebSocket handler
if (latestMessage.type === 'your_data_updated') {
  setYourData(latestMessage.data);
}
```

### 4. UI Component
```javascript
// Create component with navigation
function YourComponent({ data, selectedItem, onItemSelect }) {
  return (
    <div>
      {data.map(item => (
        <button 
          key={item.id}
          onClick={() => onItemSelect(item)}
          className={selectedItem?.id === item.id ? 'selected' : ''}
        >
          {item.name}
        </button>
      ))}
    </div>
  );
}
```

### 5. URL-Based Navigation
```javascript
// Add route
<Route path="/item/:itemId" element={<AppContent />} />

// Add URL detection
useEffect(() => {
  if (itemId && data.length > 0) {
    const item = data.find(d => d.id === itemId);
    if (item) {
      setSelectedItem(item);
    }
  }
}, [itemId, data]);
```

## Key Success Patterns

1. **Separation of Concerns**: API layer, state management, and UI clearly separated
2. **Real-time Updates**: WebSocket integration for live data synchronization
3. **URL Navigation**: Deep linking support for direct access to items
4. **Performance**: Optimization through caching, pagination, and reference preservation
5. **State Protection**: Prevent updates during active user interactions
6. **Error Handling**: Graceful degradation when data is unavailable

## Common Pitfalls to Avoid

1. **State Mutation**: Always use immutable updates with `setState`
2. **Unnecessary Re-renders**: Preserve object references when data hasn't changed
3. **Missing Protection**: Implement protection for active user interactions
4. **Poor Error Handling**: Handle missing files, network errors gracefully
5. **Infinite Loops**: Be careful with useEffect dependencies
6. **Memory Leaks**: Clean up WebSocket connections and timers

This architecture provides a robust foundation for any feature requiring real-time data management with user interaction protection.