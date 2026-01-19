---
name: webhooks
category: integration-connectivity/api-integrations
title: Webhook Integration and Handling
description: Comprehensive guide to webhook integration, verification, retry logic, and building reliable webhook handlers for real-time event notifications
version: 1.0.0
last_updated: 2026-01-18
tags: [webhooks, events, notifications, integration, security, retry-logic]
dependencies: []
related_skills: [rest-api, mcp-integrations/github, mcp-integrations/stripe]
---

<context>
Webhooks enable real-time, event-driven communication between systems. When an event occurs in one service, it sends an HTTP POST request to a webhook URL you provide, allowing your application to react immediately. This skill provides comprehensive patterns for implementing secure, reliable webhook handlers that verify signatures, handle retries, and process events asynchronously.

This skill covers:
- Webhook endpoint implementation
- Signature verification for security
- Idempotency for safe retries
- Asynchronous event processing
- Error handling and retry logic
- Rate limiting and throttling
- Webhook delivery monitoring
- Best practices for production

Whether you're receiving webhooks from Stripe, GitHub, Slack, or custom services, these patterns will help you build robust webhook handlers.
</context>

<instructions>
When implementing webhook handlers:

1. **Always verify webhook signatures**
   - Never trust incoming requests without verification
   - Use HMAC signatures to verify authenticity
   - Verify timestamps to prevent replay attacks
   - Reject requests with invalid signatures immediately

2. **Implement idempotency**
   - Process events idempotently (same result on duplicate delivery)
   - Use idempotency keys when available
   - Track processed event IDs to prevent duplicates
   - Return 200 OK immediately for already-processed events

3. **Process events asynchronously**
   - Return 200 OK response immediately after verification
   - Queue events for background processing
   - Don't block the webhook response on processing
   - Use job queues for reliable processing

4. **Handle retry logic properly**
   - Return appropriate HTTP status codes (4xx for no retry, 5xx for retry)
   - Implement exponential backoff for retries
   - Set up monitoring for failed events
   - Limit retry attempts to prevent infinite loops

5. **Log all webhook events**
   - Log raw payloads for debugging
   - Include event IDs and timestamps
   - Track processing status
   - Monitor for anomalies

6. **Validate webhook payloads**
   - Validate required fields
   - Check event types are supported
   - Sanitize data before processing
   - Handle unexpected event types gracefully

7. **Monitor webhook health**
   - Track delivery success rates
   - Alert on high failure rates
   - Monitor processing latency
   - Set up dashboards for visibility
</instructions>

