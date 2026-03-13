/**
 * Keyboard Shortcuts Hook - Linear-style keyboard-first interactions
 * Provides global keyboard shortcuts for power users
 */

import { useCallback, useMemo } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

export interface KeyboardShortcut {
  key: string;
  description: string;
  action: () => void;
  preventDefault?: boolean;
  enabled?: boolean;
}

export interface UseKeyboardShortcutsOptions {
  shortcuts: KeyboardShortcut[];
  enabled?: boolean;
}

// Maximum number of shortcuts supported by this hook
const MAX_SHORTCUTS = 20;

// Placeholder key that won't conflict with real shortcuts
const PLACEHOLDER_KEY = '__placeholder__';

/**
 * Hook for managing keyboard shortcuts
 * Uses react-hotkeys-hook for reliable cross-browser support
 */
export function useKeyboardShortcuts({ shortcuts, enabled = true }: UseKeyboardShortcutsOptions) {
  // Pad the shortcuts array to a fixed length so hooks are called unconditionally
  const paddedShortcuts = useMemo(() => {
    const result: KeyboardShortcut[] = [];
    for (let i = 0; i < MAX_SHORTCUTS; i++) {
      if (i < shortcuts.length && shortcuts[i].key) {
        result.push(shortcuts[i]);
      } else {
        // Pad with placeholder shortcuts
        result.push({
          key: `${PLACEHOLDER_KEY}${i}`,
          description: '',
          action: () => {},
          enabled: false,
          preventDefault: false,
        });
      }
    }
    return result;
  }, [shortcuts]);

  // Extract shortcuts for useHotkeys calls - each called unconditionally at top level
  const shortcut0 = paddedShortcuts[0];
  const shortcut1 = paddedShortcuts[1];
  const shortcut2 = paddedShortcuts[2];
  const shortcut3 = paddedShortcuts[3];
  const shortcut4 = paddedShortcuts[4];
  const shortcut5 = paddedShortcuts[5];
  const shortcut6 = paddedShortcuts[6];
  const shortcut7 = paddedShortcuts[7];
  const shortcut8 = paddedShortcuts[8];
  const shortcut9 = paddedShortcuts[9];
  const shortcut10 = paddedShortcuts[10];
  const shortcut11 = paddedShortcuts[11];
  const shortcut12 = paddedShortcuts[12];
  const shortcut13 = paddedShortcuts[13];
  const shortcut14 = paddedShortcuts[14];
  const shortcut15 = paddedShortcuts[15];
  const shortcut16 = paddedShortcuts[16];
  const shortcut17 = paddedShortcuts[17];
  const shortcut18 = paddedShortcuts[18];
  const shortcut19 = paddedShortcuts[19];

  // Each useHotkeys is called unconditionally at the top level
  useHotkeys(
    shortcut0.key,
    (event) => {
      if (shortcut0.enabled !== false && enabled) {
        if (shortcut0.preventDefault !== false) {
          event.preventDefault();
        }
        shortcut0.action();
      }
    },
    { enabled: shortcut0.enabled !== false && enabled, preventDefault: shortcut0.preventDefault !== false },
    [shortcut0.action, shortcut0.enabled, enabled]
  );

  useHotkeys(
    shortcut1.key,
    (event) => {
      if (shortcut1.enabled !== false && enabled) {
        if (shortcut1.preventDefault !== false) {
          event.preventDefault();
        }
        shortcut1.action();
      }
    },
    { enabled: shortcut1.enabled !== false && enabled, preventDefault: shortcut1.preventDefault !== false },
    [shortcut1.action, shortcut1.enabled, enabled]
  );

  useHotkeys(
    shortcut2.key,
    (event) => {
      if (shortcut2.enabled !== false && enabled) {
        if (shortcut2.preventDefault !== false) {
          event.preventDefault();
        }
        shortcut2.action();
      }
    },
    { enabled: shortcut2.enabled !== false && enabled, preventDefault: shortcut2.preventDefault !== false },
    [shortcut2.action, shortcut2.enabled, enabled]
  );

  useHotkeys(
    shortcut3.key,
    (event) => {
      if (shortcut3.enabled !== false && enabled) {
        if (shortcut3.preventDefault !== false) {
          event.preventDefault();
        }
        shortcut3.action();
      }
    },
    { enabled: shortcut3.enabled !== false && enabled, preventDefault: shortcut3.preventDefault !== false },
    [shortcut3.action, shortcut3.enabled, enabled]
  );

  useHotkeys(
    shortcut4.key,
    (event) => {
      if (shortcut4.enabled !== false && enabled) {
        if (shortcut4.preventDefault !== false) {
          event.preventDefault();
        }
        shortcut4.action();
      }
    },
    { enabled: shortcut4.enabled !== false && enabled, preventDefault: shortcut4.preventDefault !== false },
    [shortcut4.action, shortcut4.enabled, enabled]
  );

  useHotkeys(
    shortcut5.key,
    (event) => {
      if (shortcut5.enabled !== false && enabled) {
        if (shortcut5.preventDefault !== false) {
          event.preventDefault();
        }
        shortcut5.action();
      }
    },
    { enabled: shortcut5.enabled !== false && enabled, preventDefault: shortcut5.preventDefault !== false },
    [shortcut5.action, shortcut5.enabled, enabled]
  );

  useHotkeys(
    shortcut6.key,
    (event) => {
      if (shortcut6.enabled !== false && enabled) {
        if (shortcut6.preventDefault !== false) {
          event.preventDefault();
        }
        shortcut6.action();
      }
    },
    { enabled: shortcut6.enabled !== false && enabled, preventDefault: shortcut6.preventDefault !== false },
    [shortcut6.action, shortcut6.enabled, enabled]
  );

  useHotkeys(
    shortcut7.key,
    (event) => {
      if (shortcut7.enabled !== false && enabled) {
        if (shortcut7.preventDefault !== false) {
          event.preventDefault();
        }
        shortcut7.action();
      }
    },
    { enabled: shortcut7.enabled !== false && enabled, preventDefault: shortcut7.preventDefault !== false },
    [shortcut7.action, shortcut7.enabled, enabled]
  );

  useHotkeys(
    shortcut8.key,
    (event) => {
      if (shortcut8.enabled !== false && enabled) {
        if (shortcut8.preventDefault !== false) {
          event.preventDefault();
        }
        shortcut8.action();
      }
    },
    { enabled: shortcut8.enabled !== false && enabled, preventDefault: shortcut8.preventDefault !== false },
    [shortcut8.action, shortcut8.enabled, enabled]
  );

  useHotkeys(
    shortcut9.key,
    (event) => {
      if (shortcut9.enabled !== false && enabled) {
        if (shortcut9.preventDefault !== false) {
          event.preventDefault();
        }
        shortcut9.action();
      }
    },
    { enabled: shortcut9.enabled !== false && enabled, preventDefault: shortcut9.preventDefault !== false },
    [shortcut9.action, shortcut9.enabled, enabled]
  );

  useHotkeys(
    shortcut10.key,
    (event) => {
      if (shortcut10.enabled !== false && enabled) {
        if (shortcut10.preventDefault !== false) {
          event.preventDefault();
        }
        shortcut10.action();
      }
    },
    { enabled: shortcut10.enabled !== false && enabled, preventDefault: shortcut10.preventDefault !== false },
    [shortcut10.action, shortcut10.enabled, enabled]
  );

  useHotkeys(
    shortcut11.key,
    (event) => {
      if (shortcut11.enabled !== false && enabled) {
        if (shortcut11.preventDefault !== false) {
          event.preventDefault();
        }
        shortcut11.action();
      }
    },
    { enabled: shortcut11.enabled !== false && enabled, preventDefault: shortcut11.preventDefault !== false },
    [shortcut11.action, shortcut11.enabled, enabled]
  );

  useHotkeys(
    shortcut12.key,
    (event) => {
      if (shortcut12.enabled !== false && enabled) {
        if (shortcut12.preventDefault !== false) {
          event.preventDefault();
        }
        shortcut12.action();
      }
    },
    { enabled: shortcut12.enabled !== false && enabled, preventDefault: shortcut12.preventDefault !== false },
    [shortcut12.action, shortcut12.enabled, enabled]
  );

  useHotkeys(
    shortcut13.key,
    (event) => {
      if (shortcut13.enabled !== false && enabled) {
        if (shortcut13.preventDefault !== false) {
          event.preventDefault();
        }
        shortcut13.action();
      }
    },
    { enabled: shortcut13.enabled !== false && enabled, preventDefault: shortcut13.preventDefault !== false },
    [shortcut13.action, shortcut13.enabled, enabled]
  );

  useHotkeys(
    shortcut14.key,
    (event) => {
      if (shortcut14.enabled !== false && enabled) {
        if (shortcut14.preventDefault !== false) {
          event.preventDefault();
        }
        shortcut14.action();
      }
    },
    { enabled: shortcut14.enabled !== false && enabled, preventDefault: shortcut14.preventDefault !== false },
    [shortcut14.action, shortcut14.enabled, enabled]
  );

  useHotkeys(
    shortcut15.key,
    (event) => {
      if (shortcut15.enabled !== false && enabled) {
        if (shortcut15.preventDefault !== false) {
          event.preventDefault();
        }
        shortcut15.action();
      }
    },
    { enabled: shortcut15.enabled !== false && enabled, preventDefault: shortcut15.preventDefault !== false },
    [shortcut15.action, shortcut15.enabled, enabled]
  );

  useHotkeys(
    shortcut16.key,
    (event) => {
      if (shortcut16.enabled !== false && enabled) {
        if (shortcut16.preventDefault !== false) {
          event.preventDefault();
        }
        shortcut16.action();
      }
    },
    { enabled: shortcut16.enabled !== false && enabled, preventDefault: shortcut16.preventDefault !== false },
    [shortcut16.action, shortcut16.enabled, enabled]
  );

  useHotkeys(
    shortcut17.key,
    (event) => {
      if (shortcut17.enabled !== false && enabled) {
        if (shortcut17.preventDefault !== false) {
          event.preventDefault();
        }
        shortcut17.action();
      }
    },
    { enabled: shortcut17.enabled !== false && enabled, preventDefault: shortcut17.preventDefault !== false },
    [shortcut17.action, shortcut17.enabled, enabled]
  );

  useHotkeys(
    shortcut18.key,
    (event) => {
      if (shortcut18.enabled !== false && enabled) {
        if (shortcut18.preventDefault !== false) {
          event.preventDefault();
        }
        shortcut18.action();
      }
    },
    { enabled: shortcut18.enabled !== false && enabled, preventDefault: shortcut18.preventDefault !== false },
    [shortcut18.action, shortcut18.enabled, enabled]
  );

  useHotkeys(
    shortcut19.key,
    (event) => {
      if (shortcut19.enabled !== false && enabled) {
        if (shortcut19.preventDefault !== false) {
          event.preventDefault();
        }
        shortcut19.action();
      }
    },
    { enabled: shortcut19.enabled !== false && enabled, preventDefault: shortcut19.preventDefault !== false },
    [shortcut19.action, shortcut19.enabled, enabled]
  );

  // Get shortcut help text
  const getShortcutHelp = useCallback(() => {
    return shortcuts.map((s) => ({
      key: formatShortcutKey(s.key),
      description: s.description,
    }));
  }, [shortcuts]);

  return {
    getShortcutHelp,
  };
}

