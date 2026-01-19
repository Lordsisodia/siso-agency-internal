---
name: sql-queries
category: integration-connectivity/database-operations
version: 1.0.0
description: SQL query patterns, optimization techniques, and best practices for efficient database operations
author: blackbox5/core
verified: true
tags: [sql, database, queries, optimization, postgresql]
---

# SQL Queries - Patterns and Best Practices

```xml
<skill>
  <metadata>
    <name>sql-queries</name>
    <category>integration-connectivity/database-operations</category>
    <difficulty>intermediate</difficulty>
    <estimated_time>2-3 hours</estimated_time>
    <prerequisites>
      <prerequisite>Basic SQL knowledge</prerequisite>
      <prerequisite>Understanding of relational databases</prerequisite>
      <prerequisite>PostgreSQL fundamentals</prerequisite>
    </prerequisites>
  </metadata>

  <context>
    <summary>
      SQL queries are the primary interface for interacting with relational databases.
      Well-structured queries are critical for application performance, data integrity,
      and scalability. Poor query patterns can lead to slow response times, excessive
      resource consumption, and database bottlenecks.
    </summary>

    <importance>
      <point>Performance: Efficient queries reduce load on database servers and improve response times</point>
      <point>Scalability: Good query patterns allow applications to handle growth without degradation</point>
      <point>Security: Proper query construction prevents SQL injection and data exposure</point>
      <point>Maintainability: Clean, readable queries are easier to debug and modify</point>
      <point>Resource Usage: Optimized queries consume less memory, CPU, and I/O</point>
    </importance>

    <scope>
      This skill covers PostgreSQL-specific query patterns, optimization techniques,
      indexing strategies, and best practices for production environments. It focuses
      on writing efficient, secure, and maintainable SQL queries.
    </scope>
  </context>

  <instructions>
    <section title="Query Design Fundamentals">
      <instruction>
        Always understand your data model before writing queries. Know your tables,
        relationships, indexes, and data distribution.
      </instruction>

      <instruction>
        Use EXPLAIN ANALYZE to understand query execution plans. Identify full table
        scans, nested loops, and sequential scans that could be optimized.
      </instruction>

      <instruction>
        Select only the columns you need. Avoid SELECT * in production code as it
        wastes bandwidth and memory.
      </instruction>

      <instruction>
        Use appropriate JOIN types (INNER, LEFT, RIGHT, FULL) based on your data
        requirements and relationships.
      </instruction>

      <instruction>
        Apply WHERE clauses to filter data early and reduce the working set before
        JOINs and aggregations.
      </instruction>
    </section>

    <section title="Indexing Strategy">
      <instruction>
        Create indexes on columns frequently used in WHERE, JOIN, and ORDER BY clauses.
      </instruction>

      <instruction>
        Use composite indexes for queries that filter on multiple columns.
        Consider column order in the index.
      </instruction>

      <instruction>
        Add unique indexes to enforce data integrity and improve lookup performance.
      </instruction>

      <instruction>
        Monitor index usage and remove unused indexes to reduce write overhead.
      </instruction>

      <instruction>
        Consider partial indexes for queries that only need a subset of data.
      </instruction>
    </section>

    <section title="Query Optimization">
      <instruction>
        Use CTEs (Common Table Expressions) for complex queries to improve readability
        and enable optimization opportunities.
      </instruction>

      <instruction>
        Prefer EXISTS over IN for subqueries when checking for existence, as it
        can stop scanning after finding the first match.
      </instruction>

      <instruction>
        Use window functions (ROW_NUMBER, RANK, LAG/LEAD) instead of self-joins
        for analytical queries.
      </instruction>

      <instruction>
        Implement pagination using LIMIT/OFFSET or keyset pagination for large result sets.
      </instruction>

      <instruction>
        Consider materialized views for expensive, frequently-run queries.
      </instruction>
    </section>
  </instructions>

  <rules>
    <category title="Performance Rules">
      <rule priority="critical" enforcement="automatic">
        Never use SELECT * in application code. Always specify required columns.
      </rule>

      <rule priority="high" enforcement="manual">
        All queries must be tested with EXPLAIN ANALYZE before deployment to production.
      </rule>

      <rule priority="high" enforcement="automatic">
        Queries must use appropriate indexes. Full table scans are not acceptable for
        frequently-accessed tables.
      </rule>

      <rule priority="medium" enforcement="manual">
        Limit result sets with appropriate WHERE clauses or pagination. Queries
        returning more than 10,000 rows require justification.
      </rule>

      <rule priority="medium" enforcement="manual">
        Use prepared statements for repeated queries with different parameter values.
      </rule>
    </category>

    <category title="Security Rules">
      <rule priority="critical" enforcement="automatic">
        Never concatenate user input into SQL strings. Always use parameterized queries
        or prepared statements to prevent SQL injection.
      </rule>

      <rule priority="high" enforcement="automatic">
        Apply principle of least privilege. Database users should only have permissions
        required for their function.
      </rule>

      <rule priority="high" enforcement="manual">
        Sanitize and validate all user input before using in queries, even with
        parameterized queries.
      </rule>

      <rule priority="medium" enforcement="manual">
        Avoid exposing detailed database errors to end users. Log errors server-side
        and show generic messages to users.
      </rule>
    </category>

    <category title="Consistency Rules">
      <rule priority="medium" enforcement="manual">
        Use consistent naming conventions for tables, columns, and aliases.
        Prefer snake_case for identifiers.
      </rule>

      <rule priority="medium" enforcement="manual">
        Format queries consistently with proper indentation and line breaks for
        readability.
      </rule>

      <rule priority="low" enforcement="manual">
        Add comments to complex queries explaining the business logic and any
        non-obvious optimizations.
      </rule>

      <rule priority="low" enforcement="manual">
        Use schema-qualified table names (e.g., public.users) in stored procedures
        and functions to avoid ambiguity.
      </rule>
    </category>
  </rules>

  <workflow>
    <phase name="Query Design">
      <steps>
        <step>Understand the data requirements and desired output</step>
        <step>Identify relevant tables and relationships</step>
        <step>Determine appropriate JOIN types and conditions</step>
        <step>Write initial query with proper filtering and sorting</step>
        <step>Review query for potential optimization opportunities</step>
      </steps>
      <deliverables>Initial SQL query with comments explaining logic</deliverables>
    </phase>

    <phase name="Indexing Strategy">
      <steps>
        <step>Identify columns used in WHERE, JOIN, and ORDER BY clauses</step>
        <step>Review existing indexes on relevant tables</step>
        <step>Determine if new indexes are needed</step>
        <step>Create appropriate indexes (single-column, composite, or partial)</step>
        <step>Test query performance with indexes</step>
      </steps>
      <deliverables>Index creation scripts, performance comparison</deliverables>
    </phase>

    <phase name="Testing and Validation">
      <steps>
        <step>Run EXPLAIN ANALYZE on the query</step>
        <step>Review execution plan for bottlenecks</step>
        <step>Test with realistic data volumes</step>
        <step>Verify query returns expected results</step>
        <step>Check for edge cases and null handling</step>
      </steps>
      <deliverables>Execution plan analysis, test results</deliverables>
    </phase>

    <phase name="Optimization">
      <steps>
        <step>Refactor query based on EXPLAIN ANALYZE findings</step>
        <step>Consider alternative approaches (CTEs, subqueries, window functions)</step>
        <step>Add or modify indexes as needed</step>
        <step>Re-test performance after optimizations</step>
        <step>Document optimizations and their impact</step>
      </steps>
      <deliverables>Optimized query, performance metrics</deliverables>
    </phase>

    <phase name="Production Deployment">
      <steps>
        <step>Create database migration for indexes and schema changes</step>
        <step>Deploy indexes during low-traffic periods</step>
        <step>Monitor query performance in production</step>
        <step>Set up alerts for performance degradation</step>
        <step>Document query patterns for team reference</step>
      </steps>
      <deliverables>Migration scripts, monitoring setup, documentation</deliverables>
    </phase>
  </workflow>

  <best_practices>
    <category title="JOIN Strategies">
      <practice>
        <title>Use INNER JOIN for required relationships</title>
        <description>
          When you only need records that have matching data in both tables,
          use INNER JOIN. This is typically the most efficient join type.
        </description>
        <example>
          SELECT u.name, o.order_date
          FROM users u
          INNER JOIN orders o ON u.id = o.user_id
          WHERE o.status = 'completed';
        </example>
      </practice>

      <practice>
        <title>Use LEFT JOIN for optional relationships</title>
        <description>
          When you need all records from the left table regardless of whether
          they have matches in the right table, use LEFT JOIN.
        </description>
        <example>
          SELECT u.name, p.phone_number
          FROM users u
          LEFT JOIN user_phones p ON u.id = p.user_id;
        </example>
      </practice>

      <practice>
        <title>Join in the most selective order</title>
        <description>
          Start with the most restrictive table to reduce the working set early.
          Apply WHERE clauses before JOINs when possible.
        </description>
      </practice>
    </category>

    <category title="Subqueries vs CTEs">
      <practice>
        <title>Use CTEs for readability and debugging</title>
        <description>
          Common Table Expressions improve query readability and make debugging easier.
          They also allow the query planner to optimize better than correlated subqueries.
        </description>
        <example>
          WITH user_orders AS (
            SELECT user_id, COUNT(*) as order_count, SUM(total) as total_spent
            FROM orders
            WHERE created_at >= '2024-01-01'
            GROUP BY user_id
          )
          SELECT u.name, uo.order_count, uo.total_spent
          FROM users u
          INNER JOIN user_orders uo ON u.id = uo.user_id
          WHERE uo.order_count > 5;
        </example>
      </practice>

      <practice>
        <title>Use EXISTS for existence checks</title>
        <description>
          EXISTS is generally faster than IN for subqueries because it stops
          scanning after finding the first match.
        </description>
        <example>
          -- Good: Uses EXISTS
          SELECT name
          FROM users u
          WHERE EXISTS (
            SELECT 1 FROM orders o
            WHERE o.user_id = u.id AND o.status = 'pending'
          );

          -- Avoid: Uses IN (slower for large datasets)
          SELECT name
          FROM users u
          WHERE u.id IN (
            SELECT user_id FROM orders WHERE status = 'pending'
          );
        </example>
      </practice>
    </category>

    <category title="Parameterized Queries">
      <practice>
        <title>Always use parameterized queries</title>
        <description>
          Parameterized queries prevent SQL injection and improve performance
          through query plan caching.
        </description>
        <example>
          -- PostgreSQL prepared statement
          PREPARE get_user_orders (INT, TEXT) AS
          SELECT o.id, o.order_date, o.total
          FROM orders o
          WHERE o.user_id = $1 AND o.status = $2
          ORDER BY o.order_date DESC;

          EXECUTE get_user_orders(123, 'completed');
        </example>
      </practice>

      <practice>
        <title>Use proper data types in parameters</title>
        <description>
          Ensure parameter types match column types to avoid implicit type
          conversions that can prevent index usage.
        </description>
      </practice>
    </category>

    <category title="Aggregation and Grouping">
      <practice>
        <title>Filter before aggregating</title>
        <description>
          Apply WHERE clauses before GROUP BY to reduce the dataset being aggregated.
          Use HAVING only for filtering on aggregate results.
        </description>
        <example>
          SELECT
            u.name,
            COUNT(o.id) as order_count,
            SUM(o.total) as total_spent
          FROM users u
          INNER JOIN orders o ON u.id = o.user_id
          WHERE o.created_at >= '2024-01-01'
          GROUP BY u.id, u.name
          HAVING COUNT(o.id) > 5
          ORDER BY total_spent DESC;
        </example>
      </practice>

      <practice>
        <title>Use appropriate aggregate functions</title>
        <description>
          Choose the right aggregate function for your needs: COUNT for counting,
          SUM for totals, AVG for averages, and array_agg for grouping values.
        </description>
      </practice>
    </category>

    <category title="Pagination">
      <practice>
        <title>Use LIMIT/OFFSET for simple pagination</title>
        <description>
          For small to medium datasets, LIMIT/OFFSET provides simple pagination.
          Be aware that OFFSET still scans skipped rows.
        </description>
        <example>
          SELECT id, name, email
          FROM users
          WHERE active = true
          ORDER BY created_at DESC
          LIMIT 20 OFFSET 0;
        </example>
      </practice>

      <practice>
        <title>Use keyset pagination for large datasets</title>
        <description>
          For better performance on large datasets, use WHERE clauses with indexed
          columns instead of OFFSET.
        </description>
        <example>
          -- First page
          SELECT id, name, created_at
          FROM users
          WHERE active = true
          ORDER BY created_at DESC, id
          LIMIT 20;

          -- Next page (use last row's values)
          SELECT id, name, created_at
          FROM users
          WHERE active = true
            AND (created_at < $1 OR (created_at = $1 AND id < $2))
          ORDER BY created_at DESC, id
          LIMIT 20;
        </example>
      </practice>
    </category>
  </best_practices>

  <anti_patterns>
    <anti_pattern>
      <title>N+1 Query Problem</title>
      <description>
        Executing a separate query for each row in a result set, leading to
        performance degradation as data grows.
      </description>
      <example>
        -- Bad: N+1 queries
        -- First query gets users
        SELECT * FROM users;

        -- Then N queries to get orders for each user
        SELECT * FROM orders WHERE user_id = 1;
        SELECT * FROM orders WHERE user_id = 2;
        -- ... and so on

        -- Good: Single query with JOIN
        SELECT u.*, o.id as order_id, o.order_date, o.total
        FROM users u
        LEFT JOIN orders o ON u.id = o.user_id
        ORDER BY u.id, o.order_date;
      </example>
      <solution>Use JOINs or include related data in a single query</solution>
    </anti_pattern>

    <anti_pattern>
      <title>SELECT * in Production</title>
      <description>
        Selecting all columns wastes bandwidth, memory, and can break applications
        when schema changes.
      </description>
      <example>
        -- Bad: Selects all columns
        SELECT * FROM users WHERE active = true;

        -- Good: Selects only needed columns
        SELECT id, name, email FROM users WHERE active = true;
      </example>
      <solution>Always specify required columns explicitly</solution>
    </anti_pattern>

    <anti_pattern>
      <title>Missing Indexes</title>
      <description>
        Queries on columns without indexes cause full table scans, which are
        extremely slow on large tables.
      </description>
      <example>
        -- Without index on email: Full table scan
        SELECT * FROM users WHERE email = 'user@example.com';

        -- After creating index: Index seek (fast)
        CREATE INDEX idx_users_email ON users(email);
      </example>
      <solution>Create indexes on frequently-filtered columns</solution>
    </anti_pattern>

    <anti_pattern>
      <title>Functions in WHERE Clauses</title>
      <description>
        Using functions on indexed columns in WHERE clauses prevents index usage
        because the function must be evaluated for every row.
      </description>
      <example>
        -- Bad: Function on indexed column prevents index usage
        SELECT * FROM users
        WHERE LOWER(email) = 'user@example.com';

        -- Good: Store data in proper format or use functional index
        SELECT * FROM users
        WHERE email = 'user@example.com';

        -- Or create functional index
        CREATE INDEX idx_users_email_lower ON users(LOWER(email));
      </example>
      <solution>Avoid functions on indexed columns or use functional indexes</solution>
    </anti_pattern>

    <anti_pattern>
      <title>ORDER BY on Unindexed Columns</title>
      <description>
        Sorting large result sets on unindexed columns requires expensive sort
        operations and can cause memory issues.
      </description>
      <example>
        -- Bad: Sort on unindexed column
        SELECT * FROM orders ORDER BY customer_name;

        -- Good: Create index or sort on indexed column
        CREATE INDEX idx_orders_customer_name ON orders(customer_name);
      </example>
      <solution>Create indexes on columns used for sorting</solution>
    </anti_pattern>

    <anti_pattern>
      <title>Wildcards at Start of LIKE Patterns</title>
      <description>
        Leading wildcards in LIKE patterns prevent index usage and require
        full table scans.
      </description>
      <example>
        -- Bad: Leading wildcard prevents index usage
        SELECT * FROM products WHERE name LIKE '%widget%';

        -- Good: Trailing wildcard can use index
        SELECT * FROM products WHERE name LIKE 'widget%';

        -- Alternative: Use full-text search
        SELECT * FROM products
        WHERE to_tsvector(name) @@ to_tsquery('widget');
      </example>
      <solution>Use trailing wildcards or full-text search</solution>
    </anti_pattern>

    <anti_pattern>
      <title>OR Conditions on Different Columns</title>
      <description>
        OR conditions on different columns can prevent efficient index usage
        and lead to suboptimal query plans.
      </description>
      <example>
        -- Bad: OR on different columns
        SELECT * FROM orders
        WHERE status = 'pending' OR priority = 'high';

        -- Good: Use UNION or IN
        SELECT * FROM orders WHERE status = 'pending'
        UNION
        SELECT * FROM orders WHERE priority = 'high';

        -- Or use IN when appropriate
        SELECT * FROM orders
        WHERE status IN ('pending', 'high_priority');
      </example>
      <solution>Use UNION, IN, or composite indexes</solution>
    </anti_pattern>
  </anti_patterns>

  <examples>
    <example title="Complex JOIN with Aggregation">
      <description>
        Query to find top customers by total spending, including their order
        counts and average order values, using multiple JOINs and aggregations.
      </description>
      <code>
        WITH customer_stats AS (
          SELECT
            u.id as user_id,
            u.name,
            u.email,
            COUNT(DISTINCT o.id) as total_orders,
            COUNT(DISTINCT oi.id) as total_items,
            SUM(o.total_amount) as total_spent,
            AVG(o.total_amount) as avg_order_value,
            MIN(o.created_at) as first_order,
            MAX(o.created_at) as last_order
          FROM users u
          INNER JOIN orders o ON u.id = o.user_id
          INNER JOIN order_items oi ON o.id = oi.order_id
          WHERE o.status IN ('completed', 'delivered')
            AND o.created_at >= CURRENT_DATE - INTERVAL '1 year'
          GROUP BY u.id, u.name, u.email
        )
        SELECT
          user_id,
          name,
          email,
          total_orders,
          total_items,
          total_spent,
          avg_order_value,
          first_order,
          last_order,
          EXTRACT(DAY FROM (last_order - first_order)) as days_as_customer,
          total_spent / NULLIF(EXTRACT(DAY FROM (last_order - first_order)), 0) as daily_avg_spent
        FROM customer_stats
        WHERE total_orders >= 5
        ORDER BY total_spent DESC
        LIMIT 100;
      </code>
    </example>

    <example title="Window Functions for Analytics">
      <description>
        Using window functions to calculate running totals, rankings, and
        comparisons without self-joins.
      </description>
      <code>
        SELECT
          date_trunc('day', order_date) as order_day,
          COUNT(*) as daily_orders,
          SUM(total_amount) as daily_revenue,
          SUM(SUM(total_amount)) OVER (
            ORDER BY date_trunc('day', order_date)
            ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
          ) as running_revenue,
          AVG(SUM(total_amount)) OVER (
            ORDER BY date_trunc('day', order_date)
            ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
          ) as moving_7day_avg,
          RANK() OVER (
            ORDER BY SUM(total_amount) DESC
          ) as revenue_rank
        FROM orders
        WHERE status = 'completed'
          AND order_date >= CURRENT_DATE - INTERVAL '3 months'
        GROUP BY date_trunc('day', order_date)
        ORDER BY order_day;
      </code>
    </example>

    <example title="Recursive CTE for Hierarchical Data">
      <description>
        Query to traverse hierarchical data structures like organization
        charts or category trees.
      </description>
      <code>
        WITH RECURSIVE category_tree AS (
          -- Base case: Top-level categories
          SELECT
            id,
            name,
            parent_id,
            1 as level,
            ARRAY[name] as path
          FROM categories
          WHERE parent_id IS NULL

          UNION ALL

          -- Recursive case: Child categories
          SELECT
            c.id,
            c.name,
            c.parent_id,
            ct.level + 1,
            ct.path || c.name
          FROM categories c
          INNER JOIN category_tree ct ON c.parent_id = ct.id
        )
        SELECT
          id,
          name,
          level,
          array_to_string(path, ' > ') as full_path,
          (SELECT COUNT(*) FROM products WHERE category_id = ct.id) as product_count
        FROM category_tree ct
        ORDER BY path;
      </code>
    </example>

    <example title="Efficient Pagination with Keyset">
      <description>
        Keyset pagination for large datasets, avoiding the performance penalty
        of OFFSET on large offsets.
      </description>
      <code>
        -- First page
        SELECT
          id,
          name,
          email,
          created_at
        FROM users
        WHERE active = true
        ORDER BY created_at DESC, id
        LIMIT 20;

        -- Subsequent pages (use last row's values as parameters)
        SELECT
          id,
          name,
          email,
          created_at
        FROM users
        WHERE active = true
          AND (
            created_at < $1  -- last row's created_at
            OR (created_at = $1 AND id < $2)  -- last row's id
          )
        ORDER BY created_at DESC, id
        LIMIT 20;
      </code>
    </example>

    <example title="Upsert with ON CONFLICT">
      <description>
        Insert or update pattern using PostgreSQL's ON CONFLICT feature
        for handling duplicate key situations.
      </description>
      <code>
        INSERT INTO user_preferences (
          user_id,
          preference_key,
          preference_value,
          updated_at
        )
        VALUES (
          $1,  -- user_id
          $2,  -- preference_key
          $3,  -- preference_value
          NOW()
        )
        ON CONFLICT (user_id, preference_key)
        DO UPDATE SET
          preference_value = EXCLUDED.preference_value,
          updated_at = NOW()
        WHERE user_preferences.preference_value != EXCLUDED.preference_value
        RETURNING
          user_id,
          preference_key,
          preference_value,
          (xmax = 0) as was_inserted;
      </code>
    </example>

    <example title="Full-Text Search">
      <description>
        Implementing full-text search with ranking and relevance scoring
        using PostgreSQL's text search capabilities.
      </description>
      <code>
        SELECT
          id,
          title,
          description,
          ts_rank(
            to_tsvector('english', title || ' ' || description),
            plainto_tsquery('english', $1)
          ) as relevance,
          ts_headline(
            description,
            plainto_tsquery('english', $1),
            'MaxWords=50, MinWords=20'
          ) as highlighted_description
        FROM articles
        WHERE
          to_tsvector('english', title || ' ' || description)
          @@ plainto_tsquery('english', $1)
          AND published = true
        ORDER BY relevance DESC, created_at DESC
        LIMIT 20;
      </code>
    </example>
  </examples>

  <integration_notes>
    <section title="Using with ORMs">
      <note>
        Modern ORMs (TypeORM, Prisma, Sequelize) can optimize basic queries but
        may generate inefficient SQL for complex operations. Always review generated
        SQL for performance-critical paths.
      </note>

      <note>
        Use ORM query builder methods for simple queries to maintain consistency,
        but consider raw SQL with proper parameterization for complex queries or
        performance-critical operations.
      </note>

      <note>
        ORMs often implement lazy loading by default, which can lead to N+1 problems.
        Use eager loading (JOINs) or explicit select statements to avoid this.
      </note>

      <example>
        -- TypeORM example with eager loading
        const users = await userRepository.find({
          relations: ['orders', 'orders.items'],
          where: { active: true },
          order: { createdAt: 'DESC' },
          take: 20
        });

        -- Raw SQL for complex queries
        const result = await dataSource.query(`
          WITH user_stats AS (
            SELECT
              user_id,
              COUNT(*) as order_count,
              SUM(total) as total_spent
            FROM orders
            WHERE created_at >= $1
            GROUP BY user_id
          )
          SELECT u.*, us.order_count, us.total_spent
          FROM users u
          INNER JOIN user_stats us ON u.id = us.user_id
        `, [startDate]);
      </example>
    </section>

    <section title="Raw SQL vs Query Builders">
      <note>
        Raw SQL offers maximum control and performance but requires careful handling
        of parameterization to prevent SQL injection.
      </note>

      <note>
        Query builders (Knex, Kysely) provide a balance between type safety and
        control over generated SQL. They're ideal for dynamic queries.
      </note>

      <note>
        For analytics and reporting queries, raw SQL is often preferable because
        it's easier to read, debug, and optimize complex aggregations.
      </note>
    </section>

    <section title="Database-Specific Features">
      <note>
        PostgreSQL-specific features like CTEs, window functions, and full-text
        search provide powerful capabilities but may not be portable to other databases.
      </note>

      <note>
        Consider using database-agnostic SQL for portable code, and PostgreSQL-specific
        features only when the performance or functionality benefits are significant.
      </note>
    </section>
  </integration_notes>

  <error_handling>
    <error_scenario>
      <title>Query Timeout</title>
      <description>
        Long-running queries can timeout and cause application errors. Implement
        timeouts at both the application and database level.
      </description>
      <solution>
        -- Set statement timeout in PostgreSQL (30 seconds)
        SET statement_timeout = '30s';

        -- Or set per query
        DECLARE cursor_name CURSOR FOR SELECT ...;

        -- In application code
        try {
          const result = await pool.query('SET statement_timeout = $1', [30000]);
          const data = await pool.query(complexQuery);
        } catch (error) {
          if (error.code === '57014') { // canceling statement due to user request
            // Handle timeout
          }
        }
      </solution>
    </error_scenario>

    <error_scenario>
      <title>Deadlocks</title>
      <description>
        Deadlocks occur when transactions wait on each other for locks. Implement
        proper transaction ordering and retry logic.
      </description>
      <solution>
        -- Always access tables in consistent order within transactions
        BEGIN;
        -- Access tables in alphabetical order or by ID
        UPDATE accounts SET balance = balance - 100 WHERE id = 1;
        UPDATE accounts SET balance = balance + 100 WHERE id = 2;
        COMMIT;

        -- Implement retry logic in application
        async function transactionWithRetry(fn, maxRetries = 3) {
          for (let i = 0; i < maxRetries; i++) {
            try {
              return await fn();
            } catch (error) {
              if (error.code === '40P01' && i < maxRetries - 1) {
                // Deadlock detected, retry
                await new Promise(resolve => setTimeout(resolve, 100 * (i + 1)));
                continue;
              }
              throw error;
            }
          }
        }
      </solution>
    </error_scenario>

    <error_scenario>
      <title>Connection Pool Exhaustion</title>
      <description>
        Too many concurrent connections can exhaust the connection pool and cause
        application failures.
      </description>
      <solution>
        // Configure connection pool appropriately
        const pool = new Pool({
          host: 'localhost',
          database: 'mydb',
          max: 20, // Maximum pool size
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 2000,
        });

        // Always release connections back to pool
        async function getUserData(userId) {
          const client = await pool.connect();
          try {
            const result = await client.query('SELECT * FROM users WHERE id = $1', [userId]);
            return result.rows[0];
          } finally {
            client.release(); // Always release, even on error
          }
        }
      </solution>
    </error_scenario>

    <error_scenario>
      <title>Constraint Violations</title>
      <description>
        Unique constraints, foreign key violations, and check constraints can cause
        query failures. Handle gracefully and provide user-friendly messages.
      </description>
      <solution>
        try {
          await pool.query(
            'INSERT INTO users (email, name) VALUES ($1, $2)',
            [email, name]
          );
        } catch (error) {
          if (error.code === '23505') { // unique_violation
            throw new UserError('Email already exists');
          } else if (error.code === '23503') { // foreign_key_violation
            throw new UserError('Referenced record does not exist');
          } else if (error.code === '23514') { // check_violation
            throw new UserError('Invalid data provided');
          }
          throw error;
        }
      </solution>
    </error_scenario>
  </error_handling>

  <output_format>
    <description>
      Query results should be returned in a consistent format for application
      consumption. Use appropriate column naming, data types, and structure.
    </description>

    <formatting_guidelines>
      <guideline>Use snake_case for column names (PostgreSQL convention)</guideline>
      <guideline>Return dates in ISO 8601 format (YYYY-MM-DDTHH:MM:SSZ)</guideline>
      <guideline>Use null for missing values, not empty strings or zeros</guideline>
      <guideline>Include metadata for pagination queries (total_count, page, per_page)</guideline>
      <guideline>Return arrays for list results, single objects for detail queries</guideline>
    </formatting_guidelines>

    <example>
      {
        "success": true,
        "data": [
          {
            "id": 1,
            "name": "John Doe",
            "email": "john@example.com",
            "created_at": "2024-01-15T10:30:00Z",
            "updated_at": "2024-01-15T10:30:00Z"
          }
        ],
        "metadata": {
          "total_count": 150,
          "page": 1,
          "per_page": 20,
          "total_pages": 8
        }
      }
    </example>
  </output_format>

  <related_skills>
    <skill name="orm-patterns" path="../../development-workflow/backend-development/orm-patterns/SKILL.md">
      ORM usage patterns and best practices for working with object-relational mappers.
    </skill>
    <skill name="migrations" path="../database-migrations/SKILL.md">
      Database migration strategies and version control for schema changes.
    </skill>
    <skill name="connection-pooling" path="../connection-pooling/SKILL.md">
      Managing database connection pools for optimal performance and resource usage.
    </skill>
    <skill name="data-validation" path="../../development-workflow/backend-development/data-validation/SKILL.md">
      Validating data before database operations to maintain data integrity.
    </skill>
  </related_skills>

  <see_also>
    <resource>
      <title>PostgreSQL Performance Tips</title>
      <url>https://wiki.postgresql.org/wiki/Performance_Optimization</url>
      <description>Official PostgreSQL performance optimization guide</description>
    </resource>
    <resource>
      <title>EXPLAIN Output</title>
      <url>https://www.postgresql.org/docs/current/using-explain.html</url>
      <description>Understanding PostgreSQL EXPLAIN output for query optimization</description>
    </resource>
    <resource>
      <title>SQL Style Guide</title>
      <url>https://www.sqlstyle.guide/</url>
      <description>Comprehensive SQL style guide for consistent formatting</description>
    </resource>
    <resource>
      <title>PostgreSQL Index Types</title>
      <url>https://www.postgresql.org/docs/current/indexes-types.html</url>
      <description>Overview of different index types and when to use them</description>
    </resource>
    <resource>
      <title>PG Mustard - Query Analysis</title>
      <url>https://www.pgmustard.com/docs/explain</url>
      <description>Visual EXPLAIN ANALYZE analysis and optimization</description>
    </resource>
  </see_also>

  <changelog>
    <entry version="1.0.0" date="2024-01-18">
      <change>Initial skill creation</change>
      <change>Added comprehensive query patterns and best practices</change>
      <change>Included PostgreSQL-specific examples and features</change>
      <change>Documented common anti-patterns and solutions</change>
    </entry>
  </changelog>
</skill>
```

