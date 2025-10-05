
import { Card } from "@/components/ui/card";
import { CheckSquare, Clock, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function PriorityTasksSection() {
  // These would come from your actual task management system
  const priorityTasks = [
    {
      id: "1",
      title: "Complete smart contract security audit",
      priority: "high",
      dueDate: "2 days",
      assignee: "John Developer"
    },
    {
      id: "2",
      title: "Review token distribution model",
      priority: "medium",
      dueDate: "Tomorrow",
      assignee: "Mike Writer"
    },
    {
      id: "3",
      title: "Finalize UI for token dashboard",
      priority: "high",
      dueDate: "Friday",
      assignee: "Sarah Designer"
    }
  ];

  const getPriorityBadge = (priority: string) => {
    switch(priority) {
      case "high": 
        return <Badge className="bg-red-500/20 text-red-400">High</Badge>;
      case "medium": 
        return <Badge className="bg-amber-500/20 text-amber-400">Medium</Badge>;
      case "low": 
        return <Badge className="bg-green-500/20 text-green-400">Low</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card className="p-6 bg-black/30 border-siso-text/10">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-xl font-semibold text-white">Priority Tasks</h3>
          <AlertCircle className="h-5 w-5 text-[#9b87f5]" />
        </div>
        <Button variant="outline" size="sm" className="border-[#9b87f5]/30 text-[#9b87f5] hover:bg-[#9b87f5]/10">
          View All Tasks
        </Button>
      </div>
      
      <div className="space-y-3">
        {priorityTasks.map((task, index) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="bg-black/20 border border-siso-text/10 p-3">
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-2">
                  <CheckSquare className="h-5 w-5 mt-0.5 text-siso-text" />
                  <div>
                    <div className="font-medium text-white">{task.title}</div>
                    <div className="flex items-center text-xs text-siso-text mt-1">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>Due: {task.dueDate}</span>
                      <span className="mx-2">•</span>
                      <span>Assigned to: {task.assignee}</span>
                    </div>
                  </div>
                </div>
                <div>
                  {getPriorityBadge(task.priority)}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}
