/**
 * Tab Configuration Tests
 * 
 * These tests ensure tab routing consistency and prevent regressions
 */

import { TAB_CONFIG, getAllTabIds, isValidTabId, validateTabHandler, TabId } from './tab-config';

describe('Tab Configuration', () => {
  test('should have all required tab IDs', () => {
    const expectedTabs: TabId[] = [
      'morning', 'light-work', 'work', 'wellness', 'timebox', 'checkout'
    ];
    
    const actualTabs = getAllTabIds();
    
    expect(actualTabs.sort()).toEqual(expectedTabs.sort());
  });

  test('should validate tab IDs correctly', () => {
    // Valid tab IDs
    expect(isValidTabId('morning')).toBe(true);
    expect(isValidTabId('light-work')).toBe(true);
    expect(isValidTabId('checkout')).toBe(true);
    
    // Invalid tab IDs
    expect(isValidTabId('invalid')).toBe(false);
    expect(isValidTabId('ai')).toBe(false); // Common mistake
    expect(isValidTabId('light')).toBe(false); // Common mistake
  });

  test('should detect missing tab handlers', () => {
    // All tabs handled - should return empty array
    const allHandled = new Set(getAllTabIds());
    expect(validateTabHandler(allHandled)).toEqual([]);
    
    // Missing some tabs - should return missing ones
    const partialHandled = new Set(['morning', 'work']);
    const missing = validateTabHandler(partialHandled);
    expect(missing.length).toBeGreaterThan(0);
    expect(missing).toContain('light-work');
    expect(missing).toContain('wellness');
  });

  test('should have required properties for each tab', () => {
    getAllTabIds().forEach(tabId => {
      const config = TAB_CONFIG[tabId];
      
      expect(config).toBeDefined();
      expect(config.id).toBe(tabId);
      expect(config.name).toBeTruthy();
      expect(config.icon).toBeTruthy();
      expect(Array.isArray(config.timeRelevance)).toBe(true);
      expect(config.color).toBeTruthy();
      expect(config.description).toBeTruthy();
      expect(config.componentPath).toBeTruthy();
    });
  });

  test('should prevent common tab ID mistakes', () => {
    // These are common mistakes that have caused bugs
    const commonMistakes = ['ai', 'light', 'deep-work', 'chat'];
    
    commonMistakes.forEach(mistake => {
      expect(isValidTabId(mistake)).toBe(false);
    });
  });
});

/**
 * Integration Test Helper
 * Use this in component tests to verify switch statement coverage
 */
export const assertAllTabsCovered = (switchCases: string[]): void => {
  const allTabs = getAllTabIds();
  const missingCases = allTabs.filter(tab => !switchCases.includes(tab));
  
  if (missingCases.length > 0) {
    throw new Error(
      `Missing switch cases for tabs: ${missingCases.join(', ')}\n` +
      `Add these cases to your switch statement:\n` +
      missingCases.map(tab => `  case '${tab}': ...`).join('\n')
    );
  }
};