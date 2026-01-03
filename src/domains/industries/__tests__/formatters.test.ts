import { describe, expect, it } from 'vitest';
import { formatIndustryFocus, formatIndustryStatus } from '@/domains/industries/utils/formatters';

describe('industry formatters', () => {
  it('formats known status values with friendly labels', () => {
    expect(formatIndustryStatus('in_development')).toBe('In Development');
    expect(formatIndustryStatus('research')).toBe('Research');
  });

  it('fallbacks to title case for unknown status values', () => {
    expect(formatIndustryStatus('custom_status')).toBe('Custom Status');
  });

  it('formats focus levels with friendly labels', () => {
    expect(formatIndustryFocus('primary')).toBe('Primary Focus');
    expect(formatIndustryFocus('experimental')).toBe('Experimental');
  });
});
