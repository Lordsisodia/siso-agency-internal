---
name: notifications-slack
category: collaboration-communication/collaboration
version: 1.0.0
description: Slack integration notifications for team collaboration and alerting
author: blackbox5/core
verified: true
tags: [notifications, slack, collaboration, alerts, bot]
---

<context>
Slack notifications are a critical component of modern team collaboration, enabling real-time communication for important events, alerts, and updates. When implemented effectively, Slack integrations keep teams informed without creating notification fatigue.

**What are Slack Notifications?**

Slack notifications are programmatically sent messages that appear in designated Slack channels, direct messages, or threads. They can be sent via:
- Incoming Webhooks (simple HTTP POST requests)
- Slack Web API (authenticated API calls)
- Slack Bolt framework (for complex bots and apps)
- Third-party integrations (GitHub, Jenkins, Datadog, etc.)

**Use Cases**

1. **CI/CD Pipeline Notifications**
   - Build success/failure alerts
   - Deployment status updates
   - Test result summaries
   - Performance regression warnings

2. **Monitoring and Alerting**
   - Application error notifications
   - System health alerts
   - Performance threshold breaches
   - Security incidents

3. **Project Management**
   - Task assignment notifications
   - Sprint status updates
   - Review requests
   - Deadline reminders

4. **Business Operations**
   - Customer support escalations
   - Sales lead notifications
   - Financial alerts
   - Compliance reminders

5. **Team Coordination**
   - Meeting reminders
   - Document sharing alerts
   - Code review requests
   - Team announcements

**Key Concepts**

- **Webhook URL**: Unique URL for posting messages to a specific channel
- **Rate Limits**: Slack API has rate limits to prevent spam
- **Message Formatting**: Slack supports markdown-like formatting
- **Threading**: Replies can be organized in threads for better context
- **Attachments**: Rich message formatting with structured data
- **Blocks**: Modern Slack message format with interactive elements
- **Bots**: Automated users that can interact with messages

**Benefits**

- Real-time awareness of critical events
- Reduced email overload
- Improved team coordination
- Faster incident response times
- Better visibility into automated processes
- Centralized communication hub

**Challenges**

- Notification fatigue from too many alerts
- Message formatting complexity
- Rate limiting and throttling
- Webhook management and rotation
- Channel organization and permissions
- Error handling and delivery guarantees
</context>

<instructions>

## Setting Up Slack Notifications

### Phase 1: Webhook Setup

1. **Create Incoming Webhook**
   ```
   - Navigate to https://api.slack.com/apps
   - Create new app → "From scratch"
   - Enable "Incoming Webhooks"
   - Create webhook for target workspace
   - Select target channel
   - Copy webhook URL (store securely)
   ```

2. **Choose Integration Method**
   - **Webhooks**: Best for simple, one-way notifications
   - **Web API**: Best for authenticated, interactive bots
   - **Bolt Framework**: Best for complex apps with interactions

3. **Configure Bot Permissions** (if using API/Bolt)
   - `chat:write`: Send messages
   - `chat:write.public`: Write to public channels
   - `chat:write.customize`: Customize username/icon
   - `files:write`: Upload files
   - `reactions:write`: Add reactions to messages

### Phase 2: Message Design

1. **Define Message Purpose**
   - What action does the recipient need to take?
   - How urgent is the notification?
   - Who is the target audience?

2. **Choose Message Format**
   - **Simple text**: Basic notifications
   - **Attachments**: Legacy format with structured fields
   - **Blocks**: Modern format with interactive elements

3. **Design Message Structure**
   ```
   ┌─────────────────────────────────────┐
   │ Header/Alert Level (🚨/ℹ️/✅)       │
   ├─────────────────────────────────────┤
   │ Primary text / Summary              │
   ├─────────────────────────────────────┤
   │ • Key detail 1                      │
   │ • Key detail 2                      │
   │ • Key detail 3                      │
   ├─────────────────────────────────────┤
   │ [Action Button] [View Details]      │
   └─────────────────────────────────────┘
   ```

4. **Implement Message Template**
   ```javascript
   const buildMessage = (data) => ({
     text: "Build #1234 failed",
     blocks: [
       {
         type: "header",
         text: { type: "plain_text", text: "🚨 Build Failed" }
       },
       {
         type: "section",
         text: { type: "mrkdwn", text: "*Project:* frontend-app\n*Branch:* feature/auth\n*Commit:* abc123" }
       },
       {
         type: "actions",
         elements: [
           { type: "button", text: { type: "plain_text", text: "View Logs" }, url: "https://..." }
         ]
       }
     ]
   });
   ```

### Phase 3: Integration

1. **HTTP Client Setup**
   ```javascript
   const axios = require('axios');

   async function sendSlackNotification(webhookUrl, message) {
     try {
       const response = await axios.post(webhookUrl, message);
       return { success: true, data: response.data };
     } catch (error) {
       return { success: false, error: error.message };
     }
   }
   ```

2. **Environment Configuration**
   ```env
   SLACK_WEBHOOK_URL=https://hooks.slack.com/services/T000/B000/XXXX
   SLACK_ERROR_CHANNEL=#alerts-errors
   SLACK_DEPLOY_CHANNEL=#deployments
   SLACK_BOT_TOKEN=xoxb-your-token-here
   ```

