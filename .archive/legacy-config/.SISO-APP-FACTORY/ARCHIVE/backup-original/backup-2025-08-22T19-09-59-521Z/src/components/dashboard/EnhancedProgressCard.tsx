import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Clock, Target, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';
import { getEnhancedDashboardMetrics, getDashboardGreeting } from '@/utils/dashboardMetrics';
import { useNavigate } from 'react-router-dom';

export function EnhancedProgressCard() {
  const navigate = useNavigate();
  const metrics = getEnhancedDashboardMetrics();
  const greeting = getDashboardGreeting();

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      purple: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      green: 'bg-green-500/20 text-green-300 border-green-500/30',
      orange: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      indigo: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      emerald: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  const getProgressColor = (color: string) => {
    const progressMap = {
      blue: 'bg-gradient-to-r from-blue-500 to-blue-600',
      purple: 'bg-gradient-to-r from-purple-500 to-purple-600',
      green: 'bg-gradient-to-r from-green-500 to-green-600',
      orange: 'bg-gradient-to-r from-orange-500 to-orange-600',
      indigo: 'bg-gradient-to-r from-indigo-500 to-indigo-600',
      emerald: 'bg-gradient-to-r from-emerald-500 to-emerald-600'
    };
    return progressMap[color as keyof typeof progressMap] || progressMap.blue;
  };

  const handleStageAction = (stageId: string) => {
    // Navigate to appropriate section based on stage
    switch (stageId) {
      case 'onboarding':
        navigate('/onboarding');
        break;
      case 'app_plan':
        navigate('/app-plan');
        break;
      case 'requirements':
        navigate('/plan-builder');
        break;
      case 'development':
        navigate('/projects');
        break;
      case 'testing':
        navigate('/projects');
        break;
      case 'deployment':
        navigate('/projects');
        break;
      default:
        navigate('/home');
    }
  };

  return (
    <Card className="bg-black/30 border border-gray-700/50 backdrop-blur-sm shadow-2xl">
      <CardHeader className="space-y-4">
        {/* Personalized Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <h3 className="text-2xl font-bold text-white">{greeting.greeting}</h3>
          <p className="text-gray-300">{greeting.statusMessage}</p>
        </motion.div>

        {/* Overall Progress */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-300">Project Progress</span>
            <span className="text-lg font-bold text-white">{metrics.overallProgress}%</span>
          </div>
          <Progress 
            value={metrics.overallProgress} 
            className="h-3 bg-gray-700/50"
            indicatorColor="bg-gradient-to-r from-orange-500 to-orange-600"
          />
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-400" />
              {metrics.completedStages}/{metrics.totalStages} stages
            </span>
            {metrics.timelineMetrics && (
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {metrics.timelineMetrics.estimatedDaysRemaining} days remaining
              </span>
            )}
          </div>
        </motion.div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Progress Stages */}
        <div className="space-y-3">
          <h4 className="font-semibold text-white flex items-center gap-2">
            <Target className="w-4 h-4 text-orange-500" />
            Project Milestones
          </h4>
          
          <div className="grid gap-3">
            {metrics.progressStages.map((stage, index) => (
              <motion.div
                key={stage.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center justify-between p-3 rounded-lg border 
                  ${stage.completed 
                    ? 'bg-green-500/10 border-green-500/30' 
                    : stage.id === metrics.nextStage?.id
                      ? 'bg-orange-500/10 border-orange-500/30'
                      : 'bg-gray-700/20 border-gray-600/30'
                  } transition-all duration-300`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm
                    ${stage.completed 
                      ? 'bg-green-500 text-white' 
                      : stage.id === metrics.nextStage?.id
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-600 text-gray-300'
                    }`}>
                    {stage.completed ? '✓' : stage.icon}
                  </div>
                  <div>
                    <p className={`font-medium ${stage.completed ? 'text-green-300' : 'text-white'}`}>
                      {stage.name}
                    </p>
                    <p className="text-xs text-gray-400">{stage.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {stage.completed ? (
                    <Badge variant="outline" className="bg-green-500/20 text-green-300 border-green-500/30">
                      Complete
                    </Badge>
                  ) : stage.id === metrics.nextStage?.id ? (
                    <Button
                      size="sm"
                      onClick={() => handleStageAction(stage.id)}
                      className="bg-orange-500 hover:bg-orange-600 text-white h-7 px-3"
                    >
                      Continue
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  ) : (
                    <Badge variant="outline" className="bg-gray-600/20 text-gray-400 border-gray-600/30">
                      Pending
                    </Badge>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Engagement Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-lg p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              Engagement Score
            </h4>
            <span className="text-xl font-bold text-purple-300">{metrics.engagementScore}/100</span>
          </div>
          <Progress 
            value={metrics.engagementScore} 
            className="h-2 bg-gray-700/50"
            indicatorColor="bg-gradient-to-r from-purple-500 to-blue-500"
          />
          <p className="text-xs text-gray-400 mt-2">
            {metrics.engagementScore >= 75 
              ? 'Excellent engagement! You\'re on track for success.' 
              : metrics.engagementScore >= 50
                ? 'Good progress! Keep up the momentum.'
                : 'Let\'s boost your project activity for better results.'
            }
          </p>
        </motion.div>

        {/* Achievement Badges */}
        <AnimatePresence>
          {metrics.achievements.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-3"
            >
              <h4 className="font-semibold text-white flex items-center gap-2">
                <Trophy className="w-4 h-4 text-yellow-500" />
                Achievements
              </h4>
              <div className="flex flex-wrap gap-2">
                {metrics.achievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    className={`px-3 py-2 rounded-full border text-xs font-medium flex items-center gap-1.5
                      ${getColorClasses(achievement.color)}`}
                  >
                    <span>{achievement.icon}</span>
                    {achievement.name}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Next Action */}
        {metrics.nextStage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-lg p-4"
          >
            <h4 className="font-semibold text-white mb-2">Next Step</h4>
            <p className="text-gray-300 text-sm mb-3">{metrics.nextStage.description}</p>
            <Button
              onClick={() => handleStageAction(metrics.nextStage!.id)}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
            >
              {metrics.nextStage.name}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
} 