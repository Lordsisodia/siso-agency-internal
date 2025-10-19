import { useMemo, useState } from 'react';
import { ClientData, ClientTask } from '@/types/client.types';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import {
  Brain,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  Timer,
} from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { cn } from '@/shared/lib/utils';
import { format } from 'date-fns';

interface ClientDeepWorkTaskListProps {
  client: ClientData;
  tasks: ClientTask[];
  onCreateTask: (task: Partial<ClientTask>) => Promise<void>;
  onUpdateTask: (taskId: string, updates: Partial<ClientTask>) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
  onRefreshTasks: () => Promise<void>;
}

const PRIORITY_CONFIG: Record<
  string,
  { label: string; badgeClass: string; icon: string }
> = {
  low: {
    label: 'Focus Warmup',
    badgeClass: 'border-blue-700/40 bg-blue-900/30 text-blue-200',
    icon: '⚪',
  },
  medium: {
    label: 'Core Sprint',
    badgeClass: 'border-indigo-700/40 bg-indigo-900/30 text-indigo-200',
    icon: '🟢',
  },
  high: {
    label: 'Critical',
    badgeClass: 'border-fuchsia-700/40 bg-fuchsia-900/30 text-fuchsia-200',
    icon: '🚨',
  },
};

const taskVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
};

const subtaskVariants = {
  hidden: { opacity: 0, y: 4 },
  visible: { opacity: 1, y: 0 },
};

const formatDueDate = (dueDate?: string | null) => {
  if (!dueDate) return 'Schedule';
  const parsed = new Date(dueDate);
  return Number.isNaN(parsed.getTime()) ? 'Schedule' : format(parsed, 'MMM d');
};

