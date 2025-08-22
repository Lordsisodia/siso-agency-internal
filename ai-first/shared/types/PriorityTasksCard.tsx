
import { Card } from "@/components/ui/card";
import { CheckSquare, Clock, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface Task {
  id: number;
  title: string;
  priority: "high" | "medium" | "low";
  dueDate?: string;
}

export function PriorityTasksCard() {
  const navigate = useNavigate();
  
  // These would come from your actual task management system
  const tasks: Task[] = [
    {
      id: 1,
      title: "Complete client onboarding",
      priority: "high",
      dueDate: "Today"
    },
    {
      id: 2,
      title: "Review project milestones",
      priority: "medium",
      dueDate: "Tomorrow"
    },
    {
      id: 3,
      title: "Send invoice to new client",
      priority: "high",
      dueDate: "Friday"
    }
  ];

  const getPriorityBadge = (priority: string) => {
    switch(priority) {
      case "high": 
        return <span className="px-2 py-1 rounded text-xs font-medium bg-red-500/20 text-red-400">High</span>;
      case "medium": 
        return <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-500/20 text-yellow-400">Medium</span>;
      case "low": 
        return <span className="px-2 py-1 rounded text-xs font-medium bg-green-500/20 text-green-400">Low</span>;
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
    >
      <Card className="bg-black/30 border border-siso-text/10 p-5 hover:border-siso-orange/30 transition-all duration-300 cursor-pointer"
        onClick={() => navigate('/my-projects')}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">Priority Tasks</h3>
          <div className="h-10 w-10 flex items-center justify-center rounded-full bg-gradient-to-r from-siso-red/20 to-siso-orange/20">
            <AlertCircle className="h-5 w-5 text-siso-orange" />
          </div>
        </div>
        
        <div className="space-y-3">
          {tasks.length > 0 ? (
            tasks.map(task => (
              <div key={task.id} className="bg-black/20 border border-siso-text/10 rounded-lg p-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-2">
                    <CheckSquare className="h-5 w-5 mt-0.5 text-siso-text" />
                    <div>
                      <div className="font-medium text-white">{task.title}</div>
                      <div className="flex items-center text-xs text-siso-text mt-1">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>Due: {task.dueDate}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    {getPriorityBadge(task.priority)}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-siso-text">
              No priority tasks at the moment
            </div>
          )}
          
          <button 
            className="w-full py-2 text-sm text-siso-orange hover:text-white transition-colors"
          >
            View All Tasks
          </button>
        </div>
      </Card>
    </motion.div>
  );
}
