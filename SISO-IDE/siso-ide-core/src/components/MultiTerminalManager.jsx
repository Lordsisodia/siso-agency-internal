import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Plus, X, Terminal, Settings, Maximize2, Minimize2, Star } from 'lucide-react';
import Shell from './Shell';
import { terminalFavoritesStorage } from './TerminalFavoritesPanel';

const MultiTerminalManager = React.forwardRef(({ selectedProject, selectedSession, isActive, onTerminalStateChange }, ref) => {
  const [terminals, setTerminals] = useState([]);
  const [activeTerminalId, setActiveTerminalId] = useState(null);
  const [isMaximized, setIsMaximized] = useState(false);
  const [editingTerminalId, setEditingTerminalId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [favoriteTerminals, setFavoriteTerminals] = useState([]);
  const terminalCounter = useRef(0);

  const generateTerminalId = () => {
    terminalCounter.current += 1;
    return `terminal-${terminalCounter.current}`;
  };

  const generateTerminalName = (projectName) => {
    const count = terminals.filter(t => t.projectId === selectedProject?.id).length + 1;
    const baseName = projectName || 'Terminal';
    return count === 1 ? baseName : `${baseName} ${count}`;
  };

  const createTerminal = useCallback(() => {
    if (!selectedProject) return;

    const newTerminalId = generateTerminalId();
    const newTerminal = {
      id: newTerminalId,
      name: generateTerminalName(selectedProject.displayName || selectedProject.name),
      projectId: selectedProject.id || selectedProject.name,
      createdAt: Date.now(),
      lastActiveAt: Date.now()
    };

    setTerminals(prev => [...prev, newTerminal]);
    setActiveTerminalId(newTerminalId);
  }, [selectedProject, terminals]);

  const closeTerminal = useCallback((terminalId) => {
    setTerminals(prev => {
      const newTerminals = prev.filter(t => t.id !== terminalId);
      
      // If closing the active terminal, switch to another one
      if (activeTerminalId === terminalId) {
        const remainingTerminals = newTerminals;
        if (remainingTerminals.length > 0) {
          setActiveTerminalId(remainingTerminals[remainingTerminals.length - 1].id);
        } else {
          setActiveTerminalId(null);
        }
      }
      
      return newTerminals;
    });
  }, [activeTerminalId]);

  const renameTerminal = useCallback((terminalId, newName) => {
    setTerminals(prev => prev.map(terminal => 
      terminal.id === terminalId 
        ? { ...terminal, name: newName }
        : terminal
    ));
  }, []);

  const switchToTerminal = useCallback((terminalId) => {
    setActiveTerminalId(terminalId);
    setTerminals(prev => prev.map(terminal => 
      terminal.id === terminalId 
        ? { ...terminal, lastActiveAt: Date.now() }
        : terminal
    ));
  }, []);

  const restartTerminal = useCallback((terminalId) => {
    // Implementation for restarting terminal
    console.log('Restart terminal:', terminalId);
    // You can add actual restart logic here
  }, []);

  // Expose methods to parent via ref
  React.useImperativeHandle(ref, () => ({
    switchToTerminal,
    restartTerminal,
    getActiveTerminal: () => terminals.find(t => t.id === activeTerminalId),
    getActiveTerminalId: () => activeTerminalId
  }), [switchToTerminal, restartTerminal, terminals, activeTerminalId]);

  // Notify parent of terminal state changes
  useEffect(() => {
    if (onTerminalStateChange) {
      const activeTerminal = terminals.find(t => t.id === activeTerminalId);
      onTerminalStateChange(activeTerminalId, activeTerminal);
    }
  }, [activeTerminalId, terminals, onTerminalStateChange]);

  // Initialize with first terminal when project is selected
  useEffect(() => {
    if (selectedProject && terminals.length === 0) {
      createTerminal();
    }
  }, [selectedProject, createTerminal]);

  // Load favorites on mount
  useEffect(() => {
    setFavoriteTerminals(terminalFavoritesStorage.getFavorites());
  }, []);

  const toggleFavorite = useCallback((terminal) => {
    const isFavorite = favoriteTerminals.some(f => f.id === terminal.id);
    
    if (isFavorite) {
      const updatedFavorites = terminalFavoritesStorage.removeFavorite(terminal.id);
      setFavoriteTerminals(updatedFavorites);
    } else {
      const updatedFavorites = terminalFavoritesStorage.addFavorite(terminal);
      setFavoriteTerminals(updatedFavorites);
    }
  }, [favoriteTerminals]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only handle shortcuts when this component is active
      if (!isActive) return;
      
      // Ctrl/Cmd + Shift + T: New terminal
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') {
        e.preventDefault();
        createTerminal();
      }
      
      // Ctrl/Cmd + Shift + W: Close current terminal
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'W' && activeTerminalId) {
        e.preventDefault();
        closeTerminal(activeTerminalId);
      }
      
      // Ctrl/Cmd + PageUp/PageDown: Switch terminals
      if ((e.ctrlKey || e.metaKey) && (e.key === 'PageUp' || e.key === 'PageDown')) {
        e.preventDefault();
        const currentIndex = terminals.findIndex(t => t.id === activeTerminalId);
        if (currentIndex !== -1) {
          const nextIndex = e.key === 'PageUp' 
            ? (currentIndex - 1 + terminals.length) % terminals.length
            : (currentIndex + 1) % terminals.length;
          switchToTerminal(terminals[nextIndex].id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, terminals, activeTerminalId, createTerminal, closeTerminal, switchToTerminal]);

  const startEditingTerminal = useCallback((terminalId, currentName) => {
    setEditingTerminalId(terminalId);
    setEditingName(currentName);
  }, []);

  const saveTerminalName = useCallback(() => {
    if (editingTerminalId && editingName.trim()) {
      renameTerminal(editingTerminalId, editingName.trim());
    }
    setEditingTerminalId(null);
    setEditingName('');
  }, [editingTerminalId, editingName, renameTerminal]);

  const cancelEditingTerminal = useCallback(() => {
    setEditingTerminalId(null);
    setEditingName('');
  }, []);

  const activeTerminal = terminals.find(t => t.id === activeTerminalId);

  if (!selectedProject) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <Terminal className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Select a Project</h3>
          <p>Choose a project to open terminals in that directory</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isMaximized ? 'fixed inset-0 z-50 bg-gray-900' : 'h-full'} flex flex-col`}>
      {/* Terminal Manager Header */}
      <div className="flex-shrink-0 bg-gray-800 border-b border-gray-700">
        {/* Top Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <Terminal className="h-4 w-4 text-blue-400" />
            <span className="text-sm font-medium text-white">Terminal Manager</span>
            <div className="text-xs text-gray-400">
              {terminals.length} terminal{terminals.length !== 1 ? 's' : ''}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={createTerminal}
              className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1"
              title="Create new terminal (Ctrl+Shift+T)"
            >
              <Plus className="h-3 w-3" />
              New
            </button>
            
            <button
              onClick={() => setIsMaximized(!isMaximized)}
              className="p-1 text-gray-400 hover:text-white"
              title={isMaximized ? "Minimize" : "Maximize"}
            >
              {isMaximized ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Terminal Tabs */}
        {terminals.length > 0 && (
          <div className="flex items-center px-3 py-1 overflow-x-auto">
            <div className="flex items-center gap-1 min-w-max">
              {terminals.map((terminal) => (
                <div
                  key={terminal.id}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-t-lg border-x border-t cursor-pointer transition-colors ${
                    activeTerminalId === terminal.id
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-750 hover:text-white'
                  }`}
                  onClick={() => switchToTerminal(terminal.id)}
                >
                  <div className={`w-2 h-2 rounded-full ${
                    activeTerminalId === terminal.id ? 'bg-green-500' : 'bg-gray-500'
                  }`} />
                  
                  {editingTerminalId === terminal.id ? (
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onBlur={saveTerminalName}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          saveTerminalName();
                        } else if (e.key === 'Escape') {
                          cancelEditingTerminal();
                        }
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs font-medium bg-gray-600 border border-gray-500 rounded px-2 py-0.5 text-white focus:outline-none focus:border-blue-500"
                      style={{ minWidth: '80px', maxWidth: '150px' }}
                      autoFocus
                    />
                  ) : (
                    <span 
                      className="text-xs font-medium whitespace-nowrap cursor-pointer"
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        startEditingTerminal(terminal.id, terminal.name);
                      }}
                      title="Double-click to rename"
                    >
                      {terminal.name}
                    </span>
                  )}
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(terminal);
                    }}
                    className={`p-0.5 hover:bg-gray-600 rounded transition-colors ${
                      favoriteTerminals.some(f => f.id === terminal.id)
                        ? 'text-yellow-400 hover:text-yellow-300'
                        : 'text-gray-400 hover:text-white'
                    }`}
                    title={favoriteTerminals.some(f => f.id === terminal.id) ? "Remove from favorites" : "Add to favorites"}
                  >
                    <Star className={`h-3 w-3 ${
                      favoriteTerminals.some(f => f.id === terminal.id) ? 'fill-current' : ''
                    }`} />
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      closeTerminal(terminal.id);
                    }}
                    className="p-0.5 hover:bg-gray-600 rounded text-gray-400 hover:text-white"
                    title="Close terminal"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Terminal Content */}
      <div className="flex-1 overflow-hidden">
        {terminals.length === 0 ? (
          <div className="h-full flex items-center justify-center bg-gray-900">
            <div className="text-center">
              <Terminal className="h-12 w-12 mx-auto text-gray-500 mb-4" />
              <p className="text-gray-400 mb-4">No terminal sessions</p>
              <button
                onClick={createTerminal}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Create Terminal
              </button>
            </div>
          </div>
        ) : (
          <div className="h-full relative">
            {terminals.map((terminal) => (
              <div
                key={terminal.id}
                className={`absolute inset-0 ${
                  activeTerminalId === terminal.id ? 'block' : 'hidden'
                }`}
              >
                <Shell
                  selectedProject={selectedProject}
                  selectedSession={selectedSession}
                  isActive={isActive && activeTerminalId === terminal.id}
                  terminalId={terminal.id}
                  terminalName={terminal.name}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

MultiTerminalManager.displayName = 'MultiTerminalManager';

export default MultiTerminalManager;