<rules>
- MUST verify webhook signatures before processing
- MUST return 200 OK response within 5 seconds
- MUST process events asynchronously (don't block response)
- MUST implement idempotency for all event handlers
- NEVER expose webhook URLs without authentication
- MUST log all incoming webhook events
- MUST return 2xx status for successful processing
- MUST return 4xx status for client errors (no retry)
- MUST return 5xx status for server errors (should retry)
- MUST validate event structure before processing
- MUST use HTTPS for webhook endpoints
- MUST handle duplicate event deliveries gracefully
- MUST implement rate limiting on webhook endpoints
- MUST sanitize webhook data before use
</rules>

<workflow>
1. **Receive Webhook**
   - Extract signature from headers
   - Read raw request body
   - Verify signature authenticity
   - Reject if signature is invalid

2. **Quick Validation**
   - Verify timestamp (prevent replay attacks)
   - Validate event structure
   - Check event type is supported
   - Return 400 for invalid events

3. **Idempotency Check**
   - Check if event was already processed
   - Return 200 if already processed
   - Continue if new event

4. **Queue for Processing**
   - Store event in database/queue
   - Return 200 OK immediately
   - Don't block on processing

5. **Background Processing**
   - Process event asynchronously
   - Update processing status
   - Handle errors gracefully
   - Retry failed processing

6. **Monitoring**
   - Log all events
   - Track metrics
   - Alert on failures
   - Monitor delivery health
</workflow>

<best_practices>
- Use HMAC signatures for webhook verification
- Implement idempotency using event IDs or idempotency keys
- Process webhooks asynchronously with a job queue
- Store raw webhook payloads for debugging
- Validate event structure before processing
- Use HTTPS for all webhook endpoints
- Implement proper error handling and retry logic
- Monitor webhook delivery and processing
- Test webhook handlers locally with tools like ngrok
- Document webhook event types and payloads
- Set up alerting for webhook failures
- Use exponential backoff for retries
- Implement circuit breakers for failing handlers
- Keep webhook endpoint response time under 5 seconds
- Use proper HTTP status codes (2xx, 4xx, 5xx)
- Implement rate limiting to prevent abuse
- Use structured logging with correlation IDs
</best_practices>

<anti_patterns>
- ❌ Not verifying webhook signatures (security risk)
- ❌ Processing events synchronously (blocks response)
- ❌ Not implementing idempotency (duplicate processing)
- ❌ Returning wrong status codes (affects retry behavior)
- ❌ Logging sensitive webhook data (security risk)
- ❌ Not validating event structure (crashes on malformed data)
- ❌ Blocking webhook response on processing (timeouts)
- ❌ Not handling duplicate events (data inconsistency)
- ❌ Exposing raw errors in responses (security risk)
- ❌ Not monitoring webhook failures (missed issues)
- ❌ Processing webhooks without HTTPS (security risk)
- ❌ Not implementing rate limiting (DoS vulnerability)
- ❌ Hardcoding webhook secrets (security risk)
- ❌ Not handling malformed JSON (crashes)
- ❌ Ignoring timestamp checks (replay attacks)
</anti_patterns>

<examples>
Example 1: Express Webhook Handler with Signature Verification (Node.js)
```javascript
// webhookHandler.js
const crypto = require('crypto');
const express = require('express');
const { Queue } = require('bull');
const Redis = require('ioredis');

const app = express();

// Configuration
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
const WEBHOOK_PATH = '/webhooks/stripe';

// Set up queue for background processing
const webhookQueue = new Queue('webhook-processing', {
  redis: new Redis(process.env.REDIS_URL)
});

// Store processed events for idempotency
const processedEvents = new Set();
const PROCESSED_EVENTS_TTL = 24 * 60 * 60 * 1000; // 24 hours

// Middleware to capture raw body
app.use(WEBHOOK_PATH, express.raw({ type: 'application/json' }));

// Webhook endpoint
app.post(WEBHOOK_PATH, async (req, res) => {
  const startTime = Date.now();
  const signature = req.headers['stripe-signature'];

  try {
    // 1. Verify signature
    const event = verifyWebhookSignature(req.body, signature);

    console.log(`[${event.id}] Received ${event.type} webhook`);

    // 2. Verify timestamp (prevent replay attacks)
    const timestamp = req.headers['stripe-signature'].split(',')[1];
    if (timestamp) {
      const webhookTimestamp = parseInt(timestamp.split('=')[1]) * 1000;
      const currentTime = Date.now();
      const timeDiff = Math.abs(currentTime - webhookTimestamp);

      // Reject webhooks older than 5 minutes
      if (timeDiff > 5 * 60 * 1000) {
        console.error(`[${event.id}] Webhook timestamp too old`);
        return res.status(400).json({ error: 'Timestamp too old' });
      }
    }

    // 3. Check idempotency
    if (processedEvents.has(event.id)) {
      console.log(`[${event.id}] Event already processed, skipping`);
      return res.status(200).json({ received: true, idempotent: true });
    }

    // 4. Queue for background processing
    await webhookQueue.add('process-webhook', {
      eventId: event.id,
      eventType: event.type,
      eventData: event.data
    }, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000
      },
      removeOnComplete: 100,
      removeOnFail: 500
    });

    // 5. Mark as processed (before actual processing)
    processedEvents.add(event.id);
    setTimeout(() => processedEvents.delete(event.id), PROCESSED_EVENTS_TTL);

    // 6. Return 200 OK immediately
    const processingTime = Date.now() - startTime;
    console.log(`[${event.id}] Accepted in ${processingTime}ms`);

    return res.status(200).json({
      received: true,
      eventId: event.id
    });

  } catch (error) {
    console.error('Webhook error:', error);

    // Return 400 for signature verification failures (no retry)
    if (error.type === 'StripeSignatureError') {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    // Return 500 for server errors (should retry)
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Signature verification
function verifyWebhookSignature(rawBody, signature) {
  if (!signature) {
    throw new Error('No signature provided');
  }

  const elements = signature.split(',');
  let timestamp;
  let signatureHash;

  for (const element of elements) {
    const [key, value] = element.trim().split('=');
    if (key === 't') {
      timestamp = value;
    } else if (key === 'v1') {
      signatureHash = value;
    }
  }

  // Construct expected signature
  const payload = `${timestamp}.${rawBody}`;
  const expectedSignature = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');

  // Secure comparison
  if (signatureHash !== expectedSignature) {
    throw new Error('Invalid signature');
  }

  // Parse JSON body
  const event = JSON.parse(rawBody.toString());

  return event;
}

// Background processing worker
webhookQueue.process('process-webhook', async (job) => {
  const { eventId, eventType, eventData } = job.data;

  console.log(`[${eventId}] Processing ${eventType}`);

  try {
    await processWebhookEvent(eventType, eventData);
    console.log(`[${eventId}] Successfully processed ${eventType}`);
  } catch (error) {
    console.error(`[${eventId}] Error processing ${eventType}:`, error);
    throw error; // Will trigger retry
  }
});

// Event handlers
async function processWebhookEvent(eventType, eventData) {
  switch (eventType) {
    case 'payment_intent.succeeded':
      await handlePaymentSucceeded(eventData.object);
      break;

    case 'payment_intent.payment_failed':
      await handlePaymentFailed(eventData.object);
      break;

    case 'customer.subscription.created':
      await handleSubscriptionCreated(eventData.object);
      break;

    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(eventData.object);
      break;

    default:
      console.log(`Unhandled event type: ${eventType}`);
  }
}

async function handlePaymentSucceeded(paymentIntent) {
  // Update database, send notifications, etc.
  console.log(`Payment succeeded: ${paymentIntent.id}`);
}

async function handlePaymentFailed(paymentIntent) {
  // Handle failed payment
  console.log(`Payment failed: ${paymentIntent.id}`);
}

async function handleSubscriptionCreated(subscription) {
  // Create subscription in database
  console.log(`Subscription created: ${subscription.id}`);
}

async function handleSubscriptionDeleted(subscription) {
  // Cancel subscription in database
  console.log(`Subscription deleted: ${subscription.id}`);
}

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Webhook server listening on port ${PORT}`);
});
```

Example 2: FastAPI Webhook Handler with Signature Verification (Python)
```python
# webhook_handler.py
import os
import hmac
import hashlib
import time
import json
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from fastapi import FastAPI, Request, HTTPException, Header, BackgroundTasks
from fastapi.responses import JSONResponse
import redis
import logging
from pydantic import BaseModel

