import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  GraduationCap,
  BookOpen,
  Video,
  Play,
  Clock,
  CheckCircle2,
  Star,
  ArrowRight,
  ExternalLink,
  TrendingUp,
  Target,
  Users,
  Award,
  Calendar,
  ChevronRight,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrainingHubShowcaseProps {
  onNavigateToTrainingHub?: () => void;
}

interface VideoContent {
  id: string;
  title: string;
  instructor: string;
  duration: number;
  thumbnail: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  progress?: number;
  isNew?: boolean;
}

interface LearningModule {
  id: string;
  name: string;
  progress: number;
  status: 'completed' | 'in-progress' | 'not-started';
  estimatedTime: number;
}

const featuredVideos: VideoContent[] = [
  {
    id: '1',
    title: 'Advanced Referral Strategies',
    instructor: 'Sarah Johnson',
    duration: 18,
    thumbnail: '🎯',
    category: 'Sales',
    difficulty: 'intermediate',
    progress: 65,
    isNew: false
  },
  {
    id: '2',
    title: 'App Development Fundamentals',
    instructor: 'Mike Chen',
    duration: 24,
    thumbnail: '⚡',
    category: 'Technical',
    difficulty: 'beginner',
    isNew: true
  },
  {
    id: '3',
    title: 'Client Communication Mastery',
    instructor: 'Emma Davis',
    duration: 15,
    thumbnail: '💬',
    category: 'Business',
    difficulty: 'advanced',
    progress: 0
  }
];

const learningModules: LearningModule[] = [
  { id: '1', name: 'Sales Fundamentals', progress: 100, status: 'completed', estimatedTime: 45 },
  { id: '2', name: 'Technical Basics', progress: 75, status: 'in-progress', estimatedTime: 60 },
  { id: '3', name: 'Partnership Strategy', progress: 0, status: 'not-started', estimatedTime: 30 },
  { id: '4', name: 'Client Relations', progress: 0, status: 'not-started', estimatedTime: 40 }
];

const learningStats = {
  completedCourses: 12,
  totalHours: 48,
  currentStreak: 5,
  skillLevel: 'Advanced'
};

