# 🎯 TaskContainer.tsx Decomposition Plan

## Current State Analysis

**File:** `/src/components/tasks/TaskContainer.tsx`  
**Risk Level:** 🔴 **HIGH** - Changes affect both Deep Work and Light Work

### Current Responsibilities (Too Many!)
1. **CRUD Operations** - Create, read, update, delete tasks
2. **State Management** - Loading states, error handling, filters
3. **Business Logic** - Task validation, completion rules
4. **UI Coordination** - Managing child component interactions
5. **Data Transformation** - Converting between API and UI formats
6. **Context Switching** - Handling different task types (light/deep work)
7. **Caching Logic** - Optimistic updates and cache management
8. **Event Handling** - Task interactions and user actions

## Decomposition Strategy

### **Phase 1: Extract CRUD Operations**

#### `hooks/useTaskCRUD.ts`
```typescript
interface TaskCRUDConfig {
  taskType: 'light-work' | 'deep-work';
  userId?: string;
}

export const useTaskCRUD = ({ taskType, userId }: TaskCRUDConfig) => {
  const queryClient = useQueryClient();

  // READ Operations
  const {
    data: tasks = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['tasks', taskType, userId],
    queryFn: () => taskService.getTasks(taskType, userId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // CREATE Operations
  const createTaskMutation = useMutation({
    mutationFn: (newTask: CreateTaskInput) => 
      taskService.createTask(taskType, newTask),
    onMutate: async (newTask) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['tasks', taskType, userId] });
      
      const previousTasks = queryClient.getQueryData(['tasks', taskType, userId]);
      
      queryClient.setQueryData(['tasks', taskType, userId], (old: Task[]) => [
        ...old,
        { ...newTask, id: `temp-${Date.now()}`, status: 'pending' }
      ]);
      
      return { previousTasks };
    },
    onError: (err, newTask, context) => {
      // Rollback on error
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks', taskType, userId], context.previousTasks);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', taskType, userId] });
    },
  });

  // UPDATE Operations
  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, updates }: { taskId: string; updates: Partial<Task> }) =>
      taskService.updateTask(taskType, taskId, updates),
    onMutate: async ({ taskId, updates }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks', taskType, userId] });
      
      const previousTasks = queryClient.getQueryData(['tasks', taskType, userId]);
      
      queryClient.setQueryData(['tasks', taskType, userId], (old: Task[]) =>
        old.map(task => task.id === taskId ? { ...task, ...updates } : task)
      );
      
      return { previousTasks };
    },
    onError: (err, variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks', taskType, userId], context.previousTasks);
      }
    },
  });

  // DELETE Operations
  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: string) => taskService.deleteTask(taskType, taskId),
    onMutate: async (taskId) => {
      await queryClient.cancelQueries({ queryKey: ['tasks', taskType, userId] });
      
      const previousTasks = queryClient.getQueryData(['tasks', taskType, userId]);
      
      queryClient.setQueryData(['tasks', taskType, userId], (old: Task[]) =>
        old.filter(task => task.id !== taskId)
      );
      
      return { previousTasks };
    },
    onError: (err, taskId, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks', taskType, userId], context.previousTasks);
      }
    },
  });

  return {
    // Data
    tasks,
    isLoading,
    error,
    
    // Operations
    createTask: createTaskMutation.mutate,
    updateTask: updateTaskMutation.mutate,
    deleteTask: deleteTaskMutation.mutate,
    refetchTasks: refetch,
    
    // Status
    isCreating: createTaskMutation.isPending,
    isUpdating: updateTaskMutation.isPending,
    isDeleting: deleteTaskMutation.isPending,
  };
};
```

### **Phase 2: Extract State Management**

