import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, 
  Rocket, 
  Users, 
  DollarSign, 
  Trophy,
  TrendingUp,
  Target,
  Star,
  Zap,
  Crown,
  ChevronRight,
  Calendar,
  Award
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProgramStats {
  totalPartners: number;
  totalCommissions: number;
  monthlyGrowth: number;
  activeReferrals: number;
  topPartnerEarnings: number;
  programLaunchDate: Date;
}

interface FutureIsHereHeroProps {
  stats?: ProgramStats;
}

export const FutureIsHereHero: React.FC<FutureIsHereHeroProps> = ({
  stats = {
    totalPartners: 156,
    totalCommissions: 125320,
    monthlyGrowth: 23.5,
    activeReferrals: 342,
    topPartnerEarnings: 12450,
    programLaunchDate: new Date('2024-01-01')
  }
}) => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const floatingVariants = {
    floating: {
      y: [-10, 10, -10],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const pulseVariants = {
    pulse: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const daysSinceLaunch = Math.floor(
    (new Date().getTime() - stats.programLaunchDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const milestones = [
    { 
      icon: Users, 
      label: "Partners Joined", 
      value: stats.totalPartners, 
      color: "text-blue-400",
      bgColor: "bg-blue-500/20",
      borderColor: "border-blue-500/30"
    },
    { 
      icon: DollarSign, 
      label: "Commissions Paid", 
      value: `$${stats.totalCommissions.toLocaleString()}`, 
      color: "text-green-400",
      bgColor: "bg-green-500/20",
      borderColor: "border-green-500/30"
    },
    { 
      icon: TrendingUp, 
      label: "Monthly Growth", 
      value: `${stats.monthlyGrowth}%`, 
      color: "text-orange-400",
      bgColor: "bg-orange-500/20",
      borderColor: "border-orange-500/30"
    },
    { 
      icon: Trophy, 
      label: "Top Earner", 
      value: `$${stats.topPartnerEarnings.toLocaleString()}`, 
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/20",
      borderColor: "border-yellow-500/30"
    }
  ];

  const quickActions = [
    { label: "View Leaderboard", icon: Trophy, path: "/partner/leaderboard", color: "bg-yellow-500" },
    { label: "Submit Referral", icon: Users, path: "/partner/referrals", color: "bg-blue-500" },
    { label: "Generate Plan", icon: Zap, path: "/partner/app-plan-generator", color: "bg-purple-500" },
    { label: "View Statistics", icon: TrendingUp, path: "/partner/statistics", color: "bg-green-500" }
  ];

  return (
    <motion.div
      className="relative overflow-hidden"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-purple-500/5" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(251,146,60,0.1),transparent)] " />
      
      <Card className="relative bg-black/40 backdrop-blur-xl border-orange-500/20 shadow-2xl">
        <div className="p-8 lg:p-12">
          
          {/* Header Section */}
          <motion.div 
            className="text-center mb-12"
            variants={itemVariants}
          >
            {/* Success Badge */}
            <motion.div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 border border-green-500/30 mb-6"
              variants={pulseVariants}
              animate="pulse"
            >
              <Sparkles className="h-4 w-4 text-green-400" />
              <span className="text-green-400 font-medium">PROGRAM LAUNCHED</span>
              <Badge className="bg-green-500 text-white text-xs">
                {daysSinceLaunch} days ago
              </Badge>
            </motion.div>

            {/* Main Headline */}
            <motion.h1 
              className="text-5xl lg:text-7xl font-bold mb-6"
              variants={itemVariants}
            >
              <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-400 bg-clip-text text-transparent">
                The Future
              </span>
              <br />
              <span className="text-white">is Here</span>
              <motion.span 
                className="inline-block ml-4"
                variants={floatingVariants}
                animate="floating"
              >
                <Rocket className="h-16 w-16 text-orange-400" />
              </motion.span>
            </motion.h1>

            <motion.p 
              className="text-xl lg:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
              variants={itemVariants}
            >
              Our partnership program is <span className="text-orange-400 font-semibold">live and thriving!</span> 
              {" "}Join {stats.totalPartners}+ partners earning commissions, 
              growing their networks, and building the future together.
            </motion.p>
          </motion.div>

          {/* Stats Grid */}
          <motion.div 
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-12"
            variants={itemVariants}
          >
            {milestones.map((milestone, index) => (
              <motion.div
                key={milestone.label}
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                className="group cursor-pointer"
              >
                <Card className={`p-6 bg-black/60 backdrop-blur-sm border ${milestone.borderColor} ${milestone.bgColor} hover:shadow-lg transition-all duration-300`}>
                  <div className="text-center space-y-3">
                    <motion.div 
                      className={`inline-flex p-3 rounded-full ${milestone.bgColor} border ${milestone.borderColor}`}
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      <milestone.icon className={`h-6 w-6 ${milestone.color}`} />
                    </motion.div>
                    <div>
                      <p className={`text-2xl lg:text-3xl font-bold ${milestone.color}`}>
                        {milestone.value}
                      </p>
                      <p className="text-sm text-gray-400 font-medium">
                        {milestone.label}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Achievement Banner */}
          <motion.div 
            className="mb-12"
            variants={itemVariants}
          >
            <Card className="p-6 bg-gradient-to-r from-purple-900/30 to-orange-900/30 border-purple-500/30">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <motion.div 
                    className="p-3 rounded-full bg-purple-500/20 border border-purple-500/30"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Crown className="h-8 w-8 text-purple-400" />
                  </motion.div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      Partnership Program Milestones
                    </h3>
                    <p className="text-gray-400">
                      Celebrating {daysSinceLaunch} days of growth and success
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                    <Star className="h-3 w-3 mr-1" />
                    Top 1% Growth
                  </Badge>
                  <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                    <Award className="h-3 w-3 mr-1" />
                    Industry Leading
                  </Badge>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div 
            className="text-center"
            variants={itemVariants}
          >
            <h3 className="text-2xl font-bold text-white mb-6">
              Ready to Take Action?
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <motion.div
                  key={action.label}
                  variants={itemVariants}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={() => navigate(action.path)}
                    className={`w-full h-auto py-4 px-6 ${action.color} hover:opacity-90 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <action.icon className="h-6 w-6" />
                      <span className="text-sm font-medium">
                        {action.label}
                      </span>
                    </div>
                  </Button>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Call to Action */}
          <motion.div 
            className="text-center mt-12 pt-8 border-t border-gray-700/50"
            variants={itemVariants}
          >
            <Button
              onClick={() => navigate('/partner/referrals')}
              size="lg"
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-4 px-8 text-lg shadow-2xl hover:shadow-orange-500/25 transition-all duration-300"
            >
              <span>Start Your Partnership Journey</span>
              <ChevronRight className="h-5 w-5 ml-2" />
            </Button>
            <p className="text-gray-400 mt-4">
              Join the movement. Build the future. Earn rewards.
            </p>
          </motion.div>
        </div>
      </Card>
    </motion.div>
  );
};