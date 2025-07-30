
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { TaskList } from './TaskList';
import { Chip } from '@/components/ui/chip';
import { TaskCategory } from '@/hooks/useTasks';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSearchParams } from 'react-router-dom';
import { TaskAnalytics } from './TaskAnalytics';
import { motion } from 'framer-motion';

const categories: TaskCategory[] = [
  'siso_app_dev',
  'onboarding_app',
  'instagram',
  'main',
  'weekly',
  'daily'
];

const formatCategoryName = (category: string) => {
  return category
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

interface TaskBankProps {
  userId?: string;
  showAllTasks?: boolean;
}

export function TaskBank({ userId, showAllTasks = true }: TaskBankProps) {
  const [activeView, setActiveView] = useState<'byCategory' | 'analytics'>('byCategory');
  const [searchParams] = useSearchParams();
  const teamMember = searchParams.get('member');
  
  const displayName = teamMember === 'siso' ? 'SISO' : 
                       teamMember === 'sam' ? 'Sam' : 
                       null;

  return (
    <div className="space-y-6">
      {displayName && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-gradient-to-r from-purple-900/40 via-purple-800/30 to-indigo-900/40 p-6 rounded-lg border border-purple-500/20"
        >
          <h1 className="text-2xl font-bold text-white mb-2">
            {displayName}'s Task Dashboard
          </h1>
          <p className="text-purple-200/80">
            Manage and track tasks assigned to {displayName}
          </p>
        </motion.div>
      )}

      <Tabs value={activeView} onValueChange={(value) => setActiveView(value as 'byCategory' | 'analytics')}>
        <TabsList>
          <TabsTrigger value="byCategory">By Category</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
      </Tabs>

      {activeView === 'byCategory' ? (
        <div className="space-y-8">
          {categories.map((category) => (
            <section key={category} className="space-y-4">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold">
                  {formatCategoryName(category)}
                </h2>
                <Chip variant="outline" size="sm" className="bg-purple-100 text-purple-800 border-purple-200">
                  {category}
                </Chip>
              </div>
              <Card className="p-4">
                <TaskList category={category} userId={userId || teamMember || undefined} />
              </Card>
            </section>
          ))}
        </div>
      ) : (
        <TaskAnalytics teamMember={teamMember} />
      )}
    </div>
  );
}
