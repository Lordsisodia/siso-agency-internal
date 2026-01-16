/**
 * XP Dashboard Page
 * Comprehensive view of XP progress, achievements, and streaks
 */

import { motion } from 'framer-motion';
import { AdminLayout } from '@/domains/admin/layout/AdminLayout';
import { GamificationDashboard } from '@/types/GamificationDashboard';
import { Trophy, Zap } from 'lucide-react';

const XPDashboardPage = () => {
  return (
    <AdminLayout>
      <div className="min-h-screen bg-siso-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-siso-text-bold md:text-4xl">XP Dashboard</h1>
                <p className="text-siso-text-muted">
                  Track your progress, achievements, and streaks
                </p>
              </div>
            </div>
          </motion.div>

          <GamificationDashboard />
        </div>
      </div>
    </AdminLayout>
  );
};

export default XPDashboardPage;
