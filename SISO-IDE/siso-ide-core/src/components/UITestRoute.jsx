import React, { useState } from 'react';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { MessageSquare, Clock, Search, Settings, RefreshCw, FolderPlus, BarChart3, Star, Trash2, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';
import ClaudeLogo from './ClaudeLogo';
import CursorLogo from './CursorLogo.jsx';

// Sample data for testing
const sampleProjects = [
  { id: 'a', name: 'Project A', displayName: 'Auth System' },
  { id: 'b', name: 'Project B', displayName: 'API Backend' },
  { id: 'c', name: 'Project C', displayName: 'Frontend UI' }
];

const sampleSessions = {
  a: [
    { id: 1, name: 'Feature Development', lastActivity: '5m ago', provider: 'claude', status: 'active', preview: 'Let\'s implement the user auth system with OAuth 2.0. I need help with the JWT token validation and refresh logic...', messages: 12 },
    { id: 2, name: 'API Integration', lastActivity: '2h ago', provider: 'claude', status: 'recent', preview: 'Working on the REST endpoints for user management...', messages: 8 },
    { id: 3, name: 'Code Review', lastActivity: '4h ago', provider: 'claude', status: 'recent', preview: 'This function looks good but needs some optimization...', messages: 15 }
  ],
  b: [
    { id: 4, name: 'Bug Investigation', lastActivity: '10m ago', provider: 'cursor', status: 'active', preview: 'Found a critical issue in the API endpoint that\'s causing random timeouts...', messages: 6 },
    { id: 5, name: 'Database Design', lastActivity: '6h ago', provider: 'claude', status: 'recent', preview: 'The current schema needs optimization for better performance...', messages: 11 }
  ],
  c: [
    { id: 6, name: 'UI Components', lastActivity: '1h ago', provider: 'cursor', status: 'recent', preview: 'Creating reusable components for the dashboard...', messages: 9 },
    { id: 7, name: 'Responsive Design', lastActivity: '8h ago', provider: 'claude', status: 'recent', preview: 'Making the interface work on mobile devices...', messages: 14 }
  ]
};

const UITestRoute = () => {
  const [selectedOption, setSelectedOption] = useState('streamA');
  const [selectedProject, setSelectedProject] = useState('a');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [streamView, setStreamView] = useState('chats'); // 'chats' or 'projects'

  const getCurrentSessions = () => {
    if (selectedProject === 'all') {
      return Object.values(sampleSessions).flat();
    }
    return sampleSessions[selectedProject] || [];
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return '🟢';
      case 'recent': return '🟡';
      default: return '⚫';
    }
  };

  const getProviderIcon = (provider) => {
    return provider === 'claude' ? <ClaudeLogo className="w-3 h-3" /> : <CursorLogo className="w-3 h-3" />;
  };

  const getAllSessionsFromAllProjects = () => {
    return Object.entries(sampleSessions).flatMap(([projectId, sessions]) => 
      sessions.map(session => ({
        ...session,
        projectId,
        projectName: sampleProjects.find(p => p.id === projectId)?.displayName || 'Unknown'
      }))
    ).sort((a, b) => {
      // Sort by status first (active -> recent -> older), then by time
      const statusOrder = { active: 0, recent: 1, older: 2 };
      const aStatus = statusOrder[a.status] || 2;
      const bStatus = statusOrder[b.status] || 2;
      if (aStatus !== bStatus) return aStatus - bStatus;
      
      // Parse time for sorting (simplified)
      const parseTime = (time) => {
        if (time.includes('m ago')) return parseInt(time);
        if (time.includes('h ago')) return parseInt(time) * 60;
        return 1000; // older items
      };
      return parseTime(a.lastActivity) - parseTime(b.lastActivity);
    });
  };

  // New Two-Stream Approach Options
  const StreamA_UnifiedChatTimeline = () => (
    <div className="h-full flex flex-col bg-card">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">SISO</h1>
              <p className="text-xs text-muted-foreground">Two-Stream: Unified Chat Timeline</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="h-8 w-8 px-0"><BarChart3 className="w-4 h-4" /></Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 px-0"><Settings className="w-4 h-4" /></Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 px-0"><RefreshCw className="w-4 h-4" /></Button>
            <Button size="sm" className="h-8 w-8 px-0"><FolderPlus className="w-4 h-4" /></Button>
          </div>
        </div>

        {/* Stream Toggle */}
        <div className="flex items-center gap-1 mb-4 bg-muted p-1 rounded-lg">
          <button
            onClick={() => setStreamView('chats')}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all",
              streamView === 'chats'
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            💬 Chats
          </button>
          <button
            onClick={() => setStreamView('projects')}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all",
              streamView === 'projects'
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            📁 Projects
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={streamView === 'chats' ? "Search all conversations..." : "Search projects..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" className="h-9 text-xs">🏷️All</Button>
            <Button variant="outline" size="sm" className="h-9 text-xs">📅Today</Button>
            <Button variant="outline" size="sm" className="h-9 text-xs">⭐Starred</Button>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        {streamView === 'chats' ? (
          <div className="space-y-4">
            {/* Active Now */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                🟢 Active Now
              </h3>
              {getAllSessionsFromAllProjects().filter(s => s.status === 'active').map(session => (
                <div key={session.id} className="p-3 bg-green-50/50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg mb-2">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🟢</span>
                      <h4 className="font-semibold text-foreground">{session.name}</h4>
                      <span className="text-xs text-muted-foreground">{session.lastActivity}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {getProviderIcon(session.provider)}
                      <span className="text-xs bg-muted px-1 rounded">[{session.provider === 'claude' ? 'C' : 'Cu'}]</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">"{session.preview}"</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">📁 {session.projectName}</span>
                    <Button size="sm" className="h-7">Continue →</Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Earlier Today */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">🟡 Earlier Today</h3>
              {getAllSessionsFromAllProjects().filter(s => s.status === 'recent').map(session => (
                <div key={session.id} className="flex items-center gap-3 p-3 hover:bg-accent rounded-lg cursor-pointer transition-colors group">
                  <span className="text-lg">🟡</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-foreground">{session.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{session.lastActivity}</span>
                        {getProviderIcon(session.provider)}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">"{session.preview.substring(0, 60)}..."</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">📁 {session.projectName}</span>
                      <Button size="sm" variant="ghost" className="h-6 opacity-0 group-hover:opacity-100 transition-opacity">
                        Continue →
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Projects View */
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">⭐ Starred Projects</h3>
              {sampleProjects.slice(0, 2).map(project => {
                const projectSessions = sampleSessions[project.id] || [];
                const lastSession = projectSessions[0];
                const activeCount = projectSessions.filter(s => s.status === 'active').length;
                return (
                  <div key={project.id} className="p-3 bg-yellow-50/50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg mb-2">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">📁</span>
                        <h4 className="font-semibold text-foreground">{project.displayName}</h4>
                        <Badge variant="secondary" className="text-xs">
                          {activeCount > 0 ? `🟢 Active` : `🟡 ${lastSession?.lastActivity}`} • {projectSessions.length} chats
                        </Badge>
                      </div>
                    </div>
                    {lastSession && (
                      <div className="text-sm text-muted-foreground">
                        Last: {lastSession.name} - {lastSession.lastActivity} {getProviderIcon(lastSession.provider)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">📅 Active Today</h3>
              {sampleProjects.slice(2).map(project => {
                const projectSessions = sampleSessions[project.id] || [];
                const lastSession = projectSessions[0];
                return (
                  <div key={project.id} className="flex items-center gap-3 p-3 hover:bg-accent rounded-lg cursor-pointer transition-colors">
                    <span className="text-lg">📁</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-foreground">{project.displayName}</span>
                        <Badge variant="outline" className="text-xs">
                          {lastSession?.lastActivity} • {projectSessions.length} chats
                        </Badge>
                      </div>
                      {lastSession && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Last: {lastSession.name} {getProviderIcon(lastSession.provider)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  );

  const Option2 = () => (
    <div className="h-full flex flex-col bg-card">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">SISO</h1>
              <p className="text-xs text-muted-foreground">Option 2: Project Pills</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="h-8 w-8 px-0"><BarChart3 className="w-4 h-4" /></Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 px-0"><Settings className="w-4 h-4" /></Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 px-0"><RefreshCw className="w-4 h-4" /></Button>
            <Button size="sm" className="h-8 w-8 px-0"><FolderPlus className="w-4 h-4" /></Button>
          </div>
        </div>

        {/* Project Pills */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm text-muted-foreground">Projects:</span>
          {sampleProjects.map(project => (
            <button
              key={project.id}
              onClick={() => setSelectedProject(project.id)}
              className={cn(
                "px-3 py-1 rounded-full text-sm font-medium transition-all duration-200",
                selectedProject === project.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
              )}
            >
              {project.displayName}
            </button>
          ))}
          <button
            onClick={() => setSelectedProject('all')}
            className={cn(
              "px-3 py-1 rounded-full text-sm font-medium transition-all duration-200",
              selectedProject === 'all'
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
            )}
          >
            All
          </button>
          <button className="w-6 h-6 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center">
            <span className="text-muted-foreground text-sm">+</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search all conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
      </div>

      {/* Sessions */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">🟢 Active Sessions</h3>
            {getCurrentSessions().filter(s => s.status === 'active').map(session => (
              <div key={session.id} className="p-3 bg-card border border-border rounded-lg hover:border-primary/50 transition-all cursor-pointer group">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-foreground">{session.name}</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{session.lastActivity}</span>
                    {getProviderIcon(session.provider)}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{session.preview}</p>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-xs">{session.messages} messages</Badge>
                  <Button size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                    Continue →
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">🟡 Recent (Today)</h3>
            {getCurrentSessions().filter(s => s.status === 'recent').map(session => (
              <div key={session.id} className="flex items-center gap-3 p-2 hover:bg-accent rounded-lg cursor-pointer transition-colors">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{session.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{session.lastActivity}</span>
                      {getProviderIcon(session.provider)}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{session.preview}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  );

  const Option3 = () => (
    <div className="h-full flex flex-col bg-card">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">SISO</h1>
              <p className="text-xs text-muted-foreground">Option 3: Active Conversations</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="h-8 w-8 px-0"><BarChart3 className="w-4 h-4" /></Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 px-0"><Settings className="w-4 h-4" /></Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 px-0"><RefreshCw className="w-4 h-4" /></Button>
            <Button size="sm" className="h-8 w-8 px-0"><FolderPlus className="w-4 h-4" /></Button>
          </div>
        </div>

        <div className="flex gap-3">
          {/* Project Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
            >
              <span className="text-sm">📁 All Projects</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            {dropdownOpen && (
              <div className="absolute top-full left-0 mt-1 bg-popover border border-border rounded-lg shadow-md z-10 min-w-[200px]">
                <div className="p-1">
                  <div className="px-3 py-2 text-xs text-muted-foreground">Select Project</div>
                  <button className="w-full text-left px-3 py-2 hover:bg-accent rounded text-sm">✓ All Projects (20 chats)</button>
                  {sampleProjects.map(project => (
                    <button key={project.id} className="w-full text-left px-3 py-2 hover:bg-accent rounded text-sm">
                      {project.displayName} ({sampleSessions[project.id]?.length || 0} chats)
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search chats..." className="pl-9 h-9" />
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {/* Active Conversations Highlight */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
              🔥 ACTIVE CONVERSATIONS
            </h3>
            <div className="space-y-2">
              <div className="font-medium">🟢 Working on auth system - 5m ago</div>
              <div className="text-sm text-muted-foreground">Project A • "Let's add OAuth integration and set up the JWT middleware properly..."</div>
              <div className="text-xs text-muted-foreground mb-3">👤 You were actively discussing token refresh logic</div>
              <Button className="w-full bg-green-600 hover:bg-green-700">⚡ Continue This Conversation</Button>
            </div>
          </div>

          {/* Today's Chats */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">📅 Today's Chats</h3>
            <div className="space-y-2">
              {getCurrentSessions().map(session => (
                <div key={session.id} className="flex items-center gap-3 p-3 hover:bg-accent rounded-lg cursor-pointer transition-colors">
                  <div className="w-2">{getStatusIcon(session.status)}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{session.name} - {session.lastActivity}</span>
                      <div className="flex items-center gap-1">
                        {getProviderIcon(session.provider)}
                        <span className="text-xs bg-muted px-1 rounded">[{session.provider === 'claude' ? 'C' : 'Cu'}]</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">💬 "{session.preview.substring(0, 60)}..."</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );

  const Option4 = () => (
    <div className="h-full flex flex-col bg-card">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">SISO</h1>
              <p className="text-xs text-muted-foreground">Option 4: Rich Chat Cards</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="h-8 w-8 px-0"><BarChart3 className="w-4 h-4" /></Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 px-0"><Settings className="w-4 h-4" /></Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 px-0"><RefreshCw className="w-4 h-4" /></Button>
            <Button size="sm" className="h-8 w-8 px-0"><FolderPlus className="w-4 h-4" /></Button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Minimal Project Icons */}
          {sampleProjects.map(project => (
            <button
              key={project.id}
              onClick={() => setSelectedProject(project.id)}
              className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium transition-all",
                selectedProject === project.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80 text-muted-foreground"
              )}
              title={project.displayName}
            >
              📂
            </button>
          ))}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search conversations..." className="pl-9 h-9" />
            </div>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {getCurrentSessions().map(session => (
            <div key={session.id} className={cn(
              "p-4 border rounded-lg hover:shadow-md transition-all cursor-pointer group",
              session.status === 'active' 
                ? "border-green-300 bg-green-50/50 dark:border-green-800 dark:bg-green-900/20" 
                : "border-border hover:border-primary/50"
            )}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getStatusIcon(session.status)}</span>
                  <h3 className="font-semibold text-foreground">{session.name}</h3>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{session.lastActivity}</span>
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground mb-3">
                Project {selectedProject.toUpperCase()} • {session.provider === 'claude' ? 'Claude' : 'Cursor'} • {session.messages} messages
              </div>
              
              <div className="text-sm text-foreground mb-4 leading-relaxed">
                💬 "{session.preview}"
              </div>
              
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button size="sm" className="flex-1">
                  🔄 Continue
                </Button>
                <Button size="sm" variant="outline">
                  🗑️ Delete
                </Button>
                <Button size="sm" variant="outline">
                  ⭐ Star
                </Button>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );

  return (
    <div className="h-screen bg-background">
      {/* Option Selector */}
      <div className="border-b border-border bg-muted/30 p-4">
        <h2 className="text-lg font-semibold mb-3">UI Design Options - Interactive Demo</h2>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={selectedOption === 'streamA' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedOption('streamA')}
          >
            🚀 Two-Stream: Chat/Project Toggle
          </Button>
          <Button
            variant={selectedOption === 'option2' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedOption('option2')}
          >
            Option 2: Project Pills
          </Button>
          <Button
            variant={selectedOption === 'option3' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedOption('option3')}
          >
            Option 3: Active Conversations
          </Button>
          <Button
            variant={selectedOption === 'option4' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedOption('option4')}
          >
            Option 4: Rich Chat Cards
          </Button>
        </div>
      </div>

      {/* Demo Area */}
      <div className="h-[calc(100vh-120px)]">
        {selectedOption === 'streamA' && <StreamA_UnifiedChatTimeline />}
        {selectedOption === 'option2' && <Option2 />}
        {selectedOption === 'option3' && <Option3 />}
        {selectedOption === 'option4' && <Option4 />}
      </div>
    </div>
  );
};

export default UITestRoute;