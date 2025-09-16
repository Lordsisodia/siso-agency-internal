import React from 'react';
import { motion } from 'framer-motion';
import { 
  GraduationCap,
  Star,
  CheckCircle,
  Play,
  Clock,
  ExternalLink,
  Target,
  Zap,
  Users,
  BookOpen,
  Calendar,
  Download
} from 'lucide-react';
import { Card, CardContent } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Progress } from '@/shared/ui/progress';

const TrainingHub: React.FC = () => {
  const courseCategories = [
    {
      name: 'Sales & Marketing',
      icon: Target,
      color: 'orange',
      courseCount: 8
    },
    {
      name: 'Technical Skills',
      icon: Zap,
      color: 'blue',
      courseCount: 12
    },
    {
      name: 'Client Relations',
      icon: Users,
      color: 'purple',
      courseCount: 5
    },
    {
      name: 'Tools & Resources',
      icon: BookOpen,
      color: 'cyan',
      courseCount: 15
    }
  ];

  const learningModules = [
    {
      name: 'Referral Strategies',
      status: 'completed',
      icon: CheckCircle,
      iconColor: 'text-green-400',
      textColor: 'text-green-300',
      badge: '✅'
    },
    {
      name: 'Client Communication',
      status: 'in-progress',
      icon: Play,
      iconColor: 'text-orange-400',
      textColor: 'text-orange-300',
      badge: '📚'
    },
    {
      name: 'Closing Techniques',
      status: 'locked',
      icon: Clock,
      iconColor: 'text-gray-400',
      textColor: 'text-gray-400',
      badge: '🔒'
    }
  ];

  const learningStats = [
    {
      value: '12',
      label: 'Completed',
      color: 'green'
    },
    {
      value: '48',
      label: 'Hours',
      color: 'orange'
    },
    {
      value: '3',
      label: 'Certificates',
      color: 'purple'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.7 }}
      className="row-5a"
    >
      <Card className="bg-black/60 backdrop-blur-xl border-green-500/20 shadow-2xl hover:border-green-500/40 transition-all overflow-hidden">
        <div className="relative">
          {/* Hero Image Header */}
          <div className="relative h-32 bg-gradient-to-br from-green-600/30 via-emerald-500/20 to-teal-500/30 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,197,94,0.3),transparent_50%)]"></div>
            <div className="absolute top-4 right-4">
              <Badge className="bg-green-500/30 text-green-300 border-green-500/40 backdrop-blur-sm">
                🎓 Learning Hub
              </Badge>
            </div>
            <div className="absolute bottom-4 left-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-green-500/20 backdrop-blur-sm border border-green-500/30">
                  <GraduationCap className="h-5 w-5 text-green-300" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Training & Development</h3>
                  <p className="text-sm text-green-200">Partner Success Mastery</p>
                </div>
              </div>
            </div>
          </div>

          <CardContent className="p-6 space-y-4">
            {/* Featured Learning Path Preview */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-400" />
                  <span className="text-sm font-medium text-yellow-400">Recommended Path</span>
                </div>
                <span className="text-xs text-gray-400">60% Complete</span>
              </div>
              
              <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg p-3">
                <h4 className="text-white font-medium mb-2">🚀 Partner Success Mastery</h4>
                <div className="space-y-2">
                  {learningModules.map((module, index) => {
                    const Icon = module.icon;
                    return (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <Icon className={`h-3 w-3 ${module.iconColor}`} />
                        <span className={module.textColor}>{module.name}</span>
                        <Badge className={`bg-${module.status === 'completed' ? 'green' : module.status === 'in-progress' ? 'orange' : 'gray'}-500/20 text-${module.status === 'completed' ? 'green' : module.status === 'in-progress' ? 'orange' : 'gray'}-400 text-xs ml-auto`}>
                          {module.badge}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
                <Progress value={60} className="h-2 mt-3" />
              </div>
            </div>

            {/* Course Categories Preview */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-300">Course Categories</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.location.href = '/partner/training-hub'}
                  className="text-green-400 hover:bg-green-500/10 h-6 px-2"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  View All
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                {courseCategories.map((category, index) => {
                  const Icon = category.icon;
                  return (
                    <div 
                      key={index}
                      className={`p-3 bg-${category.color}-500/10 border border-${category.color}-500/20 rounded-lg hover:bg-${category.color}-500/20 transition-colors cursor-pointer group`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className={`h-4 w-4 text-${category.color}-400`} />
                        <span className={`text-sm font-medium text-white group-hover:text-${category.color}-100`}>
                          {category.name}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400">{category.courseCount} courses</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Learning Stats */}
            <div className="grid grid-cols-3 gap-3">
              {learningStats.map((stat, index) => (
                <div 
                  key={index}
                  className={`text-center p-3 bg-${stat.color}-500/10 border border-${stat.color}-500/20 rounded-lg`}
                >
                  <div className={`text-lg font-bold text-${stat.color}-400`}>{stat.value}</div>
                  <div className="text-xs text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Upcoming Webinar Preview */}
            <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-yellow-400" />
                <span className="text-sm font-medium text-yellow-400">Next Live Session</span>
                <Badge className="bg-red-500/20 text-red-400 text-xs ml-auto">🔴 LIVE</Badge>
              </div>
              <div className="text-sm text-white font-medium">Advanced Referral Strategies</div>
              <div className="text-xs text-gray-400">Jan 28 • 2:00 PM • Sarah Johnson</div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button 
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => window.location.href = '/partner/training-hub'}
              >
                <Play className="h-4 w-4 mr-2" />
                Continue Learning
              </Button>
              <Button 
                variant="outline"
                className="border-green-500/30 text-green-400 hover:bg-green-500/10"
                onClick={() => window.location.href = '/partner/training-hub'}
              >
                <Download className="h-4 w-4 mr-2" />
                Resources
              </Button>
            </div>
          </CardContent>
        </div>
      </Card>
    </motion.div>
  );
};

export default TrainingHub;