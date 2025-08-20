import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { FolderPlus, Settings, BarChart3, RefreshCw, MessageSquare } from 'lucide-react';
import { cn } from '../lib/utils';
import SidebarTabs from './SidebarTabs';
import SessionsView from './SessionsView';
import FilesView from './FilesView';
import ActiveSessionsPanel from './ActiveSessionsPanel';
import { api } from '../utils/api';

function UnifiedSidebar({ 
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
  onShowSettings,
  onShowUsage,
  className = ''
}) {
  const [activeTab, setActiveTab] = useState('sessions');
  const [searchValue, setSearchValue] = useState('');
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectPath, setNewProjectPath] = useState('');
  const [creatingProject, setCreatingProject] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Reset search when switching tabs
  useEffect(() => {
    setSearchValue('');
  }, [activeTab]);

  const createNewProject = async () => {
    if (!newProjectPath.trim()) {
      alert('Please enter a project path');
      return;
    }

    setCreatingProject(true);
    
    try {
      const response = await api.createProject(newProjectPath.trim());

      if (response.ok) {
        const result = await response.json();
        setShowNewProject(false);
        setNewProjectPath('');
        
        // Refresh projects to show the new one
        if (window.refreshProjects) {
          window.refreshProjects();
        } else {
          window.location.reload();
        }
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create project. Please try again.');
      }
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Error creating project. Please try again.');
    } finally {
      setCreatingProject(false);
    }
  };

  const cancelNewProject = () => {
    setShowNewProject(false);
    setNewProjectPath('');
  };

  return (
    <div className={cn("h-full flex flex-col bg-background/95 backdrop-blur-sm border-r border-border", className)}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-border/50 bg-black/95">
        <div className="flex items-center justify-between">
          {/* Brand Section */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-bold text-white tracking-tight">SISO</h1>
              <p className="text-xs text-blue-400 leading-none font-medium">AI Assistant</p>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 px-0 hover:bg-white/10 text-gray-400 hover:text-white transition-all duration-200 group"
              onClick={onShowUsage}
              title="View usage statistics"
            >
              <BarChart3 className="w-4 h-4 group-hover:scale-105 transition-transform duration-200" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 px-0 hover:bg-white/10 text-gray-400 hover:text-white transition-all duration-200 group"
              onClick={onShowSettings}
              title="Open settings"
            >
              <Settings className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 px-0 hover:bg-white/10 text-gray-400 hover:text-white transition-all duration-200 group disabled:opacity-50"
              onClick={async () => {
                setIsRefreshing(true);
                try {
                  await onRefresh();
                } finally {
                  setIsRefreshing(false);
                }
              }}
              disabled={isRefreshing}
              title="Refresh projects and sessions (Ctrl+R)"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''} group-hover:rotate-180 transition-transform duration-300`} />
            </Button>
            
            {/* Separator */}
            <div className="w-px h-5 bg-gray-600 mx-1" />
            
            <Button
              variant="default"
              size="sm"
              className="h-8 w-8 px-0 bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white transition-all duration-200 shadow-sm hover:shadow-md hover:scale-105"
              onClick={() => setShowNewProject(true)}
              title="Create new project (Ctrl+N)"
            >
              <FolderPlus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* New Project Form */}
      {showNewProject && (
        <div className="p-3 border-b border-border bg-muted/30">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <FolderPlus className="w-4 h-4" />
              Create New Project
            </div>
            <Input
              value={newProjectPath}
              onChange={(e) => setNewProjectPath(e.target.value)}
              placeholder="/path/to/project or relative/path"
              className="text-sm focus:ring-2 focus:ring-blue-500/20"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') createNewProject();
                if (e.key === 'Escape') cancelNewProject();
              }}
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={createNewProject}
                disabled={!newProjectPath.trim() || creatingProject}
                className="flex-1 h-8 text-xs bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white transition-all duration-200 shadow-sm"
              >
                {creatingProject ? 'Creating...' : 'Create Project'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={cancelNewProject}
                disabled={creatingProject}
                className="h-8 text-xs hover:bg-accent transition-colors"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="p-3 border-b border-border">
        <SidebarTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          searchValue={searchValue}
          onSearchChange={setSearchValue}
        />
      </div>

      {/* Content Area */}
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        {activeTab === 'sessions' && (
          <SessionsView
            projects={projects}
            selectedProject={selectedProject}
            selectedSession={selectedSession}
            onProjectSelect={onProjectSelect}
            onSessionSelect={onSessionSelect}
            onNewSession={onNewSession}
            onSessionDelete={onSessionDelete}
            onProjectDelete={onProjectDelete}
            isLoading={isLoading}
            onRefresh={onRefresh}
            searchFilter={searchValue}
          />
        )}
        
        {activeTab === 'files' && (
          <div className="flex-1 min-h-0 overflow-hidden">
            <ActiveSessionsPanel
              isVisible={true}
              maxTabs={12}
              projects={projects}
              selectedSession={selectedSession}
              onSessionSelect={(session) => {
                if (session) {
                  // Find the project that contains this session
                  const project = projects.find(p => 
                    p.sessions?.some(s => s.id === session.id) ||
                    p.cursorSessions?.some(s => s.id === session.id)
                  );
                  
                  if (project) {
                    // Set the selected project first
                    onProjectSelect(project);
                    // Then select the session
                    onSessionSelect(session);
                  } else {
                    console.warn('Could not find project for session:', session.id);
                    // Still try to select the session
                    onSessionSelect(session);
                  }
                } else {
                  // Navigate to new session
                  onSessionSelect(null);
                }
              }}
              onToggleVisibility={() => {}} // Not used in sidebar context
              showHeader={false} // Hide header since tab already indicates this is Recent sessions
            />
          </div>
        )}
      </div>

      
      {/* Settings Section */}
      <div className="p-2 border-t border-border flex-shrink-0">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 p-2 h-auto font-normal text-muted-foreground hover:text-foreground hover:bg-accent transition-colors duration-200"
          onClick={onShowSettings}
        >
          <Settings className="w-3 h-3" />
          <span className="text-xs">Tools Settings</span>
        </Button>
      </div>
    </div>
  );
}

export default UnifiedSidebar;