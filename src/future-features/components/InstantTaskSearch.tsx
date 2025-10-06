/**
 * 🔍 Instant Task Search Component
 *
 * Beautiful search bar with <1ms offline results
 * No network needed - instant feedback!
 */

import React, { useState, useEffect } from 'react';
import { Search, X, Zap } from 'lucide-react';
import { Input } from '@/shared/ui/input';
import { Badge } from '@/shared/ui/badge';
import { Card } from '@/shared/ui/card';
import { cn } from '@/shared/lib/utils';
import { useOfflineSearch } from '@/shared/services/offlineSearch';

interface InstantTaskSearchProps {
  tasks: any[];
  onSelectTask?: (task: any) => void;
  className?: string;
  placeholder?: string;
}

export function InstantTaskSearch({
  tasks,
  onSelectTask,
  className,
  placeholder = "Search tasks... (instant, works offline)"
}: InstantTaskSearchProps) {
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const { search, results, searching } = useOfflineSearch(tasks);
  const [searchTime, setSearchTime] = useState<number>(0);

  // Search with timing
  useEffect(() => {
    if (query.trim()) {
      const start = performance.now();
      search(query);
      setSearchTime(performance.now() - start);
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  }, [query, search]);

  const handleClear = () => {
    setQuery('');
    setShowResults(false);
  };

  const handleSelect = (task: any) => {
    onSelectTask?.(task);
    handleClear();
  };

  return (
    <div className={cn('relative', className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="pl-10 pr-24 bg-gray-900/50 border-purple-700/30 text-white placeholder:text-gray-500 focus:border-purple-500"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {query && (
            <>
              <Badge variant="outline" className="text-xs border-purple-600/50 text-purple-300">
                <Zap className="h-3 w-3 mr-1" />
                {searchTime.toFixed(1)}ms
              </Badge>
              <button
                onClick={handleClear}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Search Results */}
      {showResults && results.length > 0 && (
        <Card className="absolute top-full mt-2 w-full max-h-[400px] overflow-y-auto z-50 bg-gray-900 border-purple-700/30 shadow-xl">
          <div className="p-2 space-y-1">
            {results.map((task, index) => (
              <button
                key={task.id}
                onClick={() => handleSelect(task)}
                className="w-full text-left p-3 rounded-lg hover:bg-purple-900/20 transition-colors group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-white group-hover:text-purple-300 transition-colors">
                      {task.title}
                    </div>
                    {task.description && (
                      <div className="text-sm text-gray-400 truncate mt-1">
                        {task.description}
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      {task.priority && (
                        <Badge variant="outline" className="text-xs">
                          {task.priority}
                        </Badge>
                      )}
                      {task.score && (
                        <span className="text-xs text-purple-400">
                          Score: {task.score}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* No Results */}
      {showResults && results.length === 0 && query && (
        <Card className="absolute top-full mt-2 w-full p-4 bg-gray-900 border-purple-700/30">
          <div className="text-center text-gray-400">
            No tasks found for "{query}"
          </div>
        </Card>
      )}

      {/* Performance indicator */}
      {query && searchTime < 1 && (
        <div className="absolute -bottom-6 right-0 text-xs text-purple-400/60 flex items-center gap-1">
          <Zap className="h-3 w-3" />
          Instant search (offline)
        </div>
      )}
    </div>
  );
}

/**
 * Compact search bar for tight spaces
 */
export function CompactTaskSearch({
  tasks,
  onSelectTask
}: {
  tasks: any[];
  onSelectTask?: (task: any) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="p-2 rounded-lg bg-purple-900/20 hover:bg-purple-900/30 transition-colors"
      >
        <Search className="h-4 w-4 text-purple-400" />
      </button>
    );
  }

  return (
    <div className="w-full">
      <InstantTaskSearch
        tasks={tasks}
        onSelectTask={(task) => {
          onSelectTask?.(task);
          setIsExpanded(false);
        }}
        placeholder="Quick search..."
      />
    </div>
  );
}
