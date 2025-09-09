import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Clock, 
  GraduationCap, 
  FileText, 
  Zap, 
  BarChart3, 
  User, 
  X,
  Target,
  Users,
  Trophy
} from 'lucide-react';

interface PartnerSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigationItems = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Leaderboard', href: '/dashboard/leaderboard', icon: Trophy },
  { name: 'Coming Soon', href: '/dashboard/coming-soon', icon: Clock },
  { name: 'Education Hub', href: '/dashboard/education', icon: GraduationCap },
  { name: 'Templates', href: '/dashboard/templates', icon: FileText },
  { name: 'App Plan Generator', href: '/dashboard/app-plan-generator', icon: Zap },
  { name: 'Pipeline', href: '/dashboard/pipeline', icon: BarChart3 },
  { name: 'Profile Settings', href: '/dashboard/profile', icon: User },
];

export function PartnerSidebar({ isOpen, onClose }: PartnerSidebarProps) {
  const location = useLocation();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-30 w-64 sm:w-72 bg-gray-800 border-r border-gray-700 transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0 lg:w-64
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo & Close Button */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 sm:h-10 sm:w-10 bg-orange-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm sm:text-base">S</span>
              </div>
              <span className="text-white font-semibold text-lg sm:text-xl">Partner Portal</span>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700 rounded-lg touch-manipulation"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 sm:px-4 py-4 sm:py-6 space-y-1 sm:space-y-2 overflow-y-auto">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={onClose}
                  className={`
                    flex items-center px-3 sm:px-4 py-3 sm:py-4 rounded-lg text-sm sm:text-base font-medium transition-all duration-200 touch-manipulation
                    min-h-[48px] sm:min-h-[52px]
                    ${isActive 
                      ? 'bg-orange-600 text-white shadow-lg' 
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white active:bg-gray-600'
                    }
                  `}
                >
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6 mr-3 sm:mr-4 flex-shrink-0" />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Commission Summary */}
          <div className="p-3 sm:p-4 border-t border-gray-700">
            <div className="bg-gray-700 rounded-lg p-3 sm:p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-300 text-xs sm:text-sm">This Month</span>
                <Target className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-white">£0</div>
              <div className="text-xs sm:text-sm text-gray-400 mb-2">Commission Earned</div>
              <div className="flex items-center text-xs sm:text-sm text-gray-400">
                <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                0 Referrals
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 