import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { FolderOpen, CheckSquare, Rocket, Calendar, TrendingUp, TrendingDown, Clock, Target } from 'lucide-react';
import { useMainUserProject } from '@/domains/projects/hooks/useUserProjects';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface StatCardData {
  id: string;
  title: string;
  value: string | number;
  subtitle: string;
  icon: any;
  trend?: {
    value: number;
    isPositive: boolean;
    period: string;
  };
  gradient: string;
  iconBg: string;
  textColor: string;
  borderColor: string;
  progress?: {
    current: number;
    total: number;
    percentage: number;
  };
}

// Utility functions to calculate real user progress
const getOnboardingProgress = () => {
  const businessData = localStorage.getItem('business-onboarding-data');
  const completedTasks = localStorage.getItem('workflow-completed-tasks');
  
  let score = 0;
  
  // Check business onboarding completion (40% weight)
  if (businessData) {
    const data = JSON.parse(businessData);
    if (data.businessName) score += 10;
    if (data.appPurpose) score += 10;
    if (data.industry) score += 10;
    if (data.completedAt) score += 10;
  }
  
  // Check workflow tasks completion (60% weight)
  if (completedTasks) {
    const completed = JSON.parse(completedTasks);
    score += Math.min(completed.length * 10, 60); // Max 60 points for 6+ tasks
  }
  
  return Math.min(score, 100);
};

const getActiveTasksCount = () => {
  const completedTasks = localStorage.getItem('workflow-completed-tasks');
  const totalWorkflowTasks = 9; // We have 9 workflow tasks
  
  if (!completedTasks) return totalWorkflowTasks;
  
  const completed = JSON.parse(completedTasks);
  return Math.max(0, totalWorkflowTasks - completed.length);
};

const getProjectPhase = (hasProjects: boolean) => {
  const onboardingProgress = getOnboardingProgress();
  const activeTasks = getActiveTasksCount();
  
  if (!hasProjects) {
    if (onboardingProgress >= 100) return "Ready to Launch";
    if (onboardingProgress >= 60) return "Planning Phase";
    if (onboardingProgress >= 30) return "Requirements";
    return "Getting Started";
  }
  
  return "In Development";
};

const getTimelineEstimate = (hasProjects: boolean) => {
  const onboardingProgress = getOnboardingProgress();
  const activeTasks = getActiveTasksCount();
  
  if (hasProjects) {
    return "14-21 days"; // Typical development timeline
  }
  
  if (onboardingProgress >= 100) {
    return "Ready Now";
  }
  
  // Estimate based on remaining tasks (assuming ~1 day per task)
  const estimatedDays = Math.max(1, activeTasks);
  if (estimatedDays === 1) return "1 day";
  if (estimatedDays <= 3) return `${estimatedDays} days`;
  if (estimatedDays <= 7) return "1 week";
  return "2+ weeks";
};

