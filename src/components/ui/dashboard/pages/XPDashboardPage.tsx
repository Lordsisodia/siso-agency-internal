/**
 * XP Dashboard Page
 * Comprehensive view of XP progress, achievements, and streaks
 */

import { motion } from 'framer-motion';
import { AdminLayout } from '@/domains/admin/layout/AdminLayout';
import { GamificationDashboard } from '@/domains/admin/dashboard/components/GamificationDashboard';
import { Trophy, Zap } from 'lucide-react';

const XPDashboardPage = () => {
  return (
    <AdminLayout>
      <GamificationDashboard />
    </AdminLayout>
  );
};

export default XPDashboardPage;
