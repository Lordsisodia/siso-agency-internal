#!/usr/bin/env python3
import os

class ContextManager:
    """
    Implements GSD "Context Budgeting".
    Advises Agents on their context health.
    """
    
    # 200k Token Proxy (Approx chars)
    # 1 token ~= 4 chars -> 200k tokens = 800k chars
    MAX_BUDGET_CHARS = 800000 
    
    THRESHOLDS = {
        "PEAK": 0.30,      # 0-30%
        "GOOD": 0.50,      # 30-50%
        "DEGRADING": 0.70  # 50-70%
        # >70% is POOR
    }

    @staticmethod
    def check_health(current_context_chars: int) -> dict:
        usage = current_context_chars / ContextManager.MAX_BUDGET_CHARS
        
        if usage <= ContextManager.THRESHOLDS["PEAK"]:
            status = "PEAK"
            color = "GREEN"
            advice = "Deep Recall Available. Good for Planning."
        elif usage <= ContextManager.THRESHOLDS["GOOD"]:
            status = "GOOD"
            color = "BLUE"
            advice = "Solid Performance. Execution Phase."
        elif usage <= ContextManager.THRESHOLDS["DEGRADING"]:
            status = "DEGRADING"
            color = "AMBER"
            advice = "Efficiency Mode. Wrap up current tasks."
        else:
            status = "POOR"
            color = "RED"
            advice = "CRITICAL: Brain Drain. RESET IMMEDIATELY."
            
        return {
            "usage_pct": round(usage * 100, 1),
            "status": status,
            "color": color,
            "advice": advice
        }

if __name__ == "__main__":
    # Test with a mock size
    mock_usage = 150000 # ~37k tokens
    health = ContextManager.check_health(mock_usage)
    print(f"Context Health: {health['status']} ({health['usage_pct']}%)")
    print(f"Advice: {health['advice']}")
