import { TimelineTask } from '@/domains/projects/hooks/useTimelineTasks';

export interface MutationOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  table: string;
  data: any;
  timestamp: number;
  userId: string;
}

export interface StoredDailyPlan {
  date: string;
  selectedTasks: string[];
  timeSlots: Record<string, string>; // slotId -> taskId
  lastModified: number;
}

class OfflineStorageService {
  private dbName = 'SISO_OFFLINE_DB';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = () => {
        const db = request.result;
        
        // Tasks store
        if (!db.objectStoreNames.contains('tasks')) {
          const tasksStore = db.createObjectStore('tasks', { keyPath: 'id' });
          tasksStore.createIndex('category', 'category', { unique: false });
          tasksStore.createIndex('userId', 'userId', { unique: false });
        }
        
        // Sync queue store
        if (!db.objectStoreNames.contains('syncQueue')) {
          const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id' });
          syncStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
        
        // Daily plans store
        if (!db.objectStoreNames.contains('dailyPlans')) {
          const plansStore = db.createObjectStore('dailyPlans', { keyPath: 'date' });
          plansStore.createIndex('lastModified', 'lastModified', { unique: false });
        }
      };
    });
  }

  // Task Storage Operations
  async storeTasks(tasks: TimelineTask[], userId: string): Promise<void> {
    if (!this.db) await this.init();
    
    const transaction = this.db!.transaction(['tasks'], 'readwrite');
    const store = transaction.objectStore('tasks');
    
    // Clear existing tasks for user first
    const index = store.index('userId');
    const request = index.getAll(userId);
    
    request.onsuccess = () => {
      const existingTasks = request.result;
      existingTasks.forEach(task => store.delete(task.id));
      
      // Add new tasks
      tasks.forEach(task => {
        store.put({ ...task, userId, cachedAt: Date.now() });
      });
    };
  }

  async getTasks(userId: string): Promise<TimelineTask[]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['tasks'], 'readonly');
      const store = transaction.objectStore('tasks');
      const index = store.index('userId');
      const request = index.getAll(userId);
      
      request.onsuccess = () => {
        const tasks = request.result.map(({ userId, cachedAt, ...task }) => task);
        resolve(tasks as TimelineTask[]);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Sync Queue Operations
  async queueMutation(operation: MutationOperation): Promise<void> {
    if (!this.db) await this.init();
    
    const transaction = this.db!.transaction(['syncQueue'], 'readwrite');
    const store = transaction.objectStore('syncQueue');
    store.add(operation);
    
    // Also store in localStorage as backup
    this.addToLocalSyncQueue(operation);
  }

  async getSyncQueue(): Promise<MutationOperation[]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['syncQueue'], 'readonly');
      const store = transaction.objectStore('syncQueue');
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        // Fallback to localStorage
        resolve(this.getLocalSyncQueue());
      };
    });
  }

  async clearSyncQueue(): Promise<void> {
    if (!this.db) await this.init();
    
    const transaction = this.db!.transaction(['syncQueue'], 'readwrite');
    const store = transaction.objectStore('syncQueue');
    store.clear();
    
    // Clear localStorage backup
    localStorage.removeItem('siso_sync_queue');
  }

  // Daily Plans Storage
  async storeDailyPlan(plan: StoredDailyPlan): Promise<void> {
    if (!this.db) await this.init();
    
    const transaction = this.db!.transaction(['dailyPlans'], 'readwrite');
    const store = transaction.objectStore('dailyPlans');
    store.put(plan);
    
    // Also store in localStorage
    const plans = JSON.parse(localStorage.getItem('siso_daily_plans') || '{}');
    plans[plan.date] = plan;
    localStorage.setItem('siso_daily_plans', JSON.stringify(plans));
  }

  async getDailyPlan(date: string): Promise<StoredDailyPlan | null> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['dailyPlans'], 'readonly');
      const store = transaction.objectStore('dailyPlans');
      const request = store.get(date);
      
      request.onsuccess = () => {
        if (request.result) {
          resolve(request.result);
        } else {
          // Fallback to localStorage
          const plans = JSON.parse(localStorage.getItem('siso_daily_plans') || '{}');
          resolve(plans[date] || null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  // LocalStorage Fallback Methods
  private addToLocalSyncQueue(operation: MutationOperation): void {
    const queue = this.getLocalSyncQueue();
    queue.push(operation);
    localStorage.setItem('siso_sync_queue', JSON.stringify(queue));
  }

  private getLocalSyncQueue(): MutationOperation[] {
    const queue = localStorage.getItem('siso_sync_queue');
    return queue ? JSON.parse(queue) : [];
  }

  // Check if offline data exists
  async hasOfflineData(userId: string): Promise<boolean> {
    try {
      const tasks = await this.getTasks(userId);
      return tasks.length > 0;
    } catch {
      return false;
    }
  }

  // Get storage stats for debugging
  async getStorageStats(): Promise<{ tasks: number; queueSize: number; dailyPlans: number }> {
    if (!this.db) await this.init();
    
    const taskCount = await new Promise<number>((resolve) => {
      const transaction = this.db!.transaction(['tasks'], 'readonly');
      const store = transaction.objectStore('tasks');
      const request = store.count();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(0);
    });

    const queueSize = await new Promise<number>((resolve) => {
      const transaction = this.db!.transaction(['syncQueue'], 'readonly');
      const store = transaction.objectStore('syncQueue');
      const request = store.count();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(0);
    });

    const planCount = await new Promise<number>((resolve) => {
      const transaction = this.db!.transaction(['dailyPlans'], 'readonly');
      const store = transaction.objectStore('dailyPlans');
      const request = store.count();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(0);
    });

    return { tasks: taskCount, queueSize, dailyPlans: planCount };
  }
}

export const offlineStorageService = new OfflineStorageService();