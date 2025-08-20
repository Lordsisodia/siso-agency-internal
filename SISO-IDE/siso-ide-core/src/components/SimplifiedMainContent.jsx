/*
 * SimplifiedMainContent.jsx - Chat-Focused Main Content Area
 * 
 * Simplified version focused purely on chat interface.
 * Tab navigation moved to unified sidebar.
 */

import React from 'react';
import ChatInterface from './ChatInterface';
import ErrorBoundary from './ErrorBoundary';
import ClaudeLogo from './ClaudeLogo';
import CursorLogo from './CursorLogo';

function SimplifiedMainContent({ 
  selectedProject, 
  selectedSession, 
  ws, 
  sendMessage, 
  messages,
  isMobile,
  onMenuClick,
  isLoading,
  onInputFocusChange,
  // Session Protection Props: Functions passed down from App.jsx to manage active session state
  // These functions control when project updates are paused during active conversations
  onSessionActive,        // Mark session as active when user sends message
  onSessionInactive,      // Mark session as inactive when conversation completes/aborts  
  onReplaceTemporarySession, // Replace temporary session ID with real session ID from WebSocket
  onNavigateToSession,    // Navigate to a specific session (for Claude CLI session duplication workaround)
  onShowSettings,         // Show tools settings panel
  autoExpandTools,        // Auto-expand tool accordions
  showRawParameters,      // Show raw parameters in tool accordions
  autoScrollToBottom,     // Auto-scroll to bottom when new messages arrive
  sendByCtrlEnter,        // Send by Ctrl+Enter mode for East Asian language input
  // Update notification props
  updateAvailable,
  latestVersion,
  onShowVersionModal,
  // Additional props for session management (unused but kept for compatibility)
  onProjectSelect,
  onNewSession,
  onSessionDelete,
  onProjectDelete,
  onRefresh
}) {

  if (isLoading) {
    return (
      <div className="h-full flex flex-col">
        {/* Header with menu button for mobile */}
        {isMobile && (
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-3 sm:p-4 flex-shrink-0">
            <button
              onClick={onMenuClick}
              className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        )}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <div className="w-12 h-12 mx-auto mb-4">
              <div 
                className="w-full h-full rounded-full border-4 border-gray-200 border-t-blue-500" 
                style={{ 
                  animation: 'spin 1s linear infinite',
                  WebkitAnimation: 'spin 1s linear infinite',
                  MozAnimation: 'spin 1s linear infinite'
                }} 
              />
            </div>
            <p className="text-sm">Loading SISO IDE...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedProject) {
    return (
      <div className="h-full flex flex-col">
        {/* Header with menu button for mobile */}
        {isMobile && (
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-3 sm:p-4 flex-shrink-0">
            <button
              onClick={onMenuClick}
              className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        )}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-500 dark:text-gray-400 max-w-md mx-auto px-6">
            <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">Welcome to SISO</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              Your AI-powered development assistant. Select a project from the sidebar to start a conversation with Claude.
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                💡 <strong>Tip:</strong> {isMobile ? 'Tap the menu button above to access projects and files' : 'Use the sidebar to browse projects, sessions, and files'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-black border-b border-border/50 p-3 sm:p-4 flex-shrink-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start space-x-2 sm:space-x-3 min-w-0 flex-1">
            {isMobile && (
              <button
                onClick={onMenuClick}
                onTouchStart={(e) => {
                  e.preventDefault();
                  onMenuClick();
                }}
                className="p-2.5 text-gray-400 hover:text-white rounded-md hover:bg-white/10 touch-manipulation active:scale-95 flex-shrink-0 mt-1"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}
            <div className="min-w-0 flex items-start gap-2 flex-1">
              {selectedSession && (
                <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center mt-1">
                  {selectedSession.__provider === 'cursor' ? (
                    <CursorLogo className="w-5 h-5" />
                  ) : (
                    <ClaudeLogo className="w-5 h-5" />
                  )}
                </div>
              )}
              <div className="min-w-0 flex-1">
                {selectedSession ? (
                  <div className="min-w-0">
                    <h2 className="text-base sm:text-lg font-semibold text-white leading-tight break-words" title={selectedSession.__provider === 'cursor' ? (selectedSession.name || 'Untitled Session') : (selectedSession.summary || 'New Session')}>
                      {selectedSession.__provider === 'cursor' ? (selectedSession.name || 'Untitled Session') : (selectedSession.summary || 'New Session')}
                    </h2>
                    <div className="text-xs text-gray-400 mt-1 break-words" title={`${selectedProject.displayName} • ${selectedSession.id}`}>
                      {selectedProject.displayName} <span className="hidden sm:inline">• {selectedSession.id}</span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h2 className="text-base sm:text-lg font-semibold text-white leading-tight">
                      New Chat Session
                    </h2>
                    <div className="text-xs text-gray-400 mt-1">
                      {selectedProject.displayName}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Update notification in top right */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {updateAvailable && (
              <button
                onClick={onShowVersionModal}
                className="relative p-2 rounded-lg bg-blue-600/20 border border-blue-500/30 hover:bg-blue-600/30 transition-all duration-200 group"
                title={`Update available: ${latestVersion}`}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                  <span className="text-xs text-blue-300 font-medium hidden sm:inline">
                    v{latestVersion}
                  </span>
                </div>
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              </button>
            )}
          </div>
        </div>
      </div>


      {/* Chat Content */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="h-full">
          <ErrorBoundary showDetails={true}>
            {selectedSession && selectedProject && (
              <ChatInterface
                selectedProject={selectedProject}
                selectedSession={selectedSession}
                ws={ws}
                sendMessage={sendMessage}
                messages={messages}
                onInputFocusChange={onInputFocusChange}
                onSessionActive={onSessionActive}
                onSessionInactive={onSessionInactive}
                onReplaceTemporarySession={onReplaceTemporarySession}
                onNavigateToSession={onNavigateToSession}
                onShowSettings={onShowSettings}
                autoExpandTools={autoExpandTools}
                showRawParameters={showRawParameters}
                autoScrollToBottom={autoScrollToBottom}
                sendByCtrlEnter={sendByCtrlEnter}
              />
            )}

            {!selectedSession && (
              <div className="h-full flex items-center justify-center">
                <div className="text-center text-gray-500 dark:text-gray-400 max-w-md mx-auto px-6">
                  <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">Start a Conversation</h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                    Select a session from the sidebar or create a new one to start chatting with Claude.
                  </p>
                </div>
              </div>
            )}
          </ErrorBoundary>
        </div>
      </div>

    </div>
  );
}

export default SimplifiedMainContent;