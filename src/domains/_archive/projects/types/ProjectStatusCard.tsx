
import { AnimatedCard } from "@/components/ui/animated-card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ProjectStatusCardProps {
  status: string;
  completed: number;
  total: number;
  onViewDetails?: () => void;
}

export function ProjectStatusCard({
  status,
  completed,
  total,
  onViewDetails,
}: ProjectStatusCardProps) {
  const navigate = useNavigate();
  const progress = total ? (completed / total) * 100 : 0;

  return (
    <AnimatedCard className="h-full">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium text-gray-400">Project Status</h3>
        <span className={`px-2 py-1 rounded-full text-xs font-medium 
              ${status === 'active'
                ? 'bg-green-100 text-green-800'
                : status === 'pending'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-blue-100 text-blue-800'
              }`}>
          {status.toUpperCase()}
        </span>
      </div>
      <div className="mt-4">
        <h4 className="text-xs font-medium text-gray-400">Project Progress</h4>
        <Progress value={progress} className="h-2 mt-2" />
        <p className="text-right text-xs text-gray-400 mt-1">{Math.round(progress)}% Complete</p>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={onViewDetails}
        className="w-full mt-4 flex justify-between items-center"
      >
        <span>View Details</span>
        <ArrowUpRight className="h-4 w-4" />
      </Button>
    </AnimatedCard>
  );
}
