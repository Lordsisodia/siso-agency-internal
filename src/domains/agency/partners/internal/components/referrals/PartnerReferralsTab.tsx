import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Plus, Wallet2 } from 'lucide-react';
import type {
  PartnerReferral,
  CreatePartnerReferralInput,
  UpdatePartnerReferralInput,
  UpsertPartnerCommissionInput,
} from '../../types/partner.types';

interface PartnerReferralsTabProps {
  referrals: PartnerReferral[];
  onCreateReferral?: (input: CreatePartnerReferralInput) => Promise<void>;
  onUpdateReferral?: (referralId: string, updates: UpdatePartnerReferralInput) => Promise<void>;
  onRecordCommission?: (input: UpsertPartnerCommissionInput) => Promise<void>;
}

const STAGE_LABELS: Record<PartnerReferral['stage'], string> = {
  new: 'New',
  contacted: 'Contacted',
  qualified: 'Qualified',
  proposal: 'Proposal',
  won: 'Won',
  lost: 'Lost',
};

const COMMISSION_STATUS_LABELS: Record<NonNullable<PartnerReferral['commissionStatus']>, string> = {
  pending: 'Pending',
  approved: 'Approved',
  paid: 'Paid',
};

const STAGE_OPTIONS = (Object.keys(STAGE_LABELS) as PartnerReferral['stage'][]).map((stage) => ({
  value: stage,
  label: STAGE_LABELS[stage],
}));

const COMMISSION_STATUS_OPTIONS = (Object.keys(COMMISSION_STATUS_LABELS) as NonNullable<
  PartnerReferral['commissionStatus']
>[]).map((status) => ({
  value: status,
  label: COMMISSION_STATUS_LABELS[status],
}));

