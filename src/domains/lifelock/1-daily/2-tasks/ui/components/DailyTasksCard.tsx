import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Loader2, Plus, Trash2, FolderPlus, X, Calendar } from 'lucide-react';
import { useDailyTasksSupabase } from '../../domain/useDailyTasksSupabase';
import { useDeepWorkTasksSupabase } from '@/domains/lifelock/1-daily/4-deep-work/domain/useDeepWorkTasksSupabase';
import { cn } from '@/lib/utils';

interface DailyTasksCardProps {
  selectedDate: Date;
  className?: string;
}

export const DailyTasksCard: React.FC<DailyTasksCardProps> = ({ selectedDate, className }) => {
  const { tasks, loading, saving, error, addTask, deleteTask, toggleTaskCompletion, dateKey } =
    useDailyTasksSupabase({ selectedDate });

  const {
    tasks: deepWorkTasks,
    loading: deepLoading,
  } = useDeepWorkTasksSupabase({ selectedDate });

  const [newTask, setNewTask] = useState('');
  const [dateInfo, setDateInfo] = useState({ date: '', time: '' });
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [showImport, setShowImport] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const date = now.toLocaleDateString('en-US', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
      const time = now.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
      });
      setDateInfo({ date, time });
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleAdd = async () => {
    if (!newTask.trim()) return;
    await addTask(newTask.trim());
    setNewTask('');
    inputRef.current?.focus();
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      void handleAdd();
    }
  };

  const completedCount = useMemo(
    () => tasks.filter((t) => t.status === 'completed').length,
    [tasks],
  );

  const allDone = tasks.length > 0 && completedCount === tasks.length;

  // Check if a task is a synced deep work task
  const isDeepWorkTask = (taskId: string) => taskId.startsWith('dw-');

  const availableDeepTasks = useMemo(
    () =>
      deepWorkTasks
        .filter((t) => !t.completed)
        .map((t) => ({
          id: t.id,
          title: t.title,
          due: t.dueDate || t.currentDate || t.createdAt,
          priority: t.priority?.toLowerCase?.() || 'medium',
        })),
    [deepWorkTasks],
  );

  const importDeepTask = async (title: string) => {
    await addTask(title);
    setShowImport(false);
  };

  return (
    <div
      className={cn(
        'w-full rounded-3xl shadow-2xl border overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 transition-all duration-300',
        allDone ? 'border-emerald-300/70 ring-2 ring-emerald-300/50' : 'border-slate-700/40',
        className,
      )}
    >
      <div className="flex items-center justify-between px-4 py-4 bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 text-white shadow-inner">
        <div className="flex items-center space-x-3">
          <div className="text-sm font-semibold">{dateInfo.date}</div>
          <div className="bg-black/20 text-white text-xs font-semibold px-2 py-1 rounded-md">
            {dateInfo.time}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {saving && <Loader2 className="h-4 w-4 animate-spin text-white" />}
          <div className="text-xs font-semibold">
            {completedCount}/{tasks.length} done
          </div>
        </div>
      </div>

      <div className="p-5 space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            ref={inputRef}
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="New task..."
            className="flex-1 rounded-xl border border-slate-700/40 bg-slate-900/60 px-3 py-3 text-sm text-slate-50 placeholder:text-slate-400/60 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-500/30 shadow-sm"
          />
          <button
            type="button"
            onClick={() => void handleAdd()}
            disabled={saving || !newTask.trim()}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-600/90 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-500 disabled:opacity-60"
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
          <button
            type="button"
            onClick={() => setShowImport((prev) => !prev)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700/50 bg-slate-900/70 px-4 py-3 text-sm font-semibold text-slate-50 hover:bg-slate-800/70"
            title="Select from Deep Work tasks"
          >
            <FolderPlus className="h-4 w-4" />
            Deep Work
          </button>
        </div>

        {error && (
          <p className="text-sm text-red-200 bg-red-900/40 border border-red-700/40 rounded-md px-3 py-2">
            {error}
          </p>
        )}

        {showImport && (
          <div className="rounded-xl border border-slate-700/60 bg-slate-900/40 p-3 space-y-2">
            <div className="flex items-center justify-between text-slate-100 font-semibold text-sm">
              <span>Select Deep Work task</span>
              <button onClick={() => setShowImport(false)} className="p-1 text-slate-400 hover:text-slate-100">
                <X className="h-4 w-4" />
              </button>
            </div>
            {deepLoading ? (
              <div className="text-xs text-slate-400">Loading deep work tasks…</div>
            ) : availableDeepTasks.length === 0 ? (
              <div className="text-xs text-slate-400">No open deep work tasks for this date.</div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-auto pr-1">
                {availableDeepTasks.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => void importDeepTask(t.title)}
                    className="w-full text-left flex items-center gap-3 rounded-lg border border-slate-700/50 bg-slate-900/50 hover:border-slate-500/60 hover:bg-slate-800/70 transition p-2 text-slate-50"
                  >
                    <span className="flex-shrink-0 h-6 w-6 rounded-md bg-slate-800/70 flex items-center justify-center text-[11px] font-bold capitalize">
                      {t.priority.slice(0, 1)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate">{t.title}</div>
                      <div className="text-[11px] text-slate-400/80 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {t.due ? new Date(t.due).toLocaleDateString() : 'No date'}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="space-y-3">
          {loading ? (
            <div className="text-sm text-slate-300">Loading tasks…</div>
          ) : tasks.length === 0 ? (
            <div className="text-sm text-slate-300/80 rounded-2xl border border-slate-700/50 bg-slate-900/40 px-4 py-5 text-center">
              No tasks for this day yet. Add one above or import from Deep Work.
            </div>
          ) : (
            tasks.map((task) => {
              const isDone = task.status === 'completed';
              const isDeepWork = isDeepWorkTask(task.id);
              return (
                <div
                  key={task.id}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-2xl border transition shadow-sm',
                    isDone
                      ? 'bg-slate-950/60 border-emerald-400/30'
                      : 'bg-gradient-to-r from-slate-950/80 via-slate-900/70 to-slate-950/60 border-slate-700/50 hover:border-slate-500/60 hover:shadow-slate-500/20',
                  )}
                >
                  <button
                    type="button"
                    onClick={() => void toggleTaskCompletion(task.id)}
                    className={cn(
                      'h-7 w-7 rounded-full border flex items-center justify-center transition',
                      isDone
                        ? 'bg-emerald-400 border-emerald-400 text-slate-900'
                        : 'border-slate-500/70 bg-slate-900/80 text-slate-400 hover:border-slate-400 hover:text-slate-300',
                    )}
                    aria-label={isDone ? 'Mark as pending' : 'Mark as completed'}
                  >
                    {isDone && <Check className="h-3.5 w-3.5" />}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          'text-sm font-semibold',
                          isDone ? 'text-slate-400/60 line-through' : 'text-slate-50',
                        )}
                      >
                        {task.title}
                      </div>
                      {isDeepWork && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/40 text-[10px] font-semibold text-purple-200">
                          Deep Work
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400/80">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-800/50 border border-slate-700/40">
                        <Calendar className="h-3 w-3" />
                        {task.dueDate
                          ? new Date(task.dueDate).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                            })
                          : 'Today'}
                      </span>
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 px-2 py-1 rounded-full border text-[11px]',
                          isDone
                            ? 'border-emerald-400/50 text-emerald-200 bg-emerald-900/30'
                            : 'border-slate-500/40 text-slate-200 bg-slate-800/20',
                        )}
                      >
                        {isDone ? 'Done' : 'Pending'}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => void deleteTask(task.id)}
                    className="p-2 rounded-lg text-slate-400 hover:text-red-200 hover:bg-red-900/30 transition"
                    aria-label="Delete task"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
