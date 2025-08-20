import React, { useState, useEffect } from 'react';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';

import { FolderOpen, Folder, Plus, Clock, ChevronDown, ChevronRight, Edit3, Check, X, Trash2, RefreshCw, Edit2, Star } from 'lucide-react';
import { cn } from '../lib/utils';
import ClaudeLogo from './ClaudeLogo';
import CursorLogo from './CursorLogo.jsx';
import { api } from '../utils/api';

// Move formatTimeAgo outside component to avoid recreation on every render
const formatTimeAgo = (dateString, currentTime) => {
  const date = new Date(dateString);
  const now = currentTime;
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    return 'Unknown';
  }
  
  const diffInMs = now - date;
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInMinutes === 1) return '1 min ago';
  if (diffInMinutes < 60) return `${diffInMinutes} mins ago`;
  if (diffInHours === 1) return '1 hour ago';
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  if (diffInDays === 1) return '1 day ago';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  return date.toLocaleDateString();
};

function SessionsView({ 
  projects, 
  selectedProject, 
  selectedSession, 
  onProjectSelect, 
  onSessionSelect, 
  onNewSession,
  onSessionDelete,
  onProjectDelete,
  isLoading,
  onRefresh,
  searchFilter
}) {
  const [expandedProjects, setExpandedProjects] = useState(new Set());
  const [editingProject, setEditingProject] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [additionalSessions, setAdditionalSessions] = useState({});
  const [initialSessionsLoaded, setInitialSessionsLoaded] = useState(new Set());
  const [currentTime, setCurrentTime] = useState(new Date());
  const [projectSortOrder, setProjectSortOrder] = useState('name');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [editingSessionName, setEditingSessionName] = useState('');
  const [generatingSummary, setGeneratingSummary] = useState({});
  const [loadingSessions, setLoadingSessions] = useState({});
  
  // Starred projects state - persisted in localStorage
  const [starredProjects, setStarredProjects] = useState(() => {
    try {
      const saved = localStorage.getItem('starredProjects');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch (error) {
      console.error('Error loading starred projects:', error);
      return new Set();
    }
  });

  // Touch handler to prevent double-tap issues on iPad (only for buttons, not scroll areas)
  const handleTouchClick = (callback) => {
    return (e) => {
      // Only prevent default for buttons/clickable elements, not scrollable areas
      if (e.target.closest('.overflow-y-auto') || e.target.closest('[data-scroll-container]')) {
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      callback();
    };
  };

  // Auto-update timestamps every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every 60 seconds

    return () => clearInterval(timer);
  }, []);

  // Clear additional sessions when projects list changes (e.g., after refresh)
  useEffect(() => {
    setAdditionalSessions({});
    setInitialSessionsLoaded(new Set());
  }, [projects]);

  // Auto-expand project folder when a session is selected
  useEffect(() => {
    if (selectedSession && selectedProject) {
      setExpandedProjects(prev => new Set([...prev, selectedProject.name]));
    }
  }, [selectedSession, selectedProject]);

  // Mark sessions as loaded when projects come in
  useEffect(() => {
    if (projects.length > 0 && !isLoading) {
      const newLoaded = new Set();
      projects.forEach(project => {
        if (project.sessions && project.sessions.length >= 0) {
          newLoaded.add(project.name);
        }
      });
      setInitialSessionsLoaded(newLoaded);
    }
  }, [projects, isLoading]);

  // Load project sort order from settings
  useEffect(() => {
    const loadSortOrder = () => {
      try {
        const savedSettings = localStorage.getItem('claude-tools-settings');
        if (savedSettings) {
          const settings = JSON.parse(savedSettings);
          setProjectSortOrder(settings.projectSortOrder || 'name');
        }
      } catch (error) {
        console.error('Error loading sort order:', error);
      }
    };

    // Load initially
    loadSortOrder();

    // Listen for storage changes
    const handleStorageChange = (e) => {
      if (e.key === 'claude-tools-settings') {
        loadSortOrder();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also check periodically when component is focused (for same-tab changes)
    const checkInterval = setInterval(() => {
      if (document.hasFocus()) {
        loadSortOrder();
      }
    }, 1000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(checkInterval);
    };
  }, []);

  const toggleProject = (projectName) => {
    const newExpanded = new Set(expandedProjects);
    if (newExpanded.has(projectName)) {
      newExpanded.delete(projectName);
    } else {
      newExpanded.add(projectName);
    }
    setExpandedProjects(newExpanded);
  };

  // Starred projects utility functions
  const toggleStarProject = (projectName) => {
    const newStarred = new Set(starredProjects);
    if (newStarred.has(projectName)) {
      newStarred.delete(projectName);
    } else {
      newStarred.add(projectName);
    }
    setStarredProjects(newStarred);
    
    // Persist to localStorage
    try {
      localStorage.setItem('starredProjects', JSON.stringify([...newStarred]));
    } catch (error) {
      console.error('Error saving starred projects:', error);
    }
  };

  const isProjectStarred = (projectName) => {
    return starredProjects.has(projectName);
  };

  // Helper function to get all sessions for a project (initial + additional)
  const getAllSessions = (project) => {
    // Combine Claude and Cursor sessions; Sidebar will display icon per row
    const claudeSessions = [...(project.sessions || []), ...(additionalSessions[project.name] || [])].map(s => ({ ...s, __provider: 'claude' }));
    const cursorSessions = (project.cursorSessions || []).map(s => ({ ...s, __provider: 'cursor' }));
    // Sort by most recent activity/date
    const normalizeDate = (s) => new Date(s.__provider === 'cursor' ? s.createdAt : s.lastActivity);
    return [...claudeSessions, ...cursorSessions].sort((a, b) => normalizeDate(b) - normalizeDate(a));
  };

  // Helper function to get the last activity date for a project
  const getProjectLastActivity = (project) => {
    const allSessions = getAllSessions(project);
    if (allSessions.length === 0) {
      return new Date(0); // Return epoch date for projects with no sessions
    }
    
    // Find the most recent session activity
    const mostRecentDate = allSessions.reduce((latest, session) => {
      const sessionDate = new Date(session.lastActivity);
      return sessionDate > latest ? sessionDate : latest;
    }, new Date(0));
    
    return mostRecentDate;
  };

  // Combined sorting: starred projects first, then by selected order
  const sortedProjects = [...projects].sort((a, b) => {
    const aStarred = isProjectStarred(a.name);
    const bStarred = isProjectStarred(b.name);
    
    // First, sort by starred status
    if (aStarred && !bStarred) return -1;
    if (!aStarred && bStarred) return 1;
    
    // For projects with same starred status, sort by selected order
    if (projectSortOrder === 'date') {
      // Sort by most recent activity (descending)
      return getProjectLastActivity(b) - getProjectLastActivity(a);
    } else {
      // Sort by display name (user-defined) or fallback to name (ascending)
      const nameA = a.displayName || a.name;
      const nameB = b.displayName || b.name;
      return nameA.localeCompare(nameB);
    }
  });

  const startEditing = (project) => {
    setEditingProject(project.name);
    setEditingName(project.displayName);
  };

  const cancelEditing = () => {
    setEditingProject(null);
    setEditingName('');
  };

  const saveProjectName = async (projectName) => {
    try {
      const response = await api.renameProject(projectName, editingName);

      if (response.ok) {
        // Refresh projects to get updated data
        if (window.refreshProjects) {
          window.refreshProjects();
        } else {
          window.location.reload();
        }
      } else {
        console.error('Failed to rename project');
      }
    } catch (error) {
      console.error('Error renaming project:', error);
    }
    
    setEditingProject(null);
    setEditingName('');
  };

  const deleteSession = async (projectName, sessionId) => {
    if (!confirm('Are you sure you want to delete this session? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await api.deleteSession(projectName, sessionId);

      if (response.ok) {
        // Call parent callback if provided
        if (onSessionDelete) {
          onSessionDelete(sessionId);
        }
      } else {
        console.error('Failed to delete session');
        alert('Failed to delete session. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting session:', error);
      alert('Error deleting session. Please try again.');
    }
  };

  const deleteProject = async (projectName) => {
    if (!confirm('Are you sure you want to delete this empty project? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await api.deleteProject(projectName);

      if (response.ok) {
        // Call parent callback if provided
        if (onProjectDelete) {
          onProjectDelete(projectName);
        }
      } else {
        const error = await response.json();
        console.error('Failed to delete project');
        alert(error.error || 'Failed to delete project. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Error deleting project. Please try again.');
    }
  };

  const loadMoreSessions = async (project) => {
    // Check if we can load more sessions
    const canLoadMore = project.sessionMeta?.hasMore !== false;
    
    if (!canLoadMore || loadingSessions[project.name]) {
      return;
    }

    setLoadingSessions(prev => ({ ...prev, [project.name]: true }));

    try {
      const currentSessionCount = (project.sessions?.length || 0) + (additionalSessions[project.name]?.length || 0);
      const response = await api.sessions(project.name, 5, currentSessionCount);
      
      if (response.ok) {
        const result = await response.json();
        
        // Store additional sessions locally
        setAdditionalSessions(prev => ({
          ...prev,
          [project.name]: [
            ...(prev[project.name] || []),
            ...result.sessions
          ]
        }));
        
        // Update project metadata if needed
        if (result.hasMore === false) {
          // Mark that there are no more sessions to load
          project.sessionMeta = { ...project.sessionMeta, hasMore: false };
        }
      }
    } catch (error) {
      console.error('Error loading more sessions:', error);
    } finally {
      setLoadingSessions(prev => ({ ...prev, [project.name]: false }));
    }
  };

  // Filter projects based on search input
  const filteredProjects = sortedProjects.filter(project => {
    if (!searchFilter.trim()) return true;
    
    const searchLower = searchFilter.toLowerCase();
    const displayName = (project.displayName || project.name).toLowerCase();
    const projectName = project.name.toLowerCase();
    
    // Search in both display name and actual project name/path
    return displayName.includes(searchLower) || projectName.includes(searchLower);
  });

  return (
    <ScrollArea className="flex-1 px-3 py-4 overflow-y-auto overscroll-contain">
      <div className="space-y-2 pb-safe-area-inset-bottom">
        {isLoading ? (
          <div className="text-center py-12 px-4">
            <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
              <div className="w-6 h-6 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
            </div>
            <h3 className="text-base font-medium text-foreground mb-2">Loading projects...</h3>
            <p className="text-sm text-muted-foreground">
              Fetching your Claude projects and sessions
            </p>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
              <Folder className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="text-base font-medium text-foreground mb-2">No projects found</h3>
            <p className="text-sm text-muted-foreground">
              Run Claude CLI in a project directory to get started
            </p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-base font-medium text-foreground mb-2">No matching projects</h3>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search term
            </p>
          </div>
        ) : (
          filteredProjects.map((project) => {
            const isExpanded = expandedProjects.has(project.name);
            const isSelected = selectedProject?.name === project.name;
            const isStarred = isProjectStarred(project.name);
            
            return (
              <div key={project.name} className="space-y-1">
                {/* Project Header */}
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-between p-3 h-auto font-normal hover:bg-accent/50 rounded-lg border border-transparent hover:border-border/30 transition-all duration-200",
                    isSelected && "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/50 shadow-sm",
                    isStarred && !isSelected && "bg-accent/30 dark:bg-accent/20 hover:bg-accent/50 dark:hover:bg-accent/40"
                  )}
                  onClick={() => {
                    // Desktop behavior: select project and toggle
                    if (selectedProject?.name !== project.name) {
                      onProjectSelect(project);
                    }
                    toggleProject(project.name);
                  }}
                  onTouchEnd={handleTouchClick(() => {
                    if (selectedProject?.name !== project.name) {
                      onProjectSelect(project);
                    }
                    toggleProject(project.name);
                  })}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {isExpanded ? (
                      <FolderOpen className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    ) : (
                      <Folder className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    )}
                    <div className="min-w-0 flex-1 text-left">
                      {editingProject === project.name ? (
                        <div className="space-y-1">
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-border rounded bg-background text-foreground focus:ring-2 focus:ring-blue-500/20"
                            placeholder="Project name"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveProjectName(project.name);
                              if (e.key === 'Escape') cancelEditing();
                            }}
                          />
                          <div className="text-xs text-muted-foreground truncate" title={project.fullPath}>
                            {project.fullPath}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="text-sm font-semibold truncate text-foreground" title={project.displayName}>
                            {project.displayName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {(() => {
                              const sessionCount = getAllSessions(project).length;
                              const hasMore = project.sessionMeta?.hasMore !== false;
                              return hasMore && sessionCount >= 5 ? `${sessionCount}+` : sessionCount;
                            })()}
                            {project.fullPath !== project.displayName && (
                              <span className="ml-1 opacity-60" title={project.fullPath}>
                                • {project.fullPath.length > 25 ? '...' + project.fullPath.slice(-22) : project.fullPath}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {editingProject === project.name ? (
                      <>
                        <div
                          className="w-6 h-6 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 flex items-center justify-center rounded cursor-pointer transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            saveProjectName(project.name);
                          }}
                        >
                          <Check className="w-3 h-3" />
                        </div>
                        <div
                          className="w-6 h-6 text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-center rounded cursor-pointer transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            cancelEditing();
                          }}
                        >
                          <X className="w-3 h-3" />
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Star button */}
                        <div
                          className={cn(
                            "w-6 h-6 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center rounded cursor-pointer touch:opacity-100",
                            isStarred 
                              ? "hover:bg-accent/80 dark:hover:bg-accent/60 opacity-100" 
                              : "hover:bg-accent"
                          )}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleStarProject(project.name);
                          }}
                          title={isStarred ? "Remove from favorites" : "Add to favorites"}
                        >
                          <Star className={cn(
                            "w-3 h-3 transition-colors",
                            isStarred 
                              ? "text-blue-600 dark:text-blue-400 fill-current" 
                              : "text-muted-foreground"
                          )} />
                        </div>
                        <div
                          className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-accent flex items-center justify-center rounded cursor-pointer touch:opacity-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditing(project);
                          }}
                          title="Rename project (F2)"
                        >
                          <Edit3 className="w-3 h-3" />
                        </div>
                        {getAllSessions(project).length === 0 && (
                          <div
                            className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center justify-center rounded cursor-pointer touch:opacity-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteProject(project.name);
                            }}
                            title="Delete empty project (Delete)"
                          >
                            <Trash2 className="w-3 h-3 text-red-600 dark:text-red-400" />
                          </div>
                        )}
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                        )}
                      </>
                    )}
                  </div>
                </Button>

                {/* Sessions List */}
                {isExpanded && (
                  <div className="ml-3 space-y-1 border-l border-border pl-3">
                    {!initialSessionsLoaded.has(project.name) ? (
                      // Loading skeleton for sessions
                      Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="p-2 rounded-md">
                          <div className="flex items-start gap-2">
                            <div className="w-3 h-3 bg-muted rounded-full animate-pulse mt-0.5" />
                            <div className="flex-1 space-y-1">
                              <div className="h-3 bg-muted rounded animate-pulse" style={{ width: `${60 + i * 15}%` }} />
                              <div className="h-2 bg-muted rounded animate-pulse w-1/2" />
                            </div>
                          </div>
                        </div>
                      ))
                    ) : getAllSessions(project).length === 0 && !loadingSessions[project.name] ? (
                      <div className="py-2 px-3 text-left">
                        <p className="text-xs text-muted-foreground">No sessions yet</p>
                      </div>
                    ) : (
                      getAllSessions(project).map((session) => {
                        // Handle both Claude and Cursor session formats
                        const isCursorSession = session.__provider === 'cursor';
                        
                        // Calculate if session is active (within last 10 minutes)
                        const sessionDate = new Date(isCursorSession ? session.createdAt : session.lastActivity);
                        const diffInMinutes = Math.floor((currentTime - sessionDate) / (1000 * 60));
                        const isActive = diffInMinutes < 10;
                        
                        // Get session display values
                        const sessionName = isCursorSession ? (session.name || 'Untitled Session') : (session.summary || 'New Session');
                        const sessionTime = isCursorSession ? session.createdAt : session.lastActivity;
                        const messageCount = session.messageCount || 0;
                        
                        return (
                        <div key={session.id} className="group relative">
                          {/* Active session indicator dot */}
                          {isActive && (
                            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1">
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            </div>
                          )}
                          
                          {/* Session Item */}
                          <Button
                            variant="ghost"
                            className={cn(
                              "w-full justify-start p-2 h-auto font-normal text-left hover:bg-accent/50 transition-colors duration-200",
                              selectedSession?.id === session.id && "bg-accent text-accent-foreground"
                            )}
                            onClick={() => onSessionSelect(session)}
                            onTouchEnd={handleTouchClick(() => onSessionSelect(session))}
                          >
                            <div className="flex items-start gap-2 min-w-0 w-full">
                              {isCursorSession ? (
                                <CursorLogo className="w-3 h-3 mt-0.5 flex-shrink-0" />
                              ) : (
                                <ClaudeLogo className="w-3 h-3 mt-0.5 flex-shrink-0" />
                              )}
                              <div className="min-w-0 flex-1">
                                <div className="text-xs font-medium truncate text-foreground">
                                  {sessionName}
                                </div>
                                <div className="flex items-center gap-1 mt-0.5">
                                  <Clock className="w-2.5 h-2.5 text-muted-foreground" />
                                  <span className="text-xs text-muted-foreground">
                                    {formatTimeAgo(sessionTime, currentTime)}
                                  </span>
                                  {messageCount > 0 && (
                                    <Badge variant="secondary" className="text-xs px-1 py-0 ml-auto">
                                      {messageCount}
                                    </Badge>
                                  )}
                                  {/* Provider tiny icon */}
                                  <span className="ml-1 opacity-70">
                                    {isCursorSession ? (
                                      <CursorLogo className="w-3 h-3" />
                                    ) : (
                                      <ClaudeLogo className="w-3 h-3" />
                                    )}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </Button>
                          {/* Desktop hover buttons - only for Claude sessions */}
                          {!isCursorSession && (
                          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                            {editingSession === session.id ? (
                              <>
                                <input
                                  type="text"
                                  value={editingSessionName}
                                  onChange={(e) => setEditingSessionName(e.target.value)}
                                  onKeyDown={(e) => {
                                    e.stopPropagation();
                                    if (e.key === 'Enter') {
                                      updateSessionSummary(project.name, session.id, editingSessionName);
                                    } else if (e.key === 'Escape') {
                                      setEditingSession(null);
                                      setEditingSessionName('');
                                    }
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                  className="w-32 px-2 py-1 text-xs border border-border rounded bg-background focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  autoFocus
                                />
                                <button
                                  className="w-6 h-6 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/40 rounded flex items-center justify-center"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateSessionSummary(project.name, session.id, editingSessionName);
                                  }}
                                  title="Save"
                                >
                                  <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                                </button>
                                <button
                                  className="w-6 h-6 bg-gray-50 hover:bg-gray-100 dark:bg-gray-900/20 dark:hover:bg-gray-900/40 rounded flex items-center justify-center"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingSession(null);
                                    setEditingSessionName('');
                                  }}
                                  title="Cancel"
                                >
                                  <X className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                                </button>
                              </>
                            ) : (
                              <>
                                {/* Edit button */}
                                <button
                                  className="w-6 h-6 bg-gray-50 hover:bg-gray-100 dark:bg-gray-900/20 dark:hover:bg-gray-900/40 rounded flex items-center justify-center"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingSession(session.id);
                                    setEditingSessionName(session.summary || 'New Session');
                                  }}
                                  title="Manually edit session name"
                                >
                                  <Edit2 className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                                </button>
                                {/* Delete button */}
                                <button
                                  className="w-6 h-6 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 rounded flex items-center justify-center"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteSession(project.name, session.id);
                                  }}
                                  title="Delete this session permanently"
                                >
                                  <Trash2 className="w-3 h-3 text-red-600 dark:text-red-400" />
                                </button>
                              </>
                            )}
                          </div>
                          )}
                        </div>
                        );
                      })
                    )}

                    {/* Show More Sessions Button */}
                    {getAllSessions(project).length > 0 && project.sessionMeta?.hasMore !== false && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-center gap-2 mt-2 text-muted-foreground"
                        onClick={() => loadMoreSessions(project)}
                        disabled={loadingSessions[project.name]}
                      >
                        {loadingSessions[project.name] ? (
                          <>
                            <div className="w-3 h-3 animate-spin rounded-full border border-muted-foreground border-t-transparent" />
                            Loading...
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-3 h-3" />
                            Show more sessions
                          </>
                        )}
                      </Button>
                    )}
                    
                    {/* New Session Button */}
                    <Button
                      variant="default"
                      size="sm"
                      className="w-full justify-start gap-2 mt-1 h-8 text-xs font-medium bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white transition-all duration-200 shadow-sm"
                      onClick={() => onNewSession(project)}
                    >
                      <Plus className="w-3 h-3" />
                      New Session
                    </Button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </ScrollArea>
  );
}

export default SessionsView;