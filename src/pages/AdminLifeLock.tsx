import React, { useState } from 'react';
import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { AdminPageTitle } from '@/components/admin/layout/AdminPageTitle';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Lock, 
  CheckCircle2, 
  Circle, 
  Calendar,
  ChevronLeft,
  ChevronRight,
  Filter,
  Plus
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addWeeks, subWeeks, startOfMonth, endOfMonth, addMonths, subMonths, getYear, eachWeekOfInterval, getWeek } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { MobileTodayCard } from '@/components/admin/lifelock/ui/MobileTodayCard';
import { MobileWeekView } from '@/components/admin/lifelock/ui/MobileWeekView';
import { FloatingActionButton } from '@/components/admin/lifelock/ui/FloatingActionButton';

interface TaskCard {
  id: string;
  date: Date;
  title: string;
  completed: boolean;
  tasks: {
    id: string;
    title: string;
    completed: boolean;
  }[];
}

const AdminLifeLock: React.FC = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedYear, setSelectedYear] = useState(getYear(new Date()));
  const [view, setView] = useState<'week' | 'month'>('week');

  // Generate available years (current year ± 2)
  const currentYear = getYear(new Date());
  const availableYears = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
  
  // Generate months
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Sample data - in real app this would come from your backend
  const generateSampleTasks = (date: Date): TaskCard => {
    const isToday = isSameDay(date, new Date());
    const isPast = date < new Date() && !isToday;
    const dayOfWeek = date.getDay();
    
    return {
      id: format(date, 'yyyy-MM-dd'),
      date,
      title: format(date, 'EEEE, MMM d'),
      completed: isPast ? Math.random() > 0.2 : Math.random() > 0.3, // Past days more likely completed
      tasks: [
        { id: '1', title: 'Morning routine', completed: isPast ? Math.random() > 0.2 : Math.random() > 0.4 },
        { id: '2', title: 'Work tasks', completed: isPast ? Math.random() > 0.3 : Math.random() > 0.5 },
        { id: '3', title: 'Exercise', completed: isPast ? Math.random() > 0.4 : Math.random() > 0.6 },
        { id: '4', title: 'Evening review', completed: isPast ? Math.random() > 0.1 : Math.random() > 0.3 },
      ].slice(0, isToday ? 4 : Math.floor(Math.random() * 4) + 1)
    };
  };

  // Get today's tasks
  const todayCard = generateSampleTasks(new Date());

  // Get week's tasks
  const weekStart = startOfWeek(currentDate);
  const weekEnd = endOfWeek(currentDate);
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
  const weekCards = weekDays.map(generateSampleTasks);

  // Get month's tasks organized in calendar format
  const monthStart = startOfMonth(selectedMonth);
  const monthEnd = endOfMonth(selectedMonth);
  
  // Get the first Monday before or at the start of the month
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  // Get the last Sunday after or at the end of the month
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  
  // Get all days in the calendar view (including previous/next month days)
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  
  // Organize into weeks (rows) with 7 days each (columns)
  const calendarWeeks = [];
  for (let i = 0; i < calendarDays.length; i += 7) {
    calendarWeeks.push(calendarDays.slice(i, i + 7));
  }
  
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dayLabelsMobile = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  const handleCardClick = (card: TaskCard) => {
    // Navigate to notion-like page for this day
    const dateParam = format(card.date, 'yyyy-MM-dd');
    navigate(`/admin/life-lock/day?date=${dateParam}`);
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentDate(direction === 'next' ? addWeeks(currentDate, 1) : subWeeks(currentDate, 1));
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setSelectedMonth(direction === 'next' ? addMonths(selectedMonth, 1) : subMonths(selectedMonth, 1));
  };

  const handleMonthChange = (monthIndex: string) => {
    const newDate = new Date(selectedYear, parseInt(monthIndex), 1);
    setSelectedMonth(newDate);
  };

  const handleYearChange = (year: string) => {
    setSelectedYear(parseInt(year));
    const newDate = new Date(parseInt(year), selectedMonth.getMonth(), 1);
    setSelectedMonth(newDate);
  };

  const TaskCardComponent = ({ card, size = 'medium', isCurrentMonth = true }: { card: TaskCard; size?: 'small' | 'medium' | 'large'; isCurrentMonth?: boolean }) => {
    const isToday = isSameDay(card.date, new Date());
    const isPast = card.date < new Date() && !isToday;
    const completedTasks = card.tasks.filter(task => task.completed).length;
    const totalTasks = card.tasks.length;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    const cardSizes = {
      small: 'p-3 sm:p-4 min-h-[120px] sm:min-h-[140px]',
      medium: 'p-4 sm:p-5 min-h-[160px] sm:min-h-[180px]',
      large: 'p-5 sm:p-6 md:p-8 min-h-[200px] sm:min-h-[240px]'
    };

    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="cursor-pointer"
        onClick={() => handleCardClick(card)}
      >
        <Card className={`
          ${cardSizes[size]}
          ${card.completed && isPast ? 'border-green-400/70 bg-gradient-to-br from-green-900/30 via-black/50 to-green-900/20 border-2 shadow-lg shadow-green-500/10' : 
            card.completed ? 'border-green-400/60 bg-gradient-to-br from-green-900/25 via-black/40 to-green-900/15 shadow-md shadow-green-500/8' : 
            'bg-gradient-to-br from-black/70 via-gray-900/40 to-black/60 border-orange-500/20'}
          ${isToday ? 'ring-2 ring-orange-500/80 border-orange-500/70 shadow-xl shadow-orange-500/25' : ''}
          ${!isCurrentMonth ? 'opacity-30' : ''}
          hover:shadow-2xl hover:shadow-orange-500/20 hover:scale-[1.03] hover:border-orange-500/50 hover:ring-1 hover:ring-orange-500/30 transition-all duration-500 text-white cursor-pointer backdrop-blur-lg relative overflow-hidden group
        `}>
          {/* Glassmorphism overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/3 via-yellow-500/3 to-orange-500/3 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 blur-sm"></div>
          
          <CardHeader className="pb-1 sm:pb-2 relative z-10">
            <div className="flex items-center justify-between">
              <h3 className={`font-semibold ${
                size === 'large' 
                  ? 'text-sm sm:text-base md:text-lg' 
                  : size === 'medium'
                  ? 'text-xs sm:text-sm'
                  : 'text-xs'
              }`}>
                {size === 'small' ? format(card.date, 'd') : card.title}
              </h3>
              {card.completed ? (
                <CheckCircle2 className={`${size === 'small' ? 'h-3 w-3 sm:h-4 sm:w-4' : 'h-4 w-4 sm:h-5 sm:w-5'} text-green-600`} />
              ) : (
                <Circle className={`${size === 'small' ? 'h-3 w-3 sm:h-4 sm:w-4' : 'h-4 w-4 sm:h-5 sm:w-5'} text-gray-400`} />
              )}
            </div>
            {isToday && size !== 'small' && (
              <Badge variant="secondary" className="w-fit bg-orange-500/20 text-orange-300 border-orange-500/40 text-xs">
                Today
              </Badge>
            )}
          </CardHeader>
          <CardContent className={`${size === 'small' ? 'p-2' : ''} relative z-10`}>
            <div className={`space-y-1 ${size === 'small' ? 'sm:space-y-2' : 'space-y-2'}`}>
              {size !== 'small' && (
                <>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>{completedTasks}/{totalTasks} tasks</span>
                    <span>{Math.round(completionRate)}%</span>
                  </div>
                  <div className="w-full bg-black/40 backdrop-blur-sm rounded-full h-2 sm:h-3 shadow-inner border border-orange-500/20">
                    <div 
                      className="bg-gradient-to-r from-orange-500 via-yellow-400 to-green-500 h-2 sm:h-3 rounded-full transition-all duration-700 shadow-lg shadow-orange-500/30 relative overflow-hidden"
                      style={{ width: `${completionRate}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-pulse"></div>
                    </div>
                  </div>
                </>
              )}
              {size === 'small' && (
                <div className="flex items-center justify-center">
                  <div className="w-full bg-black/40 backdrop-blur-sm rounded-full h-2 shadow-inner border border-orange-500/20">
                    <div 
                      className="bg-gradient-to-r from-orange-500 via-yellow-400 to-green-500 h-2 rounded-full transition-all duration-700 shadow-lg shadow-orange-500/20 relative overflow-hidden"
                      style={{ width: `${completionRate}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/15 to-transparent animate-pulse"></div>
                    </div>
                  </div>
                </div>
              )}
              {size === 'large' && (
                <div className="space-y-1 mt-2 hidden sm:block">
                  {card.tasks.slice(0, 3).map((task) => (
                    <div key={task.id} className="flex items-center space-x-2 text-xs">
                      {task.completed ? (
                        <CheckCircle2 className="h-3 w-3 text-green-600 flex-shrink-0" />
                      ) : (
                        <Circle className="h-3 w-3 text-gray-400 flex-shrink-0" />
                      )}
                      <span className={`truncate ${task.completed ? 'line-through text-gray-500' : 'text-gray-300'}`}>
                        {task.title}
                      </span>
                    </div>
                  ))}
                  {card.tasks.length > 3 && (
                    <div className="text-xs text-gray-500 ml-5">
                      +{card.tasks.length - 3} more tasks
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <AdminLayout>
      <div className="min-h-screen w-full bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="p-4 sm:p-6 md:p-6 space-y-4 sm:space-y-6 md:space-y-8">
        <AdminPageTitle
          icon={Lock}
          title="Life Lock"
          subtitle="Track your daily progress with a Notion-style task overview"
        />

        {/* Today's Progress - Mobile Compact View */}
        <MobileTodayCard
          card={todayCard}
          onViewDetails={handleCardClick}
          onQuickAdd={() => console.log('Quick add task')}
          className="mb-6"
        />

        {/* Today's Progress - Desktop Hero Section */}
        <section className="relative overflow-hidden hidden sm:block">
          {/* Background with gradient and glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 via-yellow-500/15 to-orange-600/20 rounded-3xl blur-xl"></div>
          <div className="relative bg-gradient-to-br from-black/80 via-gray-900/60 to-black/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 md:p-12 border border-orange-500/30 shadow-2xl shadow-orange-500/10">
            <div className="text-center mb-6 sm:mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full mb-4 shadow-lg shadow-orange-500/25">
                <Calendar className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Today's Progress
              </h2>
              <p className="text-gray-300 text-base sm:text-lg font-medium">
                {format(new Date(), 'EEEE, MMMM d, yyyy')}
              </p>
              <div className="mt-4 flex items-center justify-center space-x-6 text-sm text-orange-300">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Active Session</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span>Day {Math.floor((new Date().getTime() - new Date('2025-01-01').getTime()) / (1000 * 60 * 60 * 24)) + 1} of 2025</span>
                </div>
              </div>
            </div>
            <div className="max-w-3xl mx-auto">
              <TaskCardComponent card={todayCard} size="large" />
            </div>
          </div>
        </section>

        {/* This Week - Mobile Optimized View */}
        <MobileWeekView
          weekCards={weekCards}
          weekStart={weekStart}
          weekEnd={weekEnd}
          onNavigateWeek={navigateWeek}
          onCardClick={handleCardClick}
          className="mb-6"
        />

        {/* This Week - Desktop Enhanced Layout */}
        <section className="relative hidden sm:block">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-yellow-500/5 rounded-2xl blur-sm"></div>
          <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-orange-500/20 shadow-lg shadow-orange-500/5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
                  <Calendar className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-orange-400 inline" />
                  This Week
                </h2>
                <p className="text-orange-200/80 text-sm font-medium">
                  {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-black/50 border-orange-500/30 text-orange-300 hover:bg-orange-500/20 hover:border-orange-500/50 hover:text-orange-200 px-3 py-2 transition-all duration-300"
                  onClick={() => navigateWeek('prev')}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-black/50 border-orange-500/30 text-orange-300 hover:bg-orange-500/20 hover:border-orange-500/50 hover:text-orange-200 px-3 py-2 transition-all duration-300"
                  onClick={() => navigateWeek('next')}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          
            {/* Week Cards Grid - Improved */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3 sm:gap-4">
              {weekCards.map((card) => (
                <div key={card.id} className="lg:col-span-1">
                  <TaskCardComponent card={card} size="medium" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Monthly Overview - Enhanced Layout */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/3 to-orange-500/3 rounded-2xl blur-sm"></div>
          <div className="relative bg-black/40 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-yellow-500/15 shadow-lg shadow-yellow-500/5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
                  <Calendar className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-yellow-400 inline" />
                  Monthly Overview
                </h2>
                <p className="text-yellow-200/80 text-sm font-medium">
                  {format(selectedMonth, 'MMMM yyyy')}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-black/50 border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/20 hover:border-yellow-500/50 hover:text-yellow-200 px-3 py-2 transition-all duration-300"
                  onClick={() => navigateMonth('prev')}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-black/50 border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/20 hover:border-yellow-500/50 hover:text-yellow-200 px-3 py-2 transition-all duration-300"
                  onClick={() => navigateMonth('next')}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          
            {/* Month and Year Filters */}
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4 mb-4 sm:mb-6">
              <div className="flex items-center space-x-2">
                <label className="text-xs sm:text-sm font-medium text-yellow-300">Month:</label>
                <Select value={selectedMonth.getMonth().toString()} onValueChange={handleMonthChange}>
                  <SelectTrigger className="w-[120px] sm:w-[140px] bg-black/60 border-yellow-500/30 text-white text-sm hover:border-yellow-500/50 transition-colors">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-black/90 border-yellow-500/30 backdrop-blur-sm">
                    {months.map((month, index) => (
                      <SelectItem key={index} value={index.toString()} className="text-white hover:bg-yellow-500/20 text-sm">
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <label className="text-xs sm:text-sm font-medium text-yellow-300">Year:</label>
                <Select value={selectedYear.toString()} onValueChange={handleYearChange}>
                  <SelectTrigger className="w-[80px] sm:w-[100px] bg-black/60 border-yellow-500/30 text-white text-sm hover:border-yellow-500/50 transition-colors">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-black/90 border-yellow-500/30 backdrop-blur-sm">
                    {availableYears.map((year) => (
                      <SelectItem key={year} value={year.toString()} className="text-white hover:bg-yellow-500/20 text-sm">
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {/* Calendar Grid */}
            <div className="bg-black/30 backdrop-blur-sm rounded-lg p-2 sm:p-3 md:p-4 border border-yellow-500/10">
              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 sm:mb-3 md:mb-4">
                {dayLabels.map((day, index) => (
                  <div key={day} className="text-center text-xs sm:text-sm font-semibold text-yellow-300 py-1 sm:py-2">
                    <span className="hidden sm:inline">{day}</span>
                    <span className="sm:hidden">{dayLabelsMobile[index]}</span>
                  </div>
                ))}
              </div>
              
              {/* Calendar Weeks */}
              <div className="space-y-1 sm:space-y-2">
                {calendarWeeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="grid grid-cols-7 gap-1 sm:gap-2">
                    {week.map((day) => {
                      const card = generateSampleTasks(day);
                      const isCurrentMonth = day.getMonth() === selectedMonth.getMonth();
                      return (
                        <TaskCardComponent 
                          key={card.id} 
                          card={card} 
                          size="small" 
                          isCurrentMonth={isCurrentMonth}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions - Enhanced */}
        <section className="flex justify-center pt-6 sm:pt-8">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
            <Button 
              className="relative overflow-hidden bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white px-8 sm:px-10 py-4 sm:py-5 text-sm sm:text-base font-semibold rounded-2xl shadow-lg hover:shadow-orange-500/30 transition-all duration-300 transform hover:scale-105"
              onClick={() => console.log('Add new task')}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
              <Plus className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
              Add New Task
            </Button>
            <Button 
              variant="outline"
              className="border-orange-500/30 text-orange-300 hover:bg-orange-500/20 hover:border-orange-500/50 hover:text-white bg-black/30 backdrop-blur-sm px-8 sm:px-10 py-4 sm:py-5 text-sm sm:text-base font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105"
              onClick={() => navigate('/admin/life-lock/day')}
            >
              <Calendar className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
              Today's Details
            </Button>
          </div>
        </section>
        </div>
      </div>

      {/* Floating Action Button for Mobile */}
      <FloatingActionButton
        onQuickAdd={() => console.log('Quick add task')}
        onVoiceInput={() => console.log('Voice input')}
        onTodayView={() => navigate('/admin/life-lock/day')}
        onQuickTimer={() => console.log('Quick timer')}
        onQuickPhoto={() => console.log('Quick photo')}
      />
    </AdminLayout>
  );
};

export default AdminLifeLock;