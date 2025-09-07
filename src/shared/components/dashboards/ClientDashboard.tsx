
import React from 'react';
import { Helmet } from 'react-helmet';
import { ClientDashboardContent } from '@/components/client/ClientDashboardContent';
import { ClientDashboardLayout } from '@/components/client/ClientDashboardLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

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
