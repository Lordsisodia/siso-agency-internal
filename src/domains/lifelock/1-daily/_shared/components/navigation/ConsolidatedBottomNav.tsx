/**
 * Consolidated Bottom Navigation Component
 *
 * Wraps the existing DailyBottomNav to provide 4-button layout + Smart View Navigator + More menu
 * - Button 1-3: Timebox, Tasks, Wellness (with sub-nav support)
 * - Button 4: Smart View Navigator (contextual based on current view)
 * - Button 5: More menu (bottom sheet with additional pages)
 */

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Grid2x2, X } from 'lucide-react';
import { NAV_SECTIONS, MORE_MENU_ITEMS, getViewNavigator } from '@/services/shared/navigation-config';
import { DailyBottomNav, DailyBottomNavTab } from './DailyBottomNav';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
      icon: Grid2x2
    });

    return baseTabs;
  };

  const tabs = buildTabs();
  const activeIndex = NAV_SECTIONS.findIndex(s => s.id === activeSection);

  const handleTabChange = (index: number | null) => {
    if (index === null) return;

    // Check if it's the More button (last index, index 4)
    if (index === tabs.length - 1) {
      setMoreMenuOpen(true);
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

      {/* More Menu - Bottom Sheet */}
      <Sheet open={moreMenuOpen} onOpenChange={setMoreMenuOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" className="hidden" />
        </SheetTrigger>
        <SheetContent
          side="bottom"
          className="h-[60vh] bg-gray-900/95 backdrop-blur-xl border-white/10"
        >
          <SheetHeader>
            <SheetTitle className="text-white text-left">More</SheetTitle>
          </SheetHeader>

          <div className="py-6 grid grid-cols-2 gap-4">
            {MORE_MENU_ITEMS.map(item => (
              <Button
                key={item.id}
                variant="ghost"
                onClick={() => handleMoreMenuClick(item.path)}
                className="h-24 flex flex-col gap-2 bg-white/5 hover:bg-white/10 border border-white/10"
              >
                <item.icon className="h-8 w-8 text-amber-400" />
                <span className="text-sm font-medium text-white">{item.label}</span>
              </Button>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};
