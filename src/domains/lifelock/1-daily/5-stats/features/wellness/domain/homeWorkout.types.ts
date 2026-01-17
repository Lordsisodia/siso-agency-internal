export type ExerciseUnit = 'reps' | 'seconds';

export type ExerciseKey = 'pushUps' | 'squats' | 'planks' | 'sitUps' | 'custom';

import { LucideIcon } from 'lucide-react';
import { Hand, PersonStanding, Timer, Activity, Dumbbell } from 'lucide-react';

export interface ExerciseConfig {
  key: ExerciseKey;
  title: string;
  emoji: string;
  icon: LucideIcon;
  unit: ExerciseUnit;
  defaultGoal: number;
  aliases?: string[];
}

const DEFAULT_EXERCISE_EMOJI = '🏋️';
const DEFAULT_EXERCISE_ICON = Dumbbell;

const DEFAULT_EXERCISE_CONFIG: ExerciseConfig = {
  key: 'custom',
  title: 'Custom Exercise',
  emoji: DEFAULT_EXERCISE_EMOJI,
  icon: DEFAULT_EXERCISE_ICON,
  unit: 'reps',
  defaultGoal: 50,
};

export const HOME_WORKOUT_EXERCISES: ExerciseConfig[] = [
  {
    key: 'pushUps',
    title: 'Push-ups',
    emoji: '💪',
    icon: Hand,
    unit: 'reps',
    defaultGoal: 200,
    aliases: ['pushups', 'push up', 'push-up'],
  },
  {
    key: 'squats',
    title: 'Squats',
    emoji: '🦵',
    icon: PersonStanding,
    unit: 'reps',
    defaultGoal: 100,
    aliases: ['squat', 'bodyweight squat'],
  },
  {
    key: 'planks',
    title: 'Planks',
    emoji: '⏱️',
    icon: Timer,
    unit: 'seconds',
    defaultGoal: 300,
    aliases: ['plank', 'planking'],
  },
  {
    key: 'sitUps',
    title: 'Sit-ups',
    emoji: '🏋️',
    icon: Activity,
    unit: 'reps',
    defaultGoal: 100,
    aliases: ['situps', 'sit up', 'sit-up', 'ab crunch'],
  },
];

const normalizeExerciseName = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z]/g, '');

const exerciseLookup = new Map<string, ExerciseConfig>();

HOME_WORKOUT_EXERCISES.forEach((config) => {
  const normalizedTitle = normalizeExerciseName(config.title);
  exerciseLookup.set(normalizedTitle, config);

  config.aliases?.forEach((alias) => {
    exerciseLookup.set(normalizeExerciseName(alias), config);
  });
});

export const HOME_WORKOUT_EXERCISE_ORDER = new Map<ExerciseKey, number>(
  HOME_WORKOUT_EXERCISES.map((config, index) => [config.key, index]),
);

export const resolveExerciseConfig = (title: string): ExerciseConfig => {
  const normalized = normalizeExerciseName(title);
  const match = exerciseLookup.get(normalized);

  if (match) {
    return match;
  }

  return {
    ...DEFAULT_EXERCISE_CONFIG,
    title: title || DEFAULT_EXERCISE_CONFIG.title,
  };
};

export const getExerciseUnitLabel = (unit: ExerciseUnit): string =>
  unit === 'seconds' ? 'seconds' : 'reps';
