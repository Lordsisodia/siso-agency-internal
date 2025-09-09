import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { format } from 'date-fns';
import { 
  TrendingUp, 
  Target, 
  Flame, 
  Trophy, 
  Calendar,
  Clock,
  CheckCircle,
  BarChart3
} from 'lucide-react';

interface StatsViewProps {
  currentDate: Date;
}

export function StatsView({ currentDate }: StatsViewProps) {
  // Mock data - in real app this would come from your services
  const stats = {
    dailyXP: 850,
    weeklyXP: 5240,
    level: 7,
    currentStreak: 12,
    longestStreak: 28,
    totalTasks: 156,
    completedTasks: 142,
    completionRate: 91,
    averageDaily: 8.2,
    badges: 15,
    weeklyProgress: [
      { day: 'Mon', completed: 8, total: 9 },
      { day: 'Tue', completed: 7, total: 8 },
      { day: 'Wed', completed: 9, total: 10 },
      { day: 'Thu', completed: 6, total: 8 },
      { day: 'Fri', completed: 8, total: 9 },
      { day: 'Sat', completed: 5, total: 6 },
      { day: 'Sun', completed: 7, total: 8 }
    ]
  };

  const achievements = [
    { title: 'Early Bird', description: '7-day morning routine streak', icon: '🌅', unlocked: true },
    { title: 'Focus Master', description: 'Complete 10 deep work sessions', icon: '🧠', unlocked: true },
    { title: 'Consistency King', description: '30-day task completion streak', icon: '👑', unlocked: false },
    { title: 'Fitness Fanatic', description: 'Complete 20 workouts', icon: '💪', unlocked: true },
  ];

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="text-center py-4">
        <h2 className="text-2xl font-bold text-white mb-2">Statistics & Progress</h2>
        <p className="text-gray-400">{format(currentDate, 'EEEE, MMMM d, yyyy')}</p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                <Target className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <div className="text-white font-semibold text-lg">{stats.dailyXP}</div>
                <div className="text-gray-400 text-xs">Daily XP</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center">
                <Flame className="h-5 w-5 text-orange-400" />
              </div>
              <div>
                <div className="text-white font-semibold text-lg">{stats.currentStreak}</div>
                <div className="text-gray-400 text-xs">Day Streak</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <div className="text-white font-semibold text-lg">{stats.completionRate}%</div>
                <div className="text-gray-400 text-xs">Completion</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center">
                <Trophy className="h-5 w-5 text-yellow-400" />
              </div>
              <div>
                <div className="text-white font-semibold text-lg">{stats.badges}</div>
                <div className="text-gray-400 text-xs">Badges</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Progress Chart */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <BarChart3 className="h-5 w-5" />
            Weekly Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex items-end justify-between gap-2 h-32">
            {stats.weeklyProgress.map((day, index) => {
              const percentage = (day.completed / day.total) * 100;
              return (
                <div key={index} className="flex flex-col items-center gap-2 flex-1">
                  <div className="relative w-full bg-gray-700 rounded-t h-20">
                    <div 
                      className="absolute bottom-0 w-full bg-gradient-to-t from-blue-500 to-purple-500 rounded-t transition-all duration-300"
                      style={{ height: `${percentage}%` }}
                    />
                  </div>
                  <div className="text-center">
                    <div className="text-white text-xs font-medium">{day.day}</div>
                    <div className="text-gray-400 text-xs">{day.completed}/{day.total}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Trophy className="h-5 w-5" />
            Recent Achievements
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-3">
            {achievements.map((achievement, index) => (
              <div 
                key={index}
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  achievement.unlocked 
                    ? 'bg-yellow-500/10 border-yellow-500/30' 
                    : 'bg-gray-700/30 border-gray-600'
                }`}
              >
                <div className="text-2xl">{achievement.icon}</div>
                <div className="flex-1">
                  <div className={`font-medium ${
                    achievement.unlocked ? 'text-white' : 'text-gray-400'
                  }`}>
                    {achievement.title}
                  </div>
                  <div className="text-gray-400 text-sm">{achievement.description}</div>
                </div>
                {achievement.unlocked && (
                  <Badge variant="outline" className="text-yellow-400 border-yellow-500">
                    Unlocked
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Personal Records */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <TrendingUp className="h-5 w-5" />
            Personal Records
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-gray-700/30 rounded-lg">
              <div className="text-white font-semibold text-xl">{stats.longestStreak}</div>
              <div className="text-gray-400 text-sm">Longest Streak</div>
            </div>
            <div className="text-center p-3 bg-gray-700/30 rounded-lg">
              <div className="text-white font-semibold text-xl">{stats.weeklyXP}</div>
              <div className="text-gray-400 text-sm">Weekly XP Record</div>
            </div>
            <div className="text-center p-3 bg-gray-700/30 rounded-lg">
              <div className="text-white font-semibold text-xl">{stats.averageDaily}</div>
              <div className="text-gray-400 text-sm">Avg Tasks/Day</div>
            </div>
            <div className="text-center p-3 bg-gray-700/30 rounded-lg">
              <div className="text-white font-semibold text-xl">{stats.level}</div>
              <div className="text-gray-400 text-sm">Current Level</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}