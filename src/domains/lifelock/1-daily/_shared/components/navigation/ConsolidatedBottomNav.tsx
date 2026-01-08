/**
 * Consolidated Bottom Navigation Component
 *
 * Wraps the existing DailyBottomNav to provide 4-button layout + Smart View Navigator + More menu
 * - Button 1-3: Timebox, Tasks, Wellness (with sub-nav support)
 * - Button 4: Smart View Navigator (contextual based on current view)
 * - Button 5: More menu (popover with additional pages)
 */

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { NAV_SECTIONS, MORE_MENU_ITEMS, getViewNavigator } from '@/services/shared/navigation-config';
import { DailyBottomNav, DailyBottomNavTab } from './DailyBottomNav';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { NineDotsIcon } from '@/components/ui/expandable-tabs';

interface ConsolidatedBottomNavProps {
  activeSection: string;
  activeSubTab?: string;
  onSectionChange: (section: string, subtab?: string) => void;
  className?: string;
}

export const ConsolidatedBottomNav: React.FC<ConsolidatedBottomNavProps> = ({
  activeSection,
  activeSubTab,
  onSectionChange,
  className = ''
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  // Get smart view navigator for current view
  const viewNavigator = getViewNavigator(location.pathname);

  // Build 5-button tabs array
  const buildTabs = (): DailyBottomNavTab[] => {
    const baseTabs = NAV_SECTIONS.map(section => ({
      title: section.name,
      icon: section.icon
    }));

    // Add Smart View Navigator as 4th button
    baseTabs.push({
      title: viewNavigator.label,
      icon: viewNavigator.icon
    });

    // Add More button as 5th button
    baseTabs.push({
      title: 'More',
      icon: NineDotsIcon
    });

    return baseTabs;
  };

  const tabs = buildTabs();
  const activeIndex = NAV_SECTIONS.findIndex(s => s.id === activeSection);

  const handleTabChange = (index: number | null) => {
    if (index === null) return;

    // Check if it's the More button (last index, index 4)
    if (index === tabs.length - 1) {
      setMoreMenuOpen(!moreMenuOpen);
      return;
    }

    // Check if it's the View Navigator (second to last, index 3)
    if (index === tabs.length - 2) {
      navigate(viewNavigator.path);
      return;
    }

    // Regular section navigation (indices 0-2)
    const section = NAV_SECTIONS[index];
    if (section?.hasSubNav && section.subSections) {
      onSectionChange(section.id, section.subSections[0].id);
    } else {
      onSectionChange(section.id);
    }
  };

  const handleMoreMenuClick = (path: string) => {
    navigate(path);
    setMoreMenuOpen(false);
  };

  return (
    <>
      <DailyBottomNav
        tabs={tabs}
        activeIndex={activeIndex}
        onChange={handleTabChange}
        className={className}
      />

      {/* More Menu - Popover that appears above nav */}
      <Popover open={moreMenuOpen} onOpenChange={setMoreMenuOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className="fixed bottom-24 right-6 opacity-0 pointer-events-none"
            id="more-menu-trigger"
          />
        </PopoverTrigger>
        <PopoverContent
          align="center"
          side="top"
          className="w-[calc(100vw-2rem)] max-w-xl bg-gray-900/95 backdrop-blur-xl border-white/10 shadow-2xl p-4"
          sideOffset={16}
        >
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-white mb-4">More</h3>
            <div className="grid grid-cols-3 gap-3">
              {MORE_MENU_ITEMS.map(item => (
                <button
                  key={item.id}
                  onClick={() => handleMoreMenuClick(item.path)}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                >
                  <item.icon className="h-6 w-6 text-amber-400" />
                  <span className="text-xs font-medium text-white text-center leading-tight">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
};