#### `hooks/useTaskState.ts`
```typescript
interface TaskFilters {
  status?: 'pending' | 'completed' | 'in-progress';
  priority?: 'low' | 'medium' | 'high';
  category?: string;
  dateRange?: { start: Date; end: Date };
}

interface TaskSortOptions {
  field: 'createdAt' | 'priority' | 'dueDate' | 'title';
  direction: 'asc' | 'desc';
}

export const useTaskState = (initialTasks: Task[] = []) => {
  const [filters, setFilters] = useState<TaskFilters>({});
  const [sortOptions, setSortOptions] = useState<TaskSortOptions>({
    field: 'createdAt',
    direction: 'desc'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());

  // Filtered and sorted tasks
  const processedTasks = useMemo(() => {
    let result = [...initialTasks];

    // Apply filters
    if (filters.status) {
      result = result.filter(task => task.status === filters.status);
    }
    
    if (filters.priority) {
      result = result.filter(task => task.priority === filters.priority);
    }
    
    if (filters.category) {
      result = result.filter(task => task.category === filters.category);
    }
    
    if (filters.dateRange) {
      result = result.filter(task => {
        const taskDate = new Date(task.createdAt);
        return taskDate >= filters.dateRange!.start && taskDate <= filters.dateRange!.end;
      });
    }

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(task => 
        task.title.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      const aValue = a[sortOptions.field];
      const bValue = b[sortOptions.field];
      
      let comparison = 0;
      if (aValue < bValue) comparison = -1;
      if (aValue > bValue) comparison = 1;
      
      return sortOptions.direction === 'desc' ? -comparison : comparison;
    });

    return result;
  }, [initialTasks, filters, sortOptions, searchQuery]);

  // Selection helpers
  const toggleTaskSelection = useCallback((taskId: string) => {
    setSelectedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  }, []);

  const selectAllTasks = useCallback(() => {
    setSelectedTasks(new Set(processedTasks.map(task => task.id)));
  }, [processedTasks]);

  const clearSelection = useCallback(() => {
    setSelectedTasks(new Set());
  }, []);

  return {
    // Processed data
    tasks: processedTasks,
    
    // Filters
    filters,
    setFilters,
    
    // Sorting
    sortOptions,
    setSortOptions,
    
    // Search
    searchQuery,
    setSearchQuery,
    
    // Selection
    selectedTasks: Array.from(selectedTasks),
    toggleTaskSelection,
    selectAllTasks,
    clearSelection,
    hasSelection: selectedTasks.size > 0,
    
    // Helpers
    clearAllFilters: () => setFilters({}),
    resetSort: () => setSortOptions({ field: 'createdAt', direction: 'desc' })
  };
};
```

### **Phase 3: Extract Business Logic**

#### `hooks/useTaskValidation.ts`
```typescript
interface ValidationRule<T> {
  validate: (value: T) => boolean;
  message: string;
}

interface TaskValidationRules {
  title: ValidationRule<string>[];
  description?: ValidationRule<string>[];
  priority: ValidationRule<string>[];
  dueDate?: ValidationRule<Date>[];
}

export const useTaskValidation = (taskType: 'light-work' | 'deep-work') => {
  const rules: TaskValidationRules = useMemo(() => {
    const baseRules: TaskValidationRules = {
      title: [
        {
          validate: (title: string) => title.trim().length > 0,
          message: 'Title is required'
        },
        {
          validate: (title: string) => title.length <= 100,
          message: 'Title must be 100 characters or less'
        }
      ],
      priority: [
        {
          validate: (priority: string) => ['low', 'medium', 'high'].includes(priority),
          message: 'Priority must be low, medium, or high'
        }
      ]
    };

    // Task type specific rules
    if (taskType === 'deep-work') {
      baseRules.title.push({
        validate: (title: string) => title.length >= 10,
        message: 'Deep work tasks should have descriptive titles (10+ characters)'
      });
      
      baseRules.description = [
        {
          validate: (description: string) => description.trim().length > 0,
          message: 'Deep work tasks require a description'
        }
      ];
    }

    return baseRules;
  }, [taskType]);

  const validateField = useCallback((field: keyof TaskValidationRules, value: any): string[] => {
    const fieldRules = rules[field];
    if (!fieldRules) return [];

    return fieldRules
      .filter(rule => !rule.validate(value))
      .map(rule => rule.message);
  }, [rules]);

  const validateTask = useCallback((task: Partial<Task>): Record<string, string[]> => {
    const errors: Record<string, string[]> = {};

    Object.keys(rules).forEach(field => {
      const fieldErrors = validateField(field as keyof TaskValidationRules, task[field as keyof Task]);
      if (fieldErrors.length > 0) {
        errors[field] = fieldErrors;
      }
    });

    return errors;
  }, [rules, validateField]);

  const isTaskValid = useCallback((task: Partial<Task>): boolean => {
    const errors = validateTask(task);
    return Object.keys(errors).length === 0;
  }, [validateTask]);

  return {
    validateField,
    validateTask,
    isTaskValid,
    rules
  };
};
```

### **Phase 4: Extract Context Switching Logic**

#### `providers/TaskProvider.tsx`
```typescript
interface TaskContextType {
  taskType: 'light-work' | 'deep-work';
  config: TaskTypeConfig;
  crud: ReturnType<typeof useTaskCRUD>;
  state: ReturnType<typeof useTaskState>;
  validation: ReturnType<typeof useTaskValidation>;
}

const TaskContext = createContext<TaskContextType | null>(null);

interface TaskProviderProps {
  children: ReactNode;
  taskType: 'light-work' | 'deep-work';
  userId?: string;
}

export const TaskProvider = ({ children, taskType, userId }: TaskProviderProps) => {
  const crud = useTaskCRUD({ taskType, userId });
  const state = useTaskState(crud.tasks);
  const validation = useTaskValidation(taskType);
  
  const config = useMemo(() => {
    return getTaskTypeConfig(taskType);
  }, [taskType]);

  const value: TaskContextType = {
    taskType,
    config,
    crud,
    state,
    validation
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext must be used within TaskProvider');
  }
  return context;
};
```

### **Phase 5: Extract UI Coordination**

