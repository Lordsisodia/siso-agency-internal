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
import { NAV_SECTIONS, getViewNavigator } from '@/services/shared/navigation-config';
import { DailyBottomNav, DailyBottomNavTab } from './DailyBottomNav';
import { GridMoreMenu } from '@/components/GridMoreMenu';
import { cn } from '@/lib/utils';
import { NineDotsIcon } from '@/components/ui/expandable-tabs';

interface ConsolidatedBottomNavProps {
  activeSection: string;
  activeSubTab?: string;
  onSectionChange: (section: string, subtab?: string) => void;
  className?: string;
  hidden?: boolean;
}

export const ConsolidatedBottomNav: React.FC<ConsolidatedBottomNavProps> = ({
  activeSection,
  activeSubTab,
  onSectionChange,
  className = '',
  hidden = false
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
      icon: section.icon,
      color: section.color,
      bgActive: section.bgActive
    }));

    // Add Smart View Navigator as 4th button
    baseTabs.push({
      title: viewNavigator.label,
      icon: viewNavigator.icon,
      color: 'text-blue-400', // Weekly view color
      bgActive: 'bg-blue-400/20'
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

  // Determine if View Navigator (index 3) is active
  const isViewNavigatorActive = location.pathname === viewNavigator.path;
  const effectiveActiveIndex = isViewNavigatorActive ? 3 : activeIndex;

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

  return (
    <>
      <DailyBottomNav
        tabs={tabs}
        activeIndex={effectiveActiveIndex}
        onChange={handleTabChange}
        className={className}
        hidden={hidden}
      />

      {/* Grid More Menu - 3x3 overlay */}
      <GridMoreMenu open={moreMenuOpen} onOpenChange={setMoreMenuOpen} />
    </>
  );
};
