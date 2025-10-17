import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Home, CheckSquare, Calendar, FileText } from 'lucide-react';
import { AdminLayout } from '@/ecosystem/internal/admin/layout/AdminLayout';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { useClient } from '@/shared/hooks/client';
import { OverviewTab } from '@/ecosystem/internal/admin/clients/tabs/OverviewTab';
import { TasksTab } from '@/ecosystem/internal/admin/clients/tabs/TasksTab';

const tabs = [
  { id: 'overview', label: 'Overview', icon: Home },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'timeline', label: 'Timeline', icon: Calendar },
  { id: 'docs', label: 'Docs', icon: FileText },
] as const;

type TabId = (typeof tabs)[number]['id'];

export default function ClientDetailPage() {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const { client, isLoading } = useClient(clientId);

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex min-h-screen items-center justify-center bg-black">
          <p className="text-sm text-gray-400">Loading client…</p>
        </div>
      </AdminLayout>
    );
  }

  if (!client || !clientId) {
    return (
      <AdminLayout>
        <div className="flex min-h-screen items-center justify-center bg-black">
          <div className="rounded-xl border border-gray-800 bg-gray-950/80 p-6 text-center text-gray-300">
            Client not found.
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-black pb-24">
        <div className="mx-auto max-w-4xl px-4 py-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              className="text-gray-300 hover:text-white"
              onClick={() => navigate('/admin/clients')}
            >
              ← Back
            </Button>
            <div>
              <h1 className="text-2xl font-semibold text-white">
                {client.business_name || client.full_name || 'Untitled Client'}
              </h1>
              <Badge variant="outline" className="mt-1 capitalize text-xs">
                {client.status || 'Unknown'}
              </Badge>
            </div>
          </div>

          <div className="mt-6 hidden border-b border-gray-800 sm:block">
            <nav className="flex gap-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-1 pb-3 text-sm transition ${
                    activeTab === tab.id
                      ? 'text-white'
                      : 'text-gray-500 hover:text-gray-200'
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-blue-500" />
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="mt-6 space-y-6">
            {activeTab === 'overview' && <OverviewTab client={client} />}
            {activeTab === 'tasks' && <TasksTab clientId={clientId} />}
            {activeTab === 'timeline' && (
              <div className="rounded-2xl border border-gray-800 bg-gray-950/80 p-6 text-sm text-gray-400">
                Timeline is coming in Phase 2.
              </div>
            )}
            {activeTab === 'docs' && (
              <div className="rounded-2xl border border-gray-800 bg-gray-950/80 p-6 text-sm text-gray-400">
                Docs are coming in Phase 2.
              </div>
            )}
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 border-t border-gray-800 bg-gray-950/90 sm:hidden">
          <div className="flex items-center justify-around py-3">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center gap-1 text-xs ${
                    isActive ? 'text-blue-400' : 'text-gray-400'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