const formatCurrency = (value?: number) =>
  typeof value === 'number' && Number.isFinite(value) && value > 0 ? `£${value.toLocaleString()}` : '—';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function PartnerReferralsTab({
  referrals,
  onCreateReferral,
  onUpdateReferral,
  onRecordCommission,
}: PartnerReferralsTabProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    clientName: '',
    clientEmail: '',
    companyName: '',
    referralSource: '',
    estimatedValue: '',
    actualValue: '',
    notes: '',
    stage: 'new' as PartnerReferral['stage'],
  });
  const [isCreating, setIsCreating] = useState(false);
  const [updatingReferralId, setUpdatingReferralId] = useState<string | null>(null);

  const [commissionDialogState, setCommissionDialogState] = useState<{
    open: boolean;
    referral: PartnerReferral | null;
    amount: string;
    status: NonNullable<PartnerReferral['commissionStatus']>;
    paidAt: string;
    paymentMethod: string;
    transactionId: string;
  }>({
    open: false,
    referral: null,
    amount: '',
    status: 'pending',
    paidAt: '',
    paymentMethod: '',
    transactionId: '',
  });
  const [isRecordingCommission, setIsRecordingCommission] = useState(false);

  const sortedReferrals = useMemo(
    () =>
      [...referrals].sort((a, b) => {
        const aTime = a.referredAt ? new Date(a.referredAt).getTime() : 0;
        const bTime = b.referredAt ? new Date(b.referredAt).getTime() : 0;
        return bTime - aTime;
      }),
    [referrals],
  );

  const resetCreateForm = () =>
    setCreateForm({
      clientName: '',
      clientEmail: '',
      companyName: '',
      referralSource: '',
      estimatedValue: '',
      actualValue: '',
      notes: '',
      stage: 'new',
    });

  const [createTouched, setCreateTouched] = useState<Record<string, boolean>>({});

  const createFormErrors = useMemo(() => {
    const errors: Record<string, string> = {};
    if (!createForm.clientName.trim()) {
      errors.clientName = 'Client name is required.';
    }
    if (!createForm.clientEmail.trim()) {
      errors.clientEmail = 'Client email is required.';
    } else if (!emailRegex.test(createForm.clientEmail.trim())) {
      errors.clientEmail = 'Enter a valid email address.';
    }
    if (createForm.estimatedValue && Number(createForm.estimatedValue) < 0) {
      errors.estimatedValue = 'Estimated value cannot be negative.';
    }
    if (createForm.actualValue && Number(createForm.actualValue) < 0) {
      errors.actualValue = 'Actual value cannot be negative.';
    }
    return errors;
  }, [createForm]);

  const isCreateValid = Object.keys(createFormErrors).length === 0;

  const handleCreateReferral = async () => {
    if (!onCreateReferral) return;
    setCreateTouched((prev) => ({
      ...prev,
      clientName: true,
      clientEmail: true,
      estimatedValue: createForm.estimatedValue ? true : prev.estimatedValue,
      actualValue: createForm.actualValue ? true : prev.actualValue,
    }));
    if (!isCreateValid) return;

    setIsCreating(true);
    try {
      await onCreateReferral({
        clientName: createForm.clientName.trim(),
        clientEmail: createForm.clientEmail.trim(),
        companyName: createForm.companyName.trim() || undefined,
        referralSource: createForm.referralSource.trim() || undefined,
        notes: createForm.notes.trim() || undefined,
        stage: createForm.stage,
        estimatedValue: createForm.estimatedValue ? Number(createForm.estimatedValue) : undefined,
        actualValue: createForm.actualValue ? Number(createForm.actualValue) : undefined,
      });
      resetCreateForm();
      setCreateTouched({});
      setIsCreateDialogOpen(false);
    } finally {
      setIsCreating(false);
    }
  };

  const handleStageChange = async (referral: PartnerReferral, nextStage: PartnerReferral['stage']) => {
    if (!onUpdateReferral || referral.stage === nextStage) return;
    setUpdatingReferralId(referral.id);
    try {
      await onUpdateReferral(referral.id, { stage: nextStage });
    } finally {
      setUpdatingReferralId(null);
    }
  };

  const openCommissionDialog = (referral: PartnerReferral) => {
    setCommissionDialogState({
      open: true,
      referral,
      amount: referral.commissionAmount ? String(referral.commissionAmount) : '',
      status: referral.commissionStatus ?? 'pending',
      paidAt: '',
      paymentMethod: '',
      transactionId: '',
    });
    setCommissionTouched({});
  };

  const [commissionTouched, setCommissionTouched] = useState<Record<string, boolean>>({});

  const commissionErrors = useMemo(() => {
    const errors: Record<string, string> = {};
    const amountNumber = Number(commissionDialogState.amount);
    if (!commissionDialogState.amount.trim()) {
      errors.amount = 'Commission amount is required.';
    } else if (Number.isNaN(amountNumber) || amountNumber <= 0) {
      errors.amount = 'Provide a positive amount.';
    }
    if (
      commissionDialogState.paidAt &&
      Number.isNaN(new Date(commissionDialogState.paidAt).getTime())
    ) {
      errors.paidAt = 'Enter a valid date/time.';
    }
    return errors;
  }, [commissionDialogState.amount, commissionDialogState.paidAt]);

  const isCommissionValid = Object.keys(commissionErrors).length === 0;

  const handleRecordCommission = async () => {
    if (!onRecordCommission || !commissionDialogState.referral) return;
    setCommissionTouched((prev) => ({
      ...prev,
      amount: true,
      paidAt: commissionDialogState.paidAt ? true : prev.paidAt,
    }));
    if (!isCommissionValid) return;
    const amountNumber = Number(commissionDialogState.amount);

    setIsRecordingCommission(true);
    try {
      await onRecordCommission({
        referralId: commissionDialogState.referral.id,
        commissionAmount: amountNumber,
        status: commissionDialogState.status,
        paymentMethod: commissionDialogState.paymentMethod.trim() || undefined,
        transactionId: commissionDialogState.transactionId.trim() || undefined,
        paidAt: commissionDialogState.paidAt ? new Date(commissionDialogState.paidAt).toISOString() : null,
      });
      setCommissionDialogState((prev) => ({ ...prev, open: false, referral: null }));
      setCommissionTouched({});
    } finally {
      setIsRecordingCommission(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Referral Pipeline</h2>
          <p className="text-sm text-white/60">
            Track sourced opportunities, update stages, and log commission payouts tied to this partner.
          </p>
        </div>
        <Dialog
          open={isCreateDialogOpen}
          onOpenChange={(open) => {
            setIsCreateDialogOpen(open);
            if (!open) {
              resetCreateForm();
              setCreateTouched({});
            }
          }}
        >
          <DialogTrigger asChild>
            <Button variant="outline" className="border-white/20 bg-white/10 text-white">
              <Plus className="mr-2 h-4 w-4" /> Add Referral
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl border border-white/10 bg-[#12121b] text-white">
            <DialogHeader>
              <DialogTitle>Log Partner Referral</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 text-sm">
              <div className="grid gap-2">
                <Label className="text-white/70" htmlFor="clientName">
                  Client Name
                </Label>
                <Input
                  id="clientName"
                  value={createForm.clientName}
                  onChange={(event) => setCreateForm((prev) => ({ ...prev, clientName: event.target.value }))}
                  onBlur={() => setCreateTouched((prev) => ({ ...prev, clientName: true }))}
                  placeholder="e.g. Sofia Ramirez"
                  className="bg-black/40 text-white placeholder:text-white/40"
                />
                {createTouched.clientName && createFormErrors.clientName ? (
                  <p className="text-xs text-rose-300">{createFormErrors.clientName}</p>
                ) : null}
              </div>
              <div className="grid gap-2">
                <Label className="text-white/70" htmlFor="clientEmail">
                  Client Email
                </Label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={createForm.clientEmail}
                  onChange={(event) => setCreateForm((prev) => ({ ...prev, clientEmail: event.target.value }))}
                  onBlur={() => setCreateTouched((prev) => ({ ...prev, clientEmail: true }))}
                  placeholder="sofia@company.com"
                  className="bg-black/40 text-white placeholder:text-white/40"
                />
                {createTouched.clientEmail && createFormErrors.clientEmail ? (
                  <p className="text-xs text-rose-300">{createFormErrors.clientEmail}</p>
                ) : null}
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label className="text-white/70" htmlFor="companyName">
                    Company
                  </Label>
                  <Input
                    id="companyName"
                    value={createForm.companyName}
                    onChange={(event) => setCreateForm((prev) => ({ ...prev, companyName: event.target.value }))}
                    placeholder="Optional"
                    className="bg-black/40 text-white placeholder:text-white/40"
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="text-white/70">Stage</Label>
                  <Select
                    value={createForm.stage}
                    onValueChange={(value) => setCreateForm((prev) => ({ ...prev, stage: value as PartnerReferral['stage'] }))}
                  >
                    <SelectTrigger className="h-10 rounded-md border border-white/10 bg-black/40 text-sm text-white">
                      <SelectValue placeholder="Select stage" />
                    </SelectTrigger>
                    <SelectContent className="border border-white/10 bg-[#0f0f17] text-white">
                      {STAGE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label className="text-white/70" htmlFor="estimatedValue">
                    Estimated Value (£)
                  </Label>
                  <Input
                    id="estimatedValue"
                    type="number"
                    value={createForm.estimatedValue}
                    onChange={(event) =>
                      setCreateForm((prev) => ({ ...prev, estimatedValue: event.target.value }))
                    }
                    onBlur={() => setCreateTouched((prev) => ({ ...prev, estimatedValue: true }))}
                    placeholder="15000"
                    className="bg-black/40 text-white placeholder:text-white/40"
                  />
                  {createTouched.estimatedValue && createFormErrors.estimatedValue ? (
                    <p className="text-xs text-rose-300">{createFormErrors.estimatedValue}</p>
                  ) : null}
                </div>
                <div className="grid gap-2">
                  <Label className="text-white/70" htmlFor="actualValue">
                    Actual Value (£)
                  </Label>
                  <Input
                    id="actualValue"
                    type="number"
                    value={createForm.actualValue}
                    onChange={(event) =>
                      setCreateForm((prev) => ({ ...prev, actualValue: event.target.value }))
                    }
                    onBlur={() => setCreateTouched((prev) => ({ ...prev, actualValue: true }))}
                    placeholder="Leave blank until won"
                    className="bg-black/40 text-white placeholder:text-white/40"
                  />
                  {createTouched.actualValue && createFormErrors.actualValue ? (
                    <p className="text-xs text-rose-300">{createFormErrors.actualValue}</p>
                  ) : null}
                </div>
              </div>
              <div className="grid gap-2">
                <Label className="text-white/70" htmlFor="referralSource">
                  Source / Channel
                </Label>
                <Input
                  id="referralSource"
                  value={createForm.referralSource}
                  onChange={(event) => setCreateForm((prev) => ({ ...prev, referralSource: event.target.value }))}
                  placeholder="LinkedIn, Webinar, Existing client..."
                  className="bg-black/40 text-white placeholder:text-white/40"
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-white/70" htmlFor="notes">
                  Notes
                </Label>
                <Textarea
                  id="notes"
                  value={createForm.notes}
                  onChange={(event) => setCreateForm((prev) => ({ ...prev, notes: event.target.value }))}
                  placeholder="Context, next steps, discovery highlights..."
                  className="min-h-[96px] bg-black/40 text-white placeholder:text-white/40"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="ghost"
                className="text-white/70"
                onClick={() => {
                  resetCreateForm();
                  setCreateTouched({});
                  setIsCreateDialogOpen(false);
                }}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button
                onClick={() => void handleCreateReferral()}
                className="bg-siso-orange text-black"
                disabled={isCreating || !isCreateValid}
              >
                {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save Referral
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
        <table className="min-w-full text-sm text-white/80">
          <thead className="bg-white/5 text-left text-xs uppercase tracking-[0.3em] text-white/40">
            <tr>
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Stage</th>
              <th className="px-4 py-3">Est. Value</th>
              <th className="px-4 py-3">Actual Value</th>
              <th className="px-4 py-3">Commission</th>
              <th className="px-4 py-3">Referred</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedReferrals.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-center text-white/60" colSpan={7}>
                  No referrals logged yet. Add your first referral to get started.
                </td>
              </tr>
            )}
            {sortedReferrals.map((referral) => (
              <tr key={referral.id} className="border-t border-white/5">
                <td className="px-4 py-4 align-top">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-white">{referral.clientName}</p>
                    <p className="text-xs text-white/60">{referral.clientEmail ?? '—'}</p>
                    {referral.referralSource && (
                      <p className="text-xs text-white/50">Source · {referral.referralSource}</p>
                    )}
                  </div>
                </td>
                <td className="px-4 py-4 align-top">
                  <Select
                    value={referral.stage}
                    onValueChange={(value) => void handleStageChange(referral, value as PartnerReferral['stage'])}
                    disabled={updatingReferralId === referral.id}
                  >
                    <SelectTrigger className="h-9 rounded-lg border border-white/15 bg-white/10 text-xs text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border border-white/10 bg-[#0f0f17] text-white">
                      {STAGE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-4 py-4 align-top">{formatCurrency(referral.estimatedValue)}</td>
                <td className="px-4 py-4 align-top">{formatCurrency(referral.actualValue)}</td>
                <td className="px-4 py-4 align-top">
                  <div className="space-y-1 text-xs">
                    <span className="font-semibold text-white">
                      {formatCurrency(referral.commissionAmount)}
                    </span>
                    <div>
                      <Badge className="border-white/10 bg-white/10 text-[10px] uppercase tracking-wide text-white/70">
                        {referral.commissionStatus
                          ? COMMISSION_STATUS_LABELS[referral.commissionStatus]
                          : 'No record'}
                      </Badge>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 align-top text-xs text-white/60">
                  {referral.referredAt ? new Date(referral.referredAt).toLocaleDateString() : '—'}
                </td>
                <td className="px-4 py-4 align-top">
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="border border-white/10 bg-white/5 text-xs text-white hover:bg-white/10"
                      onClick={() => openCommissionDialog(referral)}
                    >
                      <Wallet2 className="mr-2 h-4 w-4" /> Record Commission
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog
        open={commissionDialogState.open}
        onOpenChange={(open) => {
          setCommissionDialogState((prev) => ({ ...prev, open, referral: open ? prev.referral : null }));
          if (!open) {
            setCommissionTouched({});
          }
        }}
      >
        <DialogContent className="max-w-md border border-white/10 bg-[#12121b] text-white">
          <DialogHeader>
            <DialogTitle>Record Commission</DialogTitle>
          </DialogHeader>
          {commissionDialogState.referral ? (
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-base font-semibold text-white">
                  {commissionDialogState.referral.clientName}
                </p>
                <p className="text-xs text-white/60">
                  {commissionDialogState.referral.clientEmail ?? commissionDialogState.referral.partnerId}
                </p>
              </div>
              <div className="grid gap-2">
                <Label className="text-white/70" htmlFor="commissionAmount">
                  Commission Amount (£)
                </Label>
                <Input
                  id="commissionAmount"
                  type="number"
                  value={commissionDialogState.amount}
                  onChange={(event) =>
                    setCommissionDialogState((prev) => ({ ...prev, amount: event.target.value }))
                  }
                  onBlur={() => setCommissionTouched((prev) => ({ ...prev, amount: true }))}
                  className="bg-black/40 text-white placeholder:text-white/40"
                  placeholder="2500"
                />
                {commissionTouched.amount && commissionErrors.amount ? (
                  <p className="text-xs text-rose-300">{commissionErrors.amount}</p>
                ) : null}
              </div>
              <div className="grid gap-2">
                <Label className="text-white/70">Status</Label>
                <Select
                  value={commissionDialogState.status}
                  onValueChange={(value) =>
                    setCommissionDialogState((prev) => ({
                      ...prev,
                      status: value as NonNullable<PartnerReferral['commissionStatus']>,
                    }))
                  }
                >
                  <SelectTrigger className="h-10 rounded-md border border-white/10 bg-black/40 text-sm text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border border-white/10 bg-[#0f0f17] text-white">
                    {COMMISSION_STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label className="text-white/70" htmlFor="paymentMethod">
                  Payment Method
                </Label>
                <Input
                  id="paymentMethod"
                  value={commissionDialogState.paymentMethod}
                  onChange={(event) =>
                    setCommissionDialogState((prev) => ({ ...prev, paymentMethod: event.target.value }))
                  }
                  placeholder="Bank Transfer, PayPal..."
                  className="bg-black/40 text-white placeholder:text-white/40"
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-white/70" htmlFor="transactionId">
                  Transaction / Reference
                </Label>
                <Input
                  id="transactionId"
                  value={commissionDialogState.transactionId}
                  onChange={(event) =>
                    setCommissionDialogState((prev) => ({ ...prev, transactionId: event.target.value }))
                  }
                  placeholder="Optional"
                  className="bg-black/40 text-white placeholder:text-white/40"
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-white/70" htmlFor="paidAt">
                  Paid At (optional)
                </Label>
                <Input
                  id="paidAt"
                  type="datetime-local"
                  value={commissionDialogState.paidAt}
                  onChange={(event) =>
                    setCommissionDialogState((prev) => ({ ...prev, paidAt: event.target.value }))
                  }
                  onBlur={() => setCommissionTouched((prev) => ({ ...prev, paidAt: true }))}
                  className="bg-black/40 text-white placeholder:text-white/40"
                />
                {commissionTouched.paidAt && commissionErrors.paidAt ? (
                  <p className="text-xs text-rose-300">{commissionErrors.paidAt}</p>
                ) : null}
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <Button
              variant="ghost"
              className="text-white/70"
              onClick={() => {
                setCommissionDialogState({
                  open: false,
                  referral: null,
                  amount: '',
                  status: 'pending',
                  paidAt: '',
                  paymentMethod: '',
                  transactionId: '',
                });
                setCommissionTouched({});
              }}
              disabled={isRecordingCommission}
            >
              Cancel
            </Button>
            <Button
              onClick={() => void handleRecordCommission()}
              className="bg-siso-orange text-black"
              disabled={isRecordingCommission || !isCommissionValid}
            >
              {isRecordingCommission ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save Commission
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
