import { useAuth } from '@clerk/clerk-react';
import { subDays } from 'date-fns';
import { useCallback, useEffect, useMemo, useReducer } from 'react';

import { DailyReflection, useDailyReflections } from '@/shared/hooks/useDailyReflections';

export interface NightlyCheckoutForm {
  winOfDay: string;
  mood: string;
  bedTime: string;
  wentWell: string[];
  evenBetterIf: string[];
  dailyAnalysis: string;
  actionItems: string;
  overallRating?: number;
  energyLevel?: number;
  keyLearnings: string;
  tomorrowFocus: string;
  tomorrowTopTasks: string[];
}

export interface MoodOption {
  emoji: string;
  label: string;
  value: string;
}

interface NightlyCheckoutState {
  form: NightlyCheckoutForm;
  isEditingBedTime: boolean;
  isRecordingVoice: boolean;
  hasUserEdited: boolean;
}

type ArrayField = 'wentWell' | 'evenBetterIf' | 'tomorrowTopTasks';
type MutableArrayField = Exclude<ArrayField, 'tomorrowTopTasks'>;

type NightlyCheckoutAction =
  | { type: 'SET_FORM'; form: NightlyCheckoutForm }
  | { type: 'SET_FIELD'; field: keyof NightlyCheckoutForm; value: NightlyCheckoutForm[keyof NightlyCheckoutForm] }
  | { type: 'SET_ARRAY_ITEM'; field: ArrayField; index: number; value: string }
  | { type: 'ADD_ARRAY_ITEM'; field: MutableArrayField }
  | { type: 'REMOVE_ARRAY_ITEM'; field: MutableArrayField; index: number }
  | { type: 'SET_EDITING_BEDTIME'; value: boolean }
  | { type: 'SET_RECORDING_VOICE'; value: boolean }
  | { type: 'RESET_DIRTY' };

const createDefaultForm = (): NightlyCheckoutForm => ({
  winOfDay: '',
  mood: '',
  bedTime: '',
  wentWell: [''],
  evenBetterIf: [''],
  dailyAnalysis: '',
  actionItems: '',
  overallRating: undefined,
  energyLevel: undefined,
  keyLearnings: '',
  tomorrowFocus: '',
  tomorrowTopTasks: ['', '', '']
});

const mapReflectionToForm = (reflection: DailyReflection | null | undefined): NightlyCheckoutForm => ({
  winOfDay: reflection?.winOfDay ?? '',
  mood: reflection?.mood ?? '',
  bedTime: reflection?.bedTime ?? '',
  wentWell: reflection?.wentWell && reflection.wentWell.length > 0 ? reflection.wentWell : [''],
  evenBetterIf: reflection?.evenBetterIf && reflection.evenBetterIf.length > 0 ? reflection.evenBetterIf : [''],
  dailyAnalysis: reflection?.dailyAnalysis ?? '',
  actionItems: reflection?.actionItems ?? '',
  overallRating: reflection?.overallRating ?? undefined,
  energyLevel: reflection?.energyLevel ?? undefined,
  keyLearnings: reflection?.keyLearnings ?? '',
  tomorrowFocus: reflection?.tomorrowFocus ?? '',
  tomorrowTopTasks:
    reflection?.tomorrowTopTasks && reflection.tomorrowTopTasks.length > 0
      ? reflection.tomorrowTopTasks
      : ['', '', '']
});

const initialState: NightlyCheckoutState = {
  form: createDefaultForm(),
  isEditingBedTime: false,
  isRecordingVoice: false,
  hasUserEdited: false
};

const nightlyCheckoutReducer = (state: NightlyCheckoutState, action: NightlyCheckoutAction): NightlyCheckoutState => {
  switch (action.type) {
    case 'SET_FORM':
      return {
        ...state,
        form: action.form,
        isEditingBedTime: false,
        isRecordingVoice: false,
        hasUserEdited: false
      };
    case 'SET_FIELD':
      return {
        ...state,
        form: {
          ...state.form,
          [action.field]: action.value
        },
        hasUserEdited: true
      };
    case 'SET_ARRAY_ITEM': {
      const currentArray = state.form[action.field];
      const updatedArray = currentArray.map((item, idx) => (idx === action.index ? action.value : item));

      return {
        ...state,
        form: {
          ...state.form,
          [action.field]: updatedArray
        },
        hasUserEdited: true
      };
    }
    case 'ADD_ARRAY_ITEM': {
      const updatedArray = [...state.form[action.field], ''];
      return {
        ...state,
        form: {
          ...state.form,
          [action.field]: updatedArray
        },
        hasUserEdited: true
      };
    }
    case 'REMOVE_ARRAY_ITEM': {
      const array = state.form[action.field];
      if (array.length <= 1) {
        return state;
      }

      const updatedArray = array.filter((_, idx) => idx !== action.index);

      return {
        ...state,
        form: {
          ...state.form,
          [action.field]: updatedArray
        },
        hasUserEdited: true
      };
    }
    case 'SET_EDITING_BEDTIME':
      return {
        ...state,
        isEditingBedTime: action.value
      };
    case 'SET_RECORDING_VOICE':
      return {
        ...state,
        isRecordingVoice: action.value
      };
    case 'RESET_DIRTY':
      return {
        ...state,
        hasUserEdited: false
      };
    default:
      return state;
  }
};

