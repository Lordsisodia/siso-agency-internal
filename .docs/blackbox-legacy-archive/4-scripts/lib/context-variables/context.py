"""
Context Variable Implementation
Swarm-style context variables for Blackbox4 agents
"""

from typing import Any, Dict, Optional, TypeVar, Generic
from contextvars import ContextVar
import json

T = TypeVar('T')


class context_var(Generic[T]):
    """
    Wrapper around Python's contextvars for agent context management
    """

    _vars: Dict[str, ContextVar] = {}

    def __init__(self, name: str, default: Optional[T] = None):
        """
        Initialize a context variable

        Args:
            name: Variable name
            default: Default value if not set
        """
        if name not in context_var._vars:
            context_var._vars[name] = ContextVar(name, default=default)
        self._var = context_var._vars[name]
        self.name = name
        self.default = default

    def get(self, default: Optional[T] = None) -> Optional[T]:
        """Get current value"""
        return self._var.get(default if default is not None else self.default)

    def set(self, value: T) -> 'context_var[T]':
        """Set value in current context"""
        self._var.set(value)
        return self

    def reset(self, token) -> None:
        """Reset to previous value"""
        self._var.reset(token)

    def __repr__(self) -> str:
        return f"context_var({self.name}={self.get()})"


class AgentContext:
    """
    Context manager for agent execution
    Renamed from Context to avoid conflict with Python's built-in types module
    """

    def __init__(self, initial_vars: Optional[Dict[str, Any]] = None):
        """
        Initialize context

        Args:
            initial_vars: Initial variable values
        """
        self._vars: Dict[str, Any] = initial_vars or {}
        self._context_vars: Dict[str, context_var] = {}

    def set(self, name: str, value: Any) -> None:
        """Set a context variable"""
        if name not in self._context_vars:
            self._context_vars[name] = context_var(name)
        self._context_vars[name].set(value)
        self._vars[name] = value

    def get(self, name: str, default: Any = None) -> Any:
        """Get a context variable"""
        if name in self._context_vars:
            return self._context_vars[name].get(default)
        return self._vars.get(name, default)

    def to_dict(self) -> Dict[str, Any]:
        """Convert context to dictionary"""
        result = {}
        for name, var in self._context_vars.items():
            result[name] = var.get()
        result.update(self._vars)
        return result

    def to_json(self) -> str:
        """Convert context to JSON string"""
        return json.dumps(self.to_dict(), indent=2, default=str)

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'AgentContext':
        """Create context from dictionary"""
        context = cls()
        for name, value in data.items():
            context.set(name, value)
        return context

    @classmethod
    def from_json(cls, json_str: str) -> 'AgentContext':
        """Create context from JSON string"""
        data = json.loads(json_str)
        return cls.from_dict(data)

    def __repr__(self) -> str:
        return f"AgentContext({self.to_dict()})"


# Alias for backward compatibility
Context = AgentContext
