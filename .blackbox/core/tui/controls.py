"""
Keyboard Controls for Blackbox4 TUI

Provides keyboard control handling with:
- Key binding management
- Control scheme definitions
- Input event handling
- Action callbacks
"""

from typing import Dict, Callable, Optional, Any
from enum import Enum
from blessed import Terminal


class ControlScheme(Enum):
    """Predefined control schemes."""
    DEFAULT = "default"
    VIM = "vim"
    EMACS = "emacs"


class KeyboardController:
    """
    Manages keyboard input and control bindings.

    Features:
    - Configurable key bindings
    - Action callbacks
    - Input loop management
    - Key sequence handling
    """

    # Default control bindings
    DEFAULT_CONTROLS = {
        'q': 'Quit',
        'Q': 'Quit (force)',
        'p': 'Pause/Resume',
        's': 'Skip current task',
        'r': 'Retry failed task',
        '↑': 'Navigate up',
        '↓': 'Navigate down',
        '→': 'Expand/Next',
        '←': 'Collapse/Previous',
        'Enter': 'Select/Execute',
        'l': 'Focus log panel',
        't': 'Focus task panel',
        '/': 'Search',
        'f': 'Filter tasks',
        'v': 'View task details',
        'e': 'Edit task',
        'd': 'Delete task',
        'n': 'New task',
        'h': 'Help',
        'R': 'Refresh',
        'Esc': 'Cancel/Back',
    }

    VIM_CONTROLS = {
        'q': 'Quit',
        'p': 'Pause/Resume',
        'j': 'Navigate down',
        'k': 'Navigate up',
        'l': 'Expand/Next',
        'h': 'Collapse/Previous',
        'o': 'Select/Execute',
        'u': 'Scroll up',
        'd': 'Scroll down',
        'G': 'Go to bottom',
        'g': 'Go to top',
        '/': 'Search',
        'n': 'Next search result',
        'N': 'Previous search result',
        'v': 'Visual mode',
        ':': 'Command mode',
        'i': 'Insert mode',
        'Esc': 'Normal mode',
    }

    EMACS_CONTROLS = {
        'C-x C-c': 'Quit',
        'C-x s': 'Pause/Resume',
        'C-n': 'Navigate down',
        'C-p': 'Navigate up',
        'C-f': 'Next/Forward',
        'C-b': 'Previous/Back',
        'C-v': 'Page down',
        'M-v': 'Page up',
        'C-s': 'Search',
        'C-g': 'Cancel',
        'Enter': 'Select/Execute',
        'C-x C-f': 'Open file',
        'C-x C-b': 'Switch buffer',
        'C-h': 'Help',
    }

    def __init__(
        self,
        term: Terminal,
        scheme: ControlScheme = ControlScheme.DEFAULT,
        custom_bindings: Optional[Dict[str, str]] = None
    ):
        """
        Initialize keyboard controller.

        Args:
            term: Blessed Terminal instance
            scheme: Control scheme to use
            custom_bindings: Optional custom key bindings
        """
        self.term = term
        self.scheme = scheme
        self.bindings = self._get_bindings(scheme)
        self.action_callbacks: Dict[str, Callable] = {}

        # Apply custom bindings
        if custom_bindings:
            self.bindings.update(custom_bindings)

        # Input state
        self.key_sequence = []
        self.current_panel = "tasks"  # 'tasks' or 'logs'

    def _get_bindings(self, scheme: ControlScheme) -> Dict[str, str]:
        """Get bindings for control scheme."""
        if scheme == ControlScheme.VIM:
            return self.VIM_CONTROLS.copy()
        elif scheme == ControlScheme.EMACS:
            return self.EMACS_CONTROLS.copy()
        else:
            return self.DEFAULT_CONTROLS.copy()

    def register_callback(self, action: str, callback: Callable):
        """
        Register a callback for an action.

        Args:
            action: Action name
            callback: Callback function
        """
        self.action_callbacks[action] = callback

    def unregister_callback(self, action: str):
        """
        Unregister a callback for an action.

        Args:
            action: Action name
        """
        if action in self.action_callbacks:
            del self.action_callbacks[action]

    def get_action_description(self, key: str) -> Optional[str]:
        """
        Get description for a key binding.

        Args:
            key: Key to look up

        Returns:
            Action description or None
        """
        return self.bindings.get(key)

    def get_controls_for_display(self) -> Dict[str, str]:
        """
        Get controls formatted for display in footer.

        Returns:
            Dictionary of key -> description mappings
        """
        # Show most important controls
        if self.scheme == ControlScheme.DEFAULT:
            return {
                '↑↓': 'Navigate',
                'Enter': 'Select',
                'p': 'Pause',
                's': 'Skip',
                'q': 'Quit',
                'l/t': 'Panel',
                'h': 'Help',
            }
        elif self.scheme == ControlScheme.VIM:
            return {
                'j/k': 'Navigate',
                'o': 'Select',
                'p': 'Pause',
                's': 'Skip',
                'q': 'Quit',
                'h': 'Help',
            }
        else:  # EMACS
            return {
                'C-n/C-p': 'Navigate',
                'Enter': 'Select',
                'C-x s': 'Pause',
                'C-x C-c': 'Quit',
                'C-h': 'Help',
            }

    def handle_input(self, key: str) -> Optional[str]:
        """
        Handle keyboard input.

        Args:
            key: Key pressed

        Returns:
            Action name if action triggered, None otherwise
        """
        # Build key sequence for chords (e.g., C-x C-c)
        self.key_sequence.append(key)

        # Check if sequence matches a binding
        sequence_str = ' '.join(self.key_sequence)

        if sequence_str in self.bindings:
            action = self.bindings[sequence_str]
            self.key_sequence = []
            return self._execute_action(action)

        # Check if partial match (for chorded keys)
        is_partial = any(
            binding.startswith(sequence_str)
            for binding in self.bindings
        )

        if not is_partial:
            # No match, reset sequence
            self.key_sequence = []

        return None

    def _execute_action(self, action: str) -> Optional[str]:
        """
        Execute an action.

        Args:
            action: Action description

        Returns:
            Action name if executed, None otherwise
        """
        # Map action descriptions to action names
        action_map = {
            'Quit': 'quit',
            'Quit (force)': 'quit_force',
            'Pause/Resume': 'toggle_pause',
            'Skip current task': 'skip_task',
            'Retry failed task': 'retry_task',
            'Navigate up': 'navigate_up',
            'Navigate down': 'navigate_down',
            'Expand/Next': 'expand_next',
            'Collapse/Previous': 'collapse_prev',
            'Select/Execute': 'select',
            'Focus log panel': 'focus_logs',
            'Focus task panel': 'focus_tasks',
            'Search': 'search',
            'Filter tasks': 'filter',
            'View task details': 'view_details',
            'Edit task': 'edit_task',
            'Delete task': 'delete_task',
            'New task': 'new_task',
            'Help': 'help',
            'Refresh': 'refresh',
            'Cancel/Back': 'cancel',
            'Scroll up': 'scroll_up',
            'Scroll down': 'scroll_down',
            'Go to bottom': 'go_bottom',
            'Go to top': 'go_top',
            'Visual mode': 'visual_mode',
            'Command mode': 'command_mode',
            'Insert mode': 'insert_mode',
            'Normal mode': 'normal_mode',
            'Next search result': 'next_search',
            'Previous search result': 'prev_search',
            'Page down': 'page_down',
            'Page up': 'page_up',
            'Next/Forward': 'next',
            'Previous/Back': 'prev',
            'Open file': 'open_file',
            'Switch buffer': 'switch_buffer',
        }

        action_name = action_map.get(action)
        if action_name and action_name in self.action_callbacks:
            callback = self.action_callbacks[action_name]
            callback()
            return action_name

        return action_name

    def read_key(self) -> str:
        """
        Read a single key from the terminal.

        Returns:
            Key string
        """
        with self.term.cbreak():
            key = self.term.inkey(timeout=None)
        return str(key)

    def enter_input_loop(
        self,
        update_callback: Callable[[], None],
        quit_condition: Optional[Callable[[], bool]] = None
    ):
        """
        Enter the main input loop.

        Args:
            update_callback: Function to call for UI updates
            quit_condition: Optional function to check quit condition
        """
        while True:
            # Update UI
            update_callback()

            # Check quit condition
            if quit_condition and quit_condition():
                break

            # Read input
            key = self.read_key()

            # Handle input
            action = self.handle_input(key)

            # Check for quit
            if action == 'quit' or action == 'quit_force':
                break


