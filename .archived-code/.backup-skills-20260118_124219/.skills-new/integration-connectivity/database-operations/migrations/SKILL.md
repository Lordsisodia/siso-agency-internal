---
name: migrations
category: integration-connectivity/database-operations
version: 1.0.0
description: Database migration workflows, schema evolution strategies, and safe deployment practices
author: blackbox5/core
verified: true
tags: [migrations, database, schema, deployment, prisma]
---

# Database Migrations Skill

## Context

Database migrations are the controlled process of evolving a database schema over time while preserving data integrity and application availability. In production environments, migrations are among the highest-risk operations due to their potential to cause data loss, downtime, and performance degradation.

Safe migration practices enable:

- **Continuous Schema Evolution**: Iterate on database design without major version upgrades
- **Zero-Downtime Deployments**: Update schemas without taking applications offline
- **Data Integrity**: Ensure all transformations preserve data accuracy and consistency
- **Rollback Safety**: Quickly revert changes if issues are detected in production
- **Team Collaboration**: Maintain a single source of truth for schema changes across teams

Poor migration practices can lead to:
- Extended downtime and lost revenue
- Data corruption or loss
- Performance degradation from locked tables
- Production incidents and emergency rollbacks
- Technical debt from hacky workarounds

This skill provides production-tested patterns for designing, executing, and verifying database migrations safely.

## Instructions

### Migration Design Phase

Before writing any migration code:

1. **Analyze Impact**
   - Identify all tables and columns affected
   - Estimate data volumes and execution time
   - Check for dependent application code
   - Review existing indexes and constraints

2. **Plan Backward Compatibility**
   - Ensure old application versions work with new schema
   - Support phased rollout of application changes
   - Design additive changes that don't break existing queries
   - Plan for concurrent old and new versions running

3. **Design Rollback Strategy**
   - Write rollback migration before writing the forward migration
   - Test rollback procedures in staging
   - Ensure rollback is idempotent and safe to run multiple times
   - Document manual cleanup steps if rollback is partial

4. **Estimate Performance Impact**
   - Test on production-sized data in staging
   - Measure table lock duration
   - Identify long-running operations
   - Plan for throttling if needed

### Migration Creation

Follow these conventions when writing migrations:

```sql
-- Migration: 20240118_0001_add_user_email_verified
-- Description: Add email_verified column to users table
-- Author: migration-system
-- Estimated time: < 1 second for tables < 10M rows

BEGIN;

-- Add column as nullable first (backward compatible)
ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;

-- Add comment for documentation
COMMENT ON COLUMN users.email_verified IS 'Tracks if user email has been verified';

COMMIT;
```

**Best practices for migration files:**

- Use descriptive names: `YYYYMMDD_NNN_action_description`
- Include metadata at the top (description, author, estimates)
- Wrap in transactions for atomicity (when safe)
- Add comments explaining non-obvious operations
- Keep migrations focused and single-purpose
- Avoid business logic in migrations

### Migration Testing

Before deploying to production:

1. **Unit Testing**
   - Test migration on empty schema
   - Test migration on sample data
   - Test rollback on both scenarios
   - Verify constraints and indexes

2. **Integration Testing**
   - Run migrations in CI/CD pipeline
   - Test against production-sized dataset
   - Verify application still works
   - Check for performance regressions

3. **Pre-Production Validation**
   - Run in staging environment with production data copy
   - Monitor query performance with EXPLAIN ANALYZE
   - Test application with both old and new code
   - Verify rollback works cleanly

### Migration Deployment

Follow this deployment sequence:

1. **Pre-Deployment Checklist**
   - [ ] Migration tested in staging
   - [ ] Rollback tested and documented
   - [ ] Application code compatible with new schema
   - [ ] Monitoring and alerting configured
   - [ ] Team notified of deployment window
   - [ ] Database backup verified (if applicable)

