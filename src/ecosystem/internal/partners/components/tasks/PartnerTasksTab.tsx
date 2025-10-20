import { useState } from 'react';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/ui/dialog';
import { Plus, CheckCircle2, RotateCcw, Loader2, Trash2 } from 'lucide-react';
import type { PartnerTask, CreatePartnerTaskInput, UpdatePartnerTaskInput } from '../../types/partner.types';

interface PartnerTasksTabProps {
  tasks: PartnerTask[];
  onCreateTask?: (input: CreatePartnerTaskInput) => Promise<void>;
  onUpdateTask?: (taskId: string, updates: UpdatePartnerTaskInput) => Promise<void>;
  onDeleteTask?: (taskId: string, taskTitle?: string) => Promise<void>;
}

const STATUS_LABELS: Record<PartnerTask['status'], string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  blocked: 'Blocked',
  done: 'Done',
};

const STATUS_COLORS: Record<PartnerTask['status'], string> = {
  todo: 'border-amber-400/40 bg-amber-500/10 text-amber-100',
  in_progress: 'border-sky-400/40 bg-sky-500/10 text-sky-100',
  blocked: 'border-rose-400/40 bg-rose-500/10 text-rose-100',
  done: 'border-emerald-400/40 bg-emerald-500/10 text-emerald-100',
};

export function PartnerTasksTab({ tasks, onCreateTask, onUpdateTask, onDeleteTask }: PartnerTasksTabProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<CreatePartnerTaskInput['priority']>('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!onCreateTask || !title.trim()) return;
    setIsSubmitting(true);
    try {
      await onCreateTask({ title: title.trim(), priority });
      setTitle('');
      setPriority('medium');
      setIsDialogOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusToggle = async (task: PartnerTask) => {
    if (!onUpdateTask) return;
    const nextStatus = task.status === 'done' ? 'todo' : 'done';
    await onUpdateTask(task.id, { status: nextStatus });
  };

  const handleDelete = async (task: PartnerTask) => {
    if (!onDeleteTask) return;
    await onDeleteTask(task.id, task.title);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">Tasks</h2>
          <p className="text-sm text-white/60">Assign operational work tied to this partner and track progress.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="border-white/20 bg-white/10 text-white">
              <Plus className="mr-2 h-4 w-4" /> Add Task
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#12121b] border-white/10 text-white">
            <DialogHeader>
              <DialogTitle>Create Partner Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-white/70">Title</label>
                <Input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="e.g. Schedule partner Q4 planning call"
                  className="bg-black/40 text-white placeholder:text-white/40"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-white/70">Priority</label>
                <select
                  value={priority}
                  onChange={(event) => setPriority(event.target.value as CreatePartnerTaskInput['priority'])}
                  className="h-10 rounded-md border border-white/10 bg-black/40 px-3 text-sm text-white outline-none"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" className="text-white/70" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} className="bg-siso-orange text-black" disabled={isSubmitting || !title.trim()}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save Task
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {tasks.length === 0 && (
          <div className="rounded-2xl border border-dashed border-white/20 bg-white/5 p-6 text-sm text-white/60">
            No tasks yet. Add your first task to kickstart partner workflows.
          </div>
        )}
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80 md:flex-row md:items-center md:justify-between"
          >
            <div className="space-y-2">
              <p className="text-base font-semibold text-white">{task.title}</p>
              <div className="flex flex-wrap items-center gap-2 text-xs text-white/60">
                <Badge className={STATUS_COLORS[task.status]}>
                  {STATUS_LABELS[task.status]}
                </Badge>
                <Badge className="border-white/10 bg-white/5 text-white/70">Priority · {task.priority}</Badge>
                {task.assigneeName && <span>Assignee · {task.assigneeName}</span>}
                {task.dueDate && <span>Due · {new Date(task.dueDate).toLocaleDateString()}</span>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="border border-white/10 bg-white/5 text-white hover:bg-white/10"
                onClick={() => void handleStatusToggle(task)}
              >
                {task.status === 'done' ? (
                  <>
                    <RotateCcw className="mr-2 h-4 w-4" /> Reopen
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" /> Mark Done
                  </>
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="border border-white/10 bg-white/5 text-white hover:bg-rose-500/20"
                onClick={() => void handleDelete(task)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
