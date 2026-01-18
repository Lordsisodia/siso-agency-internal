import { ClientData } from '@/types/client.types';
import { EditableField } from '../shared/EditableField';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { Sparkles } from 'lucide-react';

interface ClientsOverviewTabProps {
  client: ClientData;
  onUpdate: (updates: Partial<ClientData>) => Promise<void>;
}

export function ClientsOverviewTab({ client, onUpdate }: ClientsOverviewTabProps) {
  const onboardingPercent = useMemo(() => {
    if (!client.total_steps || client.total_steps === 0) {
      return 0;
    }
    const completed = client.completed_steps?.length ?? 0;
    return Math.min(100, Math.round((completed / client.total_steps) * 100));
  }, [client.completed_steps, client.total_steps]);

  const stageSegments = useMemo(() => {
    const phases = [
      { key: 'discovery', label: 'Discovery' },
      { key: 'proposal', label: 'Proposal' },
      { key: 'build', label: 'Build' },
      { key: 'launch', label: 'Launch' },
    ];

    const currentStep = client.current_step ?? 1;
    const activeIndex = Math.min(phases.length - 1, Math.max(0, currentStep - 1));

    return phases.map((phase, index) => ({
      ...phase,
      state: index < activeIndex ? 'complete' : index === activeIndex ? 'active' : 'upcoming',
    }));
  }, [client.current_step]);

  return (
    <div className="space-y-10">
      <section className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-2xl shadow-[0_20px_80px_rgba(6,6,18,0.45)]"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-white">Onboarding Flow</h2>
              <p className="text-xs text-white/50 mt-1">Track where this client is in the lifecycle.</p>
            </div>
            <Badge className="bg-emerald-500/20 text-emerald-200 border-emerald-400/40">
              {onboardingPercent}% complete
            </Badge>
          </div>

          <div className="grid gap-4">
            <Progress value={onboardingPercent} className="h-2 bg-white/5" />
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-white/40">
              <span>0%</span>
              <span>25%</span>
              <span>50%</span>
              <span>75%</span>
              <span>100%</span>
            </div>
            <div className="flex flex-wrap gap-3 mt-6">
              {stageSegments.map((segment) => (
                <div
                  key={segment.key}
                  className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/70"
                >
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{
                      background:
                        segment.state === 'complete'
                          ? 'linear-gradient(135deg, rgba(34,197,94,0.8), rgba(59,130,246,0.8))'
                          : segment.state === 'active'
                          ? 'linear-gradient(135deg, rgba(249,115,22,0.8), rgba(236,72,153,0.8))'
                          : 'rgba(255,255,255,0.2)',
                    }}
                  />
                  {segment.label}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-3xl border border-amber-400/40 bg-gradient-to-br from-amber-500/10 via-transparent to-white/5 p-6 backdrop-blur-2xl shadow-[0_10px_40px_rgba(130,64,9,0.45)]"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-amber-200/70">Momentum</p>
              <h3 className="mt-2 text-xl font-semibold text-white">Team Focus</h3>
            </div>
            <Sparkles className="h-5 w-5 text-amber-200/70" />
          </div>
          <p className="mt-4 text-sm text-amber-100/70">
            Keep this client moving by updating budget, deadlines, and tasks directly on this page.
            Inline edits save instantly and sync across the workspace.
          </p>
        </motion.div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        <EditableField
          label="Budget"
          description="Project investment"
          type="currency"
          value={client.estimated_price ?? 0}
          placeholder="$0"
          onSave={async (payload) => {
            await onUpdate({ estimated_price: typeof payload === 'number' ? payload : null });
          }}
        />
        <EditableField
          label="Deadline"
          description="Target handover date"
          type="date"
          value={client.estimated_completion_date ?? client.start_date ?? null}
          placeholder="Select date"
          onSave={async (payload) => {
            await onUpdate({
              estimated_completion_date: typeof payload === 'string' ? payload : null,
            });
          }}
        />
        <EditableField
          label="Industry"
          description="Primary market"
          value={client.company_niche ?? ''}
          placeholder="e.g. Fintech SaaS"
          onSave={async (payload) => {
            await onUpdate({
              company_niche: typeof payload === 'string' ? payload : null,
            });
          }}
        />
        <EditableField
          label="Status"
          description="Pipeline stage"
          type="select"
          value={String(client.status ?? 'active')}
          options={[
            { value: 'potential', label: 'Potential' },
            { value: 'onboarding', label: 'Onboarding' },
            { value: 'active', label: 'Active' },
            { value: 'completed', label: 'Completed' },
            { value: 'archived', label: 'Archived' },
          ]}
          onSave={async (payload) => {
            await onUpdate({
              status: typeof payload === 'string' ? payload : client.status,
            });
          }}
        />
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <EditableField
          label="Project Name"
          description="What are we building?"
          value={client.project_name ?? ''}
          placeholder="Name the initiative"
          onSave={async (payload) => {
            await onUpdate({
              project_name: typeof payload === 'string' ? payload : null,
            });
          }}
        />
        <EditableField
          label="Website"
          description="Client website or MVP link"
          value={client.website_url ?? ''}
          placeholder="https://"
          onSave={async (payload) => {
            await onUpdate({
              website_url: typeof payload === 'string' ? payload : null,
            });
          }}
        />
      </section>
    </div>
  );
}
