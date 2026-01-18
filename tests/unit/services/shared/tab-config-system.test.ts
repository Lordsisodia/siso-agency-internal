/**
 * TAB CONFIGURATION SYSTEM TESTS
 * 
 * Tests to verify the decomposed tab configuration system works correctly
 * and maintains backward compatibility with the existing system.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TAB_CONFIG, getAllTabIds, getTabConfig, isValidTabId, getSuggestedTab } from '../tab-config-simple';

describe('Tab Configuration System', () => {
  describe('Backward Compatibility', () => {
    it('should provide TAB_CONFIG object', () => {
      expect(TAB_CONFIG).toBeTruthy();
      expect(typeof TAB_CONFIG).toBe('object');
      
      // Check all expected tab IDs exist
      const expectedIds = ['morning', 'light-work', 'work', 'wellness', 'timebox', 'checkout'];
      expectedIds.forEach(id => {
        expect(TAB_CONFIG[id]).toBeTruthy();
        expect(TAB_CONFIG[id].id).toBe(id);
        expect(TAB_CONFIG[id].name).toBeTruthy();
      });
    });

    it('should provide getAllTabIds function', () => {
      const tabIds = getAllTabIds();
      expect(tabIds).toBeInstanceOf(Array);
      expect(tabIds).toHaveLength(6);
      expect(tabIds).toContain('morning');
      expect(tabIds).toContain('work');
    });

    it('should provide getTabConfig function', () => {
      const morningConfig = getTabConfig('morning');
      expect(morningConfig).toBeTruthy();
      expect(morningConfig.id).toBe('morning');
      expect(morningConfig.name).toBeTruthy();
    });

    it('should provide isValidTabId function', () => {
      expect(isValidTabId('morning')).toBe(true);
      expect(isValidTabId('work')).toBe(true);
      expect(isValidTabId('invalid-tab')).toBe(false);
    });

    it('should provide getSuggestedTab function', () => {
      const suggestion = getSuggestedTab(8);
      expect(suggestion).toBeTruthy();
      expect(getAllTabIds()).toContain(suggestion);
    });
  });

  describe('Tab Configuration Content', () => {
    it('should have valid configuration for all tabs', () => {
      const tabIds = getAllTabIds();
      
      tabIds.forEach(id => {
        const config = getTabConfig(id);
        expect(config.id).toBe(id);
        expect(config.name).toBeTruthy();
        expect(config.color).toBeTruthy();
        expect(config.description).toBeTruthy();
        expect(config.componentPath).toBeTruthy();
        expect(Array.isArray(config.timeRelevance)).toBe(true);
      });
    });
  });

  describe('Time-based Suggestions', () => {
    it('should suggest appropriate tabs for different times', () => {
      // Morning suggestion (6-10)
      const morningSuggestion = getSuggestedTab(8);
      expect(morningSuggestion).toBe('morning');

      // Light work hours (10-14)
      const lightWorkSuggestion = getSuggestedTab(12);
      expect(lightWorkSuggestion).toBe('light-work');

      // Deep work hours (14-17)
      const deepWorkSuggestion = getSuggestedTab(15);
      expect(deepWorkSuggestion).toBe('work');

      // Evening (17-19)
      const eveningSuggestion = getSuggestedTab(18);
      expect(eveningSuggestion).toBe('wellness');

      // Night (19-22)
      const nightSuggestion = getSuggestedTab(20);
      expect(nightSuggestion).toBe('checkout');
    });
  });
});

// Mock console methods for cleaner test output
beforeEach(() => {
  vi.spyOn(console, 'debug').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});