/**
 * Diet Section - Consolidated Nutrition Tracking
 *
 * PHASE 1: Single-page layout with all features visible
 *
 * Features:
 * - Photo-based nutrition tracking with AI analysis (30 XP)
 * - Meal logging with quick-add templates (15 XP)
 * - Macro tracking (protein, carbs, fats, calories) (20 XP)
 * - Daily summaries and insights
 * - Accordion-style collapsible sections
 *
 * Total XP: 65 points for all nutrition tracking features
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Target, UtensilsCrossed, ChevronDown, ChevronUp, Award } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PhotoNutritionTracker } from '../../features/photo-nutrition/components/PhotoNutritionTracker';
import { Macros } from '../components/Macros';
import { Meals } from '../components/Meals';
import { XPPill } from '@/domains/lifelock/1-daily/1-morning-routine/ui/components/xp/XPPill';

interface DietSectionProps {
  selectedDate: Date;
  navigateDay?: (direction: 'prev' | 'next') => void;
  activeSubTab?: 'photo' | 'macros' | 'meals'; // Still accepted for backward compatibility
}

type NutritionSection = 'photo' | 'macros' | 'meals';

interface SectionConfig {
  id: NutritionSection;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  xp: number;
  color: string;
}

const NUTRITION_SECTIONS: SectionConfig[] = [
  {
    id: 'photo',
    title: 'Photo Nutrition',
    subtitle: 'AI-powered food analysis',
    icon: Camera,
    xp: 30,
    color: 'from-green-500/20 to-emerald-500/20 border-green-500/40',
  },
  {
    id: 'meals',
    title: 'Today\'s Meals',
    subtitle: 'Log and track your meals',
    icon: UtensilsCrossed,
    xp: 15,
    color: 'from-blue-500/20 to-cyan-500/20 border-blue-500/40',
  },
  {
    id: 'macros',
    title: 'Daily Macros',
    subtitle: 'Track your daily macros',
    icon: Target,
    xp: 20,
    color: 'from-purple-500/20 to-pink-500/20 border-purple-500/40',
  },
];

const TOTAL_XP = 65; // 30 + 15 + 20

export const DietSection: React.FC<DietSectionProps> = ({
  selectedDate,
  navigateDay,
  activeSubTab // Ignored - all sections shown on single page
}) => {
  // State for collapsible sections
  const [expandedSections, setExpandedSections] = useState<Set<NutritionSection>>(
    new Set(['photo']) // Photo section expanded by default
  );

  // Toggle section expansion
  const toggleSection = (sectionId: NutritionSection) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  // Expand all sections
  const expandAll = () => {
    setExpandedSections(new Set(['photo', 'meals', 'macros']));
  };

  // Collapse all sections
  const collapseAll = () => {
    setExpandedSections(new Set());
  };

  return (
    <div className="min-h-screen w-full pb-24 relative">
      {/* Header - Static for all sections */}
      <div className="px-5 py-5 border-b border-white/10 bg-gradient-to-br from-green-950/40 to-emerald-950/40">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-2 border-green-500/40 flex items-center justify-center flex-shrink-0">
              <Award className="h-7 w-7 text-green-400" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-white tracking-tight">Nutrition Tracking</h1>
              <p className="text-sm text-white/60 mt-0.5">Photo • Meals • Macros</p>
            </div>
          </div>
          <XPPill xp={TOTAL_XP} activeTab="diet" />
        </motion.div>

        {/* Expand/Collapse All Buttons */}
        <div className="flex items-center gap-2 mt-4">
          <Button
            size="sm"
            variant="ghost"
            onClick={expandAll}
            className="text-xs text-green-400 hover:bg-green-900/30 h-8 px-3"
          >
            Expand All
          </Button>
          <span className="text-white/30">•</span>
          <Button
            size="sm"
            variant="ghost"
            onClick={collapseAll}
            className="text-xs text-green-400 hover:bg-green-900/30 h-8 px-3"
          >
            Collapse All
          </Button>
        </div>
      </div>

      {/* Content - All sections on one page with accordion pattern */}
      <div className="px-2 sm:px-4 md:px-6 lg:px-8 py-6 space-y-6">
        {NUTRITION_SECTIONS.map((sectionConfig, index) => {
          const Icon = sectionConfig.icon;
          const isExpanded = expandedSections.has(sectionConfig.id);

          return (
            <motion.div
              key={sectionConfig.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="space-y-3"
            >
              {/* Section Header - Always Visible */}
              <Card className={`bg-gradient-to-br ${sectionConfig.color} backdrop-blur-lg`}>
                <CardContent className="p-4">
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => toggleSection(sectionConfig.id)}
                    role="button"
                    tabIndex={0}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        toggleSection(sectionConfig.id);
                      }
                    }}
                    aria-expanded={isExpanded}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-gradient-to-br from-green-500/30 to-emerald-500/30 border border-green-500/40">
                        <Icon className="h-5 w-5 text-green-400" aria-hidden="true" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-white">{sectionConfig.title}</h2>
                        <p className="text-xs text-white/60">{sectionConfig.subtitle}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-bold text-green-300">+{sectionConfig.xp} XP</div>
                      </div>
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="p-1 rounded-lg bg-green-900/30"
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-green-400" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-green-400" />
                        )}
                      </motion.div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Section Content - Collapsible */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    {sectionConfig.id === 'photo' && (
                      <div id="diet-panel-photo" role="region" aria-label="Photo nutrition tracking">
                        <PhotoNutritionTracker selectedDate={selectedDate} />
                      </div>
                    )}

                    {sectionConfig.id === 'meals' && (
                      <div id="diet-panel-meals" role="region" aria-label="Meal logging">
                        <Meals selectedDate={selectedDate} />
                      </div>
                    )}

                    {sectionConfig.id === 'macros' && (
                      <div id="diet-panel-macros" role="region" aria-label="Macro tracking">
                        <Macros selectedDate={selectedDate} />
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Bottom spacing for navigation */}
      <div className="h-24" />
    </div>
  );
};

DietSection.displayName = 'DietSection';
