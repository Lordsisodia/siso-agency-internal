import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  getPartnerById,
  getPartnerTasks,
  getPartnerReferrals,
  getPartnerDocuments,
  getPartnerActivity,
  createPartnerTask,
  updatePartnerTask,
  deletePartnerTask,
  createPartnerDocument,
  deletePartnerDocument,
  createPartnerReferral,
  updatePartnerReferral,
  upsertPartnerCommission,
} from '../services/partnerWorkspaceService';
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

export type PartnerWorkspaceTab = 'overview' | 'tasks' | 'referrals' | 'docs' | 'activity';

interface UsePartnerWorkspaceState {
  partner: PartnerSummary | null;
  tasks: PartnerTask[];
  referrals: PartnerReferral[];
  documents: PartnerDocument[];
  activity: PartnerActivityEvent[];
  isLoading: boolean;
  error: Error | null;
  activeTab: PartnerWorkspaceTab;
  setActiveTab: (tab: PartnerWorkspaceTab) => void;
  mutations: {
    refreshAll: () => Promise<void>;
    createTask: (input: CreatePartnerTaskInput) => Promise<void>;
    updateTask: (taskId: string, updates: UpdatePartnerTaskInput) => Promise<void>;
    deleteTask: (taskId: string, taskTitle?: string) => Promise<void>;
    createDocument: (input: CreatePartnerDocumentInput) => Promise<void>;
    deleteDocument: (documentId: string, documentTitle?: string) => Promise<void>;
    createReferral: (input: CreatePartnerReferralInput) => Promise<void>;
    updateReferral: (referralId: string, updates: UpdatePartnerReferralInput) => Promise<void>;
    recordCommission: (input: UpsertPartnerCommissionInput) => Promise<void>;
  };
}

export function usePartnerWorkspace(partnerId: string | null): UsePartnerWorkspaceState {
  const [partner, setPartner] = useState<PartnerSummary | null>(null);
  const [tasks, setTasks] = useState<PartnerTask[]>([]);
  const [referrals, setReferrals] = useState<PartnerReferral[]>([]);
  const [documents, setDocuments] = useState<PartnerDocument[]>([]);
  const [activity, setActivity] = useState<PartnerActivityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [activeTab, setActiveTab] = useState<PartnerWorkspaceTab>('overview');

  const loadAll = useCallback(async () => {
    if (!partnerId) {
      setPartner(null);
      setTasks([]);
      setReferrals([]);
      setDocuments([]);
      setActivity([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const [summary, taskItems, referralItems, documentItems, activityItems] = await Promise.all([
        getPartnerById(partnerId),
        getPartnerTasks(partnerId),
        getPartnerReferrals(partnerId),
        getPartnerDocuments(partnerId),
        getPartnerActivity(partnerId),
      ]);

      setPartner(summary);
      setTasks(taskItems);
      setReferrals(referralItems);
      setDocuments(documentItems);
      setActivity(activityItems);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unable to load partner workspace'));
    } finally {
      setIsLoading(false);
    }
  }, [partnerId]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const sortedActivity = useMemo(
    () => [...activity].sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()),
    [activity],
  );

  const handleCreateTask = useCallback(
    async (input: CreatePartnerTaskInput) => {
      if (!partnerId) return;
      await createPartnerTask(partnerId, input);
      await loadAll();
    },
    [partnerId, loadAll],
  );

  const handleUpdateTask = useCallback(
    async (taskId: string, updates: UpdatePartnerTaskInput) => {
      if (!partnerId) return;
      await updatePartnerTask(partnerId, taskId, updates);
      await loadAll();
    },
    [partnerId, loadAll],
  );

  const handleDeleteTask = useCallback(
    async (taskId: string, taskTitle?: string) => {
      if (!partnerId) return;
      await deletePartnerTask(partnerId, taskId, taskTitle);
      await loadAll();
    },
    [partnerId, loadAll],
  );

  const handleCreateDocument = useCallback(
    async (input: CreatePartnerDocumentInput) => {
      if (!partnerId) return;
      await createPartnerDocument(partnerId, input);
      await loadAll();
    },
    [partnerId, loadAll],
  );

  const handleDeleteDocument = useCallback(
    async (documentId: string, documentTitle?: string) => {
      if (!partnerId) return;
      await deletePartnerDocument(partnerId, documentId, documentTitle);
      await loadAll();
    },
    [partnerId, loadAll],
  );

  const handleCreateReferral = useCallback(
    async (input: CreatePartnerReferralInput) => {
      if (!partnerId) return;
      await createPartnerReferral(partnerId, input);
      await loadAll();
    },
    [partnerId, loadAll],
  );

  const handleUpdateReferral = useCallback(
    async (referralId: string, updates: UpdatePartnerReferralInput) => {
      if (!partnerId) return;
      await updatePartnerReferral(partnerId, referralId, updates);
      await loadAll();
    },
    [partnerId, loadAll],
  );

  const handleRecordCommission = useCallback(
    async (input: UpsertPartnerCommissionInput) => {
      if (!partnerId) return;
      await upsertPartnerCommission(partnerId, input);
      await loadAll();
    },
    [partnerId, loadAll],
  );

  return {
    partner,
    tasks,
    referrals,
    documents,
    activity: sortedActivity,
    isLoading,
    error,
    activeTab,
    setActiveTab,
    mutations: {
      refreshAll: loadAll,
      createTask: handleCreateTask,
      updateTask: handleUpdateTask,
      deleteTask: handleDeleteTask,
      createDocument: handleCreateDocument,
      deleteDocument: handleDeleteDocument,
      createReferral: handleCreateReferral,
      updateReferral: handleUpdateReferral,
      recordCommission: handleRecordCommission,
    },
  };
}
