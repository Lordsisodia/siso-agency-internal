
import { Card } from "@/components/ui/card";
import { Folder, CheckCircle, Clock } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export function ProjectsOverviewCard() {
  const navigate = useNavigate();

  // This would be replaced with real data from your backend
  const projectsData = {
    total: 8,
    completed: 3,
    inProgress: 4,
    pending: 1,
    completionRate: 37.5
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <Card className="bg-black/30 border border-siso-text/10 p-5 hover:border-siso-orange/30 transition-all duration-300 cursor-pointer"
        onClick={() => navigate('/my-projects')}
      >
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-lg font-semibold text-white">Projects Overview</h3>
          <div className="h-10 w-10 flex items-center justify-center rounded-full bg-gradient-to-r from-siso-red/20 to-siso-orange/20">
            <Folder className="h-5 w-5 text-siso-orange" />
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-end justify-between">
            <div>
              <span className="text-siso-text">Completion Rate</span>
              <h4 className="text-2xl font-bold text-white">{projectsData.completionRate}%</h4>
            </div>
            <div className="text-right">
              <span className="text-sm text-siso-text">Total Projects</span>
              <h5 className="text-lg font-semibold text-white">{projectsData.total}</h5>
            </div>
          </div>
          
          <Progress 
            value={projectsData.completionRate} 
            className="h-2 bg-siso-text/20" 
            indicatorClassName="bg-gradient-to-r from-siso-red to-siso-orange"
          />
          
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="bg-green-500/10 rounded-lg p-3 text-center">
              <CheckCircle className="h-5 w-5 text-green-500 mx-auto mb-1" />
              <div className="text-xs text-siso-text">Completed</div>
              <div className="text-lg font-semibold text-white">{projectsData.completed}</div>
            </div>
            <div className="bg-blue-500/10 rounded-lg p-3 text-center">
              <Clock className="h-5 w-5 text-blue-500 mx-auto mb-1" />
              <div className="text-xs text-siso-text">In Progress</div>
              <div className="text-lg font-semibold text-white">{projectsData.inProgress}</div>
            </div>
            <div className="bg-orange-500/10 rounded-lg p-3 text-center">
              <Clock className="h-5 w-5 text-orange-500 mx-auto mb-1" />
              <div className="text-xs text-siso-text">Pending</div>
              <div className="text-lg font-semibold text-white">{projectsData.pending}</div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
