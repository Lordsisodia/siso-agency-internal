# Rapid Prototyping Architecture Patterns for Personal Apps

*Research Document #4 - Part of SISO Architectural Transformation*

## Research Methodology
This research examines how successful personal apps and indie products enable rapid prototyping while maintaining long-term maintainability. Focus on patterns that accelerate iteration speed without creating technical debt.

## Key Principle: Speed as Architecture

### The 10-Minute Rule
- Any new feature should be testable within 10 minutes of conception
- Architecture decisions must prioritize iteration speed over theoretical perfection
- Fast feedback loops are more valuable than comprehensive planning

### Hot Reloading Everything
```javascript
// File watcher for instant updates
if (import.meta.hot) {
  import.meta.hot.accept('./components', () => {
    // Preserve app state during hot reload
    const currentState = globalState.export();
    window.location.reload();
    globalState.import(currentState);
  });
}
```

## Prototype-First Architecture Patterns

### 1. File-Based Routing for Instant Pages
```javascript
// pages/dashboard.js - automatically becomes /dashboard route
export default function Dashboard() {
  return html`
    <div>
      <h1>Dashboard</h1>
      ${render(widgets)}
    </div>
  `;
}

// No routing config needed - filesystem IS the router
```

### 2. Convention Over Configuration
```javascript
// components/TaskList.js
// Auto-discovered and registered by file name
export default class TaskList extends HTMLElement {
  static observedAttributes = ['filter', 'sort'];
  // Convention: camelCase filename = kebab-case tag
  // TaskList.js becomes <task-list>
}
```

### 3. Zero-Config Database Schema
```javascript
// models/Task.js - schema inferred from usage
export class Task {
  constructor(data) {
    Object.assign(this, {
      id: generateId(),
      createdAt: new Date(),
      completed: false,
      ...data
    });
  }
  
  // Schema evolves with the code - no migrations
  save() {
    return db.tasks.put(this);
  }
}
```

## Rapid Prototyping Storage Patterns

### SchemaLess Local Storage
```javascript
// Storage adapts to whatever you throw at it
class AdaptiveStore {
  constructor(name) {
    this.name = name;
    this.data = this.load() || {};
  }
  
  set(key, value) {
    this.data[key] = value;
    this.save();
    this.emit('change', { key, value });
    return this;
  }
  
  get(key, defaultValue) {
    return this.data[key] ?? defaultValue;
  }
  
  // Auto-saves every change - no explicit save() needed
  save() {
    localStorage.setItem(this.name, JSON.stringify(this.data));
  }
}
```

### Instant API Endpoints
```javascript
// api/tasks.js - becomes /api/tasks endpoint
export async function GET(request) {
  const tasks = await db.tasks.toArray();
  return Response.json(tasks);
}

export async function POST(request) {
  const data = await request.json();
  const task = await db.tasks.add(data);
  return Response.json(task);
}
```

## Live Development Patterns

### 1. Runtime Component Creation
```javascript
// Create components on-the-fly during development
function createComponent(name, template) {
  if (customElements.get(name)) return;
  
  class DynamicComponent extends HTMLElement {
    connectedCallback() {
      this.innerHTML = template;
    }
  }
  
  customElements.define(name, DynamicComponent);
}

// Test ideas instantly
createComponent('quick-test', '<p>Testing new idea...</p>');
```

### 2. Console-Driven Development
```javascript
// Make everything accessible from console for rapid testing
window.app = {
  store: globalStore,
  components: componentRegistry,
  utils: utilityFunctions,
  
  // Rapid testing helpers
  addTask: (title) => store.tasks.add({ title }),
  clearAll: () => store.clear(),
  setState: (state) => store.import(state)
};
```

### 3. Visual Debug Mode
```javascript
// Toggle visual debugging without code changes
class DebugMode {
  static enabled = localStorage.getItem('debug') === 'true';
  
  static toggle() {
    this.enabled = !this.enabled;
    localStorage.setItem('debug', this.enabled);
    this.updateVisuals();
  }
  
  static updateVisuals() {
    document.body.classList.toggle('debug-mode', this.enabled);
    // Show component boundaries, state changes, etc.
  }
}
```

## Successful Personal App Examples

### Obsidian's Plugin Architecture
- Core app is minimal and fast
- Plugins can be enabled/disabled instantly
- Plugin development uses hot reloading
- File-based everything (notes, plugins, themes)

