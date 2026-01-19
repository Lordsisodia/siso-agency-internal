---
name: sql-queries
category: integration-connectivity/database-operations
title: SQL Query Patterns and Best Practices
description: Comprehensive guide to SQL query patterns, best practices, optimization techniques, and common operations for efficient database interactions
version: 1.0.0
last_updated: 2026-01-18
tags: [sql, database, queries, optimization, joins, aggregation, indexing]
dependencies: []
related_skills: [mcp-integrations/supabase, mcp-integrations/postgresql]
---

<context>
SQL is the standard language for relational databases, and writing efficient, secure queries is essential for application performance. This skill provides comprehensive patterns for SQL queries, covering basic CRUD operations, complex joins, aggregations, subqueries, and optimization techniques. You'll learn to write queries that are fast, secure, and maintainable.

This skill covers:
- SELECT queries with filtering, sorting, and limiting
- JOIN operations (INNER, LEFT, RIGHT, FULL)
- Aggregation functions and GROUP BY
- Subqueries and Common Table Expressions (CTEs)
- Window functions for advanced analytics
- Query optimization and indexing
- Transaction management
- Parameterized queries for security
- Performance analysis

Whether you're building simple CRUD applications or complex analytics dashboards, these patterns will help you write efficient SQL queries.
</context>

<instructions>
When writing SQL queries:

1. **Always use parameterized queries**
   - Never concatenate strings for user input
   - Use prepared statements or parameter binding
   - Sanitize all user inputs
   - Prevent SQL injection attacks

2. **Select only needed columns**
   - Avoid SELECT * in production code
   - Specify only required columns
   - Reduces data transfer and improves performance
   - Makes queries self-documenting

3. **Use proper indexing**
   - Index columns used in WHERE clauses
   - Index join columns for better performance
   - Use composite indexes for multi-column queries
   - Monitor index usage and remove unused indexes

4. **Optimize JOIN operations**
   - Use appropriate JOIN type (INNER, LEFT, etc.)
   - Join on indexed columns
   - Filter before joining when possible
   - Be mindful of Cartesian products

5. **Use transactions for multi-step operations**
   - Wrap related operations in transactions
   - Handle errors and rollback appropriately
   - Keep transactions short
   - Avoid nested transactions

6. **Write readable queries**
   - Use consistent formatting and indentation
   - Use meaningful table and column aliases
   - Comment complex logic
   - Break long queries into CTEs

7. **Consider performance implications**
   - Use EXPLAIN ANALYZE to understand query plans
   - Add appropriate indexes
   - Avoid N+1 query problems
   - Use pagination for large result sets
</instructions>

<rules>
- NEVER use string concatenation for user input in queries
- MUST use parameterized queries or prepared statements
- ALWAYS use SELECT with explicit column names (avoid SELECT *)
- MUST index columns used in WHERE, JOIN, and ORDER BY clauses
- ALWAYS use transactions for multi-step operations
- NEVER use N+1 queries (use JOINs or batch operations)
- MUST handle SQL errors gracefully
- ALWAYS validate and sanitize user input
- NEVER expose raw SQL errors to end users
- MUST use appropriate JOIN types for the use case
- ALWAYS consider query performance with large datasets
- MUST use LIMIT/OFFSET or keyset pagination for large results
</rules>

<workflow>
1. **Understand the Requirements**
   - Identify the data you need to retrieve
   - Determine the relationships between tables
   - Consider performance requirements
   - Identify filtering and sorting needs

2. **Write the Query**
   - Start with basic SELECT statement
   - Add JOINs for related data
   - Add WHERE clauses for filtering
   - Add GROUP BY and aggregations if needed
   - Add ORDER BY and LIMIT

3. **Optimize the Query**
   - Check execution plan with EXPLAIN ANALYZE
   - Add missing indexes
   - Rewrite subqueries as JOINs if appropriate
   - Consider denormalization for complex queries

