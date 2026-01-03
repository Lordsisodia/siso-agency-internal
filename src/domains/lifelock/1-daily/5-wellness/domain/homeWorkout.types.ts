export type ExerciseUnit = 'reps' | 'seconds';

export type ExerciseKey = 'pushUps' | 'squats' | 'planks' | 'sitUps' | 'custom';

export interface ExerciseConfig {
  key: ExerciseKey;
  title: string;
  icon: string;
  unit: ExerciseUnit;
  defaultGoal: number;
  aliases?: string[];
}

const DEFAULT_EXERCISE_ICON = '🏋️';

const DEFAULT_EXERCISE_CONFIG: ExerciseConfig = {
  key: 'custom',
  title: 'Custom Exercise',
  icon: DEFAULT_EXERCISE_ICON,
  unit: 'reps',
  defaultGoal: 50,
};

export const HOME_WORKOUT_EXERCISES: ExerciseConfig[] = [
  {
    key: 'pushUps',
    title: 'Push-ups',
    icon: '💪',
    unit: 'reps',
    defaultGoal: 200,
    aliases: ['pushups', 'push up', 'push-up'],
  },
  {
    key: 'squats',
    title: 'Squats',
    icon: '🦵',
    unit: 'reps',
    defaultGoal: 100,
    aliases: ['squat', 'bodyweight squat'],
  },
  {
    key: 'planks',
    title: 'Planks',
    icon: '⏱️',
    unit: 'seconds',
    defaultGoal: 300,
    aliases: ['plank', 'planking'],
  },
  {
    key: 'sitUps',
    title: 'Sit-ups',
    icon: '🏋️',
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
