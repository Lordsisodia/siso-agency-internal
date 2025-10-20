import { supabase } from '@/integrations/supabase/client';
import type {
  PartnerActivityEvent,
  PartnerDocument,
  PartnerReferral,
  PartnerSummary,
  PartnerTask,
  CreatePartnerTaskInput,
  UpdatePartnerTaskInput,
  CreatePartnerDocumentInput,
  CreatePartnerReferralInput,
  UpdatePartnerReferralInput,
  UpsertPartnerCommissionInput,
} from '../types/partner.types';

const STATUS_FALLBACK: PartnerSummary['status'] = 'pending';
const TIER_FALLBACK: PartnerSummary['tier'] = 'starter';
const TASK_STATUSES: PartnerTask['status'][] = ['todo', 'in_progress', 'blocked', 'done'];
const TASK_PRIORITIES: PartnerTask['priority'][] = ['low', 'medium', 'high'];
const REFERRAL_STATUSES: PartnerReferral['stage'][] = [
  'new',
  'contacted',
  'qualified',
  'proposal',
  'won',
  'lost',
];
const COMMISSION_STATUSES: NonNullable<PartnerReferral['commissionStatus']>[] = [
  'pending',
  'approved',
  'paid',
];

const omitUndefined = <T extends Record<string, unknown>>(record: T): T =>
  Object.fromEntries(
    Object.entries(record).filter(([, value]) => typeof value !== 'undefined'),
  ) as T;

const isReferralCommissionStatus = (
  value: string,
): value is NonNullable<PartnerReferral['commissionStatus']> =>
  COMMISSION_STATUSES.includes(value as NonNullable<PartnerReferral['commissionStatus']>);

const mapTask = (task: any): PartnerTask => ({
  id: task.id,
  partnerId: task.partner_id,
  title: task.title,
  status: TASK_STATUSES.includes(task.status) ? task.status : 'todo',
  priority: TASK_PRIORITIES.includes(task.priority) ? task.priority : 'medium',
  dueDate: task.due_date ?? undefined,
  assigneeName: task.user_id ?? undefined,
});

const mapDocument = (document: any, fallbackPartnerId: string): PartnerDocument => ({
  id: document.id,
  partnerId: document.partner_id ?? fallbackPartnerId,
  title: document.title ?? document.resource_name,
  documentType: (document.document_type ?? document.resource_type ?? 'link') as PartnerDocument['documentType'],
  url: document.url ?? document.resource_url ?? document.storage_path ?? '#',
  updatedAt: document.updated_at ?? document.created_at ?? undefined,
});

const mapReferral = (referral: any): PartnerReferral => ({
  id: referral.id,
  partnerId: referral.partner_id,
  clientName: referral.client_name ?? referral.client_email ?? 'Referral',
  clientEmail: referral.client_email ?? undefined,
  stage: REFERRAL_STATUSES.includes(referral.status) ? referral.status : 'new',
  estimatedValue: referral.estimated_value ?? undefined,
  actualValue: referral.actual_value ?? undefined,
  referredAt: referral.referred_at ?? undefined,
  referralSource: referral.referral_source ?? undefined,
  commissionAmount: referral.commission_amount ?? undefined,
  commissionStatus: COMMISSION_STATUSES.includes(referral.commission_status)
    ? referral.commission_status
    : undefined,
});

const mapActivity = (event: any): PartnerActivityEvent => ({
  id: event.id,
  partnerId: event.partner_id,
  eventType: event.event_type as PartnerActivityEvent['eventType'],
  occurredAt: event.occurred_at,
  summary: event.summary,
  actor: event.actor_id ?? undefined,
});

export async function logPartnerActivity(
  partnerId: string,
  eventType: PartnerActivityEvent['eventType'],
  summary: string,
  payload?: Record<string, unknown>,
) {
  const { data: userData } = await supabase.auth.getUser();
  await supabase.from('partner_activity_log').insert({
    partner_id: partnerId,
    event_type: eventType,
    summary,
    payload: payload ?? {},
    actor_id: userData?.user?.id ?? null,
  });
}