2. **Deployment Steps**
   ```
   1. Deploy database migration (wait for completion)
   2. Verify migration success
   3. Deploy application code using new schema
   4. Monitor application metrics
   5. Clean up old schema elements (if safe)
   ```

3. **Production Verification**
   - Check migration logs for errors
   - Verify schema changes applied correctly
   - Monitor application error rates
   - Check database performance metrics
   - Verify critical user workflows work

4. **Post-Deployment**
   - Document any issues encountered
   - Update runbooks with lessons learned
   - Schedule cleanup migration if needed
   - Monitor for 24-48 hours for issues

## Rules

### Backward Compatibility Rules

**MANDATORY: All migrations must be backward compatible**

1. **Additive Changes Only**
   - Add new columns as nullable
   - Add new tables without affecting existing ones
   - Add indexes (may have performance cost but safe)
   - Add constraints that don't invalidate existing data

2. **Safe Column Additions**
   ```sql
   -- Safe: Add nullable column
   ALTER TABLE users ADD COLUMN email_verified BOOLEAN;

   -- Safe: Add column with default (if fast)
   ALTER TABLE users ADD COLUMN status VARCHAR(20) DEFAULT 'active';

   -- Unsafe: Add NOT NULL column to existing table (blocks writes)
   -- This requires multiple migrations (see examples below)
   ```

3. **Safe Data Type Changes**
   - Widening types: VARCHAR(50) → VARCHAR(100) ✓
   - INT → BIGINT ✓
   - Narrowing types requires multi-step process ✗
   - Type changes with casting need validation

4. **Avoid Destructive Operations**
   - Never DROP COLUMN in active schema
   - Never DROP TABLE without careful coordination
   - Never TRUNCATE in production
   - Never DELETE without WHERE clause (use LIMIT)

### Rollback Rules

**MANDATORY: All migrations must have tested rollback path**

1. **Rollback Must Be Safe**
   - Restore previous state exactly
   - Preserve data created after migration
   - Handle edge cases gracefully
   - Be idempotent (safe to run multiple times)

2. **When Rollback Fails**
   - Document manual recovery steps
   - Have data restoration plan ready
   - Escalate to database team immediately
   - Consider data recovery tools

### Zero-Downtime Rules

**For high-availability systems:**

1. **No Table Locks**
   - Avoid operations that acquire exclusive locks
   - Use online DDL when available (PostgreSQL, MySQL 8.0+)
   - Consider schema evolution tools (pg_repack, pt-online-schema-change)

2. **Long-Running Operations**
   - Break into smaller chunks
   - Run during low-traffic periods
   - Use throttling to reduce load
   - Consider background processing

3. **Application Compatibility**
   - Old application version must work with new schema
   - New application version must work with old schema
   - Use feature flags to enable new functionality
   - Deploy in phases: migration → verify → code deploy

### Performance Rules

1. **Index Operations**
   - Create indexes CONCURRENTLY when possible (PostgreSQL)
   - Drop indexes after verifying they're unused
   - Consider index size and build time
   - Monitor query plans after index changes

2. **Large Table Operations**
   - Test on production-sized data
   - Use batching for updates/deletes
   - Consider partitioning for very large tables
   - Monitor replication lag during migration

## Workflow

### Phase 1: Design

```
Input: Schema change requirement
Process:
  1. Analyze current schema and data
  2. Identify affected tables and queries
  3. Design migration steps
  4. Plan rollback strategy
  5. Estimate time and impact
Output: Migration design document
```

### Phase 2: Creation

```
Input: Migration design document
Process:
  1. Write forward migration SQL
  2. Write rollback migration SQL
  3. Add metadata and comments
  4. Create data validation queries
  5. Write migration unit tests
Output: Migration file with tests
```

### Phase 3: Testing

```
Input: Migration file
Process:
  1. Run on empty schema
  2. Run on sample data
  3. Run on staging production data
  4. Test rollback in all scenarios
  5. Performance test with production data volume
  6. Verify application compatibility
Output: Tested and validated migration
```