const StatCard = ({ data, index }: { data: StatCardData; index: number }) => {
  const IconComponent = data.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group"
    >
      <Card className={cn(
        "relative overflow-hidden border-0 bg-gradient-to-br transition-[box-shadow] duration-200 hover:shadow-xl",
        data.gradient
      )}>
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 bg-black/10 opacity-50" />
        
        {/* Glow effect on hover */}
        <div className={cn(
          "absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300 bg-gradient-to-r",
          data.borderColor.replace('border-', 'from-').replace('/20', '/30') + ' to-transparent'
        )} />
        
        <CardContent className="relative p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-3 rounded-xl shadow-lg",
                  data.iconBg
                )}>
                  <IconComponent className={cn("h-6 w-6", data.textColor)} />
                </div>
                <div>
                  <p className="text-sm font-medium text-white/70">{data.title}</p>
                  <p className="text-2xl font-bold text-white">{data.value}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-xs text-white/60">{data.subtitle}</p>
                
                {data.trend && (
                  <div className="flex items-center gap-2">
                    {data.trend.isPositive ? (
                      <TrendingUp className="h-4 w-4 text-green-400" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-400" />
                    )}
                    <span className={cn(
                      "text-sm font-medium",
                      data.trend.isPositive ? "text-green-400" : "text-red-400"
                    )}>
                      {data.trend.isPositive ? '+' : ''}{data.trend.value}%
                    </span>
                    <span className="text-xs text-white/50">{data.trend.period}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Decorative element */}
            <div className="relative">
              <div className={cn(
                "w-20 h-20 rounded-full opacity-10",
                data.iconBg
              )} />
              <IconComponent className={cn(
                "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 opacity-20",
                data.textColor
              )} />
            </div>
          </div>
          
          {/* Progress bar for progress-based metrics */}
          {data.progress && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="flex justify-between text-xs text-white/60 mb-2">
                <span>Progress</span>
                <span>{data.progress.current}/{data.progress.total}</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div 
                  className={cn(
                    "h-2 rounded-full transition-all duration-500",
                    data.id === 'setup' && "bg-gradient-to-r from-blue-500 to-cyan-500",
                    data.id === 'tasks' && "bg-gradient-to-r from-orange-500 to-amber-500",
                    data.id === 'project' && "bg-gradient-to-r from-green-500 to-emerald-500",
                    data.id === 'timeline' && "bg-gradient-to-r from-purple-500 to-pink-500"
                  )}
                  style={{ width: `${data.progress.percentage}%` }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export function StatCards() {
  const { project, hasProjects, loading } = useMainUserProject();
  
  // Calculate real user metrics
  const onboardingProgress = getOnboardingProgress();
  const activeTasks = getActiveTasksCount();
  const projectPhase = getProjectPhase(hasProjects);
  const timelineEstimate = getTimelineEstimate(hasProjects);

  const statsData: StatCardData[] = [
    {
      id: 'setup',
      title: 'Setup Progress',
      value: `${onboardingProgress}%`,
      subtitle: hasProjects ? 'setup complete' : 'onboarding progress',
      icon: Rocket,
      trend: onboardingProgress > 0 ? {
        value: Math.min(onboardingProgress, 100),
        isPositive: true,
        period: 'completion'
      } : undefined,
      gradient: 'from-blue-600/20 via-blue-500/10 to-cyan-500/20',
      iconBg: 'bg-blue-500/20 border border-blue-400/30',
      textColor: 'text-blue-400',
      borderColor: 'border-blue-500/20',
      progress: {
        current: Math.floor(onboardingProgress / 10),
        total: 10,
        percentage: onboardingProgress
      }
    },
    {
      id: 'tasks',
      title: 'Active Tasks',
      value: activeTasks,
      subtitle: activeTasks === 0 ? 'all complete!' : 'tasks remaining',
      icon: CheckSquare,
      trend: activeTasks > 0 ? {
        value: Math.max(0, 100 - (activeTasks * 11)),
        isPositive: true,
        period: 'progress'
      } : {
        value: 100,
        isPositive: true,
        period: 'complete'
      },
      gradient: 'from-orange-600/20 via-orange-500/10 to-amber-500/20',
      iconBg: 'bg-orange-500/20 border border-orange-400/30',
      textColor: 'text-orange-400',
      borderColor: 'border-orange-500/20',
      progress: {
        current: Math.max(0, 9 - activeTasks),
        total: 9,
        percentage: Math.max(0, ((9 - activeTasks) / 9) * 100)
      }
    },
    {
      id: 'project',
      title: 'Project Status',
      value: projectPhase,
      subtitle: hasProjects ? 'development active' : 'current phase',
      icon: hasProjects ? FolderOpen : Target,
      trend: hasProjects ? {
        value: 65,
        isPositive: true,
        period: 'progress'
      } : onboardingProgress >= 80 ? {
        value: 95,
        isPositive: true,
        period: 'ready'
      } : undefined,
      gradient: 'from-green-600/20 via-green-500/10 to-emerald-500/20',
      iconBg: 'bg-green-500/20 border border-green-400/30',
      textColor: 'text-green-400',
      borderColor: 'border-green-500/20'
    },
    {
      id: 'timeline',
      title: 'Time to Launch',
      value: timelineEstimate,
      subtitle: hasProjects ? 'estimated delivery' : 'until ready to start',
      icon: Calendar,
      trend: timelineEstimate === "Ready Now" ? {
        value: 100,
        isPositive: true,
        period: 'ready'
      } : timelineEstimate.includes('day') ? {
        value: 80,
        isPositive: true,
        period: 'soon'
      } : undefined,
      gradient: 'from-purple-600/20 via-purple-500/10 to-pink-500/20',
      iconBg: 'bg-purple-500/20 border border-purple-400/30',
      textColor: 'text-purple-400',
      borderColor: 'border-purple-500/20'
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-black/30 border border-white/10">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-12 w-12 rounded-xl" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                  </div>
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statsData.map((stat, index) => (
        <StatCard key={stat.id} data={stat} index={index} />
      ))}
    </div>
  );
} 