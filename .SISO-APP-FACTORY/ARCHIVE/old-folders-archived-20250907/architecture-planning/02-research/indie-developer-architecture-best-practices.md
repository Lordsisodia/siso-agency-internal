# Indie Developer Architecture Best Practices
## Patterns for Solo/Small Team Success

### Executive Summary

Indie developer architecture prioritizes **simplicity**, **maintainability**, and **rapid iteration** over enterprise complexity. After analyzing successful indie projects like **Solo blog system**, **Plain Vanilla web development**, and studying small-team patterns, core principles emerge:

1. **Vanilla-First Development** - Use platform primitives before frameworks
2. **File-Based Organization** - Simple, predictable project structures
3. **Zero-Dependency Philosophy** - Minimize external dependencies
4. **Local-First Operations** - Apps work offline, sync enhances
5. **Developer Ergonomics** - Tools that reduce cognitive load

This research provides concrete patterns for transforming SISO into a maintainable, indie-style codebase.

---

## 1. Core Indie Architecture Philosophy

### 1.1 "Vanilla-First" Development Pattern

**Philosophy:** Start with web platform primitives, add complexity only when needed.

```javascript
// ❌ FRAMEWORK-FIRST: Heavy dependencies
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createStore, useStore } from 'zustand';

const TaskComponent = () => {
  // 50+ lines of React complexity
};

// ✅ VANILLA-FIRST: Web platform primitives
class TaskComponent extends HTMLElement {
  constructor() {
    super();
    this.tasks = [];
  }
  
  connectedCallback() {
    this.innerHTML = `
      <div class="task-list">
        <button onclick="this.addTask()">Add Task</button>
        <ul id="tasks"></ul>
      </div>
    `;
    this.loadTasks();
  }
  
  addTask(text) {
    const task = { id: Date.now(), text, completed: false };
    this.tasks.push(task);
    this.render();
    this.saveTasks();
  }
  
  render() {
    const ul = this.querySelector('#tasks');
    ul.innerHTML = this.tasks.map(task => `
      <li>
        <input type="checkbox" ${task.completed ? 'checked' : ''} 
               onchange="this.closest('task-component').toggleTask(${task.id})">
        ${task.text}
      </li>
    `).join('');
  }
  
  saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(this.tasks));
  }
  
  loadTasks() {
    const stored = localStorage.getItem('tasks');
    if (stored) {
      this.tasks = JSON.parse(stored);
      this.render();
    }
  }
}

customElements.define('task-component', TaskComponent);
```

### 1.2 File-Based Architecture Pattern

**Inspired by Solo's simple structure:**

```
siso/
├── index.html              # Entry point
├── app.js                  # Application bootstrap
├── styles.css              # Global styles
├── components/             # Web components
│   ├── task-list.js
│   ├── time-tracker.js
│   └── life-lock.js
├── lib/                    # Dependencies (if any)
│   ├── signal.js          # Custom signal implementation
│   └── storage.js         # Storage utilities
├── data/                   # Data layer
│   ├── tasks.js           # Task data management
│   ├── time-entries.js    # Time tracking data
│   └── sync.js            # Cloud sync utilities
└── utils/                  # Utilities
    ├── html.js            # HTML templating
    ├── events.js          # Event utilities
    └── dom.js             # DOM utilities
```

### 1.3 Zero-Dependency Web Components

**Pattern from Plain Vanilla project:**