export async function getPartnerById(partnerId: string): Promise<PartnerSummary> {
  const { data: partner, error } = await supabase
    .from('partners')
    .select('*')
    .eq('id', partnerId)
    .maybeSingle();

  if (error) throw error;
  if (!partner) throw new Error('Partner not found');

  const [{ data: referrals }, { data: commissions }] = await Promise.all([
    supabase
      .from('partner_referrals')
      .select('status, actual_value')
      .eq('partner_id', partnerId),
    supabase
      .from('partner_commissions')
      .select('status, commission_amount')
      .eq('partner_id', partnerId),
  ]);

  const { data: ownerProfile } =
    partner?.user_id
      ? await supabase
          .from('profiles')
          .select('full_name, email, business_name')
          .eq('id', partner.user_id)
          .maybeSingle()
      : { data: null };

  const totalReferrals = referrals?.length ?? 0;
  const wonReferrals =
    referrals?.filter((item) => item.status === 'won' || item.status === 'closed_won').length ?? 0;
  const totalRevenue = referrals?.reduce((sum, item) => sum + (item.actual_value ?? 0), 0) ?? 0;
  const commissionOwed =
    commissions?.reduce((sum, item) => {
      const amount = item.commission_amount ?? 0;
      if (item.status === 'pending' || item.status === 'approved') {
        return sum + amount;
      }
      return sum;
    }, 0) ?? 0;
  const commissionPaid =
    commissions?.reduce(
      (sum, item) => sum + (item.status === 'paid' ? item.commission_amount ?? 0 : 0),
      0,
    ) ?? 0;
  const conversionRate = totalReferrals > 0 ? Math.round((wonReferrals / totalReferrals) * 100) : 0;

  return {
    id: partner.id,
    name: partner.full_name ?? partner.email,
    companyName: partner.company_name ?? 'Unknown company',
    status: (partner.status ?? STATUS_FALLBACK) as PartnerSummary['status'],
    tier: (partner.tier ?? TIER_FALLBACK) as PartnerSummary['tier'],
    ownerName: ownerProfile?.full_name ?? partner.user_id ?? undefined,
    ownerEmail: ownerProfile?.email ?? partner.email ?? undefined,
    totalReferrals,
    totalRevenue,
    commissionOwed,
    commissionPaid,
    wonReferrals,
    conversionRate,
    lastActiveAt: partner.last_login ?? partner.updated_at ?? partner.joined_at ?? undefined,
  };
}

export async function getPartnerTasks(partnerId: string): Promise<PartnerTask[]> {
  const { data, error } = await supabase
    .from('partner_tasks')
    .select('*')
    .eq('partner_id', partnerId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapTask);
}

export async function createPartnerTask(
  partnerId: string,
  input: CreatePartnerTaskInput,
): Promise<PartnerTask> {
  const { data: userData } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('partner_tasks')
    .insert({
      partner_id: partnerId,
      title: input.title,
      priority: input.priority,
      due_date: input.dueDate ?? null,
      description: input.description ?? null,
      status: 'todo',
      user_id: userData?.user?.id ?? null,
    })
    .select('*')
    .maybeSingle();

  if (error || !data) throw error ?? new Error('Unable to create task');

  await logPartnerActivity(partnerId, 'task', `Created task “${input.title}”`, {
    priority: input.priority,
  });

  return mapTask(data);
}

export async function updatePartnerTask(
  partnerId: string,
  taskId: string,
  updates: UpdatePartnerTaskInput,
): Promise<PartnerTask> {
  const { data, error } = await supabase
    .from('partner_tasks')
    .update({
      status: updates.status,
      priority: updates.priority,
      due_date: typeof updates.dueDate === 'undefined' ? undefined : updates.dueDate,
      description: updates.description,
    })
    .eq('id', taskId)
    .select('*')
    .maybeSingle();

  if (error || !data) throw error ?? new Error('Unable to update task');

  if (updates.status) {
    await logPartnerActivity(partnerId, 'task', `Marked task “${data.title}” as ${updates.status}`);
  } else if (updates.priority) {
    await logPartnerActivity(partnerId, 'task', `Updated priority for “${data.title}” to ${updates.priority}`);
  }

  return mapTask(data);
}

export async function deletePartnerTask(partnerId: string, taskId: string, taskTitle?: string): Promise<void> {
  const { error } = await supabase.from('partner_tasks').delete().eq('id', taskId);
  if (error) throw error;
  await logPartnerActivity(partnerId, 'task', `Deleted task “${taskTitle ?? ''}”`.trim());
}