3. **Error Handling Wrapper**
   ```javascript
   async function sendWithRetry(webhookUrl, message, maxRetries = 3) {
     for (let i = 0; i < maxRetries; i++) {
       try {
         const result = await sendSlackNotification(webhookUrl, message);
         if (result.success) return result;
       } catch (error) {
         if (i === maxRetries - 1) throw error;
         await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
       }
     }
   }
   ```

### Phase 4: Testing

1. **Local Testing**
   ```bash
   # Test webhook with curl
   curl -X POST \
     -H 'Content-type: application/json' \
     --data '{"text":"Test notification"}' \
     $SLACK_WEBHOOK_URL
   ```

2. **Integration Testing**
   - Send test messages to staging channels
   - Verify formatting and link rendering
   - Test error scenarios (invalid webhook, rate limits)
   - Validate interactive elements

3. **Load Testing**
   - Test batch message sending
   - Verify rate limit handling
   - Monitor response times

## Best Practices for Integration

1. **Use Environment Variables**
   - Never hardcode webhook URLs
   - Use different webhooks per environment
   - Rotate webhooks regularly

2. **Implement Rate Limiting**
   - Respect Slack's rate limits
   - Implement exponential backoff
   - Queue messages if necessary

3. **Message Deduplication**
   - Check for duplicate alerts
   - Aggregate similar notifications
   - Use threads for related updates

4. **Monitoring and Logging**
   - Log all notification attempts
   - Track delivery success rates
   - Alert on webhook failures

</instructions>

<rules>

## Rate Limiting

1. **Webhook Rate Limits**
   - No explicit limit for incoming webhooks
   - Recommended: Max 1 message/second per webhook
   - Burst limit: ~1000 messages/minute (soft limit)

2. **API Rate Limits**
   - Tier B (most apps): ~1 message/second per workspace
   - Burst: 200+ messages before throttling
   - Use `chat.postMessage` for individual messages
   - Use `chat.postMessage` with `thread_ts` for replies

3. **Rate Limit Handling**
   ```javascript
   async function sendWithRateLimit(url, message) {
     try {
       return await axios.post(url, message);
     } catch (error) {
       if (error.response?.status === 429) {
         const retryAfter = error.response.headers['retry-after'];
         await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
         return await axios.post(url, message);
       }
       throw error;
     }
   }
   ```

## Message Formatting

1. **Text Length Limits**
   - Max text length: 40,000 characters
   - Recommended: Keep under 3,000 characters
   - Truncate long content with "Read more" links

2. **Markdown Support**
   ```markdown
   *bold*
   _italic_
   ~strike~
   `code`
   ```code block```
   > quote
   - list item
   ```

3. **Block Kit Limits**
   - Max 100 blocks per message
   - Recommended: Keep under 50 blocks
   - Use sections for organization

## Channel Organization

1. **Channel Naming Conventions**
   ```
   #alerts-[service]     # Critical alerts
   #deployments           # Deployment updates
   #notifications-[team]  # Team-specific notifications
   #build-[project]       # CI/CD updates
   #monitoring-[system]   # System monitoring
   ```

2. **Purpose-Based Channels**
   - **#alerts-critical**: Urgent, requires immediate action
   - **#alerts-warnings**: Non-critical but needs attention
   - #deployments: All deployment activity
   - #notifications: General updates
   - #team-updates: Team coordination

3. **Channel Permissions**
   - Restrict posting to bots only
   - Use private channels for sensitive alerts
   - Set appropriate channel-level permissions

## Content Guidelines

1. **Alert Priority Levels**
   ```
   🚨 CRITICAL: Immediate action required
   ⚠️  WARNING: Attention needed soon
   ℹ️  INFO: Informational update
   ✅ SUCCESS: Success confirmation
   ```

2. **Required Information**
   - What happened (clear, concise summary)
   - Why it matters (impact)
   - What to do (action items)
   - Where to find more info (links)

3. **Prohibited Content**
   - No sensitive credentials or tokens
   - No personal user information (PII)
   - No excessive technical jargon
   - No wall of text (use formatting)

## Threading Guidelines

1. **When to Thread**
   - Multiple updates on same topic
   - Long-running processes (deployments)
   - Related error messages
   - Status updates

2. **Thread Usage**
   ```javascript
   // First message (start thread)
   const mainMessage = await postMessage(channel, { text: "Deployment started" });

   // Follow-up messages (reply in thread)
   await postMessage(channel, {
     text: "Step 1/5 complete",
     thread_ts: mainMessage.ts
   });
   ```

3. **Thread Limits**
   - Max 1,000 replies per thread
   - Consider new thread after 50+ messages
   - Use thread broadcasts for important updates

</rules>

<workflow>

## Phase 1: Planning and Design

1. **Define Requirements**
   - Identify notification triggers
   - Determine target audience per notification type
   - Define urgency levels
   - Establish escalation paths

2. **Channel Strategy**
   ```
   Critical alerts → #alerts-critical
   Build failures → #build-failures
   Deployments → #deployments
   Team updates → #team-notifications
   ```

3. **Message Templates**
   - Create templates for each notification type
   - Define standard formatting
   - Establish consistent icon usage
   - Set interaction patterns