class ActionController:
    """
    Controller for managing TUI actions and callbacks.

    Provides a clean interface for registering and managing
    TUI actions with callbacks.
    """

    def __init__(self, keyboard_controller: KeyboardController):
        """
        Initialize action controller.

        Args:
            keyboard_controller: Keyboard controller instance
        """
        self.keyboard = keyboard_controller
        self.state: Dict[str, Any] = {
            'paused': False,
            'current_task_index': 0,
            'selected_task_id': None,
            'panel_focus': 'tasks',  # 'tasks' or 'logs'
            'filter_text': '',
            'search_query': '',
        }

    def setup_default_callbacks(self, tui_instance):
        """
        Set up default callbacks for TUI actions.

        Args:
            tui_instance: BlackboxTUI instance
        """
        # Navigation
        self.keyboard.register_callback('navigate_up', lambda: self._navigate_up(tui_instance))
        self.keyboard.register_callback('navigate_down', lambda: self._navigate_down(tui_instance))
        self.keyboard.register_callback('expand_next', lambda: self._expand_next(tui_instance))
        self.keyboard.register_callback('collapse_prev', lambda: self._collapse_prev(tui_instance))

        # Task operations
        self.keyboard.register_callback('select', lambda: self._select_task(tui_instance))
        self.keyboard.register_callback('skip_task', lambda: self._skip_task(tui_instance))
        self.keyboard.register_callback('retry_task', lambda: self._retry_task(tui_instance))
        self.keyboard.register_callback('view_details', lambda: self._view_details(tui_instance))

        # Session control
        self.keyboard.register_callback('toggle_pause', lambda: self._toggle_pause(tui_instance))
        self.keyboard.register_callback('quit', lambda: self._quit(tui_instance))
        self.keyboard.register_callback('quit_force', lambda: self._quit_force(tui_instance))

        # Panel control
        self.keyboard.register_callback('focus_logs', lambda: self._focus_logs(tui_instance))
        self.keyboard.register_callback('focus_tasks', lambda: self._focus_tasks(tui_instance))

        # Utility
        self.keyboard.register_callback('refresh', lambda: self._refresh(tui_instance))
        self.keyboard.register_callback('help', lambda: self._show_help(tui_instance))

    def _navigate_up(self, tui):
        """Handle navigate up action."""
        if self.state['panel_focus'] == 'tasks':
            tui.task_panel.scroll_up()
        else:
            tui.log_panel.scroll_up()

    def _navigate_down(self, tui):
        """Handle navigate down action."""
        if self.state['panel_focus'] == 'tasks':
            tui.task_panel.scroll_down(len(tui.tasks))
        else:
            tui.log_panel.scroll_down()

    def _expand_next(self, tui):
        """Handle expand next action."""
        # Implementation depends on task hierarchy
        pass

    def _collapse_prev(self, tui):
        """Handle collapse previous action."""
        # Implementation depends on task hierarchy
        pass

    def _select_task(self, tui):
        """Handle task selection."""
        # Implementation for task selection
        pass

    def _skip_task(self, tui):
        """Handle skip task action."""
        self.state['paused'] = False
        # Signal executor to skip current task
        if hasattr(tui, 'executor') and tui.executor:
            tui.executor.skip_current_task()

    def _retry_task(self, tui):
        """Handle retry task action."""
        # Implementation for retrying failed tasks
        pass

    def _view_details(self, tui):
        """Handle view details action."""
        # Implementation for viewing task details
        pass

    def _toggle_pause(self, tui):
        """Handle pause toggle action."""
        self.state['paused'] = not self.state['paused']
        # Signal executor to pause/resume
        if hasattr(tui, 'executor') and tui.executor:
            if self.state['paused']:
                tui.executor.pause()
            else:
                tui.executor.resume()

    def _quit(self, tui):
        """Handle quit action."""
        # Graceful quit - wait for current task to complete
        if hasattr(tui, 'executor') and tui.executor:
            tui.executor.shutdown()
        tui.running = False

    def _quit_force(self, tui):
        """Handle force quit action."""
        # Immediate quit - kill current task
        if hasattr(tui, 'executor') and tui.executor:
            tui.executor.kill()
        tui.running = False

    def _focus_logs(self, tui):
        """Handle focus logs action."""
        self.state['panel_focus'] = 'logs'

    def _focus_tasks(self, tui):
        """Handle focus tasks action."""
        self.state['panel_focus'] = 'tasks'

    def _refresh(self, tui):
        """Handle refresh action."""
        # Force UI refresh
        pass

    def _show_help(self, tui):
        """Handle show help action."""
        # Display help dialog
        pass
