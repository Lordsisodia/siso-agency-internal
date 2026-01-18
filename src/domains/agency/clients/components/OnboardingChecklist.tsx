import { useEffect, useState } from 'react';
import { OnboardingProgress } from '@/types/client.types';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/services/integrations/supabase/client';

interface OnboardingChecklistProps {
  progress?: OnboardingProgress | null;
  clientId: string;
}

const DEFAULT_PROGRESS: OnboardingProgress = {
  initial_contact: false,
  talked_to: false,
  proposal_created: false,
  quote_given: false,
  mvp_created: false,
  deposit_collected: false,
  project_live: false,
};

const steps: Array<{ key: keyof OnboardingProgress; label: string }> = [
  { key: 'initial_contact', label: 'Initial contact' },
  { key: 'talked_to', label: 'Talked to' },
  { key: 'proposal_created', label: 'Proposal created' },
  { key: 'quote_given', label: 'Quote given' },
  { key: 'mvp_created', label: 'MVP created' },
  { key: 'deposit_collected', label: 'Deposit collected' },
  { key: 'project_live', label: 'Project live' },
];

export function OnboardingChecklist({ progress, clientId }: OnboardingChecklistProps) {
  const [localProgress, setLocalProgress] = useState<OnboardingProgress>(progress ?? DEFAULT_PROGRESS);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (progress) {
      setLocalProgress(progress);
    }
  }, [progress]);

  const handleToggle = async (key: keyof OnboardingProgress) => {
    const nextProgress: OnboardingProgress = {
      ...localProgress,
      [key]: !localProgress[key],
    };

    setLocalProgress(nextProgress);
    setIsSaving(true);

    const { error } = await supabase
      .from('clients')
      .update({ onboarding_progress: nextProgress })
      .eq('id', clientId);

    if (error) {
      console.error('Failed to update onboarding progress', error);
      setLocalProgress(localProgress);
    }

    setIsSaving(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Onboarding Progress</h2>
        {isSaving && <span className="text-xs text-gray-400">Saving…</span>}
      </div>
      <div className="space-y-2 rounded-xl border border-gray-800 bg-gray-900/70 p-4">
        {steps.map((step) => (
          <label
            key={step.key}
            className="flex cursor-pointer items-center gap-3 text-sm text-gray-200"
          >
            <Checkbox
              checked={localProgress[step.key]}
              onCheckedChange={() => handleToggle(step.key)}
            />
            {step.label}
          </label>
        ))}
      </div>
    </div>
  );
}