4. **Test the Query**
   - Test with sample data
   - Verify correct results
   - Check performance with realistic data volumes
   - Test edge cases

5. **Implement in Code**
   - Use parameterized queries
   - Add error handling
   - Add logging for slow queries
   - Document complex queries
</workflow>

<best_practices>
- Use CTEs (WITH clauses) for complex queries to improve readability
- Use EXISTS instead of IN when checking for existence (often faster)
- Use UNION ALL instead of UNION when you don't need deduplication
- Use COALESCE to handle NULL values
- Use proper data types (e.g., NUMERIC for money, not FLOAT)
- Use foreign keys for data integrity
- Use CHECK constraints for validation
- Normalize your database schema (3NF typically)
- Denormalize selectively for performance
- Use connection pooling for better performance
- Monitor slow query logs
- Use read replicas for read-heavy workloads
- Partition large tables
- Archive old data to improve performance
- Use materialized views for complex aggregations
- Consider using an ORM for simple CRUD, raw SQL for complex queries
</best_practices>

<anti_patterns>
- ❌ SELECT * (selects all columns, inefficient)
- ❌ String concatenation for user input (SQL injection risk)
- ❌ N+1 queries (executing query in loop)
- ❌ Missing indexes on JOIN/WHERE columns
- ❌ Using OR instead of IN for multiple values
- ❌ NOT IN with NULL values (unexpected behavior)
- ❌ Subqueries in SELECT clause (poor performance)
- ❌ Cursors when set operations would work
- ❌ Transactions that are too long (locks resources)
- ❌ Not handling NULL values properly
- ❌ Using ORDER BY on non-indexed columns
- ❌ Wildcard leading LIKE searches (e.g., '%term')
- ❌ Not using EXISTS for existence checks
- ❌ Computing the same value multiple times
- ❌ Not using connection pooling
</anti_patterns>

<examples>
Example 1: Basic CRUD Operations
```sql
-- CREATE TABLE
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(100),
    bio TEXT,
    avatar_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CREATE INDEX for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_created_at ON users(created_at);

-- INSERT (with parameterized query in application code)
INSERT INTO users (email, username, full_name, bio)
VALUES ($1, $2, $3, $4);
-- $1 = 'user@example.com', $2 = 'johndoe', $3 = 'John Doe', $4 = 'Software developer'

-- INSERT multiple rows
INSERT INTO users (email, username, full_name)
VALUES
    ('user1@example.com', 'user1', 'User One'),
    ('user2@example.com', 'user2', 'User Two'),
    ('user3@example.com', 'user3', 'User Three');

-- SELECT all columns (avoid in production)
SELECT * FROM users;

-- SELECT specific columns (preferred)
SELECT id, email, username, full_name
FROM users
WHERE id = $1;

-- SELECT with multiple conditions
SELECT id, email, username, full_name
FROM users
WHERE email = $1
  AND username = $2
  AND created_at >= $3;

-- UPDATE
UPDATE users
SET full_name = $1,
    bio = $2,
    updated_at = NOW()
WHERE id = $3;

-- UPDATE multiple columns
UPDATE users
SET
    full_name = 'John Smith',
    bio = 'Updated bio',
    updated_at = NOW()
WHERE id = 123;

-- UPDATE with condition
UPDATE users
SET email = 'newemail@example.com'
WHERE username = 'johndoe'
  AND email IS NULL;

-- DELETE
DELETE FROM users
WHERE id = $1;

-- DELETE with condition
DELETE FROM users
WHERE created_at < NOW() - INTERVAL '1 year'
  AND email_verified = false;
```

