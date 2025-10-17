import { ClientData, ClientTask } from '@/types/client.types';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { cn } from '@/shared/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  Circle,
  Flame,
  Plus,
  Sparkles,
  Timer,
  Calendar,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { format } from 'date-fns';

interface ClientsTasksTabProps {
  client: ClientData;
  tasks: ClientTask[];
  onCreateTask: (task: Partial<ClientTask>) => Promise<void>;
  onUpdateTask: (taskId: string, updates: Partial<ClientTask>) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
  onRefreshTasks: () => Promise<void>;
}

const PRIORITY_STYLES: Record<string, { label: string; badge: string }> = {
  low: { label: 'Low', badge: 'bg-emerald-500/15 text-emerald-200 border border-emerald-400/40' },
  medium: { label: 'Medium', badge: 'bg-amber-500/15 text-amber-200 border border-amber-400/40' },
  high: { label: 'High', badge: 'bg-rose-500/15 text-rose-200 border border-rose-400/40' },
};

export function ClientsTasksTab({
  client,
  tasks,
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
  onRefreshTasks,
}: ClientsTasksTabProps) {
  const [expandedTasks, setExpandedTasks] = useState<string[]>([]);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [composerTitle, setComposerTitle] = useState('');

  const metrics = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((task) => task.completed).length;
    const urgent = tasks.filter((task) => task.priority === 'high').length;
    const upcoming = tasks
      .filter((task) => !task.completed && task.due_date)
      .sort(
        (a, b) =>
          new Date(a.due_date ?? '').getTime() - new Date(b.due_date ?? '').getTime(),
      );

    return {
      total,
      completed,
      urgent,
      nextDue: upcoming[0]?.due_date ?? null,
    };
  }, [tasks]);

  const handleToggleTask = async (task: ClientTask) => {
    await onUpdateTask(task.id, { completed: !task.completed });
  };

  const handleComposerSubmit = async () => {
    if (!composerTitle.trim()) return;
    await onCreateTask({
      client_id: client.id,
      title: composerTitle.trim(),
      priority: 'medium',
      completed: false,
    } as Partial<ClientTask>);
    setComposerTitle('');
    setIsComposerOpen(false);
    await onRefreshTasks();
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-siso-orange/10 via-transparent to-white/5 border border-siso-orange/30 backdrop-blur-xl text-white">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-white/50">
              <Flame className="h-4 w-4 text-siso-orange" />
              Priority
            </div>
            <CardTitle className="text-3xl font-semibold mt-2">{metrics.urgent}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-white/60">
            Urgent tasks demanding attention this week.
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 via-transparent to-white/5 border border-emerald-400/30 backdrop-blur-xl text-white">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-white/50">
              <CheckCircle2 className="h-4 w-4 text-emerald-300" />
              Completed
            </div>
            <CardTitle className="text-3xl font-semibold mt-2">{metrics.completed}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-white/60">
            {metrics.total > 0
              ? `${Math.round((metrics.completed / metrics.total) * 100)}% of workload cleared`
              : 'Start by adding tasks below'}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-sky-500/10 via-transparent to-white/5 border border-sky-400/30 backdrop-blur-xl text-white">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-white/50">
              <Timer className="h-4 w-4 text-sky-300" />
              Next Deadline
            </div>
            <CardTitle className="text-xl font-semibold mt-2">
              {metrics.nextDue
                ? format(new Date(metrics.nextDue), 'MMM d, yyyy')
                : 'Set due dates'}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-white/60">
            Align your sprints to hit delivery expectations.
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-white/10 via-transparent to-white/5 border border-white/20 backdrop-blur-xl text-white">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-white/50">
              <Sparkles className="h-4 w-4 text-white" />
              Total
            </div>
            <CardTitle className="text-3xl font-semibold mt-2">{metrics.total}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-white/60">
            Every client task lives here—no Airtable hunting.
          </CardContent>
        </Card>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl p-6 shadow-[0_20px_80px_rgba(6,6,18,0.35)]">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl font-semibold text-white">Deep Work Board</h3>
            <p className="text-xs text-white/50">
              Mirrors the LifeLock Deep Focus layout—click a task to expand, track subtasks, and
              update status inline.
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="border-white/20 bg-white/10 text-white hover:bg-white/20"
              onClick={onRefreshTasks}
            >
              Sync Tasks
            </Button>
            <Button
              className="bg-gradient-to-r from-siso-orange to-siso-purple text-white hover:from-siso-orange/90 hover:to-siso-purple/90"
              onClick={() => setIsComposerOpen((prev) => !prev)}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Task
            </Button>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {isComposerOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-6 rounded-2xl border border-white/10 bg-black/40 p-4 flex flex-col md:flex-row gap-3"
            >
              <input
                value={composerTitle}
                onChange={(event) => setComposerTitle(event.target.value)}
                placeholder="What’s the next most valuable outcome?"
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-siso-orange/60 focus:ring-2 focus:ring-siso-orange/20"
              />
              <Button
                className="bg-siso-orange text-white hover:bg-siso-orange/90"
                onClick={handleComposerSubmit}
              >
                Add Task
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-4">
          {tasks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/20 bg-white/5 p-10 text-center text-white/60">
              No tasks yet. Import from onboarding or create a new focus sprint.
            </div>
          ) : (
            tasks.map((task) => {
              const priority = PRIORITY_STYLES[task.priority] ?? PRIORITY_STYLES.medium;
              const isExpanded = expandedTasks.includes(task.id);

              return (
                <motion.div
                  key={task.id}
                  layout
                  className="rounded-2xl border border-white/10 bg-black/40 p-5 shadow-[0_14px_40px_rgba(3,3,9,0.55)]"
                >
                  <div className="flex items-start gap-4">
                    <button
                      type="button"
                      onClick={() => handleToggleTask(task)}
                      className={cn(
                        'mt-1 flex h-10 w-10 items-center justify-center rounded-xl border transition-colors',
                        task.completed
                          ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-200'
                          : 'border-white/15 bg-white/5 text-white/60 hover:border-siso-orange/40',
                      )}
                    >
                      {task.completed ? (
                        <CheckCircle2 className="h-6 w-6" />
                      ) : (
                        <Circle className="h-6 w-6" />
                      )}
                    </button>

                    <div className="flex-1 space-y-4">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3 flex-wrap">
                            <h4 className={cn('text-lg font-semibold text-white', task.completed && 'line-through text-white/40')}>
                              {task.title}
                            </h4>
                            <Badge className={priority.badge}>{priority.label}</Badge>
                            {task.due_date && (
                              <Badge className="bg-sky-500/20 text-sky-200 border border-sky-400/40 flex items-center gap-2">
                                <Calendar className="h-3.5 w-3.5" />
                                Due {format(new Date(task.due_date), 'MMM d')}
                              </Badge>
                            )}
                          </div>
                          {task.description && (
                            <p className="text-sm text-white/60 mt-2 max-w-2xl">{task.description}</p>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-white/50 hover:text-white hover:bg-white/10"
                            onClick={() =>
                              setExpandedTasks((prev) =>
                                prev.includes(task.id)
                                  ? prev.filter((id) => id !== task.id)
                                  : [...prev, task.id],
                              )
                            }
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-5 w-5" />
                            ) : (
                              <ChevronDown className="h-5 w-5" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-4"
                          >
                            <div className="flex items-center justify-between">
                              <p className="text-xs uppercase tracking-[0.3em] text-white/40">
                                Subtasks
                              </p>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-white/60 hover:text-white hover:bg-white/10"
                                onClick={() => onDeleteTask(task.id)}
                              >
                                Archive Task
                              </Button>
                            </div>

                            <div className="space-y-2">
                              {task.subtasks?.length ? (
                                task.subtasks.map((subtask) => (
                                  <div
                                    key={subtask.id}
                                    className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 flex items-center gap-3 text-sm text-white/70"
                                  >
                                    <ArrowUpRight className="h-4 w-4 text-white/30" />
                                    <span className={cn(subtask.completed && 'line-through text-white/40')}>
                                      {subtask.title}
                                    </span>
                                  </div>
                                ))
                              ) : (
                                <div className="rounded-xl border border-dashed border-white/10 bg-black/20 px-4 py-6 text-center text-sm text-white/50">
                                  No subtasks captured—mirror the LifeLock micro plan here.
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