```javascript
// Self-contained, zero-dependency component
class LifeLockDashboard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.goals = [];
    this.habits = [];
  }
  
  connectedCallback() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          padding: 1rem;
          font-family: system-ui, sans-serif;
        }
        
        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1rem;
        }
        
        .card {
          border: 1px solid #ccc;
          border-radius: 8px;
          padding: 1rem;
          background: #fff;
        }
        
        .progress-bar {
          width: 100%;
          height: 8px;
          background: #eee;
          border-radius: 4px;
          overflow: hidden;
        }
        
        .progress-fill {
          height: 100%;
          background: #007bff;
          transition: width 0.3s ease;
        }
      </style>
      
      <div class="dashboard-grid">
        <div class="card">
          <h3>Goals</h3>
          <div id="goals-container"></div>
          <button onclick="this.getRootNode().host.showAddGoal()">Add Goal</button>
        </div>
        
        <div class="card">
          <h3>Daily Habits</h3>
          <div id="habits-container"></div>
        </div>
        
        <div class="card">
          <h3>Statistics</h3>
          <div id="stats-container"></div>
        </div>
      </div>
    `;
    
    this.loadData();
    this.render();
  }
  
  loadData() {
    this.goals = JSON.parse(localStorage.getItem('lifelock-goals') || '[]');
    this.habits = JSON.parse(localStorage.getItem('lifelock-habits') || '[]');
  }
  
  saveData() {
    localStorage.setItem('lifelock-goals', JSON.stringify(this.goals));
    localStorage.setItem('lifelock-habits', JSON.stringify(this.habits));
  }
  
  render() {
    this.renderGoals();
    this.renderHabits();
    this.renderStats();
  }
  
  renderGoals() {
    const container = this.shadowRoot.getElementById('goals-container');
    container.innerHTML = this.goals.map(goal => `
      <div class="goal-item">
        <h4>${goal.title}</h4>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${goal.progress}%"></div>
        </div>
        <span>${goal.progress}% complete</span>
      </div>
    `).join('');
  }
  
  renderHabits() {
    const container = this.shadowRoot.getElementById('habits-container');
    const today = new Date().toDateString();
    
    container.innerHTML = this.habits.map(habit => {
      const completedToday = habit.completedDates?.includes(today);
      return `
        <label class="habit-item">
          <input type="checkbox" ${completedToday ? 'checked' : ''}
                 onchange="this.closest('life-lock-dashboard').toggleHabit('${habit.id}')">
          ${habit.name}
          <span class="streak">🔥 ${habit.streak || 0}</span>
        </label>
      `;
    }).join('');
  }
  
  renderStats() {
    const container = this.shadowRoot.getElementById('stats-container');
    const completedGoals = this.goals.filter(g => g.progress === 100).length;
    const activeHabits = this.habits.filter(h => h.streak > 0).length;
    
    container.innerHTML = `
      <div class="stat-item">
        <strong>${completedGoals}</strong> Goals Completed
      </div>
      <div class="stat-item">
        <strong>${activeHabits}</strong> Active Habits
      </div>
    `;
  }
  
  toggleHabit(habitId) {
    const habit = this.habits.find(h => h.id === habitId);
    if (!habit) return;
    
    const today = new Date().toDateString();
    habit.completedDates = habit.completedDates || [];
    
    if (habit.completedDates.includes(today)) {
      habit.completedDates = habit.completedDates.filter(d => d !== today);
      habit.streak = Math.max(0, habit.streak - 1);
    } else {
      habit.completedDates.push(today);
      habit.streak = (habit.streak || 0) + 1;
    }
    
    this.saveData();
    this.renderHabits();
    this.renderStats();
  }
}

customElements.define('life-lock-dashboard', LifeLockDashboard);
```

---

## 2. Local-First Data Architecture

### 2.1 Simple Storage Layer

**Pattern inspired by Solo's straightforward data handling:**

```javascript
// Simple, effective storage abstraction
class SimpleStore {
  constructor(key, defaultValue = []) {
    this.key = key;
    this.defaultValue = defaultValue;
    this.subscribers = new Set();
    this._data = this.load();
  }
  
  load() {
    try {
      const stored = localStorage.getItem(this.key);
      return stored ? JSON.parse(stored) : this.defaultValue;
    } catch (error) {
      console.warn(`Failed to load ${this.key}:`, error);
      return this.defaultValue;
    }
  }
  
  save() {
    try {
      localStorage.setItem(this.key, JSON.stringify(this._data));
      this.notifySubscribers();
    } catch (error) {
      console.error(`Failed to save ${this.key}:`, error);
    }
  }
  
  get data() {
    return this._data;
  }
  
  set data(newData) {
    this._data = newData;
    this.save();
  }
  
  update(updater) {
    this._data = updater(this._data);
    this.save();
  }
  
  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }
  
  notifySubscribers() {
    this.subscribers.forEach(callback => callback(this._data));
  }
}

// Usage - simple and intuitive
const tasksStore = new SimpleStore('siso-tasks', []);
const habitsStore = new SimpleStore('siso-habits', []);

// Add a task
tasksStore.update(tasks => [...tasks, {
  id: Date.now(),
  title: 'Complete project',
  completed: false,
  createdAt: new Date().toISOString()
}]);

