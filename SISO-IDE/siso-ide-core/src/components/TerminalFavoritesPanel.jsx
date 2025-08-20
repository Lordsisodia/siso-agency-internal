import React, { useState, useEffect } from 'react';
import { 
  Star,
  Terminal, 
  Clock, 
  X, 
  Play,
  Plus,
  RotateCcw,
  ExternalLink,
  Copy
} from 'lucide-react';
import { cn } from '../lib/utils';

// Terminal favorites storage service
const STORAGE_KEY = 'siso-terminal-favorites';
const RECENT_TERMINALS_KEY = 'siso-recent-terminals';

const terminalFavoritesStorage = {
  getFavorites: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading terminal favorites:', error);
      return [];
    }
  },
  
  saveFavorites: (favorites) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch (error) {
      console.error('Error saving terminal favorites:', error);
    }
  },
  
  addFavorite: (terminal) => {
    const favorites = terminalFavoritesStorage.getFavorites();
    const existing = favorites.find(f => f.id === terminal.id);
    
    if (!existing) {
      const favorite = {
        ...terminal,
        addedAt: Date.now(),
        favoriteOrder: favorites.length
      };
      favorites.push(favorite);
      terminalFavoritesStorage.saveFavorites(favorites);
    }
    return favorites;
  },
  
  removeFavorite: (terminalId) => {
    const favorites = terminalFavoritesStorage.getFavorites();
    const filtered = favorites.filter(f => f.id !== terminalId);
    terminalFavoritesStorage.saveFavorites(filtered);
    return filtered;
  },
  
  getRecentTerminals: () => {
    try {
      const stored = localStorage.getItem(RECENT_TERMINALS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading recent terminals:', error);
      return [];
    }
  },
  
  addRecentTerminal: (terminal) => {
    const recent = terminalFavoritesStorage.getRecentTerminals();
    const filtered = recent.filter(t => t.id !== terminal.id);
    const updated = [{ ...terminal, lastUsed: Date.now() }, ...filtered].slice(0, 5);
    
    try {
      localStorage.setItem(RECENT_TERMINALS_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving recent terminals:', error);
    }
    return updated;
  }
};

const FavoriteTerminalItem = ({ terminal, isActive = false, onSelect, onRemove, onRestart }) => {
  const formatTime = (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div 
      className={cn(
        'group relative rounded-lg border transition-all duration-200 cursor-pointer',
        'hover:border-border/60 hover:shadow-sm',
        isActive 
          ? 'bg-[hsl(var(--siso-orange))] text-[hsl(var(--siso-black))] border-[hsl(var(--siso-orange))] shadow-sm' 
          : 'bg-card text-card-foreground border-border/40 hover:bg-accent/50'
      )}
      onClick={onSelect}
    >
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className={cn(
              'w-6 h-6 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0',
              isActive ? 'bg-[hsl(var(--siso-black))]/20' : 'bg-[hsl(var(--siso-orange))]/10'
            )}>
              <Star className={cn(
                'w-3 h-3',
                isActive ? 'text-[hsl(var(--siso-black))] fill-current' : 'text-[hsl(var(--siso-orange))] fill-current'
              )} />
            </div>
            
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className={cn(
                  'font-medium text-sm truncate',
                  isActive ? 'text-[hsl(var(--siso-black))]' : 'text-foreground'
                )}>
                  {terminal.name}
                </h4>
                <div className={cn(
                  'flex items-center gap-1 px-1.5 py-0.5 rounded text-xs',
                  isActive 
                    ? 'bg-[hsl(var(--siso-black))]/20 text-[hsl(var(--siso-black))]' 
                    : 'bg-muted text-muted-foreground'
                )}>
                  <Terminal className="w-3 h-3" />
                  ID: {terminal.id.split('-')[1]}
                </div>
              </div>
              
              <p className={cn(
                'text-xs truncate',
                isActive ? 'text-[hsl(var(--siso-black))]/80' : 'text-muted-foreground'
              )}>
                {terminal.projectId}
              </p>
              
              <div className={cn(
                'flex items-center gap-1 mt-2 text-xs',
                isActive ? 'text-[hsl(var(--siso-black))]/60' : 'text-muted-foreground'
              )}>
                <Clock className="w-3 h-3" />
                Added {formatTime(terminal.addedAt)}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <button 
              onClick={(e) => { 
                e.stopPropagation(); 
                onRestart && onRestart(terminal); 
              }}
              className={cn(
                'opacity-0 group-hover:opacity-100 p-1 rounded transition-opacity',
                'hover:bg-blue-500/20 hover:text-blue-400',
                isActive && 'text-[hsl(var(--siso-black))] hover:bg-[hsl(var(--siso-black))]/20'
              )}
              title="Restart terminal"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
            <button 
              onClick={(e) => { 
                e.stopPropagation(); 
                onRemove && onRemove(terminal.id); 
              }}
              className={cn(
                'opacity-0 group-hover:opacity-100 p-1 rounded transition-opacity',
                'hover:bg-destructive hover:text-destructive-foreground',
                isActive && 'text-[hsl(var(--siso-black))] hover:bg-[hsl(var(--siso-black))]/20'
              )}
              title="Remove from favorites"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const RecentTerminalItem = ({ terminal, onSelect }) => {
  const formatTime = (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(diff / 86400000)}d`;
  };

  return (
    <div 
      className="flex items-center gap-3 p-2 rounded-md hover:bg-accent/50 cursor-pointer transition-colors"
      onClick={onSelect}
    >
      <div className="w-4 h-4 rounded flex items-center justify-center bg-muted">
        <Terminal className="w-3 h-3 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate">{terminal.name}</p>
        <p className="text-xs text-muted-foreground truncate">
          {terminal.projectId}
        </p>
      </div>
      <span className="text-xs text-muted-foreground">
        {formatTime(terminal.lastUsed)}
      </span>
    </div>
  );
};

const TerminalFavoritesPanel = ({ 
  onSwitchToTerminal,
  currentTerminalId,
  currentTerminal,
  onRestartTerminal
}) => {
  const [favorites, setFavorites] = useState([]);
  const [recentTerminals, setRecentTerminals] = useState([]);

  useEffect(() => {
    setFavorites(terminalFavoritesStorage.getFavorites());
    setRecentTerminals(terminalFavoritesStorage.getRecentTerminals());
  }, []);

  const handleAddCurrentToFavorites = () => {
    if (currentTerminal) {
      const updatedFavorites = terminalFavoritesStorage.addFavorite(currentTerminal);
      setFavorites(updatedFavorites);
    }
  };

  const handleRemoveFromFavorites = (terminalId) => {
    const updatedFavorites = terminalFavoritesStorage.removeFavorite(terminalId);
    setFavorites(updatedFavorites);
  };

  const handleSelectTerminal = (terminal) => {
    if (onSwitchToTerminal) {
      onSwitchToTerminal(terminal.id);
      // Add to recent terminals
      const updatedRecent = terminalFavoritesStorage.addRecentTerminal(terminal);
      setRecentTerminals(updatedRecent);
    }
  };

  const handleRestartTerminal = (terminal) => {
    if (onRestartTerminal) {
      onRestartTerminal(terminal.id);
    }
  };

  const currentTerminalIsFavorite = favorites.some(f => f.id === currentTerminalId);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[hsl(var(--siso-orange))]/10 rounded-lg flex items-center justify-center">
              <Terminal className="w-4 h-4 text-[hsl(var(--siso-orange))]" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Terminal Favorites
              </h3>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Star className="w-3 h-3" />
                {favorites.length} saved
              </div>
            </div>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="space-y-2">
          <button 
            onClick={handleAddCurrentToFavorites}
            disabled={!currentTerminal || currentTerminalIsFavorite}
            className={cn(
              'w-full inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors',
              'h-9 px-4 py-2 shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
              !currentTerminal || currentTerminalIsFavorite
                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                : 'bg-[hsl(var(--siso-orange))] text-[hsl(var(--siso-black))] hover:bg-[hsl(var(--siso-orange))]/90'
            )}
          >
            <Star className="w-4 h-4" />
            {currentTerminalIsFavorite ? 'Already in Favorites' : 'Add Current Terminal'}
          </button>
          
          <div className="flex gap-2">
            <button 
              onClick={() => navigator.clipboard?.writeText(window.location.href)}
              className="flex-1 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors h-8 px-3 py-1 bg-secondary text-secondary-foreground hover:bg-secondary/80"
            >
              <Copy className="w-3 h-3" />
              Copy Session
            </button>
            <button 
              className="flex-1 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors h-8 px-3 py-1 bg-secondary text-secondary-foreground hover:bg-secondary/80"
            >
              <ExternalLink className="w-3 h-3" />
              New Window
            </button>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Favorites Section */}
        {favorites.length > 0 && (
          <div className="p-3">
            <h4 className="text-xs font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <Star className="w-3 h-3" />
              FAVORITES ({favorites.length})
            </h4>
            <div className="space-y-2">
              {favorites.map(terminal => (
                <FavoriteTerminalItem
                  key={terminal.id}
                  terminal={terminal}
                  isActive={terminal.id === currentTerminalId}
                  onSelect={() => handleSelectTerminal(terminal)}
                  onRemove={handleRemoveFromFavorites}
                  onRestart={handleRestartTerminal}
                />
              ))}
            </div>
          </div>
        )}
        
        {/* Recent Terminals Section */}
        {recentTerminals.length > 0 && (
          <div className="p-3 border-t border-border">
            <h4 className="text-xs font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <Clock className="w-3 h-3" />
              RECENT ({recentTerminals.length})
            </h4>
            <div className="space-y-1">
              {recentTerminals.map(terminal => (
                <RecentTerminalItem
                  key={terminal.id}
                  terminal={terminal}
                  onSelect={() => handleSelectTerminal(terminal)}
                />
              ))}
            </div>
          </div>
        )}
        
        {/* Empty State */}
        {favorites.length === 0 && recentTerminals.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center px-4">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3">
              <Star className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-foreground mb-1">No favorite terminals</p>
            <p className="text-xs text-muted-foreground mb-4">
              Add terminals to your favorites for quick access
            </p>
            {currentTerminal && (
              <button 
                onClick={handleAddCurrentToFavorites}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-xs bg-[hsl(var(--siso-orange))] text-[hsl(var(--siso-black))] rounded-md hover:bg-[hsl(var(--siso-orange))]/90"
              >
                <Plus className="w-3 h-3" />
                Add "{currentTerminal.name}"
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TerminalFavoritesPanel;
export { terminalFavoritesStorage };