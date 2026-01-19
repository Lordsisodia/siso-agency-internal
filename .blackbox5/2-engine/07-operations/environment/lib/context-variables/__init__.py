"""
Context Variables Module for Blackbox4
Integrates Swarm-style context variables with agent handoff system
"""

# Core Swarm components
from .swarm import Swarm
from .types import Agent, AgentFunction, Response, Result
from .util import function_to_json, debug_print

# Extended handoff components
from .context import Context, context_var
from .handoff_context import HandoffContext

__all__ = [
    # Swarm core
    'Swarm',
    'Agent',
    'AgentFunction',
    'Response',
    'Result',
    'function_to_json',
    'debug_print',
    # Handoff extensions
    'Context',
    'context_var',
    'HandoffContext',
]
