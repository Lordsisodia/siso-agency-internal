/**
 * 🔍 Instant Offline Search
 *
 * Full-text search without network - results in <1ms!
 * Uses in-memory indexing for blazing fast queries
 */

interface SearchableTask {
  id: string;
  title: string;
  description?: string;
  tags?: string[];
  category?: string;
}

interface SearchResult {
  id: string;
  score: number; // Relevance score
  matches: string[]; // Matched fields
}

class OfflineSearchEngine {
  private index: Map<string, SearchableTask> = new Map();
  private titleIndex: Map<string, Set<string>> = new Map(); // word → task IDs
  private descIndex: Map<string, Set<string>> = new Map();

  /**
   * Index tasks for search
   */
  indexTasks(tasks: SearchableTask[]): void {
    console.log(`🔍 Indexing ${tasks.length} tasks for instant search...`);
    const start = performance.now();

    this.index.clear();
    this.titleIndex.clear();
    this.descIndex.clear();

    for (const task of tasks) {
      this.index.set(task.id, task);

      // Index title words
      const titleWords = this.tokenize(task.title);
      for (const word of titleWords) {
        if (!this.titleIndex.has(word)) {
          this.titleIndex.set(word, new Set());
        }
        this.titleIndex.get(word)!.add(task.id);
      }

      // Index description words
      if (task.description) {
        const descWords = this.tokenize(task.description);
        for (const word of descWords) {
          if (!this.descIndex.has(word)) {
            this.descIndex.set(word, new Set());
          }
          this.descIndex.get(word)!.add(task.id);
        }
      }
    }

    const duration = performance.now() - start;
    console.log(`✅ Indexed ${tasks.length} tasks in ${duration.toFixed(2)}ms`);
  }

  /**
   * Search tasks instantly
   */
  search(query: string, limit = 10): SearchResult[] {
    const start = performance.now();
    const results = new Map<string, SearchResult>();

    // Tokenize query
    const queryWords = this.tokenize(query);

    // Search title index (higher weight)
    for (const word of queryWords) {
      const titleMatches = this.titleIndex.get(word);
      if (titleMatches) {
        for (const taskId of titleMatches) {
          const existing = results.get(taskId);
          if (existing) {
            existing.score += 10; // Title match worth more
            existing.matches.push('title');
          } else {
            results.set(taskId, {
              id: taskId,
              score: 10,
              matches: ['title']
            });
          }
        }
      }

      // Search description index (lower weight)
      const descMatches = this.descIndex.get(word);
      if (descMatches) {
        for (const taskId of descMatches) {
          const existing = results.get(taskId);
          if (existing) {
            existing.score += 3;
            if (!existing.matches.includes('description')) {
              existing.matches.push('description');
            }
          } else {
            results.set(taskId, {
              id: taskId,
              score: 3,
              matches: ['description']
            });
          }
        }
      }
    }

    // Sort by relevance and limit
    const sorted = Array.from(results.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    const duration = performance.now() - start;
    console.log(`⚡ Search completed in ${duration.toFixed(2)}ms (${sorted.length} results)`);

    return sorted;
  }

  /**
   * Get task by ID
   */
  getTask(id: string): SearchableTask | undefined {
    return this.index.get(id);
  }

  /**
   * Tokenize text for indexing
   */
  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2); // Ignore short words
  }

  /**
   * Get stats
   */
  getStats() {
    return {
      totalTasks: this.index.size,
      titleWords: this.titleIndex.size,
      descWords: this.descIndex.size
    };
  }
}

// Export singleton
export const offlineSearch = new OfflineSearchEngine();

/**
 * Hook for search functionality
 */
export function useOfflineSearch<T extends SearchableTask>(tasks: T[]) {
  const [results, setResults] = useState<Array<T & { score: number }>>([]);
  const [searching, setSearching] = useState(false);

  // Reindex when tasks change
  useEffect(() => {
    offlineSearch.indexTasks(tasks);
  }, [tasks]);

  const search = (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setSearching(true);
    const searchResults = offlineSearch.search(query, 20);

    const tasksWithScores = searchResults
      .map(result => {
        const task = offlineSearch.getTask(result.id) as T;
        return task ? { ...task, score: result.score } : null;
      })
      .filter((item): item is T & { score: number } => item !== null);

    setResults(tasksWithScores);
    setSearching(false);
  };

  return { search, results, searching };
}
