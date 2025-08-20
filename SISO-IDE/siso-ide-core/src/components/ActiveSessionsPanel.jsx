import React from 'react';
import { 
  Play, 
  CheckCircle, 
  Pause, 
  AlertCircle, 
  Clock, 
  Plus, 
  X, 
  Zap,
  MessageSquare,
  Hash,
  Bot,
  User,
  Wrench,
  Timer
} from 'lucide-react';
import { cn } from '../lib/utils';


const StatusIcon = ({ status, className }) => {
  const configs = {
    idle: { 
      icon: Pause, 
      className: 'text-muted-foreground',
      bgClassName: 'bg-muted'
    },
    running: { 
      icon: Play, 
      className: 'text-green-400',
      bgClassName: 'bg-green-500/10'
    },
    completed: { 
      icon: CheckCircle, 
      className: 'text-blue-400',
      bgClassName: 'bg-blue-500/10'
    },
    error: { 
      icon: AlertCircle, 
      className: 'text-red-400',
      bgClassName: 'bg-red-500/10'
    }
  };
  
  const config = configs[status] || configs.idle;
  const Icon = config.icon;
  
  return (
    <div className={cn(
      'w-6 h-6 rounded-full flex items-center justify-center',
      config.bgClassName,
      className
    )}>
      <Icon className={cn('w-3 h-3', config.className)} />
    </div>
  );
};