// Subscribe to changes
tasksStore.subscribe(tasks => {
  console.log('Tasks updated:', tasks.length);
  document.dispatchEvent(new CustomEvent('tasks-changed', { detail: tasks }));
});
```

### 2.2 Offline-First with Background Sync

```javascript
// Simple sync mechanism for indie apps
class SyncManager {
  constructor() {
    this.isOnline = navigator.onLine;
    this.syncQueue = [];
    this.stores = new Map();
    
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());
  }
  
  registerStore(name, store, syncConfig) {
    this.stores.set(name, { store, config: syncConfig });
    
    // Subscribe to local changes
    store.subscribe((data) => {
      this.queueSync(name, 'update', data);
    });
  }
  
  queueSync(storeName, operation, data) {
    this.syncQueue.push({
      storeName,
      operation,
      data,
      timestamp: Date.now()
    });
    
    if (this.isOnline) {
      this.processSyncQueue();
    }
  }
  
  async processSyncQueue() {
    if (this.syncQueue.length === 0) return;
    
    const syncItem = this.syncQueue.shift();
    const storeInfo = this.stores.get(syncItem.storeName);
    
    if (!storeInfo) return;
    
    try {
      await this.syncToServer(syncItem, storeInfo.config);
    } catch (error) {
      console.warn(`Sync failed for ${syncItem.storeName}:`, error);
      // Re-queue with exponential backoff
      setTimeout(() => {
        this.syncQueue.unshift(syncItem);
        this.processSyncQueue();
      }, Math.min(30000, 1000 * Math.pow(2, syncItem.retries || 0)));
    }
    
    // Process next item
    if (this.syncQueue.length > 0) {
      setTimeout(() => this.processSyncQueue(), 100);
    }
  }
  
  async syncToServer(syncItem, config) {
    const { storeName, operation, data } = syncItem;
    
    const response = await fetch(config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.token}`
      },
      body: JSON.stringify({
        store: storeName,
        operation,
        data,
        timestamp: syncItem.timestamp
      })
    });
    
    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }
  }
  
  handleOnline() {
    this.isOnline = true;
    console.log('Back online, syncing...');
    this.processSyncQueue();
  }
  
  handleOffline() {
    this.isOnline = false;
    console.log('Gone offline, queuing changes...');
  }
}

// Usage
const syncManager = new SyncManager();

syncManager.registerStore('tasks', tasksStore, {
  endpoint: '/api/sync',
  token: 'user-auth-token'
});

syncManager.registerStore('habits', habitsStore, {
  endpoint: '/api/sync',
  token: 'user-auth-token'
});
```

---

## 3. Vanilla Reactive Patterns

### 3.1 Simple Signal Implementation

**Inspired by Plain Vanilla's signal pattern:**

```javascript
// Lightweight reactive system - no dependencies
class Signal extends EventTarget {
  constructor(initialValue) {
    super();
    this._value = initialValue;
  }
  
  get value() {
    return this._value;
  }
  
  set value(newValue) {
    if (this._value !== newValue) {
      const oldValue = this._value;
      this._value = newValue;
      this.dispatchEvent(new CustomEvent('change', { 
        detail: { oldValue, newValue } 
      }));
    }
  }
  
  effect(callback) {
    const handler = (event) => callback(event.detail.newValue, event.detail.oldValue);
    this.addEventListener('change', handler);
    
    // Call immediately with current value
    callback(this._value);
    
    // Return cleanup function
    return () => this.removeEventListener('change', handler);
  }
  
  map(transform) {
    const mapped = new Signal(transform(this._value));
    this.effect(value => {
      mapped.value = transform(value);
    });
    return mapped;
  }
  
  // Allow implicit conversion
  valueOf() { return this._value; }
  toString() { return String(this._value); }
}

// Computed signals
function computed(dependencies, computeFn) {
  const result = new Signal(computeFn());
  
  dependencies.forEach(dep => {
    dep.effect(() => {
      result.value = computeFn();
    });
  });
  
  return result;
}

// Factory function
const signal = (value) => new Signal(value);

// Usage example
const taskCount = signal(0);
const completedCount = signal(0);

const completionRate = computed([taskCount, completedCount], () => {
  return taskCount.value > 0 ? completedCount.value / taskCount.value : 0;
});

// React to changes
completionRate.effect(rate => {
  document.getElementById('completion-rate').textContent = `${Math.round(rate * 100)}%`;
});

// Update signals
taskCount.value = 10;
completedCount.value = 7; // Automatically updates completion rate display
```

### 3.2 Component State Management

```javascript
// Vanilla component with reactive state
class TaskManager extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    // Reactive state
    this.tasks = signal([]);
    this.filter = signal('all');
    this.isLoading = signal(false);
    
    // Computed values
    this.filteredTasks = computed([this.tasks, this.filter], () => {
      const tasks = this.tasks.value;
      const filterValue = this.filter.value;
      
      switch (filterValue) {
        case 'completed': return tasks.filter(t => t.completed);
        case 'pending': return tasks.filter(t => !t.completed);
        default: return tasks;
      }
    });
    
    this.completedCount = computed([this.tasks], () => 
      this.tasks.value.filter(t => t.completed).length
    );
  }
  
  connectedCallback() {
    this.render();
    this.setupEventListeners();
    this.loadTasks();
  }
  
  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: system-ui, sans-serif;
          max-width: 600px;
          margin: 0 auto;
          padding: 2rem;
        }
        
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        
        .filters {
          display: flex;
          gap: 0.5rem;
        }
        
        .filter-btn {
          padding: 0.5rem 1rem;
          border: 1px solid #ddd;
          background: white;
          cursor: pointer;
          border-radius: 4px;
        }
        
        .filter-btn.active {
          background: #007bff;
          color: white;
        }
        
        .task-form {
          margin-bottom: 1rem;
          display: flex;
          gap: 0.5rem;
        }
        
        .task-input {
          flex: 1;
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        
        .task-list {
          list-style: none;
          padding: 0;
        }
        
        .task-item {
          display: flex;
          align-items: center;
          padding: 0.5rem;
          border: 1px solid #eee;
          margin-bottom: 0.5rem;
          border-radius: 4px;
        }
        
        .task-item input[type="checkbox"] {
          margin-right: 0.5rem;
        }
        
        .task-text {
          flex: 1;
        }
        
        .task-item.completed .task-text {
          text-decoration: line-through;
          opacity: 0.6;
        }
        
        .loading {
          text-align: center;
          padding: 2rem;
          opacity: 0.6;
        }
      </style>
      
      <div class="header">
        <h2>Tasks (<span id="completed-count">0</span> completed)</h2>
        <div class="filters">
          <button class="filter-btn active" data-filter="all">All</button>
          <button class="filter-btn" data-filter="pending">Pending</button>
          <button class="filter-btn" data-filter="completed">Completed</button>
        </div>
      </div>
      
      <form class="task-form">
        <input type="text" class="task-input" placeholder="Add a new task..." required>
        <button type="submit">Add</button>
      </form>
      
      <div id="loading" class="loading" style="display: none;">Loading...</div>
      <ul id="task-list" class="task-list"></ul>
    `;
    
    this.setupReactiveUpdates();
  }
  
  setupReactiveUpdates() {
    // Update completed count
    this.completedCount.effect(count => {
      const span = this.shadowRoot.getElementById('completed-count');
      if (span) span.textContent = count;
    });
    
    // Update task list
    this.filteredTasks.effect(tasks => {
      this.renderTasks(tasks);
    });
    
    // Update filter buttons
    this.filter.effect(activeFilter => {
      this.shadowRoot.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === activeFilter);
      });
    });
    
    // Update loading state
    this.isLoading.effect(loading => {
      const loadingEl = this.shadowRoot.getElementById('loading');
      const taskList = this.shadowRoot.getElementById('task-list');
      if (loadingEl && taskList) {
        loadingEl.style.display = loading ? 'block' : 'none';
        taskList.style.display = loading ? 'none' : 'block';
      }
    });
  }
  
  setupEventListeners() {
    // Add task form
    this.shadowRoot.querySelector('.task-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const input = this.shadowRoot.querySelector('.task-input');
      this.addTask(input.value.trim());
      input.value = '';
    });
    
    // Filter buttons
    this.shadowRoot.addEventListener('click', (e) => {
      if (e.target.classList.contains('filter-btn')) {
        this.filter.value = e.target.dataset.filter;
      }
    });
  }
  
  renderTasks(tasks) {
    const taskList = this.shadowRoot.getElementById('task-list');
    if (!taskList) return;
    
    taskList.innerHTML = tasks.map(task => `
      <li class="task-item ${task.completed ? 'completed' : ''}">
        <input type="checkbox" ${task.completed ? 'checked' : ''} 
               onchange="this.closest('task-manager').toggleTask('${task.id}')">
        <span class="task-text">${task.text}</span>
        <button onclick="this.closest('task-manager').deleteTask('${task.id}')">Delete</button>
      </li>
    `).join('');
  }
  
  async loadTasks() {
    this.isLoading.value = true;
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      const stored = localStorage.getItem('tasks');
      this.tasks.value = stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      this.isLoading.value = false;
    }
  }
  
  addTask(text) {
    if (!text) return;
    
    const newTask = {
      id: Date.now().toString(),
      text,
      completed: false,
      createdAt: new Date().toISOString()
    };
    
    this.tasks.value = [...this.tasks.value, newTask];
    this.saveTasks();
  }
  
  toggleTask(taskId) {
    this.tasks.value = this.tasks.value.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    this.saveTasks();
  }
  
  deleteTask(taskId) {
    this.tasks.value = this.tasks.value.filter(task => task.id !== taskId);
    this.saveTasks();
  }
  
  saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(this.tasks.value));
  }
}

