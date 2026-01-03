import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/domains/admin/layout/AdminLayout';
import { AdminPageTitle } from '@/domains/admin/layout/AdminPageTitle';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sidebar, SidebarContent, SidebarTrigger, SidebarProvider } from '@/components/ui/sidebar';
import { 
  Calendar, 
  ArrowRight, 
  TrendingUp, 
  Target, 
  Clock, 
  CheckCircle, 
  Menu,
  Bot,
  Store,
  Settings,
  User,
  BarChart3,
  Flame
} from 'lucide-react';

export default function AdminLifeLockOverview() {
  const navigate = useNavigate();

  // Sidebar navigation items
  const sidebarItems = [
    { icon: Bot, label: 'AI Assistant', href: '/admin/ai-assistant' },
    { icon: Store, label: 'XP Store', href: '/xp-store' },
    { icon: Settings, label: 'Settings', href: '/admin/settings' },
    { icon: User, label: 'Profile', href: '/admin/profile' }
  ];

  // Mock data for stats (replace with real data later)
  const weeklyStats = {
    tasksCompleted: 24,
    totalTasks: 30,
    completionRate: 80,
    streak: 5,
    focusHours: 28.5
  };

  const monthlyStats = {
    tasksCompleted: 98,
    totalTasks: 120,
    completionRate: 82,
    bestWeek: 'Week 3',
    totalFocusHours: 115
  };

  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <SidebarProvider>
      <div className="min-h-screen flex">
        <Sidebar>
          <SidebarContent>
            <div className="p-4 border-b border-gray-800">
              <h3 className="font-semibold text-white mb-4">Extended Features</h3>
            </div>
            <nav className="p-4 space-y-2">
              {sidebarItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-800 text-gray-300 hover:text-white transition-colors"
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </a>
              ))}
            </nav>
          </SidebarContent>
        </Sidebar>
        
        <div className="flex-1">
          <AdminLayout>
            <div className="container mx-auto px-4 py-6 space-y-6">
              <div className="flex items-center gap-4">
                <SidebarTrigger>
                  <Menu className="text-white" size={24} />
                </SidebarTrigger>
                <AdminPageTitle
                  icon={Calendar}
                  title="LifeLock Overview"
                  subtitle="Your productivity insights and daily workflow access"
                />
              </div>

              <div className="space-y-6">
                {/* Go to Today Card */}
                <Card className="border-green-500/20 bg-gradient-to-br from-green-900/20 to-emerald-900/20 hover:from-green-900/30 hover:to-emerald-900/30 transition-all duration-200">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Calendar className="text-green-400" size={24} />
                      <div>
                        <h2 className="text-xl font-semibold text-white">Ready for Today?</h2>
                        <p className="text-gray-400 text-sm">{currentDate}</p>
                      </div>
                    </div>
                    <p className="text-gray-300 mb-4">
                      Continue your daily LifeLock workflow with Morning, Light Work, Deep Work, and more.
                    </p>
                    <Button 
                      onClick={() => navigate('/admin/life-lock')}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-medium flex items-center justify-center gap-2"
                    >
                      Go to Today
                      <ArrowRight size={16} />
                    </Button>
                  </CardContent>
                </Card>

                {/* Weekly Stats */}
                <Card className="border-blue-500/20 bg-gradient-to-br from-blue-900/20 to-cyan-900/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <BarChart3 className="text-blue-400" size={20} />
                      This Week's Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-400">{weeklyStats.tasksCompleted}</div>
                        <div className="text-sm text-gray-400">Tasks Done</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-400">{weeklyStats.completionRate}%</div>
                        <div className="text-sm text-gray-400">Completion</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-400 flex items-center justify-center gap-1">
                          <Flame size={20} />
                          {weeklyStats.streak}
                        </div>
                        <div className="text-sm text-gray-400">Day Streak</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-400">{weeklyStats.focusHours}h</div>
                        <div className="text-sm text-gray-400">Focus Time</div>
                      </div>
                    </div>
                    
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${weeklyStats.completionRate}%` }}
                      ></div>
                    </div>
                  </CardContent>
                </Card>

                {/* Monthly Stats */}
                <Card className="border-purple-500/20 bg-gradient-to-br from-purple-900/20 to-pink-900/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <TrendingUp className="text-purple-400" size={20} />
                      Monthly Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-400">{monthlyStats.tasksCompleted}</div>
                        <div className="text-sm text-gray-400">Total Tasks</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-400">{monthlyStats.completionRate}%</div>
                        <div className="text-sm text-gray-400">Avg Completion</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-400">{monthlyStats.totalFocusHours}h</div>
                        <div className="text-sm text-gray-400">Total Focus</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Best performing week:</span>
                      <span className="text-white font-medium">{monthlyStats.bestWeek}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="border-gray-500/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Target size={20} />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button 
                        variant="outline" 
                        className="justify-start h-12"
                        onClick={() => navigate('/admin/life-lock')}
                      >
                        <Clock className="mr-2" size={16} />
                        Start Today's Session
                      </Button>
                      <Button 
                        variant="outline" 
                        className="justify-start h-12"
                        onClick={() => navigate('/admin/tasks')}
                      >
                        <CheckCircle className="mr-2" size={16} />
                        Review All Tasks
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </AdminLayout>
        </div>
      </div>
    </SidebarProvider>
  );
}