## Phase 2: Implementation

1. **Setup Webhook/Bot**
   ```bash
   # Create app
   slack create --template alert-notifications

   # Install to workspace
   slack install

   # Configure permissions
   slack permissions add --scope chat:write
   ```

2. **Implement Notification Service**
   ```javascript
   class SlackNotificationService {
     constructor(webhookUrl, options = {}) {
       this.webhookUrl = webhookUrl;
       this.retryAttempts = options.retryAttempts || 3;
       this.timeout = options.timeout || 5000;
     }

     async send(channel, message) {
       const payload = {
         channel,
         ...message,
         username: message.username || 'Notification Bot',
         icon_emoji: message.icon_emoji || ':robot_face:'
       };

       return await this.sendWithRetry(payload);
     }

     async sendAlert(level, title, details, actions = []) {
       const emojis = {
         critical: '🚨',
         warning: '⚠️',
         info: 'ℹ️',
         success: '✅'
       };

       return await this.send({
         text: `${emojis[level]} ${title}`,
         blocks: this.buildAlertBlocks(level, title, details, actions)
       });
     }
   }
   ```

3. **Implement Notification Triggers**
   ```javascript
   // CI/CD integration
   ciPipeline.on('build:failed', async (build) => {
     await slack.send({
       channel: '#build-failures',
       text: `Build #${build.number} failed`,
       blocks: buildFailureBlocks(build)
     });
   });

   // Error tracking
   errorTracker.on('critical', async (error) => {
     await slack.sendAlert('critical', error.message, error.context);
   });

   // Deployment tracking
   deployer.on('stage:complete', async (deployment) => {
     await slack.sendThreadedUpdate(deployment.threadTs, {
       text: `Stage ${deployment.stage} complete`
     });
   });
   ```

## Phase 3: Testing and Validation

1. **Unit Tests**
   ```javascript
   describe('SlackNotificationService', () => {
     it('should send message to correct channel', async () => {
       const spy = jest.spyOn(axios, 'post');
       await service.send('#test', { text: 'Test' });
       expect(spy).toHaveBeenCalledWith(
         expect.stringContaining('test'),
         expect.objectContaining({ channel: '#test' })
       );
     });

     it('should retry on rate limit', async () => {
       // Implementation
     });
   });
   ```

2. **Integration Tests**
   - Send to test channels
   - Verify message formatting
   - Test interactive elements
   - Validate error handling

3. **Load Tests**
   ```bash
   # Test 100 messages/minute
   for i in {1..100}; do
     curl -X POST $WEBHOOK_URL -d "{\"text\":\"Message $i\"}"
     sleep 0.6
   done
   ```

## Phase 4: Deployment and Monitoring

1. **Deployment Checklist**
   - [ ] Environment variables configured
   - [ ] Webhook URLs validated
   - [ ] Rate limiting configured
   - [ ] Error monitoring setup
   - [ ] Logging configured
   - [ ] Test messages sent successfully

2. **Monitoring Setup**
   ```javascript
   // Track notification metrics
   const metrics = {
     sent: 0,
     failed: 0,
     rateLimited: 0,
     avgResponseTime: 0
   };

   // Alert on failures
   if (metrics.failed > 10) {
     await sendPagerDutyAlert('Slack notifications failing');
   }
   ```

3. **Maintenance**
   - Review and rotate webhooks quarterly
   - Audit channel memberships monthly
   - Update message templates as needed
   - Review delivery metrics weekly

</workflow>

<best_practices>

## Message Formatting

1. **Use Block Kit for Rich Messages**
   ```json
   {
     "blocks": [
       {
         "type": "header",
         "text": {
           "type": "plain_text",
           "text": "Deployment Started"
         }
       },
       {
         "type": "section",
         "fields": [
           { "type": "mrkdwn", "text": "*Project:*\nfrontend-app" },
           { "type": "mrkdwn", "text": "*Environment:*\nproduction" },
           { "type": "mrkdwn", "text": "*Version:*\nv2.3.1" },
           { "type": "mrkdwn", "text": "*Started by:*\n@shaan" }
         ]
       },
       {
         "type": "actions",
         "elements": [
           {
             "type": "button",
             "text": { "type": "plain_text", "text": "View Progress" },
             "url": "https://deploy.example.com/12345"
           }
         ]
       }
     ]
   }
   ```

2. **Consistent Icon Usage**
   ```
   :rotating_light:  Critical alerts
   :warning:         Warnings
   :white_check_mark: Success
   :information_source:  Informational
   :construction:    In progress
   :bug:            Bug/error
   :rocket:         Deployment
   :test_tube:      Testing
   :chart_with_upwards_trend: Metrics
   ```

3. **Clear Action Indicators**
   - Always specify what action is needed
   - Use buttons for common actions
   - Include relevant links
   - Tag relevant users when needed (`@username`)

## Threading and Organization

1. **Thread Related Updates**
   ```javascript
   // Main message
   const main = await slack.send({
     text: 'Deployment v2.3.1 started',
     channel: '#deployments'
   });

   // Updates in thread
   await slack.send({
     text: '✅ Build complete',
     channel: '#deployments',
     thread_ts: main.ts
   });

   // Final update with broadcast
   await slack.send({
     text: '🎉 Deployment complete!',
     channel: '#deployments',
     thread_ts: main.ts,
     reply_broadcast: true
   });
   ```

2. **Use Threaded Replies**
   - Keep main channel clean
   - Detailed discussions in threads
   - Broadcast critical thread replies

3. **Channel Purpose**
   - Set channel topics with clear purpose
   - Pin important messages
   - Archive old notification threads

## Timing and Frequency

1. **Smart Batching**
   ```javascript
   class NotificationBatcher {
     constructor(maxWaitTime = 30000) {
       this.messages = [];
       this.maxWaitTime = maxWaitTime;
     }

     async add(message) {
       this.messages.push(message);
       if (this.messages.length >= 10) {
         await this.flush();
       } else if (!this.timer) {
         this.timer = setTimeout(() => this.flush(), this.maxWaitTime);
       }
     }

     async flush() {
       if (this.messages.length === 0) return;
       const batch = this.messages.splice(0);
       await this.sendBatch(batch);
     }
   }
   ```

2. **Rate-Aware Sending**
   ```javascript
   async function sendRateAware(messages) {
     const delay = 1100; // Slight buffer for rate limit
     for (const message of messages) {
       await sendSlackNotification(message);
       await new Promise(resolve => setTimeout(resolve, delay));
     }
   }
   ```

3. **Quiet Hours**
   - Respect time zones
   - Reduce non-critical alerts during off-hours
   - Always send critical alerts
   - Aggregate overnight messages for morning summary

## Content Quality

1. **Provide Context**
   ```
   ❌ "Build failed"

   ✅ "Build #1234 failed on frontend-app

   What: Unit tests failed
   Where: test/auth.spec.ts:45
   Commit: abc123 - Fix login bug
   Author: @shaan

   [View Logs] [Retry Build]"
   ```

2. **Include Actionable Links**
   - Direct links to relevant resources
   - Pre-filtered links (e.g., specific logs)
   - Action buttons for common tasks

3. **Use Color Coding** (attachments only)
   ```javascript
   {
     color: 'danger',   // Red - critical
     color: 'warning',  // Yellow - warning
     color: 'good',     // Green - success
     color: '#439FE0'   // Blue - info
   }
   ```

## Security and Privacy

1. **Never Include Secrets**
   - No API keys, tokens, passwords
   - Mask sensitive data (partial emails, IPs)
   - No full stack traces in production

2. **Access Control**
   - Use private channels for sensitive info
   - Verify channel membership
   - Implement proper authentication

3. **Data Retention**
   - Consider Slack's message retention policy
   - Archive important notifications externally
   - Don't rely on Slack as permanent storage

</best_practices>

<anti_patterns>

## Notification Fatigue

**Anti-Pattern:** Sending too many notifications
```javascript
// ❌ BAD: Notifying on every single event
for (const log of logs) {
  await slack.send({ text: `New log entry: ${log.message}` });
}

