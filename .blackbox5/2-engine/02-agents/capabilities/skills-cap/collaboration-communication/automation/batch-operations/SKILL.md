---
name: batch-operations
category: collaboration-communication/automation
version: 1.0.0
description: Batch processing workflows and patterns for handling bulk operations efficiently
author: blackbox5/core
verified: true
tags: [automation, batch, processing, bulk-operations]
---

# Batch Operations Skill

<context>
## Understanding Batch Processing

Batch processing is the execution of a series of jobs (programs) on a computer without manual intervention. Jobs are processed in groups (batches) rather than individually, which provides several advantages:

### Core Concepts

**Batch Job**: A collection of similar tasks that are processed together as a single unit
  - Typically large numbers of similar operations
  - Executed without user interaction
  - Often scheduled for off-peak hours
  - Results are collected and reported after completion

**Chunking**: Dividing large datasets into manageable pieces
  - Reduces memory footprint
  - Enables parallel processing
  - Provides natural checkpoint boundaries
  - Improves error isolation

**Idempotency**: Operations that can be applied multiple times with the same result
  - Critical for safe retry logic
  - Enables exactly-once processing semantics
  - Simplifies error recovery

**At-least-once vs Exactly-once**: Delivery guarantees
  - At-least-once: Messages may be duplicated but not lost (simpler, requires idempotency)
  - Exactly-once: Each message processed precisely once (complex, requires coordination)

### Common Use Cases

1. **Database Operations**
   - Bulk inserts/updates
   - Data migration
   - Batch reporting
   - Index rebuilds

2. **API Integrations**
   - Bulk data synchronization
   - Batch webhook processing
   - Rate-limited request handling
   - Third-party data imports

3. **File Processing**
   - Image/video transcoding
   - Document conversion
   - Log file analysis
   - Data extraction (ETL)

4. **Message Processing**
   - Email campaigns
   - Notification delivery
   - Event streaming
   - Queue draining

5. **Data Cleanup**
   - Archive/deletion jobs
   - Data retention enforcement
   - Duplicate resolution
   - Reconciliation tasks

### When to Use Batch Processing

✓ **Good for batch processing:**
  - Large volumes of similar operations
  - Non-interactive tasks
  - Fault-tolerant operations (can retry safely)
  - Time-insensitive processing (can queue/schedule)
  - Resource-intensive operations (can spread load)
  - Operations benefiting from transaction batching

✗ **Not suitable for:**
  - Real-time requirements (seconds matter)
  - User-interactive operations (need immediate feedback)
  - Small transaction counts (overhead not justified)
  - Highly dependent sequential operations
  - Operations requiring immediate rollback visibility
</context>

<instructions>
## Designing Batch Operations

### 1. Job Analysis Phase

**Characterize Your Batch Job:**
  - Total volume (record count, data size)
  - Per-record complexity (processing time, resource needs)
  - Error tolerance (can skip failed items, must be all-or-nothing)
  - Ordering requirements (must process in sequence, can be parallel)
  - Idempotency (can safely reprocess items)
  - Dependencies (external systems, rate limits, resources)

**Ask Critical Questions:**
  - What happens if 10 items fail? 50%? 95%?
  - Can partial results be committed, or must entire batch succeed?
  - How long is acceptable for job completion?
  - What monitoring/alerting is needed during execution?
  - How are jobs resumed after interruption?
  - What are the rollback/compensation strategies?

### 2. Architecture Decisions

**Processing Model:**
  - **Sequential**: Simple, predictable, lower resource usage
    - Use for: rate-limited APIs, ordered processing, simple logic
  - **Parallel**: Faster, higher throughput, more complexity
    - Use for: CPU-bound work, independent items, large datasets
  - **Hybrid**: Chunks processed in parallel, items sequential within chunks
    - Use for: most real-world scenarios, balances complexity and performance

**Execution Strategy:**
  - **Synchronous**: Job initiator waits for completion
    - Simpler integration, but blocks resources
    - Use for: fast jobs (seconds), immediate feedback needed
  - **Asynchronous**: Job runs in background, initiator polls or is notified
    - Better UX, scales better, more complex
    - Use for: long-running jobs, user-initiated batches
  - **Scheduled**: Jobs triggered by time/events
    - Use for: periodic cleanup, maintenance tasks, reporting

**State Management:**
  - In-memory (fast, lost on failure)
  - Database (persistent, queryable, can recover)
  - File system (simple, good for large intermediate data)
  - Job queue (built-in retry, distributed processing)
  - Cache layer (fast state, distributed lock support)

### 3. Data Preparation

**Input Validation:**
  - Validate entire dataset before starting (fail fast)
  - Or validate during processing (start faster, may fail mid-job)
  - Document validation rules clearly
  - Provide detailed error reports for invalid items

