import { FOCUS_LABELS, STATUS_LABELS } from '@/domains/agency/industries/constants';

export const formatIndustryStatus = (status: keyof typeof STATUS_LABELS | string): string => {
  if (status in STATUS_LABELS) {
    return STATUS_LABELS[status as keyof typeof STATUS_LABELS];
  }

  return status.replace(/[_-]+/g, ' ').replace(/\b\w/g, (match) => match.toUpperCase());
};

export const formatIndustryFocus = (focus: keyof typeof FOCUS_LABELS | string): string => {
  if (focus in FOCUS_LABELS) {
    return FOCUS_LABELS[focus as keyof typeof FOCUS_LABELS];
  }

  return focus.replace(/[_-]+/g, ' ').replace(/\b\w/g, (match) => match.toUpperCase());
};
