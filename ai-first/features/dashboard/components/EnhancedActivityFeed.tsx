import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { 
  Bell, 
  Calendar, 
  FileText, 
  MessageSquare, 
  DollarSign,
  CheckCircle,
  Clock,
  User,
  CreditCard,
  AlertTriangle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/shared/lib/utils';

interface ActivityItem {
  id: string;
  type: 'payment' | 'deadline' | 'message' | 'document' | 'task' | 'system';
  title: string;
  description: string;
  time: string;
  priority: 'high' | 'medium' | 'low';
  status?: 'success' | 'warning' | 'info' | 'error';
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'payment': return CreditCard;
    case 'deadline': return Clock;
    case 'message': return MessageSquare;
    case 'document': return FileText;
    case 'task': return CheckCircle;
    default: return Bell;
  }
};

const getActivityTheme = (type: string, priority: string) => {
  const themes = {
    payment: {
      iconBg: 'bg-green-500/20 border border-green-400/30',
      iconColor: 'text-green-400',
      timelineBg: 'bg-green-500'
    },
    deadline: {
      iconBg: 'bg-amber-500/20 border border-amber-400/30', 
      iconColor: 'text-amber-400',
      timelineBg: 'bg-amber-500'
    },
    message: {
      iconBg: 'bg-blue-500/20 border border-blue-400/30',
      iconColor: 'text-blue-400', 
      timelineBg: 'bg-blue-500'
    },
    document: {
      iconBg: 'bg-purple-500/20 border border-purple-400/30',
      iconColor: 'text-purple-400',
      timelineBg: 'bg-purple-500'
    },
    task: {
      iconBg: 'bg-emerald-500/20 border border-emerald-400/30',
      iconColor: 'text-emerald-400',
      timelineBg: 'bg-emerald-500'
    },
    system: {
      iconBg: 'bg-gray-500/20 border border-gray-400/30',
      iconColor: 'text-gray-400',
      timelineBg: 'bg-gray-500'
    }
  };
  
  return themes[type as keyof typeof themes] || themes.system;
};

const ActivityItem = ({ activity, index, isLast }: { activity: ActivityItem; index: number; isLast: boolean }) => {
  const IconComponent = getActivityIcon(activity.type);
  const theme = getActivityTheme(activity.type, activity.priority);
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="relative flex gap-4 group"
    >
      {/* Timeline line */}
      {!isLast && (
        <div className="absolute left-6 top-12 bottom-0 w-px bg-gradient-to-b from-white/20 to-transparent" />
      )}
      
      {/* Icon */}
      <div className="relative z-10 flex-shrink-0">
        <div className={cn(
          "p-2.5 rounded-xl shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:scale-110",
          theme.iconBg
        )}>
          <IconComponent className={cn("h-4 w-4", theme.iconColor)} />
        </div>
        <div className={cn(
          "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full opacity-80",
          theme.timelineBg
        )} />
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0 pb-6">
        <div className="bg-black/20 border border-white/10 rounded-xl p-4 transition-all duration-300 hover:border-white/20 hover:bg-black/30">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-white truncate">
                {activity.title}
              </h4>
              <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                {activity.description}
              </p>
            </div>
            
            <div className="flex items-center gap-2 flex-shrink-0">
              {activity.priority === 'high' && (
                <Badge variant="destructive" className="text-xs px-2 py-0.5">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  High Priority
                </Badge>
              )}
              <span className="text-xs text-gray-500 whitespace-nowrap">
                {activity.time}
              </span>
            </div>
          </div>
          
          {/* Type badge */}
          <div className="flex items-center gap-2">
            <Badge 
              variant="secondary" 
              className={cn(
                "text-xs px-2 py-0.5 capitalize border",
                theme.iconBg.replace('bg-', 'bg-').replace('/20', '/10'),
                theme.iconColor.replace('text-', 'text-'),
                theme.iconBg.replace('bg-', 'border-').replace('/20', '/30')
              )}
            >
              {activity.type}
            </Badge>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export function EnhancedActivityFeed() {
  const activities: ActivityItem[] = [
    {
      id: '1',
      type: 'payment',
      title: 'Payment received',
      description: 'Griness Gym - £995 project payment received for Q1 development milestone',
      time: '2 hours ago',
      priority: 'medium'
    },
    {
      id: '2', 
      type: 'deadline',
      title: 'Task deadline approaching',
      description: 'UbahCrypt smart contract audit due tomorrow - Final review required',
      time: '4 hours ago',
      priority: 'high'
    },
    {
      id: '3',
      type: 'message',
      title: 'Client message received',
      description: 'SISO Agency team sent project update and next milestone timeline',
      time: '6 hours ago',
      priority: 'medium'
    },
    {
      id: '4',
      type: 'document',
      title: 'Document uploaded',
      description: 'Project specifications v2.1 uploaded to the resource center',
      time: '8 hours ago', 
      priority: 'low'
    },
    {
      id: '5',
      type: 'task',
      title: 'Task completed',
      description: 'Mobile app wireframes approved and moved to development phase',
      time: '1 day ago',
      priority: 'low'
    }
  ];

  return (
    <Card className="bg-black/30 backdrop-blur-sm border border-white/10 shadow-lg hover:border-white/20 transition-all duration-300">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
            <Bell className="h-5 w-5 text-orange-500" />
            Activity Feed
          </CardTitle>
          <Badge variant="secondary" className="bg-orange-500/20 text-orange-400 border border-orange-500/30">
            {activities.length}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-0">
        {activities.map((activity, index) => (
          <ActivityItem 
            key={activity.id} 
            activity={activity} 
            index={index}
            isLast={index === activities.length - 1}
          />
        ))}
        
        {/* View all button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: activities.length * 0.1 }}
          className="pt-4 border-t border-white/10"
        >
          <button className="w-full text-sm text-gray-400 hover:text-orange-400 transition-colors duration-200 py-2 hover:bg-white/5 rounded-lg">
            View all activity →
          </button>
        </motion.div>
      </CardContent>
    </Card>
  );
} 