**Data Normalization:**
  - Convert to canonical format early
  - Handle timezone conversions explicitly
  - Normalize strings (trim, case, encoding)
  - Resolve foreign keys/references before processing

**Pre-computation:**
  - Fetch lookup data once, not per-item
  - Build reference caches
  - Pre-calculate derived values
  - Group items by processing characteristics

### 4. Processing Implementation

**Chunk Design:**
  - Size based on: memory limits, processing time per item, error tolerance
  - Typical ranges: 10-100 items for slow operations, 1000-10000 for fast
  - Make chunk size configurable (environment variable, config file)
  - Consider adaptive chunking (adjust based on performance)

**Progress Tracking:**
  - Track: total items, processed, succeeded, failed, skipped
  - Store checkpoints at chunk boundaries
  - Calculate and display: percentage complete, ETA, rate
  - Log meaningful milestones (25%, 50%, 75%, 100%)

**Error Boundaries:**
  - Failures should not exceed item/chunk scope
  - Isolate error handling per chunk or per item
  - Continue processing on non-critical errors
  - Collect all errors for end-of-job reporting

**Resource Management:**
  - Explicitly close connections/files (use finally blocks)
  - Limit concurrent operations (use semaphores/pools)
  - Monitor memory usage (force GC if needed)
  - Implement backpressure handling (pause if overloaded)

### 5. Monitoring and Completion

**Progress Visibility:**
  - Provide job status endpoint/dashboard
  - Stream progress logs to central system
  - Send notifications for start, milestones, completion
  - Support job cancellation with clean shutdown

**Completion Reporting:**
  - Summary metrics: total, succeeded, failed, duration, rate
  - Detailed error information: what failed, why, identifiers
  - Output artifacts: result files, logs, reports
  - Next steps: manual intervention needed, downstream jobs triggered

