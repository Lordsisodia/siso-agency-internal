import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/services/integrations/supabase/client';
import { useToast } from '@/lib/hooks/ui/useToast';
import { useAuth } from '@/lib/hooks/auth/useClerkUser';
import {
  createPartnerReferral,
  updatePartnerReferral,
  upsertPartnerCommission,
  getPartnerReferrals,
} from '@/agency/partners/services/partnerWorkspaceService';
import type {
  PartnerReferral,
  CreatePartnerReferralInput,
  UpdatePartnerReferralInput,
  UpsertPartnerCommissionInput,
} from '@/agency/partners/types/partner.types';

export interface ReferralAnalytics {
  totalReferrals: number;
  wonReferrals: number;
  conversionRate: number;
  pipelineValue: number;
  actualValue: number;
  commissionPending: number;
  commissionPaid: number;
}

export interface ReferralFilters {
  stage?: PartnerReferral['stage'][];
  commissionStatus?: NonNullable<PartnerReferral['commissionStatus']>[];
  searchTerm?: string;
}

type ReferralCommissionStatus = NonNullable<PartnerReferral['commissionStatus']>;

const COMMISSION_STATUS_PRIORITY: ReferralCommissionStatus[] = ['pending', 'approved', 'paid'];
const STAGE_PRIORITY: PartnerReferral['stage'][] = ['new', 'contacted', 'qualified', 'proposal', 'won', 'lost'];

const emptyAnalytics: ReferralAnalytics = {
  totalReferrals: 0,
  wonReferrals: 0,
  conversionRate: 0,
  pipelineValue: 0,
  actualValue: 0,
  commissionPending: 0,
  commissionPaid: 0,
};

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const matchSearch = (referral: PartnerReferral, term: string) => {
  const haystack = [
    referral.clientName,
    referral.clientEmail,
    referral.referralSource,
  ]
    .filter(isNonEmptyString)
    .map((value) => value.toLowerCase());

  return haystack.some((value) => value.includes(term));
};

const computeAnalytics = (referrals: PartnerReferral[]): ReferralAnalytics => {
  if (referrals.length === 0) {
    return emptyAnalytics;
  }

  const totalReferrals = referrals.length;
  const wonReferrals = referrals.filter((referral) => referral.stage === 'won').length;

  const pipelineValue = referrals.reduce(
    (sum, referral) => sum + (referral.estimatedValue ?? 0),
    0,
  );

  const actualValue = referrals.reduce(
    (sum, referral) => sum + (referral.actualValue ?? 0),
    0,
  );

  const commissionPending = referrals.reduce((sum, referral) => {
    if (!referral.commissionAmount) {
      return sum;
    }
    if (referral.commissionStatus === 'pending' || referral.commissionStatus === 'approved') {
      return sum + referral.commissionAmount;
    }
    return sum;
  }, 0);

  const commissionPaid = referrals.reduce((sum, referral) => {
    if (!referral.commissionAmount) {
      return sum;
    }
    return referral.commissionStatus === 'paid' ? sum + referral.commissionAmount : sum;
  }, 0);

  const conversionRate =
    totalReferrals > 0 ? Math.round((wonReferrals / totalReferrals) * 100) : 0;

  return {
    totalReferrals,
    wonReferrals,
    conversionRate,
    pipelineValue,
    actualValue,
    commissionPending,
    commissionPaid,
  };
};

