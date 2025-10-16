import React from 'react';
import { motion } from 'framer-motion';

import { Card, CardContent } from '@/shared/ui/card';

import { NightlyCheckoutHeader } from './components/NightlyCheckoutHeader';
import { NightlyCheckoutSkeleton } from './components/NightlyCheckoutSkeleton';
import { StreakSummaryCard } from './components/StreakSummaryCard';
import { YesterdayFocusCard } from './components/YesterdayFocusCard';
import { VoiceReflectionButton } from './components/VoiceReflectionButton';
import { WinOfDaySection } from './components/WinOfDaySection';
import { MoodSelector } from './components/MoodSelector';
import { BedtimeSection } from './components/BedtimeSection';
import { ReflectionListSection } from './components/ReflectionListSection';
import { AnalysisActionSection } from './components/AnalysisActionSection';
import { EnergyLevelSection } from './components/EnergyLevelSection';
import { OverallReflectionSection } from './components/OverallReflectionSection';
import { TomorrowPlanningSection } from './components/TomorrowPlanningSection';
import { useNightlyCheckout } from './hooks/useNightlyCheckout';

interface NightlyCheckoutSectionProps {
  selectedDate: Date;
  onPreviousDate?: () => void;
  onNextDate?: () => void;
}

export const NightlyCheckoutSection: React.FC<NightlyCheckoutSectionProps> = ({ selectedDate }) => {
  const {
    form,
    isEditingBedTime,
    isRecordingVoice,
    isLoading,
    isSaving,
    checkoutProgress,
    checkoutXP,
    currentStreak,
    yesterdayReflection,
    moods,
    updateField,
    updateArrayItem,
    addArrayItem,
    removeArrayItem,
    setBedTimeEditing,
    setVoiceRecording,
    setCurrentTimeAsBedTime,
    getCurrentTimeLabel
  } = useNightlyCheckout(selectedDate);

  if (isLoading) {
    return <NightlyCheckoutSkeleton />;
  }

  return (
    <div className="min-h-screen w-full bg-[#121212] relative overflow-x-hidden">
      <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-6 lg:p-8 space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card className="mb-24 bg-purple-900/10 border-purple-700/30">
            <NightlyCheckoutHeader progress={checkoutProgress} isSaving={isSaving} />
            <CardContent className="pb-24">
              <StreakSummaryCard streak={currentStreak} xp={checkoutXP} />

              {yesterdayReflection?.tomorrowFocus && <YesterdayFocusCard focus={yesterdayReflection.tomorrowFocus} />}

              <VoiceReflectionButton
                isRecording={isRecordingVoice}
                onToggle={() => setVoiceRecording(!isRecordingVoice)}
              />

              <WinOfDaySection value={form.winOfDay} onChange={(value) => updateField('winOfDay', value)} />

              <MoodSelector moods={moods} selectedMood={form.mood} onSelect={(value) => updateField('mood', value)} />

              <div className="border-t border-purple-700/20 mb-8" />

              <BedtimeSection
                bedTime={form.bedTime}
                isEditing={isEditingBedTime}
                onEditChange={setBedTimeEditing}
                onBedTimeChange={(value) => updateField('bedTime', value)}
                onUseCurrentTime={setCurrentTimeAsBedTime}
                getCurrentTimeLabel={getCurrentTimeLabel}
              />

              <div className="space-y-8 mt-8">
                <ReflectionListSection
                  title="What went well today?"
                  items={form.wentWell}
                  onChange={(index, value) => updateArrayItem('wentWell', index, value)}
                  onAdd={() => addArrayItem('wentWell')}
                  onRemove={(index) => removeArrayItem('wentWell', index)}
                />

                <div className="border-t border-purple-700/20" />

                <ReflectionListSection
                  title="Even better if..."
                  items={form.evenBetterIf}
                  onChange={(index, value) => updateArrayItem('evenBetterIf', index, value)}
                  onAdd={() => addArrayItem('evenBetterIf')}
                  onRemove={(index) => removeArrayItem('evenBetterIf', index)}
                  addDelay={0.1}
                  placeholder="Something that could improve..."
                />

                <div className="border-t border-purple-700/20" />

                <AnalysisActionSection
                  dailyAnalysis={form.dailyAnalysis}
                  actionItems={form.actionItems}
                  onDailyAnalysisChange={(value) => updateField('dailyAnalysis', value)}
                  onActionItemsChange={(value) => updateField('actionItems', value)}
                />

                <div className="border-t border-purple-700/20" />

                <EnergyLevelSection value={form.energyLevel} onChange={(value) => updateField('energyLevel', value)} />

                <div className="border-t border-purple-700/20 mb-6" />

                <OverallReflectionSection
                  rating={form.overallRating}
                  keyLearnings={form.keyLearnings}
                  onRatingChange={(value) => updateField('overallRating', value)}
                  onKeyLearningsChange={(value) => updateField('keyLearnings', value)}
                />

                <TomorrowPlanningSection
                  focus={form.tomorrowFocus}
                  tasks={form.tomorrowTopTasks}
                  onFocusChange={(value) => updateField('tomorrowFocus', value)}
                  onTaskChange={(index, value) => updateArrayItem('tomorrowTopTasks', index, value)}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