export const TrainingHubShowcase: React.FC<TrainingHubShowcaseProps> = ({ 
  onNavigateToTrainingHub 
}) => {
  const [selectedVideo, setSelectedVideo] = useState<VideoContent | null>(null);
  const [currentTab, setCurrentTab] = useState<'videos' | 'modules'>('videos');

  const handleNavigateToTrainingHub = () => {
    if (onNavigateToTrainingHub) {
      onNavigateToTrainingHub();
    } else {
      window.location.href = '/partner/training-hub';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'intermediate': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'advanced': return 'text-red-400 bg-red-500/20 border-red-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle2;
      case 'in-progress': return Play;
      default: return Clock;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'in-progress': return 'text-orange-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
    >
      <Card className="bg-black/60 backdrop-blur-xl border-orange-500/20 shadow-2xl">
        <CardContent className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Training Hub</h3>
                <p className="text-sm text-gray-400">Continue your learning journey</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNavigateToTrainingHub}
              className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View All
            </Button>
          </div>

          {/* Learning Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gray-900/50 border border-orange-500/20 rounded-lg">
              <div className="text-lg font-bold text-white">{learningStats.completedCourses}</div>
              <div className="text-xs text-gray-400">Courses</div>
            </div>
            <div className="text-center p-3 bg-gray-900/50 border border-orange-500/20 rounded-lg">
              <div className="text-lg font-bold text-white">{learningStats.totalHours}h</div>
              <div className="text-xs text-gray-400">Learned</div>
            </div>
            <div className="text-center p-3 bg-gray-900/50 border border-orange-500/20 rounded-lg">
              <div className="text-lg font-bold text-orange-400">{learningStats.currentStreak}</div>
              <div className="text-xs text-gray-400">Day Streak</div>
            </div>
            <div className="text-center p-3 bg-gray-900/50 border border-orange-500/20 rounded-lg">
              <div className="text-lg font-bold text-green-400">
                <Award className="h-4 w-4 mx-auto" />
              </div>
              <div className="text-xs text-gray-400">{learningStats.skillLevel}</div>
            </div>
          </div>

          {/* Content Tabs */}
          <div className="space-y-4">
            <div className="flex items-center space-x-1 bg-gray-900/50 p-1 rounded-lg">
              <Button
                variant={currentTab === 'videos' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setCurrentTab('videos')}
                className={cn(
                  "flex-1 h-8 text-xs",
                  currentTab === 'videos' 
                    ? "bg-orange-600 text-white" 
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                )}
              >
                <Video className="h-3 w-3 mr-1" />
                Watch Next
              </Button>
              <Button
                variant={currentTab === 'modules' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setCurrentTab('modules')}
                className={cn(
                  "flex-1 h-8 text-xs",
                  currentTab === 'modules' 
                    ? "bg-orange-600 text-white" 
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                )}
              >
                <BookOpen className="h-3 w-3 mr-1" />
                Modules
              </Button>
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
              {currentTab === 'videos' ? (
                <motion.div
                  key="videos"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-3"
                >
                  {featuredVideos.slice(0, 3).map((video, index) => (
                    <div
                      key={video.id}
                      className="flex items-center gap-3 p-3 bg-gray-900/30 border border-gray-700/30 rounded-lg hover:border-orange-500/30 transition-all cursor-pointer group"
                      onClick={() => setSelectedVideo(video)}
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-500/20 to-amber-500/20 rounded-lg flex items-center justify-center text-lg flex-shrink-0">
                        {video.thumbnail}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-medium text-white truncate group-hover:text-orange-300">
                            {video.title}
                          </h4>
                          {video.isNew && (
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                              New
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-3 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {video.instructor}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {video.duration}m
                          </span>
                          <Badge className={cn("text-xs", getDifficultyColor(video.difficulty))}>
                            {video.difficulty}
                          </Badge>
                        </div>
                        
                        {video.progress !== undefined && video.progress > 0 && (
                          <div className="mt-2">
                            <Progress value={video.progress} className="h-1" />
                            <span className="text-xs text-gray-500 mt-1">{video.progress}% complete</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="w-8 h-8 bg-orange-600/20 rounded-lg flex items-center justify-center group-hover:bg-orange-600/30 transition-colors">
                          <Play className="h-4 w-4 text-orange-400" />
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-500 group-hover:text-orange-400 transition-colors" />
                      </div>
                    </div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="modules"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-3"
                >
                  {learningModules.slice(0, 4).map((module, index) => {
                    const StatusIcon = getStatusIcon(module.status);
                    return (
                      <div
                        key={module.id}
                        className="flex items-center gap-3 p-3 bg-gray-900/30 border border-gray-700/30 rounded-lg hover:border-orange-500/30 transition-all cursor-pointer group"
                      >
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                          module.status === 'completed' ? 'bg-green-500/20' :
                          module.status === 'in-progress' ? 'bg-orange-500/20' :
                          'bg-gray-500/20'
                        )}>
                          {React.createElement(StatusIcon, { 
                            className: cn("h-4 w-4", getStatusColor(module.status))
                          })}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="text-sm font-medium text-white group-hover:text-orange-300">
                              {module.name}
                            </h4>
                            <span className="text-xs text-gray-400">{module.estimatedTime}m</span>
                          </div>
                          
                          {module.status !== 'not-started' && (
                            <div className="space-y-1">
                              <Progress value={module.progress} className="h-1" />
                              <span className="text-xs text-gray-500">{module.progress}% complete</span>
                            </div>
                          )}
                        </div>
                        
                        <ChevronRight className="h-4 w-4 text-gray-500 group-hover:text-orange-400 transition-colors flex-shrink-0" />
                      </div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Featured Learning Path */}
          <div className="p-4 bg-gradient-to-r from-orange-600/10 to-amber-600/10 border border-orange-500/20 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-orange-400" />
                <span className="text-sm font-medium text-white">Featured: Partner Success Path</span>
              </div>
              <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs">
                60% Complete
              </Badge>
            </div>
            <p className="text-xs text-gray-400 mb-3">
              Complete learning path for becoming a successful SISO partner
            </p>
            <div className="flex items-center justify-between">
              <Progress value={60} className="flex-1 h-2" />
              <Button
                size="sm"
                onClick={handleNavigateToTrainingHub}
                className="ml-3 bg-orange-600 hover:bg-orange-700 text-white text-xs h-8"
              >
                Continue
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleNavigateToTrainingHub}
              className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10 text-xs h-9"
            >
              <Calendar className="h-3 w-3 mr-1" />
              Join Webinar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNavigateToTrainingHub}
              className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10 text-xs h-9"
            >
              <TrendingUp className="h-3 w-3 mr-1" />
              View Progress
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};