**Cleanup:**
  - Remove temporary files/data
  - Release locks/resources
  - Archive job records (don't delete immediately)
  - Clear caches if appropriate
</instructions>

<rules>
## Batch Processing Rules

### Chunking Rules

1. **Always chunk large datasets**
   - Never load entire dataset into memory
   - Chunks should be independently processable
   - Chunk boundaries should be checkpointable

2. **Chunk size optimization**
   - Target: 100-1000 items per chunk (adjust based on processing time)
   - Each chunk should complete in 1-60 seconds
   - Size should be divisible by total (for clean progress reporting)
   - Consider memory limits (chunk × item-size < available RAM)

3. **Chunk isolation**
   - Failures in one chunk should not affect others
   - Rollback should be scoped to chunk level
   - Chunks should not share mutable state

4. **Adaptive chunking**
   - Monitor processing time per chunk
   - Reduce chunk size if timeouts occur
   - Increase chunk size if processing is very fast
   - Log chunk size changes for analysis

### Error Handling Rules

1. **Never let single-item failures stop entire batch**
   - Catch exceptions at item level
   - Log errors with full context
   - Continue to next item
   - Report all failures at end

2. **Error collection**
   - Collect errors in memory (or database for large batches)
   - Include: item identifier, error message, stack trace, timestamp
   - Limit error storage (keep first N, sample if too many)
   - Provide error categorization (validation, system, external)

3. **Retry logic**
   - Retry only on transient errors (timeouts, rate limits, network)
   - Don't retry on validation errors or permanent failures
   - Use exponential backoff (100ms, 200ms, 400ms, 800ms...)
   - Limit retry attempts (3-5 is typical)
   - Log each retry attempt

4. **Failure thresholds**
   - Define acceptable failure rate (e.g., 5%)
   - Abort job if threshold exceeded
   - Alert on high failure rates
   - Require manual approval for high-impact jobs

### Progress Tracking Rules

1. **Always track progress**
   - Even for fast jobs (helps with debugging)
   - Use integers (not floating point) for item counts
   - Store state persistently for long-running jobs
   - Include timestamps for rate calculation

2. **Checkpoint at chunk boundaries**
   - Store last successfully processed chunk
   - Enable resume from last checkpoint
   - Include checksums for data integrity
   - Store checkpoint timestamp

3. **Progress granularity**
   - Update progress at least every 10 chunks
   - Update on completion of each chunk for long jobs
   - Log milestones (25%, 50%, 75%)
   - Include ETA based on recent rate

### Idempotency Rules

1. **Design idempotent operations**
   - Check if item already processed
   - Use upsert instead of insert
   - Include unique identifiers
   - Validate before applying changes

2. **Handle duplicate processing**
   - Detect duplicates before processing
   - Skip with log (don't fail)
   - Consider using idempotency keys
   - Store results in idempotent store

3. **Idempotency keys**
   - Generate per-job or per-chunk
   - Include in all downstream operations
   - Store in external systems (APIs, databases)
   - TTL based on job duration

### Resource Management Rules

1. **Connection pooling**
   - Reuse connections across items/chunks
   - Implement connection limits
   - Handle connection failures gracefully
   - Close connections in finally blocks

2. **Memory management**
   - Process items in streams (don't accumulate)
   - Clear references between chunks
   - Use generators/iterators instead of arrays
   - Monitor memory usage

3. **Rate limiting**
   - Respect external API limits
   - Implement throttling
   - Queue excess requests
   - Handle rate limit responses

4. **Locking**
   - Keep locks minimal scope
   - Use timeouts (don't deadlock)
   - Always release in finally blocks
   - Prefer optimistic locking
</rules>

<workflow>
## Batch Processing Workflow

### Phase 1: Job Design

**Input Specification:**
  - Define input schema (fields, types, validation)
  - Specify input source (database, file, API, queue)
  - Determine input volume and characteristics
  - Document input assumptions and constraints

**Output Specification:**
  - Define output schema
  - Specify output destination
  - Determine output format (file, records, notifications)
  - Document success/failure reporting requirements

**Resource Planning:**
  - Estimate memory requirements
  - Estimate processing time
  - Identify external dependencies
  - Plan for peak resource usage

### Phase 2: Job Preparation

```python
def prepare_batch_job(input_source, config):
    """
    Prepare batch job for processing
    """
    # 1. Load and validate input
    input_data = load_input(input_source)
    validate_input(input_data)

    # 2. Normalize data
    normalized_data = normalize_data(input_data)

    # 3. Calculate chunks
    total_items = len(normalized_data)
    chunk_size = determine_chunk_size(config, total_items)
    num_chunks = (total_items + chunk_size - 1) // chunk_size

    # 4. Initialize job state
    job_state = initialize_job_state({
        'total_items': total_items,
        'chunk_size': chunk_size,
        'num_chunks': num_chunks,
        'status': 'prepared',
        'started_at': None
    })

    return job_state, normalized_data
```

**Tasks:**
  - Load input data (or prepare to stream)
  - Validate data integrity and format
  - Normalize data to canonical form
  - Calculate optimal chunk size
  - Initialize job state tracking
  - Acquire necessary resources/locks
  - Prepare output destinations

### Phase 3: Job Execution

```python
def execute_batch_job(job_state, data, processor_func):
    """
    Execute batch job with chunking and error handling
    """
    job_state['status'] = 'running'
    job_state['started_at'] = datetime.utcnow()

    chunks = create_chunks(data, job_state['chunk_size'])
    results = {
        'processed': 0,
        'succeeded': 0,
        'failed': 0,
        'errors': []
    }

    for chunk_index, chunk in enumerate(chunks):
        try:
            # Process chunk with retries
            chunk_result = process_chunk_with_retry(
                chunk,
                processor_func,
                max_retries=3
            )

            # Update results
            results['processed'] += len(chunk)
            results['succeeded'] += chunk_result['succeeded']
            results['failed'] += chunk_result['failed']
            results['errors'].extend(chunk_result['errors'])

            # Checkpoint progress
            save_checkpoint(job_state['job_id'], chunk_index, results)

            # Log progress
            log_progress(chunk_index, len(chunks), results)

            # Check failure threshold
            if results['failed'] > job_state['total_items'] * 0.05:
                raise JobFailureException('Failure threshold exceeded')

        except Exception as e:
            # Handle chunk-level failures
            handle_chunk_failure(chunk_index, e)
            # Decide: continue or abort
            if is_critical_error(e):
                job_state['status'] = 'failed'
                raise

    job_state['status'] = 'completed'
    job_state['completed_at'] = datetime.utcnow()
    return results
```

**Processing Loop:**
  - Iterate through chunks
  - For each chunk:
    - Load chunk data
    - Process items (parallel or sequential)
    - Handle errors per item
    - Track results
    - Checkpoint progress
    - Update metrics
  - Between chunks:
    - Verify resource usage
    - Apply backpressure if needed
    - Log progress
    - Check for abort signals

### Phase 4: Monitoring and Control

**Progress Monitoring:**
  - Poll job state endpoint
  - Calculate completion percentage
  - Estimate remaining time
  - Detect stalled jobs

**Job Control:**
  - Pause job (graceful stop at chunk boundary)
  - Resume job (from last checkpoint)
  - Cancel job (terminate and rollback)
  - Modify job parameters (adjust chunk size)

**Health Checks:**
  - Verify external systems availability
  - Monitor resource usage
  - Check processing rate
  - Alert on anomalies

### Phase 5: Job Completion

**Finalization:**
  - Verify all chunks processed
  - Generate final reports
  - Cleanup temporary resources
  - Archive job state
  - Send notifications

**Result Handling:**
  - Commit results to final destination
  - Generate error reports
  - Create output artifacts
  - Update downstream systems

**Post-Processing:**
  - Trigger dependent jobs
  - Update statistics/analytics
  - Schedule next run (if periodic)
  - Retire old job records
</workflow>

<best_practices>
## Batch Processing Best Practices

### 1. Chunk Sizing

**Calculate optimal chunk size:**

```python
def calculate_chunk_size(
    total_items: int,
    avg_processing_time_ms: float,
    target_chunk_time_sec: float = 30.0,
    min_chunk_size: int = 10,
    max_chunk_size: int = 10000
) -> int:
    """
    Calculate optimal chunk size based on processing characteristics
    """
    # Target number of items per chunk based on time
    target_items = int((target_chunk_time_sec * 1000) / avg_processing_time_ms)

    # Apply constraints
    chunk_size = max(min_chunk_size, min(max_chunk_size, target_items))

    # Ensure clean division if possible
    if total_items < chunk_size * 10:
        # For smaller jobs, aim for 10-20 chunks
        chunk_size = max(min_chunk_size, total_items // 20)

    return chunk_size
```

**Adjust for characteristics:**
  - Fast operations (<10ms/item): 1000-10000 items
  - Medium operations (10-100ms/item): 100-1000 items
  - Slow operations (>100ms/item): 10-100 items
  - Very slow operations (>1s/item): 1-10 items
  - Variable operations: use smaller chunks for safety

### 2. Parallel Processing

**Parallel chunk processing:**

```python
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor
import multiprocessing

def process_chunks_parallel(chunks, processor_func, max_workers=None):
    """
    Process chunks in parallel using thread pool
    """
    if max_workers is None:
        max_workers = min(multiprocessing.cpu_count() * 2, 10)

    results = []

    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        future_to_chunk = {
            executor.submit(process_chunk, chunk, processor_func): i
            for i, chunk in enumerate(chunks)
        }

        for future in as_completed(future_to_chunk):
            chunk_index = future_to_chunk[future]
            try:
                result = future.result()
                results.append(result)
                log_progress(chunk_index, len(chunks), result)
            except Exception as e:
                handle_chunk_error(chunk_index, e)

    return results
```

**Parallel guidelines:**
  - Use threads for I/O-bound operations (APIs, databases)
  - Use processes for CPU-bound operations (image processing, encryption)
  - Limit workers to CPU count × 2 for threads
  - Limit workers to CPU count for processes
  - Always implement graceful shutdown

### 3. Checkpointing

**Checkpoint strategy:**

```python
def save_checkpoint(job_id: str, chunk_index: int, state: dict):
    """
    Save checkpoint for job recovery
    """
    checkpoint = {
        'job_id': job_id,
        'chunk_index': chunk_index,
        'timestamp': datetime.utcnow().isoformat(),
        'processed': state['processed'],
        'succeeded': state['succeeded'],
        'failed': state['failed'],
        'checksum': calculate_state_checksum(state)
    }

    # Store in persistent storage
    checkpoints_collection.update_one(
        {'job_id': job_id},
        {'$set': checkpoint},
        upsert=True
    )

def load_checkpoint(job_id: str) -> Optional[dict]:
    """
    Load checkpoint for job recovery
    """
    return checkpoints_collection.find_one({'job_id': job_id})

def resume_from_checkpoint(job_id: str, data, processor_func):
    """
    Resume job from last checkpoint
    """
    checkpoint = load_checkpoint(job_id)
    if not checkpoint:
        return execute_batch_job(job_id, data, processor_func)

    start_chunk = checkpoint['chunk_index'] + 1
    chunks = create_chunks(data, chunk_size)
    chunks = chunks[start_chunk:]

    return execute_batch_job(job_id, chunks, processor_func)
```

### 4. Retry Logic

**Exponential backoff retry:**

```python
import time
import random

def retry_with_backoff(func, max_retries=3, base_delay=0.1):
    """
    Retry function with exponential backoff
    """
    for attempt in range(max_retries):
        try:
            return func()
        except Exception as e:
            if attempt == max_retries - 1:
                raise

            # Calculate delay with jitter
            delay = base_delay * (2 ** attempt) + random.uniform(0, 0.1)
            time.sleep(delay)

    raise MaxRetriesExceededException()
```

### 5. Rate Limiting

**Token bucket rate limiter:**

```python
class RateLimiter:
    def __init__(self, rate: float, burst: int):
        self.rate = rate  # tokens per second
        self.burst = burst  # maximum burst
        self.tokens = burst
        self.last_time = time.time()

    def acquire(self, tokens=1):
        """
        Acquire tokens, blocking if necessary
        """
        while True:
            now = time.time()
            elapsed = now - self.last_time
            self.tokens = min(self.burst, self.tokens + elapsed * self.rate)
            self.last_time = now

            if self.tokens >= tokens:
                self.tokens -= tokens
                return

            # Wait for tokens
            wait_time = (tokens - self.tokens) / self.rate
            time.sleep(wait_time)
```

### 6. Error Aggregation

**Collect and report errors:**

```python
class ErrorAggregator:
    def __init__(self, max_errors=1000):
        self.max_errors = max_errors
        self.errors = []
        self.error_counts = {}

    def add_error(self, item_id, error):
        """
        Add error to collection
        """
        if len(self.errors) < self.max_errors:
            self.errors.append({
                'item_id': item_id,
                'error': str(error),
                'type': type(error).__name__,
                'timestamp': datetime.utcnow().isoformat()
            })

        error_type = type(error).__name__
        self.error_counts[error_type] = self.error_counts.get(error_type, 0) + 1

    def get_summary(self):
        """
        Get error summary
        """
        return {
            'total_errors': len(self.errors) + sum(
                c - 1 for c in self.error_counts.values()
            ),
            'sample_errors': self.errors[:100],
            'error_counts': self.error_counts
        }
```
</best_practices>

<anti_patterns>
## Batch Processing Anti-Patterns

### 1. Monolithic Batch

**Anti-Pattern:**
```python
# BAD: Load everything into memory
def process_all_items():
    items = load_all_items()  # Millions of records
    results = []

    for item in items:
        result = process(item)  # If this fails, all progress lost
        results.append(result)

    save_results(results)  # Only saves at very end
```

**Problems:**
  - Out of memory errors
  - No fault tolerance
  - No progress visibility
  - Can't resume after failure
  - Blocks resources for extended period

**Solution:**
```python
# GOOD: Process in chunks
def process_all_items():
    chunk_size = 1000
    for offset in range(0, total_items, chunk_size):
        chunk = load_chunk(offset, chunk_size)
        results = process_chunk(chunk)
        save_results(results)
        checkpoint(offset + chunk_size)
```

### 2. No Progress Tracking

**Anti-Pattern:**
```python
# BAD: No progress indication
def process_batch():
    for item in items:
        process(item)
    # No way to know how far along job is
```

**Problems:**
  - Can't detect stalled jobs
  - No ETA calculation
  - Difficult to debug
  - Poor user experience

**Solution:**
```python
# GOOD: Track and report progress
def process_batch():
    total = len(items)
    for i, item in enumerate(items):
        process(item)
        if i % 100 == 0:
            log_progress(i, total)
            update_job_status(i, total)
```

### 3. Poor Error Handling

**Anti-Pattern:**
```python
# BAD: Entire batch fails on single error
def process_batch():
    for item in items:
        process(item)  # If any item fails, exception stops batch
```

**Problems:**
  - One bad item ruins entire batch
  - No error details
  - Difficult to identify problematic items
  - Wastes successful processing

**Solution:**
```python
# GOOD: Isolate error handling
def process_batch():
    errors = []
    for item in items:
        try:
            process(item)
        except Exception as e:
            errors.append({'item': item, 'error': e})
            log_error(item, e)

    if errors:
        report_errors(errors)
```

### 4. Ignoring Rate Limits

**Anti-Pattern:**
```python
# BAD: Hammer external API
def sync_to_api(items):
    for item in items:
        api_call(item)  # Will hit rate limits quickly
```

**Problems:**
  - API throttling/blocking
  - Failed requests
  - Poor performance
  - Potential account suspension

**Solution:**
```python
# GOOD: Respect rate limits
def sync_to_api(items):
    rate_limiter = RateLimiter(rate=10, burst=50)
    for item in items:
        rate_limiter.acquire()
        api_call(item)
```

### 5. Not Closing Resources

**Anti-Pattern:**
```python
# BAD: Resources not released
def process_file():
    f = open('large_file.txt')
    for line in f:
        process(line)
    # File never closed
```

**Problems:**
  - Resource leaks
  - Connection exhaustion
  - File handles exhausted
  - Memory leaks

**Solution:**
```python
# GOOD: Explicit resource management
def process_file():
    with open('large_file.txt') as f:
        for line in f:
            process(line)
    # Automatically closed
```

### 6. Inefficient Queries

**Anti-Pattern:**
```python
# BAD: N+1 query problem
def update_users():
    users = db.query('SELECT * FROM users')
    for user in users:
        db.execute('UPDATE users SET status = ? WHERE id = ?',
                   (status, user.id))  # N queries
```

**Problems:**
  - Excessive database round-trips
  - Poor performance
  - Database overload
  - Network latency amplification

**Solution:**
```python
# GOOD: Batch updates
def update_users():
    users = db.query('SELECT * FROM users')
    db.execute_batch('UPDATE users SET status = ? WHERE id = ?',
                     [(status, u.id) for u in users])  # 1 query
```

### 7. Non-Idempotent Operations

**Anti-Pattern:**
```python
# BAD: Can't safely retry
def process_payment(amount):
    charge_account(amount)  # Charging twice on retry
```

**Problems:**
  - Can't retry failures
  - Duplicate charges
  - Data corruption
  - Difficult recovery

**Solution:**
```python
# GOOD: Idempotent operations
def process_payment(payment_id, amount):
    if payment_processed(payment_id):
        return  # Skip if already processed

    charge_account(amount)
    mark_payment_processed(payment_id)
```
</anti_patterns>

<examples>
## Batch Processing Examples

### Example 1: Database Batch Updates

**Scenario:** Update 1 million user records with new region codes

```python
import psycopg2
from psycopg2.extras import execute_batch

def batch_update_users(db_config, user_updates, chunk_size=1000):
    """
    Batch update users in database

    Args:
        db_config: Database connection config
        user_updates: List of (user_id, region_code) tuples
        chunk_size: Records per batch
    """
    conn = psycopg2.connect(**db_config)
    cursor = conn.cursor()

    try:
        # Create update statement
        update_stmt = """
            UPDATE users
            SET region_code = %s
            WHERE id = %s
        """

        # Process in chunks
        total = len(user_updates)
        for i in range(0, total, chunk_size):
            chunk = user_updates[i:i + chunk_size]

            # Execute batch update
            execute_batch(cursor, update_stmt, chunk)

            # Commit each chunk
            conn.commit()

            # Log progress
            progress = min(i + chunk_size, total)
            print(f"Progress: {progress}/{total} ({progress/total*100:.1f}%)")

        print(f"Completed: Updated {total} users")

    except Exception as e:
        conn.rollback()
        raise BatchProcessingException(f"Batch update failed: {e}")

    finally:
        cursor.close()
        conn.close()
```

### Example 2: API Batch Processing

**Scenario:** Sync 50,000 products to external API with rate limiting

```python
import time
import requests
from typing import List, Dict

class ProductSyncer:
    def __init__(self, api_key: str, rate_limit: int = 10):
        self.api_key = api_key
        self.rate_limiter = RateLimiter(rate=rate_limit, burst=50)
        self.session = requests.Session()
        self.session.headers.update({
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        })

    def sync_products(self, products: List[Dict], chunk_size: int = 100):
        """
        Sync products to external API

        Args:
            products: List of product dictionaries
            chunk_size: Products per batch
        """
        total = len(products)
        results = {
            'succeeded': 0,
            'failed': 0,
            'errors': []
        }

        for i in range(0, total, chunk_size):
            chunk = products[i:i + chunk_size]

            # Process chunk
            chunk_result = self._sync_chunk(chunk)
            results['succeeded'] += chunk_result['succeeded']
            results['failed'] += chunk_result['failed']
            results['errors'].extend(chunk_result['errors'])

            # Log progress
            progress = min(i + chunk_size, total)
            print(f"Progress: {progress}/{total}")

        return results

    def _sync_chunk(self, chunk: List[Dict]) -> Dict:
        """
        Sync a chunk of products
        """
        results = {'succeeded': 0, 'failed': 0, 'errors': []}

        for product in chunk:
            # Respect rate limits
            self.rate_limiter.acquire()

            # Sync product with retry
            try:
                self._sync_product_with_retry(product, max_retries=3)
                results['succeeded'] += 1
            except Exception as e:
                results['failed'] += 1
                results['errors'].append({
                    'product_id': product['id'],
                    'error': str(e)
                })

        return results

    def _sync_product_with_retry(self, product: Dict, max_retries: int = 3):
        """
        Sync single product with retry logic
        """
        for attempt in range(max_retries):
            try:
                response = self.session.post(
                    'https://api.example.com/products',
                    json=product,
                    timeout=30
                )
                response.raise_for_status()
                return response.json()

            except requests.exceptions.Timeout:
                if attempt < max_retries - 1:
                    time.sleep(2 ** attempt)  # Exponential backoff
                    continue
                raise

            except requests.exceptions.HTTPError as e:
                if e.response.status_code == 429:  # Rate limit
                    retry_after = int(e.response.headers.get('Retry-After', 1))
                    time.sleep(retry_after)
                    continue
                raise
```

### Example 3: File Batch Processing

**Scenario:** Process 10,000 CSV files and extract data

```python
import os
import csv
from concurrent.futures import ThreadPoolExecutor
from typing import List, Dict

class CSVProcessor:
    def __init__(self, input_dir: str, output_dir: str, max_workers: int = 4):
        self.input_dir = input_dir
        self.output_dir = output_dir
        self.max_workers = max_workers
        os.makedirs(output_dir, exist_ok=True)

    def process_all_files(self, pattern: str = '*.csv'):
        """
        Process all CSV files in directory
        """
        # Get list of files
        files = self._get_files(pattern)
        total = len(files)

        print(f"Found {total} files to process")

        # Process files in parallel
        results = {
            'processed': 0,
            'succeeded': 0,
            'failed': 0,
            'errors': []
        }

        with ThreadPoolExecutor(max_workers=self.max_workers) as executor:
            futures = {
                executor.submit(self._process_file, f): f
                for f in files
            }

            for future in futures:
                file_path = futures[future]
                try:
                    result = future.result(timeout=300)
                    results['succeeded'] += 1
                except Exception as e:
                    results['failed'] += 1
                    results['errors'].append({
                        'file': file_path,
                        'error': str(e)
                    })

                results['processed'] += 1

                # Log progress
                if results['processed'] % 100 == 0:
                    print(f"Progress: {results['processed']}/{total}")

        return results

    def _process_file(self, file_path: str) -> Dict:
        """
        Process single CSV file
        """
        # Extract data from CSV
        data = []
        with open(file_path, 'r') as f:
            reader = csv.DictReader(f)
            for row in reader:
                data.append(row)

        # Transform data
        transformed = self._transform_data(data)

        # Write output
        output_path = self._get_output_path(file_path)
        with open(output_path, 'w') as f:
            writer = csv.DictWriter(f, fieldnames=transformed[0].keys())
            writer.writeheader()
            writer.writerows(transformed)

        return {'input': file_path, 'output': output_path, 'rows': len(data)}
```

### Example 4: Message Queue Batch Processing

**Scenario:** Process messages from queue in batches

```python
import json
from typing import List, Callable

class MessageBatchProcessor:
    def __init__(self, queue_client, batch_size: int = 100, timeout: int = 30):
        self.queue_client = queue_client
        self.batch_size = batch_size
        self.timeout = timeout

    def process_messages(self, handler: Callable, max_messages: int = None):
        """
        Process messages in batches

        Args:
            handler: Function to process each message
            max_messages: Maximum messages to process (None = unlimited)
        """
        total_processed = 0
        batch_number = 0

        while True:
            # Check max messages limit
            if max_messages and total_processed >= max_messages:
                break

            # Receive batch of messages
            messages = self.queue_client.receive_messages(
                max_messages=self.batch_size,
                timeout=self.timeout
            )

            if not messages:
                print("No more messages")
                break

            batch_number += 1
            print(f"Processing batch {batch_number} ({len(messages)} messages)")

            # Process batch
            processed = self._process_batch(messages, handler)
            total_processed += processed

            # Delete processed messages
            for msg in messages:
                if msg.get('processed'):
                    self.queue_client.delete_message(msg['receipt_handle'])

        print(f"Total processed: {total_processed} messages")

    def _process_batch(self, messages: List[Dict], handler: Callable) -> int:
        """
        Process a batch of messages
        """
        processed = 0

        for message in messages:
            try:
                # Parse message body
                body = json.loads(message['body'])

                # Process message
                handler(body)

                # Mark as processed
                message['processed'] = True
                processed += 1

            except Exception as e:
                print(f"Error processing message: {e}")
                # Message will not be deleted, will be retried

        return processed
```
</examples>

<integration_notes>
## Integration with Other Systems

### Job Queues

**Recommended job queues for batch processing:**

1. **Bull (Node.js)**
   - Redis-backed job queue
   - Built-in retry logic
   - Job scheduling
   - Progress tracking
   - Concurrency control

2. **Celery (Python)**
   - Distributed task queue
   - Supports multiple brokers (RabbitMQ, Redis)
   - Task routing and priorities
   - Monitoring and management
   - Automatic retries

3. **Sidekiq (Ruby)**
   - Redis-backed
   - Middleware support
   - Reliable queueing
   - Web UI for monitoring
   - Batch job support

4. **AWS SQS**
   - Managed service
   - Auto-scaling
   - Dead letter queues
   - High throughput
   - Serverless

### Background Workers

**Worker patterns:**

1. **Process Pool**
   - Fork worker processes
   - Handle CPU-bound tasks
   - Automatic restart on failure
   - Resource isolation

2. **Thread Pool**
   - Handle I/O-bound tasks
   - Shared memory access
   - Lower overhead than processes

3. **Event Loop**
   - Asynchronous processing
   - High concurrency
   - Single-threaded
   - Non-blocking I/O

### Monitoring

**Monitoring tools:**

1. **Prometheus + Grafana**
   - Metrics collection
   - Custom dashboards
   - Alerting
   - Long-term storage

2. **DataDog**
   - APM integration
   - Custom metrics
   - Log correlation
   - Alerting

3. **Elastic Stack (ELK)**
   - Log aggregation
   - Search and analysis
   - Visualization
   - Alerting

### Databases

**Batch-friendly databases:**

1. **PostgreSQL**
   - COPY command for bulk inserts
   - Transaction support
   - Window functions
   - Foreign data wrappers

2. **MongoDB**
   - Bulk write operations
   - Document model
   - Aggregation framework
   - Change streams

3. **Redis**
   - Pipeline operations
   - Transactions
   - Pub/sub
   - Sorted sets for job queues
</integration_notes>

<error_handling>
## Comprehensive Error Handling

### Error Categories

**1. Transient Errors (Retryable)**
  - Network timeouts
  - Rate limiting (HTTP 429)
  - Temporary service unavailability (HTTP 503)
  - Connection failures
  - Lock contention

**Handling Strategy:**
  - Implement exponential backoff
  - Retry 3-5 times
  - Log retry attempts
  - Alert after final failure

**2. Permanent Errors (Non-Retryable)**
  - Validation failures
  - Authorization failures (HTTP 401, 403)
  - Not found (HTTP 404)
  - Business logic violations
  - Data integrity errors

**Handling Strategy:**
  - Do not retry
  - Log detailed error information
  - Move to dead letter queue
  - Alert for investigation

**3. Partial Failures**
  - Some items succeed, some fail
  - Chunk-level failures
  - Resource exhaustion mid-job

**Handling Strategy:**
  - Continue processing non-failed items
  - Track failure counts
  - Implement failure thresholds
  - Provide detailed error reports

### Error Recovery Strategies

**1. Checkpoint Recovery**
  - Resume from last successful chunk
  - Re-process failed chunks only
  - Maintain job state across restarts

**2. Compensation Transactions**
  - Reverse completed operations on failure
  - Implement saga pattern
  - Use idempotency keys
  - Document compensation logic

**3. Dead Letter Queue**
  - Route failed items for analysis
  - Enable manual replay
  - Preserve processing context
  - Separate by error type

### Error Reporting

**Error Response Format:**

```json
{
  "job_id": "batch-123",
  "status": "completed_with_errors",
  "summary": {
    "total_items": 10000,
    "succeeded": 9850,
    "failed": 150,
    "skipped": 0,
    "duration_seconds": 245,
    "failure_rate": 0.015
  },
  "errors": [
    {
      "item_id": "item-456",
      "error_type": "ValidationError",
      "error_message": "Invalid email format",
      "timestamp": "2025-01-18T10:30:00Z",
      "chunk_id": 4,
      "retry_count": 3
    }
  ],
  "error_categories": {
    "ValidationError": 120,
    "RateLimitError": 25,
    "NetworkError": 5
  },
  "remediation": {
    "can_retry": true,
    "retry_strategy": "failed_items_only",
    "manual_intervention_required": false
  }
}
```
</error_handling>

<output_format>
## Batch Job Output Format

**Standard batch job result structure:**

```typescript
interface BatchJobResult {
  // Job identification
  job_id: string;
  job_type: string;
  started_at: string;  // ISO 8601
  completed_at: string;  // ISO 8601

  // Status
  status: 'completed' | 'completed_with_errors' | 'failed' | 'cancelled';

  // Summary statistics
  summary: {
    total_items: number;
    processed: number;
    succeeded: number;
    failed: number;
    skipped: number;
    duration_seconds: number;
    items_per_second: number;
  };

  // Error details
  errors?: Array<{
    item_identifier: string;
    error_type: string;
    error_message: string;
    timestamp: string;
    chunk_index: number;
    retry_attempts: number;
  }>;

  // Error aggregation
  error_categories?: Record<string, number>;

  // Output artifacts
  artifacts?: {
    output_file?: string;
    error_report?: string;
    logs?: string;
  };

  // Checkpointing
  last_checkpoint?: {
    chunk_index: number;
    processed_count: number;
    timestamp: string;
  };

  // Metadata
  metadata?: {
    chunk_size: number;
    num_chunks: number;
    max_workers: number;
    retry_attempts: number;
  };
}
```
</output_format>

<related_skills>
- @.blackbox5/engine/agents/.skills-new/collaboration-communication/automation/task-automation/SKILL.md
- @.blackbox5/engine/agents/.skills-new/development-workflow/deployment-ops/long-run-ops/SKILL.md
- @.blackbox5/engine/agents/.skills-new/core-infrastructure/development-tools/using-git-worktrees/SKILL.md
</related_skills>

<see_also>
## Additional Resources

- **Design Patterns**: Enterprise Integration Patterns (Gregor Hohpe)
- **Batch Processing**: Spring Batch Documentation
- **Queue Theory**: Queueing Systems (Leonard Kleinrock)
- **Distributed Systems**: Designing Data-Intensive Applications (Martin Kleppmann)
- **Error Handling**: Release It! (Michael Nygard)
- **Monitoring**: Observability Engineering (Charity Majors)

## Implementation References

- Database bulk operations: PostgreSQL COPY, MongoDB Bulk Write
- Message queues: AWS SQS, RabbitMQ, Apache Kafka
- Job schedulers: Sidekiq, Celery, Bull
- Monitoring: Prometheus, DataDog, New Relic
</see_also>