const TabItem = ({ tab, isActive = false, onSelect, onClose }) => {
  return (
    <div 
      className={cn(
        'group relative rounded-lg border transition-all duration-200 cursor-pointer',
        'hover:border-border/60 hover:shadow-md hover:-translate-y-0.5',
        isActive 
          ? 'bg-gradient-to-br from-primary to-primary/90 text-primary-foreground border-primary/50 shadow-md shadow-primary/20' 
          : 'bg-black/95 text-white border-border/30 hover:bg-black'
      )}
      onClick={onSelect}
    >
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 min-w-0 flex-1">
            <div className={cn(
              'p-1.5 rounded-md flex-shrink-0',
              isActive 
                ? 'bg-primary-foreground/20' 
                : 'bg-white/10'
            )}>
              <StatusIcon status={tab.status} className="w-3 h-3" />
            </div>
            
            <div className="min-w-0 flex-1 space-y-2">
              {/* Title and Project */}
              <div>
                <h4 className={cn(
                  'font-medium text-sm leading-tight truncate',
                  isActive ? 'text-primary-foreground' : 'text-white'
                )}>
                  {tab.title}
                </h4>
                <div className={cn(
                  'text-xs truncate mt-0.5',
                  isActive ? 'text-primary-foreground/70' : 'text-gray-300'
                )}>
                  {tab.projectDisplayName || tab.projectId}
                </div>
              </div>
              
              {/* Compact Metrics Row */}
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1">
                  <User className={cn(
                    'w-3 h-3',
                    isActive ? 'text-primary-foreground/80' : 'text-blue-400'
                  )} />
                  <span className={cn(
                    'font-medium',
                    isActive ? 'text-primary-foreground' : 'text-white'
                  )}>
                    {tab.userMessageCount || 0}
                  </span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Bot className={cn(
                    'w-3 h-3',
                    isActive ? 'text-primary-foreground/80' : 'text-green-400'
                  )} />
                  <span className={cn(
                    'font-medium',
                    isActive ? 'text-primary-foreground' : 'text-white'
                  )}>
                    {tab.assistantMessageCount || 0}
                  </span>
                </div>
                
                {(tab.toolUseCount || 0) > 0 && (
                  <div className="flex items-center gap-1">
                    <Wrench className={cn(
                      'w-3 h-3',
                      isActive ? 'text-primary-foreground/80' : 'text-orange-400'
                    )} />
                    <span className={cn(
                      'font-medium',
                      isActive ? 'text-primary-foreground' : 'text-white'
                    )}>
                      {tab.toolUseCount}
                    </span>
                  </div>
                )}
                
                <div className="flex items-center gap-1 ml-auto">
                  <Hash className={cn(
                    'w-3 h-3',
                    isActive ? 'text-primary-foreground/80' : 'text-purple-400'
                  )} />
                  <span className={cn(
                    'font-medium',
                    isActive ? 'text-primary-foreground' : 'text-white'
                  )}>
                    {formatTokens(tab.totalTokens)}
                  </span>
                </div>
              </div>
              
              {/* Last Activity */}
              <div className={cn(
                'flex items-center gap-1 text-xs',
                isActive ? 'text-primary-foreground/60' : 'text-gray-400'
              )}>
                <Clock className="w-3 h-3" />
                <span>{tab.lastActivity}</span>
                {tab.duration > 0 && (
                  <>
                    <span className="mx-1">•</span>
                    <Timer className="w-3 h-3" />
                    <span>{formatDuration(tab.duration)}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <button 
            onClick={(e) => { 
              e.stopPropagation(); 
              onClose && onClose(); 
            }}
            className={cn(
              'opacity-0 group-hover:opacity-100 p-1 rounded-md transition-all duration-200 flex-shrink-0',
              'hover:bg-red-500/20 hover:text-red-400',
              isActive && 'text-primary-foreground/70 hover:bg-primary-foreground/20 hover:text-primary-foreground'
            )}
            title="Close session"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper function to format time ago
const formatTimeAgo = (timestamp) => {
  if (!timestamp) return 'unknown';
  const now = Date.now();
  const time = new Date(timestamp).getTime();
  const diff = now - time;
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return 'now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

// Helper function to format duration
const formatDuration = (ms) => {
  if (!ms || ms < 1000) return '< 1m';
  
  const minutes = Math.floor(ms / 60000);
  const hours = Math.floor(ms / 3600000);
  const days = Math.floor(ms / 86400000);
  
  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  return `${minutes}m`;
};

// Helper function to format token count
const formatTokens = (count) => {
  if (!count || count < 1000) return count?.toString() || '0';
  if (count < 1000000) return `${(count / 1000).toFixed(1)}K`;
  return `${(count / 1000000).toFixed(1)}M`;
};

const ActiveSessionsPanel = ({ 
  isVisible = true,
  maxTabs = 12,
  onToggleVisibility,
  projects = [],
  selectedSession,
  onSessionSelect,
  showHeader = true // New prop to control header display
}) => {
  const [activeTabId, setActiveTabId] = React.useState(selectedSession?.id || null);
  
  if (!isVisible) {
    return null;
  }

  // Get all sessions from all projects and sort by most recent
  const allSessions = projects.flatMap(project => {
    const claudeSessions = (project.sessions || []).map(session => ({
      // Core session properties (keep original session structure)
      ...session,
      // Display properties for the cards
      title: session.summary || session.name || 'Untitled Session',
      projectId: project.name,
      projectDisplayName: project.displayName || project.name,
      status: 'completed', // Could be enhanced with real status
      lastActivity: formatTimeAgo(session.lastActivity || session.updated_at || session.created_at),
      messageCount: session.messageCount || session.messages?.length || 0,
      userMessageCount: session.userMessageCount || 0,
      assistantMessageCount: session.assistantMessageCount || 0,
      toolUseCount: session.toolUseCount || 0,
      totalTokens: session.totalTokens || 0,
      duration: session.duration || 0,
      __provider: 'claude', // Important: Add provider info for routing
      timestamp: new Date(session.lastActivity || session.updated_at || session.created_at).getTime()
    }));
    
    return claudeSessions;
  })
  .sort((a, b) => b.timestamp - a.timestamp) // Sort by most recent first
  .slice(0, maxTabs); // Limit to maxTabs

  const handleNewTab = () => {
    // Navigate to new session - could integrate with existing new session logic
    if (onSessionSelect) {
      onSessionSelect(null); // null means new session
    }
  };

  const handleTabSelect = (session) => {
    setActiveTabId(session.id);
    if (onSessionSelect) {
      onSessionSelect(session);
    }
  };

  const handleTabClose = (sessionId) => {
    // Could implement session deletion here
    console.log('Close session:', sessionId);
  };

  return (
    <div className={cn(
      "flex-shrink-0 flex flex-col",
      showHeader 
        ? "w-80 bg-gradient-to-b from-card to-card/95 border-l border-border/50 shadow-lg" 
        : "w-full h-full"
    )}>
      {/* Header */}
      {showHeader && (
        <div className="p-5 border-b border-border/50 bg-gradient-to-r from-muted/30 to-muted/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                Recent Sessions
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <MessageSquare className="w-3 h-3" />
                <span className="font-medium">{allSessions.length} sessions</span>
              </div>
            </div>
          </div>
          <button
            onClick={onToggleVisibility}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-200 hover:scale-105"
            title="Hide panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <button 
          onClick={handleNewTab}
          disabled={allSessions.length >= maxTabs}
          className={cn(
            'w-full inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200',
            'h-10 px-4 py-2 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg hover:shadow-xl hover:scale-[1.02]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2',
            'disabled:pointer-events-none disabled:opacity-50 disabled:scale-100'
          )}
        >
          <Plus className="w-4 h-4" />
          New Session
        </button>
        
        <div className="text-xs text-muted-foreground mt-3 text-center font-medium">
          Showing {allSessions.length} recent sessions
        </div>
        </div>
      )}
      
      {/* Sessions Tab List */}
      <div className="flex-1 p-3 space-y-2 overflow-y-auto min-h-0" style={{ 
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(255, 255, 255, 0.3) transparent'
      }}>
        {allSessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-muted/50 to-muted/30 rounded-xl flex items-center justify-center mb-3 border border-border/30">
              <MessageSquare className="w-6 h-6 text-muted-foreground" />
            </div>
            <h4 className="text-sm font-medium text-foreground mb-2">No recent sessions</h4>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-40 text-center">
              Start a conversation to see your recent sessions appear here
            </p>
          </div>
        ) : (
          allSessions.map(session => (
            <TabItem
              key={session.id}
              tab={session}
              isActive={session.id === activeTabId}
              onSelect={() => handleTabSelect(session)}
              onClose={() => handleTabClose(session.id)}
            />
          ))
        )}
      </div>
      
    </div>
  );
};

export default ActiveSessionsPanel;