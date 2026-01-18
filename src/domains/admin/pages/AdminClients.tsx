
import { AdminLayout } from '@/domains/admin/layout/AdminLayout';
import { Users } from 'lucide-react';
import { AdminClientsView } from '@/agency/clients/AdminClientsView';
import { AdminPageTitle } from '@/domains/admin/layout/AdminPageTitle';

export default function AdminClients() {
  // Clients Dashboard: rendered for authenticated Clerk users (guarded at route level)
  return (
    <AdminLayout>
      <div className="min-h-screen pb-12"
        style={{
          background: "linear-gradient(90deg, #000000 0%, #221F26 100%)"
        }}>
        <div className="container mx-auto px-2 py-6">
          <AdminPageTitle
            icon={Users}
            title="Clients Dashboard"
            subtitle="Manage your organization's clients and view details"
          />
          <AdminClientsView isAdmin={true} />
        </div>
      </div>
    </AdminLayout>
  );
}

// Named export used by lazy loader in App.tsx
export const AdminClientsContent = AdminClients;
