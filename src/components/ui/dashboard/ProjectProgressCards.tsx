import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckSquare, Clock, CreditCard } from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface StatCardProps { 
  title: string; 
  value: string; 
  icon: React.ReactNode; 
  bgColor: string; 
  textColor: string; 
  delay?: number;
  progress?: number;
  subtitle?: string;
  linkText?: string;
  linkHref?: string;
}

function StatCard({ 
  title, 
  value, 
  icon, 
  bgColor, 
  textColor, 
  delay = 0,
  progress,
  subtitle,
  linkText,
  linkHref
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: delay * 0.1 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <Card className={`border border-gray-800 ${bgColor} shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden h-full`}>
        <div className="p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-white text-sm font-medium">{title}</p>
              <p className={`text-2xl font-bold mt-1 ${textColor}`}>{value}</p>
              {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
            </div>
            <div className={`h-12 w-12 rounded-full bg-black/40 flex items-center justify-center ${textColor}`}>
              {icon}
            </div>
          </div>
          
          {progress !== undefined && (
            <div className="mt-4">
              <Progress 
                value={progress} 
                className="h-1.5 bg-black/30" 
                indicatorClassName={`${progress >= 70 ? 'bg-green-500' : progress >= 40 ? 'bg-amber-500' : 'bg-[#ea384c]'}`} 
              />
              <div className="flex justify-between mt-1.5">
                <p className="text-xs text-gray-400">{progress}% Complete</p>
                <Badge 
                  variant="outline" 
                  className={`text-xs py-0 px-1.5 ${
                    progress >= 70 ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                    progress >= 40 ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                    'bg-[#ea384c]/10 text-[#ea384c] border-[#ea384c]/20'
                  }`}
                >
                  {progress >= 70 ? 'On track' : progress >= 40 ? 'In progress' : 'Needs attention'}
                </Badge>
              </div>
            </div>
          )}

          {linkText && linkHref && (
            <div className="mt-auto pt-4">
              <Button 
                variant="link" 
                className="p-0 h-auto text-[#ea384c] hover:text-[#ea384c]/80" 
                asChild
              >
                <Link to={linkHref}>{linkText}</Link>
              </Button>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}

export function ProjectProgressCards() {
  // Using the same data structure as in ProjectStatsCards
  const stats = {
    overallProgress: 25,
    timelineRemaining: {
      days: 35,
      endDate: "June 6, 2025",
      percentComplete: 25
    },
    nextMilestone: {
      name: "Phase 1 Completion",
      date: "May 21, 2025",
      tasksCompleted: 3,
      totalTasks: 6,
      percentComplete: 50
    },
    credits: {
      spent: 614,
      tokens: 78592000,
      cost: 153.50,
      totalBudget: "£6,000"
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
      <StatCard 
        title="Overall Progress"
        value="25%"
        subtitle="1.5 weeks out of 6"
        icon={<CheckSquare className="h-6 w-6 text-[#ea384c]" />}
        bgColor="bg-black/40"
        textColor="text-[#ea384c]"
        delay={0}
        progress={stats.overallProgress}
        linkText="View Timeline"
        linkHref="/projects/timeline"
      />
      
      <StatCard 
        title="Timeline Remaining"
        value={`${stats.timelineRemaining.days} days`}
        subtitle={`until ${stats.timelineRemaining.endDate}`}
        icon={<Clock className="h-6 w-6 text-red-400" />}
        bgColor="bg-black/40"
        textColor="text-red-400"
        delay={1}
        progress={stats.timelineRemaining.percentComplete}
        linkText="View Timeline"
        linkHref="/projects/timeline"
      />
      
      <StatCard 
        title="Next Milestone"
        value={stats.nextMilestone.name}
        subtitle={`${stats.nextMilestone.date} (${stats.nextMilestone.tasksCompleted}/${stats.nextMilestone.totalTasks} tasks)`}
        icon={<CheckSquare className="h-6 w-6 text-[#ea384c]" />}
        bgColor="bg-black/40"
        textColor="text-[#ea384c]"
        delay={2}
        progress={stats.nextMilestone.percentComplete}
        linkText="View Tasks"
        linkHref="/projects/ubahcrypt/active-tasks"
      />
      
      <StatCard 
        title="Credits Spent"
        value={`£${stats.credits.cost}`}
        subtitle={`${stats.credits.spent} credits (${(stats.credits.tokens/1000000).toFixed(1)}M tokens)`}
        icon={<CreditCard className="h-6 w-6 text-red-400" />}
        bgColor="bg-black/40"
        textColor="text-red-400"
        delay={3}
        linkText="View Financial Details"
        linkHref="/projects/ubahcrypt/financial"
      />
    </div>
  );
}