Example 2: JOIN Operations
```sql
-- Create related tables
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);

-- INNER JOIN (only matching rows)
SELECT
    p.id AS post_id,
    p.title,
    u.username AS author_username,
    u.email AS author_email
FROM posts p
INNER JOIN users u ON p.user_id = u.id
WHERE p.published = true
ORDER BY p.created_at DESC;

-- LEFT JOIN (all from left, matching from right)
SELECT
    p.id AS post_id,
    p.title,
    u.username AS author_username,
    COUNT(c.id) AS comment_count
FROM posts p
LEFT JOIN users u ON p.user_id = u.id
LEFT JOIN comments c ON p.id = c.post_id
WHERE p.published = true
GROUP BY p.id, p.title, u.username
ORDER BY p.created_at DESC;

-- Multiple JOINs
SELECT
    p.id AS post_id,
    p.title,
    p.content,
    u.username AS author_username,
    COUNT(DISTINCT c.id) AS comment_count,
    COUNT(DISTINCT l.id) AS like_count
FROM posts p
INNER JOIN users u ON p.user_id = u.id
LEFT JOIN comments c ON p.id = c.post_id
LEFT JOIN likes l ON p.id = l.post_id
WHERE p.published = true
GROUP BY p.id, p.title, p.content, u.username
ORDER BY p.created_at DESC
LIMIT 20;

-- Self JOIN (e.g., for user relationships)
CREATE TABLE user_relationships (
    id SERIAL PRIMARY KEY,
    follower_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    following_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(follower_id, following_id)
);

-- Find mutual followers
SELECT
    u1.username AS follower,
    u2.username AS following
FROM user_relationships ur1
INNER JOIN user_relationships ur2
    ON ur1.follower_id = ur2.following_id
    AND ur1.following_id = ur2.follower_id
INNER JOIN users u1 ON ur1.follower_id = u1.id
INNER JOIN users u2 ON ur1.following_id = u2.id;

-- CROSS JOIN (Cartesian product - use carefully)
SELECT
    u.username,
    c.name AS category_name
FROM users u
CROSS JOIN categories c;
```

Example 3: Aggregation and GROUP BY
```sql
-- Create orders table
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    total DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);

-- COUNT
SELECT COUNT(*) AS total_users
FROM users;

SELECT COUNT(email) AS users_with_email
FROM users;

-- COUNT DISTINCT
SELECT COUNT(DISTINCT user_id) AS unique_buyers
FROM orders;

-- SUM
SELECT
    user_id,
    SUM(total) AS total_spent
FROM orders
WHERE status = 'completed'
GROUP BY user_id;

-- AVG
SELECT
    AVG(total) AS average_order_value
FROM orders
WHERE status = 'completed';

-- MIN/MAX
SELECT
    MIN(total) AS min_order,
    MAX(total) AS max_order,
    MIN(created_at) AS first_order,
    MAX(created_at) AS last_order
FROM orders;

-- GROUP BY with multiple columns
SELECT
    DATE_TRUNC('month', created_at) AS month,
    status,
    COUNT(*) AS order_count,
    SUM(total) AS total_revenue,
    AVG(total) AS average_order
FROM orders
WHERE created_at >= NOW() - INTERVAL '1 year'
GROUP BY DATE_TRUNC('month', created_at), status
ORDER BY month DESC, status;

-- GROUP BY with HAVING (filter after aggregation)
SELECT
    u.username,
    COUNT(o.id) AS order_count,
    SUM(o.total) AS total_spent
FROM users u
INNER JOIN orders o ON u.id = o.user_id
WHERE o.status = 'completed'
GROUP BY u.id, u.username
HAVING COUNT(o.id) >= 5
    AND SUM(o.total) >= 1000
ORDER BY total_spent DESC;

-- Multiple aggregations
SELECT
    u.username,
    COUNT(o.id) AS total_orders,
    COUNT(CASE WHEN o.status = 'completed' THEN 1 END) AS completed_orders,
    COUNT(CASE WHEN o.status = 'pending' THEN 1 END) AS pending_orders,
    COUNT(CASE WHEN o.status = 'cancelled' THEN 1 END) AS cancelled_orders,
    SUM(CASE WHEN o.status = 'completed' THEN o.total ELSE 0 END) AS revenue
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.username
ORDER BY revenue DESC NULLS LAST;

-- Percentiles
SELECT
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY total) AS median,
    PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY total) AS percentile_95,
    PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY total) AS percentile_99
FROM orders
WHERE status = 'completed';
```

