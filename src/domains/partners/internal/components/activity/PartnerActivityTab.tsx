import type { ComponentType } from 'react';
import type { PartnerActivityEvent } from '../../types/partner.types';
import {
  Clock,
  ClipboardList,
  FileText,
  StickyNote,
  BadgeCheck,
  Wallet2,
  UserPlus2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const EVENT_ICON: Record<PartnerActivityEvent['eventType'], ComponentType<{ className?: string }>> = {
  referral: UserPlus2,
  commission: Wallet2,
  task: ClipboardList,
  document: FileText,
  status: BadgeCheck,
  note: StickyNote,
};

const EVENT_LABEL: Record<PartnerActivityEvent['eventType'], string> = {
  referral: 'Referral',
  commission: 'Commission',
  task: 'Task',
  document: 'Document',
  status: 'Status',
  note: 'Note',
};

interface PartnerActivityTabProps {
  activity: PartnerActivityEvent[];
}

export function PartnerActivityTab({ activity }: PartnerActivityTabProps) {
  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-lg font-semibold text-white">Activity Timeline</h2>
        <p className="text-sm text-white/60">Recent actions synced across referrals, tasks, documents, and status changes.</p>
      </header>

      <div className="space-y-4">
        {activity.length === 0 && (
          <div className="rounded-2xl border border-dashed border-white/20 bg-white/5 p-6 text-sm text-white/60">
            No activity yet. Events such as referrals, commission payments, and task updates will appear here.
          </div>
        )}
        {activity.map((event) => (
          <div
            key={event.id}
            className="flex gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white">
              {(() => {
                const Icon = EVENT_ICON[event.eventType] ?? Clock;
                return <Icon className="h-4 w-4" />;
              })()}
            </div>
            <div className="space-y-1">
              <p className="text-base font-semibold text-white">{event.summary}</p>
              <div className="flex flex-wrap items-center gap-2 text-xs text-white/60">
                <span>{new Date(event.occurredAt).toLocaleString()}</span>
                <span>·</span>
                <span>{event.actor ?? 'System'}</span>
                <Badge className="border-white/10 bg-white/10 text-[10px] uppercase tracking-wide text-white/70">
                  {EVENT_LABEL[event.eventType] ?? event.eventType}
                </Badge>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