customElements.define('task-manager', TaskManager);
```

---

## 4. HTML Templating & Security

### 4.1 Safe HTML Templating

**Pattern from Plain Vanilla for XSS prevention:**

```javascript
// Safe HTML templating utility
class Html extends String {}

const htmlEncode = (str) => {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
};

// Tagged template literal for safe HTML
const html = (strings, ...values) => {
  let result = '';
  for (let i = 0; i < strings.length; i++) {
    result += strings[i];
    if (i < values.length) {
      const value = values[i];
      // Don't double-encode already safe HTML
      if (value instanceof Html) {
        result += value;
      } else {
        result += htmlEncode(String(value));
      }
    }
  }
  return new Html(result);
};

// Mark HTML as safe (for when you know it's safe)
const htmlRaw = (str) => new Html(str);

// Usage examples
const userName = '<script>alert("xss")</script>';
const userBio = 'I love <strong>coding</strong>!';

// Safe by default - userName is encoded, userBio is not
const template = html`
  <div class="user-profile">
    <h2>Welcome, ${userName}!</h2>
    <p>Bio: ${userBio}</p>
    <div class="actions">
      ${htmlRaw('<button onclick="editProfile()">Edit Profile</button>')}
    </div>
  </div>
`;

// Use in component
class UserProfile extends HTMLElement {
  render(user) {
    this.innerHTML = html`
      <div class="profile">
        <img src="${user.avatar}" alt="Avatar for ${user.name}">
        <h3>${user.name}</h3>
        <p>${user.bio}</p>
        <div class="stats">
          ${user.stats.map(stat => html`
            <span class="stat">
              <strong>${stat.value}</strong> ${stat.label}
            </span>
          `).join('')}
        </div>
      </div>
    `;
  }
}
```

### 4.2 Component Communication

```javascript
// Event-based component communication
class EventBus {
  constructor() {
    this.events = new EventTarget();
  }
  