// ✅ GOOD: Aggregate and summarize
await slack.send({
  text: `Log Summary: ${logs.length} new entries`,
  blocks: buildLogSummary(logs)
});
```

**Solution:**
- Implement notification thresholds
- Aggregate similar events
- Use importance levels
- Allow user preferences

## Poor Message Formatting

**Anti-Pattern:** Wall of text
```javascript
// ❌ BAD: Unformatted text
await slack.send({
  text: 'ERROR error error error stack trace 500 lines long...'
});

// ✅ GOOD: Structured with blocks
await slack.send({
  blocks: [
    { type: 'header', text: { type: 'plain_text', text: 'Error Occurred' } },
    {
      type: 'section',
      text: { type: 'mrkdwn', text: '*Type:* ValidationError\n*Location:* API Gateway' }
    },
    { type: 'divider' },
    {
      type: 'section',
      text: { type: 'mrkdwn', text: 'First 10 lines of stack trace...' },
      accessory: { type: 'button', text: { type: 'plain_text', text: 'View Full Trace' } }
    }
  ]
});
```

## No Context or Action

**Anti-Pattern:** Alert without clear next steps
```
❌ BAD: "Database error"
✅ GOOD: "Database connection failed. Action: Check DB status page. Ops team is aware."
```

## Spam on Failure

**Anti-Pattern:** Continuous retry notifications
```javascript
// ❌ BAD: Notify on every retry
while (retrying) {
  try {
    await operation();
  } catch {
    await slack.send({ text: 'Operation failed, retrying...' });
    await sleep(1000);
  }
}

// ✅ GOOD: Notify once, update thread
const mainMsg = await slack.send({ text: 'Operation failed, retrying...' });
while (retrying) {
  try {
    await operation();
    await slack.send({
      text: 'Operation succeeded on retry',
      thread_ts: mainMsg.ts
    });
    break;
  } catch {
    await sleep(1000);
  }
}
```

## Hardcoded Values

**Anti-Pattern:** Hardcoded channels and webhooks
```javascript
// ❌ BAD
const webhook = 'https://hooks.slack.com/services/...';

// ✅ GOOD
const webhook = process.env.SLACK_WEBHOOK_URL;
```

## Ignoring Rate Limits

**Anti-Pattern:** Sending without rate limit handling
```javascript
// ❌ BAD: No rate limit handling
await Promise.all(events.map(e => slack.send(e)));

