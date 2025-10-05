/**
 * Smart Dashboard Greeting Card - Personalization Engine
 * 
 * An intelligent greeting card that adapts to context, performance, weather, and achievements.
 * Features dynamic messages, contextual insights, and personalized experiences.
 */

import { motion } from 'framer-motion';
import { useDayPeriod } from '@/hooks/useDayPeriod';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Award, 
  Target, 
  Zap, 
  Star,
  CloudRain,
  Sun,
  Trophy,
  DollarSign,
  Users,
  Brain,
  Rocket,
  Calendar,
  Clock,
  Moon,
  Sunrise,
  Sunset,
  Activity,
  Sparkles,
  Crown,
  Flame
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface SmartGreetingData {
  recentEarnings: number;
  weeklyGrowth: number;
  daysToGoal: number;
  weatherCondition: 'sunny' | 'rainy' | 'cloudy';
  location: string;
  recentAchievement?: string;
  streakCount?: number;
  leaderboardPosition?: number;
}

interface PageContext {
  pageType: string;
  keyMetrics?: {
    primary: { value: string; label: string; trend?: string };
    secondary?: { value: string; label: string };
  };
  suggestions?: string[];
  urgentItems?: number;
}

interface DashboardGreetingCardProps {
  userName?: string;
  welcomeMessage?: string;
  pageTitle?: string;
  pageSubtitle?: string;
  className?: string;
  showDate?: boolean;
  pageContext?: PageContext;
}

// Mock data generator for smart personalization
const generateSmartData = (): SmartGreetingData => ({
  recentEarnings: Math.floor(Math.random() * 500) + 150,
  weeklyGrowth: Math.floor(Math.random() * 40) + 5,
  daysToGoal: Math.floor(Math.random() * 10) + 1,
  weatherCondition: ['sunny', 'rainy', 'cloudy'][Math.floor(Math.random() * 3)] as any,
  location: 'London',
  recentAchievement: ['Top 10 Leaderboard', '5-Day Streak', '£1K Milestone', 'Rising Star', 'Weekly Champion', 'Conversion Pro'][Math.floor(Math.random() * 6)],
  streakCount: Math.floor(Math.random() * 8) + 1,
  leaderboardPosition: Math.floor(Math.random() * 50) + 1
});

// Smart greeting generator based on context
const generateContextualGreeting = (
  pageContext: PageContext, 
  smartData: SmartGreetingData, 
  timeGreeting: string
): {
  greeting: string;
  subMessage: string;
  insight: string;
  weatherMessage?: string;
  timeIcon: any;
  performanceIcon: any;
  pageIcon: any;
} => {
  const { pageType, keyMetrics, urgentItems } = pageContext;
  const { recentEarnings, weeklyGrowth, daysToGoal, weatherCondition, location, recentAchievement, streakCount, leaderboardPosition } = smartData;

  // Time-based icons
  const hour = new Date().getHours();
  const timeIcon = hour >= 6 && hour < 12 ? Sunrise : 
                   hour >= 12 && hour < 18 ? Sun : 
                   hour >= 18 && hour < 22 ? Sunset : Moon;

  // Performance-based icons
  const performanceIcon = weeklyGrowth > 20 ? Flame : 
                         weeklyGrowth > 10 ? TrendingUp : 
                         Activity;

  // Page-specific icons
  const pageIcons = {
    dashboard: Rocket,
    clients: Users,
    referrals: Target,
    training: Brain,
    support: Sparkles,
    leaderboard: Crown,
    'app-plan-generator': Star,
    education: Award
  };
  const pageIcon = pageIcons[pageType] || Rocket;

  // Weather integration
  const weatherMessages = {
    rainy: `☔ Rainy day in ${location}? Perfect time to focus indoors!`,
    sunny: `☀️ Beautiful day in ${location}! Great energy for crushing goals!`,
    cloudy: `⛅ Cloudy but clear-minded in ${location}!`
  };

  switch (pageType) {
    case 'dashboard':
      return {
        greeting: `${timeGreeting}, ubahcrypto! 🚀`,
        subMessage: `Partnership Dashboard`,
        insight: `Your performance is trending up ${weeklyGrowth}% this week!`,
        weatherMessage: weatherMessages[weatherCondition],
        timeIcon,
        performanceIcon,
        pageIcon
      };

    case 'clients':
      return {
        greeting: `${timeGreeting}, ubahcrypto! 💼`,
        subMessage: `Client Management`,
        insight: `${keyMetrics?.primary.value || '12'} active clients generating steady revenue`,
        weatherMessage: weatherMessages[weatherCondition],
        timeIcon,
        performanceIcon,
        pageIcon
      };

    case 'referrals':
      return {
        greeting: `${timeGreeting}, ubahcrypto! 🏆`,
        subMessage: `Referral Management`,
        insight: `Pipeline value: ${keyMetrics?.primary.value || '£5,750'} with ${weeklyGrowth}% growth`,
        weatherMessage: weatherMessages[weatherCondition],
        timeIcon,
        performanceIcon,
        pageIcon
      };

    case 'training':
      return {
        greeting: `${timeGreeting}, ubahcrypto! 🧠`,
        subMessage: `Training Hub`,
        insight: `${keyMetrics?.primary.value || '67%'} course completion - you're excelling!`,
        weatherMessage: weatherMessages[weatherCondition],
        timeIcon,
        performanceIcon,
        pageIcon
      };

    case 'support':
      return {
        greeting: `${timeGreeting}, ubahcrypto! 🛟`,
        subMessage: `Support Center`,
        insight: `Average response time: <2 minutes with 98% satisfaction`,
        weatherMessage: weatherMessages[weatherCondition],
        timeIcon,
        performanceIcon,
        pageIcon
      };

    case 'leaderboard':
      return {
        greeting: `${timeGreeting}, ubahcrypto! 🏆`,
        subMessage: `Affiliate Leaderboard`,
        insight: `Currently ranked #${leaderboardPosition} - up 5 positions this week!`,
        weatherMessage: weatherMessages[weatherCondition],
        timeIcon,
        performanceIcon,
        pageIcon
      };

    case 'app-plan-generator':
      return {
        greeting: `${timeGreeting}, ubahcrypto! 🚀`,
        subMessage: `App Plan Generator`,
        insight: `Your app plans have helped close ${Math.floor(Math.random() * 8) + 3} deals this month`,
        weatherMessage: weatherMessages[weatherCondition],
        timeIcon,
        performanceIcon,
        pageIcon
      };

    case 'education':
      return {
        greeting: `${timeGreeting}, ubahcrypto! 🎓`,
        subMessage: `Education Center`,
        insight: `${keyMetrics?.primary.value || '87%'} overall progress - you're nearly certified!`,
        weatherMessage: weatherMessages[weatherCondition],
        timeIcon,
        performanceIcon,
        pageIcon
      };

    default:
      return {
        greeting: `${timeGreeting}, ubahcrypto! ✨`,
        subMessage: `Partnership Dashboard`,
        insight: `You're performing ${weeklyGrowth}% above average this week`,
        weatherMessage: weatherMessages[weatherCondition],
        timeIcon,
        performanceIcon,
        pageIcon
      };
  }
};