/**
 * Format a shortcut key for display (e.g., "cmd+k" -> "Cmd K")
 */
function formatShortcutKey(key: string): string {
  return key
    .split('+')
    .map((part) => {
      const trimmed = part.trim();
      if (trimmed === 'cmd' || trimmed === 'meta') return 'Cmd';
      if (trimmed === 'ctrl') return 'Ctrl';
      if (trimmed === 'alt') return 'Alt';
      if (trimmed === 'shift') return 'Shift';
      if (trimmed === 'space') return 'Space';
      if (trimmed === 'esc') return 'Esc';
      return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
    })
    .join(' ');
}

/**
 * Common shortcuts for task management (Linear-style)
 */
export const TASK_SHORTCUTS = {
  // Navigation
  GO_TO_TODAY: 'g t',
  GO_TO_TOMORROW: 'g m',
  GO_TO_YESTERDAY: 'g y',
  GO_TO_DATE: 'g d',

  // Task actions
  NEW_TASK: 'n',
  NEW_SUBTASK: 'shift+n',
  EDIT_TASK: 'e',
  DELETE_TASK: 'shift+delete',
  COMPLETE_TASK: 'space',
  FOCUS_TASK: 'f',

  // View
  COMMAND_PALETTE: 'cmd+k',
  SEARCH: '/',
  FILTER: 'cmd+f',

  // Misc
  CLOSE: 'esc',
  SAVE: 'cmd+s',
  UNDO: 'cmd+z',
  REDO: 'cmd+shift+z',
} as const;

