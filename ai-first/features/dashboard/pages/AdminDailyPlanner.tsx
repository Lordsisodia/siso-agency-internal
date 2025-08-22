import React from 'react';
import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { DailyPlannerHeader } from '@/components/admin/daily-planner/DailyPlannerHeader';
import { DailyPlannerTabs } from '@/components/admin/daily-planner/DailyPlannerTabs';
import { useAuthSession } from '@/hooks/useAuthSession';
import { useToast } from '@/components/ui/use-toast';
import { AdminPageTitle } from '@/components/admin/layout/AdminPageTitle';
import { CalendarClock } from 'lucide-react';

export default function AdminDailyPlanner() {
  const { user, loading, isAdmin } = useAuthSession();
  const { toast } = useToast();

  React.useEffect(() => {
    if (!loading) {
      console.log('Authentication Status:', {
        isAuthenticated: !!user,
        isAdmin: isAdmin,
        userId: user?.id
      });

      if (!user) {
        toast({
          variant: "destructive",
          title: "Not Authenticated",
          description: "Please log in to access this page."
        });
      }
    }
  }, [user, loading, toast]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null; // AuthGuard should handle redirection
  }

  // Daily Planner: single title bar; green accent
  return (
    <AdminLayout>
      <div className="container mx-auto p-6 space-y-6 bg-gradient-to-br from-green-50 via-white to-teal-100 rounded-xl min-h-screen">
        <AdminPageTitle
          icon={CalendarClock}
          title="Daily Planner"
          subtitle="Plan your team's daily agenda, tasks, and meetings"
        />
        {/* Only keep main header here, don't double up titles */}
        <DailyPlannerHeader />
        <DailyPlannerTabs />
      </div>
    </AdminLayout>
  );
}
