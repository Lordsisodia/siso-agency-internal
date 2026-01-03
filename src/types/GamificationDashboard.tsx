/**
 * Gamification Dashboard - XP, Badges, Streaks & Achievements
 * Transforms daily productivity into engaging game mechanics
 */

import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Trophy, 
  Star, 
  Flame, 
  TrendingUp, 
  Target,
  Zap,
  Crown,
  Award,
  Calendar,
  BarChart3,
  Plus,
  ChevronRight,
  Medal
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { gamificationService, Achievement, UserProgress } from '@/domains/lifelock/_shared/services/gamificationService';

interface GamificationDashboardProps {
  className?: string;
  compact?: boolean;
}

export const GamificationDashboard: React.FC<GamificationDashboardProps> = ({ 
  className, 
  compact = false 
}) => {
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [showAllAchievements, setShowAllAchievements] = useState(false);
  const [recentXP, setRecentXP] = useState(0);

  // Load user progress
  useEffect(() => {
    const progress = gamificationService.getUserProgress();
    setUserProgress(progress);
  }, []);

  // Award XP for demo purposes
  const awardDemoXP = (activityId: string, points: number = 50) => {
    const awarded = gamificationService.awardXP(activityId);
    setRecentXP(awarded);
    
    // Refresh progress
    const progress = gamificationService.getUserProgress();
    setUserProgress(progress);
    
    // Reset recent XP after animation
    setTimeout(() => setRecentXP(0), 2000);
  };

  const levelInfo = gamificationService.getLevelInfo();
  const personalBests = gamificationService.getPersonalBests();
  const recentAchievements = userProgress?.achievements.filter(a => a.unlocked).slice(-3) || [];
  const inProgressAchievements = userProgress?.achievements.filter(a => !a.unlocked && a.progress > 0).slice(0, 3) || [];

  if (!userProgress) return null;

  // Compact version for mobile
  if (compact) {
    return (
      <Card className={cn("bg-gradient-to-r from-gray-800 to-gray-700 border-gray-600", className)}>
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {levelInfo.level}
                </div>
                {recentXP > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 0 }}
                    animate={{ opacity: 1, y: -20 }}
                    exit={{ opacity: 0 }}
                    className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full"
                  >
                    +{recentXP}
                  </motion.div>
                )}
              </div>
              <div>
                <div className="font-medium text-sm text-white">{userProgress.dailyXP} XP today</div>
                <Progress value={levelInfo.progress} className="mt-1 h-1.5 w-24" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-center">
                <div className="flex items-center gap-1 text-orange-400">
                  <Flame className="h-3.5 w-3.5" />
                  <span className="font-medium text-sm">{userProgress.currentStreak}</span>
                </div>
                <div className="text-xs text-gray-400">streak</div>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-1 text-yellow-400">
                  <Trophy className="h-3.5 w-3.5" />
                  <span className="font-medium text-sm">{recentAchievements.length}</span>
                </div>
                <div className="text-xs text-gray-400">badges</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* XP & Level Section */}
      <Card className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Level & Experience
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg">
                  {levelInfo.level}
                </div>
                <div className="absolute -top-1 -right-1 bg-yellow-400 text-yellow-900 text-xs px-2 py-1 rounded-full font-semibold">
                  LVL
                </div>
                {recentXP > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 0, scale: 0.5 }}
                    animate={{ opacity: 1, y: -30, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute top-0 left-0 bg-green-500 text-white text-sm px-3 py-1 rounded-full shadow-lg"
                  >
                    +{recentXP} XP
                  </motion.div>
                )}
              </div>
              <div>
                <h3 className="text-2xl font-bold">Level {levelInfo.level}</h3>
                <p className="text-gray-600">
                  {levelInfo.currentXP} / {levelInfo.nextLevelXP} XP
                </p>
                <p className="text-sm text-gray-500">
                  {userProgress.dailyXP} XP earned today
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">
                {userProgress.totalXP.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total XP</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress to Level {levelInfo.level + 1}</span>
              <span>{Math.round(levelInfo.progress)}%</span>
            </div>
            <Progress value={levelInfo.progress} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Streak & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Flame className="h-6 w-6 text-orange-500" />
              <span className="text-2xl font-bold">{userProgress.currentStreak}</span>
            </div>
            <p className="text-gray-600">Day Streak</p>
            <p className="text-xs text-gray-500 mt-1">
              Best: {userProgress.bestStreak} days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Trophy className="h-6 w-6 text-yellow-500" />
              <span className="text-2xl font-bold">{recentAchievements.length}</span>
            </div>
            <p className="text-gray-600">Achievements</p>
            <p className="text-xs text-gray-500 mt-1">
              {userProgress.achievements.length - recentAchievements.length} locked
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingUp className="h-6 w-6 text-green-500" />
              <span className="text-2xl font-bold">
                {personalBests.highestDailyXP.value}
              </span>
            </div>
            <p className="text-gray-600">Daily Best</p>
            <p className="text-xs text-gray-500 mt-1">XP in one day</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Achievements */}
      {recentAchievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" />
              Recent Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {recentAchievements.map((achievement) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4 text-center"
                >
                  <div className="text-3xl mb-2">{achievement.badge}</div>
                  <h4 className="font-semibold text-yellow-800">{achievement.name}</h4>
                  <p className="text-sm text-yellow-700">{achievement.description}</p>
                  {achievement.unlockedAt && (
                    <p className="text-xs text-yellow-600 mt-2">
                      Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress Achievements */}
      {inProgressAchievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" />
              In Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {inProgressAchievements.map((achievement) => (
                <div key={achievement.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{achievement.badge}</span>
                      <div>
                        <h4 className="font-semibold">{achievement.name}</h4>
                        <p className="text-sm text-gray-600">{achievement.description}</p>
                      </div>
                    </div>
                    <Badge variant="outline">
                      {achievement.progress}/{achievement.maxProgress}
                    </Badge>
                  </div>
                  <Progress 
                    value={(achievement.progress / achievement.maxProgress) * 100} 
                    className="h-2"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick XP Actions (Demo) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-purple-500" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => awardDemoXP('wake_up_tracked')}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Wake Up (+50)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => awardDemoXP('light_task_complete')}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Light Task (+20)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => awardDemoXP('deep_task_complete')}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Deep Task (+75)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => awardDemoXP('workout_complete')}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Workout (+80)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Challenge */}
      {userProgress.weeklyChallenge && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-500" />
              Weekly Challenge
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">{userProgress.weeklyChallenge.name}</h4>
                  <p className="text-sm text-gray-600">{userProgress.weeklyChallenge.description}</p>
                </div>
                <Badge className="bg-green-100 text-green-800">
                  {userProgress.weeklyChallenge.current}/{userProgress.weeklyChallenge.target}
                </Badge>
              </div>
              <Progress 
                value={(userProgress.weeklyChallenge.current / userProgress.weeklyChallenge.target) * 100} 
                className="h-3"
              />
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  Ends {userProgress.weeklyChallenge.endDate.toLocaleDateString()}
                </span>
                <span className="text-green-600 font-medium">
                  Reward: {userProgress.weeklyChallenge.reward}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};