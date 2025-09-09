/**
 * Task Persistence Backup Service
 * Prevents task loss with multiple backup strategies
 */

export interface TaskBackup {
  id: string;
  timestamp: string;
  tasks: any[];
  source: 'manual' | 'auto' | 'session';
  userAgent: string;
}

export class TaskPersistenceBackup {
  private static readonly BACKUP_KEY = 'siso-task-backups';
  private static readonly MAX_BACKUPS = 10;
  
  /**
   * Auto-backup tasks whenever they change
   */
  static autoBackup(tasks: any[], source: 'manual' | 'auto' | 'session' = 'auto') {
    try {
      const backup: TaskBackup = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        tasks: JSON.parse(JSON.stringify(tasks)), // Deep clone
        source,
        userAgent: navigator.userAgent
      };

      // Get existing backups
      const existingBackups = this.getAllBackups();
      
      // Add new backup
      existingBackups.unshift(backup);
      
      // Keep only latest backups
      const limitedBackups = existingBackups.slice(0, this.MAX_BACKUPS);
      
      // Save to multiple locations for redundancy
      localStorage.setItem(this.BACKUP_KEY, JSON.stringify(limitedBackups));
      sessionStorage.setItem(this.BACKUP_KEY, JSON.stringify(limitedBackups));
      
      // Also save as separate dated backup
      const dateKey = `${this.BACKUP_KEY}-${new Date().toISOString().split('T')[0]}`;
      localStorage.setItem(dateKey, JSON.stringify(backup));
      
      console.log(`✅ [BACKUP] Tasks backed up (${tasks.length} tasks, source: ${source})`);
      
      return backup.id;
    } catch (error) {
      console.error('❌ [BACKUP] Failed to backup tasks:', error);
      return null;
    }
  }

  /**
   * Get all backups
   */
  static getAllBackups(): TaskBackup[] {
    try {
      const stored = localStorage.getItem(this.BACKUP_KEY) || 
                     sessionStorage.getItem(this.BACKUP_KEY) ||
                     '[]';
      return JSON.parse(stored);
    } catch (error) {
      console.error('❌ [BACKUP] Failed to load backups:', error);
      return [];
    }
  }

  /**
   * Restore tasks from specific backup
   */
  static restoreFromBackup(backupId: string): any[] | null {
    try {
      const backups = this.getAllBackups();
      const backup = backups.find(b => b.id === backupId);
      
      if (backup) {
        console.log(`🔄 [BACKUP] Restoring ${backup.tasks.length} tasks from ${backup.timestamp}`);
        return backup.tasks;
      }
      
      return null;
    } catch (error) {
      console.error('❌ [BACKUP] Failed to restore backup:', error);
      return null;
    }
  }

  /**
   * Get latest backup
   */
  static getLatestBackup(): TaskBackup | null {
    const backups = this.getAllBackups();
    return backups.length > 0 ? backups[0] : null;
  }

  /**
   * Emergency recovery - check all possible storage locations
   */
  static emergencyRecovery(): any[] {
    console.log('🚨 [EMERGENCY] Starting emergency task recovery...');
    
    const recoveredTasks: any[] = [];
    
    // Check all possible task storage keys
    const possibleKeys = [
      'lifelock-personal-tasks',
      'siso-tasks',
      'personal-tasks',
      'focus-tasks',
      'deep-focus-tasks',
      'daily-tasks',
      'clerk-user-tasks',
      'tasks-' + new Date().toISOString().split('T')[0],
      'tasks-' + new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday
    ];

    // Check localStorage and sessionStorage
    [localStorage, sessionStorage].forEach((storage, storageIndex) => {
      const storageName = storageIndex === 0 ? 'localStorage' : 'sessionStorage';
      
      possibleKeys.forEach(key => {
        try {
          const data = storage.getItem(key);
          if (data) {
            const parsed = JSON.parse(data);
            if (Array.isArray(parsed)) {
              console.log(`✅ [EMERGENCY] Found ${parsed.length} tasks in ${storageName}.${key}`);
              recoveredTasks.push(...parsed);
            } else if (parsed.tasks && Array.isArray(parsed.tasks)) {
              console.log(`✅ [EMERGENCY] Found ${parsed.tasks.length} tasks in ${storageName}.${key}.tasks`);
              recoveredTasks.push(...parsed.tasks);
            }
          }
        } catch (error) {
          // Skip invalid JSON
        }
      });
    });

    // Check date-specific backups
    for (let i = 0; i < 7; i++) {
      const date = new Date(Date.now() - (i * 86400000));
      const dateKey = `${this.BACKUP_KEY}-${date.toISOString().split('T')[0]}`;
      
      try {
        const backup = localStorage.getItem(dateKey);
        if (backup) {
          const parsed: TaskBackup = JSON.parse(backup);
          console.log(`✅ [EMERGENCY] Found backup from ${parsed.timestamp} with ${parsed.tasks.length} tasks`);
          recoveredTasks.push(...parsed.tasks);
        }
      } catch (error) {
        // Skip invalid backups
      }
    }

    // Deduplicate by ID or title
    const uniqueTasks = recoveredTasks.filter((task, index, self) => {
      return index === self.findIndex(t => 
        (t.id && t.id === task.id) || 
        (t.title && t.title === task.title && t.createdAt === task.createdAt)
      );
    });

    console.log(`🔄 [EMERGENCY] Recovery complete: ${uniqueTasks.length} unique tasks found`);
    
    if (uniqueTasks.length > 0) {
      // Auto-backup the recovered tasks
      this.autoBackup(uniqueTasks, 'manual');
    }

    return uniqueTasks;
  }

  /**
   * Setup automatic backup on page unload
   */
  static setupAutoBackup() {
    // Backup before page unload
    window.addEventListener('beforeunload', () => {
      // Try to backup any tasks in common storage locations
      const taskKeys = ['lifelock-personal-tasks', 'siso-tasks', 'personal-tasks'];
      
      taskKeys.forEach(key => {
        try {
          const tasks = localStorage.getItem(key);
          if (tasks) {
            const parsed = JSON.parse(tasks);
            if (Array.isArray(parsed) && parsed.length > 0) {
              this.autoBackup(parsed, 'session');
            }
          }
        } catch (error) {
          // Skip errors on page unload
        }
      });
    });

    // Periodic backup every 30 seconds
    setInterval(() => {
      try {
        const tasks = localStorage.getItem('lifelock-personal-tasks');
        if (tasks) {
          const parsed = JSON.parse(tasks);
          if (Array.isArray(parsed) && parsed.length > 0) {
            this.autoBackup(parsed, 'auto');
          }
        }
      } catch (error) {
        // Skip errors in interval
      }
    }, 30000);

    console.log('✅ [BACKUP] Auto-backup system initialized');
  }
}

// Auto-initialize the backup system
if (typeof window !== 'undefined') {
  TaskPersistenceBackup.setupAutoBackup();
}