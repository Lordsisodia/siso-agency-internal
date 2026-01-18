
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Users, Clock, CheckCircle } from 'lucide-react';

interface TeamMemberCardProps {
  id: string;
  name: string;
  role: string;
  stats: {
    tasks: number;
    completed: number;
    inProgress: number;
  };
}

export function TeamMemberCard({ id, name, role, stats }: TeamMemberCardProps) {
  const navigate = useNavigate();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
      onClick={() => navigate(`/admin/tasks/${id}`)}
    >
      <HoverCard>
        <HoverCardTrigger asChild>
          <Card className="relative p-6 cursor-pointer border-purple-500/20 bg-gradient-to-r from-purple-900/40 via-purple-800/30 to-indigo-900/40 hover:border-purple-500/40 transition-all duration-300">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-white">{name}</h3>
                  <p className="text-purple-200/80">{role}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Users className="h-4 w-4 text-purple-400" />
                  </div>
                  <div className="text-sm font-medium text-purple-100">{stats.tasks}</div>
                  <div className="text-xs text-purple-300/80">Total Tasks</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Clock className="h-4 w-4 text-purple-400" />
                  </div>
                  <div className="text-sm font-medium text-purple-100">{stats.inProgress}</div>
                  <div className="text-xs text-purple-300/80">In Progress</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <CheckCircle className="h-4 w-4 text-purple-400" />
                  </div>
                  <div className="text-sm font-medium text-purple-100">{stats.completed}</div>
                  <div className="text-xs text-purple-300/80">Completed</div>
                </div>
              </div>
            </div>
          </Card>
        </HoverCardTrigger>
        <HoverCardContent className="w-80">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">{name}'s Task Overview</h4>
            <p className="text-sm text-muted-foreground">
              Click to view and manage {name}'s tasks, track progress, and set new goals.
            </p>
          </div>
        </HoverCardContent>
      </HoverCard>
    </motion.div>
  );
}
