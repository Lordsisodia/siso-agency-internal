# Deep Research Prompt 08 — SaaS transition plan (repeatable custom builds → multi-tenant SaaS)

## CONTEXT

Use the shared Deep Research Context Pack (copy/paste into your run as needed):
- `context-pack.md`

## PROMPT

TASK:
Research patterns used by companies that started as “productized services / repeatable custom builds” and transitioned into SaaS.

Deliver:
1) A reference architecture for multi-tenant SaaS that supports module options, per-client config, RBAC, audit logs, environments, and safe rollouts.
2) Common pitfalls: data isolation mistakes, migrations, entitlement drift, customer-specific hacks.
3) A phased plan: what to standardize now (naming, module boundaries, feature flags) so later SaaS transition is smooth.
4) Recommend a “module packaging” and entitlement model.

OUTPUT REQUIREMENTS:
- Must include real examples and citations (case studies, talks, blogs, engineering writeups).
- End with a “next 30/60/90 days” checklist.
