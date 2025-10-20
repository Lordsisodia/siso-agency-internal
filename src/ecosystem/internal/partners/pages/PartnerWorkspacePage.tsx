import { useMemo } from 'react';
import { useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { DailyBottomNav } from '@/ecosystem/internal/lifelock/views/daily/_shared/components';
import { Loader2 } from 'lucide-react';
import { PartnerWorkspaceLayout } from '../layout/PartnerWorkspaceLayout';
import { usePartnerWorkspace, type PartnerWorkspaceTab } from '../hooks/usePartnerWorkspace';
import { PartnerOverviewTab } from '../components/overview/PartnerOverviewTab';
import { PartnerTasksTab } from '../components/tasks/PartnerTasksTab';
import { PartnerReferralsTab } from '../components/referrals/PartnerReferralsTab';
import { PartnerDocsTab } from '../components/docs/PartnerDocsTab';
import { PartnerActivityTab } from '../components/activity/PartnerActivityTab';
import { PARTNER_TAB_OPTIONS } from '../constants/partnerTabs';

interface PartnerWorkspacePageProps {
  partnerId: string | null;
}

export function PartnerWorkspacePage({ partnerId }: PartnerWorkspacePageProps) {
  const {
    partner,
    tasks,
    referrals,
    documents,
    activity,
    isLoading,
    error,
    activeTab,
    setActiveTab,
    mutations,
  } = usePartnerWorkspace(partnerId);

  const bottomNavTabs = useMemo(
    () => PARTNER_TAB_OPTIONS.map((tab) => ({ title: tab.label, icon: tab.icon })),
    [],
  );
  const activeBottomNavIndex = PARTNER_TAB_OPTIONS.findIndex((tab) => tab.value === activeTab);
  const safeBottomNavIndex = activeBottomNavIndex === -1 ? 0 : activeBottomNavIndex;

  if (error) {
    return (
      <PartnerWorkspaceLayout>
        <div className="flex flex-col items-center justify-center py-20 text-center text-sm text-red-300">
          <p className="font-medium">We couldn’t load this partner.</p>
          <p className="mt-2 text-white/60">{error.message}</p>
        </div>
      </PartnerWorkspaceLayout>
    );
  }

  if (isLoading || !partner) {
    return (
      <PartnerWorkspaceLayout>
        <div className="flex flex-col items-center justify-center py-24 text-white/70">
          <Loader2 className="mb-4 h-8 w-8 animate-spin text-siso-orange" />
          <p>Loading partner workspace…</p>
        </div>
      </PartnerWorkspaceLayout>
    );
  }

  return (
    <PartnerWorkspaceLayout partner={partner} isUpdating={isLoading} onRefresh={() => mutations.refreshAll()}>
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as PartnerWorkspaceTab)}>
        <div className="mb-6 md:flex md:items-center md:justify-between">
          <TabsList className="hidden md:inline-flex rounded-xl border border-white/10 bg-black/30 backdrop-blur">
            {PARTNER_TAB_OPTIONS.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="px-6 py-3 text-sm font-medium uppercase tracking-wide text-white/70 data-[state=active]:border data-[state=active]:border-white/20 data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-inner"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="overview">
          <PartnerOverviewTab partner={partner} />
        </TabsContent>

        <TabsContent value="tasks">
          <PartnerTasksTab
            tasks={tasks}
            onCreateTask={mutations.createTask}
            onUpdateTask={mutations.updateTask}
            onDeleteTask={mutations.deleteTask}
          />
        </TabsContent>

        <TabsContent value="referrals">
          <PartnerReferralsTab
            referrals={referrals}
            onCreateReferral={mutations.createReferral}
            onUpdateReferral={mutations.updateReferral}
            onRecordCommission={mutations.recordCommission}
          />
        </TabsContent>

        <TabsContent value="docs">
          <PartnerDocsTab
            documents={documents}
            onAddDocument={mutations.createDocument}
            onDeleteDocument={mutations.deleteDocument}
          />
        </TabsContent>

        <TabsContent value="activity">
          <PartnerActivityTab activity={activity} />
        </TabsContent>
      </Tabs>

      <div className="md:hidden">
        <DailyBottomNav
          tabs={bottomNavTabs}
          activeIndex={safeBottomNavIndex}
          onChange={(index) => {
            if (index !== null) {
              setActiveTab(PARTNER_TAB_OPTIONS[index].value as PartnerWorkspaceTab);
            }
          }}
        />
      </div>
    </PartnerWorkspaceLayout>
  );
}
