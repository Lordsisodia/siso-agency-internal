import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  BookOpen, 
  Trophy, 
  Zap, 
  GraduationCap, 
  TrendingUp,
  DollarSign,
  Target,
  Clock,
  Star,
  ChevronRight,
  Plus,
  Activity,
  Award,
  Calendar,
  FileText,
  BarChart3
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PreviewData {
  referrals: {
    total: number;
    pending: number;
    recentActivity: string;
    quickAction: string;
  };
  learning: {
    progress: number;
    newCourses: number;
    nextSession: string;
    currentStreak: number;
  };
  leaderboard: {
    currentRank: number;
    topPerformers: { name: string; score: number }[];
    yourScore: number;
    movement: string;
  };
  planGenerator: {
    plansGenerated: number;
    recentPlan: string;
    totalSaved: number;
    quickGenerate: boolean;
  };
  training: {
    upcomingSessions: number;
    completedCourses: number;
    nextWebinar: string;
    skillProgress: number;
  };
  pipeline: {
    activeOpportunities: number;
    pipelineValue: number;
    conversionRate: number;
    nextFollowUp: string;
  };
}

interface PreviewSectionsDashboardProps {
  data?: PreviewData;
}

export const PreviewSectionsDashboard: React.FC<PreviewSectionsDashboardProps> = ({
  data = {
    referrals: {
      total: 24,
      pending: 6,
      recentActivity: "ABC Corp contacted",
      quickAction: "Submit New Referral"
    },
    learning: {
      progress: 68,
      newCourses: 3,
      nextSession: "Advanced Sales Techniques",
      currentStreak: 7
    },
    leaderboard: {
      currentRank: 8,
      topPerformers: [
        { name: "Sarah J.", score: 12450 },
        { name: "Mike C.", score: 10200 },
        { name: "Emma D.", score: 8900 }
      ],
      yourScore: 6250,
      movement: "+2 positions"
    },
    planGenerator: {
      plansGenerated: 15,
      recentPlan: "E-commerce Mobile App",
      totalSaved: 12,
      quickGenerate: true
    },
    training: {
      upcomingSessions: 2,
      completedCourses: 8,
      nextWebinar: "Partnership Success Stories",
      skillProgress: 75
    },
    pipeline: {
      activeOpportunities: 12,
      pipelineValue: 45600,
      conversionRate: 32,
      nextFollowUp: "TechStart LLC - Tomorrow"
    }
  }
}) => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { duration: 0.5 }
    }
  };

  const previewCards = [
    {
      id: 'referrals',
      title: 'Referrals Management',
      icon: Users,
      iconColor: 'text-blue-400',
      bgGradient: 'from-blue-500/10 to-blue-600/5',
      borderColor: 'border-blue-500/20',
      path: '/partner/referrals',
      stats: [
        { label: 'Total Referrals', value: data.referrals.total, icon: Users },
        { label: 'Pending Review', value: data.referrals.pending, icon: Clock },
      ],
      recentActivity: data.referrals.recentActivity,
      quickAction: data.referrals.quickAction
    },
    {
      id: 'learning',
      title: 'Learning Hub',
      icon: BookOpen,
      iconColor: 'text-green-400',
      bgGradient: 'from-green-500/10 to-green-600/5',
      borderColor: 'border-green-500/20',
      path: '/partner/training-hub',
      stats: [
        { label: 'Progress', value: `${data.learning.progress}%`, icon: TrendingUp },
        { label: 'New Courses', value: data.learning.newCourses, icon: Plus },
      ],
      recentActivity: `Next: ${data.learning.nextSession}`,
      quickAction: `${data.learning.currentStreak} day streak!`,
      progress: data.learning.progress
    },
    {
      id: 'leaderboard',
      title: 'Leaderboard',
      icon: Trophy,
      iconColor: 'text-yellow-400',
      bgGradient: 'from-yellow-500/10 to-yellow-600/5',
      borderColor: 'border-yellow-500/20',
      path: '/partner/leaderboard',
      stats: [
        { label: 'Your Rank', value: `#${data.leaderboard.currentRank}`, icon: Trophy },
        { label: 'Your Score', value: data.leaderboard.yourScore.toLocaleString(), icon: Star },
      ],
      recentActivity: `Movement: ${data.leaderboard.movement}`,
      quickAction: 'View Full Rankings'
    },
    {
      id: 'plangenerator',
      title: 'Plan Generator',
      icon: Zap,
      iconColor: 'text-purple-400',
      bgGradient: 'from-purple-500/10 to-purple-600/5',
      borderColor: 'border-purple-500/20',
      path: '/partner/app-plan-generator',
      stats: [
        { label: 'Plans Created', value: data.planGenerator.plansGenerated, icon: FileText },
        { label: 'Saved Plans', value: data.planGenerator.totalSaved, icon: Star },
      ],
      recentActivity: `Latest: ${data.planGenerator.recentPlan}`,
      quickAction: 'Generate New Plan'
    },
    {
      id: 'training',
      title: 'Training Hub',
      icon: GraduationCap,
      iconColor: 'text-orange-400',
      bgGradient: 'from-orange-500/10 to-orange-600/5',
      borderColor: 'border-orange-500/20',
      path: '/partner/training-hub',
      stats: [
        { label: 'Completed', value: data.training.completedCourses, icon: Award },
        { label: 'Upcoming', value: data.training.upcomingSessions, icon: Calendar },
      ],
      recentActivity: `Next: ${data.training.nextWebinar}`,
      quickAction: 'Join Training',
      progress: data.training.skillProgress
    },
    {
      id: 'pipeline',
      title: 'Pipeline Tracking',
      icon: BarChart3,
      iconColor: 'text-emerald-400',
      bgGradient: 'from-emerald-500/10 to-emerald-600/5',
      borderColor: 'border-emerald-500/20',
      path: '/partner/pipeline',
      stats: [
        { label: 'Active Deals', value: data.pipeline.activeOpportunities, icon: Activity },
        { label: 'Pipeline Value', value: `$${(data.pipeline.pipelineValue / 1000).toFixed(0)}K`, icon: DollarSign },
      ],
      recentActivity: data.pipeline.nextFollowUp,
      quickAction: `${data.pipeline.conversionRate}% conversion rate`
    }
  ];

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Section Header */}
      <motion.div 
        className="text-center space-y-2"
        variants={cardVariants}
      >
        <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent">
          Your Partnership Dashboard
        </h2>
        <p className="text-gray-400 text-lg">
          Quick previews of all your key partnership activities
        </p>
      </motion.div>

      {/* Preview Cards Grid */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={containerVariants}
      >
        {previewCards.map((card) => (
          <motion.div
            key={card.id}
            variants={cardVariants}
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
            className="group cursor-pointer"
            onClick={() => navigate(card.path)}
          >
            <Card className={`h-full bg-gradient-to-br ${card.bgGradient} border ${card.borderColor} hover:shadow-xl transition-all duration-300 backdrop-blur-sm bg-black/60`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-black/30 border ${card.borderColor}`}>
                      <card.icon className={`h-5 w-5 ${card.iconColor}`} />
                    </div>
                    <CardTitle className="text-white text-lg font-semibold group-hover:text-orange-300 transition-colors">
                      {card.title}
                    </CardTitle>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-orange-400 transition-colors" />
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Stats Row */}
                <div className="grid grid-cols-2 gap-3">
                  {card.stats.map((stat, index) => (
                    <div key={index} className="text-center p-3 rounded-lg bg-black/30 border border-gray-700/30">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <stat.icon className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-400">{stat.label}</span>
                      </div>
                      <p className="text-lg font-bold text-white">{stat.value}</p>
                    </div>
                  ))}
                </div>

                {/* Progress Bar (if applicable) */}
                {card.progress && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Progress</span>
                      <span className="text-white font-medium">{card.progress}%</span>
                    </div>
                    <Progress value={card.progress} className="h-2" />
                  </div>
                )}

                {/* Recent Activity */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Activity className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-gray-400">Recent Activity</span>
                  </div>
                  <p className="text-sm text-white bg-black/30 p-2 rounded border border-gray-700/30">
                    {card.recentActivity}
                  </p>
                </div>

                {/* Quick Action */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className={`w-full border ${card.borderColor} hover:bg-white/10 text-white`}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(card.path);
                  }}
                >
                  {card.quickAction}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Summary Stats Bar */}
      <motion.div
        variants={cardVariants}
        className="mt-8"
      >
        <Card className="p-6 bg-gradient-to-r from-gray-900/50 to-gray-800/50 border-gray-700/50">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-2">
              <Target className="h-6 w-6 text-blue-400 mx-auto" />
              <p className="text-2xl font-bold text-white">{data.referrals.total}</p>
              <p className="text-sm text-gray-400">Total Referrals</p>
            </div>
            <div className="space-y-2">
              <BookOpen className="h-6 w-6 text-green-400 mx-auto" />
              <p className="text-2xl font-bold text-white">{data.learning.progress}%</p>
              <p className="text-sm text-gray-400">Learning Progress</p>
            </div>
            <div className="space-y-2">
              <Trophy className="h-6 w-6 text-yellow-400 mx-auto" />
              <p className="text-2xl font-bold text-white">#{data.leaderboard.currentRank}</p>
              <p className="text-sm text-gray-400">Current Rank</p>
            </div>
            <div className="space-y-2">
              <DollarSign className="h-6 w-6 text-emerald-400 mx-auto" />
              <p className="text-2xl font-bold text-white">${(data.pipeline.pipelineValue / 1000).toFixed(0)}K</p>
              <p className="text-sm text-gray-400">Pipeline Value</p>
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
};