// ✅ GOOD: Respect rate limits
for (const event of events) {
  await slack.send(event);
  await sleep(1100); // Rate limit buffer
}
```

## Missing Error Handling

**Anti-Pattern:** No error handling for webhook failures
```javascript
// ❌ BAD
await slack.send(message);

// ✅ GOOD
try {
  await slack.send(message);
} catch (error) {
  logger.error('Failed to send Slack notification', error);
  // Fallback: store for retry, send to PagerDuty, etc.
}
```

## Overuse of @mentions

**Anti-Pattern:** Tagging users unnecessarily
```javascript
// ❌ BAD: @channel for every build failure
slack.send({ text: '@channel Build failed!' });

// ✅ GOOD: Reserved for critical incidents
slack.send({
  text: '@here Production database is down. All hands on deck.'
});
```

</anti_patterns>

<examples>

## Example 1: CI/CD Pipeline Notification

```javascript
async function sendBuildNotification(build) {
  const status = build.success ? 'success' : 'failure';
  const emoji = build.success ? '✅' : '❌';
  const color = build.success ? 'good' : 'danger';

  return await slack.send({
    channel: '#builds',
    username: 'CI/CD Bot',
    icon_emoji: ':test_tube:',
    attachments: [{
      color,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `${emoji} Build #${build.number} ${status}`
          }
        },
        {
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: `*Project:*\n${build.project}` },
            { type: 'mrkdwn', text: `*Branch:*\n${build.branch}` },
            { type: 'mrkdwn', text: `*Commit:*\n${build.commit.slice(0, 7)}` },
            { type: 'mrkdwn', text: `*Author:*\n${build.author}` }
          ]
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Commit Message:*\n${build.message}`
          }
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: { type: 'plain_text', text: 'View Build' },
              url: build.url
            },
            !build.success && {
              type: 'button',
              text: { type: 'plain_text', text: 'View Logs' },
              url: build.logsUrl
            },
            !build.success && {
              type: 'button',
              text: { type: 'plain_text', text: 'Retry' },
              action_id: 'retry_build',
              value: build.id
            }
          ].filter(Boolean)
        }
      ]
    }]
  });
}
```

## Example 2: Error Alert with Context

```javascript
async function sendErrorAlert(error) {
  return await slack.send({
    channel: '#alerts-errors',
    icon_emoji: ':rotating_light:',
    attachments: [{
      color: 'danger',
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `🚨 ${error.name} in ${error.service}`
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Error:*\n\`\`\`${error.message}\`\`\``
          }
        },
        {
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: `*Service:*\n${error.service}` },
            { type: 'mrkdwn', text: `*Environment:*\n${error.env}` },
            { type: 'mrkdwn', text: `*Time:*\n${new Date(error.timestamp).toISOString()}` },
            { type: 'mrkdwn', text: `*Occurrences:*\n${error.count}` }
          ]
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Stack Trace (first 5 lines):*\n\`\`\`\n${error.stack.split('\n').slice(0, 5).join('\n')}\n\`\`\``
          }
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: { type: 'plain_text', text: 'View Full Trace' },
              url: error.traceUrl
            },
            {
              type: 'button',
              text: { type: 'plain_text', text: 'Create Issue' },
              action_id: 'create_issue',
              value: JSON.stringify(error)
            },
            {
              type: 'button',
              text: { type: 'plain_text', text: 'Acknowledge' },
              action_id: 'acknowledge',
              value: error.id
            }
          ]
        }
      ]
    }]
  });
}
```

## Example 3: Deployment Progress Update

```javascript
class DeploymentNotifier {
  async start(deployment) {
    this.message = await slack.send({
      channel: '#deployments',
      icon_emoji: ':rocket:',
      blocks: [
        {
          type: 'header',
          text: { type: 'plain_text', text: '🚀 Deployment Started' }
        },
        {
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: `*App:*\n${deployment.app}` },
            { type: 'mrkdwn', text: `*Version:*\n${deployment.version}` },
            { type: 'mrkdwn', text: `*Environment:*\n${deployment.env}` },
            { type: 'mrkdwn', text: `*Started by:*\n<@${deployment.userId}>` }
          ]
        }
      ]
    });
  }

  async updateStage(stage, status) {
    const emoji = status === 'complete' ? '✅' : status === 'failed' ? '❌' : '⏳';
    await slack.send({
      channel: '#deployments',
      thread_ts: this.message.ts,
      text: `${emoji} ${stage}: ${status}`
    });
  }

  async complete(result) {
    const emoji = result.success ? '🎉' : '💥';
    await slack.send({
      channel: '#deployments',
      thread_ts: this.message.ts,
      reply_broadcast: true,
      text: `${emoji} Deployment ${result.success ? 'completed successfully' : 'failed'} in ${result.duration}ms`,
      blocks: result.success ? this.buildSuccessBlocks(result) : this.buildFailureBlocks(result)
    });
  }
}
```

## Example 4: Aggregated Summary

```javascript
async function sendDailySummary(stats) {
  return await slack.send({
    channel: '#daily-summary',
    icon_emoji: ':chart_with_upwards_trend:',
    blocks: [
      {
        type: 'header',
        text: { type: 'plain_text', text: '📊 Daily Summary - ' + new Date().toLocaleDateString() }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: 'Here\'s what happened today:'
        }
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Deployments:*\n${stats.deployments.success}/${stats.deployments.total}` },
          { type: 'mrkdwn', text: `*Builds:*\n${stats.builds.success}/${stats.builds.total}` },
          { type: 'mrkdwn', text: `*Errors:*\n${stats.errors.critical} critical` },
          { type: 'mrkdwn', text: `*Uptime:*\n${stats.uptime}%` }
        ]
      },
      {
        type: 'divider'
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*Top Issues:*'
        }
      },
      ...stats.topIssues.map(issue => ({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `• ${issue.title} (${issue.count} occurrences) - <${issue.url}|View>`
        }
      }))
    ]
  });
}
```

## Example 5: Interactive Approval Request

```javascript
async function sendApprovalRequest(request) {
  return await slack.send({
    channel: '#approvals',
    icon_emoji': ':white_check_mark:',
    blocks: [
      {
        type: 'header',
        text: { type: 'plain_text', text: '✋ Approval Required' }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `<@${request.requestee}> is requesting approval for *${request.title}*`
        }
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Type:*\n${request.type}` },
          { type: 'mrkdwn', text: `*Priority:*\n${request.priority}` },
          { type: 'mrkdwn', text: `*Environment:*\n${request.environment}` }
        ]
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Details:*\n${request.details}`
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Changes:* <${request.diffUrl}|View diff>`
        }
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: { type: 'plain_text', text: '✅ Approve' },
            style: 'primary',
            action_id: 'approve',
            value: request.id,
            confirm: {
              title: { type: 'plain_text', text: 'Approve Request?' },
              text: { type: 'mrkdwn', text: 'Are you sure you want to approve this request?' },
              confirm: { type: 'plain_text', text: 'Approve' },
              deny: { type: 'plain_text', text: 'Cancel' }
            }
          },
          {
            type: 'button',
            text: { type: 'plain_text', text: '❌ Reject' },
            style: 'danger',
            action_id: 'reject',
            value: request.id
          },
          {
            type: 'button',
            text: { type: 'plain_text', text: 'Request Changes' },
            action_id: 'request_changes',
            value: request.id
          }
        ]
      }
    ]
  });
}
```

## Example 6: Monitoring Dashboard Update

```javascript
async function sendMetricsAlert(metrics) {
  const status = metrics.healthy ? 'success' : 'warning';
  const emoji = metrics.healthy ? '✅' : '⚠️';

  return await slack.send({
    channel: '#monitoring',
    icon_emoji: ':chart_with_upwards_trend:',
    attachments: [{
      color: metrics.healthy ? 'good' : 'warning',
      blocks: [
        {
          type: 'header',
          text: { type: 'plain_text', text: `${emoji} System Health Update` }
        },
        {
          type: 'context',
          elements: [
            { type: 'mrkdwn', text: `*Checked at:* ${new Date().toISOString()}` }
          ]
        },
        {
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: `*CPU Usage:*\n${metrics.cpu}%` },
            { type: 'mrkdwn', text: `*Memory:*\n${metrics.memory}%` },
            { type: 'mrkdwn', text: `*Response Time:*\n${metrics.responseTime}ms` },
            { type: 'mrkdwn', text: `*Error Rate:*\n${metrics.errorRate}%` }
          ]
        },
        !metrics.healthy && {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '*Anomalies Detected:*\n' + metrics.anomalies.map(a => `• ${a}`).join('\n')
          }
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: { type: 'plain_text', text: 'View Dashboard' },
              url: metrics.dashboardUrl
            },
            !metrics.healthy && {
              type: 'button',
              text: { type: 'plain_text', text: 'Run Diagnostics' },
              action_id: 'run_diagnostics',
              value: metrics.checkId
            }
          ].filter(Boolean)
        }
      ].filter(Boolean)
    }]
  });
}
```

</examples>

<integration_notes>

## Slack Web API

**Authentication**
```javascript
const { WebClient } = require('@slack/web-api');

