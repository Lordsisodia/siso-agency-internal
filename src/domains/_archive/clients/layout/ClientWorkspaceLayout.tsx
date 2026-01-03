import { PropsWithChildren, useMemo } from 'react';
import { ClientData, ClientTask } from '@/types/client.types';
import { Button } from '@/components/ui/button';
import { RefreshCw, Sparkles, TrendingUp, Briefcase, Clock, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ClientWorkspaceLayoutProps extends PropsWithChildren {
  client?: ClientData | null;
  tasks?: ClientTask[];
  isUpdating?: boolean;
  onRefresh?: () => void | Promise<void>;
}

const STATUS_BADGE: Record<string, string> = {
  potential: 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-blue-500/40 text-blue-200',
  onboarding: 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-orange-400/40 text-orange-200',
  active: 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-emerald-400/40 text-emerald-200',
  completed: 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border-indigo-400/40 text-indigo-200',
  archived: 'bg-gradient-to-r from-slate-500/20 to-gray-500/20 border-slate-400/40 text-slate-200',
};

export function ClientWorkspaceLayout({
  children,
  client,
  tasks = [],
  isUpdating,
  onRefresh,
}: ClientWorkspaceLayoutProps) {
  const statusBadgeClass = STATUS_BADGE[(client?.status || '').toLowerCase()] ?? STATUS_BADGE.potential;

  const taskSummary = useMemo(() => {
    if (!tasks?.length) {
      return {
        total: 0,
        completed: 0,
        pending: 0,
        nextDue: null as string | null,
      };
    }

    const completed = tasks.filter((task) => task.completed).length;
    const pending = tasks.length - completed;
    const sortedByDueDate = [...tasks]
      .filter((task) => !task.completed && task.due_date)
      .sort(
        (a, b) =>
          new Date(a.due_date ?? '').getTime() - new Date(b.due_date ?? '').getTime(),
      );

    return {
      total: tasks.length,
      completed,
      pending,
      nextDue: sortedByDueDate[0]?.due_date ?? null,
    };
  }, [tasks]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#07060F] via-[#0B0A18] to-[#030208] text-white">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-siso-orange/20 via-transparent to-siso-purple/10 blur-3xl opacity-40 pointer-events-none" />
        <div className="relative z-10 px-6 pt-12 pb-10 max-w-6xl mx-auto">
          <header className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
            <div className="flex flex-col lg:flex-row justify-between gap-8">
              <div className="flex-1">
                <div>
                  <div className="flex items-center gap-3 flex-wrap mb-2">
                    <h1 className="text-3xl md:text-4xl font-semibold bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
                      {client?.business_name ?? 'Client Workspace'}
                    </h1>
                    {client?.status && (
                      <Badge className={cn('text-xs uppercase tracking-wide px-3 py-1 backdrop-blur border', statusBadgeClass)}>
                        {client.status}
                      </Badge>
                    )}
                  </div>

                  <p className="text-sm text-white/60 max-w-xl">
                    {client?.project_name
                      ? `${client.project_name} · ${client.company_niche ?? 'Industry TBD'}`
                      : client?.company_niche ?? 'Define project details to align your team.'}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-3 text-xs text-white/50">
                    {client?.created_at && (
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                        <Clock className="h-3.5 w-3.5 text-white/50" />
                        Added {formatDistanceToNow(new Date(client.created_at), { addSuffix: true })}
                      </span>
                    )}
                    {client?.updated_at && (
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                        <Calendar className="h-3.5 w-3.5 text-white/50" />
                        Updated {formatDistanceToNow(new Date(client.updated_at), { addSuffix: true })}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                      <Briefcase className="h-3.5 w-3.5 text-white/50" />
                      {taskSummary.pending} open tasks
                    </span>
                    {taskSummary.nextDue && (
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                        <TrendingUp className="h-3.5 w-3.5 text-white/50" />
                        Next deadline {formatDistanceToNow(new Date(taskSummary.nextDue), { addSuffix: true })}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-3">
                <Button
                  variant="outline"
                  className="border-white/20 bg-white/10 hover:bg-white/20 text-white flex items-center gap-2"
                  onClick={() => onRefresh?.()}
                  disabled={isUpdating}
                >
                  <RefreshCw className={cn('h-4 w-4', isUpdating && 'animate-spin')} />
                  Refresh Data
                </Button>
                <div className="flex items-center gap-3 text-xs text-white/60">
                  <Sparkles className="h-4 w-4 text-siso-orange" />
                  Powered by LifeLock UI system
                </div>
              </div>
            </div>
          </header>
        </div>
      </div>

      <main className="relative z-10 px-6 pb-32 md:pb-24">
        <div className="max-w-6xl mx-auto space-y-10">
          {children}
        </div>
      </main>
    </div>
  );
}