### Phase 4: Staging

```
Input: Tested migration
Process:
  1. Deploy to staging environment
  2. Run migration on staging database
  3. Deploy application code to staging
  4. Run integration tests
  5. Load test with production-like traffic
  6. Monitor for issues
Output: Migration verified in staging
```

### Phase 5: Production Deployment

```
Input: Staging-verified migration
Process:
  1. Create pre-deployment backup (if needed)
  2. Run migration on production database
  3. Verify migration success
  4. Deploy application code
  5. Smoke test critical functionality
  6. Monitor metrics for 30 minutes
Output: Migration deployed to production
```

### Phase 6: Verification

```
Input: Deployed migration
Process:
  1. Check application error rates
  2. Verify database performance metrics
  3. Run data consistency checks
  4. Monitor for 24-48 hours
  5. Document any issues
  6. Plan cleanup migration if needed
Output: Verified migration with documentation
```

## Best Practices

### Incremental Changes

**Break complex migrations into small, safe steps:**

```sql
-- Migration 1: Add nullable column
ALTER TABLE users ADD COLUMN full_name TEXT;

-- Migration 2: Backfill data
UPDATE users SET full_name = first_name || ' ' || last_name;

-- Migration 3: Make column NOT NULL
ALTER TABLE users ALTER COLUMN full_name SET NOT NULL;

-- Migration 4: Drop old columns (after app code updated)
ALTER TABLE users DROP COLUMN first_name;
ALTER TABLE users DROP COLUMN last_name;
```

**Benefits:**
- Each step is independently reversible
- Application can adapt gradually
- Easier to identify which step failed
- Can pause between migrations

### Index Creation

**Safe index creation:**

```sql
-- PostgreSQL: Create index without locking
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);

-- MySQL 8.0+: Online DDL
ALTER TABLE users ADD INDEX idx_email (email), ALGORITHM=INPLACE, LOCK=NONE;

-- SQLite: Recreate table (or use tools)
CREATE TABLE users_new (...);
INSERT INTO users_new SELECT * FROM users;
DROP TABLE users;
ALTER TABLE users_new RENAME TO users;
```

**Index creation best practices:**
- Use CONCURRENTLY/ALGORITHM=INPLACE for production
- Create indexes during low-traffic periods
- Monitor disk space during creation
- Verify index usage with EXPLAIN ANALYZE
- Remove unused indexes to save write performance

### Data Migrations

**Safe data migration patterns:**

```sql
-- Pattern 1: Batch updates for large tables
DO $$
DECLARE
  batch_size INT := 10000;
  updated_count INT := 0;
  total_count INT := 0;
BEGIN
  LOOP
    UPDATE users
    SET status = 'verified'
    WHERE email LIKE '%@verified.com'
      AND id > COALESCE((SELECT max(id) FROM completed_updates), 0)
    LIMIT batch_size;

    GET DIAGNOSTICS updated_count = ROW_COUNT;
    total_count := total_count + updated_count;

    INSERT INTO completed_updates VALUES (currval('users_id_seq'));

    EXIT WHEN updated_count = 0;
    COMMIT; -- Commit each batch

    -- Add delay to reduce load
    PERFORM pg_sleep(0.1);
  END LOOP;

  RAISE NOTICE 'Updated % rows', total_count;
END $$;

-- Pattern 2: Use temporary table for complex transformations
CREATE TEMP TABLE users_migration AS
SELECT id, complex_calculation(data) as new_value
FROM users;

UPDATE users u
SET calculated_value = um.new_value
FROM users_migration um
WHERE u.id = um.id;

DROP TABLE users_migration;
```

### Foreign Key Management

**Safe foreign key changes:**