export async function getPartnerReferrals(partnerId: string): Promise<PartnerReferral[]> {
  const { data, error } = await supabase
    .from('partner_referrals')
    .select('*')
    .eq('partner_id', partnerId)
    .order('referred_at', { ascending: false });

  if (error) throw error;

  return (data ?? []).map(mapReferral);
}

export async function createPartnerReferral(
  partnerId: string,
  input: CreatePartnerReferralInput,
): Promise<PartnerReferral> {
  const status = input.stage && REFERRAL_STATUSES.includes(input.stage) ? input.stage : 'new';
  const commissionStatus =
    input.commissionStatus && isReferralCommissionStatus(input.commissionStatus)
      ? input.commissionStatus
      : 'pending';

  const referralPayload = omitUndefined({
    partner_id: partnerId,
    client_email: input.clientEmail,
    client_name: input.clientName,
    company_name: input.companyName ?? null,
    client_phone: input.clientPhone ?? null,
    status,
    referral_source: input.referralSource ?? 'direct',
    estimated_value: typeof input.estimatedValue === 'number' ? input.estimatedValue : null,
    actual_value: typeof input.actualValue === 'number' ? input.actualValue : null,
    commission_amount: typeof input.commissionAmount === 'number' ? input.commissionAmount : null,
    commission_status: commissionStatus,
    notes: input.notes ?? null,
    referred_at: input.referredAt,
  });

  const { data, error } = await supabase
    .from('partner_referrals')
    .insert(referralPayload)
    .select('*')
    .maybeSingle();

  if (error || !data) {
    throw error ?? new Error('Unable to create referral');
  }

  const mapped = mapReferral(data);

  await logPartnerActivity(partnerId, 'referral', `Logged referral “${mapped.clientName}”`, {
    stage: mapped.stage,
    estimatedValue: mapped.estimatedValue,
    commissionStatus: mapped.commissionStatus,
  });

  return mapped;
}

export async function updatePartnerReferral(
  partnerId: string,
  referralId: string,
  updates: UpdatePartnerReferralInput,
): Promise<PartnerReferral> {
  const referralUpdate = omitUndefined({
    client_name: updates.clientName,
    client_email: updates.clientEmail,
    company_name: updates.companyName,
    client_phone: updates.clientPhone,
    status: updates.stage && REFERRAL_STATUSES.includes(updates.stage) ? updates.stage : undefined,
    referral_source: updates.referralSource,
    estimated_value: typeof updates.estimatedValue === 'number' ? updates.estimatedValue : undefined,
    actual_value: typeof updates.actualValue === 'number' ? updates.actualValue : undefined,
    notes: updates.notes,
    referred_at: updates.referredAt,
    converted_at: updates.convertedAt,
    commission_amount:
      typeof updates.commissionAmount === 'number' ? updates.commissionAmount : undefined,
    commission_status:
      updates.commissionStatus && isReferralCommissionStatus(updates.commissionStatus)
        ? updates.commissionStatus
        : undefined,
  });

  const { data, error } = await supabase
    .from('partner_referrals')
    .update(referralUpdate)
    .eq('id', referralId)
    .eq('partner_id', partnerId)
    .select('*')
    .maybeSingle();

  if (error || !data) {
    throw error ?? new Error('Unable to update referral');
  }

  const mapped = mapReferral(data);
  const summaryParts = [`Updated referral “${mapped.clientName}”`];
  if (updates.stage) {
    summaryParts.push(`Stage → ${mapped.stage}`);
  }
  if (typeof updates.actualValue === 'number') {
    summaryParts.push(`Actual £${mapped.actualValue?.toLocaleString() ?? 0}`);
  }
  if (updates.commissionStatus) {
    summaryParts.push(`Commission → ${mapped.commissionStatus}`);
  }

  await logPartnerActivity(partnerId, 'referral', summaryParts.join(' · '), {
    stage: mapped.stage,
    actualValue: mapped.actualValue,
    commissionStatus: mapped.commissionStatus,
  });

  return mapped;
}

