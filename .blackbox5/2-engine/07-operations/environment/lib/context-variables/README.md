# Context Variables Library

Multi-tenant context support system for Blackbox4, adapted from [OpenAI Swarm](https://github.com/openai/swarm).

## Overview

This library provides a lightweight, multi-agent orchestration framework with built-in support for context variables. It enables agents to maintain and share state across conversations, making it ideal for multi-tenant applications where each tenant requires isolated context.

## Origin

This code is adapted from OpenAI's Swarm framework, an experimental system for multi-agent orchestration. The original framework focuses on lightweight agent coordination, and this version adds specific utilities for multi-tenant context management.

## Core Components

### Agent

Represents an AI agent with instructions, functions, and configuration.

```python
from context_variables import Agent

agent = Agent(
    name="SupportAgent",
    instructions="You are a helpful support agent.",
    functions=[transfer_to_billing, get_account_info],
    model="gpt-4o"
)
```

### Swarm

The main client for running agents and managing conversations.

```python
from context_variables import Swarm

client = Swarm()
response = client.run(
    agent=agent,
    messages=[{"role": "user", "content": "Hello!"}],
    context_variables={"tenant_id": "acme-corp", "user_id": 123}
)
```

### Context Variables

Context variables are dictionaries passed to agents and functions, enabling:

- **Dynamic Instructions**: Agent instructions can use context variables
- **Function Parameters**: Functions can access context variables
- **State Management**: Variables persist across agent handoffs

## Usage Examples

### Basic Multi-Tenant Agent

```python
from context_variables import Swarm, Agent

client = Swarm()

def instructions(context_variables):
    tenant_name = context_variables.get("tenant_name", "Guest")
    return f"You are a helpful assistant for {tenant_name}."

agent = Agent(
    name="TenantAgent",
    instructions=instructions
)

# Tenant-specific context
context = {
    "tenant_id": "acme-corp",
    "tenant_name": "Acme Corporation",
    "tenant_plan": "enterprise"
}

response = client.run(
    agent=agent,
    messages=[{"role": "user", "content": "Hi!"}],
    context_variables=context
)
```

### Functions with Context Access

```python
def get_account_details(account_id: str, context_variables: dict):
    """Get account details for the current tenant."""
    tenant_id = context_variables.get("tenant_id")
    # Fetch from database using tenant_id and account_id
    return f"Account {account_id} for tenant {tenant_id}"

agent = Agent(
    name="AccountAgent",
    functions=[get_account_details]
)
```

### Agent Handoffs with Context

```python
def transfer_to_specialist(context_variables: dict):
    """Transfer to specialist agent."""
    from context_variables import Agent, Result
    specialist = Agent(
        name="Specialist",
        instructions="You are a technical specialist."
    )
    return Result(
        value="Transferring to specialist",
        agent=specialist
    )

agent = Agent(
    name="Generalist",
    functions=[transfer_to_specialist]
)
```

### Dynamic Instructions Based on Context

```python
def tiered_instructions(context_variables):
    plan = context_variables.get("tenant_plan", "basic")
    if plan == "enterprise":
        return "You are an enterprise support agent. Provide comprehensive assistance."
    elif plan == "premium":
        return "You are a premium support agent. Provide priority assistance."
    else:
        return "You are a support agent. Provide standard assistance."

agent = Agent(
    name="SupportAgent",
    instructions=tiered_instructions
)
```

## Helper Functions

### create_context_agent

Create an agent with context variable support.

```python
from context_variables import create_context_agent

agent = create_context_agent(
    name="MyAgent",
    instructions="You are helpful.",
    functions=[my_function]
)
```

### create_tenant_context

Create tenant-specific context variables.

```python
from context_variables import create_tenant_context

context = create_tenant_context(
    tenant_id="acme-corp",
    tenant_data={
        "name": "Acme Corporation",
        "plan": "enterprise",
        "settings": {"language": "en"}
    }
)
```

## Response Structure

The `Response` object contains:

- `messages`: List of conversation messages
- `agent`: The active agent after execution
- `context_variables`: Updated context variables

```python
response = client.run(
    agent=agent,
    messages=[...],
    context_variables=context
)

print(response.messages[-1]["content"])
print(response.context_variables)  # Updated context
```

## Best Practices

1. **Isolation**: Keep tenant data isolated by always using `tenant_id` in context
2. **Validation**: Validate context variables in functions before use
3. **Defaults**: Provide sensible defaults for missing context variables
4. **Type Hints**: Use type hints for context variables in function signatures
5. **Documentation**: Document expected context variables for each agent

## Streaming Support

The library supports streaming responses:

```python
for chunk in client.run(
    agent=agent,
    messages=[...],
    context_variables=context,
    stream=True
):
    if "delim" not in chunk:
        print(chunk.get("content", ""), end="", flush=True)
```

## Dependencies

- `openai`: OpenAI API client
- `pydantic`: Data validation

## License

This library is adapted from OpenAI Swarm, which is licensed under the MIT License.