/**
 * Hook specifically for task management shortcuts
 */
export function useTaskShortcuts({
  onNewTask,
  onNewSubtask,
  onEdit,
  onDelete,
  onComplete,
  onFocus,
  onClose,
  onSave,
  hasSelection = false,
  enabled = true,
}: {
  onNewTask?: () => void;
  onNewSubtask?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onComplete?: () => void;
  onFocus?: () => void;
  onClose?: () => void;
  onSave?: () => void;
  hasSelection?: boolean;
  enabled?: boolean;
}) {
  const shortcuts: KeyboardShortcut[] = [
    {
      key: TASK_SHORTCUTS.NEW_TASK,
      description: 'Create new task',
      action: () => onNewTask?.(),
      enabled: !!onNewTask && enabled,
    },
    {
      key: TASK_SHORTCUTS.NEW_SUBTASK,
      description: 'Create new subtask',
      action: () => onNewSubtask?.(),
      enabled: !!onNewSubtask && hasSelection && enabled,
    },
    {
      key: TASK_SHORTCUTS.EDIT_TASK,
      description: 'Edit selected task',
      action: () => onEdit?.(),
      enabled: !!onEdit && hasSelection && enabled,
    },
    {
      key: TASK_SHORTCUTS.DELETE_TASK,
      description: 'Delete selected task',
      action: () => onDelete?.(),
      enabled: !!onDelete && hasSelection && enabled,
    },
    {
      key: TASK_SHORTCUTS.COMPLETE_TASK,
      description: 'Toggle task completion',
      action: () => onComplete?.(),
      enabled: !!onComplete && hasSelection && enabled,
    },
    {
      key: TASK_SHORTCUTS.FOCUS_TASK,
      description: 'Focus on selected task',
      action: () => onFocus?.(),
      enabled: !!onFocus && hasSelection && enabled,
    },
    {
      key: TASK_SHORTCUTS.CLOSE,
      description: 'Close modal/panel',
      action: () => onClose?.(),
      enabled: !!onClose && enabled,
    },
    {
      key: TASK_SHORTCUTS.SAVE,
      description: 'Save changes',
      action: () => onSave?.(),
      enabled: !!onSave && enabled,
    },
  ];

  return useKeyboardShortcuts({ shortcuts, enabled });
}

