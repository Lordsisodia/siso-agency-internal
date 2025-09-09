
import { SetupChecklist } from '@/components/home/SetupChecklist';
import { DashboardStats } from './DashboardStats';
import { QuickActions } from './QuickActions';
import { DashboardCard } from './DashboardCard';
import { ClientsOverviewCard } from './cards/ClientsOverviewCard';
import { RevenueCard } from './cards/RevenueCard';
import { CalendarCard } from './cards/CalendarCard';
import { RecentActivityCard } from './cards/RecentActivityCard';
import { ProjectsOverviewCard } from './cards/ProjectsOverviewCard';
import { PriorityTasksCard } from './cards/PriorityTasksCard';
import { 
  Calendar,
  MessageSquare,
  LineChart,
  Layout, 
  Folder, 
  Users, 
  CreditCard, 
  Bot, 
  BookOpen,
  ArrowDownIcon, 
  ArrowUpIcon 
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '../ui/button';
import { motion } from 'framer-motion';

export function MasonryDashboard() {
  const [expandedStats, setExpandedStats] = useState(true);
  const [expandedTools, setExpandedTools] = useState(true);

  return (
    <div className="space-y-6">
      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4">
        <motion.div 
          className="lg:col-span-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <ClientsOverviewCard />
        </motion.div>
        
        <motion.div 
          className="lg:col-span-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <ProjectsOverviewCard />
        </motion.div>
        
        <motion.div 
          className="lg:col-span-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <RevenueCard />
        </motion.div>
        
        <motion.div 
          className="lg:col-span-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <QuickActions />
        </motion.div>
      </div>

      {/* Setup Checklist - Important for new users */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.5 }}
        className="bg-black/20 border border-siso-text/10 rounded-xl p-5 hover:border-siso-orange/30 transition-all duration-300"
      >
        <SetupChecklist />
      </motion.div>
      
      {/* Main Content Area - Calendar and Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8 space-y-4">
          <CalendarCard />
          <PriorityTasksCard />
        </div>
        
        {/* Stats Dashboard */}
        <div className="lg:col-span-4">
          <div className="bg-black/30 border border-siso-text/10 rounded-xl overflow-hidden transition-all duration-300">
            <div 
              className="p-4 flex justify-between items-center cursor-pointer hover:bg-black/40" 
              onClick={() => setExpandedStats(!expandedStats)}
            >
              <h3 className="text-lg font-semibold text-white">Performance Stats</h3>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                {expandedStats ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />}
              </Button>
            </div>
            
            {expandedStats && (
              <div className="p-4 pt-0">
                <DashboardStats />
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Recent Activity */}
      <RecentActivityCard />

      {/* Tools Section */}
      <div>
        <div 
          className="flex justify-between items-center mb-4 cursor-pointer" 
          onClick={() => setExpandedTools(!expandedTools)}
        >
          <h2 className="text-xl font-semibold text-white">Agency Tools</h2>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            {expandedTools ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />}
          </Button>
        </div>

        {expandedTools && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <DashboardCard
              title="Plan Builder" 
              description="Create app plans and cost estimates for your clients."
              icon={Layout}
              href="/admin/plans"
              delay={1}
            />
            <DashboardCard
              title="My Projects" 
              description="Manage your ongoing projects and track progress."
              icon={Folder}
              href="/my-projects"
              delay={1.2}
            />
            <DashboardCard
              title="Client Portal" 
              description="View and showcase your completed projects."
              icon={Users}
              href="/portfolio"
              delay={1.4}
            />
            <DashboardCard
              title="Payments" 
              description="Manage payments and transactions for your projects."
              icon={CreditCard}
              href="/payments"
              delay={1.6}
            />
            <DashboardCard
              title="AI Assistants" 
              description="Get help from AI to streamline your workflow."
              icon={Bot}
              href="/assistants"
              delay={1.8}
            />
            <DashboardCard
              title="Education" 
              description="Learn best practices for app development and client management."
              icon={BookOpen}
              href="/education"
              delay={2}
            />
          </div>
        )}
      </div>
    </div>
  );
}