Example 4: Subqueries and CTEs
```sql
-- Subquery in WHERE clause
SELECT *
FROM posts
WHERE user_id IN (
    SELECT id
    FROM users
    WHERE email_verified = true
);

-- Subquery in SELECT clause (generally slower)
SELECT
    p.*,
    (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS comment_count
FROM posts p;

-- Rewrite with JOIN (better performance)
SELECT
    p.*,
    COUNT(c.id) AS comment_count
FROM posts p
LEFT JOIN comments c ON c.post_id = p.id
GROUP BY p.id, p.title, p.content, p.user_id, p.published, p.created_at;

-- CTE (Common Table Expression)
WITH user_stats AS (
    SELECT
        user_id,
        COUNT(*) AS total_posts,
        COUNT(CASE WHEN published = true THEN 1 END) AS published_posts
    FROM posts
    GROUP BY user_id
)
SELECT
    u.username,
    u.email,
    COALESCE(us.total_posts, 0) AS total_posts,
    COALESCE(us.published_posts, 0) AS published_posts
FROM users u
LEFT JOIN user_stats us ON u.id = us.user_id
ORDER BY total_posts DESC;

-- Multiple CTEs
WITH active_users AS (
    SELECT
        id,
        username
    FROM users
    WHERE last_login >= NOW() - INTERVAL '30 days'
),
user_posts AS (
    SELECT
        p.user_id,
        COUNT(*) AS post_count,
        MAX(p.created_at) AS last_post_date
    FROM posts p
    WHERE p.created_at >= NOW() - INTERVAL '30 days'
    GROUP BY p.user_id
)
SELECT
    au.username,
    COALESCE(up.post_count, 0) AS recent_posts
FROM active_users au
LEFT JOIN user_posts up ON au.id = up.user_id
ORDER BY recent_posts DESC;

-- EXISTS (efficient for existence checks)
SELECT
    u.username,
    u.email
FROM users u
WHERE EXISTS (
    SELECT 1
    FROM posts p
    WHERE p.user_id = u.id
    AND p.published = true
);

-- NOT EXISTS
SELECT
    u.username
FROM users u
WHERE NOT EXISTS (
    SELECT 1
    FROM posts p
    WHERE p.user_id = u.id
);
```

Example 5: Window Functions
```sql
-- ROW_NUMBER() - unique ranking
SELECT
    username,
    total_spent,
    ROW_NUMBER() OVER (ORDER BY total_spent DESC) AS rank
FROM (
    SELECT
        u.username,
        SUM(o.total) AS total_spent
    FROM users u
    INNER JOIN orders o ON u.id = o.user_id
    WHERE o.status = 'completed'
    GROUP BY u.id, u.username
) user_totals
ORDER BY total_spent DESC;

-- RANK() - same values get same rank, gaps in ranking
SELECT
    username,
    score,
    RANK() OVER (ORDER BY score DESC) AS rank
FROM leaderboard
ORDER BY score DESC;

-- DENSE_RANK() - same values get same rank, no gaps
SELECT
    username,
    score,
    DENSE_RANK() OVER (ORDER BY score DESC) AS dense_rank
FROM leaderboard
ORDER BY score DESC;

-- LAG/LEAD - access previous/next rows
SELECT
    DATE_TRUNC('day', created_at) AS date,
    COUNT(*) AS orders,
    LAG(COUNT(*)) OVER (ORDER BY DATE_TRUNC('day', created_at)) AS prev_day_orders,
    COUNT(*) - LAG(COUNT(*)) OVER (ORDER BY DATE_TRUNC('day', created_at)) AS daily_change
FROM orders
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date;

-- Running total
SELECT
    username,
    order_date,
    order_total,
    SUM(order_total) OVER (
        PARTITION BY username
        ORDER BY order_date
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS running_total
FROM (
    SELECT
        u.username,
        o.created_at::date AS order_date,
        o.total AS order_total
    FROM orders o
    INNER JOIN users u ON o.user_id = u.id
    WHERE o.status = 'completed'
) user_orders
ORDER BY username, order_date;

-- Moving average
SELECT
    DATE_TRUNC('day', created_at) AS date,
    COUNT(*) AS daily_orders,
    AVG(COUNT(*)) OVER (
        ORDER BY DATE_TRUNC('day', created_at)
        ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
    ) AS moving_average_7_days
FROM orders
WHERE created_at >= NOW() - INTERVAL '90 days'
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date;

-- Partition by multiple columns
SELECT
    u.username,
    p.title,
    c.created_at AS comment_date,
    ROW_NUMBER() OVER (
        PARTITION BY p.id
        ORDER BY c.created_at DESC
    ) AS comment_rank
FROM posts p
INNER JOIN comments c ON c.post_id = p.id
INNER JOIN users u ON c.user_id = u.id;
```

