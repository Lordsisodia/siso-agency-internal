import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smile, Meh, Frown, Zap, AlertTriangle, Star, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface StateSnapshotProps {
  moodStart: number;
  moodEnd: number;
  energyLevel: number;
  stressLevel: number;
  onChange: (updates: {
    moodStart?: number;
    moodEnd?: number;
    energyLevel?: number;
    stressLevel?: number;
  }) => void;
}

const getMoodEmoji = (level: number): string => {
  if (level <= 3) return '😔';
  if (level <= 5) return '😐';
  if (level <= 7) return '🙂';
  return '😊';
};

const getMoodColor = (level: number): string => {
  if (level <= 3) return 'text-red-400';
  if (level <= 5) return 'text-yellow-400';
  if (level <= 7) return 'text-green-400';
  return 'text-green-300';
};

const getDeltaColor = (delta: number): string => {
  if (delta > 0) return 'text-green-400';
  if (delta < 0) return 'text-red-400';
  return 'text-gray-400';
};

export const StateSnapshot: React.FC<StateSnapshotProps> = ({
  moodStart,
  moodEnd,
  energyLevel,
  stressLevel,
  onChange
}) => {
  const [isMoodExpanded, setIsMoodExpanded] = useState(false);
  const [isEnergyExpanded, setIsEnergyExpanded] = useState(false);
  const [isStressExpanded, setIsStressExpanded] = useState(false);

  const moodDelta = moodEnd - moodStart;
  const deltaColor = getDeltaColor(moodDelta);
  const deltaSign = moodDelta > 0 ? '+' : '';

  return (
    <div className="w-full">
      <Card className="mx-6 sm:mx-8 md:mx-12 bg-purple-900/10 border-purple-700/30 overflow-hidden">
          <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-center gap-2 mb-4">
            <Star className="h-5 w-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-purple-300">State Snapshot</h3>
          </div>

          {/* Main Content - Horizontal Layout */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* 1. Mood Delta */}
            <div className="space-y-2">
              <button
                onClick={() => setIsMoodExpanded(!isMoodExpanded)}
                className="w-full flex items-center justify-between p-3 bg-purple-900/20 border border-purple-700/30 rounded-lg hover:bg-purple-900/30 transition-all"
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getMoodEmoji(moodStart)}</span>
                  <ArrowRight className="h-4 w-4 text-purple-300" />
                  <span className="text-2xl">{getMoodEmoji(moodEnd)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className={cn('text-sm font-bold', deltaColor)}>
                    {deltaSign}{moodDelta}
                  </span>
                  {isMoodExpanded ? (
                    <ChevronUp className="h-4 w-4 text-purple-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-purple-400" />
                  )}
                </div>
              </button>

              <AnimatePresence>
                {isMoodExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-3 p-3 bg-purple-900/10 rounded-lg border border-purple-700/20"
                  >
                    {/* Start Mood */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-purple-400">Start</span>
                        <span className={cn('text-sm font-semibold', getMoodColor(moodStart))}>
                          {getMoodEmoji(moodStart)} {moodStart}/10
                        </span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={moodStart}
                        onChange={(e) => onChange({ moodStart: parseInt(e.target.value) })}
                        className="w-full h-2 bg-purple-900/30 rounded-lg appearance-none cursor-pointer accent-purple-500"
                      />
                    </div>

                    {/* End Mood */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-purple-400">End</span>
                        <span className={cn('text-sm font-semibold', getMoodColor(moodEnd))}>
                          {getMoodEmoji(moodEnd)} {moodEnd}/10
                        </span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={moodEnd}
                        onChange={(e) => onChange({ moodEnd: parseInt(e.target.value) })}
                        className="w-full h-2 bg-purple-900/30 rounded-lg appearance-none cursor-pointer accent-purple-500"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 2. Energy Level */}
            <div className="space-y-2">
              <button
                onClick={() => setIsEnergyExpanded(!isEnergyExpanded)}
                className="w-full flex items-center justify-between p-3 bg-purple-900/20 border border-purple-700/30 rounded-lg hover:bg-purple-900/30 transition-all"
              >
                <div className="flex items-center gap-2">
                  <Zap className={cn('h-5 w-5', energyLevel >= 7 ? 'text-yellow-400' : 'text-purple-400')} />
                  <span className="text-sm font-medium text-purple-300">Energy</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-bold text-purple-200">{energyLevel}</span>
                  {isEnergyExpanded ? (
                    <ChevronUp className="h-4 w-4 text-purple-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-purple-400" />
                  )}
                </div>
              </button>

              <AnimatePresence>
                {isEnergyExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-2 p-3 bg-purple-900/10 rounded-lg border border-purple-700/20"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-purple-400">Level</span>
                      <span className="text-sm font-bold text-purple-200">{energyLevel}/10</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={energyLevel}
                      onChange={(e) => onChange({ energyLevel: parseInt(e.target.value) })}
                      className="w-full h-2 bg-purple-900/30 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                    />
                    <div className="flex justify-between text-xs text-purple-400">
                      <span>Drained</span>
                      <span>Energized</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 3. Stress Level */}
            <div className="space-y-2">
              <button
                onClick={() => setIsStressExpanded(!isStressExpanded)}
                className="w-full flex items-center justify-between p-3 bg-purple-900/20 border border-purple-700/30 rounded-lg hover:bg-purple-900/30 transition-all"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className={cn(
                    'h-5 w-5',
                    stressLevel >= 8 ? 'text-red-400' :
                    stressLevel >= 5 ? 'text-yellow-400' : 'text-green-400'
                  )} />
                  <span className="text-sm font-medium text-purple-300">Stress</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-bold text-purple-200">{stressLevel}</span>
                  {isStressExpanded ? (
                    <ChevronUp className="h-4 w-4 text-purple-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-purple-400" />
                  )}
                </div>
              </button>

              <AnimatePresence>
                {isStressExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-2 p-3 bg-purple-900/10 rounded-lg border border-purple-700/20"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-purple-400">Level</span>
                      <span className="text-sm font-bold text-purple-200">{stressLevel}/10</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={stressLevel}
                      onChange={(e) => onChange({ stressLevel: parseInt(e.target.value) })}
                      className="w-full h-2 bg-purple-900/30 rounded-lg appearance-none cursor-pointer accent-orange-500"
                    />
                    <div className="flex justify-between text-xs text-purple-400">
                      <span>Calm</span>
                      <span>Overwhelmed</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 4. Overall Day Rating */}
            <div className="space-y-2">
              <div className="p-3 bg-purple-900/20 border border-purple-700/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="h-5 w-5 text-yellow-400" />
                  <span className="text-sm font-medium text-purple-300">Day Rating</span>
                </div>
                <div className="text-center">
                  <span className="text-2xl font-bold text-yellow-400">
                    {Math.round((moodEnd + energyLevel + (11 - stressLevel)) / 3)}
                  </span>
                  <span className="text-sm text-purple-400">/10</span>
                </div>
                <p className="text-xs text-purple-400 text-center mt-1">
                  Avg of mood, energy, & calm
                </p>
              </div>
            </div>
          </div>

          {/* Visual Feedback for Mood Improvement */}
          <AnimatePresence>
            {moodDelta > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4 p-3 bg-green-900/20 border border-green-700/30 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <span className="text-green-400 text-lg">🎉</span>
                  <p className="text-sm text-green-300">
                    Your mood improved by {moodDelta} points today!
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          </CardContent>
        </Card>
    </div>
  );
};

StateSnapshot.displayName = 'StateSnapshot';