# Configuration
WEBHOOK_SECRET = os.getenv('WEBHOOK_SECRET').encode()
REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379')
TOLERANCE_SECONDS = 300  # 5 minutes

# Set up Redis for idempotency
redis_client = redis.from_url(REDIS_URL)

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

class WebhookEvent(BaseModel):
    id: str
    type: str
    data: Dict[str, Any]
    created: int

def verify_signature(payload: bytes, signature: str, timestamp: str) -> bool:
    """Verify webhook signature."""
    # Construct expected signature
    payload_str = timestamp.encode() + b'.' + payload
    expected_signature = hmac.new(
        WEBHOOK_SECRET,
        payload_str,
        hashlib.sha256
    ).hexdigest()

    # Secure comparison
    return hmac.compare_digest(signature, expected_signature)

def is_timestamp_valid(timestamp: str) -> bool:
    """Check if timestamp is within tolerance."""
    try:
        webhook_time = datetime.fromtimestamp(int(timestamp))
        current_time = datetime.now()
        time_diff = abs((current_time - webhook_time).total_seconds())
        return time_diff <= TOLERANCE_SECONDS
    except (ValueError, TypeError):
        return False

def is_event_processed(event_id: str) -> bool:
    """Check if event was already processed (idempotency)."""
    return redis_client.exists(f'webhook:processed:{event_id}')

