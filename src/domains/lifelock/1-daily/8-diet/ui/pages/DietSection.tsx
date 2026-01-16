/**
 * Diet Section - AI-Powered Nutrition Tracking
 *
 * Features:
 * - Photo-based nutrition tracking with AI analysis
 * - Macro tracking (protein, carbs, fats, calories)
 * - Meal logging
 * - Daily summaries and insights
 * - XP rewards for tracking
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, Target, UtensilsCrossed } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PhotoNutritionTracker } from '../../features/photo-nutrition/components/PhotoNutritionTracker';
import { Macros } from '../components/Macros';
import { Meals } from '../components/Meals';
import { XPPill } from '@/domains/lifelock/1-daily/1-morning-routine/ui/components/XPPill';

interface DietSectionProps {
  selectedDate: Date;
  navigateDay?: (direction: 'prev' | 'next') => void;
}

export const DietSection: React.FC<DietSectionProps> = ({
  selectedDate,
  navigateDay
}) => {
  const [activeTab, setActiveTab] = useState<'photo' | 'macros' | 'meals'>('photo');

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
  };

  // Helper to get tab order
  const tabOrder: Array<'photo' | 'macros' | 'meals'> = ['photo', 'meals', 'macros'];

  // Tab configuration for dynamic header
  const tabConfig = {
    photo: {
      icon: Camera,
      title: 'Photo Nutrition',
      subtitle: 'AI-powered food analysis',
      xp: 30
    },
    macros: {
      icon: Target,
      title: 'Daily Macros',
      subtitle: 'Track your daily macros',
      xp: 20
    },
    meals: {
      icon: UtensilsCrossed,
      title: "Today's Meals",
      subtitle: 'Log and track meals',
      xp: 15
    }
  };

  const currentTab = tabConfig[activeTab];
  const IconComponent = currentTab.icon;

  return (
    <div className="min-h-screen bg-[#121212] pb-24 relative">
      {/* Tab Navigation - Improved spacing and touch targets */}
      <div className="px-4 py-4 border-b border-white/10" role="tablist" aria-label="Diet tracking sections">
        <div className="flex gap-2 bg-white/5 rounded-xl p-1">
          <button
            onClick={() => handleTabChange('photo')}
            className={`flex-1 flex items-center justify-center gap-2.5 py-3 px-4 rounded-lg transition-all min-h-[44px] ${
              activeTab === 'photo'
                ? 'bg-green-500/20 text-green-400'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
            role="tab"
            aria-selected={activeTab === 'photo'}
            aria-controls="diet-panel-photo"
            id="diet-tab-photo"
            tabIndex={activeTab === 'photo' ? 0 : -1}
          >
            <Camera className="h-5 w-5" aria-hidden="true" />
            <span className="text-sm font-semibold">Photo</span>
          </button>
          <button
            onClick={() => handleTabChange('meals')}
            className={`flex-1 flex items-center justify-center gap-2.5 py-3 px-4 rounded-lg transition-all min-h-[44px] ${
              activeTab === 'meals'
                ? 'bg-green-500/20 text-green-400'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
            role="tab"
            aria-selected={activeTab === 'meals'}
            aria-controls="diet-panel-meals"
            id="diet-tab-meals"
            tabIndex={activeTab === 'meals' ? 0 : -1}
          >
            <UtensilsCrossed className="h-5 w-5" aria-hidden="true" />
            <span className="text-sm font-semibold">Meals</span>
          </button>
          <button
            onClick={() => handleTabChange('macros')}
            className={`flex-1 flex items-center justify-center gap-2.5 py-3 px-4 rounded-lg transition-all min-h-[44px] ${
              activeTab === 'macros'
                ? 'bg-green-500/20 text-green-400'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
            role="tab"
            aria-selected={activeTab === 'macros'}
            aria-controls="diet-panel-macros"
            id="diet-tab-macros"
            tabIndex={activeTab === 'macros' ? 0 : -1}
          >
            <Target className="h-5 w-5" aria-hidden="true" />
            <span className="text-sm font-semibold">Macros</span>
          </button>
        </div>
      </div>

      {/* Header with icon, title, and XP - Improved spacing and contrast */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 flex items-center justify-center flex-shrink-0">
              <IconComponent className="h-7 w-7 text-green-400" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-white tracking-tight">{currentTab.title}</h1>
              <p className="text-sm text-white/60 mt-0.5">{currentTab.subtitle}</p>
            </div>
          </div>
          <XPPill xp={currentTab.xp} activeTab="diet" />
        </div>
      </div>

      {/* Content */}
      <div className="px-2 sm:px-4 md:px-6 lg:px-8 py-6 space-y-6">
        {activeTab === 'photo' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            id="diet-panel-photo"
            role="tabpanel"
            aria-labelledby="diet-tab-photo"
            tabIndex={0}
          >
            <PhotoNutritionTracker selectedDate={selectedDate} />
          </motion.div>
        )}

        {activeTab === 'macros' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            id="diet-panel-macros"
            role="tabpanel"
            aria-labelledby="diet-tab-macros"
            tabIndex={0}
          >
            <Macros selectedDate={selectedDate} />
          </motion.div>
        )}

        {activeTab === 'meals' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            id="diet-panel-meals"
            role="tabpanel"
            aria-labelledby="diet-tab-meals"
            tabIndex={0}
          >
            <Meals selectedDate={selectedDate} />
          </motion.div>
        )}
      </div>
    </div>
  );
};

DietSection.displayName = 'DietSection';