```sql
-- Adding foreign key (check data first)
DO $$
BEGIN
  -- Verify referential integrity
  IF EXISTS (
    SELECT 1 FROM orders o
    LEFT JOIN users u ON o.user_id = u.id
    WHERE u.id IS NULL
  ) THEN
    RAISE EXCEPTION 'Cannot add FK: orphaned records exist';
  END IF;
END $$;

-- Now safe to add constraint
ALTER TABLE orders
ADD CONSTRAINT fk_orders_user_id
FOREIGN KEY (user_id) REFERENCES users(id);

-- Dropping foreign key (verify it's not needed)
ALTER TABLE orders DROP CONSTRAINT fk_orders_user_id;
```

## Anti-Patterns

### Breaking Changes in Single Migration

**Anti-pattern:**
```sql
-- BAD: Multiple breaking changes at once
ALTER TABLE users DROP COLUMN first_name;
ALTER TABLE users DROP COLUMN last_name;
ALTER TABLE users ADD COLUMN full_name TEXT NOT NULL;
```

**Correct approach:**
```sql
-- GOOD: Incremental changes over multiple migrations

-- Migration 1: Add new column
ALTER TABLE users ADD COLUMN full_name TEXT;

-- Migration 2: Backfill data
UPDATE users SET full_name = first_name || ' ' || last_name;

-- Migration 3: Update application code (deploy)

-- Migration 4: Make NOT NULL (after app updated)
ALTER TABLE users ALTER COLUMN full_name SET NOT NULL;

-- Migration 5: Update application code (deploy)

-- Migration 6: Drop old columns
ALTER TABLE users DROP COLUMN first_name;
ALTER TABLE users DROP COLUMN last_name;
```

### Destructive Operations Without Careful Planning

**Anti-pattern:**
```sql
-- BAD: Drop column without checking usage
ALTER TABLE users DROP COLUMN old_field;
```

**Correct approach:**
```sql
-- GOOD: Verify column is unused, then drop in phases

-- Step 1: Check for references
SELECT * FROM information_schema.view_table_usage
WHERE table_name = 'users' AND column_name = 'old_field';

SELECT * FROM pg_proc WHERE prosrc LIKE '%old_field%';

-- Step 2: Rename column to mark for deletion
ALTER TABLE users RENAME COLUMN old_field TO _deprecated_old_field;

-- Step 3: Monitor for 1-2 weeks for errors

-- Step 4: Drop column
ALTER TABLE users DROP COLUMN _deprecated_old_field;
```

### Large Tables Without Consideration

**Anti-pattern:**
```sql
-- BAD: Lock large table for migration
ALTER TABLE huge_table ADD COLUMN new_column VARCHAR(255) DEFAULT 'value';
```

**Correct approach:**
```sql
-- GOOD: Add column without default, update in batches

-- Step 1: Add column without default (fast, doesn't lock)
ALTER TABLE huge_table ADD COLUMN new_column VARCHAR(255);

-- Step 2: Update in batches during low traffic
CREATE INDEX CONCURRENTLY ON huge_table (id);

DO $$
DECLARE
  batch_id INT := 0;
BEGIN
  WHILE batch_id < 1000 LOOP
    UPDATE huge_table
    SET new_column = 'value'
    WHERE id BETWEEN (batch_id * 10000) AND ((batch_id + 1) * 10000 - 1)
      AND new_column IS NULL;

    batch_id := batch_id + 1;
    COMMIT;
  END LOOP;
END $$;
```

### Unchecked Data Type Changes

**Anti-pattern:**
```sql
-- BAD: Cast without validation
ALTER TABLE users ALTER COLUMN age TYPE INT USING age::INT;
```

**Correct approach:**
```sql
-- GOOD: Validate data before type change

-- Step 1: Check for invalid data
SELECT COUNT(*) FROM users WHERE age ~ '^[0-9]+$';

-- Step 2: Fix invalid data
UPDATE users SET age = '0' WHERE age !~ '^[0-9]+$';

-- Step 3: Now safe to change type
ALTER TABLE users ALTER COLUMN age TYPE INT USING age::INT;
```

