import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { PartnerBreadcrumbs } from './PartnerBreadcrumbs';
import { 
  Menu, 
  X, 
  Home, 
  Users, 
  TrendingUp, 
  BookOpen, 
  Settings, 
  LogOut,
  Bell,
  Search,
  User,
  ChevronDown,
  Shield,
  DollarSign,
  Target,
  Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  badge?: string;
  comingSoon?: boolean;
}

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  // Mock user data - TODO: Replace with real user context
  const user = {
    name: 'John Smith',
    email: 'john@example.com',
    avatar: '',
    tier: 'Silver Partner',
    totalEarnings: '£2,450',
    activeReferrals: 3,
    notifications: 2
  };

  const navigationItems: NavigationItem[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: Home,
      href: '/dashboard',
    },
    {
      id: 'referrals',
      label: 'My Referrals',
      icon: Users,
      href: '/dashboard/referrals',
      badge: '3',
    },
    {
      id: 'earnings',
      label: 'Earnings',
      icon: DollarSign,
      href: '/dashboard/earnings',
    },
    {
      id: 'leaderboard',
      label: 'Leaderboard',
      icon: TrendingUp,
      href: '/dashboard/leaderboard',
    },
    {
      id: 'resources',
      label: 'Resources',
      icon: BookOpen,
      href: '/dashboard/resources',
      comingSoon: true,
    },
    {
      id: 'goals',
      label: 'Goals & Targets',
      icon: Target,
      href: '/dashboard/goals',
      comingSoon: true,
    },
    {
      id: 'achievements',
      label: 'Achievements',
      icon: Award,
      href: '/dashboard/achievements',
      comingSoon: true,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      href: '/dashboard/settings',
      comingSoon: true,
    },
  ];

  const handleLogout = () => {
    // TODO: Implement actual logout logic
    navigate('/auth/login');
  };

  const isActiveRoute = (href: string) => {
    if (href === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(href);
  };

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Sidebar */}
      <div className="relative">
        {/* Desktop Sidebar */}
        <motion.aside
          initial={false}
          animate={{ width: sidebarOpen ? 280 : 80 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="hidden lg:flex flex-col bg-gray-800 border-r border-gray-700 h-screen sticky top-0"
        >
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <AnimatePresence>
                {sidebarOpen && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <h2 className="text-white font-bold text-lg">SISO Partner</h2>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigationItems.map((item) => {
              const isActive = isActiveRoute(item.href);
              const Icon = item.icon;
              
              return (
                <motion.div key={item.id} whileHover={{ x: 2 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={`w-full justify-start gap-3 h-12 ${
                      isActive 
                        ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' 
                        : 'text-gray-300 hover:text-white hover:bg-gray-700'
                    } ${item.comingSoon ? 'opacity-60' : ''}`}
                    onClick={() => !item.comingSoon && navigate(item.href)}
                    disabled={item.comingSoon}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <AnimatePresence>
                      {sidebarOpen && (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.2 }}
                          className="flex items-center justify-between w-full"
                        >
                          <span className="truncate">{item.label}</span>
                          <div className="flex items-center gap-2">
                            {item.badge && (
                              <Badge variant="secondary" className="bg-orange-500/20 text-orange-400 text-xs">
                                {item.badge}
                              </Badge>
                            )}
                            {item.comingSoon && (
                              <Badge variant="outline" className="text-xs border-gray-600 text-gray-400">
                                Soon
                              </Badge>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Button>
                </motion.div>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-700">
            <AnimatePresence>
              {sidebarOpen ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-3"
                >
                  <div className="bg-gray-700/50 rounded-lg p-3">
                    <div className="text-xs text-gray-400 mb-1">Current Tier</div>
                    <div className="text-orange-400 font-semibold">{user.tier}</div>
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-3">
                    <div className="text-xs text-gray-400 mb-1">Total Earnings</div>
                    <div className="text-green-400 font-semibold">{user.totalEarnings}</div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-orange-400" />
                  </div>
                  <div className="text-xs text-orange-400 font-semibold">£2.4k</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.aside>

        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Mobile Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="lg:hidden fixed left-0 top-0 w-80 h-full bg-gray-800 border-r border-gray-700 z-50"
            >
              {/* Mobile Header */}
              <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-white font-bold text-lg">SISO Partner</h2>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Mobile Navigation */}
              <nav className="flex-1 p-4 space-y-2">
                {navigationItems.map((item) => {
                  const isActive = isActiveRoute(item.href);
                  const Icon = item.icon;
                  
                  return (
                    <Button
                      key={item.id}
                      variant={isActive ? "secondary" : "ghost"}
                      className={`w-full justify-start gap-3 h-12 ${
                        isActive 
                          ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' 
                          : 'text-gray-300 hover:text-white hover:bg-gray-700'
                      } ${item.comingSoon ? 'opacity-60' : ''}`}
                      onClick={() => !item.comingSoon && navigate(item.href)}
                      disabled={item.comingSoon}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.badge && (
                        <Badge variant="secondary" className="bg-orange-500/20 text-orange-400 text-xs">
                          {item.badge}
                        </Badge>
                      )}
                      {item.comingSoon && (
                        <Badge variant="outline" className="text-xs border-gray-600 text-gray-400">
                          Soon
                        </Badge>
                      )}
                    </Button>
                  );
                })}
              </nav>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-gray-800 border-b border-gray-700 px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left Side */}
            <div className="flex items-center gap-4">
              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-400 hover:text-white"
              >
                <Menu className="w-5 h-5" />
              </Button>

              {/* Desktop Sidebar Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="hidden lg:flex text-gray-400 hover:text-white"
              >
                <Menu className="w-5 h-5" />
              </Button>

              {/* Search */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white pl-10 w-64 focus:border-orange-500"
                />
              </div>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <Button
                variant="ghost"
                size="sm"
                className="relative text-gray-400 hover:text-white"
              >
                <Bell className="w-5 h-5" />
                {user.notifications > 0 && (
                  <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 bg-orange-500 text-white text-xs flex items-center justify-center">
                    {user.notifications}
                  </Badge>
                )}
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-3 text-gray-300 hover:text-white">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="bg-orange-500 text-white">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden md:block text-left">
                      <div className="text-sm font-medium">{user.name}</div>
                      <div className="text-xs text-gray-400">{user.tier}</div>
                    </div>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-gray-800 border-gray-700">
                  <DropdownMenuLabel className="text-gray-300">My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-gray-700" />
                  <DropdownMenuItem className="text-gray-300 hover:bg-gray-700 hover:text-white">
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-gray-300 hover:bg-gray-700 hover:text-white">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-700" />
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="text-red-400 hover:bg-red-500/20 hover:text-red-300"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            <PartnerBreadcrumbs />
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout; 