def mark_event_processed(event_id: str, ttl: int = 86400) -> None:
    """Mark event as processed with TTL."""
    redis_client.setex(f'webhook:processed:{event_id}', ttl, '1')

async def process_webhook_event(event_type: str, event_data: Dict[str, Any]) -> None:
    """Process webhook event in background."""
    logger.info(f"Processing event: {event_type}")

    if event_type == 'payment_intent.succeeded':
        await handle_payment_succeeded(event_data)
    elif event_type == 'payment_intent.payment_failed':
        await handle_payment_failed(event_data)
    elif event_type == 'customer.subscription.created':
        await handle_subscription_created(event_data)
    elif event_type == 'customer.subscription.deleted':
        await handle_subscription_deleted(event_data)
    else:
        logger.warning(f"Unhandled event type: {event_type}")

async def handle_payment_succeeded(payment_intent: Dict[str, Any]) -> None:
    """Handle successful payment."""
    logger.info(f"Payment succeeded: {payment_intent['id']}")
    # Update database, send notifications, etc.

async def handle_payment_failed(payment_intent: Dict[str, Any]) -> None:
    """Handle failed payment."""
    logger.info(f"Payment failed: {payment_intent['id']}")
    # Handle failed payment

async def handle_subscription_created(subscription: Dict[str, Any]) -> None:
    """Handle subscription creation."""
    logger.info(f"Subscription created: {subscription['id']}")
    # Create subscription in database

async def handle_subscription_deleted(subscription: Dict[str, Any]) -> None:
    """Handle subscription deletion."""
    logger.info(f"Subscription deleted: {subscription['id']}")
    # Cancel subscription in database

@app.post('/webhooks/stripe')
async def handle_stripe_webhook(
    request: Request,
    background_tasks: BackgroundTasks,
    stripe_signature: str = Header(..., alias='Stripe-Signature')
) -> JSONResponse:
    """Handle incoming Stripe webhooks."""
    start_time = time.time()

    try:
        # Read raw body
        raw_body = await request.body()

        # Parse signature
        signature_elements = stripe_signature.split(',')
        timestamp = None
        signature_hash = None

        for element in signature_elements:
            key, value = element.strip().split('=')
            if key == 't':
                timestamp = value
            elif key == 'v1':
                signature_hash = value

        if not timestamp or not signature_hash:
            logger.error("Invalid signature format")
            raise HTTPException(status_code=400, detail="Invalid signature")

        # 1. Verify signature
        if not verify_signature(raw_body, signature_hash, timestamp):
            logger.error("Signature verification failed")
            raise HTTPException(status_code=400, detail="Invalid signature")

        # 2. Verify timestamp
        if not is_timestamp_valid(timestamp):
            logger.error(f"Timestamp too old or too new: {timestamp}")
            raise HTTPException(status_code=400, detail="Timestamp too old")

        # 3. Parse event
        try:
            event = WebhookEvent(**json.loads(raw_body))
        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON: {e}")
            raise HTTPException(status_code=400, detail="Invalid JSON")

        logger.info(f"Received event: {event.id} ({event.type})")

        # 4. Check idempotency
        if is_event_processed(event.id):
            logger.info(f"Event {event.id} already processed, skipping")
            processing_time = time.time() - start_time
            return JSONResponse({
                'received': True,
                'idempotent': True,
                'processing_time_ms': round(processing_time * 1000, 2)
            })

        # 5. Queue for background processing
        background_tasks.add_task(
            process_webhook_event,
            event.type,
            event.data
        )

        # 6. Mark as processed
        mark_event_processed(event.id)

        processing_time = time.time() - start_time
        logger.info(f"Event {event.id} accepted in {processing_time:.3f}s")

        return JSONResponse({
            'received': True,
            'event_id': event.id,
            'processing_time_ms': round(processing_time * 1000, 2)
        })

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Webhook processing error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get('/health')
async def health_check() -> Dict[str, str]:
    """Health check endpoint."""
    return {'status': 'healthy'}

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host='0.0.0.0', port=8000)
```

Example 3: Webhook Delivery Monitoring
```javascript
// webhookMonitor.js
const express = require('express');
const { Pool } = require('pg');

