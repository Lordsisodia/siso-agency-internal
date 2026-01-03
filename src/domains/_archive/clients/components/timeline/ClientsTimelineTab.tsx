import { ClientData } from '@/types/client.types';
import { Timeline } from '@/components/ui/timeline';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Clock, FileText } from 'lucide-react';
import { format } from 'date-fns';

interface TimelineEvent {
  id: string;
  title: string;
  occurred_at: string;
  category: string;
  summary?: string | null;
}

interface ClientsTimelineTabProps {
  client: ClientData;
  events: TimelineEvent[];
  onCreateEvent: (payload: Partial<TimelineEvent>) => Promise<void>;
  onUpdateEvent: (eventId: string, updates: Partial<TimelineEvent>) => Promise<void>;
  onDeleteEvent: (eventId: string) => Promise<void>;
}

export function ClientsTimelineTab({
  client,
  events,
  onCreateEvent,
}: ClientsTimelineTabProps) {
  const timelineItems = events.map((event) => ({
    title: event.title,
    description: event.summary ?? undefined,
    date: format(new Date(event.occurred_at), 'MMMM d, yyyy • h:mm a'),
    metadata: event.category,
  }));

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Momentum Timeline</h2>
          <p className="text-xs text-white/50">
            Sync discovery calls, scope approvals, build updates, and launch notes. Mirrors the
            rhythm of the LifeLock daily timeline.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            className="bg-gradient-to-r from-siso-orange to-siso-purple text-white hover:from-siso-orange/90 hover:to-siso-purple/90"
            onClick={() =>
              onCreateEvent({
                title: 'New milestone',
                occurred_at: new Date().toISOString(),
                summary: `Update for ${client.business_name ?? 'client'}`,
                category: 'milestone',
              })
            }
          >
            <Plus className="h-4 w-4 mr-2" />
            Quick Milestone
          </Button>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl p-6 shadow-[0_20px_80px_rgba(6,6,18,0.35)]">
        {timelineItems.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/10 border border-white/20">
              <Clock className="h-6 w-6 text-white/60" />
            </div>
            <div className="space-y-2">
              <p className="text-white font-medium">No timeline entries yet</p>
              <p className="text-sm text-white/50">
                Once calls, approvals, and build milestones are logged, they’ll flow through this
                LifeLock-style timeline.
              </p>
            </div>
          </div>
        ) : (
          <Timeline
            items={timelineItems}
            renderMetadata={(metadata) => (
              metadata ? (
                <Badge className="bg-white/10 border border-white/20 text-xs uppercase tracking-[0.3em] text-white/60">
                  {typeof metadata === 'string' ? metadata.toUpperCase() : metadata}
                </Badge>
              ) : null
            )}
          />
        )}
      </div>

      <div className="rounded-3xl border border-dashed border-white/15 bg-black/30 p-6 text-white/60 text-sm flex items-center gap-3">
        <FileText className="h-5 w-5 text-white/40" />
        Pull voice-of-client insight from the Thought Dump or automate milestone capture via AI once
        the Supabase events table is wired.
      </div>
    </div>
  );
}