const client = new WebClient(process.env.SLACK_BOT_TOKEN);

// Send message
await client.chat.postMessage({
  channel: '#notifications',
  text: 'Hello from API!'
});

// Upload file
await client.files.uploadV2({
  channel_id: '#logs',
  file: fs.createReadStream('./error.log'),
  title: 'Error Log'
});

// Update message
await client.chat.update({
  channel: '#notifications',
  ts: messageTimestamp,
  text: 'Updated message'
});

// Add reaction
await client.reactions.add({
  channel: '#notifications',
  timestamp: messageTimestamp,
  name: 'white_check_mark'
});
```

**Rate Limit Handling**
```javascript
const client = new WebClient(token, {
  retryConfig: {
    retries: 3,
    condition: (error) => {
      return error.data?.error === 'ratelimited';
    }
  }
});
```

## Bolt Framework

**Interactive Bot Setup**
```javascript
const { App } = require('@slack/bolt');

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

// Handle button clicks
app.action('approve', async ({ action, ack, body, client }) => {
  await ack();

  const requestId = action.value;
  await processApproval(requestId);

  await client.chat.update({
    channel: body.channel.id,
    ts: body.message.ts,
    text: `✅ Request ${requestId} approved by <@body.user.id>`
  });
});

// Handle slash commands
app.command('/deploy', async ({ command, ack, respond, client }) => {
  await ack();

  const deployment = await startDeployment(command.text);
  await respond(`Starting deployment ${deployment.id}...`);

  // Send progress updates
  await sendDeploymentProgress(deployment);
});