const app = express();
const db = new Pool({ connectionString: process.env.DATABASE_URL });

// Webhook delivery tracking
class WebhookMonitor {
  constructor(db) {
    this.db = db;
  }

  async logDelivery(webhookData) {
    const { eventId, eventType, status, processingTime, error } = webhookData;

    await this.db.query(
      `INSERT INTO webhook_deliveries
        (event_id, event_type, status, processing_time_ms, error, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [eventId, eventType, status, processingTime, error]
    );
  }

  async getStats(timeRange = '24 hours') {
    const result = await this.db.query(
      `SELECT
        event_type,
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'success') as successful,
        COUNT(*) FILTER (WHERE status = 'failed') as failed,
        AVG(processing_time_ms) as avg_processing_time,
        MAX(processing_time_ms) as max_processing_time
       FROM webhook_deliveries
       WHERE created_at >= NOW() - INTERVAL '${timeRange}'
       GROUP BY event_type
       ORDER BY total DESC`
    );

    return result.rows;
  }

  async getFailureRate(timeRange = '1 hour') {
    const result = await this.db.query(
      `SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'failed') as failed,
        ROUND(
          COUNT(*) FILTER (WHERE status = 'failed')::NUMERIC /
          NULLIF(COUNT(*), 0) * 100,
          2
        ) as failure_rate
       FROM webhook_deliveries
       WHERE created_at >= NOW() - INTERVAL '${timeRange}'`
    );

    return result.rows[0];
  }

  async getRecentFailures(limit = 50) {
    const result = await this.db.query(
      `SELECT event_id, event_type, error, created_at
       FROM webhook_deliveries
       WHERE status = 'failed'
       ORDER BY created_at DESC
       LIMIT $1`,
      [limit]
    );

    return result.rows;
  }

  async alertOnHighFailureRate(threshold = 10) {
    const stats = await this.getFailureRate('15 minutes');

    if (stats.failure_rate >= threshold) {
      // Send alert (email, Slack, PagerDuty, etc.)
      await sendAlert({
        subject: 'High webhook failure rate',
        message: `Failure rate: ${stats.failure_rate}%`,
        stats
      });
    }
  }
}

// Monitoring dashboard endpoint
app.get('/webhooks/stats', async (req, res) => {
  const monitor = new WebhookMonitor(db);

  const stats = await monitor.getStats();
  const failureRate = await monitor.getFailureRate();
  const recentFailures = await monitor.getRecentFailures();

  res.json({
    stats,
    failureRate,
    recentFailures: recentFailures.slice(0, 10)
  });
});

// Check for alerts every 5 minutes
setInterval(async () => {
  const monitor = new WebhookMonitor(db);
  await monitor.alertOnHighFailureRate(10);
}, 5 * 60 * 1000);
```

Example 4: Testing Webhooks Locally with ngrok
```bash
#!/bin/bash
# test-webhooks.sh

# Start ngrok tunnel
echo "Starting ngrok tunnel..."
ngrok http 3000 > /dev/null &
NGROK_PID=$!

# Wait for ngrok to start
sleep 3

# Get ngrok URL
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | \
  jq -r '.tunnels[0].public_url')

echo "Ngrok URL: $NGROK_URL"
WEBHOOK_URL="$NGROK_URL/webhooks/stripe"

# Update webhook in external service
echo "Updating webhook URL in Stripe..."
stripe webhook update \
  we_1234567890 \
  --url="$WEBHOOK_URL"

# Wait for webhooks
echo "Waiting for webhooks..."
echo "Webhook URL: $WEBHOOK_URL"
echo "Press Ctrl+C to stop"

# Monitor incoming webhooks
curl -s "$NGROK_URL/webhooks/stripe" &

# Cleanup on exit
trap "kill $NGROK_PID" EXIT
wait
```

```javascript
// testWebhook.js - Send test webhooks
const crypto = require('crypto');
const fetch = require('node-fetch');

const WEBHOOK_SECRET = 'whsec_12345';
const WEBHOOK_URL = 'http://localhost:3000/webhooks/stripe';

function sendTestWebhook(eventType, data) {
  const timestamp = Math.floor(Date.now() / 1000);
  const payload = JSON.stringify({
    id: `evt_${Date.now()}`,
    type: eventType,
    data: { object: data },
    created: timestamp
  });

  // Generate signature
  const signaturePayload = `${timestamp}.${payload}`;
  const signature = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(signaturePayload)
    .digest('hex');

  // Send webhook
  return fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Stripe-Signature': `t=${timestamp},v1=${signature}`
    },
    body: payload
  });
}

// Test successful payment
sendTestWebhook('payment_intent.succeeded', {
  id: 'pi_1234567890',
  amount: 2000,
  currency: 'usd',
  status: 'succeeded'
})
  .then(res => res.json())
  .then(data => console.log('Success:', data))
  .catch(err => console.error('Error:', err));

// Test failed payment
sendTestWebhook('payment_intent.payment_failed', {
  id: 'pi_0987654321',
  amount: 2000,
  currency: 'usd',
  status: 'requires_payment_method',
  last_payment_error: {
    message: 'Your card was declined.'
  }
})
  .then(res => res.json())
  .then(data => console.log('Success:', data))
  .catch(err => console.error('Error:', err));
```

Example 5: Idempotency Key Implementation
```javascript
// idempotency.js
const crypto = require('crypto');

class IdempotencyManager {
  constructor(redis) {
    this.redis = redis;
    this.ttl = 24 * 60 * 60; // 24 hours
  }

  generateKey() {
    return crypto.randomBytes(32).toString('hex');
  }

  async check(idempotencyKey) {
    const key = `idempotency:${idempotencyKey}`;
    const result = await this.redis.get(key);

    if (result) {
      return JSON.parse(result);
    }

    return null;
  }

  async store(idempotencyKey, response, params) {
    const key = `idempotency:${idempotencyKey}`;
    const value = JSON.stringify({
      response,
      params,
      timestamp: Date.now()
    });

    await this.redis.setex(key, this.ttl, value);
  }

  async run(idempotencyKey, fn, params) {
    // Check if we've seen this key before
    const previous = await this.check(idempotencyKey);

    if (previous) {
      // Verify params match
      if (JSON.stringify(previous.params) === JSON.stringify(params)) {
        console.log('Returning cached response for idempotency key');
        return previous.response;
      } else {
        throw new Error('Idempotency key reused with different params');
      }
    }

    // Execute the function
    const response = await fn(params);

    // Store the result
    await this.store(idempotencyKey, response, params);

    return response;
  }
}

// Usage
const manager = new IdempotencyManager(redisClient);

app.post('/create-payment', async (req, res) => {
  const { idempotency_key, amount, currency } = req.body;

  try {
    const result = await manager.run(
      idempotency_key,
      async () => {
        // Create payment (only runs if idempotency key is new)
        return await stripe.paymentIntents.create({
          amount,
          currency
        });
      },
      { amount, currency }
    );

    res.json(result);
  } catch (error) {
    if (error.message.includes('Idempotency key reused')) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Payment failed' });
    }
  }
});
```

Example 6: Webhook Retry Configuration (Stripe)
```javascript
// stripeWebhooks.js - Configure retry behavior

// When processing fails, return appropriate status codes
app.post('/webhooks/stripe', async (req, res) => {
  try {
    const event = verifyWebhook(req.body, req.headers['stripe-signature']);

    // Process event...

    // Return 200 for success
    return res.status(200).json({ received: true });

  } catch (error) {
    if (error.type === 'StripeSignatureError') {
      // Return 400 for client errors (no retry)
      return res.status(400).json({ error: 'Invalid signature' });
    } else if (error.type === 'UnsupportedEventType') {
      // Return 400 for unsupported events (no retry)
      return res.status(400).json({ error: 'Unsupported event type' });
    } else {
      // Return 500 for server errors (will retry)
      console.error('Webhook processing error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// Stripe retry schedule:
// - Retries over 72 hours with exponential backoff
// - 5 minutes, 30 minutes, 2 hours, 10 hours, 10 hours, etc.
// - Returns 4xx status codes = no more retries
// - Returns 5xx or timeout = continue retrying
```

Example 7: Rate Limiting for Webhook Endpoints
```javascript
// rateLimiter.js
const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const redis = require('redis');

const redisClient = redis.createClient({
  url: process.env.REDIS_URL
});

// Rate limiter for webhook endpoints
const webhookRateLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rate-limit:webhooks:'
  }),
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.warn(`Rate limit exceeded for ${req.ip}`);
    res.status(429).json({
      error: 'Too many requests',
      retryAfter: '60'
    });
  }
});

// Stricter rate limiting per webhook source
const perSourceRateLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rate-limit:webhooks:source:'
  }),
  windowMs: 60 * 1000,
  max: 50,
  keyGenerator: (req) => {
    // Use source IP or a custom header
    return req.headers['x-webhook-source'] || req.ip;
  }
});

// Apply to webhook endpoint
app.post('/webhooks/stripe',
  webhookRateLimiter,
  perSourceRateLimiter,
  handleWebhook
);
```
</examples>

<integration_notes>
This skill integrates with:

- **rest-api**: Webhook endpoints follow REST patterns
- **mcp-integrations/stripe**: Stripe uses webhooks extensively
- **mcp-integrations/github**: GitHub webhooks for repository events
- **systematic-debugging**: Debugging webhook issues
- **collaboration/notifications-telegram**: Sending webhook notifications

When to use this skill:
- Receiving webhooks from payment providers (Stripe, PayPal)
- Processing GitHub events (push, PR, issues)
- Handling Slack/Slack bot events
- Real-time notifications from SaaS products
- Custom event-driven integrations

Common pitfalls:
- Not verifying webhook signatures
- Processing synchronously (blocks response)
- Not implementing idempotency
- Wrong status codes (affects retry behavior)
- Not logging webhook events
- Missing error handling
</integration_notes>

<error_handling>
Common webhook errors and solutions:

**Signature Verification Failures**
- Invalid signature: Check webhook secret, verify signing method
- Timestamp mismatch: Check system time, verify tolerance
- Encoding issues: Ensure raw body is used, not parsed

**Idempotency Issues**
- Duplicate processing: Store event IDs before processing
- Race conditions: Use atomic operations for idempotency checks
- Memory leaks: Clean up processed event IDs

**Processing Failures**
- Timeout errors: Process asynchronously, increase timeout
- Dependency failures: Implement retries, circuit breakers
- Data validation errors: Validate before processing

**Delivery Issues**
- High failure rates: Monitor and alert, check handler logic
- Slow processing: Use job queues, optimize handlers
- Missing webhooks: Check firewall, verify endpoint URL

**Debugging Tips:**
1. Log raw webhook payloads
2. Use webhook testing tools (ngrok, webhook.site)
3. Test with service-specific CLI tools
4. Monitor delivery dashboards
5. Set up alerts for failures
</error_handling>

<output_format>
Webhook endpoint should return:

**Success Response (200 OK)**
```json
{
  "received": true,
  "event_id": "evt_1234567890",
  "processing_time_ms": 45.23
}
```

**Idempotent Response (200 OK)**
```json
{
  "received": true,
  "idempotent": true,
  "event_id": "evt_1234567890",
  "message": "Event already processed"
}
```

**Error Response (400 Bad Request)**
```json
{
  "error": "Invalid signature",
  "code": "signature_verification_failed"
}
```

**Error Response (500 Internal Server Error)**
```json
{
  "error": "Internal server error",
  "retry_later": true
}
```
</output_format>

<related_skills>
- rest-api: Building webhook endpoints
- mcp-integrations/stripe: Stripe webhooks
- mcp-integrations/github: GitHub webhooks
- systematic-debugging: Troubleshooting webhooks
- collaboration/notifications-telegram: Webhook notifications
</related_skills>

<see_also>
- Stripe Webhooks: https://stripe.com/docs/webhooks
- GitHub Webhooks: https://docs.github.com/en/developers/webhooks-and-events/webhooks
- Webhook Security: https://www.fastly.com/blog/webhook-security-best-practices
- ngrok: https://ngrok.com/
- Express-Rate-Limit: https://github.com/nfriedly/express-rate-limit
- Bull Queue: https://github.com/OptimalBits/bull
</see_also>
