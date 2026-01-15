import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  ListTodo,
  Building2,
  Lock,
  ShoppingCart,
  Calendar,
  CalendarRange,
  CalendarClock,
  CalendarDays,
  Infinity as InfinityIcon,
  Handshake,
  Trophy,
} from 'lucide-react';

interface MenuItem {
  label: string;
  icon: any;
  href: string;
  description?: string;
}

interface MenuSection {
  title: string;
  icon: any;
  items: MenuItem[];
}

interface MoreMenuPopupProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export const MoreMenuPopup: React.FC<MoreMenuPopupProps> = ({
  isOpen,
  onClose,
  className
}) => {
  const navigate = useNavigate();

  const menuSections: MenuSection[] = [
    {
      title: 'Main',
      icon: LayoutDashboard,
      items: [
        { label: 'Admin Dashboard', icon: LayoutDashboard, href: '/admin' },
      ]
    },
    {
      title: 'Client Management',
      icon: Users,
      items: [
        { label: 'Clients', icon: Building2, href: '/admin/clients' },
        { label: 'Industries', icon: Building2, href: '/admin/industries' },
      ]
    },
    {
      title: 'Partner Workspace',
      icon: Handshake,
      items: [
        { label: 'Partners', icon: Handshake, href: '/admin/partners' },
      ]
    },
    {
      title: 'Team Operations',
      icon: UserCheck,
      items: [
        { label: 'Tasks', icon: ListTodo, href: '/admin/tasks' },
      ]
    },
    {
      title: 'LifeLock',
      icon: Lock,
      items: [
        { label: 'Daily View', icon: Calendar, href: '/admin/lifelock/daily' },
        { label: 'Weekly View', icon: CalendarRange, href: '/admin/lifelock/weekly' },
        { label: 'Monthly View', icon: CalendarClock, href: '/admin/lifelock/monthly' },
        { label: 'Yearly View', icon: CalendarDays, href: '/admin/lifelock/yearly' },
        { label: 'Life View', icon: InfinityIcon, href: '/admin/lifelock/life' },
        { label: 'XP Dashboard', icon: Trophy, href: '/xp-dashboard' },
        { label: 'XP Store', icon: ShoppingCart, href: '/xp-store' },
      ]
    },
  ];

  const handleItemClick = (href: string) => {
    navigate(href);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Menu Container */}
          <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{
                type: 'spring',
                damping: 25,
                stiffness: 300,
              }}
              className={cn(
                'w-full max-w-lg max-h-[85vh] overflow-hidden',
                'bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800',
                'border border-gray-700/50 rounded-t-3xl sm:rounded-3xl',
                'shadow-2xl',
                className
              )}
            >
              {/* Header */}
              <div className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur-lg border-b border-gray-700/50 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Menu</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="text-gray-400 hover:text-white hover:bg-gray-800"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Scrollable Content */}
              <div className="overflow-y-auto px-6 py-4" style={{ maxHeight: 'calc(85vh - 80px)' }}>
                {menuSections.map((section, sectionIndex) => (
                  <div key={sectionIndex} className="mb-6 last:mb-0">
                    {/* Section Title */}
                    <div className="flex items-center gap-2 mb-3">
                      <section.icon className="h-4 w-4 text-yellow-400" />
                      <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                        {section.title}
                      </h3>
                    </div>

                    {/* Section Items */}
                    <div className="space-y-1">
                      {section.items.map((item, itemIndex) => {
                        const Icon = item.icon;
                        return (
                          <button
                            key={itemIndex}
                            onClick={() => handleItemClick(item.href)}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl
                                     bg-gray-800/40 hover:bg-gray-700/60
                                     border border-gray-700/30 hover:border-gray-600/50
                                     transition-all duration-200
                                     text-left"
                          >
                            <div className="flex-shrink-0">
                              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-yellow-400/20 to-orange-500/20
                                            flex items-center justify-center border border-yellow-400/20">
                                <Icon className="h-5 w-5 text-yellow-400" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-white font-medium">{item.label}</div>
                              {item.description && (
                                <div className="text-sm text-gray-400 truncate">{item.description}</div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MoreMenuPopup;
