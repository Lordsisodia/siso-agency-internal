/**
 * Consolidated Bottom Navigation Component
 *
 * 4-button navigation layout + 9-dot more menu button:
 * - Button 1-2: Plan, Tasks (with sub-nav support)
 * - Button 3: Health
 * - Button 4: Diet
 * - Circle button: Opens GridMoreMenu with Timeline and other views
 */

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { NAV_SECTIONS, getViewNavigator } from '@/services/shared/navigation-config';
import { DailyBottomNav, DailyBottomNavTab } from './DailyBottomNav';
import { GridMoreMenu } from '@/components/GridMoreMenu';
import { cn } from '@/lib/utils';

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
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  // Get smart view navigator for current view
  const viewNavigator = getViewNavigator(location.pathname);

  // Build 4-button tabs array (only the main sections, no Timeline)
  const buildTabs = (): DailyBottomNavTab[] => {
    return NAV_SECTIONS.map(section => ({
      title: section.name,
      icon: section.icon,
      color: section.color,
      bgActive: section.bgActive
    }));
  };

  const tabs = buildTabs();
  const activeIndex = NAV_SECTIONS.findIndex(s => s.id === activeSection);

  const handleTabChange = (index: number | null) => {
    if (index === null) {
      // More menu button was clicked
      setIsMoreMenuOpen(true);
      return;
    }

    // Regular section navigation (indices 0-3)
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
        activeIndex={activeIndex}
        onChange={handleTabChange}
        className={className}
        hidden={hidden}
      />
      <GridMoreMenu
        open={isMoreMenuOpen}
        onOpenChange={setIsMoreMenuOpen}
      />
    </>
  );
};