export async function upsertPartnerCommission(
  partnerId: string,
  input: UpsertPartnerCommissionInput,
): Promise<PartnerReferral> {
  const commissionStatus = input.status ?? 'pending';
  const commissionPayload: Record<string, unknown> = omitUndefined({
    partner_id: partnerId,
    referral_id: input.referralId,
    commission_type: input.commissionType ?? 'referral',
    base_amount: typeof input.baseAmount === 'number' ? input.baseAmount : undefined,
    commission_rate: typeof input.commissionRate === 'number' ? input.commissionRate : undefined,
    commission_amount: input.commissionAmount,
    status: commissionStatus,
    payment_method: input.paymentMethod,
    transaction_id: input.transactionId,
  });

  if (Object.prototype.hasOwnProperty.call(input, 'paidAt')) {
    commissionPayload.paid_at = input.paidAt ?? null;
  }

  const { error: commissionError } = await supabase
    .from('partner_commissions')
    .upsert(commissionPayload, { onConflict: 'referral_id' });

  if (commissionError) {
    throw commissionError;
  }

  const referralUpdate: Record<string, unknown> = {};

  if (typeof input.commissionAmount === 'number') {
    referralUpdate.commission_amount = input.commissionAmount;
  }

  if (commissionStatus && isReferralCommissionStatus(commissionStatus)) {
    referralUpdate.commission_status = commissionStatus;
  }

  if (Object.prototype.hasOwnProperty.call(input, 'paidAt')) {
    referralUpdate.paid_at = input.paidAt ?? null;
  }

  let updatedReferralRow: any | null = null;

  if (Object.keys(referralUpdate).length > 0) {
    const { data, error } = await supabase
      .from('partner_referrals')
      .update(referralUpdate)
      .eq('id', input.referralId)
      .eq('partner_id', partnerId)
      .select('*')
      .maybeSingle();

    if (error) {
      throw error;
    }
    updatedReferralRow = data;
  }

  if (!updatedReferralRow) {
    const { data, error } = await supabase
      .from('partner_referrals')
      .select('*')
      .eq('id', input.referralId)
      .maybeSingle();

    if (error) {
      throw error;
    }
    updatedReferralRow = data;
  }

  const mapped = mapReferral(updatedReferralRow);
  const statusLabel = (commissionStatus ?? 'pending').replace('_', ' ');

  await logPartnerActivity(
    partnerId,
    'commission',
    `Commission ${statusLabel} · ${mapped.clientName}`,
    {
      commissionAmount: mapped.commissionAmount ?? input.commissionAmount,
      status: commissionStatus,
      paidAt: input.paidAt ?? undefined,
    },
  );

  return mapped;
}

export async function getPartnerDocuments(partnerId: string): Promise<PartnerDocument[]> {
  const [{ data: documents }, { data: resources }] = await Promise.all([
    supabase
      .from('partner_documents')
      .select('*')
      .eq('partner_id', partnerId)
      .order('updated_at', { ascending: false }),
    supabase
      .from('partner_resources')
      .select('*')
      .eq('partner_id', partnerId)
      .order('updated_at', { ascending: false }),
  ]);

  const mappedDocs = (documents ?? []).map((doc) => mapDocument(doc, partnerId));
  const mappedResources = (resources ?? []).map((resource) => mapDocument(resource, partnerId));

  return [...mappedDocs, ...mappedResources].sort((a, b) => {
    const aTime = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
    const bTime = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
    return bTime - aTime;
  });
}

export async function createPartnerDocument(
  partnerId: string,
  input: CreatePartnerDocumentInput,
): Promise<PartnerDocument> {
  const { data, error } = await supabase
    .from('partner_documents')
    .insert({
      partner_id: partnerId,
      title: input.title,
      url: input.url,
      document_type: input.documentType,
    })
    .select('*')
    .maybeSingle();

  if (error || !data) throw error ?? new Error('Unable to create document');

  await logPartnerActivity(partnerId, 'document', `Added document “${input.title}”`, {
    documentType: input.documentType,
  });

  return mapDocument(data, partnerId);
}

export async function deletePartnerDocument(partnerId: string, documentId: string, documentTitle?: string) {
  const { error } = await supabase.from('partner_documents').delete().eq('id', documentId);
  if (error) throw error;
  await logPartnerActivity(partnerId, 'document', `Removed document “${documentTitle ?? ''}”`.trim());
}

export async function getPartnerActivity(partnerId: string): Promise<PartnerActivityEvent[]> {
  const { data, error } = await supabase
    .from('partner_activity_log')
    .select('*')
    .eq('partner_id', partnerId)
    .order('occurred_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapActivity);
}