## Quick Reference

### Essential Query Patterns

```sql
-- Parameterized query pattern
PREPARE get_user(INT) AS SELECT * FROM users WHERE id = $1;
EXECUTE get_user(123);

-- CTE for complex queries
WITH stats AS (
  SELECT user_id, COUNT(*) as count
  FROM orders
  GROUP BY user_id
)
SELECT u.*, s.count
FROM users u
JOIN stats s ON u.id = s.user_id;

-- Window functions
SELECT
  name,
  revenue,
  SUM(revenue) OVER (ORDER BY revenue DESC) as running_total,
  RANK() OVER (ORDER BY revenue DESC) as rank
FROM sales;

-- Upsert pattern
INSERT INTO users (id, name) VALUES ($1, $2)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- Full-text search
SELECT * FROM articles
WHERE to_tsvector(content) @@ to_tsquery('search terms')
ORDER BY ts_rank(to_tsvector(content), to_tsquery('search terms')) DESC;
```

### Performance Checklist

- [ ] Review EXPLAIN ANALYZE output
- [ ] Ensure appropriate indexes exist
- [ ] Avoid SELECT * in production
- [ ] Use parameterized queries
- [ ] Filter data early (WHERE before JOIN)
- [ ] Use appropriate JOIN types
- [ ] Consider CTEs for complex queries
- [ ] Implement pagination for large result sets
- [ ] Monitor query performance in production
- [ ] Set appropriate timeouts for long-running queries

---

**Skill Level**: Intermediate
**Estimated Learning Time**: 2-3 hours
**Prerequisites**: Basic SQL knowledge, understanding of relational databases

For questions or contributions to this skill, please refer to the main documentation or contact the database operations team.
