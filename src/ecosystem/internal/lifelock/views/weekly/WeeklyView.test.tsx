/**
 * TEMP: Minimal WeeklyView to test routing
 * Replace this file once we confirm the route works
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/ui/button';
import { ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';

export const WeeklyView: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-gray-950 p-8">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/admin/lifelock/daily/${format(new Date(), 'yyyy-MM-dd')}`)}
          className="text-gray-400 hover:text-blue-400 mb-8"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Daily View
        </Button>

        <h1 className="text-4xl font-bold text-blue-400 mb-4">
          Weekly View - Coming Soon
        </h1>

        <p className="text-gray-400 text-lg">
          The weekly view is under construction. Check back soon!
        </p>

        <div className="mt-8 p-6 bg-gray-900/60 rounded-lg border border-blue-500/20">
          <h2 className="text-2xl font-semibold text-white mb-4">What's Coming:</h2>
          <ul className="space-y-2 text-gray-300">
            <li>📊 Weekly Overview</li>
            <li>💼 Productivity Analytics</li>
            <li>💪 Wellness Tracking</li>
            <li>⏱️ Time Analysis</li>
            <li>✅ Weekly Checkout</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
