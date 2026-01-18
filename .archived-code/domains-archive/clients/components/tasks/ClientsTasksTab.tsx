import { ClientData } from '@/types/client.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Flame, Sparkles, Timer } from 'lucide-react';
import { format } from 'date-fns';
import { ClientDeepWorkTaskList } from './ClientDeepWorkTaskList';
import { useClientDeepWorkTasks } from '@/domains/client/hooks/useClientDeepWorkTasks';

interface ClientsTasksTabProps {
  client: ClientData;
}

export function ClientsTasksTab({ client }: ClientsTasksTabProps) {
  // Fetch client deep work tasks for metrics
  const { tasks: deepWorkTasks } = useClientDeepWorkTasks({ clientId: client.id });

  const metrics = {
    total: deepWorkTasks.length,
    completed: deepWorkTasks.filter(t => t.completed).length,
    urgent: deepWorkTasks.filter(t => t.priority === 'URGENT' && !t.completed).length,
    nextDue: deepWorkTasks
      .filter(t => !t.completed && t.dueDate)
      .sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''))[0]?.dueDate ?? null,
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

      <ClientDeepWorkTaskList clientId={client.id} />
    </div>
  );
}