export const useReferralsManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [referrals, setReferrals] = useState<PartnerReferral[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ReferralFilters>({});

  const getOrResolvePartnerId = useCallback(async (): Promise<string> => {
    if (partnerId) {
      return partnerId;
    }

    if (!user?.id) {
      throw new Error('You must be signed in to manage referrals.');
    }

    const { data, error: partnerError } = await supabase
      .from('partners')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (partnerError) {
      throw partnerError;
    }

    if (!data?.id) {
      throw new Error('No partner profile found for the current user.');
    }

    setPartnerId(data.id);
    return data.id;
  }, [partnerId, user?.id]);

  const fetchReferrals = useCallback(async () => {
    if (!user?.id) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const resolvedPartnerId = await getOrResolvePartnerId();
      const data = await getPartnerReferrals(resolvedPartnerId);
      setReferrals(data);
    } catch (err) {
      console.error('Error loading partner referrals:', err);
      const message =
        err instanceof Error ? err.message : 'Failed to load partner referrals.';
      setError(message);
      toast({
        title: 'Unable to load referrals',
        description: message,
        variant: 'destructive',
      });
      setReferrals([]);
    } finally {
      setLoading(false);
    }
  }, [getOrResolvePartnerId, toast, user?.id]);

  useEffect(() => {
    void fetchReferrals();
  }, [fetchReferrals]);

  const analytics = useMemo(() => computeAnalytics(referrals), [referrals]);

  const filteredReferrals = useMemo(() => {
    const sortedByDate = [...referrals].sort((a, b) => {
      const aDate = a.referredAt ? new Date(a.referredAt).getTime() : 0;
      const bDate = b.referredAt ? new Date(b.referredAt).getTime() : 0;
      if (bDate !== aDate) {
        return bDate - aDate;
      }
      return (
        STAGE_PRIORITY.indexOf(a.stage) - STAGE_PRIORITY.indexOf(b.stage)
      );
    });

    return sortedByDate.filter((referral) => {
      if (filters.stage?.length && !filters.stage.includes(referral.stage)) {
        return false;
      }

      if (filters.commissionStatus?.length) {
        const status = referral.commissionStatus ?? 'pending';
        if (!filters.commissionStatus.includes(status)) {
          return false;
        }
      }

      if (filters.searchTerm) {
        const term = filters.searchTerm.trim().toLowerCase();
        if (term.length > 0 && !matchSearch(referral, term)) {
          return false;
        }
      }

      return true;
    });
  }, [filters, referrals]);

  const handleCreateReferral = useCallback(
    async (input: CreatePartnerReferralInput) => {
      try {
        const resolvedPartnerId = await getOrResolvePartnerId();
        await createPartnerReferral(resolvedPartnerId, input);
        toast({
          title: 'Referral created',
          description: `Logged referral for ${input.clientName}.`,
        });
        await fetchReferrals();
      } catch (err) {
        console.error('Error creating referral:', err);
        toast({
          title: 'Error',
          description: 'Failed to create referral.',
          variant: 'destructive',
        });
      }
    },
    [fetchReferrals, getOrResolvePartnerId, toast],
  );

  const handleUpdateReferral = useCallback(
    async (referralId: string, updates: UpdatePartnerReferralInput) => {
      try {
        const resolvedPartnerId = await getOrResolvePartnerId();
        await updatePartnerReferral(resolvedPartnerId, referralId, updates);
        toast({
          title: 'Referral updated',
          description: 'Changes saved successfully.',
        });
        await fetchReferrals();
      } catch (err) {
        console.error('Error updating referral:', err);
        toast({
          title: 'Error',
          description: 'Failed to update referral.',
          variant: 'destructive',
        });
      }
    },
    [fetchReferrals, getOrResolvePartnerId, toast],
  );

  const handleRecordCommission = useCallback(
    async (input: UpsertPartnerCommissionInput) => {
      try {
        const resolvedPartnerId = await getOrResolvePartnerId();
        await upsertPartnerCommission(resolvedPartnerId, input);
        const statusLabel = input.status
          ? input.status.charAt(0).toUpperCase() + input.status.slice(1)
          : 'Pending';
        toast({
          title: 'Commission updated',
          description: `${statusLabel} commission recorded.`,
        });
        await fetchReferrals();
      } catch (err) {
        console.error('Error recording commission:', err);
        toast({
          title: 'Error',
          description: 'Failed to update commission information.',
          variant: 'destructive',
        });
      }
    },
    [fetchReferrals, getOrResolvePartnerId, toast],
  );

  return {
    referrals: filteredReferrals,
    analytics,
    loading,
    error,
    filters,
    setFilters,
    commissionStatuses: COMMISSION_STATUS_PRIORITY,
    refetch: fetchReferrals,
    createReferral: handleCreateReferral,
    updateReferral: handleUpdateReferral,
    recordCommission: handleRecordCommission,
  };
};

export default useReferralsManagement;
