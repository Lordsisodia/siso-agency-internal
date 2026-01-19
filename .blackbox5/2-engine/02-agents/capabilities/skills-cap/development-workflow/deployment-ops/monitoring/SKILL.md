---
name: monitoring
category: development-workflow/deployment-ops
version: 1.0.0
description: Application monitoring, observability, and alerting strategies for production systems
author: blackbox5/core
verified: true
tags: [monitoring, observability, metrics, logging, alerts]
---

# Monitoring & Observability Skill

<context>
## Monitoring Fundamentals

**Monitoring is the foundation of reliable production systems.** Effective monitoring enables teams to detect, understand, and resolve issues before they impact users significantly.

### The Three Pillars of Observability

1. **Metrics**: Numerical time-series data that measure system behavior
   - Counter: Cumulative values that only increase (requests, errors)
   - Gauge: Point-in-time values that can go up or down (memory, temperature)
   - Histogram: Distributions of values (request latencies)
   - Summary: Similar to histogram with configurable quantiles

2. **Logs**: Discrete records of events with context
   - Structured logs with consistent schema
   - Correlation IDs for distributed tracing
   - Log levels: DEBUG, INFO, WARN, ERROR, FATAL
   - Centralized log aggregation and retention policies

3. **Traces**: Records of requests as they propagate through distributed systems
   - Span: Unit of work in a distributed trace
   - Trace ID: Correlates spans across services
   - Parent/Child relationships: Show call hierarchies
   - Baggage propagation: Context passing between services

### Why Monitoring Matters

- **Early Detection**: Catch issues before users do
- **Mean Time to Recovery (MTTR)**: Faster incident response
- **Capacity Planning**: Understand resource utilization trends
- **Performance Optimization**: Identify bottlenecks and inefficiencies
- **Business Intelligence**: User behavior and feature adoption
- **Compliance**: Audit trails and security monitoring
- **SLA/SLI Compliance**: Track service level objectives
</context>

<instructions>
## Designing Effective Monitoring Strategies

### Step 1: Define What Matters

**Start with user-facing metrics:**
- What indicates the system is working correctly?
- What would users notice first if broken?
- What are the critical business transactions?
- What are the acceptable performance thresholds?

**Example user journey:**
```
User loads product page → Product detail API → Inventory check → Recommendations
              ↓                    ↓                   ↓
         Page load time      API response time    Cache hit rate
```

### Step 2: Instrument at Every Layer

**Application Layer:**
- Request rate, error rate, latency
- Business metrics (orders processed, payments received)
- Custom domain metrics (active users, concurrent sessions)

**Infrastructure Layer:**
- CPU, memory, disk, network utilization
- Database connection pools, query performance
- Cache hit rates, eviction rates

**Platform Layer:**
- Kubernetes pod status, node health
- Service mesh metrics (success rate, latency)
- Load balancer metrics, CDN performance

### Step 3: Establish Baselines

**Measure normal behavior:**
- Capture metrics during peak and off-peak hours
- Document seasonal patterns (daily, weekly, annual)
- Understand correlation between metrics
- Establish natural variation ranges

**Example baseline:**
```
Metric: API Request Latency (p95)
Normal range: 80-120ms
Daily peak (2-4pm): 100-150ms
Alert threshold: >200ms for >5min
Critical threshold: >500ms for >1min
```

### Step 4: Design Meaningful Alerts

**Alert on symptoms, not causes:**
- Bad: "CPU utilization > 80%"
- Good: "API error rate > 1% for 5 minutes"

**Use severity levels appropriately:**
- **P0/Critical**: Immediate human intervention required
- **P1/High**: Response within 15 minutes
- **P2/Medium**: Response within 1 hour
- **P3/Low**: Response within 1 business day

### Step 5: Create Actionable Dashboards

**Tiered dashboard approach:**
1. **Executive Dashboard**: High-level business metrics
2. **Service Dashboard**: Service health and performance
3. **Component Dashboard**: Detailed infrastructure metrics
4. **Debug Dashboard**: Granular metrics for troubleshooting

**Dashboard design principles:**
- Group related metrics together
- Use consistent color coding
- Show trends, not just current values
- Include context (previous period, targets)
- Optimize for the most common use cases
</instructions>

<rules>
## Core Monitoring Rules

### The RED Method

For every service, monitor:

1. **Rate**: Requests per second
   - Total request rate
   - Request rate by endpoint
   - Request rate by status code
   - Request rate by user/customer

2. **Errors**: Failed requests
   - HTTP 5xx errors
   - HTTP 4xx errors (rate-limited)
   - Application errors (exceptions)
   - Business logic errors (validation failures)
   - Error rate as percentage of total requests

3. **Duration**: Request latency
   - p50 (median): Typical user experience
   - p95: 95% of users see this performance
   - p99: Worst-case experience
   - Max: Outliers and anomalies

### The USE Method

For every resource, monitor:

1. **Utilization**: Average resource usage
   - CPU utilization percentage
   - Memory usage percentage
   - Disk space used
   - Network bandwidth consumed