## Examples

### Example 1: Add Column with Default Value

**Scenario:** Add `email_verified` column to users table

```sql
-- Migration: 20240118_0001_add_email_verified
BEGIN;

-- Add as nullable first (safe, doesn't lock)
ALTER TABLE users ADD COLUMN email_verified BOOLEAN;

-- Set default for new records
ALTER TABLE users ALTER COLUMN email_verified SET DEFAULT FALSE;

-- Backfill existing records
UPDATE users SET email_verified = FALSE WHERE email_verified IS NULL;

-- Set NOT NULL (after backfill)
ALTER TABLE users ALTER COLUMN email_verified SET NOT NULL;

COMMIT;

-- Rollback
BEGIN;
ALTER TABLE users DROP COLUMN email_verified;
COMMIT;
```

### Example 2: Rename Table

**Scenario:** Rename `clients` table to `customers`

```sql
-- Migration: 20240118_0002_rename_clients_to_customers
BEGIN;

-- Step 1: Rename table (fast, metadata only)
ALTER TABLE clients RENAME TO customers;

-- Step 2: Update sequences if needed
ALTER TABLE customers_id_seq RENAME TO customers_id_seq;

-- Step 3: Update indexes
ALTER INDEX idx_clients_email RENAME TO idx_customers_email;

COMMIT;

-- Rollback
BEGIN;
ALTER TABLE customers RENAME TO clients;
ALTER TABLE customers_id_seq RENAME TO clients_id_seq;
ALTER INDEX idx_customers_email RENAME TO idx_clients_email;
COMMIT;
```

### Example 3: Data Migration with Validation

**Scenario:** Migrate user status from string to enum

```sql
-- Migration: 20240118_0003_migrate_status_to_enum
BEGIN;

-- Step 1: Create enum type
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended', 'pending');

-- Step 2: Validate existing data
DO $$
DECLARE
  invalid_count INT;
BEGIN
  SELECT COUNT(*) INTO invalid_count
  FROM users
  WHERE status NOT IN ('active', 'inactive', 'suspended', 'pending');

  IF invalid_count > 0 THEN
    RAISE EXCEPTION 'Found % invalid status values', invalid_count;
  END IF;
END $$;

-- Step 3: Add new column
ALTER TABLE users ADD COLUMN status_new user_status;

-- Step 4: Migrate data
UPDATE users SET status_new = status::user_status;

-- Step 5: Set NOT NULL
ALTER TABLE users ALTER COLUMN status_new SET NOT NULL;

-- Step 6: Drop old column
ALTER TABLE users DROP COLUMN status;

-- Step 7: Rename new column
ALTER TABLE users RENAME COLUMN status_new TO status;

COMMIT;

-- Rollback
BEGIN;
ALTER TABLE users DROP COLUMN status;
ALTER TABLE users ADD COLUMN status VARCHAR(20);
UPDATE users SET status = status_new::TEXT;
DROP TYPE user_status;
COMMIT;
```

### Example 4: Create Index Concurrently

**Scenario:** Add index on email column for performance

```sql
-- Migration: 20240118_0004_add_email_index
BEGIN;

-- PostgreSQL: Create without locking
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);

-- Add partial index for common query
CREATE INDEX CONCURRENTLY idx_users_active
ON users(email) WHERE status = 'active';

COMMIT;

-- Rollback
BEGIN;
DROP INDEX CONCURRENTLY idx_users_email;
DROP INDEX CONCURRENTLY idx_users_active;
COMMIT;
```

### Example 5: Add Foreign Key with Validation

**Scenario:** Add foreign key constraint