#### `components/TaskManager.tsx`
```typescript
interface TaskManagerProps {
  className?: string;
  showFilters?: boolean;
  showBulkActions?: boolean;
  showSearch?: boolean;
}

export const TaskManager = ({ 
  className = '',
  showFilters = true,
  showBulkActions = true,
  showSearch = true 
}: TaskManagerProps) => {
  const { state, crud, validation } = useTaskContext();

  const handleCreateTask = useCallback(async (taskData: CreateTaskInput) => {
    const errors = validation.validateTask(taskData);
    
    if (Object.keys(errors).length > 0) {
      toast.error('Please fix validation errors');
      return { success: false, errors };
    }

    try {
      await crud.createTask(taskData);
      toast.success('Task created successfully');
      return { success: true };
    } catch (error) {
      toast.error('Failed to create task');
      return { success: false, error };
    }
  }, [crud, validation]);

  const handleBulkAction = useCallback(async (action: BulkAction) => {
    if (state.selectedTasks.length === 0) {
      toast.warning('No tasks selected');
      return;
    }

    // Handle different bulk actions
    switch (action.type) {
      case 'delete':
        // Bulk delete logic
        break;
      case 'complete':
        // Bulk complete logic
        break;
      case 'update-priority':
        // Bulk priority update logic
        break;
    }
  }, [state.selectedTasks]);

  return (
    <div className={`task-manager ${className}`}>
      {showSearch && (
        <TaskSearch
          value={state.searchQuery}
          onChange={state.setSearchQuery}
        />
      )}
      
      {showFilters && (
        <TaskFilters
          filters={state.filters}
          onFiltersChange={state.setFilters}
          sortOptions={state.sortOptions}
          onSortChange={state.setSortOptions}
        />
      )}
      
      {showBulkActions && state.hasSelection && (
        <BulkActionBar
          selectedCount={state.selectedTasks.length}
          onAction={handleBulkAction}
          onClearSelection={state.clearSelection}
        />
      )}
      
      <TaskList
        tasks={state.tasks}
        selectedTasks={state.selectedTasks}
        onTaskSelect={state.toggleTaskSelection}
        onTaskUpdate={crud.updateTask}
        onTaskDelete={crud.deleteTask}
        isLoading={crud.isLoading}
      />
      
      <CreateTaskForm
        onSubmit={handleCreateTask}
        isLoading={crud.isCreating}
        validation={validation}
      />
    </div>
  );
};
```

## Final Decomposed Structure

```typescript
// TaskContainer.tsx (now just a wrapper!)
export const TaskContainer = ({ taskType, userId, children, ...props }) => {
  return (
    <TaskProvider taskType={taskType} userId={userId}>
      <TaskManager {...props}>
        {children}
      </TaskManager>
    </TaskProvider>
  );
};

// Usage in pages:
<TaskContainer taskType="deep-work" userId={user.id}>
  <CustomTaskActions />
  <CustomTaskViews />
</TaskContainer>
```

## Benefits of This Decomposition

### **1. Single Responsibility**
- CRUD operations separate from UI logic
- State management isolated from business rules
- Validation independent of data operations

### **2. Reusability**
- Use useTaskCRUD in other components
- Reuse validation logic across task types
- Share state management patterns

### **3. Testability**
- Unit test hooks independently
- Mock individual pieces easily
- Test business logic without UI

### **4. Type Safety**
- Strong typing for all operations
- Validation rules enforce data integrity
- Context provides type-safe access

### **5. Performance**
- Optimistic updates for better UX
- Smart caching with React Query
- Efficient re-rendering with context

## Migration Strategy

### **Step 1: Extract CRUD Hook (Safest)**
- Create useTaskCRUD with same interface
- Replace direct service calls
- Test all CRUD operations still work

### **Step 2: Extract State Management**
- Create useTaskState hook
- Move filtering and sorting logic
- Test UI interactions still work

### **Step 3: Extract Validation**
- Create useTaskValidation hook
- Move all validation rules
- Test form validation still works

### **Step 4: Create Context Provider**
- Create TaskProvider and context
- Test context provides all needed data
- Verify no prop drilling issues

### **Step 5: Create Task Manager**
- Create TaskManager component
- Move UI coordination logic
- Test all user interactions work

## Safety Protocols

### **Testing Checklist:**
- [ ] Task creation works for both task types
- [ ] Task updates reflect immediately (optimistic)
- [ ] Task deletion works and reverts on error
- [ ] Filtering and sorting work correctly
- [ ] Search functionality works
- [ ] Bulk actions work on selected tasks
- [ ] Validation prevents invalid data
- [ ] Loading states display correctly
- [ ] Error handling works properly
- [ ] Context provides correct data
- [ ] No memory leaks in hooks
- [ ] Performance is maintained

## Expected Outcome

**Before:** Monolithic component doing everything  
**After:** Modular system with clear separation

**Risk Reduction:** 🔴 High → 🟢 Low  
**Reusability:** 🔴 Hard → 🟢 Easy  
**Testability:** 🔴 Complex → 🟢 Simple  
**Performance:** 🟡 Good → 🟢 Excellent