  emit(eventName, data) {
    this.events.dispatchEvent(new CustomEvent(eventName, { detail: data }));
  }
  
  on(eventName, callback) {
    this.events.addEventListener(eventName, callback);
    return () => this.events.removeEventListener(eventName, callback);
  }
  
  once(eventName, callback) {
    const handler = (event) => {
      callback(event);
      this.events.removeEventListener(eventName, handler);
    };
    this.events.addEventListener(eventName, handler);
  }
}

// Global event bus
window.eventBus = new EventBus();

// Component A - emits events
class TaskCreator extends HTMLElement {
  createTask(taskData) {
    // Create task locally
    const task = { id: Date.now(), ...taskData };
    
    // Emit event for other components
    window.eventBus.emit('task:created', task);
    
    // Also emit DOM event for parent elements
    this.dispatchEvent(new CustomEvent('task-created', {
      detail: task,
      bubbles: true
    }));
  }
}

// Component B - listens for events  
class TaskList extends HTMLElement {
  connectedCallback() {
    // Listen to global events
    this.unsubscribe = window.eventBus.on('task:created', (event) => {
      this.addTaskToList(event.detail);
    });
    
    // Also listen to DOM events
    document.addEventListener('task-created', this.handleTaskCreated.bind(this));
  }
  
  disconnectedCallback() {
    if (this.unsubscribe) this.unsubscribe();
    document.removeEventListener('task-created', this.handleTaskCreated.bind(this));
  }
  
  handleTaskCreated(event) {
    this.addTaskToList(event.detail);
  }
  
  addTaskToList(task) {
    // Update UI
    const taskElement = document.createElement('div');
    taskElement.innerHTML = html`
      <div class="task-item" data-task-id="${task.id}">
        <span>${task.title}</span>
        <button onclick="this.closest('task-list').deleteTask('${task.id}')">
          Delete
        </button>
      </div>
    `;
    this.appendChild(taskElement);
  }
}
```

---

## 5. Project Structure & Development Workflow

### 5.1 Indie-Friendly File Organization

```
siso/
├── public/                 # Static assets served directly
│   ├── index.html         # Main app entry
│   ├── app.js             # Application bootstrap
│   ├── styles.css         # Global styles
│   └── favicon.ico        # App icon
├── src/
│   ├── components/        # Web components
│   │   ├── core/         # Core UI components
│   │   │   ├── app-shell.js
│   │   │   ├── navigation.js
│   │   │   └── theme-toggle.js
│   │   ├── lifelock/     # LifeLock-specific components
│   │   │   ├── dashboard.js
│   │   │   ├── goal-card.js
│   │   │   └── habit-tracker.js
│   │   ├── tasks/        # Task management
│   │   │   ├── task-list.js
│   │   │   ├── task-item.js
│   │   │   └── task-form.js
│   │   └── time/         # Time tracking
│   │       ├── timer.js
│   │       ├── time-log.js
│   │       └── statistics.js
│   ├── lib/              # Core utilities (keep minimal)
│   │   ├── signal.js     # Reactive system
│   │   ├── storage.js    # Data persistence
│   │   ├── html.js       # Safe templating
│   │   └── events.js     # Event utilities
│   ├── data/             # Data layer
│   │   ├── stores.js     # Data stores
│   │   ├── sync.js       # Cloud synchronization
│   │   └── migrations.js # Data migrations
│   └── styles/           # Modular styles
│       ├── reset.css     # CSS reset
│       ├── variables.css # CSS custom properties
│       ├── components.css # Component styles
│       └── themes.css    # Theme variations
├── scripts/              # Development scripts
│   ├── dev-server.js     # Local development server
│   ├── build.js          # Build process
│   └── deploy.js         # Deployment script
├── tests/                # Testing (minimal but effective)
│   ├── components/       # Component tests
│   ├── utils/           # Utility tests
│   └── integration/     # Integration tests
└── docs/                # Documentation
    ├── architecture.md   # Architecture decisions
    ├── components.md     # Component documentation
    └── deployment.md     # Deployment guide
```

### 5.2 Development Server (Simple)

```javascript
// scripts/dev-server.js - Simple development server
const fs = require('fs');
const path = require('path');
const http = require('http');

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