Example 6: Query Optimization
```sql
-- Before optimization (slow)
SELECT *
FROM orders
WHERE LOWER(customer_email) = 'user@example.com';

-- After optimization (fast - use functional index)
-- CREATE INDEX idx_orders_lower_email ON orders(LOWER(customer_email));
SELECT *
FROM orders
WHERE customer_email = 'user@example.com';

-- Before optimization (slow - function on column)
SELECT *
FROM events
WHERE DATE(created_at) = '2024-01-18';

-- After optimization (fast - range query)
SELECT *
FROM events
WHERE created_at >= '2024-01-18'
  AND created_at < '2024-01-19';

-- Before optimization (slow - leading wildcard)
SELECT *
FROM products
WHERE name LIKE '%laptop%';

-- After optimization (use full-text search)
-- CREATE INDEX idx_products_name_fts ON products USING gin(to_tsvector('english', name));
SELECT *
FROM products
WHERE to_tsvector('english', name) @@ to_tsquery('english', 'laptop');

-- Analyze query performance
EXPLAIN ANALYZE
SELECT
    u.username,
    COUNT(o.id) AS order_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.username
ORDER BY order_count DESC;

-- Create appropriate indexes based on query patterns
CREATE INDEX idx_orders_user_status_created ON orders(user_id, status, created_at);
CREATE INDEX idx_posts_published_created ON posts(published, created_at DESC);

-- Use covering index (include all needed columns)
CREATE INDEX idx_users_email_username_covering ON users(email, username)
    INCLUDE (id, full_name);

-- Partial index (index only specific rows)
CREATE INDEX idx_active_users_last_login
    ON users(last_login DESC)
    WHERE active = true;

-- Monitor index usage
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan ASC;

-- Find missing indexes
SELECT
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation
FROM pg_stats
WHERE schemaname = 'public'
ORDER BY n_distinct DESC;
```

Example 7: Pagination Techniques
```sql
-- OFFSET/LIMIT pagination (simple but slow for large offsets)
SELECT
    id,
    username,
    email,
    created_at
FROM users
ORDER BY created_at DESC
LIMIT 20 OFFSET 0; -- Page 1

SELECT
    id,
    username,
    email,
    created_at
FROM users
ORDER BY created_at DESC
LIMIT 20 OFFSET 20; -- Page 2

-- Keyset pagination (better for large datasets)
-- First page
SELECT
    id,
    username,
    email,
    created_at
FROM users
ORDER BY created_at DESC, id DESC
LIMIT 20;

-- Next page (use last record's created_at and id)
SELECT
    id,
    username,
    email,
    created_at
FROM users
WHERE created_at < '2024-01-18 10:00:00'
   OR (created_at = '2024-01-18 10:00:00' AND id < 12345)
ORDER BY created_at DESC, id DESC
LIMIT 20;

-- Cursor-based pagination (for infinite scroll)
SELECT
    id,
    username,
    email
FROM users
WHERE id > $1  -- cursor from last page
ORDER BY id
LIMIT 20;

-- Total count for pagination (can be slow)
SELECT COUNT(*) FROM users;

-- Faster alternative (approximate count from statistics)
SELECT reltuples::bigint AS estimate
FROM pg_class
WHERE relname = 'users';
```