```sql
-- Migration: 20240118_0005_add_order_user_fk
BEGIN;

-- Step 1: Validate referential integrity
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM orders o
    LEFT JOIN users u ON o.user_id = u.id
    WHERE o.user_id IS NOT NULL AND u.id IS NULL
    LIMIT 1
  ) THEN
    RAISE EXCEPTION 'Orphaned orders detected. Cannot add FK.';
  END IF;
END $$;

-- Step 2: Create index on foreign key column (for performance)
CREATE INDEX CONCURRENTLY idx_orders_user_id ON orders(user_id);

-- Step 3: Add constraint
ALTER TABLE orders
ADD CONSTRAINT fk_orders_user_id
FOREIGN KEY (user_id) REFERENCES users(id);

COMMIT;

-- Rollback
BEGIN;
ALTER TABLE orders DROP CONSTRAINT fk_orders_user_id;
DROP INDEX CONCURRENTLY idx_orders_user_id;
COMMIT;
```

### Example 6: Large Table Migration

**Scenario:** Add column to table with 100M rows

```sql
-- Migration: 20240118_0006_large_table_migration
BEGIN;

-- Add column without default (fast, doesn't lock table)
ALTER TABLE large_table ADD COLUMN new_field TEXT;

COMMIT;

-- Separate migration for backfill
-- Migration: 20240118_0007_backfill_new_field

-- Create index for batching
CREATE INDEX CONCURRENTLY idx_large_table_id ON large_table(id);

-- Backfill in batches
DO $$
DECLARE
  batch_size INT := 10000;
  last_id INT := 0;
  updated_count INT;
  total_updated INT := 0;
BEGIN
  WHILE TRUE LOOP
    UPDATE large_table
    SET new_field = 'default_value'
    WHERE id > last_id
      AND new_field IS NULL
    ORDER BY id
    LIMIT batch_size;

    GET DIAGNOSTICS updated_count = ROW_COUNT;
    total_updated := total_updated + updated_count;

    IF updated_count = 0 THEN
      EXIT;
    END IF;

    -- Get last updated ID
    SELECT MAX(id) INTO last_id
    FROM large_table
    WHERE new_field = 'default_value';

    RAISE NOTICE 'Updated % rows, last_id: %', total_updated, last_id;

    -- Small delay to reduce load
    PERFORM pg_sleep(0.1);
  END LOOP;

  RAISE NOTICE 'Backfill complete. Total rows: %', total_updated;
END $$;

-- Clean up batching index
DROP INDEX CONCURRENTLY idx_large_table_id;
```

## Integration Notes

### Prisma Migrate

**Using Prisma for migrations:**

```bash
# Create migration
npx prisma migrate dev --name add_user_email_verified

# Apply migrations (development)
npx prisma migrate dev

# Deploy migrations (production)
npx prisma migrate deploy

# Reset database (development only!)
npx prisma migrate reset

# Studio for database inspection
npx prisma studio
```

**Best practices with Prisma:**

1. **Migration files**
   - Review generated SQL before committing
   - Add custom SQL for complex operations
   - Use `--create-only` to generate without applying

2. **Production deployment**
   - Use `migrate deploy` for production
   - Test with `migrate resolve` if needed
   - Keep schema in sync with code

3. **Custom migrations**
   ```prisma
   // schema.prisma

   // Add custom migration
   migration 20240118_add_email {
     // Custom SQL in migration file
     ALTER TABLE users ADD COLUMN email_verified BOOLEAN;
   }
   ```

### Drizzle Kit

**Using Drizzle ORM:**

```bash
# Generate migration
drizzle-kit generate:pg

# Push schema changes (development)
drizzle-kit push:pg

# Studio for database inspection
drizzle-kit studio

# Introspect existing database
drizzle-kit introspect:pg
```

**Best practices with Drizzle:**

1. **Migration files**
   - Review generated SQL
   - Use version control for migrations
   - Test migrations in staging

2. **Schema definition**
   ```typescript
   import { pgTable, serial, text, boolean } from 'drizzle-orm/pg-core';

   export const users = pgTable('users', {
     id: serial('id').primaryKey(),
     email: text('email').notNull().unique(),
     emailVerified: boolean('email_verified').notNull().default(false),
   });
   ```

