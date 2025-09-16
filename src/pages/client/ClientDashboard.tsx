
import React from 'react';
import { Helmet } from 'react-helmet';
import { ClientDashboardContent } from '@/features/client/client/ClientDashboardContent';
import { ClientDashboardLayout } from '@/features/client/client/ClientDashboardLayout';
import { ProtectedRoute } from '@/shared/auth-supabase-backup/components/ProtectedRoute';

/**
 * Client dashboard page accessible to all users but showing client content
 * only to users linked to a client account
 */
export default function ClientDashboard() {
  return (
    <ProtectedRoute>
      <Helmet>
        <title>Client Dashboard | SISO Agency</title>
      </Helmet>
      <ClientDashboardLayout>
        <ClientDashboardContent />
      </ClientDashboardLayout>
    </ProtectedRoute>
  );
}