class DevServer {
  constructor(port = 8080, root = './public') {
    this.port = port;
    this.root = path.resolve(root);
    this.server = null;
  }
  
  start() {
    this.server = http.createServer((req, res) => {
      this.handleRequest(req, res);
    });
    
    this.server.listen(this.port, () => {
      console.log(`🚀 Dev server running at http://localhost:${this.port}`);
      console.log(`📁 Serving from: ${this.root}`);
    });
  }
  
  handleRequest(req, res) {
    let filePath = req.url === '/' ? '/index.html' : req.url;
    filePath = path.join(this.root, filePath);
    
    // Security check
    if (!filePath.startsWith(this.root)) {
      this.sendError(res, 403, 'Forbidden');
      return;
    }
    
    fs.readFile(filePath, (err, content) => {
      if (err) {
        if (err.code === 'ENOENT') {
          // For SPA routing, serve index.html for non-existent routes
          if (!path.extname(filePath)) {
            fs.readFile(path.join(this.root, 'index.html'), (indexErr, indexContent) => {
              if (indexErr) {
                this.sendError(res, 404, 'Not Found');
              } else {
                this.sendFile(res, indexContent, 'text/html');
              }
            });
          } else {
            this.sendError(res, 404, 'Not Found');
          }
        } else {
          this.sendError(res, 500, 'Internal Server Error');
        }
      } else {
        const ext = path.extname(filePath);
        const mimeType = MIME_TYPES[ext] || 'text/plain';
        this.sendFile(res, content, mimeType);
      }
    });
  }
  
  sendFile(res, content, mimeType) {
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Cache-Control', 'no-cache'); // For development
    res.writeHead(200);
    res.end(content);
  }
  
  sendError(res, statusCode, message) {
    res.writeHead(statusCode, { 'Content-Type': 'text/plain' });
    res.end(message);
  }
  
  stop() {
    if (this.server) {
      this.server.close(() => {
        console.log('📴 Dev server stopped');
      });
    }
  }
}

// Start server
const server = new DevServer();
server.start();

// Graceful shutdown
process.on('SIGINT', () => {
  server.stop();
  process.exit(0);
});
```

### 5.3 Simple Build Process

```javascript
// scripts/build.js - Simple build process
const fs = require('fs').promises;
const path = require('path');

class SimpleBuild {
  constructor() {
    this.srcDir = './src';
    this.publicDir = './public';
    this.distDir = './dist';
  }
  
  async build() {
    console.log('🔨 Starting build...');
    
    try {
      await this.cleanDist();
      await this.copyPublic();
      await this.bundleComponents();
      await this.processCSS();
      await this.generateManifest();
      
      console.log('✅ Build completed successfully!');
    } catch (error) {
      console.error('❌ Build failed:', error);
      process.exit(1);
    }
  }
  
  async cleanDist() {
    try {
      await fs.rm(this.distDir, { recursive: true, force: true });
      await fs.mkdir(this.distDir, { recursive: true });
    } catch (error) {
      // Directory might not exist, that's okay
    }
  }
  
  async copyPublic() {
    await this.copyRecursive(this.publicDir, this.distDir);
  }
  
  async bundleComponents() {
    const componentsDir = path.join(this.srcDir, 'components');
    const components = await this.findFiles(componentsDir, '.js');
    
    let bundle = '';
    for (const component of components) {
      const content = await fs.readFile(component, 'utf-8');
      bundle += `// ${path.relative(this.srcDir, component)}\n${content}\n\n`;
    }
    
    await fs.writeFile(path.join(this.distDir, 'components.js'), bundle);
  }
  
  async processCSS() {
    const stylesDir = path.join(this.srcDir, 'styles');
    const cssFiles = await this.findFiles(stylesDir, '.css');
    
    let combinedCSS = '';
    for (const cssFile of cssFiles) {
      const content = await fs.readFile(cssFile, 'utf-8');
      combinedCSS += `/* ${path.relative(this.srcDir, cssFile)} */\n${content}\n\n`;
    }
    
    await fs.writeFile(path.join(this.distDir, 'styles.css'), combinedCSS);
  }
  
  async generateManifest() {
    const manifest = {
      name: 'SISO',
      version: '1.0.0',
      files: await this.getFileList(this.distDir),
      buildTime: new Date().toISOString()
    };
    
    await fs.writeFile(
      path.join(this.distDir, 'manifest.json'),
      JSON.stringify(manifest, null, 2)
    );
  }
  
  async copyRecursive(src, dest) {
    const entries = await fs.readdir(src, { withFileTypes: true });
    
    await fs.mkdir(dest, { recursive: true });
    
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      
      if (entry.isDirectory()) {
        await this.copyRecursive(srcPath, destPath);
      } else {
        await fs.copyFile(srcPath, destPath);
      }
    }
  }
  
  async findFiles(dir, extension) {
    const files = [];
    
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          files.push(...await this.findFiles(fullPath, extension));
        } else if (entry.name.endsWith(extension)) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Directory might not exist
    }
    
    return files;
  }
  
  async getFileList(dir) {
    const files = [];
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.isFile()) {
        files.push(entry.name);
      }
    }
    
    return files;
  }
}

