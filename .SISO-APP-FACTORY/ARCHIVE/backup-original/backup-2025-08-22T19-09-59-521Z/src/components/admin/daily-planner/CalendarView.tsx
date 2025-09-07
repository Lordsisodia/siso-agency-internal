
import React, { useState, useEffect } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { supabase } from '@/integrations/supabase/client';
import { useTasks } from '@/hooks/useTasks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function CalendarView() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const { useTaskQuery } = useTasks();
  const { data: taskData = [] } = useTaskQuery();
  const { toast } = useToast();

  // Fetch events for the selected date
  useEffect(() => {
    const fetchEvents = async () => {
      if (!date) return;

      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .gte('start_time', date.toISOString())
        .lt('start_time', new Date(date.getTime() + 24 * 60 * 60 * 1000).toISOString());

      if (error) {
        console.error('Error fetching events:', error);
        return;
      }

      setEvents(data || []);
    };

    fetchEvents();
  }, [date]);

  // Filter tasks for the selected date
  useEffect(() => {
    if (!date) return;
    const selectedDateTasks = taskData.filter(task => 
      task.due_date && new Date(task.due_date).toDateString() === date.toDateString()
    );
    setTasks(selectedDateTasks);
  }, [date, taskData]);

  const handleCreateEvent = async (formData: React.FormEvent<HTMLFormElement>) => {
    formData.preventDefault();
    const form = formData.target as HTMLFormElement;
    const titleInput = form.elements.namedItem('title') as HTMLInputElement;
    const descriptionInput = form.elements.namedItem('description') as HTMLInputElement;
    const taskSelect = form.elements.namedItem('task') as HTMLSelectElement;

    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .insert({
          title: titleInput.value,
          description: descriptionInput.value,
          start_time: date?.toISOString(),
          end_time: date?.toISOString(),
          task_id: taskSelect.value || null,
          user_id: (await supabase.auth.getUser()).data.user?.id
        });

      if (error) throw error;

      toast({ 
        title: 'Event Created', 
        description: 'Your event has been added successfully' 
      });

      form.reset();
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: 'Failed to create event', 
        variant: 'destructive' 
      });
    }
  };

  return (
    <Card className="bg-soft-purple border-soft-purple/30">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-dark-purple">Calendar View</CardTitle>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1 bg-vivid-purple hover:bg-vivid-purple/80">
              <PlusCircle className="h-4 w-4" />
              Add Event
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Event</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <Input name="title" placeholder="Event Title" required />
              <Input name="description" placeholder="Description (optional)" />
              <Select name="task">
                <SelectTrigger>
                  <SelectValue placeholder="Link to Task (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {tasks.map(task => (
                    <SelectItem key={task.id} value={task.id}>
                      {task.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="submit" className="bg-vivid-purple hover:bg-vivid-purple/80">Create Event</Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center mb-4">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border w-full max-w-md pointer-events-auto"
          />
        </div>
        
        <div className="mt-6">
          <h3 className="text-md font-medium mb-2 text-dark-purple">
            Events and Tasks for {date?.toLocaleDateString()}
          </h3>
          {events.length === 0 && tasks.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No events or tasks scheduled for this date.
            </p>
          ) : (
            <div className="space-y-2">
              {events.map(event => (
                <div 
                  key={event.id} 
                  className="bg-soft-purple/20 border border-soft-purple/30 rounded-md p-3"
                >
                  <div className="font-semibold text-dark-purple">{event.title}</div>
                  {event.description && (
                    <p className="text-sm text-muted-foreground">{event.description}</p>
                  )}
                </div>
              ))}
              {tasks.map(task => (
                <div 
                  key={task.id} 
                  className="bg-soft-purple/20 border border-soft-purple/30 rounded-md p-3"
                >
                  <div className="font-semibold text-dark-purple">{task.title}</div>
                  <p className="text-sm text-muted-foreground">
                    {task.description || 'No description'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
