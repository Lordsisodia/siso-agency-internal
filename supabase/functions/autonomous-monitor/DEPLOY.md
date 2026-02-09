# Autonomous Monitor Deployment

## Prerequisites

- Supabase CLI installed
- Project linked to SISO-Internal Supabase

## Deploy Edge Functions

```bash
# Deploy the monitor function
supabase functions deploy autonomous-monitor

# Deploy the webhook function
supabase functions deploy autonomous-webhook
```

## Set Environment Variables

```bash
# Set webhook token for agent authentication
supabase secrets set AUTONOMOUS_WEBHOOK_TOKEN=your-secure-random-token

# Service role key is automatically available
```

## Set Up Cron Trigger

Add to `supabase/config.toml`:

```toml
[functions.autonomous-monitor]
enabled = true
verify_jwt = false  # Allow cron trigger

[functions.autonomous-webhook]
enabled = true
verify_jwt = false  # Agents authenticate via token
```

Create a cron job in Supabase dashboard:
- Function: `autonomous-monitor`
- Schedule: `* * * * *` (every minute)
- HTTP method: GET or POST

## Testing

```bash
# Test monitor manually
curl -X POST https://avdgyrepwrvsvwgxrccr.supabase.co/functions/v1/autonomous-monitor \
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}"

# Test webhook
curl -X POST https://avdgyrepwrvsvwgxrccr.supabase.co/functions/v1/autonomous-webhook \
  -H "Authorization: Bearer your-webhook-token" \
  -H "Content-Type: application/json" \
  -d '{
    "subtask_id": "uuid-here",
    "status": "completed",
    "agent_metadata": {"result": "success"},
    "summary": "Task completed successfully"
  }'
```

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Cron Trigger   │────▶│  Monitor Function │────▶│  Supabase DB    │
│  (every minute) │     │  (polls for work) │     │  (subtasks)     │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                                                        │
                                                        ▼
                                               ┌─────────────────┐
                                               │  Agent Picks Up │
                                               │  Task           │
                                               └─────────────────┘
                                                        │
                                                        ▼
                                               ┌─────────────────┐
                                               │  Webhook Call   │
                                               │  (completion)   │
                                               └─────────────────┘
```

## Monitoring

Check function logs:
```bash
supabase functions logs autonomous-monitor
supabase functions logs autonomous-webhook
```

## Circuit Breaker

The monitor has a built-in circuit breaker:
- Triggers after 3 consecutive errors
- Returns 503 status when triggered
- Resets on successful run

## Rate Limiting

- Max 5 iterations per run
- 15-minute agent timeout
- Batch size of 5 pending tasks