2. **Saturation**: How full the resource is
   - Queue depths
   - Connection pool usage
   - Buffer utilization
   - Thread pool occupancy

3. **Errors**: Error events
   - OOM kills
   - Connection timeouts
   - Disk I/O errors
   - Network errors

### The Four Golden Signals

1. **Latency**: Time to serve requests
   - Measure successful requests only
   - Track percentiles, not averages
   - Distinguish between fast and slow endpoints

2. **Traffic**: System demand
   - Requests per second
   - Concurrent connections
   - Data transfer rates
   - Queue depths

3. **Errors**: Rate of failed requests
   - Explicit failures (HTTP 500)
   - Implicit failures (timeouts)
   - Policy violations (rate limits)
   - Cascading failures

4. **Saturation**: How full the service is
   - Resource utilization trends
   - Load averages
   - Queue lengths
   - Pool exhaustion

### Alert SLO Rules

**Service Level Objectives (SLOs)** are formal targets:
- Define SLOs based on user requirements
- Alert when SLO is at risk, not just when violated
- Use error budgets to prioritize work
- Track SLO attainment over time

**Example SLO:**
```
Service: Checkout API
SLO: 99.9% of requests complete successfully in <300ms (p99)
Error Budget: 0.1% allowed failures
Alert: Alert when error budget burn rate > 2x for 10 minutes
```

### Actionable Alert Rules

