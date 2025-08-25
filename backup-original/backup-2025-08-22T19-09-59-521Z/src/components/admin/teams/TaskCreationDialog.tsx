
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarIcon, Clock, Plus, Trash2 } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { useTaskOperations } from '@/hooks/useTaskOperations';
import { TaskPriority, TaskCategory } from '@/types/task.types';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { v4 as uuidv4 } from 'uuid';

const timeOptions = Array.from({ length: 24 }, (_, hour) => {
  return Array.from({ length: 4 }, (_, quarterHour) => {
    const minutes = quarterHour * 15;
    const time = `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    const label = format(new Date().setHours(hour, minutes), 'h:mm a');
    return { value: time, label };
  });
}).flat();

const durationOptions = [
  { value: '15', label: '15 minutes' },
  { value: '30', label: '30 minutes' },
  { value: '45', label: '45 minutes' },
  { value: '60', label: '1 hour' },
  { value: '90', label: '1.5 hours' },
  { value: '120', label: '2 hours' },
  { value: '180', label: '3 hours' },
  { value: '240', label: '4 hours' },
];

// Define the form schema
const taskFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  category: z.string(),
  priority: z.string(),
  start_time: z.string().optional(),
  duration: z.string().optional(),
  subtasks: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      completed: z.boolean()
    })
  )
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

interface TaskCreationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: Date;
  initialHour?: number;
}

export function TaskCreationDialog({ isOpen, onClose, initialDate, initialHour }: TaskCreationDialogProps) {
  const { useCreateTask } = useTaskOperations();
  const { mutate: createTask } = useCreateTask();
  const { toast } = useToast();
  
  // Initialize form with default values
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: '',
      description: '',
      category: 'daily',
      priority: 'medium',
      start_time: initialHour !== undefined 
        ? format(new Date().setHours(initialHour, 0, 0), "HH:mm") 
        : undefined,
      duration: '60',
      subtasks: []
    }
  });
  
  const subtasks = form.watch('subtasks');
  
  const handleAddSubtask = () => {
    const currentSubtasks = form.getValues('subtasks') || [];
    form.setValue('subtasks', [
      ...currentSubtasks,
      { id: uuidv4(), title: '', completed: false }
    ]);
  };
  
  const handleDeleteSubtask = (id: string) => {
    const currentSubtasks = form.getValues('subtasks');
    form.setValue('subtasks', currentSubtasks.filter(subtask => subtask.id !== id));
  };
  
  const handleSubtaskTitleChange = (id: string, value: string) => {
    const currentSubtasks = form.getValues('subtasks');
    form.setValue('subtasks', 
      currentSubtasks.map(subtask => 
        subtask.id === id ? { ...subtask, title: value } : subtask
      )
    );
  };

  const onSubmit = (data: TaskFormValues) => {
    const now = new Date();
    let taskStartTime: Date | undefined = undefined;
    
    if (data.start_time) {
      const [hours, minutes] = data.start_time.split(':').map(Number);
      taskStartTime = new Date(now);
      taskStartTime.setHours(hours, minutes, 0, 0);
    }
    
    createTask({
      title: data.title,
      description: data.description,
      category: data.category as TaskCategory,
      priority: data.priority as TaskPriority,
      status: 'pending',
      start_time: taskStartTime?.toISOString(),
      duration: data.duration ? parseInt(data.duration) : 60,
      // Removed created_at as it's automatically handled by the API
    }, {
      onSuccess: () => {
        toast({
          title: "Task created",
          description: `"${data.title}" has been added to your schedule.`,
        });
        onClose();
        form.reset();
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Failed to create task",
          description: error.message,
        });
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter task title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Add task details (optional)" 
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="main">Main</SelectItem>
                        <SelectItem value="siso_app_dev">SISO App Dev</SelectItem>
                        <SelectItem value="onboarding_app">Onboarding App</SelectItem>
                        <SelectItem value="instagram">Instagram</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {timeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {durationOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Subtasks</Label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={handleAddSubtask}
                  className="h-8 px-2"
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Subtask
                </Button>
              </div>
              
              <div className="space-y-2 max-h-[200px] overflow-y-auto p-1">
                {subtasks.map((subtask, index) => (
                  <div key={subtask.id} className="flex items-center gap-2">
                    <Input 
                      value={subtask.title}
                      onChange={(e) => handleSubtaskTitleChange(subtask.id, e.target.value)}
                      placeholder="Subtask description"
                      className="flex-1"
                    />
                    <Button 
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteSubtask(subtask.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
                {subtasks.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-2">
                    No subtasks added yet
                  </p>
                )}
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                Create Task
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
