import React from 'react';
import { Helmet } from 'react-helmet';
import { DashboardLayout } from '@/components/dashboard/layout/DashboardLayout';
import { AppPlanGenerator } from '@/components/app-plan/AppPlanGenerator';
import { motion } from 'framer-motion';

export default function AppPlanGeneratorPage() {

  return (
    <DashboardLayout>
      <Helmet>
        <title>AI App Plan Generator | SISO Agency</title>
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              AI App Plan Generator
            </h1>
            <p className="text-gray-400 text-lg">
              Transform your business requirements into a comprehensive app development plan using AI analysis.
            </p>
          </div>
          
          <AppPlanGenerator />
        </motion.div>
      </div>
    </DashboardLayout>
  );
} 