**Every alert must:**
1. Require human intervention (automated responses don't need alerts)
2. Have a clear runbook or remediation steps
3. Indicate user impact or risk
4. Be actionable (not "investigate high CPU")
5. Have appropriate severity and routing

**Alert anatomy:**
```
Title: [Severity] Service impacted - brief description
Body:
  - What: User-facing symptom
  - Impact: Who is affected and how
  - Threshold: Current value vs. alert threshold
  - Duration: How long the condition has existed
  - Context: Related metrics, recent changes
  - Action: First steps for investigation
  - Runbook: Link to detailed procedures
```

**Anti-pattern alert examples:**
```
Bad: "CPU utilization > 80%"
Good: "API error rate > 1% for 5 minutes - checkout service degraded"

Bad: "Disk space low"
Good: "Database will run out of disk space in 4 hours - risk of data loss"
```
</rules>

<workflow>
## Monitoring Implementation Workflow

### Phase 1: Metric Design (Week 1)

**Activities:**
1. Identify critical user journeys
2. Map system architecture and dependencies
3. Define SLIs (Service Level Indicators)
4. Establish SLOs based on requirements
5. Determine data retention needs

**Deliverables:**
- Metric catalog with definitions
- SLI/SLO documentation
- Data retention policy
- Metric naming conventions

**Example metric catalog:**
```yaml
api_request_duration:
  type: histogram
  description: API request latency in milliseconds
  labels: [endpoint, method, status]
  unit: milliseconds
  aggregation: rate

api_request_total:
  type: counter
  description: Total API requests
  labels: [endpoint, method, status]
  unit: requests
  aggregation: sum

active_users:
  type: gauge
  description: Currently active users
  labels: [plan, region]
  unit: users
  aggregation: last
```

### Phase 2: Instrumentation (Weeks 2-3)

**Application instrumentation:**
1. Add client libraries (Prometheus, OpenTelemetry)
2. Instrument critical paths first
3. Add custom business metrics
4. Implement structured logging
5. Add distributed tracing

**Infrastructure instrumentation:**
1. Install exporters (node exporter, cAdvisor)
2. Configure service mesh metrics
3. Set up database monitoring
4. Configure load balancer metrics
5. Enable cloud provider metrics

**Code example (Prometheus Python client):**
```python
from prometheus_client import Counter, Histogram, Gauge

# Define metrics
request_counter = Counter(
    'api_requests_total',
    'Total API requests',
    ['endpoint', 'method', 'status']
)

request_duration = Histogram(
    'api_request_duration_seconds',
    'API request latency',
    ['endpoint', 'method'],
    buckets=[0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0]
)

active_connections = Gauge(
    'db_active_connections',
    'Active database connections'
)

# Instrument endpoint
@app.route('/api/orders')
def create_order():
    with request_duration.labels('/api/orders', 'POST').time():
        try:
            # Business logic
            request_counter.labels('/api/orders', 'POST', '200').inc()
            return jsonify(success=True)
        except Exception as e:
            request_counter.labels('/api/orders', 'POST', '500').inc()
            raise
```

### Phase 3: Dashboard Creation (Week 4)

**Dashboard tiers:**
1. **System Overview Dashboard**
   - Traffic overview (requests per second)
   - Error rates by service
   - Latency heat map
   - Resource utilization

2. **Service-Specific Dashboards**
   - Service health metrics
   - Dependency health
   - Business metrics
   - SLO attainment

3. **Operational Dashboards**
   - Recent deployments
   - Active incidents
   - Change history
   - Capacity metrics

**Grafana dashboard example:**
```json
{
  "title": "Checkout Service",
  "panels": [
    {
      "title": "Request Rate",
      "targets": [
        {
          "expr": "rate(api_requests_total{service=\"checkout\"}[5m])",
          "legendFormat": "{{method}} {{endpoint}}"
        }
      ]
    },
    {
      "title": "Error Rate",
      "targets": [
        {
          "expr": "rate(api_requests_total{service=\"checkout\",status=~\"5..\"}[5m]) / rate(api_requests_total{service=\"checkout\"}[5m])",
          "legendFormat": "Error Rate"
        }
      ]
    },
    {
      "title": "Latency (p95)",
      "targets": [
        {
          "expr": "histogram_quantile(0.95, rate(api_request_duration_seconds_bucket{service=\"checkout\"}[5m]))",
          "legendFormat": "{{endpoint}}"
        }
      ]
    }
  ]
}
```

### Phase 4: Alert Implementation (Week 5)

**Alert development process:**
1. Define alert conditions and thresholds
2. Determine appropriate severity levels
3. Write alert rules with proper documentation
4. Configure alert routing and escalation
5. Create and link runbooks
6. Test alert conditions

**Prometheus alert example:**
```yaml
groups:
  - name: api_alerts
    interval: 30s
    rules:
      - alert: HighErrorRate
        expr: |
          rate(api_requests_total{status=~"5.."}[5m])
          / rate(api_requests_total[5m]) > 0.01
        for: 5m
        labels:
          severity: critical
          service: checkout
        annotations:
          summary: "High error rate on checkout service"
          description: "Error rate is {{ $value | humanizePercentage }} for the last 5 minutes"
          impact: "Users cannot complete purchases"
          runbook: "https://docs.example.com/runbooks/high-error-rate"
          dashboard: "https://grafana.example.com/d/checkout"

      - alert: SLOBurnRate
        expr: |
          (1 - rate(api_requests_total{status!~"5.."}[5m]) / rate(api_requests_total[5m]))
          > (1 - 0.999) * 24
        for: 5m
        labels:
          severity: warning
          service: checkout
        annotations:
          summary: "SLO at risk - burning error budget too fast"
          description: "At current rate, SLO will be breached in {{ $value | humanizeDuration }}"
```

### Phase 5: Testing and Validation (Week 6)

**Testing activities:**
1. Load testing with monitoring validation
2. Fault injection (chaos engineering)
3. Alert firing tests
4. Runbook validation
5. On-call rotation practice
6. Post-incident review process

**Validation checklist:**
- [ ] All critical paths instrumented
- [ ] Alerts fire when thresholds exceeded
- [ ] Alerts route to correct team
- [ ] Dashboards load quickly
- [ ] Metrics have proper labels
- [ ] Runbooks are accurate
- [ ] On-call team trained

### Phase 6: Iteration and Improvement (Ongoing)

**Continuous improvement:**
1. Review alert efficacy weekly
2. Identify and eliminate noise
3. Add metrics for new features
4. Update runbooks based on incidents
5. Conduct blameless post-mortems
6. Gather feedback from on-call engineers

**Metrics to monitor the monitoring:**
- Alert frequency and severity distribution
- Mean time to acknowledge (MTTA)
- Mean time to resolve (MTTR)
- False positive rate
- Dashboard load times
- Query performance
</workflow>

<best_practices>
## SLIs and SLOs Best Practices

### SLI (Service Level Indicator) Design

**Good SLIs:**
- Directly measure user experience
- Clearly defined and measurable
- Reasonably easy to collect
- Understood by all stakeholders

**Common SLI types:**
```yaml
Availability:
  - Success rate: Successful requests / Total requests
  - Uptime: Time service was reachable / Total time
  - Durations: Uptime periods, downtime events

Latency:
  - Request duration: Time to complete request
  - Response time: Time to first byte
  - Processing time: Server-side processing

Quality:
  - Freshness: Data age (for APIs, caches)
  - Correctness: Data accuracy rate
  - Durability: Data loss rate

Throughput:
  - Requests per second
  - Transactions per minute
  - Operations per hour
```

### SLO (Service Level Objective) Targeting

**Setting SLO targets:**
1. Start with user requirements
2. Consider current performance
3. Account for improvement capacity
4. Balance ambition and achievability
5. Include error budget for flexibility

**Example SLOs:**
```
99.9% availability = 43.2 minutes downtime/month
99.99% availability = 4.32 minutes downtime/month
99.999% availability = 26 seconds downtime/month
```

### Error Budget Management

**Error budget calculation:**
```
Error Budget = (100% - SLO) × Period

Example:
SLO: 99.9%
Period: 30 days
Error Budget: 0.1% × 30 days = 43.2 minutes

If we have 20 minutes of downtime:
Budget consumed: 20 / 43.2 = 46%
Budget remaining: 54%
```

**Error budget policies:**
- **>50% remaining**: Feature releases allowed
- **10-50% remaining**: Feature freezes, stability focus
- **<10% remaining**: Emergency only, all hands on deck

### Structured Logging

**Log format standards:**
```json
{
  "timestamp": "2024-01-15T10:30:45.123Z",
  "level": "ERROR",
  "service": "checkout",
  "environment": "production",
  "instance": "checkout-7d8f9c6b5-k2m4p",
  "trace_id": "7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c",
  "span_id": "3a4b5c6d7e8f9a0b",
  "user_id": "user_12345",
  "request_id": "req_abc123",
  "event": "payment_failed",
  "message": "Payment processing failed",
  "context": {
    "payment_gateway": "stripe",
    "error_code": "card_declined",
    "amount": 99.99,
    "currency": "USD",
    "retry_attempt": 2
  },
  "stack_trace": "..."
}
```

**Logging best practices:**
- Use structured formats (JSON)
- Include correlation IDs
- Log at appropriate levels
- Avoid PII in logs
- Sanitize sensitive data
- Use consistent field names
- Include context, not just errors

### Distributed Tracing

**Trace context propagation:**
```python
# OpenTelemetry example
from opentelemetry import trace
from opentelemetry.trace.propagation.tracecontext import TraceContextTextMapPropagator

# Extract incoming trace context
carrier = {"traceparent": request.headers.get("traceparent")}
ctx = TraceContextTextMapPropagator().extract(carrier=carrier)

# Start span with parent context
tracer = trace.get_tracer(__name__)
with tracer.start_as_current_span("process_payment", context=ctx) as span:
    span.set_attribute("payment.amount", amount)
    span.set_attribute("payment.currency", "USD")
    # Business logic
```

**Span best practices:**
- Name spans after operations, not services
- Include key attributes (user ID, request ID)
- Record events and exceptions
- Measure span duration
- Propagate context downstream

### Metric Labeling

**Label design principles:**
```yaml
Good labels:
  endpoint: "/api/v1/orders"
  method: "POST"
  status: "200"
  customer_id: "customer_123"
  region: "us-west-2"

Bad labels (high cardinality):
  request_id: "req_abc123xyz"  # Unique per request
  user_email: "user@example.com"  # PII, high cardinality
  timestamp: "1642259845"  # Already in metric timestamp
```

**Cardinality management:**
- Keep label values bounded
- Use enumerations where possible
- Monitor label cardinality
- Aggregate high-cardinality dimensions
</best_practices>

<anti_patterns>
## Common Anti-Patterns

### Alert Fatigue

**Problem:** Too many alerts cause alert blindness
```
Symptoms:
- Alerts ignored or muted
- On-call burnout
- Increased MTTR
- Reduced trust in monitoring

Causes:
- Alerting on symptoms instead of user impact
- Thresholds too sensitive
- Missing hysteresis
- No differentiation between transient and persistent issues
- Missing deduplication
```

**Solutions:**
- Implement alert grouping and throttling
- Add duration requirements (alert only if condition persists)
- Use maintenance windows for known events
- Implement severity-based routing
- Regularly review and tune alerts
- Practice "no alerts" weeks to identify noise

### Missing Context

**Problem:** Alerts without actionable information
```
Bad alert:
"CPU utilization high on server-123"

Good alert:
"Checkout API degraded - error rate 2.5% (threshold: 1%)
  Impact: Users experiencing failed purchases
  Duration: 7 minutes
  Recent changes: Deploy v2.3.1 (15 min ago)
  Related: Database slow queries increased
  Action: Check recent deployment logs"
```

### Vanity Metrics

**Problem:** Metrics that look good but don't matter
```
Examples of vanity metrics:
- Total requests (without context of errors)
- Average latency (without percentiles)
- Server uptime (if not user-facing)
- Code coverage percentage
- Number of deployments

Focus on:
- Error rates
- Latency percentiles
- User-facing availability
- SLO attainment
- Business metrics (conversions, revenue)
```

### Over-Monitoring

**Problem:** Collecting too much data
```
Symptoms:
- Slow dashboard queries
- Expensive storage costs
- Information overload
- Difficult to find relevant metrics

Solutions:
- Start with critical user journeys
- Add metrics incrementally
- Implement data retention policies
- Use sampling for high-volume metrics
- Regular metric audits
```

### Under-Monitoring

**Problem:** Missing critical metrics
```
Common gaps:
- No monitoring for third-party dependencies
- Missing business metrics
- No database query monitoring
- No user experience tracking
- Missing dependency health checks

Solutions:
- Map all critical dependencies
- Monitor end-to-end transactions
- Include synthetic transactions
- Monitor external APIs
- Track business outcomes
```

### Misleading Metrics

**Problem:** Metrics that lie
```
Examples:
- Average latency (hides outliers) → Use percentiles
- Success rate (counts slow timeouts as success) → Track latency separately
- Uptime (service running but failing requests) → Monitor request success
- Queue length (without processing rate) → Add throughput metrics
- Error rate (without context of request volume) → Show absolute errors
```

### Alerting on Causes Instead of Symptoms

**Problem:** Infrastructure alerts don't reflect user impact
```
Bad approach:
Alert: "CPU > 80%"
- Might be expected during peak load
- Might not impact users
- Leads to investigation without user impact

Good approach:
Alert: "API latency p99 > 500ms"
- Direct user impact
- Actionable
- Correlate with CPU during investigation
```

### Missing SLOs

**Problem:** No formal reliability targets
```
Symptoms:
- Unclear reliability requirements
- Disagreement on priorities
- Reactive vs. proactive
- Difficulty prioritizing work

Solution:
Define SLOs for:
- Critical user journeys
- All key services
- External dependencies
- Data quality
```
</anti_patterns>

<examples>
## Practical Examples

### Prometheus Metrics Examples

**Counter examples:**
```python
from prometheus_client import Counter

# Request counter with labels
http_requests_total = Counter(
    'http_requests_total',
    'Total HTTP requests',
    ['method', 'endpoint', 'status']
)

# Business metrics
orders_total = Counter(
    'orders_total',
    'Total orders processed',
    ['status', 'payment_method']
)

# Database queries
db_queries_total = Counter(
    'db_queries_total',
    'Total database queries',
    ['operation', 'table']
)
```

**Histogram examples:**
```python
from prometheus_client import Histogram

# Request latency
request_duration = Histogram(
    'http_request_duration_seconds',
    'HTTP request latency',
    ['method', 'endpoint'],
    buckets=[0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0]
)

# Database query duration
db_query_duration = Histogram(
    'db_query_duration_seconds',
    'Database query latency',
    ['operation', 'table'],
    buckets=[0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0]
)
```

**Gauge examples:**
```python
from prometheus_client import Gauge

# Current connections
active_connections = Gauge(
    'db_active_connections',
    'Active database connections'
)

# Queue size
queue_size = Gauge(
    'job_queue_size',
    'Number of jobs in queue'
)

# Memory usage
memory_usage_bytes = Gauge(
    'process_memory_usage_bytes',
    'Process memory usage'
)
```

### Grafana Dashboard Examples

**Service health panel:**
```json
{
  "title": "Service Health",
  "type": "stat",
  "targets": [
    {
      "expr": "avg(rate(http_requests_total{job=\"api\"}[5m]))",
      "legendFormat": "Req/s"
    },
    {
      "expr": "sum(rate(http_requests_total{status=~\"5..\"}[5m])) / sum(rate(http_requests_total[5m]))",
      "legendFormat": "Error Rate"
    },
    {
      "expr": "histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))",
      "legendFormat": "p95 Latency"
    }
  ]
}
```

**SLI/SLO dashboard:**
```json
{
  "title": "SLO Attainment - Checkout",
  "panels": [
    {
      "title": "Error Budget Remaining",
      "targets": [
        {
          "expr": "1 - (sum(increase(http_requests_total{status=~\"5..\"}[30d])) / sum(increase(http_requests_total[30d]))) - 0.999",
          "legendFormat": "Error Budget Burned"
        }
      ]
    },
    {
      "title": "30-Day Availability",
      "targets": [
        {
          "expr": "sum(rate(http_requests_total{status!~\"5..\"}[30d])) / sum(rate(http_requests_total[30d]))",
          "legendFormat": "Availability"
        }
      ]
    }
  ]
}
```

### Alert Rules Examples

**High error rate alert:**
```yaml
- alert: HighErrorRate
  expr: |
    sum(rate(http_requests_total{status=~"5.."}[5m])) by (job)
    /
    sum(rate(http_requests_total[5m])) by (job)
    > 0.01
  for: 5m
  labels:
    severity: critical
  annotations:
    summary: "High error rate on {{ $labels.job }}"
    description: "Error rate is {{ $value | humanizePercentage }}"
    impact: "Users are experiencing failed requests"
    action: "Check application logs for errors"
```

**SLO burn rate alert:**
```yaml
- alert: SLOAtRisk
  expr: |
    (
      1 - (
        sum(rate(http_requests_total{status!~"5.."}[1h]))
        /
        sum(rate(http_requests_total[1h]))
      )
    )
    > (1 - 0.999) * 24
  for: 10m
  labels:
    severity: warning
  annotations:
    summary: "SLO at risk - burning error budget too fast"
    description: "At current rate, 30-day SLO will be breached"
```

**Latency alert:**
```yaml
- alert: HighLatency
  expr: |
    histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le, job))
    > 0.5
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: "High p95 latency on {{ $labels.job }}"
    description: "p95 latency is {{ $value }}s (threshold: 0.5s)"
    impact: "Users experiencing slow response times"
```

### Application Instrumentation Examples

**Express.js (Node.js) with Prometheus:**
```javascript
const promClient = require('prom-client');
const express = require('express');

const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request latency',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10]
});
register.registerMetric(httpRequestDuration);

const app = express();

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestDuration
      .labels(req.method, req.route?.path || req.path, res.statusCode)
      .observe(duration);
  });
  next();
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});
```

**Spring Boot (Java) with Micrometer:**
```java
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final MeterRegistry meterRegistry;
    private final Counter orderCounter;

    @Autowired
    public OrderController(MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;
        this.orderCounter = Counter.builder("orders.total")
            .description("Total orders processed")
            .tag("service", "checkout")
            .register(meterRegistry);
    }

    @PostMapping
    public ResponseEntity<Order> createOrder(@RequestBody Order order) {
        return Timer.Sample.start(meterRegistry)
            .stop(Timer.builder("order.duration")
                .tag("operation", "create")
                .register(meterRegistry))
            .record(() -> {
                Order result = orderService.create(order);
                orderCounter.increment();
                return ResponseEntity.ok(result);
            });
    }
}
```

### Synthetic Monitoring Examples

**User journey monitoring:**
```typescript
import { page } from '@playwright/test';

async function measureCheckoutFlow() {
  const startTime = Date.now();

  try {
    // Navigate to product
    await page.goto('/products/123');
    const productLoadTime = Date.now() - startTime;

    // Add to cart
    await page.click('[data-testid="add-to-cart"]');
    const addToCartTime = Date.now() - startTime - productLoadTime;

    // Checkout
    await page.click('[data-testid="checkout"]');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="card"]', '4242424242424242');
    await page.click('[data-testid="submit-payment"]');

    const checkoutTime = Date.now() - startTime - productLoadTime - addToCartTime;

    // Record metrics
    await page.evaluate(metrics => {
      fetch('/metrics/synthetic', {
        method: 'POST',
        body: JSON.stringify(metrics)
      });
    }, {
      check: 'checkout_flow',
      status: 'success',
      duration: Date.now() - startTime,
      steps: {
        product_load: productLoadTime,
        add_to_cart: addToCartTime,
        checkout: checkoutTime
      }
    });

  } catch (error) {
    // Record failure
    await page.evaluate(metrics => {
      fetch('/metrics/synthetic', {
        method: 'POST',
        body: JSON.stringify(metrics)
      });
    }, {
      check: 'checkout_flow',
      status: 'error',
      error: error.message
    });
  }
}
```
</examples>

<integration_notes>
## Platform Integration Guide

### Prometheus Stack

**Components:**
- Prometheus: Metrics collection and storage
- Grafana: Visualization and dashboards
- Alertmanager: Alert routing and management
- Node Exporter: Host metrics
- cAdvisor: Container metrics

**Configuration:**
```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'kubernetes-pods'
    kubernetes_sd_configs:
      - role: pod
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: true
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_path]
        action: replace
        target_label: __metrics_path__
        regex: (.+)

alerting:
  alertmanagers:
    - static_configs:
        - targets:
            - alertmanager:9093

rule_files:
  - '/etc/prometheus/rules/*.yml'
```

### Grafana Integration

**Data source configuration:**
```json
{
  "name": "Prometheus",
  "type": "prometheus",
  "url": "http://prometheus:9090",
  "access": "proxy",
  "editable": true,
  "jsonData": {
    "httpMethod": "POST",
    "timeInterval": "15s"
  }
}
```

**Dashboard provisioning:**
```yaml
# grafana/provisioning/dashboards/config.yml
apiVersion: 1

providers:
  - name: 'default'
    orgId: 1
    folder: ''
    type: file
    disableDeletion: false
    updateIntervalSeconds: 10
    allowUiUpdates: true
    options:
      path: /var/lib/grafana/dashboards
```

### DataDog Integration

**DogStatsD example:**
```python
from datadog import statsd

# Increment counter
statsd.increment('page.views')

# Timer
statsd.timing('database.query.time', 150)

# Gauge
statsd.gauge('active.users', 1024)

# Histogram
statsd.histogram('request.size', 1024)
```

**Custom metrics submission:**
```python
from datadog_api_client import DatadogClient
from datadog_api_client.v1.api.metrics_api import MetricsApi

client = DatadogClient()
metrics_api = MetricsApi(client)

metrics_api.submit_metric({
    "metric": "custom.orders_total",
    "points": [[int(time.time()), 42]],
    "type": "count",
    "tags": ["environment:production", "service:checkout"]
})
```

### New Relic Integration

**Custom events:**
```javascript
const newrelic = require('newrelic');

// Record custom event
newrelic.recordCustomEvent('CheckoutCompleted', {
  orderId: 'order_123',
  amount: 99.99,
  paymentMethod: 'stripe',
  userId: 'user_456'
});

// Record metric
newrelic.recordMetric('Custom/CheckoutDuration', 1234);
```

### OpenTelemetry Integration

**Tracing setup:**
```typescript
import { trace } from '@opentelemetry/api';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { registerInstrumentations } from '@opentelemetry/instrumentation';

const provider = new NodeTracerProvider({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'checkout-service',
  }),
});

provider.register();
```

**Metrics setup:**
```typescript
import { MeterProvider } from '@opentelemetry/sdk-metrics';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';

const exporter = new PrometheusExporter({ port: 9464 });
const meterProvider = new MeterProvider();
meterProvider.addMetricReader(exporter);

const meter = meterProvider.getMeter('checkout-service');
const requestCounter = meter.createCounter('requests_total');
```

### Kubernetes Integration

**ServiceMonitor for Prometheus Operator:**
```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: checkout-service
  labels:
    app: checkout
spec:
  selector:
    matchLabels:
      app: checkout
  endpoints:
  - port: http-metrics
    interval: 15s
    path: /metrics
```

**Pod annotations:**
```yaml
apiVersion: v1
kind: Pod
metadata:
  annotations:
    prometheus.io/scrape: "true"
    prometheus.io/port: "9090"
    prometheus.io/path: "/metrics"
spec:
  containers:
  - name: app
```

### Logging Integration

**ELK Stack (Elasticsearch, Logstash, Kibana):**
```json
{
  "query": {
    "bool": {
      "must": [
        { "match": { "service": "checkout" }},
        { "range": { "@timestamp": { "gte": "now-15m" }}},
        { "match": { "level": "ERROR" }}
      ]
    }
  },
  "aggs": {
    "errors_by_endpoint": {
      "terms": {
        "field": "endpoint.keyword"
      }
    }
  }
}
```

**Loki integration:**
```logql
{service="checkout", level="error"}
| json
| rate (> 5m)

# Calculate error rate
sum(count_over_time({service="checkout"} | json | status =~ "5.." [5m]))
/
sum(count_over_time({service="checkout"} | json [5m]))
```
</integration_notes>

<error_handling>
## Monitoring System Errors

### Metric Collection Failures

**Detection:**
```yaml
- alert: ScrapeFailure
  expr: up == 0
  for: 5m
  labels:
    severity: critical
  annotations:
    summary: "Metrics collection failed for {{ $labels.job }}"
    description: "Unable to scrape metrics for 5 minutes"
```

**Mitigation:**
- Implement scrape failure alerts
- Use push gateway for batch jobs
- Configure fallback collectors
- Monitor collector health
- Implement retry logic

### Alert Delivery Failures

**Symptoms:**
- Alerts not firing
- Alerts not routing correctly
- Duplicate alerts
- Delayed alerts

**Prevention:**
```yaml
# Alertmanager configuration
alertmanager:
  replicas: 3
  persistence:
    size: 10Gi

# Configure fallback routes
route:
  receiver: 'default'
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 12h
  routes:
    - match:
        severity: critical
      receiver: 'pagerduty'
      continue: true
    - match:
        severity: warning
      receiver: 'slack'
```

### High Cardinality Issues

**Detection:**
```yaml
- alert: HighMetricCardinality
  expr: |
    count({__name__=~".+"}) by (__name__) > 10000
  labels:
    severity: warning
  annotations:
    summary: "High cardinality detected for metric {{ $labels.__name__ }}"
```

**Solutions:**
- Remove high-cardinality labels
- Use aggregation
- Implement label whitelisting
- Use exemplars instead of labels
- Monitor metric count growth

### Monitoring Gaps

**Identification:**
```yaml
# Detect services without metrics
- alert: MissingMetrics
  expr: |
    absent(up{job="critical-service"})
  for: 10m
  labels:
    severity: warning
  annotations:
    summary: "No metrics received for {{ $labels.job }}"
```

**Prevention:**
- Maintain metric inventory
- Require metrics for all services
- Implement metric validation in CI/CD
- Regular metric audits
- Automated metric discovery

### Dashboard Performance Issues

**Symptoms:**
- Slow loading dashboards
- Timeout errors
- High query latency

**Solutions:**
```yaml
# Optimize query time ranges
# Bad: Querying 30 days of raw data
rate(http_requests_total[30d])

# Good: Use recording rules for long-term data
rate(http_requests_total:rate5m[30d])

# Recording rule
groups:
  - name: aggregation
    interval: 5m
    rules:
      - record: http_requests_total:rate5m
        expr: rate(http_requests_total[5m])
```

### False Positives

**Reduction strategies:**
- Add duration requirements
- Implement hysteresis
- Use predictive thresholds
- Group similar alerts
- Add cooldown periods
- Implement alert suppression windows

**Example with hysteresis:**
```yaml
groups:
  - name: alerts_with_hysteresis
    rules:
      # Alert fires when error rate > 1%
      - alert: HighErrorRate
        expr: error_rate > 0.01
        annotations:
          summary: "High error rate detected"

      # Alert clears only when error rate < 0.5%
      - alert: HighErrorRateCleared
        expr: error_rate < 0.005
        annotations:
          summary: "Error rate normalized"
```
</error_handling>

<output_format>
## Metric and Alert Output Formats

### Metric Line Format (Prometheus)

**Exposition format:**
```
# HELP http_requests_total Total HTTP requests
# TYPE http_requests_total counter
http_requests_total{method="POST",endpoint="/api/orders",status="200"} 12345
http_requests_total{method="POST",endpoint="/api/orders",status="500"} 23

# HELP http_request_duration_seconds HTTP request latency
# TYPE http_request_duration_seconds histogram
http_request_duration_seconds_bucket{method="POST",endpoint="/api/orders",le="0.005"} 100
http_request_duration_seconds_bucket{method="POST",endpoint="/api/orders",le="0.01"} 150
http_request_duration_seconds_bucket{method="POST",endpoint="/api/orders",le="+Inf"} 200
http_request_duration_seconds_sum{method="POST",endpoint="/api/orders"} 1.234
http_request_duration_seconds_count{method="POST",endpoint="/api/orders"} 200
```

### Alert Output Format

**Alertmanager webhook payload:**
```json
{
  "receiver": "pagerduty",
  "status": "firing",
  "alerts": [
    {
      "status": "firing",
      "labels": {
        "alertname": "HighErrorRate",
        "severity": "critical",
        "service": "checkout"
      },
      "annotations": {
        "summary": "High error rate on checkout service",
        "description": "Error rate is 2.5% (threshold: 1%)",
        "impact": "Users experiencing failed purchases",
        "action": "Check application logs for errors"
      },
      "startsAt": "2024-01-15T10:30:00Z",
      "endsAt": "0001-01-01T00:00:00Z",
      "generatorURL": "http://prometheus:9090/...",
      "fingerprint": "abc123"
    }
  ],
  "groupLabels": {
    "alertname": "HighErrorRate",
    "service": "checkout"
  },
  "commonLabels": {
    "alertname": "HighErrorRate",
    "severity": "critical",
    "service": "checkout"
  },
  "commonAnnotations": {
    "summary": "High error rate on checkout service"
  },
  "externalURL": "http://alertmanager:9093/..."
}
```

### SLI Report Format

**Daily SLO report:**
```yaml
service: checkout
period: 2024-01-15
slo_target: 99.9

metrics:
  requests_total: 1000000
  requests_successful: 998500
  requests_failed: 1500

availability:
  actual: 99.85%
  target: 99.9%
  error_budget_remaining: -50%
  status: breached

latency:
  p50: 45ms
  p95: 120ms
  p99: 250ms
  target: 300ms
  status: met

incidents:
  - id: INC-001
    start: 2024-01-15T10:00:00Z
    end: 2024-01-15T10:15:00Z
    duration: 15m
    impact: 1% error budget consumed
    root_cause: Database connection pool exhaustion
```

### Dashboard JSON Format

**Grafana dashboard export:**
```json
{
  "dashboard": {
    "id": null,
    "title": "Checkout Service",
    "tags": ["services", "checkout"],
    "timezone": "browser",
    "schemaVersion": 16,
    "version": 0,
    "refresh": "30s",
    "panels": [
      {
        "id": 1,
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total{service=\"checkout\"}[5m])",
            "legendFormat": "{{method}} {{endpoint}}"
          }
        ]
      }
    ]
  },
  "overwrite": true
}
```
</output_format>

<related_skills>
## Related Skills

### Complementary Skills

1. **kubernetes**: Container orchestration and cluster management
   - Deploy monitoring stack on Kubernetes
   - Configure ServiceMonitor resources
   - Set up pod and node monitoring

2. **logging**: Centralized logging and log analysis
   - Correlate logs with metrics
   - Structured logging patterns
   - Log aggregation and retention

3. **long-run-ops**: Long-running operational processes
   - Background job monitoring
   - Scheduled task tracking
   - Batch process metrics

4. **deployment-ops**: Deployment and release management
   - Deployment monitoring
   - Canary release metrics
   - Rollback triggers

### Integration Points

- **testing**: Load testing with monitoring validation
- **performance**: Performance baseline and regression detection
- **security**: Security event monitoring and alerting
- **cost-optimization**: Resource usage monitoring for cost management
</related_skills>

<see_also>
## Additional Resources

### Monitoring Best Practices

- **Google SRE Book**: Monitoring Distributed Systems
  - https://sre.google/sre-book/monitoring-distributed-systems/

- **Prometheus Best Practices**:
  - https://prometheus.io/docs/practices/

- **Grafana Dashboard Best Practices**:
  - https://grafana.com/docs/grafana/latest/best-practices/

### Observability Guides

- **The Three Pillars of Observability**:
  - https://www honeycomb.io/blog/observability-a-guide/

- **OpenTelemetry Documentation**:
  - https://opentelemetry.io/docs/

- **CNCF Observability Whitepaper**:
  - https://www.cncf.io/projects/

### Alerting Strategies

- **Alerting from First Principles**:
  - https://www.robustperception.io/alerting-from-first-principles/

- **Prometheus Alerting Guide**:
  - https://prometheus.io/docs/prometheus/latest/configuration/alerting_rules/

### SLO/SLI Resources

- **Google SRE Workbook**:
  - https://sre.google/workbook/table-of-contents/

- **SLI/SLO Implementation Guide**:
  - https://sre.google/sre-book/service-level-objectives/

### Tools and Platforms

- **Prometheus**: https://prometheus.io/
- **Grafana**: https://grafana.com/
- **DataDog**: https://www.datadoghq.com/
- **New Relic**: https://newrelic.com/
- **OpenTelemetry**: https://opentelemetry.io/
</see_also>
