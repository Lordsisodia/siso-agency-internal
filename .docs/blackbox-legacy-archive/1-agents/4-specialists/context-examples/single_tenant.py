#!/usr/bin/env python3
"""
Single Tenant Context Example
Demonstrates basic context variable usage
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../', '4-scripts/lib/context-variables'))

from context_variables import Agent, Swarm, create_tenant_context

# Create client
client = Swarm()

# Define instructions with context
def instructions(context_variables):
    name = context_variables.get("name", "User")
    company = context_variables.get("company", "your company")
    return f"""You are a helpful AI assistant for {name} at {company}.
Provide personalized assistance based on their role and needs."""

# Define function that uses context
def get_user_info(context_variables):
    name = context_variables.get("name")
    role = context_variables.get("role")
    return f"User: {name}, Role: {role}"

# Create agent
agent = Agent(
    name="Context-Aware Agent",
    instructions=instructions,
    functions=[get_user_info]
)

# Create context
context = create_tenant_context(
    tenant_id="tenant_001",
    tenant_data={
        "name": "Alice Johnson",
        "company": "TechCorp Inc",
        "role": "Product Manager"
    }
)

# Run agent
print("=== Single Tenant Example ===\n")
response = client.run(
    messages=[{"role": "user", "content": "Hi! Can you help me with product planning?"}],
    agent=agent,
    context_variables=context,
)

print(response.messages[-1]['content'])
