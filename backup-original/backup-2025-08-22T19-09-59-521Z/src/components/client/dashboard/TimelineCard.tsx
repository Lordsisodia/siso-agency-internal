
import { AnimatedCard } from "@/components/ui/animated-card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface TimelineCardProps {
  startDate: string | null;
  completionDate: string | null;
  onViewTimeline?: () => void;
}

export function TimelineCard({ startDate, completionDate, onViewTimeline }: TimelineCardProps) {
  const navigate = useNavigate();

  return (
    <AnimatedCard className="h-full">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium text-gray-400">Project Timeline</h3>
        <Clock className="h-5 w-5 text-blue-500" />
      </div>
      <div className="mt-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium">Start:</span>
          <span className="text-gray-300">
            {startDate ? new Date(startDate).toLocaleDateString() : "TBD"}
          </span>
        </div>
        <div className="flex justify-between text-sm mt-1">
          <span className="font-medium">Est. Completion:</span>
          <span className="text-gray-300">
            {completionDate ? new Date(completionDate).toLocaleDateString() : "TBD"}
          </span>
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={onViewTimeline}
        className="w-full mt-4 flex justify-between items-center"
      >
        <span>View Timeline</span>
        <ArrowUpRight className="h-4 w-4" />
      </Button>
    </AnimatedCard>
  );
}