/**
 * Hook for navigation shortcuts
 */
export function useNavigationShortcuts({
  onGoToToday,
  onGoToTomorrow,
  onGoToYesterday,
  onGoToDate,
  onOpenCommandPalette,
  onSearch,
  enabled = true,
}: {
  onGoToToday?: () => void;
  onGoToTomorrow?: () => void;
  onGoToYesterday?: () => void;
  onGoToDate?: () => void;
  onOpenCommandPalette?: () => void;
  onSearch?: () => void;
  enabled?: boolean;
}) {
  const shortcuts: KeyboardShortcut[] = [
    {
      key: TASK_SHORTCUTS.GO_TO_TODAY,
      description: 'Go to today',
      action: () => onGoToToday?.(),
      enabled: !!onGoToToday && enabled,
    },
    {
      key: TASK_SHORTCUTS.GO_TO_TOMORROW,
      description: 'Go to tomorrow',
      action: () => onGoToTomorrow?.(),
      enabled: !!onGoToTomorrow && enabled,
    },
    {
      key: TASK_SHORTCUTS.GO_TO_YESTERDAY,
      description: 'Go to yesterday',
      action: () => onGoToYesterday?.(),
      enabled: !!onGoToYesterday && enabled,
    },
    {
      key: TASK_SHORTCUTS.GO_TO_DATE,
      description: 'Go to specific date',
      action: () => onGoToDate?.(),
      enabled: !!onGoToDate && enabled,
    },
    {
      key: TASK_SHORTCUTS.COMMAND_PALETTE,
      description: 'Open command palette',
      action: () => onOpenCommandPalette?.(),
      enabled: !!onOpenCommandPalette && enabled,
    },
    {
      key: TASK_SHORTCUTS.SEARCH,
      description: 'Search',
      action: () => onSearch?.(),
      enabled: !!onSearch && enabled,
    },
  ];

  return useKeyboardShortcuts({ shortcuts, enabled });
}
