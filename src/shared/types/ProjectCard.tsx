
import { Card } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Progress } from "@/shared/ui/progress";
import { Calendar, ExternalLink } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { motion } from "framer-motion";
import { formatDate } from "@/shared/lib/formatters";

interface ProjectTask {
  title: string;
  due_date: string;
}

interface ProjectCardProps {
  project: {
    id: string;
    app_name: string;
    company_name: string | null;
    username: string;
    estimated_cost: number;
    estimated_days: number;
    features: string[];
    status: string;
    created_at: string;
    completion_percentage?: number;
    due_date?: string;
    tasks?: ProjectTask[];
    logo?: string;
  };
}

export function ProjectCard({ project }: ProjectCardProps) {
  const completion = project.completion_percentage || 0;
  const tasks = project.tasks || [];
  const initials = project.app_name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/40';
      case 'in_progress':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/40';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-black/30 border border-siso-text/10 p-6 hover:border-siso-orange/50 transition-all duration-300">
        <div className="flex flex-col gap-6">
          {/* Header Section */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#9b87f5] to-[#6E59A5] flex items-center justify-center ring-4 ring-[#9b87f5]/20">
                {project.logo ? (
                  <img src={project.logo} alt={project.app_name} className="h-full w-full rounded-full object-cover" />
                ) : (
                  <span className="text-xl font-bold text-white">{initials}</span>
                )}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">{project.app_name}</h3>
                {project.company_name && (
                  <p className="text-sm text-siso-text mt-1">{project.company_name}</p>
                )}
              </div>
            </div>
            <Badge 
              variant="outline" 
              className={cn("text-sm py-1 px-3", getStatusColor(project.status))}
            >
              {project.status.replace(/_/g, ' ').toUpperCase()}
            </Badge>
          </div>

          {/* Progress Section */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-siso-text">Project Progress</span>
              <span className="text-sm font-medium text-white">{completion}%</span>
            </div>
            <Progress 
              value={completion} 
              className="h-2" 
              indicatorClassName={cn(
                "transition-all",
                completion < 30 ? "bg-red-500" :
                completion < 70 ? "bg-yellow-500" :
                "bg-green-500"
              )}
            />
          </div>

          {/* Key Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-siso-text">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">
                Due: {project.due_date ? formatDate(project.due_date) : 'Not set'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-siso-text">
              <span className="text-sm">
                Est. Days: {project.estimated_days}
              </span>
            </div>
          </div>

          {/* Mini Tasks List */}
          {tasks.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-white">Upcoming Tasks</h4>
              <div className="space-y-2">
                {tasks.slice(0, 3).map((task, index) => (
                  <div 
                    key={index}
                    className="p-3 rounded-lg bg-white/5 border border-white/10"
                  >
                    <div className="flex justify-between items-start">
                      <p className="text-sm text-white">{task.title}</p>
                      <span className="text-xs text-siso-text">
                        Due: {formatDate(task.due_date)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Button */}
          <Button 
            className="w-full bg-[#9b87f5] hover:bg-[#7E69AB] text-white"
            onClick={() => window.location.href = `/projects/${project.app_name.toLowerCase()}`}
          >
            View Details
            <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