// Run build
const build = new SimpleBuild();
build.build();
```

---

## 6. Testing Strategy for Indie Apps

### 6.1 Minimal, Effective Testing

```javascript
// Simple testing framework - no dependencies
class SimpleTest {
  constructor(name) {
    this.name = name;
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
  }
  
  test(description, testFn) {
    this.tests.push({ description, testFn });
  }
  
  async run() {
    console.log(`\n🧪 Running ${this.name}`);
    console.log('='.repeat(50));
    
    for (const { description, testFn } of this.tests) {
      try {
        await testFn();
        this.passed++;
        console.log(`✅ ${description}`);
      } catch (error) {
        this.failed++;
        console.log(`❌ ${description}`);
        console.log(`   Error: ${error.message}`);
      }
    }
    
    console.log(`\n📊 Results: ${this.passed} passed, ${this.failed} failed`);
    return this.failed === 0;
  }
}

// Simple assertions
const assert = {
  equal: (actual, expected, message = '') => {
    if (actual !== expected) {
      throw new Error(`${message}\nExpected: ${expected}\nActual: ${actual}`);
    }
  },
  
  ok: (value, message = '') => {
    if (!value) {
      throw new Error(`${message}\nExpected truthy value, got: ${value}`);
    }
  },
  
  throws: (fn, message = '') => {
    try {
      fn();
      throw new Error(`${message}\nExpected function to throw`);
    } catch (error) {
      // Expected
    }
  }
};

// Example tests
const storageTests = new SimpleTest('Storage Tests');

storageTests.test('should store and retrieve data', () => {
  const store = new SimpleStore('test-key', []);
  store.data = [{ id: 1, name: 'test' }];
  
  const newStore = new SimpleStore('test-key', []);
  assert.equal(newStore.data.length, 1);
  assert.equal(newStore.data[0].name, 'test');
});

storageTests.test('should notify subscribers', () => {
  const store = new SimpleStore('test-key-2', []);
  let notified = false;
  
  store.subscribe(() => { notified = true; });
  store.data = [{ id: 1 }];
  
  assert.ok(notified, 'Subscriber should be notified');
});

// Component tests
const componentTests = new SimpleTest('Component Tests');

componentTests.test('should create task component', () => {
  const component = new TaskManager();
  document.body.appendChild(component);
  
  assert.ok(component.shadowRoot, 'Should have shadow root');
  assert.ok(component.tasks, 'Should have tasks signal');
  
  document.body.removeChild(component);
});

// Run all tests
async function runAllTests() {
  const results = await Promise.all([
    storageTests.run(),
    componentTests.run()
  ]);
  
  const allPassed = results.every(result => result);
  
  if (allPassed) {
    console.log('\n🎉 All tests passed!');
    process.exit(0);
  } else {
    console.log('\n💥 Some tests failed!');
    process.exit(1);
  }
}

runAllTests();
```

---

## 7. SISO Implementation Strategy

### 7.1 Migration to Indie Architecture

**Phase 1: Foundation (Week 1)**
```javascript
// Step 1: Create core utilities
// src/lib/signal.js - Reactive system
// src/lib/storage.js - Data persistence
// src/lib/html.js - Safe templating
// src/lib/events.js - Event utilities

// Step 2: Convert one component to vanilla
class SISOLifeLockDashboard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    // Reactive state with signals
    this.goals = signal([]);
    this.habits = signal([]);
    this.selectedGoal = signal(null);
  }
  
  connectedCallback() {
    this.render();
    this.loadData();
  }
  
  // ... implementation similar to examples above
}
```

**Phase 2: Data Layer (Week 2)**
```javascript
// Create simple stores for each domain
const sisoStores = {
  goals: new SimpleStore('siso-goals', []),
  habits: new SimpleStore('siso-habits', []),
  tasks: new SimpleStore('siso-tasks', []),
  timeEntries: new SimpleStore('siso-time-entries', [])
};

// Setup sync manager
const syncManager = new SyncManager();
Object.entries(sisoStores).forEach(([name, store]) => {
  syncManager.registerStore(name, store, {
    endpoint: '/api/sync',
    token: localStorage.getItem('auth-token')
  });
});
```

**Phase 3: Component Migration (Weeks 3-4)**
```javascript
// Systematically convert components
// Priority order:
// 1. LifeLock Dashboard (most used)
// 2. Task Management
// 3. Time Tracking
// 4. Settings/Profile

