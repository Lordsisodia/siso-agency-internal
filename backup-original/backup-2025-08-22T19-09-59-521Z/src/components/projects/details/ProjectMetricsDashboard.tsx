
import React from 'react';
import { Card } from '@/components/ui/card';
import { CircularProgress } from './CircularProgress';
import { motion } from 'framer-motion';
import { Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { formatDate } from '@/lib/formatters';

interface ProjectMetricsDashboardProps {
  projectId: string;
}

export function ProjectMetricsDashboard({ projectId }: ProjectMetricsDashboardProps) {
  // This would be replaced with actual data from your backend
  const metrics = {
    progress: 68,
    startDate: '2025-04-01',
    endDate: '2025-06-01',
    daysRemaining: 14,
    nextMilestone: {
      name: 'Phase 1 Completion',
      date: '2025-04-30',
      tasks: 8,
      completedTasks: 5
    },
    milestones: [
      { name: 'Planning', progress: 100 },
      { name: 'Design', progress: 90 },
      { name: 'Development', progress: 65 },
      { name: 'Testing', progress: 20 },
      { name: 'Deployment', progress: 0 }
    ],
    recentActivity: [
      { type: 'task', status: 'completed', title: 'Setup contract environment', time: '2h ago' },
      { type: 'comment', title: 'Added API documentation', time: '5h ago' },
      { type: 'update', title: 'Updated milestone dates', time: '1d ago' }
    ]
  };

  return (
    <Card className="bg-black/30 border border-white/10 p-6 backdrop-blur-sm shadow-lg hover:shadow-xl hover:shadow-[#ea384c]/5 transition-all duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Overall Progress Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="lg:col-span-4 flex flex-col items-center justify-center p-4 border border-white/5 bg-black/20 rounded-lg"
        >
          <h3 className="text-xl font-semibold text-white mb-4">Overall Progress</h3>
          <div className="relative">
            <CircularProgress 
              percentage={metrics.progress} 
              size={180}
              strokeWidth={12}
              circleOneColor="rgba(255,255,255,0.1)"
              circleTwoColor="#ea384c"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold text-white">{metrics.progress}%</span>
              <span className="text-sm text-gray-400">Completed</span>
            </div>
          </div>
          <div className="mt-6 w-full">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col items-center p-2 bg-black/30 rounded-lg">
                <span className="text-sm text-gray-400">Start Date</span>
                <span className="text-white">{formatDate(metrics.startDate, 'medium')}</span>
              </div>
              <div className="flex flex-col items-center p-2 bg-black/30 rounded-lg">
                <span className="text-sm text-gray-400">End Date</span>
                <span className="text-white">{formatDate(metrics.endDate, 'medium')}</span>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Milestone Progress */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="lg:col-span-4 flex flex-col p-4 border border-white/5 bg-black/20 rounded-lg"
        >
          <h3 className="text-xl font-semibold text-white mb-4">Milestone Progress</h3>
          <div className="space-y-4 flex-grow">
            {metrics.milestones.map((milestone, index) => (
              <div key={index} className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-300">{milestone.name}</span>
                  <span className="text-sm text-gray-400">{milestone.progress}%</span>
                </div>
                <div className="w-full bg-gray-700/30 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      milestone.progress === 100 ? 'bg-green-500' : 
                      milestone.progress > 50 ? 'bg-amber-500' : 
                      'bg-[#ea384c]'
                    }`}
                    style={{ width: `${milestone.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 bg-black/30 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#ea384c]" />
              <span className="text-gray-300 text-sm">{metrics.daysRemaining} days remaining</span>
            </div>
          </div>
        </motion.div>
        
        {/* Recent Activity & Next Milestone */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="lg:col-span-4 flex flex-col"
        >
          {/* Next Milestone */}
          <div className="p-4 border border-white/5 bg-black/20 rounded-lg mb-4">
            <h3 className="text-lg font-semibold text-white mb-3">Next Milestone</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-md font-medium text-white">{metrics.nextMilestone.name}</span>
                <div className="flex items-center gap-1 text-amber-400 text-sm">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(metrics.nextMilestone.date, 'medium')}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-grow bg-gray-700/30 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full bg-amber-500"
                    style={{ width: `${(metrics.nextMilestone.completedTasks / metrics.nextMilestone.tasks) * 100}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-400">
                  {metrics.nextMilestone.completedTasks}/{metrics.nextMilestone.tasks} tasks
                </span>
              </div>
            </div>
          </div>
          
          {/* Recent Activity */}
          <div className="p-4 border border-white/5 bg-black/20 rounded-lg flex-grow">
            <h3 className="text-lg font-semibold text-white mb-3">Recent Activity</h3>
            <div className="space-y-3">
              {metrics.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-2 p-2 hover:bg-white/5 rounded-lg transition-colors duration-200">
                  <div className="mt-0.5">
                    {activity.type === 'task' && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                    {activity.type === 'comment' && (
                      <AlertCircle className="h-4 w-4 text-blue-500" />
                    )}
                    {activity.type === 'update' && (
                      <Clock className="h-4 w-4 text-amber-500" />
                    )}
                  </div>
                  <div className="flex-grow">
                    <p className="text-sm text-gray-300">{activity.title}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </Card>
  );
}
