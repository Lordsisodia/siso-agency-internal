/**
 * FlowStateRulesCard - Visual checkable cards for flow state rules
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Smartphone,
  Cigarette,
  Timer,
  Zap,
  Brain,
  Target,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FlowRule {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  category: 'digital' | 'substance' | 'action' | 'mindset';
}

const FLOW_RULES: FlowRule[] = [
  {
    id: 'no-apps',
    title: 'No Distracting Apps',
    description: 'No use of apps other than Notion. Stay focused on productive work only.',
    icon: Smartphone,
    category: 'digital',
  },
  {
    id: 'no-substances',
    title: 'No Substances',
    description: 'No vapes, drugs, or weed. Keep your mind clear and sharp.',
    icon: Cigarette,
    category: 'substance',
  },
  {
    id: 'five-second-rule',
    title: '5-Second Rule',
    description: 'No more than 5 seconds until the next action. Keep momentum.',
    icon: Timer,
    category: 'action',
  },
  {
    id: 'deep-focus',
    title: 'Deep Focus',
    description: 'Commit to single-tasking. No context switching during work blocks.',
    icon: Zap,
    category: 'mindset',
  },
  {
    id: 'clear-intention',
    title: 'Clear Intention',
    description: 'Know exactly what you\'re working on before you start.',
    icon: Target,
    category: 'mindset',
  },
  {
    id: 'present-moment',
    title: 'Present Moment',
    description: 'Stay in the now. Don\'t let your mind wander to past or future.',
    icon: Brain,
    category: 'mindset',
  },
];

const CATEGORY_COLORS: Record<string, { bg: string; border: string; icon: string }> = {
  digital: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', icon: 'text-blue-400' },
  substance: { bg: 'bg-red-500/10', border: 'border-red-500/30', icon: 'text-red-400' },
  action: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', icon: 'text-amber-400' },
  mindset: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', icon: 'text-purple-400' },
};

interface FlowStateRulesCardProps {
  storageKey?: string;
}

export const FlowStateRulesCard: React.FC<FlowStateRulesCardProps> = ({
  storageKey = 'flow-state-rules',
}) => {
  const [checkedRules, setCheckedRules] = useState<Set<string>>(new Set());
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Load checked rules from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        setCheckedRules(new Set(parsed));
      }
    } catch (error) {
      console.error('Failed to load flow state rules:', error);
    }
  }, [storageKey]);

  // Save to localStorage when rules change
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(storageKey, JSON.stringify(Array.from(checkedRules)));
    } catch (error) {
      console.error('Failed to save flow state rules:', error);
    }
  }, [checkedRules, storageKey]);

  const toggleRule = (ruleId: string) => {
    setCheckedRules(prev => {
      const newSet = new Set(prev);
      if (newSet.has(ruleId)) {
        newSet.delete(ruleId);
      } else {
        newSet.add(ruleId);
      }
      return newSet;
    });
  };

  const resetAll = () => {
    setCheckedRules(new Set());
    setShowResetConfirm(false);
  };

  const allChecked = checkedRules.size === FLOW_RULES.length;
  const progress = Math.round((checkedRules.size / FLOW_RULES.length) * 100);

  return (
    <div className="space-y-4">
      {/* Progress Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2 rounded-lg transition-colors duration-300",
            allChecked ? "bg-green-500/20" : "bg-orange-500/20"
          )}>
            {allChecked ? (
              <CheckCircle2 className="h-5 w-5 text-green-400" />
            ) : (
              <Zap className="h-5 w-5 text-orange-400" />
            )}
          </div>
          <div>
            <h3 className="text-orange-300 font-bold text-base">Flow State Rules</h3>
            <p className="text-xs text-orange-400/70">
              {allChecked
                ? 'All rules checked! You\'re in flow state.'
                : `${checkedRules.size}/${FLOW_RULES.length} rules checked`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Progress Circle */}
          <div className="relative w-12 h-12">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-orange-900/50"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              />
              <path
                className={cn(
                  "transition-all duration-500",
                  allChecked ? "text-green-400" : "text-orange-400"
                )}
                strokeDasharray={`${progress}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={cn(
                "text-xs font-bold",
                allChecked ? "text-green-400" : "text-orange-300"
              )}>
                {progress}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-orange-900/30 rounded-full h-2">
        <motion.div
          className={cn(
            "h-2 rounded-full transition-colors duration-300",
            allChecked ? "bg-green-500" : "bg-gradient-to-r from-orange-400 to-amber-400"
          )}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {FLOW_RULES.map((rule, index) => {
          const isChecked = checkedRules.has(rule.id);
          const colors = CATEGORY_COLORS[rule.category];
          const Icon = rule.icon;

          return (
            <motion.div
              key={rule.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                className={cn(
                  "cursor-pointer transition-all duration-200 border",
                  isChecked
                    ? "bg-green-500/10 border-green-500/40 opacity-70"
                    : `${colors.bg} ${colors.border} hover:brightness-110`
                )}
                onClick={() => toggleRule(rule.id)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={isChecked}
                      className={cn(
                        "mt-0.5 h-5 w-5 border-2 transition-colors",
                        isChecked
                          ? "border-green-500 bg-green-500 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                          : "border-orange-400/50 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Icon className={cn(
                          "h-4 w-4 flex-shrink-0",
                          isChecked ? "text-green-400" : colors.icon
                        )} />
                        <h4 className={cn(
                          "text-sm font-semibold truncate",
                          isChecked ? "text-green-300 line-through" : "text-orange-100"
                        )}>
                          {rule.title}
                        </h4>
                      </div>
                      <p className={cn(
                        "text-xs mt-1 leading-relaxed",
                        isChecked ? "text-green-400/60" : "text-orange-200/60"
                      )}>
                        {rule.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Reset Button */}
      <div className="flex justify-end pt-2">
        {showResetConfirm ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-orange-400/70">Reset all?</span>
            <button
              onClick={resetAll}
              className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs rounded-lg transition-colors"
            >
              Yes
            </button>
            <button
              onClick={() => setShowResetConfirm(false)}
              className="px-3 py-1.5 bg-orange-900/30 hover:bg-orange-900/50 text-orange-300 text-xs rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowResetConfirm(true)}
            className="text-xs text-orange-400/50 hover:text-orange-400 transition-colors flex items-center gap-1"
          >
            <XCircle className="h-3 w-3" />
            Reset all
          </button>
        )}
      </div>
    </div>
  );
};