3. **Migration workflow**
   ```bash
   # 1. Update schema
   # 2. Generate migration
   drizzle-kit generate:pg

   # 3. Review migration file

   # 4. Apply migration
   drizzle-kit push:pg
   ```

### Custom Migration Tools

**When to build custom tooling:**

1. **Multi-database migrations**
   - Need to support multiple database types
   - Custom migration logic required

2. **Complex orchestration**
   - Phased deployments across services
   - Conditional migrations based on data

3. **Example custom migration runner**
   ```typescript
   // migration-runner.ts

   interface Migration {
     id: string;
     name: string;
     up: (db: Database) => Promise<void>;
     down: (db: Database) => Promise<void>;
   }

   class MigrationRunner {
     async run(migrations: Migration[]) {
       for (const migration of migrations) {
         const applied = await this.isApplied(migration.id);
         if (!applied) {
           console.log(`Running migration: ${migration.name}`);
           await this.runInTransaction(async (db) => {
             await migration.up(db);
             await this.markApplied(migration.id);
           });
         }
       }
     }

     async rollback(migrationId: string) {
       const migration = this.findMigration(migrationId);
       await this.runInTransaction(async (db) => {
         await migration.down(db);
         await this.markRolledBack(migrationId);
       });
     }

     private async runInTransaction(fn: (db: Database) => Promise<void>) {
       // Transaction handling
     }
   }
   ```

## Error Handling

### Migration Failures

**Common failure scenarios:**

1. **Lock Timeout**
   ```sql
   -- Error: lock timeout
   -- Cause: Table locked by long-running query

   -- Solution: Identify blocking query
   SELECT pid, query, state
   FROM pg_stat_activity
   WHERE state = 'active'
     AND query LIKE '%users%';

   -- Option 1: Wait for query to complete
   -- Option 2: Cancel query (carefully!)
   SELECT pg_cancel_backend(pid);
   -- Option 3: Terminate query (last resort!)
   SELECT pg_terminate_backend(pid);
   ```

2. **Constraint Violation**
   ```sql
   -- Error: constraint violation
   -- Cause: Data doesn't meet new constraint

   -- Solution: Fix data before adding constraint
   DELETE FROM users WHERE email IS NULL;
   ALTER TABLE users ALTER COLUMN email SET NOT NULL;
   ```

3. **Out of Disk Space**
   ```bash
   # Error: out of disk space during index creation
   # Solution: Check disk space and clean up

   # Check disk usage
   df -h /var/lib/postgresql

   # Find large tables
   SELECT
     schemaname,
     tablename,
     pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
   FROM pg_tables
   ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

   # Vacuum to reclaim space
   VACUUM FULL users;
   ```

### Rollback Procedures

**When rollback is needed:**

1. **Automatic Rollback**
   ```sql
   -- Migration failed, run rollback
   BEGIN;
   -- Rollback SQL from migration file
   ALTER TABLE users DROP COLUMN email_verified;
   COMMIT;
   ```

2. **Manual Rollback**
   ```sql
   -- When automatic rollback fails

   -- Step 1: Assess state
   SELECT COUNT(*) FROM users WHERE email_verified IS NOT NULL;

   -- Step 2: Decide on action
   -- Option A: Complete partial migration
   -- Option B: Revert to backup
   -- Option C: Manual data cleanup

   -- Step 3: Execute fix
   ```

3. **Data Restoration**
   ```bash
   # When schema corruption occurs

   # Stop application
   systemctl stop myapp

   # Restore from backup
   pg_restore -d mydb_production /backups/mydb_backup.dump

   # Verify data
   psql -d mydb_production -c "SELECT COUNT(*) FROM users;"

   # Start application
   systemctl start myapp
   ```

### Monitoring During Migrations

**Key metrics to watch:**

