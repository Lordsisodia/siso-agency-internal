import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Plus, Upload, Link as LinkIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { FeedbackEntry } from './sampleFeedbackData';

// Form schema validation
const formSchema = z.object({
  title: z.string().min(5, {
    message: 'Title must be at least 5 characters.',
  }),
  description: z.string().min(10, {
    message: 'Description must be at least 10 characters.',
  }),
  priority: z.enum(['low', 'medium', 'high']),
  screenId: z.string().optional(),
  screenName: z.string().min(1, {
    message: 'Please select a screen.',
  }),
  tags: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AddFeedbackDialogProps {
  onAdd?: (feedback: Partial<FeedbackEntry>) => void;
  screens?: Array<{id: string, name: string}>;
}

export function AddFeedbackDialog({ onAdd, screens = [] }: AddFeedbackDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  
  const defaultValues: FormValues = {
    title: '',
    description: '',
    priority: 'medium',
    screenName: screens.length > 0 ? screens[0].name : '',
    screenId: screens.length > 0 ? screens[0].id : '',
    tags: '',
  };
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  
  const handleScreenChange = (value: string) => {
    const screen = screens.find(s => s.name === value);
    if (screen) {
      form.setValue('screenId', screen.id);
    }
  };
  
  const onSubmit = (values: FormValues) => {
    // Convert tags string to array
    const tagsArray = values.tags ? 
      values.tags.split(',').map(tag => tag.trim()) :
      [];
    
    // Create the feedback entry
    const newFeedback: Partial<FeedbackEntry> = {
      id: `fb-${Date.now()}`,
      title: values.title,
      description: values.description,
      status: 'open',
      priority: values.priority,
      createdAt: new Date().toISOString(),
      authorId: 'current-user', // This would normally come from auth context
      authorName: 'Current User', // This would normally come from auth context
      screenId: values.screenId,
      screenName: values.screenName,
      tags: tagsArray.length > 0 ? tagsArray : undefined,
      comments: [],
    };
    
    // Call the onAdd callback
    if (onAdd) {
      onAdd(newFeedback);
    }
    
    // Show success toast
    toast({
      title: 'Feedback Added',
      description: 'Your feedback has been successfully submitted.',
    });
    
    // Reset form and close dialog
    form.reset(defaultValues);
    setOpen(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Feedback
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Feedback</DialogTitle>
          <DialogDescription>
            Create a new feedback entry. Fill out the details below.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter a descriptive title" {...field} />
                  </FormControl>
                  <FormDescription>
                    A clear, concise title for the feedback
                  </FormDescription>
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
                      placeholder="Provide detailed description of the feedback"
                      rows={4}
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Include steps to reproduce if it's a bug or detailed requirements if it's a feature
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
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
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Set the importance level
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="screenName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Screen</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleScreenChange(value);
                      }} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select screen" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {screens.map(screen => (
                          <SelectItem key={screen.id} value={screen.name}>
                            {screen.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Which part of the app does this apply to
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter tags separated by commas (e.g. bug, ui, performance)"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Optional tags to categorize this feedback
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex gap-2">
              <Button type="button" variant="outline" className="gap-2" disabled>
                <Upload className="h-4 w-4" />
                Attach Files
              </Button>
              <Button type="button" variant="outline" className="gap-2" disabled>
                <LinkIcon className="h-4 w-4" />
                Add Reference Links
              </Button>
            </div>
            
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Submit Feedback</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 