
import { AnimatedCard } from "@/components/ui/animated-card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface TasksOverviewCardProps {
  taskCount: number;
  onManageTasks?: () => void;
}

export function TasksOverviewCard({ taskCount, onManageTasks }: TasksOverviewCardProps) {
  const navigate = useNavigate();

  return (
    <AnimatedCard className="h-full">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium text-gray-400">Tasks</h3>
        <CheckCircle className="h-5 w-5 text-green-500" />
      </div>
      <p className="text-3xl font-semibold mt-2">{taskCount}</p>
      <p className="text-sm text-gray-400">Pending tasks</p>
      <Button
        variant="outline"
        size="sm"
        onClick={onManageTasks}
        className="w-full mt-4 flex justify-between items-center"
      >
        <span>Manage Tasks</span>
        <ArrowUpRight className="h-4 w-4" />
      </Button>
    </AnimatedCard>
  );
}