Example 8: Transactions
```sql
-- Simple transaction
BEGIN;

INSERT INTO orders (user_id, total, status)
VALUES (123, 99.99, 'pending');

UPDATE inventory
SET quantity = quantity - 1
WHERE product_id = 456
  AND quantity >= 1;

-- Check if inventory was updated
IF NOT FOUND THEN
    ROLLBACK;
    RAISE EXCEPTION 'Insufficient inventory';
END IF;

COMMIT;

-- Transaction with error handling
DO $$
BEGIN
    BEGIN
        -- Perform operations
        INSERT INTO orders (user_id, total, status)
        VALUES (123, 99.99, 'pending');

        UPDATE inventory
        SET quantity = quantity - 1
        WHERE product_id = 456;

    EXCEPTION
        WHEN unique_violation THEN
            RAISE NOTICE 'Duplicate order, rolling back';
            ROLLBACK;
        WHEN others THEN
            RAISE NOTICE 'Error: %, rolling back', SQLERRM;
            ROLLBACK;
    END;
END $$;

-- Transaction with savepoints
BEGIN;

INSERT INTO orders (user_id, total, status)
VALUES (123, 99.99, 'pending');

SAVEPOINT order_created;

UPDATE inventory
SET quantity = quantity - 1
WHERE product_id = 456;

-- If inventory update fails, rollback to savepoint
-- ROLLBACK TO order_created;

COMMIT;

-- Transaction in application code (Python example)
try:
    cursor.execute("BEGIN")
    cursor.execute(
        "INSERT INTO orders (user_id, total, status) VALUES (%s, %s, %s)",
        (user_id, total, 'pending')
    )
    cursor.execute(
        "UPDATE inventory SET quantity = quantity - 1 WHERE product_id = %s",
        (product_id,)
    )
    cursor.execute("COMMIT")
except Exception as e:
    cursor.execute("ROLLBACK")
    raise e
```

Example 9: Parameterized Queries in Application Code

JavaScript/Node.js with pg:
```javascript
const { Pool } = require('pg');
const pool = new Pool();

// Bad: String concatenation (SQL injection risk)
const query = `SELECT * FROM users WHERE email = '${userEmail}'`;

// Good: Parameterized query
async function getUserByEmail(email) {
  const query = 'SELECT id, email, username FROM users WHERE email = $1';
  const result = await pool.query(query, [email]);
  return result.rows[0];
}

// Good: Multiple parameters
async function createOrder(userId, items) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const orderResult = await client.query(
      'INSERT INTO orders (user_id, total, status) VALUES ($1, $2, $3) RETURNING *',
      [userId, items.total, 'pending']
    );

    for (const item of items.products) {
      await client.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
        [orderResult.rows[0].id, item.productId, item.quantity, item.price]
      );
    }

    await client.query('COMMIT');
    return orderResult.rows[0];

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Good: Transaction helper
async function transaction(callback) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Usage
const order = await transaction(async (client) => {
  const orderResult = await client.query(
    'INSERT INTO orders (user_id, total, status) VALUES ($1, $2, $3) RETURNING *',
    [userId, total, 'pending']
  );

  await client.query(
    'UPDATE inventory SET quantity = quantity - 1 WHERE product_id = $1',
    [productId]
  );

  return orderResult.rows[0];
});
```