1. **Database Metrics**
   - Connection count
   - Query latency
   - Lock wait time
   - Replication lag
   - Disk I/O

2. **Application Metrics**
   - Error rate
   - Request latency
   - Throughput
   - Database connection pool usage

3. **Alerting**
   ```yaml
   # Example Prometheus alerts
   - alert: MigrationLockTimeout
     expr: pg_locks{mode="exclusive"} > 0
     for: 1m
     annotations:
       summary: "Migration holding exclusive lock too long"

   - alert: MigrationErrorRate
     expr: rate(app_errors{type="database"}[5m]) > 0.01
     annotations:
       summary: "High error rate during migration"
   ```

## Output Format

### Migration File Template

```sql
-- Migration: YYYYMMDD_NNNN_descriptive_name
-- Description: Clear description of what this migration does
-- Author: Your name or system
-- Created: YYYY-MM-DD
-- Estimated time: Duration estimate
-- Dependencies: Other migrations this depends on
-- Risk level: low/medium/high
-- Requires downtime: true/false

-- ============================================================================
-- FORWARD MIGRATION
-- ============================================================================

BEGIN;

-- Step 1: Describe what this does
-- Add comments explaining why

-- Example operation
ALTER TABLE table_name ADD COLUMN new_column TYPE;

-- Data migration if needed
UPDATE table_name SET new_column = 'default_value';

COMMIT;

-- ============================================================================
-- ROLLBACK MIGRATION
-- ============================================================================

BEGIN;

-- Reverse operations in reverse order
ALTER TABLE table_name DROP COLUMN new_column;

COMMIT;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Run these to verify migration success

-- Check column exists
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'table_name' AND column_name = 'new_column';

-- Check data integrity
SELECT COUNT(*) AS count, new_column
FROM table_name
GROUP BY new_column;
```

### Migration Log Format

```json
{
  "migration_id": "20240118_0001_add_email_verified",
  "timestamp": "2024-01-18T10:30:00Z",
  "status": "success",
  "duration_ms": 1250,
  "database": "production",
  "tables_affected": ["users"],
  "rows_affected": 1500000,
  "checksum": "a1b2c3d4e5f6",
  "applied_by": "migration-system",
  "rollback_available": true,
  "notes": "Completed successfully, no issues detected"
}
```

## Related Skills

- **orm-patterns**: Using ORMs effectively for database operations
- **sql-queries**: Writing efficient SQL queries
- **database-indexing**: Creating and optimizing database indexes
- **transaction-management**: Managing database transactions properly

## See Also

### Migration Tools

- **PostgreSQL**: `ALTER TABLE ... CONCURRENTLY`
- **MySQL 8.0+**: Online DDL operations
- **Prisma**: https://www.prisma.io/docs/concepts/components/prisma-migrate
- **Drizzle**: https://orm.drizzle.team/docs/kit-overview
- **Flyway**: https://flywaydb.org/documentation/
- **Liquibase**: https://docs.liquibase.com/

### Best Practices

- **Zero-Downtime Migrations**: https://brandur.org/fragments
- **PostgreSQL Migrations**: https://www.postgresql.org/docs/current/sql-altertable.html
- **Database Migration Patterns**: https://martinfowler.com/articles/evodb.html
- **Safe Schema Migrations**: https://medium.com/@brikis98/zero-downtime-postgres-migrations-the-hard-parts-6a8765fff94d

### Monitoring

- **PostgreSQL Monitoring**: `pg_stat_activity`, `pg_stat_user_tables`
- **Query Performance**: `EXPLAIN ANALYZE`, `pg_stat_statements`
- **Lock Monitoring**: `pg_locks`, `pg_blocking_pids()`

### Deployment

- **Blue-Green Deployments**: Reduce risk with duplicate infrastructure
- **Canary Releases**: Roll out to subset of traffic first
- **Feature Flags**: Enable new functionality safely
- **Rollback Strategies**: Always have a path back
