import React, { useState } from 'react';
import { Card, CardContent } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { 
  Play, 
  Brain, 
  Timer,
  Circle,
  ChevronRight,
  Plus
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { motion } from 'framer-motion';

interface CompactDeepFocusCardProps {
  title?: string;
  status?: 'not-started' | 'active' | 'completed';
  onStartSession?: () => void;
  onOpenDetails?: () => void;
  className?: string;
}

export const CompactDeepFocusCard: React.FC<CompactDeepFocusCardProps> = ({
  title = "Get the SISO IDE fully functioning",
  status = "not-started",
  onStartSession,
  onOpenDetails,
  className
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const getStatusConfig = () => {
    switch (status) {
      case 'active':
        return {
          color: 'bg-green-500/20 text-green-400 border-green-500/30',
          label: 'Active',
          icon: <Circle className="w-2 h-2 fill-current" />
        };
      case 'completed':
        return {
          color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
          label: 'Completed',
          icon: <Circle className="w-2 h-2 fill-current" />
        };
      default:
        return {
          color: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
          label: 'Ready',
          icon: <Circle className="w-2 h-2" />
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <motion.div
      whileHover={{ y: -2 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={cn('w-full', className)}
    >
      <Card className="bg-gray-900/50 border-gray-700/50 hover:border-orange-500/30 transition-all duration-200 cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            {/* Left Side - Task Info */}
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Brain className="h-4 w-4 text-white" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-medium text-sm truncate">
                  {title}
                </h3>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge className={cn('text-xs px-2 py-0.5', statusConfig.color)}>
                    <span className="flex items-center space-x-1">
                      {statusConfig.icon}
                      <span>{statusConfig.label}</span>
                    </span>
                  </Badge>
                  <span className="text-xs text-gray-500">Creative • Level 1</span>
                </div>
              </div>
            </div>

            {/* Right Side - Actions */}
            <div className="flex items-center space-x-2">
              {status === 'not-started' && (
                <Button
                  size="sm"
                  onClick={onStartSession}
                  className="bg-green-600 hover:bg-green-700 text-white h-8 px-3"
                >
                  <Play className="w-3 h-3 mr-1" />
                  Start
                </Button>
              )}
              
              {status === 'active' && (
                <Button
                  size="sm"
                  variant="outline"
                  className="border-green-500 text-green-400 hover:bg-green-500/20 h-8 px-3"
                >
                  <Timer className="w-3 h-3 mr-1" />
                  25:00
                </Button>
              )}

              <Button
                size="sm"
                variant="ghost"
                onClick={onOpenDetails}
                className="text-gray-400 hover:text-white hover:bg-white/10 h-8 w-8 p-0"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Quick Add Subtask - Only show on hover */}
          {isHovered && status === 'not-started' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 pt-3 border-t border-gray-700/50"
            >
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-left justify-start text-gray-400 hover:text-white hover:bg-white/5 h-8"
              >
                <Plus className="w-3 h-3 mr-2" />
                Add subtask
              </Button>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CompactDeepFocusCard;