Python with psycopg2:
```python
import psycopg2
from contextlib import contextmanager

@contextmanager
def get_connection():
    conn = psycopg2.connect(
        dbname="mydb",
        user="user",
        password="password",
        host="localhost"
    )
    try:
        yield conn
    finally:
        conn.close()

# Good: Parameterized query
def get_user_by_email(email):
    with get_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute(
                "SELECT id, email, username FROM users WHERE email = %s",
                (email,)
            )
            return cursor.fetchone()

# Good: Transaction with error handling
def create_order(user_id, items):
    with get_connection() as conn:
        try:
            with conn.cursor() as cursor:
                cursor.execute("BEGIN")

                cursor.execute(
                    "INSERT INTO orders (user_id, total, status) VALUES (%s, %s, %s) RETURNING *",
                    (user_id, items['total'], 'pending')
                )
                order = cursor.fetchone()

                for item in items['products']:
                    cursor.execute(
                        "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (%s, %s, %s, %s)",
                        (order[0], item['product_id'], item['quantity'], item['price'])
                    )

                cursor.execute("COMMIT")
                return order

        except Exception as e:
            conn.rollback()
            raise e
```
</examples>

<integration_notes>
This skill integrates with:

- **mcp-integrations/supabase**: Supabase uses PostgreSQL
- **mcp-integrations/postgresql**: Direct PostgreSQL integration
- **rest-api**: Building API endpoints that query databases
- **linting-formatting**: SQL formatting standards

When to use this skill:
- Building database-backed applications
- Creating API endpoints with database queries
- Analyzing data with SQL
- Optimizing slow queries
- Writing database migrations

Common pitfalls:
- Not using parameterized queries (security risk)
- SELECT * in production (performance issue)
- Missing indexes on JOIN/WHERE columns
- N+1 query problems
- Not handling NULL values properly
</integration_notes>

<error_handling>
Common SQL errors and solutions:

**Syntax Errors**
- Unterminated string literal: Check quotes
- Missing comma: Review column lists
- Invalid identifier: Check table/column names

**Performance Issues**
- Slow query: Use EXPLAIN ANALYZE, add indexes
- Full table scan: Create appropriate indexes
- High memory usage: Use LIMIT, optimize JOINs

**Constraint Violations**
- Unique violation: Handle duplicate data gracefully
- Foreign key violation: Ensure referenced records exist
- Check constraint violation: Validate data before insert

**Connection Issues**
- Connection pool exhausted: Increase pool size or reduce concurrent queries
- Connection timeout: Increase timeout or optimize query
- Deadlock: Ensure consistent access order

Debugging tips:
1. Use EXPLAIN ANALYZE to understand query execution
2. Check pg_stat_statements for slow queries
3. Review query logs for problematic patterns
4. Test with EXPLAIN (without ANALYZE) to see the plan
5. Use database monitoring tools
</error_handling>

<output_format>
SQL queries should be formatted with:
- Uppercase keywords (SELECT, FROM, WHERE, etc.)
- Consistent indentation
- Table aliases for readability
- Comments for complex logic
- Proper line breaks for long queries

Example format:
```sql
SELECT
    u.id,
    u.username,
    u.email,
    COUNT(o.id) AS order_count
FROM users u
LEFT JOIN orders o
    ON u.id = o.user_id
    AND o.status = 'completed'
WHERE u.created_at >= $1
GROUP BY u.id, u.username, u.email
ORDER BY order_count DESC
LIMIT 100;
```
</output_format>

<related_skills>
- mcp-integrations/supabase: PostgreSQL in Supabase
- mcp-integrations/postgresql: Direct PostgreSQL integration
- rest-api: Building APIs with database backends
- systematic-debugging: Troubleshooting query issues
</related_skills>

<see_also>
- PostgreSQL Documentation: https://www.postgresql.org/docs/
- SQL Style Guide: https://www.sqlstyle.guide/
- EXPLAIN ANALYZE: https://www.postgresql.org/docs/current/sql-explain.html
- SQL Injection: https://owasp.org/www-community/attacks/SQL_Injection
- Database Indexing: https://use-the-index-luke.com/
</see_also>
