# Agent: <agent-name>

## Purpose
<What this agent does, in one sentence>

## Trigger (when to use)
- <Example trigger 1>
- <Example trigger 2>

## Inputs
- <What the agent needs to run well>

## Outputs
- <What files it creates/updates and where>

## Guardrails
- Don't write secrets
- Prefer small, verifiable steps
- Record artifacts explicitly
- Follow the core workflow from `../_core/prompt.md`

## Run loop
1. Read `runbook.md` for step-by-step execution guide
2. Read `rubric.md` for quality criteria
3. Use prompts from `prompts/` directory as needed
4. Follow schemas in `schemas/` for output structure
5. Check `examples/` for reference outputs
6. Create checkpoints via new-step.sh during long runs
7. Update context files as work progresses

## Special instructions
<Any agent-specific instructions or constraints>

## Files
- `runbook.md` - Step-by-step execution guide
- `rubric.md` - Quality/validation criteria
- `prompt.md` - Main agent prompt
- `prompts/` - Reusable prompt components
  - `context-pack.md` - Agent context
  - `library/` - Modular prompts
- `schemas/` - Output templates
- `examples/` - Reference outputs
