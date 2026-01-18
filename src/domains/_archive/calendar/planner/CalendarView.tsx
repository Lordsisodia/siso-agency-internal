
import React, { useState, useEffect, useMemo } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { supabase } from '@/services/integrations/supabase/client';
import { useTasks } from '@/domains/task-ui/hooks/useTasks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import DeepWorkTaskList from '@/domains/lifelock/views/daily/4-deep-work/components/DeepWorkTaskList';
import { useDeepWorkTasksSupabase } from '@/domains/task-ui/hooks/useDeepWorkTasksSupabase';
import { Separator } from '@/components/ui/separator';
import { useClientsList } from '@/domains/clients/hooks/useClientsList';

export function CalendarView() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<any[]>([]);
  const [eventsWithClient, setEventsWithClient] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'calendar' | 'todo'>('calendar');
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const { useTaskQuery } = useTasks();
  const { data: taskData = [] } = useTaskQuery();
  const { toast } = useToast();
  const { clients } = useClientsList();
  const selectedDateKey = useMemo(
    () => format(date ?? new Date(), 'yyyy-MM-dd'),
    [date]
  );

  // Deep work tasks for the selected date (reused UI + data source)
  const { tasks: deepWorkRaw = [], createTask: createDeepTask } = useDeepWorkTasksSupabase({ selectedDate: date ?? new Date() });
  const deepWorkTasksForDay = useMemo(() => {
    return deepWorkRaw.filter(task => {
      const candidate = task.dueDate || task.currentDate || task.createdAt;
      if (!candidate) return false;
      return format(new Date(candidate), 'yyyy-MM-dd') === selectedDateKey;
    });
  }, [deepWorkRaw, selectedDateKey]);

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

  // Enrich events with client name from linked task + client list
  useEffect(() => {
    const clientMap = new Map<string, string>();
    clients.forEach(c => {
      const name = c.business_name || c.full_name || 'Client';
      clientMap.set(c.id, name);
    });

    const taskMap = new Map<string, any>();
    taskData.forEach(t => taskMap.set(t.id, t));

    const enriched = events.map(evt => {
      const linkedTask = evt.task_id ? taskMap.get(evt.task_id) : null;
      const clientId = linkedTask?.assigned_client_id ?? null;
      const client_name = clientId ? clientMap.get(clientId) : null;
      return { ...evt, client_name };
    });

    setEventsWithClient(enriched);
  }, [events, taskData, clients]);

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
    const title = titleInput.value;
    const description = descriptionInput.value;
    const selectedTaskId = taskSelect.value || null;

    try {
      let taskIdToLink = selectedTaskId;

      // If no existing task selected, create a linked deep-work task + client task first
      if (!taskIdToLink) {
        const createdTask = await createDeepTask({
          title,
          description,
          priority: 'MEDIUM',
          dueDate: selectedDateKey,
          taskDate: selectedDateKey,
          focusBlocks: 2,
          clientId: selectedClientId ?? undefined,
        });

        const taskRecordId = await createClientTaskRecord({
          title,
          description: 'Linked from Calendar event',
          dueDate: selectedDateKey,
          clientId: selectedClientId,
        });

        taskIdToLink = taskRecordId ?? createdTask?.id ?? null;
      }

      const { data, error } = await supabase
        .from('calendar_events')
        .insert({
          title,
          description,
          start_time: date?.toISOString(),
          end_time: date?.toISOString(),
          task_id: taskIdToLink,
          user_id: (await supabase.auth.getUser()).data.user?.id
        });

      if (error) throw error;

      toast({ 
        title: 'Event Created', 
        description: taskIdToLink
          ? 'Event created and linked to task'
          : 'Event created'
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

  const handleCreateTodo = async () => {
    if (!newTodoTitle.trim()) return;
    const title = newTodoTitle.trim();
    try {
      const createdTask = await createDeepTask({
        title,
        description: '',
        priority: 'MEDIUM',
        dueDate: selectedDateKey,
        taskDate: selectedDateKey,
        focusBlocks: 2,
        clientId: selectedClientId ?? undefined,
      });

      // Create client task record and mirror to calendar events
      const taskRecordId = await createClientTaskRecord({
        title,
        description: 'Linked from Calendar To-Do',
        dueDate: selectedDateKey,
        clientId: selectedClientId,
      });

      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id || null;
      if (userId) {
        const start = date ?? new Date();
        await supabase.from('calendar_events').insert({
          title,
          description: 'Linked from Calendar To-Do',
          start_time: start.toISOString(),
          end_time: start.toISOString(),
          task_id: taskRecordId ?? createdTask?.id ?? null,
          user_id: userId,
        });
      }

      setNewTodoTitle('');
      toast({ title: 'Task added', description: `${title} scheduled for ${selectedDateKey}` });
    } catch (error) {
      console.error('Failed to create linked todo', error);
      toast({ title: 'Error', description: 'Unable to create to-do item', variant: 'destructive' });
    }
  };

  const createClientTaskRecord = async ({
    title,
    description,
    dueDate,
    clientId,
  }: {
    title: string;
    description: string;
    dueDate: string;
    clientId: string | null;
  }) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title,
          description,
          category: 'daily',
          priority: 'medium',
          status: 'pending',
          due_date: dueDate,
          assigned_client_id: clientId,
        })
        .select('id')
        .maybeSingle();

      if (error) {
        console.warn('Unable to create client task record', error);
        return null;
      }

      return data?.id ?? null;
    } catch (err) {
      console.warn('Failed to create client task record', err);
      return null;
    }
  };

  return (
    <Card className="bg-soft-purple border-soft-purple/30">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-dark-purple">Calendar View</CardTitle>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={viewMode === 'calendar' ? 'default' : 'outline'}
            onClick={() => setViewMode('calendar')}
          >
            Calendar
          </Button>
          <Button
            size="sm"
            variant={viewMode === 'todo' ? 'default' : 'outline'}
            onClick={() => setViewMode('todo')}
          >
            To-Do List
          </Button>
          {viewMode === 'calendar' && (
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
              <Select
                value={selectedClientId ?? ''}
                onValueChange={(val) => setSelectedClientId(val || null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Optional: Link to client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No client</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.business_name || client.full_name || 'Unnamed Client'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
          )}
        </div>
      </CardHeader>
      <CardContent>
        {viewMode === 'calendar' ? (
          <>
            <div className="flex justify-center mb-4">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border w-full max-w-md pointer-events-auto"
              />
            </div>
            
            <div className="mt-6 space-y-4">
              <div>
                <h3 className="text-md font-medium mb-2 text-dark-purple">
                  Events and Tasks for {date?.toLocaleDateString()}
                </h3>
                {events.length === 0 && tasks.length === 0 && deepWorkTasksForDay.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No events or tasks scheduled for this date.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {eventsWithClient.map(event => (
                      <div 
                        key={event.id} 
                        className="bg-soft-purple/20 border border-soft-purple/30 rounded-md p-3"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="font-semibold text-dark-purple">{event.title}</div>
                          {event.client_name && (
                            <span className="text-[11px] px-2 py-1 rounded-full bg-purple-500/20 text-purple-100">
                              {event.client_name}
                            </span>
                          )}
                        </div>
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
                    {deepWorkTasksForDay.map(task => (
                      <div
                        key={task.id}
                        className="bg-soft-purple/30 border border-soft-purple/40 rounded-md p-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-semibold text-dark-purple">{task.title}</div>
                          <span className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-200">
                            {task.priority ?? 'medium'}
                          </span>
                        </div>
                        {task.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {task.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">
                To-do list reuses deep-work tasks UI. Items added here also show on the calendar for {date?.toLocaleDateString()}.
              </p>
            </div>
            <div className="flex gap-2 mb-4">
              <Input
                placeholder="Quick add to-do for selected date"
                value={newTodoTitle}
                onChange={(e) => setNewTodoTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleCreateTodo();
                  }
                }}
              />
              <Button onClick={handleCreateTodo} disabled={!newTodoTitle.trim()}>
                Add
              </Button>
            </div>
            <div className="flex gap-2 mb-4">
              <Select
                value={selectedClientId ?? ''}
                onValueChange={(val) => setSelectedClientId(val || null)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Optional: Link to client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No client</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.business_name || client.full_name || 'Unnamed Client'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Separator className="mb-4" />
            <DeepWorkTaskList selectedDate={date ?? new Date()} />
          </>
        )}
      </CardContent>
    </Card>
  );
}