// Start server
await app.start(3000);
```

## Webhook Integration

**Simple Webhook Sender**
```javascript
const axios = require('axios');

async function sendWebhook(url, message) {
  try {
    const response = await axios.post(url, message, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 5000
    });

    if (response.data !== 'ok') {
      throw new Error('Slack webhook returned non-ok response');
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      status: error.response?.status
    };
  }
}
```

## Third-Party Integrations

**GitHub Integration**
```javascript
// Using GitHub Actions
- name: Notify Slack on failure
  if: failure()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    text: 'Build failed'
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

**Jenkins Integration**
```groovy
// Jenkins pipeline
node {
  try {
    // Build steps
    sh 'npm run build'
  } catch (e) {
    slackSend(
      channel: '#builds',
      color: 'danger',
      message: "Build failed: ${env.BUILD_URL}"
    )
    throw e
  }

  slackSend(
    channel: '#builds',
    color: 'good',
    message: "Build succeeded: ${env.BUILD_URL}"
  )
}
```

**Datadog Integration**
```javascript
// Datadog webhook
datadog.configure({
  webhookUrl: process.env.SLACK_WEBHOOK_URL,
  messageTemplate: (alert) => ({
    text: `Alert: ${alert.title}`,
    blocks: buildAlertBlocks(alert)
  })
});
```

## Event Source Integration

**AWS CloudWatch to Slack**
```javascript
const AWS = require('aws-sdk');

exports.handler = async (event) => {
  const alarm = event.detail;
  const message = {
    text: `CloudWatch Alarm: ${alarm.AlarmName}`,
    blocks: buildAlarmBlocks(alarm)
  };

  await sendWebhook(process.env.SLACK_WEBHOOK_URL, message);
};
```

**Azure Monitor to Slack**
```javascript
// Azure Action Group webhook
const azureEvent = req.body;

const message = {
  text: `Azure Alert: ${azureEvent.data.context.name}`,
  blocks: buildAzureAlertBlocks(azureEvent)
};

await sendWebhook(process.env.SLACK_WEBHOOK_URL, message);
```

</integration_notes>

<error_handling>

## Webhook Failures

**Common Issues**
1. Invalid webhook URL
2. Network connectivity issues
3. Timeout errors
4. Payload too large
5. Invalid message format

**Handling Strategies**
```javascript
async function sendWithFallback(url, message) {
  try {
    return await sendWebhook(url, message);
  } catch (error) {
    // Log error
    logger.error('Slack webhook failed', { error: error.message, url });

    // Fallback strategies
    if (error.code === 'ENOTFOUND') {
      // Network error - retry with exponential backoff
      return await retryWithBackoff(() => sendWebhook(url, message));
    } else if (error.response?.status === 404) {
      // Invalid webhook - alert team
      await alertTeam('Invalid Slack webhook');
      throw new Error('Invalid webhook URL');
    } else if (error.code === 'ETIMEDOUT') {
      // Timeout - try backup webhook
      if (process.env.SLACK_BACKUP_WEBHOOK) {
        return await sendWebhook(process.env.SLACK_BACKUP_WEBHOOK, message);
      }
    }

    throw error;
  }
}
```

## Rate Limit Errors

**Detection**
```javascript
function isRateLimitError(error) {
  return error.response?.status === 429 ||
         error.data?.error === 'ratelimited';
}
```

**Exponential Backoff**
```javascript
async function sendWithBackoff(url, message, maxRetries = 5) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await sendWebhook(url, message);
    } catch (error) {
      if (!isRateLimitError(error) || attempt === maxRetries - 1) {
        throw error;
      }

      const retryAfter = error.response?.headers?.['retry-after'] || Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
    }
  }
}
```

## Message Validation

**Pre-Send Validation**
```javascript
function validateMessage(message) {
  const errors = [];

  if (!message.text && !message.blocks) {
    errors.push('Message must have either text or blocks');
  }

  if (message.text && message.text.length > 40000) {
    errors.push('Message text exceeds 40,000 character limit');
  }

  if (message.blocks && message.blocks.length > 100) {
    errors.push('Message exceeds 100 block limit');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// Usage
const validation = validateMessage(message);
if (!validation.valid) {
  throw new Error(`Invalid message: ${validation.errors.join(', ')}`);
}
```

## Dead Letter Queue

**Failed Message Queue**
```javascript
class DeadLetterQueue {
  constructor() {
    this.failed = [];
    this.maxSize = 1000;
  }

  async add(message, error) {
    this.failed.push({
      message,
      error: error.message,
      timestamp: new Date().toISOString(),
      attempts: 0
    });

    if (this.failed.length > this.maxSize) {
      // Persist to external storage
      await this.persistToStorage(this.failed.shift());
    }
  }

  async retry() {
    const toRetry = this.failed.filter(m => m.attempts < 3);
    this.failed = this.failed.filter(m => m.attempts >= 3);

    for (const item of toRetry) {
      try {
        await sendWebhook(item.message.url, item.message);
      } catch (error) {
        item.attempts++;
        await this.add(item.message, error);
      }
    }
  }
}
```

