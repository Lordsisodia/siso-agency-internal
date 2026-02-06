/**
 * Keyboard Shortcuts Hook - Linear-style keyboard-first interactions
 * Provides global keyboard shortcuts for power users
 */

import { useEffect, useCallback, useRef } from 'react';
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

/**
 * Hook for managing keyboard shortcuts
 * Uses react-hotkeys-hook for reliable cross-browser support
 */
export function useKeyboardShortcuts({ shortcuts, enabled = true }: UseKeyboardShortcutsOptions) {
  const shortcutsRef = useRef(shortcuts);

  // Keep shortcuts ref up to date
  useEffect(() => {
    shortcutsRef.current = shortcuts;
  }, [shortcuts]);

  // Register each shortcut
  shortcuts.forEach((shortcut) => {
    useHotkeys(
      shortcut.key,
      (event) => {
        if (shortcut.enabled !== false && enabled) {
          if (shortcut.preventDefault !== false) {
            event.preventDefault();
          }
          shortcut.action();
        }
      },
      {
        enabled: shortcut.enabled !== false && enabled,
        preventDefault: shortcut.preventDefault !== false,
      },
      [shortcut.action, shortcut.enabled, enabled]
    );
  });

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
