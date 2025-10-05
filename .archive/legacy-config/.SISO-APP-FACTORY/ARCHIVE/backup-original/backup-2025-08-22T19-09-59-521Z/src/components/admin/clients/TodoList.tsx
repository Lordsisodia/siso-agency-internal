
import { useState } from 'react';
import { TodoItem } from '@/types/client.types';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, X, Calendar, User } from 'lucide-react';
import { formatRelativeTime } from '@/lib/formatters';

interface TodoListProps {
  todos?: TodoItem[];
  onUpdate: (todos: TodoItem[]) => void;
  clientId: string;
  disabled?: boolean;
}

export function TodoList({ todos = [], onUpdate, clientId, disabled = false }: TodoListProps) {
  const [newTodoText, setNewTodoText] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddTodo = () => {
    if (!newTodoText.trim()) return;

    const newTodo: TodoItem = {
      id: `todo-${Date.now()}`,
      text: newTodoText,
      completed: false,
      priority: 'medium', // Set a default priority
      // Don't include created_at as it doesn't exist in the TodoItem type
    };

    onUpdate([...todos, newTodo]);
    setNewTodoText('');
    setIsAdding(false);
  };

  const handleToggleTodo = (todoId: string) => {
    const updatedTodos = todos.map(todo => 
      todo.id === todoId ? { ...todo, completed: !todo.completed } : todo
    );
    onUpdate(updatedTodos);
  };

  const handleDeleteTodo = (todoId: string) => {
    const updatedTodos = todos.filter(todo => todo.id !== todoId);
    onUpdate(updatedTodos);
  };

  return (
    <div className="space-y-2">
      {todos.length === 0 && !isAdding ? (
        <div className="text-center py-4 text-muted-foreground">
          No tasks yet. Add your first task.
        </div>
      ) : (
        <ul className="space-y-2">
          {todos.map(todo => (
            <li key={todo.id} className="flex items-start gap-2 group">
              <Checkbox 
                checked={todo.completed} 
                onCheckedChange={() => handleToggleTodo(todo.id)}
                className="mt-1"
                disabled={disabled}
              />
              <div className="flex-1 min-w-0">
                <p className={`${todo.completed ? 'line-through text-muted-foreground' : ''}`}>
                  {todo.text}
                </p>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <Calendar className="h-3 w-3 mr-1" />
                  {todo.due_date ? formatRelativeTime(todo.due_date) : 'No due date'}
                  
                  {todo.assigned_to && (
                    <span className="ml-2 flex items-center">
                      <User className="h-3 w-3 mr-1" />
                      {todo.assigned_to}
                    </span>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
                onClick={() => handleDeleteTodo(todo.id)}
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      {isAdding ? (
        <div className="flex items-start gap-2">
          <div className="w-4" /> {/* Spacer to align with checkboxes */}
          <div className="flex-1">
            <Input 
              value={newTodoText}
              onChange={(e) => setNewTodoText(e.target.value)}
              placeholder="What needs to be done?"
              className="mb-2"
              autoFocus
              disabled={disabled}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddTodo();
                if (e.key === 'Escape') setIsAdding(false);
              }}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAddTodo} disabled={disabled}>Add Task</Button>
              <Button size="sm" variant="ghost" onClick={() => setIsAdding(false)} disabled={disabled}>Cancel</Button>
            </div>
          </div>
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start"
          onClick={() => setIsAdding(true)}
          disabled={disabled}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Task
        </Button>
      )}
    </div>
  );
}
