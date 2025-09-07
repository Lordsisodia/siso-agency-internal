import React from 'react';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/lib/utils';
import {
  CheckSquare,
  Clock,
  BarChart3,
  MessageCircle
} from 'lucide-react';

export type BottomNavTab = 'tasks' | 'timeblock' | 'stats' | 'chat';

interface BottomNavigationProps {
  activeTab: BottomNavTab;
  onTabChange: (tab: BottomNavTab) => void;
  className?: string;
}

const navigationItems = [
  {
    id: 'tasks' as BottomNavTab,
    label: 'Tasks',
    icon: CheckSquare,
    color: 'text-blue-400'
  },
  {
    id: 'timeblock' as BottomNavTab,
    label: 'Time Block',
    icon: Clock,
    color: 'text-green-400'
  },
  {
    id: 'stats' as BottomNavTab,
    label: 'Statistics',
    icon: BarChart3,
    color: 'text-purple-400'
  },
  {
    id: 'chat' as BottomNavTab,
    label: 'AI Chat',
    icon: MessageCircle,
    color: 'text-orange-400'
  }
];

export function BottomNavigation({ activeTab, onTabChange, className }: BottomNavigationProps) {
  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 z-50",
      "bg-gradient-to-r from-gray-900 to-gray-800",
      "border-t border-gray-700",
      "px-2 py-2",
      "backdrop-blur-lg bg-opacity-95",
      className
    )}>
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              onClick={() => onTabChange(item.id)}
              className={cn(
                "flex flex-col items-center gap-1 p-2 min-w-[60px] h-auto",
                "text-gray-400 hover:text-white hover:bg-gray-700/50",
                "transition-all duration-200",
                isActive && [
                  "text-white bg-gray-700/70",
                  item.color
                ]
              )}
            >
              <Icon className={cn(
                "h-5 w-5",
                isActive && "scale-110"
              )} />
              <span className="text-xs font-medium">
                {item.label}
              </span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}