## Monitoring and Alerting

**Health Checks**
```javascript
async function healthCheck() {
  try {
    const result = await sendWebhook(process.env.SLACK_HEALTHCHECK_CHANNEL, {
      text: 'Health check'
    });

    return {
      healthy: result.success,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    // Alert on health check failure
    await alertTeam('Slack integration unhealthy');
    return {
      healthy: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

// Run health checks periodically
setInterval(async () => {
  const health = await healthCheck();
  metrics.record('slack.health_check', health);
}, 60000); // Every minute
```

**Error Metrics**
```javascript
const metrics = {
  totalSent: 0,
  totalFailed: 0,
  rateLimited: 0,
  avgResponseTime: 0,

  record(type, data) {
    this.totalSent++;
    if (type === 'failure') this.totalFailed++;
    if (type === 'rate_limited') this.rateLimited++;
    if (data.responseTime) {
      this.avgResponseTime =
        (this.avgResponseTime * (this.totalSent - 1) + data.responseTime) /
        this.totalSent;
    }
  },

  getFailureRate() {
    return this.totalFailed / this.totalSent;
  },

  shouldAlert() {
    return this.getFailureRate() > 0.05; // Alert if >5% failure rate
  }
};
```

</error_handling>

<output_format>

## Message Structure

**Minimal Message**
```json
{
  "text": "Simple text message"
}
```

**Full Message with Blocks**
```json
{
  "channel": "#notifications",
  "username": "Notification Bot",
  "icon_emoji": ":robot_face:",
  "text": "Fallback text for notifications",
  "blocks": [
    {
      "type": "header",
      "text": {
        "type": "plain_text",
        "text": "Header text",
        "emoji": true
      }
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*Bold* and `code` text"
      },
      "fields": [
        {
          "type": "mrkdwn",
          "text": "*Field 1:*\nValue 1"
        },
        {
          "type": "mrkdwn",
          "text": "*Field 2:*\nValue 2"
        }
      ]
    },
    {
      "type": "divider"
    },
    {
      "type": "actions",
      "elements": [
        {
          "type": "button",
          "text": {
            "type": "plain_text",
            "text": "Click me",
            "emoji": true
          },
          "url": "https://example.com",
          "style": "primary"
        }
      ]
    },
    {
      "type": "context",
      "elements": [
        {
          "type": "mrkdwn",
          "text": "Sent by Notification Bot"
        }
      ]
    }
  ]
}
```

**Attachment Format (Legacy)**
```json
{
  "attachments": [
    {
      "color": "#36a64f",
      "title": "Attachment Title",
      "title_link": "https://example.com",
      "text": "Attachment text",
      "fields": [
        {
          "title": "Field 1",
          "value": "Value 1",
          "short": true
        },
        {
          "title": "Field 2",
          "value": "Value 2",
          "short": true
        }
      ],
      "footer": "Footer text",
      "ts": 1234567890,
      "actions": [
        {
          "type": "button",
          "text": "Action",
          "url": "https://example.com",
          "style": "primary"
        }
      ]
    }
  ]
}
```

**Threaded Response**
```json
{
  "channel": "#notifications",
  "text": "Thread reply",
  "thread_ts": "1234567890.123456",
  "reply_broadcast": false
}
```

## Response Format

**Success Response**
```json
{
  "ok": true
}
```

**Error Response**
```json
{
  "ok": false,
  "error": "channel_not_found",
  "response_metadata": {
    "messages": [
      "A more detailed error message"
    ]
  }
}
```

</output_format>

<related_skills>
- notifications-local: Local system notifications for development
- ci-cd: CI/CD pipeline integration and automation
- error-handling: Comprehensive error handling strategies
- api-integration: API integration best practices
- monitoring: System monitoring and alerting
- event-driven-architecture: Event-driven notification patterns
</related_skills>

<see_also>

## Official Documentation
- **Slack API Documentation**: https://api.slack.com/docs
- **Block Kit Builder**: https://api.slack.com/block-kit/building
- **Bolt Framework**: https://slack.dev/bolt-js/tutorial/getting-started
- **Rate Limits**: https://api.slack.com/docs/rate-limits
- **Incoming Webhooks**: https://api.slack.com/messaging/webhooks

## Community Resources
- **Slack Community**: https://slackcommunity.com/
- **Slack SDK GitHub**: https://github.com/slackapi/node-slack-sdk
- **Awesome Slack**: https://github.com/filipelinhares/awesome-slack

## Tutorials
- **Building Slack Bots**: https://slack.dev/bolt-js/tutorial/getting-started
- **Message Composition**: https://api.slack.com/messaging/composing/layouts
- **Interactive Components**: https://api.slack.com/interactivity/handling

## Tools
- **Block Kit Builder**: https://api.slack.com/block-kit/building
- **Slack CLI**: https://api.slack.com/automation/cli/install
- **Slack Developer Tools**: https://api.slack.com/apps

## Related Technologies
- **Discord Webhooks**: Alternative notification platform
- **Mattermost**: Open-source Slack alternative
- **Microsoft Teams**: Enterprise collaboration platform

</see_also>
