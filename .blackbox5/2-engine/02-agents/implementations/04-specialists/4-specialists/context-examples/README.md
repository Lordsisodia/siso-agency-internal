# Context Variables Examples

This directory contains example scripts demonstrating how to use context variables in Blackbox4 agents.

## Overview

Context variables allow you to pass dynamic data to agents during runtime, enabling:
- Personalized responses based on user/tenant information
- Multi-tenant isolation
- Dynamic instruction generation
- Context-aware function execution

## Examples

### single_tenant.py

**Demonstrates:** Basic single-tenant context variable usage

**Features:**
- Creating a context with tenant-specific data (name, company, role)
- Using context variables in agent instructions
- Accessing context within agent functions
- Running an agent with context variables

**To run:**
```bash
./single_tenant.py
# or
python3 single_tenant.py
```

**Expected output:**
```
=== Single Tenant Example ===

[Personalized response for Alice Johnson at TechCorp Inc, acting as Product Manager]
```

### multi_tenant.py

**Demonstrates:** Multi-tenant isolation and context switching

**Features:**
- Creating separate contexts for different tenants
- Running the same agent with different contexts
- Verifying context isolation between tenants
- Understanding how context variables prevent data leakage

**To run:**
```bash
./multi_tenant.py
# or
python3 multi_tenant.py
```

**Expected output:**
```
=== Multi-Tenant Isolation Example ===

Tenant 1 (Acme Corp):
  [Response mentioning 150 users and Enterprise plan]

Tenant 2 (Globex Inc):
  [Response mentioning 25 users and Startup plan]

Contexts are properly isolated!
```

## Key Concepts

### Creating Context

```python
from context_variables import create_tenant_context

context = create_tenant_context(
    tenant_id="unique_tenant_id",
    tenant_data={
        "key": "value",
        "metadata": "any data"
    }
)
```

### Using Context in Instructions

```python
def instructions(context_variables):
    name = context_variables.get("name", "Guest")
    return f"You are helping {name}"
```

### Using Context in Functions

```python
def get_info(context_variables):
    return f"Tenant: {context_variables.get('tenant_id')}"

agent = Agent(
    instructions=instructions,
    functions=[get_info]
)
```

### Running with Context

```python
response = client.run(
    messages=[...],
    agent=agent,
    context_variables=context,
)
```

## Best Practices

1. **Always provide defaults** when accessing context variables:
   ```python
   name = context_variables.get("name", "Guest")
   ```

2. **Use consistent tenant IDs** across your application

3. **Validate context data** before passing to agents

4. **Keep context minimal** - only include necessary data

5. **Test isolation** - ensure tenants cannot access each other's data

## Integration Path

These examples use the context variables library from:
```
4-scripts/lib/context-variables/
```

The library provides:
- `Agent` - Context-aware agent class
- `Swarm` - Client for running agents
- `create_tenant_context()` - Context creation helper

## Troubleshooting

**Import errors:**
- Ensure the context variables library exists at the expected path
- Check that sys.path is correctly set in examples

**Context not working:**
- Verify context_variables parameter is passed to client.run()
- Check key names match between creation and usage
- Ensure agent instructions/functions accept context_variables parameter

**Isolation issues:**
- Always create fresh contexts for each tenant
- Don't reuse context variables between different tenant runs
- Verify tenant_id is unique per tenant