### Super Productivity's Feature Flags
```typescript
// Feature flags for rapid A/B testing
export const FEATURE_FLAGS = {
  NEW_TASK_DIALOG: localStorage.getItem('ff_new_task_dialog') !== 'false',
  ENHANCED_SEARCH: localStorage.getItem('ff_enhanced_search') === 'true',
  AI_SUGGESTIONS: localStorage.getItem('ff_ai') === 'true'
};

// Toggle from console: localStorage.setItem('ff_ai', 'true')
```

### Raycast's Extension System
- Extensions are isolated TypeScript files
- Hot reloading during development
- Instant installation from filesystem
- No build process for simple extensions

## Prototyping-Friendly File Structure
```
src/
├── experiments/          # Throwaway prototypes
│   ├── idea-001-ai-chat/
│   └── idea-002-voice-notes/
├── components/
│   └── stable/          # Promoted from experiments
├── pages/               # Auto-routed pages
├── api/                 # Auto-endpoints
└── utils/
    ├── dev.js          # Development helpers
    └── prototype.js    # Rapid creation utilities
```

## Anti-Patterns That Slow Prototyping

### ❌ Complex Build Processes
```javascript
// BAD: Requires build step for every change
import { styled } from '@emotion/styled';
const Button = styled.button`...`;
```

### ✅ Direct Browser APIs
```javascript
// GOOD: Works immediately in browser
const button = document.createElement('button');
button.style.cssText = 'padding: 8px 16px; ...';
```

### ❌ Heavy Abstractions
```typescript
// BAD: Too much ceremony for simple features
class TaskRepository extends BaseRepository<Task> {
  constructor(private dataSource: DataSource) {
    super(dataSource);
  }
}
```

### ✅ Direct Data Access
```javascript
// GOOD: Prototype first, abstract later
const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
tasks.push(newTask);
localStorage.setItem('tasks', JSON.stringify(tasks));
```

## Prototype-to-Production Migration

### Phase 1: Rapid Prototype
```javascript
// Quick and dirty - prove the concept
let todos = [];
function addTodo(text) {
  todos.push({ id: Date.now(), text, done: false });
  render();
}
```

### Phase 2: Add Structure
```javascript
// Add basic organization without breaking existing code
class TodoStore {
  constructor() {
    this.todos = JSON.parse(localStorage.getItem('todos') || '[]');
  }
  
  add(text) {
    const todo = { id: Date.now(), text, done: false };
    this.todos.push(todo);
    this.save();
    return todo;
  }
  
  save() {
    localStorage.setItem('todos', JSON.stringify(this.todos));
  }
}
```

### Phase 3: Production Ready
```javascript
// Add robustness while maintaining simplicity
class TodoStore extends EventEmitter {
  constructor() {
    super();
    this.todos = this.loadTodos();
    this.setupAutoSave();
  }
  
  loadTodos() {
    try {
      return JSON.parse(localStorage.getItem('todos') || '[]');
    } catch (error) {
      console.warn('Failed to load todos:', error);
      return [];
    }
  }
}
```

## Key Insights for SISO Architecture

### 1. Start Simple, Scale Complexity
- Begin with basic HTML/CSS/JS files
- Add tooling only when it solves actual problems
- Every abstraction should be removable

### 2. Convention-Based Everything
- File naming determines behavior
- Consistent patterns reduce decision fatigue
- New features follow established conventions

### 3. Live Feedback Loops
- Changes visible within seconds
- State preserved across reloads
- Console access to all internals

### 4. Throwaway Code is OK
- Experiments folder for rapid testing
- Easy promotion of successful ideas
- No guilt about deleting failed experiments

## Implementation Recommendations for SISO

1. **Start Fresh**: Create new `siso-v2/` alongside existing app
2. **File-Based Routing**: Pages auto-register from filesystem
3. **Component Convention**: Filename determines web component tag
4. **Zero-Config Storage**: Schema evolves with usage
5. **Hot Module Replacement**: Preserve state during development
6. **Visual Debug Mode**: Toggle debugging from console
7. **Feature Flags**: Test ideas without code branches

This approach allows rapid iteration while maintaining the path to production-quality code. The key is starting simple and adding complexity only when it provides clear value.