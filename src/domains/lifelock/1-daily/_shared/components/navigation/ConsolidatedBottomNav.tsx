/**
 * Consolidated Bottom Navigation Component
 *
 * PHASE 5 COMPLETE: AI Legacy button replaces Timeline circle button
 * PHASE 4: 3-button navigation layout + More button as 4th pill:
 * - Button 1-2: Plan, Tasks (with sub-nav support)
 * - Button 3: Stats (Smoking, Water, Fitness, Nutrition)
 * - Button 4: More (9-dot menu)
 * - AI Legacy button: Opens AI Assistant interface
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

  // Build 3-button tabs array + More button (only the main sections, no Timeline)
  // PHASE 4: NAV_SECTIONS now has 3 items, not 4
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

    // Regular section navigation (indices 0-2 for Plan, Tasks, Stats)
    const section = NAV_SECTIONS[index];
    if (section?.hasSubNav && section.subSections) {
      onSectionChange(section.id, section.subSections[0].id);
    } else {
      onSectionChange(section.id);
    }
  };

  const handleAILegacyClick = () => {
    // Navigate to AI Assistant interface
    navigate('/admin/ai-assistant');
  };

  return (
    <>
      <DailyBottomNav
        tabs={tabs}
        activeIndex={activeIndex}
        activeSubTab={activeSubTab}
        onChange={handleTabChange}
        onAILegacyClick={handleAILegacyClick}
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
