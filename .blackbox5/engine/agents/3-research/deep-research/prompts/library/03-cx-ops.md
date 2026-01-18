# Deep Research Prompt 03 — Support/CX stack deep dive (Customer Timeline + Agent Assist)

## CONTEXT

Use the shared Deep Research Context Pack (copy/paste into your run as needed):
- `context-pack.md`

## PROMPT

TASK:
Research ecommerce CX/helpdesk solutions and define a CX Ops module: “single customer timeline + policy enforcement + AI agent assist grounded in order data”.

1) Identify top CX tools for Shopify DTC (helpdesk + chat + self-serve).
2) Extract their core capabilities (ticket routing, macros, SLAs, automation, customer context, Shopify integrations).
3) Identify AI features that are real vs marketing (summarization, reply suggestions, intent detection, policy guidance).
4) Produce a module spec for “Customer Timeline + Agent Assist”:
   - Data model: what events to store (orders, fulfillments, refunds, returns, messages)
   - UI surfaces: timeline view, actions, guardrails
   - Workflow guardrails: approvals, audit, explainability
   - Metrics: deflection, handle time, CSAT proxies

OUTPUT REQUIREMENTS:
- Feature comparison table + citations.
- “Build vs integrate” recommendations (which parts you should not reinvent).
