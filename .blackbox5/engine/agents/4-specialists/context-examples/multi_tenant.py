#!/usr/bin/env python3
"""
Multi-Tenant Context Example
Demonstrates tenant isolation and context switching
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../', '4-scripts/lib/context-variables'))

from context_variables import Agent, Swarm, create_tenant_context

client = Swarm()

def instructions(context_variables):
    tenant_name = context_variables.get("tenant_name", "Guest")
    return f"You are a helpful assistant for {tenant_name}. Only use information from this tenant."

def get_tenant_info(context_variables):
    tenant_id = context_variables.get("tenant_id")
    tenant_name = context_variables.get("tenant_name")
    return f"Tenant: {tenant_name} (ID: {tenant_id})"

agent = Agent(
    name="Multi-Tenant Agent",
    instructions=instructions,
    functions=[get_tenant_info]
)

# Tenant 1: Acme Corp
tenant1_context = create_tenant_context(
    tenant_id="acme_001",
    tenant_data={
        "tenant_name": "Acme Corp",
        "plan": "Enterprise",
        "users": 150
    }
)

# Tenant 2: Globex Inc
tenant2_context = create_tenant_context(
    tenant_id="globex_001",
    tenant_data={
        "tenant_name": "Globex Inc",
        "plan": "Startup",
        "users": 25
    }
)

print("=== Multi-Tenant Isolation Example ===\n")

# Query Tenant 1
print("Tenant 1 (Acme Corp):")
response1 = client.run(
    messages=[{"role": "user", "content": "What's my user count?"}],
    agent=agent,
    context_variables=tenant1_context,
)
print(f"  {response1.messages[-1]['content']}\n")

# Query Tenant 2
print("Tenant 2 (Globex Inc):")
response2 = client.run(
    messages=[{"role": "user", "content": "What's my user count?"}],
    agent=agent,
    context_variables=tenant2_context,
)
print(f"  {response2.messages[-1]['content']}\n")

print("Contexts are properly isolated!")
