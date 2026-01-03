
import React from 'react';
import { Helmet } from 'react-helmet';
import { ClientDashboardContent } from '@/domains/client/components/ClientDashboardContent';
import { ClientDashboardLayout } from '@/domains/client/components/ClientDashboardLayout';
import { ProtectedRoute } from '@/domains/auth/ProtectedRoute';

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