export function ClientDeepWorkTaskList({
  client,
  tasks,
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
  onRefreshTasks,
}: ClientDeepWorkTaskListProps) {
  const [expandedTasks, setExpandedTasks] = useState<string[]>([]);
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerTitle, setComposerTitle] = useState('');

  const orderedTasks = useMemo(
    () =>
      [...tasks].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      ),
    [tasks],
  );

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
    setComposerOpen(false);
    await onRefreshTasks();
  };

  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    const targetTask = tasks.find((task) => task.id === taskId);
    if (!targetTask?.subtasks) return;

    const updated = targetTask.subtasks.map((subtask) =>
      subtask.id === subtaskId
        ? { ...subtask, completed: !subtask.completed }
        : subtask,
    );

    onUpdateTask(taskId, { subtasks: updated });
  };

  return (
    <Card className="bg-blue-900/20 border-blue-700/50 text-blue-50 backdrop-blur-2xl shadow-[0_30px_120px_rgba(12,18,48,0.55)]">
      <CardHeader className="p-6 space-y-4">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600/20 border border-blue-500/40 text-blue-100">
            <Brain className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-semibold text-blue-100">
              Deep Work Client Board
            </CardTitle>
            <p className="text-xs text-blue-200/70 max-w-2xl">
              Exact deep work task cards, wired into the client workspace.
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 pt-0 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="text-xs uppercase tracking-[0.3em] text-blue-200/60">
            Deep Focus Tasks
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="border-blue-400/40 bg-blue-900/20 text-blue-100 hover:bg-blue-900/40 hover:border-blue-300/60"
              onClick={onRefreshTasks}
            >
              Sync Tasks
            </Button>
            <Button
              className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white hover:from-blue-500/90 hover:via-indigo-500/90 hover:to-purple-500/90"
              onClick={() => setComposerOpen((prev) => !prev)}
            >
              + New Task
            </Button>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {composerOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="rounded-2xl border border-blue-700/40 bg-blue-900/30 p-4 flex flex-col md:flex-row gap-3"
            >
              <input
                value={composerTitle}
                onChange={(event) => setComposerTitle(event.target.value)}
                placeholder="What deep work outcome should we tackle next?"
                className="flex-1 bg-blue-950/40 border border-blue-700/50 rounded-xl px-4 py-3 text-sm text-blue-100 placeholder:text-blue-200/30 focus:outline-none focus:border-blue-400/70 focus:ring-2 focus:ring-blue-400/20"
              />
              <Button className="bg-blue-500/80 text-white hover:bg-blue-500" onClick={handleComposerSubmit}>
                Add Task
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {orderedTasks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-blue-700/40 bg-blue-900/10 p-12 text-center text-blue-200/70">
            No deep work captured yet. Mirror the daily LiveBlock by adding the first focus sprint.
          </div>
        ) : (
          <motion.ul layout className="space-y-3">
            <LayoutGroup>
              {orderedTasks.map((task) => {
                const priority =
                  PRIORITY_CONFIG[task.priority?.toLowerCase() ?? 'medium'] ?? PRIORITY_CONFIG.medium;
                const isExpanded = expandedTasks.includes(task.id);

                return (
                  <motion.li key={task.id} layout variants={taskVariants} initial="hidden" animate="visible">
                    <div className="group rounded-2xl border border-blue-700/30 bg-blue-900/15 hover:border-blue-500/50 hover:bg-blue-900/20 hover:shadow-[0_20px_60px_rgba(18,34,74,0.45)] transition-all duration-300">
                      <div className="p-5 space-y-4">
                        <div className="flex items-start gap-4">
                          <button
                            type="button"
                            onClick={() => handleToggleTask(task)}
                            className={cn(
                              'flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border transition-colors',
                              task.completed
                                ? 'border-emerald-400/60 bg-emerald-500/15 text-emerald-200'
                                : 'border-blue-600/40 bg-blue-900/30 text-blue-200 hover:border-blue-400/70',
                            )}
                          >
                            <AnimatePresence mode="wait">
                              <motion.div
                                key={task.completed ? 'completed' : task.priority ?? 'pending'}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.2 }}
                              >
                                {task.completed ? (
                                  <CheckCircle2 className="h-6 w-6" />
                                ) : (
                                  <Circle className="h-6 w-6" />
                                )}
                              </motion.div>
                            </AnimatePresence>
                          </button>

                          <div className="flex-1 space-y-3">
                            <div className="flex flex-col gap-2">
                              <h4
                                className={cn(
                                  'text-lg font-semibold text-blue-100 transition-colors',
                                  task.completed && 'line-through text-blue-300/50',
                                )}
                              >
                                {task.title || 'Untitled task'}
                              </h4>
                              {task.description && (
                                <p className="text-sm text-blue-200/80 max-w-2xl">{task.description}</p>
                              )}
                            </div>

                            <div className="flex flex-wrap gap-2 text-xs font-medium">
                              <span className="inline-flex items-center gap-2 rounded-lg border border-blue-600/50 bg-blue-900/20 px-3 py-2 text-blue-100">
                                <Calendar className="h-3.5 w-3.5" />
                                {formatDueDate(task.due_date)}
                              </span>
                              <span
                                className={cn(
                                  'inline-flex items-center gap-2 rounded-lg px-3 py-2',
                                  priority.badgeClass,
                                )}
                              >
                                <span>{priority.icon}</span>
                                <span>{priority.label}</span>
                              </span>
                              <span
                                className={cn(
                                  'inline-flex items-center gap-2 rounded-lg px-3 py-2 border',
                                  task.completed
                                    ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-200'
                                    : 'border-blue-600/40 bg-blue-900/25 text-blue-200/90',
                                )}
                              >
                                <Timer className="h-3.5 w-3.5" />
                                {task.completed ? 'Completed' : 'In Progress'}
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-blue-600/50 bg-blue-900/30 text-blue-200 hover:bg-blue-900/40 hover:border-blue-400/60 transition"
                            onClick={() =>
                              setExpandedTasks((prev) =>
                                prev.includes(task.id) ? prev.filter((id) => id !== task.id) : [...prev, task.id],
                              )
                            }
                          >
                            {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                          </button>
                        </div>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, y: -6 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -6 }}
                              className="rounded-2xl border border-blue-700/40 bg-blue-900/20 p-5 space-y-4"
                            >
                              <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-blue-200/70">
                                <span>Subtasks</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-blue-200/80 hover:text-blue-100 hover:bg-blue-900/30"
                                  onClick={() => onDeleteTask(task.id)}
                                >
                                  Archive Task
                                </Button>
                              </div>

                              <div className="space-y-2">
                                {task.subtasks?.length ? (
                                  task.subtasks.map((subtask) => (
                                    <motion.div
                                      key={subtask.id}
                                      variants={subtaskVariants}
                                      initial="hidden"
                                      animate="visible"
                                      className={cn(
                                        'flex items-center gap-3 rounded-xl border border-blue-700/40 bg-blue-950/30 px-4 py-3 text-sm text-blue-100/80',
                                        subtask.completed && 'line-through text-blue-300/40',
                                      )}
                                    >
                                      <button
                                        type="button"
                                        onClick={() => handleToggleSubtask(task.id, subtask.id)}
                                        className={cn(
                                          'flex h-6 w-6 items-center justify-center rounded-full border transition-colors',
                                          subtask.completed
                                            ? 'border-emerald-400/60 bg-emerald-500/20 text-emerald-200'
                                            : 'border-blue-600/40 bg-blue-900/40 text-blue-200 hover:border-blue-400/70',
                                        )}
                                      >
                                        {subtask.completed ? (
                                          <CheckCircle2 className="h-4 w-4" />
                                        ) : (
                                          <Circle className="h-4 w-4" />
                                        )}
                                      </button>
                                      <span className="flex-1">{subtask.title}</span>
                                    </motion.div>
                                  ))
                                ) : (
                                  <div className="rounded-xl border border-dashed border-blue-700/40 bg-blue-950/10 px-4 py-6 text-center text-sm text-blue-200/70">
                                    No micro-steps logged—mirror the LiveBlock micro plan here.
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.li>
                );
              })}
            </LayoutGroup>
          </motion.ul>
        )}
      </CardContent>
    </Card>
  );
}

export default ClientDeepWorkTaskList;