// Each component follows the same pattern:
class SISOComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    // Setup reactive state
    // Setup computed values
  }
  
  connectedCallback() {
    this.render();
    this.setupEventListeners();
    this.setupReactiveUpdates();
  }
  
  // Standard methods
  render() { /* Shadow DOM template */ }
  setupEventListeners() { /* Event binding */ }
  setupReactiveUpdates() { /* Signal effects */ }
}
```

### 7.2 Benefits for SISO

**Development Velocity:**
- No build tools needed for development
- Instant page refresh - no compilation
- Simple debugging in browser DevTools
- Components can be developed in isolation

**Maintainability:**
- No framework lock-in
- Smaller bundle size (< 100KB total)
- Easier onboarding for new developers
- Platform-native patterns

**Performance:**
- Faster initial load (no framework overhead)
- Better caching (granular component loading)
- Native web performance optimizations
- Smaller memory footprint

**User Experience:**
- Works offline by default
- Fast interactions (no virtual DOM)
- Progressive enhancement support
- Accessible by default

---

## 8. Deployment Strategy

### 8.1 Static Hosting Approach

```javascript
// Simple deployment to static hosts (Vercel, Netlify, GitHub Pages)
// scripts/deploy.js
const { execSync } = require('child_process');
const fs = require('fs');

class StaticDeploy {
  constructor() {
    this.buildDir = './dist';
    this.deployConfig = {
      vercel: {
        command: 'vercel --prod',
        configFile: 'vercel.json'
      },
      netlify: {
        command: 'netlify deploy --prod --dir=dist',
        configFile: 'netlify.toml'
      }
    };
  }
  
  async deploy(platform = 'vercel') {
    console.log(`🚀 Deploying to ${platform}...`);
    
    // Run build first
    execSync('npm run build', { stdio: 'inherit' });
    
    // Generate platform-specific config
    this.generateConfig(platform);
    
    // Deploy
    const config = this.deployConfig[platform];
    execSync(config.command, { stdio: 'inherit' });
    
    console.log(`✅ Deployed to ${platform}!`);
  }
  
  generateConfig(platform) {
    switch (platform) {
      case 'vercel':
        const vercelConfig = {
          "rewrites": [
            { "source": "/(.*)", "destination": "/index.html" }
          ],
          "headers": [
            {
              "source": "/(.*)",
              "headers": [
                { "key": "Cache-Control", "value": "public, max-age=31536000" }
              ]
            }
          ]
        };
        fs.writeFileSync('vercel.json', JSON.stringify(vercelConfig, null, 2));
        break;
        
      case 'netlify':
        const netlifyConfig = `
[build]
  publish = "dist"
  command = "npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000"
        `;
        fs.writeFileSync('netlify.toml', netlifyConfig);
        break;
    }
  }
}

// Usage
const deployer = new StaticDeploy();
const platform = process.argv[2] || 'vercel';
deployer.deploy(platform);
```

---

## 9. Key Recommendations for SISO

### 9.1 Immediate Actions

1. **Start with One Component** - Convert LifeLock Dashboard to vanilla web component
2. **Implement Signal System** - Create reactive state management
3. **Setup Simple Stores** - Replace complex state management with local storage
4. **Create Dev Environment** - Simple development server with hot reload

### 9.2 Success Metrics

**Developer Experience:**
- **Page Load Time:** < 2 seconds (vs current 5-8 seconds)
- **Development Setup:** < 5 minutes (vs current complex setup)
- **Build Time:** < 10 seconds (vs current webpack builds)
- **Bundle Size:** < 100KB (vs current large bundles)

**Code Quality:**
- **Cognitive Complexity:** < 10 per component
- **Dependencies:** < 5 total (vs current dozens)
- **Test Coverage:** > 80% (simple tests)
- **Bug Rate:** < 1 per month (due to simplicity)

### 9.3 Long-term Vision

SISO becomes a **reference implementation** for indie web development:
- Template for other personal productivity apps
- Showcase of vanilla web development patterns
- Educational resource for developers
- Proof that complex apps don't need complex architectures

---

## 10. Conclusion

Indie developer architecture prioritizes **simplicity over complexity**, **maintainability over features**, and **developer ergonomics over corporate constraints**. Key principles include:

1. **Vanilla-First Development** - Use platform primitives before frameworks
2. **File-Based Organization** - Simple, predictable project structures  
3. **Local-First Data** - Apps work offline, sync enhances experience
4. **Zero-Dependency Philosophy** - Minimize external dependencies
5. **Developer-Friendly Patterns** - Reduce cognitive load and friction

For SISO, adopting indie patterns means:
- Transforming from React complexity to vanilla web components
- Implementing simple reactive state with custom signals
- Creating offline-first data layer with localStorage + sync
- Building development workflow optimized for solo/small team productivity

The result will be a fast, maintainable, delightful application that serves as a template for modern indie web development.

---

**Document Version:** 1.0  
**Research Phase:** Indie Developer Architecture Analysis  
**Implementation Priority:** High - Core to SISO transformation  
**Next Phase:** Rapid Prototyping Architecture Patterns