const MOODS: MoodOption[] = [
  { emoji: '😊', label: 'Great', value: 'great' },
  { emoji: '😐', label: 'Okay', value: 'okay' },
  { emoji: '😰', label: 'Stressed', value: 'stressed' },
  { emoji: '😤', label: 'Frustrated', value: 'frustrated' },
  { emoji: '😔', label: 'Down', value: 'down' },
  { emoji: '😌', label: 'Peaceful', value: 'peaceful' }
];

export const useNightlyCheckout = (selectedDate: Date) => {
  const { userId } = useAuth();
  const { reflection, loading, saving, saveReflection } = useDailyReflections({ selectedDate });
  const yesterday = subDays(selectedDate, 1);
  const { reflection: yesterdayReflection } = useDailyReflections({ selectedDate: yesterday });

  const [state, dispatch] = useReducer(nightlyCheckoutReducer, initialState);

  useEffect(() => {
    dispatch({ type: 'SET_FORM', form: mapReflectionToForm(reflection) });
  }, [reflection]);

  useEffect(() => {
    if (!userId || loading || !state.hasUserEdited) {
      return;
    }

    const timer = setTimeout(async () => {
      await saveReflection(state.form);
      dispatch({ type: 'RESET_DIRTY' });
    }, 1000);

    return () => clearTimeout(timer);
  }, [state.form, state.hasUserEdited, userId, loading, saveReflection]);

  const updateField = useCallback(
    (field: keyof NightlyCheckoutForm, value: NightlyCheckoutForm[keyof NightlyCheckoutForm]) => {
      dispatch({ type: 'SET_FIELD', field, value });
    },
    []
  );

  const updateArrayItem = useCallback((field: ArrayField, index: number, value: string) => {
    dispatch({ type: 'SET_ARRAY_ITEM', field, index, value });
  }, []);

  const addArrayItem = useCallback((field: MutableArrayField) => {
    dispatch({ type: 'ADD_ARRAY_ITEM', field });
  }, []);

  const removeArrayItem = useCallback((field: MutableArrayField, index: number) => {
    dispatch({ type: 'REMOVE_ARRAY_ITEM', field, index });
  }, []);

  const setBedTimeEditing = useCallback((value: boolean) => {
    dispatch({ type: 'SET_EDITING_BEDTIME', value });
  }, []);

  const setVoiceRecording = useCallback((value: boolean) => {
    dispatch({ type: 'SET_RECORDING_VOICE', value });
  }, []);

  const getCurrentTimeLabel = useCallback(() => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, []);

  const setCurrentTimeAsBedTime = useCallback(() => {
    const currentTime = getCurrentTimeLabel();
    dispatch({ type: 'SET_FIELD', field: 'bedTime', value: currentTime });
    dispatch({ type: 'SET_EDITING_BEDTIME', value: false });
  }, [getCurrentTimeLabel]);

  const currentStreak = useMemo(() => {
    return reflection?.overallRating ? 1 : 0;
  }, [reflection]);

  const checkoutProgress = useMemo(() => {
    const { form } = state;
    let completed = 0;
    const total = 8;

    if (form.winOfDay.trim()) completed++;
    if (form.mood) completed++;
    if (form.wentWell.some((item) => item.trim() !== '')) completed++;
    if (form.evenBetterIf.some((item) => item.trim() !== '')) completed++;
    if (form.dailyAnalysis.trim()) completed++;
    if (form.actionItems.trim()) completed++;
    if (form.keyLearnings.trim()) completed++;
    if (form.tomorrowTopTasks.some((task) => task.trim() !== '')) completed++;

    return total > 0 ? (completed / total) * 100 : 0;
  }, [state]);

  const checkoutXP = useMemo(() => {
    const baseXP = 8;
    const streakBonus = Math.min(currentStreak * 2, 50);
    const completionBonus = checkoutProgress === 100 ? 25 : 0;
    return baseXP + streakBonus + completionBonus;
  }, [currentStreak, checkoutProgress]);

  return {
    form: state.form,
    isEditingBedTime: state.isEditingBedTime,
    isRecordingVoice: state.isRecordingVoice,
    isLoading: loading,
    isSaving: saving,
    checkoutProgress,
    checkoutXP,
    currentStreak,
    yesterdayReflection,
    moods: MOODS,
    updateField,
    updateArrayItem,
    addArrayItem,
    removeArrayItem,
    setBedTimeEditing,
    setVoiceRecording,
    setCurrentTimeAsBedTime,
    getCurrentTimeLabel
  };
};
