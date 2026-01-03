import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { 
  Zap, 
  Calendar, 
  Users, 
  Trash2,
  Clock,
  Target,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Brain,
  TrendingUp,
  MessageSquare,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { EisenhowerMatrixResult, TaskWithAnalysis, EisenhowerQuadrant } from '@/services/shared/task.service';

interface EisenhowerMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: EisenhowerMatrixResult | null;
  onApplyOrganization: () => void;
  onReanalyze: () => void;
  isLoading?: boolean;
}

export const EisenhowerMatrixModal: React.FC<EisenhowerMatrixModalProps> = ({
  isOpen,
  onClose,
  result,
  onApplyOrganization,
  onReanalyze,
  isLoading = false
}) => {
  const [selectedQuadrant, setSelectedQuadrant] = useState<EisenhowerQuadrant | null>(null);
  const [showTaskDetails, setShowTaskDetails] = useState(false);
  
  const getQuadrantConfig = (quadrant: EisenhowerQuadrant) => {
    const configs = {
      'do-first': {
        title: 'Do First',
        subtitle: 'Urgent + Important',
        icon: AlertCircle,
        color: 'from-red-500 to-red-600',
        borderColor: 'border-red-500/50',
        textColor: 'text-red-100',
        bgColor: 'bg-red-900/20',
        description: 'Critical tasks requiring immediate attention'
      },
      'schedule': {
        title: 'Schedule',
        subtitle: 'Important + Not Urgent',
        icon: Calendar,
        color: 'from-blue-500 to-blue-600', 
        borderColor: 'border-blue-500/50',
        textColor: 'text-blue-100',
        bgColor: 'bg-blue-900/20',
        description: 'Strategic work for planned execution'
      },
      'delegate': {
        title: 'Delegate',
        subtitle: 'Urgent + Not Important',
        icon: Users,
        color: 'from-yellow-500 to-yellow-600',
        borderColor: 'border-yellow-500/50', 
        textColor: 'text-yellow-100',
        bgColor: 'bg-yellow-900/20',
        description: 'Tasks that can be handled by others'
      },
      'eliminate': {
        title: 'Eliminate',
        subtitle: 'Not Urgent + Not Important',
        icon: Trash2,
        color: 'from-gray-500 to-gray-600',
        borderColor: 'border-gray-500/50',
        textColor: 'text-gray-100', 
        bgColor: 'bg-gray-900/20',
        description: 'Consider removing these tasks'
      }
    };
    
    return configs[quadrant];
  };

  const TaskCard = ({ task, quadrant }: { task: TaskWithAnalysis; quadrant: EisenhowerQuadrant }) => {
    const config = getQuadrantConfig(quadrant);
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="group"
      >
        <Card className={cn(
          'border transition-all duration-200 hover:scale-[1.02] cursor-pointer',
          config.borderColor,
          config.bgColor
        )}>
          <CardContent className="p-3">
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-medium text-sm text-white line-clamp-2">
                {task.title}
              </h4>
              <div className="flex items-center space-x-1 ml-2">
                <Badge variant="outline" className="text-xs px-1 py-0.5">
                  U:{task.eisenhowerAnalysis.urgentScore}
                </Badge>
                <Badge variant="outline" className="text-xs px-1 py-0.5">
                  I:{task.eisenhowerAnalysis.importanceScore}
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {task.workType === 'deep' ? (
                  <Brain className="h-3 w-3 text-purple-400" />
                ) : (
                  <Zap className="h-3 w-3 text-orange-400" />
                )}
                <span className="text-xs text-gray-300 capitalize">
                  {task.workType} work
                </span>
              </div>
              
              <div className="flex items-center space-x-1">
                {task.rollovers > 0 && (
                  <Badge variant="secondary" className="text-xs bg-orange-500/20 text-orange-300">
                    {task.rollovers} rollover{task.rollovers > 1 ? 's' : ''}
                  </Badge>
                )}
                <Badge 
                  variant="outline" 
                  className={cn(
                    'text-xs',
                    task.priority === 'critical' ? 'border-red-400 text-red-300' :
                    task.priority === 'high' ? 'border-yellow-400 text-yellow-300' :
                    'border-gray-400 text-gray-300'
                  )}
                >
                  {task.priority}
                </Badge>
              </div>
            </div>

            {/* Reasoning preview */}
            <div className="mt-2 pt-2 border-t border-gray-600/30">
              <p className="text-xs text-gray-400 line-clamp-2">
                {task.eisenhowerAnalysis.reasoning}
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  const QuadrantSection = ({ 
    quadrant, 
    tasks, 
    onQuadrantClick 
  }: { 
    quadrant: EisenhowerQuadrant; 
    tasks: TaskWithAnalysis[]; 
    onQuadrantClick: (quadrant: EisenhowerQuadrant) => void;
  }) => {
    const config = getQuadrantConfig(quadrant);
    const Icon = config.icon;
    
    return (
      <Card className={cn(
        'border-2 transition-all duration-300 hover:scale-[1.02] cursor-pointer',
        config.borderColor,
        selectedQuadrant === quadrant ? 'ring-2 ring-orange-400/50' : ''
      )}>
        <CardHeader 
          className="p-3 pb-2"
          onClick={() => onQuadrantClick(quadrant)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={cn('w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-r', config.color)}>
                <Icon className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">{config.title}</h3>
                <p className="text-xs text-gray-400">{config.subtitle}</p>
              </div>
            </div>
            <Badge variant="outline" className={cn('text-xs', config.textColor)}>
              {tasks.length}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="p-3 pt-0">
          <p className="text-xs text-gray-400 mb-3">{config.description}</p>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            <AnimatePresence>
              {tasks.map((task, index) => (
                <TaskCard key={task.id} task={task} quadrant={quadrant} />
              ))}
            </AnimatePresence>
            
            {tasks.length === 0 && (
              <div className="text-center py-4">
                <CheckCircle2 className="h-6 w-6 text-green-400 mx-auto mb-2" />
                <p className="text-xs text-gray-400">No tasks in this quadrant</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (!result) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 border border-orange-400/30">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl flex items-center justify-center">
                <Target className="h-5 w-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">
                  Eisenhower Matrix Analysis
                </DialogTitle>
                <p className="text-sm text-gray-400">
                  AI-powered task prioritization • {result.totalTasks} tasks analyzed
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onReanalyze}
                disabled={isLoading}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Re-analyze
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 overflow-y-auto">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-red-900/20 border-red-500/30">
              <CardContent className="p-3 text-center">
                <AlertCircle className="h-6 w-6 text-red-400 mx-auto mb-1" />
                <div className="text-lg font-bold text-red-300">{result.summary.doFirstCount}</div>
                <div className="text-xs text-gray-400">Critical Tasks</div>
              </CardContent>
            </Card>
            
            <Card className="bg-blue-900/20 border-blue-500/30">
              <CardContent className="p-3 text-center">
                <Calendar className="h-6 w-6 text-blue-400 mx-auto mb-1" />
                <div className="text-lg font-bold text-blue-300">{result.summary.scheduleCount}</div>
                <div className="text-xs text-gray-400">To Schedule</div>
              </CardContent>
            </Card>
            
            <Card className="bg-yellow-900/20 border-yellow-500/30">
              <CardContent className="p-3 text-center">
                <Users className="h-6 w-6 text-yellow-400 mx-auto mb-1" />
                <div className="text-lg font-bold text-yellow-300">{result.summary.delegateCount}</div>
                <div className="text-xs text-gray-400">To Delegate</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-900/20 border-gray-500/30">
              <CardContent className="p-3 text-center">
                <Trash2 className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                <div className="text-lg font-bold text-gray-300">{result.summary.eliminateCount}</div>
                <div className="text-xs text-gray-400">To Eliminate</div>
              </CardContent>
            </Card>
          </div>

          {/* Matrix Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <QuadrantSection
              quadrant="do-first"
              tasks={result.doFirst}
              onQuadrantClick={setSelectedQuadrant}
            />
            
            <QuadrantSection
              quadrant="schedule"
              tasks={result.schedule}
              onQuadrantClick={setSelectedQuadrant}
            />
            
            <QuadrantSection
              quadrant="delegate"
              tasks={result.delegate}
              onQuadrantClick={setSelectedQuadrant}
            />
            
            <QuadrantSection
              quadrant="eliminate"
              tasks={result.eliminate}
              onQuadrantClick={setSelectedQuadrant}
            />
          </div>

          {/* AI Recommendations */}
          <Card className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/30">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center space-x-2">
                <Brain className="h-5 w-5 text-purple-400" />
                <h3 className="font-bold text-white">AI Recommendations</h3>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="space-y-2">
                {result.summary.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <ArrowRight className="h-4 w-4 text-purple-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-300">{rec}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                  <TrendingUp className="h-5 w-5 text-orange-400 mx-auto mb-1" />
                  <div className="text-sm font-medium text-orange-300">Avg Urgency</div>
                  <div className="text-lg font-bold text-orange-200">{result.summary.averageUrgency}/10</div>
                </div>
                
                <div className="text-center p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <Target className="h-5 w-5 text-blue-400 mx-auto mb-1" />
                  <div className="text-sm font-medium text-blue-300">Avg Importance</div>
                  <div className="text-lg font-bold text-blue-200">{result.summary.averageImportance}/10</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-700">
            <div className="flex items-center space-x-2 text-xs text-gray-400">
              <Clock className="h-3 w-3" />
              <span>Analysis completed at {result.analysisTimestamp.toLocaleTimeString()}</span>
            </div>
            
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button
                onClick={onApplyOrganization}
                disabled={isLoading}
                className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold"
              >
                <Target className="h-4 w-4 mr-2" />
                Apply Organization
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EisenhowerMatrixModal;