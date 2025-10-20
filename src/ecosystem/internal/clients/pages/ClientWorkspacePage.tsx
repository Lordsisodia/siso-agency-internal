import { ClientWorkspaceLayout } from '../layout/ClientWorkspaceLayout';
import { useClientWorkspace } from '../hooks/useClientWorkspace';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { ClientsOverviewTab } from '../components/overview/ClientsOverviewTab';
import { ClientsTasksTab } from '../components/tasks/ClientsTasksTab';
import { ClientsTimelineTab } from '../components/timeline/ClientsTimelineTab';
import { ClientsDocsTab } from '../components/docs/ClientsDocsTab';
import { Loader2, LayoutDashboard, CheckSquare, Clock, FileText } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { DailyBottomNav } from '@/ecosystem/internal/lifelock/views/daily/_shared/components';

interface ClientWorkspacePageProps {
  clientId: string | null;
}

const TAB_OPTIONS = [
  { value: 'overview', label: 'Overview' },
  { value: 'tasks', label: 'Tasks' },
  { value: 'timeline', label: 'Timeline' },
  { value: 'docs', label: 'Docs' },
] as const;

const TAB_ICON_MAP: Record<(typeof TAB_OPTIONS)[number]['value'], LucideIcon> = {
  overview: LayoutDashboard,
  tasks: CheckSquare,
  timeline: Clock,
  docs: FileText,
};

export function ClientWorkspacePage({ clientId }: ClientWorkspacePageProps) {
  const {
    client,
    tasks,
    timeline,
    documents,
    isLoading,
    isUpdating,
    error,
    mutations,
  } = useClientWorkspace(clientId);

  const [activeTab, setActiveTab] = useState<(typeof TAB_OPTIONS)[number]['value']>('overview');

  const tabItems = useMemo(() => TAB_OPTIONS, []);
  const bottomNavTabs = useMemo(
    () =>
      TAB_OPTIONS.map((tab) => ({
        value: tab.value,
        title: tab.label,
        icon: TAB_ICON_MAP[tab.value],
      })),
    [],
  );
  const activeBottomNavIndex = bottomNavTabs.findIndex((tab) => tab.value === activeTab);
  const safeActiveBottomNavIndex = activeBottomNavIndex === -1 ? 0 : activeBottomNavIndex;

  if (error) {
    return (
      <ClientWorkspaceLayout>
        <div className="flex flex-col items-center justify-center py-20 text-center text-sm text-red-300">
          <p className="font-medium">We couldn’t load this client.</p>
          <p className="text-white/60 mt-2">{error.message}</p>
        </div>
      </ClientWorkspaceLayout>
    );
  }

  if (isLoading || !client) {
    return (
      <ClientWorkspaceLayout>
        <div className="flex flex-col items-center justify-center py-24 text-white/70">
          <Loader2 className="w-8 h-8 animate-spin text-siso-orange mb-4" />
          <p>Loading client workspace…</p>
        </div>
      </ClientWorkspaceLayout>
    );
  }

  return (
    <ClientWorkspaceLayout
      client={client}
      tasks={tasks}
      isUpdating={isUpdating}
      onRefresh={() => mutations.refreshAll()}
    >
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
        <div className="mb-6 md:flex md:items-center md:justify-between">
          <TabsList className="hidden md:inline-flex bg-black/30 border border-white/10 rounded-xl backdrop-blur">
            {tabItems.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-inner data-[state=active]:border data-[state=active]:border-white/20 px-6 py-3 text-sm font-medium uppercase tracking-wide text-white/70"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="overview">
          <ClientsOverviewTab client={client} onUpdate={mutations.updateClient} />
        </TabsContent>

        <TabsContent value="tasks">
          <ClientsTasksTab client={client} />
        </TabsContent>

        <TabsContent value="timeline">
          <ClientsTimelineTab
            client={client}
            events={timeline}
            onCreateEvent={mutations.createEvent}
            onUpdateEvent={mutations.updateEvent}
            onDeleteEvent={mutations.deleteEvent}
          />
        </TabsContent>

        <TabsContent value="docs">
          <ClientsDocsTab
            client={client}
            documents={documents}
            onCreateDocument={mutations.createDocument}
            onUpdateDocument={mutations.updateDocument}
            onDeleteDocument={mutations.deleteDocument}
          />
        </TabsContent>
      </Tabs>
      <div className="md:hidden">
        <DailyBottomNav
          tabs={bottomNavTabs.map(({ title, icon }) => ({ title, icon }))}
          activeIndex={safeActiveBottomNavIndex}
          onChange={(index) => {
            if (index !== null) {
              setActiveTab(bottomNavTabs[index].value);
            }
          }}
        />
      </div>
    </ClientWorkspaceLayout>
  );
}