export function DashboardGreetingCard({ 
  userName, 
  welcomeMessage,
  pageTitle,
  pageSubtitle,
  className = "",
  showDate = true,
  pageContext = { pageType: 'dashboard' }
}: DashboardGreetingCardProps) {
  const { period, greeting, icon: PeriodIcon, gradientClass } = useDayPeriod();
  const [smartData, setSmartData] = useState<SmartGreetingData>();
  const [contextualContent, setContextualContent] = useState<any>();

  useEffect(() => {
    const data = generateSmartData();
    setSmartData(data);
    
    const content = generateContextualGreeting(pageContext, data, greeting);
    setContextualContent(content);
  }, [greeting, pageContext]);

  if (!smartData || !contextualContent) {
    return null; // Loading state
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className={`relative border-0 bg-gradient-to-r ${gradientClass} backdrop-blur-sm shadow-xl mb-6 overflow-hidden ${className}`}>
        <div className="absolute inset-0 bg-grid-white/5" />
        
        {/* Enhanced floating particles effect with sparkles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className={`absolute ${i % 2 === 0 ? 'w-2 h-2' : 'w-1 h-1'} ${
                i % 3 === 0 ? 'bg-yellow-400/30' : 'bg-white/20'
              } rounded-full`}
              initial={{ 
                x: Math.random() * 400, 
                y: Math.random() * 200,
                opacity: 0.3,
                scale: 0.5
              }}
              animate={{ 
                y: [0, -30, 0],
                opacity: [0.3, 0.8, 0.3],
                scale: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 4 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 3
              }}
            />
          ))}
          
          {/* Sparkle effects for achievements */}
          {smartData?.recentAchievement && [...Array(3)].map((_, i) => (
            <motion.div
              key={`sparkle-${i}`}
              className="absolute"
              style={{
                right: Math.random() * 100 + 50,
                top: Math.random() * 50 + 50,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0],
                rotate: [0, 180, 360]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.5,
                repeatDelay: 3
              }}
            >
              <Sparkles className="h-3 w-3 text-yellow-300" />
            </motion.div>
          ))}
        </div>

        <CardContent className="p-4 lg:p-5 relative z-10">
          <div className="flex items-center justify-between">
            {/* Left Side - Main Content */}
            <div className="flex items-center space-x-4">
              {/* Time Icon */}
              <motion.div
                className="flex items-center justify-center w-12 h-12 bg-white/10 rounded-xl backdrop-blur-sm"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 400, damping: 17 }}
              >
                <contextualContent.timeIcon className="h-6 w-6 text-white/90" />
              </motion.div>

              {/* Text Content */}
              <div className="space-y-0.5">
                {/* Main Greeting */}
                <motion.h1 
                  className="text-xl lg:text-2xl font-bold text-white leading-tight"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {greeting}, ubahcrypto! 🚀
                </motion.h1>
                
                {/* Dynamic Page Title */}
                <motion.p 
                  className="text-white/80 text-base font-medium leading-tight"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {pageTitle || contextualContent.subMessage}
                </motion.p>
              </div>
            </div>

            {/* Right Side - Date */}
            {showDate && (
              <motion.div 
                className="bg-white/10 rounded-xl px-4 py-2 text-white/90 backdrop-blur-sm"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
              >
                <div className="text-center">
                  <div className="text-base font-semibold leading-tight">
                    {new Date().toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </div>
                  <div className="text-sm text-white/70">
                    {new Date().toLocaleTimeString('en-US', { 
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}