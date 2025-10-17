import { useState } from 'react';
import { format } from 'date-fns';
import { ClientData } from '@/types/client.types';
import { Button } from '@/shared/ui/button';
import { Textarea } from '@/shared/ui/textarea';
import { OnboardingChecklist } from '../components/OnboardingChecklist';

interface OverviewTabProps {
  client: ClientData;
}

export function OverviewTab({ client }: OverviewTabProps) {
  const [isEditingBrief, setIsEditingBrief] = useState(false);
  const [draftBrief, setDraftBrief] = useState(client.brief ?? '');

  const handleSaveBrief = () => {
    // TODO: Persist to Supabase once mutations are in place
    setIsEditingBrief(false);
  };

  const budget = client.estimated_price != null ? `$${client.estimated_price.toLocaleString()}` : 'TBD';
  const deadline = client.estimated_completion_date
    ? format(new Date(client.estimated_completion_date), 'MMM d, yyyy')
    : 'TBD';

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-gray-800 bg-gray-950/80 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Client Brief</h2>
          <Button
            size="sm"
            variant="outline"
            onClick={() => (isEditingBrief ? handleSaveBrief() : setIsEditingBrief(true))}
            className="border-gray-700 bg-gray-900 text-gray-200 hover:bg-gray-800"
          >
            {isEditingBrief ? 'Save' : 'Edit'}
          </Button>
        </div>
        {isEditingBrief ? (
          <Textarea
            value={draftBrief}
            onChange={(event) => setDraftBrief(event.target.value)}
            placeholder="Add a quick summary for this client"
            className="min-h-[120px] resize-none border-gray-800 bg-gray-900 text-gray-100"
          />
        ) : (
          <p className="rounded-xl border border-gray-800 bg-gray-900/70 p-4 text-sm text-gray-200">
            {draftBrief || 'No brief yet'}
          </p>
        )}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-gray-800 bg-gray-950/80 p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500">Budget</p>
          <p className="mt-2 text-lg font-semibold text-white">{budget}</p>
        </div>
        <div className="rounded-2xl border border-gray-800 bg-gray-950/80 p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500">Deadline</p>
          <p className="mt-2 text-lg font-semibold text-white">{deadline}</p>
        </div>
        <div className="rounded-2xl border border-gray-800 bg-gray-950/80 p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500">Type</p>
          <p className="mt-2 text-lg font-semibold text-white">{client.type || 'Not set'}</p>
        </div>
        <div className="rounded-2xl border border-gray-800 bg-gray-950/80 p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500">Status</p>
          <p className="mt-2 text-lg font-semibold capitalize text-white">{client.status || 'Unknown'}</p>
        </div>
      </section>

      <OnboardingChecklist clientId={client.id} progress={client.onboarding_progress} />
    </div>
  );
}
