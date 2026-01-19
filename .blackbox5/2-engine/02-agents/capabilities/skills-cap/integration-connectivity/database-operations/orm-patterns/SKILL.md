---
name: orm-patterns
category: integration-connectivity/database-operations
version: 1.0.0
description: ORM usage patterns, best practices for Prisma and Drizzle, and when to use ORMs vs raw SQL
author: blackbox5/core
verified: true
tags: [orm, prisma, drizzle, database, typescript]
---

# ORM Patterns (Prisma & Drizzle)

```xml
<skill>
  <metadata>
    <name>orm-patterns</name>
    <category>integration-connectivity/database-operations</category>
    <version>1.0.0</version>
    <last_updated>2026-01-18</last_updated>
    <verified>true</verified>
  </metadata>

  <context>
    <section name="what-is-an-orm">
      <title>What is an ORM?</title>
      <content>
        An Object-Relational Mapper (ORM) is a technique that allows you to query and manipulate data from a database using an object-oriented paradigm. In TypeScript/Node.js ecosystems, Prisma and Drizzle are the two most popular ORMs.

        **Prisma**: A full-featured ORM with type-safe queries, migrations, and a powerful client API. It uses a schema definition language and generates types automatically.

        **Drizzle**: A lightweight ORM-like query builder that emphasizes SQL-like syntax, minimal abstraction, and performance. It provides type safety without hiding SQL complexity.
      </content>
    </section>

    <section name="orm-tradeoffs">
      <title>ORM Trade-offs</title>
      <content>
        **Advantages:**
        - Type safety at compile time
        - Automatic schema migrations
        - Relationship management without manual JOINs
        - Database agnostic (easier to switch databases)
        - Reduced boilerplate for CRUD operations
        - Built-in connection pooling and query optimization

        **Disadvantages:**
        - Learning curve for ORM-specific APIs
        - Potential performance overhead (though minimal in mature ORMs)
        - Less control over exact SQL generated
        - Abstraction leakage when dealing with complex queries
        - Generated SQL may not be optimal for all cases
        - Memory overhead for tracking entity relationships

        **When to Use ORMs:**
        - CRUD-heavy applications
        - Teams with strong TypeScript but weaker SQL skills
        - Projects requiring rapid development
        - Applications with complex relationships
        - When type safety is a priority

        **When to Use Raw SQL:**
        - Performance-critical queries
        - Complex aggregations and analytics
        - Bulk operations on large datasets
        - Database-specific features not supported by ORM
        - When you need full control over execution plans
      </content>
    </section>

    <section name="prisma-vs-drizzle">
      <title>Prisma vs Drizzle Comparison</title>
      <content>
        **Prisma:**
        - More mature, larger community
        - Richer ecosystem (Prisma Pulse, Accelerate)
        - Better for complex relationships
        - Automatic schema generation
        - More abstraction from SQL
        - Heavier dependency

        **Drizzle:**
        - Lighter weight, faster performance
        - SQL-like syntax, easier to understand
        - Better for complex queries (closer to SQL)
        - Explicit control over queries
        - Smaller bundle size
        - Less magic, more predictability

        **Choosing Between Them:**
        - Choose Prisma for: Rapid development, complex relationships, team prefers abstraction
        - Choose Drizzle for: Performance, SQL familiarity, fine-grained control, smaller bundles
      </content>
    </section>
  </context>

  <instructions>
    <section name="getting-started">
      <title>Getting Started with ORMs</title>
      <steps>
        <step order="1">
          <title>Choose Your ORM</title>
          <content>
            Evaluate your project requirements:
            - Does your team know SQL well? → Drizzle might be better
            - Do you need rapid development? → Prisma excels
            - Is bundle size critical? → Drizzle is lighter
            - Do you have complex relationships? → Prisma handles them elegantly
          </content>
        </step>
        <step order="2">
          <title>Install Dependencies</title>
          <content>
            **Prisma:**
            ```bash
            npm install prisma @prisma/client
            npx prisma init
            ```

            **Drizzle:**
            ```bash
            npm install drizzle-orm
            npm install -D drizzle-kit
            # Install your database driver (e.g., pg for PostgreSQL)
            npm install pg
            ```
          </content>
        </step>
        <step order="3">
          <title>Configure Connection</title>
          <content>
            Set up environment variables and database connection. Both ORMs use a connection string format:
            ```
            DATABASE_URL="postgresql://user:password@localhost:5432/mydb"
            ```
          </content>
        </step>
        <step order="4">
          <title>Define Your Schema</title>
          <content>
            Create your initial schema following ORM-specific patterns (see Examples section)
          </content>
        </step>
        <step order="5">
          <title>Generate and Run Migrations</title>
          <content>
            Both ORMs support schema migrations. See Migrations section below.
          </content>
        </step>
      </steps>
    </section>

    <section name="working-with-prisma">
      <title>Working with Prisma</title>
      <steps>
        <step order="1">
          <title>Define Schema</title>
          <content>
            Create `prisma/schema.prisma` with your models:
            ```prisma
            model User {
              id        String   @id @default(cuid())
              email     String   @unique
              name      String?
              posts     Post[]
              createdAt DateTime @default(now())
              updatedAt DateTime @updatedAt
            }

            model Post {
              id        String   @id @default(cuid())
              title     String
              content   String?
              published Boolean  @default(false)
              author    User     @relation(fields: [authorId], references: [id])
              authorId  String
              createdAt DateTime @default(now())
            }
            ```
          </content>
        </step>
        <step order="2">
          <title>Generate Client</title>
          <content>
            Run migration and generate Prisma Client:
            ```bash
            npx prisma migrate dev --name init
            npx prisma generate
            ```
          </content>
        </step>
        <step order="3">
          <title>Create Client Instance</title>
          <content>
            ```typescript
            import { PrismaClient } from '@prisma/client'

            const prisma = new PrismaClient()

            // In development, use singleton pattern
            const globalForPrisma = global as unknown as { prisma: PrismaClient }
            export const db = globalForPrisma.prisma || new PrismaClient()

            if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
            ```
          </content>
        </step>
        <step order="4">
          <title>Query Data</title>
          <content>
            Use type-safe queries (see Examples section)
          </content>
        </step>
      </steps>
    </section>

    <section name="working-with-drizzle">
      <title>Working with Drizzle</title>
      <steps>
        <step order="1">
          <title>Define Schema</title>
          <content>
            Create your schema using Drizzle's schema builder:
            ```typescript
            import { pgTable, text, timestamp, boolean, uuid } from 'drizzle-orm/pg-core'
            import { relations } from 'drizzle-orm'

            export const users = pgTable('users', {
              id: uuid('id').defaultRandom().primaryKey(),
              email: text('email').notNull().unique(),
              name: text('name'),
              createdAt: timestamp('created_at').defaultNow(),
              updatedAt: timestamp('updated_at').defaultNow(),
            })

            export const posts = pgTable('posts', {
              id: uuid('id').defaultRandom().primaryKey(),
              title: text('title').notNull(),
              content: text('content'),
              published: boolean('published').default(false),
              authorId: uuid('author_id').references(() => users.id),
              createdAt: timestamp('created_at').defaultNow(),
            })

            export const usersRelations = relations(users, ({ many }) => ({
              posts: many(posts),
            }))

            export const postsRelations = relations(posts, ({ one }) => ({
              author: one(users, {
                fields: [posts.authorId],
                references: [users.id],
              }),
            }))
            ```
          </content>
        </step>
        <step order="2">
          <title>Create Client</title>
          <content>
            ```typescript
            import { drizzle } from 'drizzle-orm/node-postgres'
            import { Pool } from 'pg'

            const pool = new Pool({
              connectionString: process.env.DATABASE_URL,
            })

            export const db = drizzle(pool)
            ```
          </content>
        </step>
        <step order="3">
          <title>Configure Drizzle Kit</title>
          <content>
            Create `drizzle.config.ts`:
            ```typescript
            import type { Config } from 'drizzle-kit'

            export default {
              schema: './src/db/schema.ts',
              out: './drizzle',
              driver: 'pg',
              dbCredentials: {
                connectionString: process.env.DATABASE_URL!,
              },
            } satisfies Config
            ```
          </content>
        </step>
        <step order="4">
          <title>Generate and Run Migrations</title>
          <content>
            ```bash
            npx drizzle-kit generate
            npx drizzle-kit migrate
            ```
          </content>
        </step>
        <step order="5">
          <title>Query Data</title>
          <content>
            Use Drizzle's query builder (see Examples section)
          </content>
        </step>
      </steps>
    </section>
  </instructions>

  <rules>
    <section name="n1-query-prevention">
      <title>N+1 Query Prevention</title>
      <content>
        **Problem**: N+1 queries occur when you execute 1 query to fetch N records, then N additional queries to fetch related data for each record.

        **Detection**:
        - Monitor query logs for repeated similar queries
        - Use Prisma's query logging in development
        - Check database query counts per request

        **Prevention**:

        **Prisma - Use `include` for eager loading:**
        ```typescript
        // BAD: N+1 queries
        const users = await prisma.user.findMany()
        for (const user of users) {
          const posts = await prisma.post.findMany({
            where: { authorId: user.id }
          })
        }

        // GOOD: Single query with JOIN
        const users = await prisma.user.findMany({
          include: {
            posts: true
          }
        })
        ```

        **Drizzle - Use explicit JOINs:**
        ```typescript
        // GOOD: Single query with JOIN
        const result = await db
          .select()
          .from(users)
          .leftJoin(posts, eq(posts.authorId, users.id))
        ```

        **Rule of Thumb**: Always fetch related data in the initial query using includes or JOINs.
      </content>
    </section>

    <section name="transaction-management">
      <title>Transaction Management</title>
      <content>
        **Use transactions for multi-step operations** that must be atomic:

        **Prisma:**
        ```typescript
        await prisma.$transaction(async (tx) => {
          // Create user
          const user = await tx.user.create({
            data: { email: 'user@example.com' }
          })

          // Create post for user
          await tx.post.create({
            data: {
              title: 'First Post',
              authorId: user.id
            }
          })
        })
        ```

        **Drizzle:**
        ```typescript
        await db.transaction(async (tx) => {
          const user = await tx.insert(users).values({
            email: 'user@example.com'
          }).returning()

          await tx.insert(posts).values({
            title: 'First Post',
            authorId: user[0].id
          })
        })
        ```

        **Rules:**
        - Keep transactions as short as possible
        - Avoid external API calls within transactions
        - Use appropriate isolation levels
        - Always handle rollback scenarios
      </content>
    </section>

    <section name="connection-pooling">
      <title>Connection Pooling</title>
      <content>
        **Configure connection pooling** to handle concurrent requests efficiently:

        **Prisma Connection Pool:**
        ```typescript
        const prisma = new PrismaClient({
          datasources: {
            db: {
              url: process.env.DATABASE_URL
            }
          },
          log: ['query', 'info', 'warn', 'error'],
        })
        ```

        **Connection Pool URL Format:**
        ```
        postgresql://user:password@localhost:5432/mydb?connection_limit=10&pool_timeout=20
        ```

        **Drizzle with pg Pool:**
        ```typescript
        const pool = new Pool({
          connectionString: process.env.DATABASE_URL,
          max: 10, // Maximum pool size
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 2000,
        })
        ```

        **Rules:**
        - Set pool size based on your concurrent request load
        - Typical formula: pool_size = (cores * 2) + effective_spindle_count
        - For serverless: use smaller pools (1-5 connections)
        - Monitor connection usage in production
      </content>
    </section>

    <section name="indexing-strategies">
      <title>Indexing Strategies</title>
      <content>
        **Add indexes to frequently queried columns:**

        **Prisma:**
        ```prisma
        model User {
          id    String @id
          email String @unique
          name  String

          @@index([name]) // Single column index
          @@index([email, name]) // Composite index
        }
        ```

        **Drizzle:**
        ```typescript
        export const users = pgTable('users', {
          id: uuid('id').primaryKey(),
          email: text('email').notNull().unique(),
          name: text('name'),
        }, (table) => ({
          nameIdx: index('name_idx').on(table.name),
          emailNameIdx: index('email_name_idx').on(table.email, table.name),
        }))
        ```

        **Rules:**
        - Index columns used in WHERE clauses
        - Index foreign keys
        - Index columns used in ORDER BY
        - Use composite indexes for multi-column queries
        - Don't over-index (slows down writes)
      </content>
    </section>
  </rules>

  <workflow>
    <phase order="1" name="schema-design">
      <title>Schema Design</title>
      <steps>
        <step order="1">Identify entities and their relationships</step>
        <step order="2">Define models/tables with appropriate types</step>
        <step order="3">Set up relationships (one-to-one, one-to-many, many-to-many)</step>
        <step order="4">Add indexes for frequently queried columns</step>
        <step order="5">Define constraints (unique, foreign keys, checks)</step>
        <step order="6">Add timestamps (created_at, updated_at)</step>
      </steps>
    </phase>

    <phase order="2" name="model-definition">
      <title>Model Definition</title>
      <steps>
        <step order="1">Write schema in ORM-specific format</step>
        <step order="2">Generate TypeScript types</step>
        <step order="3">Create initial migration</step>
        <step order="4">Review generated SQL</step>
        <step order="5">Apply migration to database</step>
      </steps>
    </phase>

    <phase order="3" name="query-building">
      <title>Query Building</title>
      <steps>
        <step order="1">Write type-safe queries using ORM API</step>
        <step order="2">Include necessary relations to avoid N+1</step>
        <step order="3">Add pagination for large result sets</step>
        <step order="4">Apply filters and sorting</step>
        <step order="5">Test queries with sample data</step>
      </steps>
    </phase>

    <phase order="4" name="optimization">
      <title>Optimization</title>
      <steps>
        <step order="1">Analyze query performance with EXPLAIN</step>
        <step order="2">Add missing indexes</step>
        <step order="3">Optimize eager loading strategies</step>
        <step order="4">Use select only for needed fields (avoid over-fetching)</step>
        <step order="5">Implement query result caching where appropriate</step>
        <step order="6">Consider raw SQL for complex queries</step>
      </steps>
    </phase>

    <phase order="5" name="testing">
      <title>Testing</title>
      <steps>
        <step order="1">Write unit tests for queries</step>
        <step order="2">Test with realistic data volumes</step>
        <step order="3">Verify transaction rollback behavior</step>
        <step order="4">Test concurrent access patterns</step>
        <step order="5">Validate type safety</step>
      </steps>
    </phase>
  </workflow>

  <best_practices>
    <section name="type-safe-queries">
      <title>Type-Safe Queries</title>
      <content>
        **Leverage TypeScript for compile-time safety:**

        **Prisma:**
        ```typescript
        // Types are automatically inferred
        const user = await prisma.user.findUnique({
          where: { email: 'user@example.com' }
        })
        // user is typed as User | null

        // Type-safe select
        const userWithEmail = await prisma.user.findUnique({
          where: { email: 'user@example.com' },
          select: {
            email: true,
            name: true
            // id and other fields are excluded from type
          }
        })
        ```

        **Drizzle:**
        ```typescript
        // Fully typed query results
        const users = await db.select().from(users)
        // users is typed as User[]

        // Type-safe column selection
        const userEmails = await db.select({
          email: users.email,
          name: users.name
        }).from(users)
        ```
      </content>
    </section>

    <section name="eager-loading">
      <title>Eager Loading</title>
      <content>
        **Always load related data in the initial query:**

        **Prisma:**
        ```typescript
        // Load nested relationships
        const users = await prisma.user.findMany({
          include: {
            posts: {
              include: {
                comments: true
              }
            }
          }
        })
        ```

        **Drizzle:**
        ```typescript
        // Use query chaining for complex relations
        const result = await db.query.users.findMany({
          with: {
            posts: {
              with: {
                comments: true
              }
            }
          }
        })
        ```

        **Benefits:**
        - Single database query
        - Predictable performance
        - Clean, readable code
      </content>
    </section>

    <section name="migrations">
      <title>Migrations</title>
      <content>
        **Treat migrations as first-class code:**

        **Version Control:**
        - Always commit migration files
        - Review generated SQL before applying
        - Never modify applied migrations
        - Create new migrations for schema changes

        **Prisma Migrations:**
        ```bash
        # Create migration
        npx prisma migrate dev --name add_user_status

        # Reset database (development only)
        npx prisma migrate reset

        # Deploy migrations
        npx prisma migrate deploy
        ```

        **Drizzle Migrations:**
        ```bash
        # Generate migration from schema changes
        npx drizzle-kit generate

        # Apply migrations
        npx drizzle-kit migrate

        # Push schema (development only)
        npx drizzle-kit push
        ```

        **Best Practices:**
        - Test migrations in staging first
        - Keep migrations reversible when possible
        - Use descriptive migration names
        - Document breaking changes
      </content>
    </section>

    <section name="raw-sql-fallback">
      <title>Raw SQL Fallback</title>
      <content>
        **Use raw SQL when ORM queries become too complex:**

        **Prisma:**
        ```typescript
        const result = await prisma.$queryRaw`
          SELECT u.*, COUNT(p.id) as post_count
          FROM users u
          LEFT JOIN posts p ON p.author_id = u.id
          GROUP BY u.id
          HAVING COUNT(p.id) > 10
        `
        ```

        **Drizzle:**
        ```typescript
        const result = await db.execute(sql`
          SELECT u.*, COUNT(p.id) as post_count
          FROM users u
          LEFT JOIN posts p ON p.author_id = u.id
          GROUP BY u.id
          HAVING COUNT(p.id) > 10
        `)
        ```

        **When to use raw SQL:**
        - Complex aggregations
        - Database-specific features
        - Performance-critical paths
        - Complex window functions
      </content>
    </section>

    <section name="pagination">
      <title>Pagination</title>
      <content>
        **Implement pagination for large result sets:**

        **Prisma - Offset-based:**
        ```typescript
        const posts = await prisma.post.findMany({
          skip: 20, // offset
          take: 10, // limit
          orderBy: { createdAt: 'desc' }
        })
        ```

        **Prisma - Cursor-based:**
        ```typescript
        const posts = await prisma.post.findMany({
          take: 10,
          cursor: { id: lastPostId },
          skip: 1, // Skip cursor itself
          orderBy: { createdAt: 'desc' }
        })
        ```

        **Drizzle:**
        ```typescript
        const posts = await db.select()
          .from(posts)
          .limit(10)
          .offset(20)
          .orderBy(desc(posts.createdAt))
        ```

        **Recommendations:**
        - Use cursor-based pagination for infinite scroll
        - Use offset-based pagination for numbered pages
        - Always order consistently
        - Consider total count for UI display
      </content>
    </section>
  </best_practices>

  <anti_patterns>
    <section name="n1-queries">
      <title>N+1 Queries</title>
      <content>
        **Anti-pattern:**
        ```typescript
        // BAD: N+1 queries
        const users = await prisma.user.findMany()
        for (const user of users) {
          const posts = await prisma.post.findMany({
            where: { authorId: user.id }
          })
        }
        ```

        **Correct approach:**
        ```typescript
        // GOOD: Single query
        const users = await prisma.user.findMany({
          include: { posts: true }
        })
        ```
      </content>
    </section>

    <section name="over-fetching">
      <title>Over-fetching Data</title>
      <content>
        **Anti-pattern:**
        ```typescript
        // BAD: Fetches all columns
        const users = await prisma.user.findMany()
        ```

        **Correct approach:**
        ```typescript
        // GOOD: Only fetch needed columns
        const users = await prisma.user.findMany({
          select: {
            id: true,
            name: true,
            email: true
          }
        })
        ```
      </content>
    </section>

    <section name="missing-indexes">
      <title>Missing Indexes</title>
      <content>
        **Anti-pattern:**
        ```prisma
        model Post {
          id       String @id
          title    String
          authorId String
          // No index on authorId!
        }
        ```

        **Correct approach:**
        ```prisma
        model Post {
          id       String @id
          title    String
          authorId String

          @@index([authorId])
        }
        ```
      </content>
    </section>

    <section name="massive-transactions">
      <title>Massive Transactions</title>
      <content>
        **Anti-pattern:**
        ```typescript
        // BAD: Transaction processes 10,000 records
        await prisma.$transaction(async (tx) => {
          const records = await tx.record.findMany()
          for (const record of records) {
            await tx.record.update({
              where: { id: record.id },
              data: { processed: true }
            })
          }
        })
        ```

        **Correct approach:**
        ```typescript
        // GOOD: Batch processing
        const batchSize = 100
        const records = await prisma.record.findMany()
        for (let i = 0; i < records.length; i += batchSize) {
          await prisma.$transaction(async (tx) => {
            const batch = records.slice(i, i + batchSize)
            await Promise.all(
              batch.map(record =>
                tx.record.update({
                  where: { id: record.id },
                  data: { processed: true }
                })
              )
            )
          })
        }
        ```
      </content>
    </section>

    <section name="ignoring-constraints">
      <title>Ignoring Database Constraints</title>
      <content>
        **Anti-pattern:**
        ```typescript
        // BAD: Only app-level validation
        if (await prisma.user.findUnique({ where: { email } })) {
          throw new Error('Email exists')
        }
        await prisma.user.create({ data: { email } })
        ```

        **Correct approach:**
        ```prisma
        // GOOD: Database constraint
        model User {
          email String @unique
        }
        ```

        ```typescript
        // Handle constraint violation
        try {
          await prisma.user.create({ data: { email } })
        } catch (error) {
          if (error.code === 'P2002') {
            throw new Error('Email already exists')
          }
          throw error
        }
        ```
      </content>
    </section>
  </anti_patterns>

  <examples>
    <section name="prisma-schema">
      <title>Prisma Schema Example</title>
      <content>
        ```prisma
        // prisma/schema.prisma

        generator client {
          provider = "prisma-client-js"
        }

        datasource db {
          provider = "postgresql"
          url      = env("DATABASE_URL")
        }

        enum Role {
          USER
          ADMIN
          MODERATOR
        }

        model User {
          id        String   @id @default(cuid())
          email     String   @unique
          name      String?
          role      Role     @default(USER)
          posts     Post[]
          comments  Comment[]
          metadata  Json?
          createdAt DateTime @default(now())
          updatedAt DateTime @updatedAt

          @@index([email])
          @@index([role])
        }

        model Post {
          id        String    @id @default(cuid())
          title     String
          content   String?
          published Boolean   @default(false)
          author    User      @relation(fields: [authorId], references: [id], onDelete: Cascade)
          authorId  String
          comments  Comment[]
          tags      String[]
          createdAt DateTime  @default(now())
          updatedAt DateTime  @updatedAt

          @@index([authorId])
          @@index([published])
        }

        model Comment {
          id        String   @id @default(cuid())
          text      String
          post      Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
          postId    String
          author    User     @relation(fields: [authorId], references: [id], onDelete: Cascade)
          authorId  String
          createdAt DateTime @default(now())

          @@index([postId])
          @@index([authorId])
        }
        ```
      </content>
    </section>

    <section name="prisma-queries">
      <title>Prisma Query Examples</title>
      <content>
        ```typescript
        import { PrismaClient } from '@prisma/client'
        const prisma = new PrismaClient()

        // CREATE
        const user = await prisma.user.create({
          data: {
            email: 'user@example.com',
            name: 'John Doe',
            posts: {
              create: [
                { title: 'First Post', content: 'Hello World' },
                { title: 'Second Post' }
              ]
            }
          }
        })

        // READ - Single record with relations
        const userWithPosts = await prisma.user.findUnique({
          where: { id: userId },
          include: {
            posts: {
              where: { published: true },
              orderBy: { createdAt: 'desc' },
              include: {
                comments: {
                  include: { author: true }
                }
              }
            }
          }
        })

        // READ - Filtering and sorting
        const publishedPosts = await prisma.post.findMany({
          where: {
            published: true,
            author: {
              role: 'ADMIN'
            }
          },
          orderBy: [
            { createdAt: 'desc' },
            { title: 'asc' }
          ],
          take: 10,
          skip: 20
        })

        // READ - Select specific fields
        const userEmails = await prisma.user.findMany({
          select: {
            email: true,
            name: true,
            _count: {
              select: { posts: true }
            }
          }
        })

        // UPDATE - Single record
        const updatedPost = await prisma.post.update({
          where: { id: postId },
          data: {
            title: 'Updated Title',
            content: 'Updated content'
          }
        })

        // UPDATE - Many records
        const result = await prisma.post.updateMany({
          where: { published: false },
          data: { published: true }
        })

        // UPDATE - Upsert
        const user = await prisma.user.upsert({
          where: { email: 'user@example.com' },
          update: { name: 'Updated Name' },
          create: { email: 'user@example.com', name: 'New User' }
        })

        // DELETE - Single record
        await prisma.post.delete({
          where: { id: postId }
        })

        // DELETE - Many records
        await prisma.post.deleteMany({
          where: { published: false }
        })

        // AGGREGATION
        const stats = await prisma.post.aggregate({
          where: { published: true },
          _count: true,
          _avg: { createdAt: true },
          _max: { createdAt: true },
          _min: { createdAt: true }
        })

        // GROUP BY
        const postsByAuthor = await prisma.post.groupBy({
          by: ['authorId'],
          _count: true,
          having: {
            authorId: { not: null }
          }
        })

        // TRANSACTION
        await prisma.$transaction([
          prisma.user.update({
            where: { id: userId },
            data: { name: 'Updated' }
          }),
          prisma.post.create({
            data: {
              title: 'New Post',
              authorId: userId
            }
          })
        ])

        // BATCH OPERATIONS
        const { count } = await prisma.post.createMany({
          data: [
            { title: 'Post 1', authorId: userId },
            { title: 'Post 2', authorId: userId },
            { title: 'Post 3', authorId: userId }
          ]
        })
        ```
      </content>
    </section>

    <section name="drizzle-schema">
      <title>Drizzle Schema Example</title>
      <content>
        ```typescript
        // src/db/schema.ts
        import { pgTable, text, uuid, timestamp, boolean, enum as pgEnum, json, index } from 'drizzle-orm/pg-core'
        import { relations } from 'drizzle-orm'

        export const roleEnum = pgEnum('role', ['USER', 'ADMIN', 'MODERATOR'])

        export const users = pgTable('users', {
          id: uuid('id').defaultRandom().primaryKey(),
          email: text('email').notNull().unique(),
          name: text('name'),
          role: roleEnum('role').default('USER'),
          metadata: json('metadata'),
          createdAt: timestamp('created_at').defaultNow(),
          updatedAt: timestamp('updated_at').defaultNow(),
        }, (table) => ({
          emailIdx: index('users_email_idx').on(table.email),
          roleIdx: index('users_role_idx').on(table.role),
        }))

        export const posts = pgTable('posts', {
          id: uuid('id').defaultRandom().primaryKey(),
          title: text('title').notNull(),
          content: text('content'),
          published: boolean('published').default(false),
          authorId: uuid('author_id').references(() => users.id, { onDelete: 'cascade' }),
          tags: json('tags').$type<string[]>().default([]),
          createdAt: timestamp('created_at').defaultNow(),
          updatedAt: timestamp('updated_at').defaultNow(),
        }, (table) => ({
          authorIdIdx: index('posts_author_id_idx').on(table.authorId),
          publishedIdx: index('posts_published_idx').on(table.published),
        }))

        export const comments = pgTable('comments', {
          id: uuid('id').defaultRandom().primaryKey(),
          text: text('text').notNull(),
          postId: uuid('post_id').references(() => posts.id, { onDelete: 'cascade' }),
          authorId: uuid('author_id').references(() => users.id, { onDelete: 'cascade' }),
          createdAt: timestamp('created_at').defaultNow(),
        }, (table) => ({
          postIdIdx: index('comments_post_id_idx').on(table.postId),
          authorIdIdx: index('comments_author_id_idx').on(table.authorId),
        }))

        export const usersRelations = relations(users, ({ many }) => ({
          posts: many(posts),
          comments: many(comments),
        }))

        export const postsRelations = relations(posts, ({ one, many }) => ({
          author: one(users, {
            fields: [posts.authorId],
            references: [users.id],
          }),
          comments: many(comments),
        }))

        export const commentsRelations = relations(comments, ({ one }) => ({
          post: one(posts, {
            fields: [comments.postId],
            references: [posts.id],
          }),
          author: one(users, {
            fields: [comments.authorId],
            references: [users.id],
          }),
        }))
        ```
      </content>
    </section>

    <section name="drizzle-queries">
      <title>Drizzle Query Examples</title>
      <content>
        ```typescript
        import { db } from './db'
        import { users, posts, comments } from './schema'
        import { eq, and, desc, asc, sql, count } from 'drizzle-orm'

        // CREATE
        const [user] = await db.insert(users).values({
          email: 'user@example.com',
          name: 'John Doe',
          role: 'USER'
        }).returning()

        // CREATE with relations
        const [newUser] = await db.insert(users).values({
          email: 'user@example.com',
          name: 'John Doe',
        }).returning()

        await db.insert(posts).values([
          { title: 'First Post', content: 'Hello World', authorId: newUser.id },
          { title: 'Second Post', authorId: newUser.id }
        ])

        // READ - Single record
        const [user] = await db.select().from(users).where(eq(users.id, userId))

        // READ - With JOINs
        const postsWithAuthors = await db
          .select({
            post: posts,
            author: users,
          })
          .from(posts)
          .leftJoin(users, eq(posts.authorId, users.id))
          .where(eq(posts.published, true))
          .orderBy(desc(posts.createdAt))
          .limit(10)

        // READ - Select specific fields
        const userEmails = await db
          .select({
            email: users.email,
            name: users.name,
            postCount: count(posts.id)
          })
          .from(users)
          .leftJoin(posts, eq(posts.authorId, users.id))
          .groupBy(users.id)

        // READ - Complex WHERE
        const adminPosts = await db
          .select()
          .from(posts)
          .innerJoin(users, eq(posts.authorId, users.id))
          .where(
            and(
              eq(posts.published, true),
              eq(users.role, 'ADMIN')
            )
          )

        // UPDATE
        await db
          .update(posts)
          .set({ title: 'Updated Title', content: 'Updated content' })
          .where(eq(posts.id, postId))

        // UPDATE - Many records
        await db
          .update(posts)
          .set({ published: true })
          .where(eq(posts.published, false))

        // DELETE
        await db
          .delete(posts)
          .where(eq(posts.id, postId))

        // DELETE - Many records
        await db
          .delete(posts)
          .where(eq(posts.published, false))

        // UPSERT (PostgreSQL)
        await db
          .insert(users)
          .values({ email: 'user@example.com', name: 'John Doe' })
          .onConflictDoUpdate({
            target: users.email,
            set: { name: 'Updated Name' }
          })

        // AGGREGATION
        const [stats] = await db
          .select({
            count: count(),
            avgCreated: sql`AVG(${posts.createdAt})`.mapWith(Number),
            maxCreated: sql`MAX(${posts.createdAt})`.mapWith(Date),
            minCreated: sql`MIN(${posts.createdAt})`.mapWith(Date),
          })
          .from(posts)
          .where(eq(posts.published, true))

        // GROUP BY
        const postsByAuthor = await db
          .select({
            authorId: posts.authorId,
            count: count(),
          })
          .from(posts)
          .groupBy(posts.authorId)
          .having(sql`${posts.authorId} IS NOT NULL`)

        // TRANSACTION
        await db.transaction(async (tx) => {
          await tx.update(users)
            .set({ name: 'Updated' })
            .where(eq(users.id, userId))

          await tx.insert(posts)
            .values({ title: 'New Post', authorId: userId })
        })

        // RAW SQL
        const result = await db.execute(sql`
          SELECT u.*, COUNT(p.id) as post_count
          FROM users u
          LEFT JOIN posts p ON p.author_id = u.id
          GROUP BY u.id
          HAVING COUNT(p.id) > 10
        `)
        ```
      </content>
    </section>

    <section name="complex-queries">
      <title>Complex Query Examples</title>
      <content>
        **Full-text search with Prisma:**
        ```typescript
        const results = await prisma.post.findMany({
          where: {
            OR: [
              { title: { contains: searchQuery, mode: 'insensitive' } },
              { content: { contains: searchQuery, mode: 'insensitive' } }
            ]
          }
        })
        ```

        **Full-text search with Drizzle:**
        ```typescript
        const results = await db
          .select()
          .from(posts)
          .where(
            sql`${posts.title} ILIKE ${`%${searchQuery}%`} OR ${posts.content} ILIKE ${`%${searchQuery}%`}`
          )
        ```

        **Window function with raw SQL (Prisma):**
        ```typescript
        const rankedPosts = await prisma.$queryRaw`
          SELECT
            id,
            title,
            author_id,
            ROW_NUMBER() OVER (PARTITION BY author_id ORDER BY created_at DESC) as rank
          FROM posts
        `
        ```

        **Recursive CTE (Drizzle + raw SQL):**
        ```typescript
        const categoryTree = await db.execute(sql`
          WITH RECURSIVE category_tree AS (
            SELECT id, name, parent_id, 1 as level
            FROM categories
            WHERE parent_id IS NULL

            UNION ALL

            SELECT c.id, c.name, c.parent_id, ct.level + 1
            FROM categories c
            JOIN category_tree ct ON c.parent_id = ct.id
          )
          SELECT * FROM category_tree
        `)
        ```
      </content>
    </section>
  </examples>

  <integration_notes>
    <section name="typescript-integration">
      <title>TypeScript Integration</title>
      <content>
        Both Prisma and Drizzle provide excellent TypeScript support:

        **Generated Types:**
        - Prisma: Generates types in `node_modules/.prisma/client`
        - Drizzle: Infers types from schema definitions

        **Type Inference:**
        ```typescript
        // Prisma - Automatic type inference
        const user = await prisma.user.findUnique({ where: { id: '123' } })
        // user is typed as User | null

        // Drizzle - Type inference from schema
        const [user] = await db.select().from(users).where(eq(users.id, '123'))
        // user is typed based on users table schema
        ```

        **Custom Types:**
        ```typescript
        // Extend Prisma types
        type UserWithPosts = Prisma.UserGetPayload<{
          include: { posts: true }
        }>

        // Drizzle - Use typeof for table types
        type User = typeof users.$inferSelect
        type NewUser = typeof users.$inferInsert
        ```
      </content>
    </section>

    <section name="validation-integration">
      <title>Validation Library Integration</title>
      <content>
        **Zod Integration:**

        **Prisma + Zod:**
        ```typescript
        import { z } from 'zod'

        // Generate Zod schema from Prisma
        import { zodSchema } from '@prisma/zod-generator'

        const userSchema = zodSchema.User

        // Manual Zod schema
        const createUserSchema = z.object({
          email: z.string().email(),
          name: z.string().min(2),
          role: z.enum(['USER', 'ADMIN']).default('USER')
        })

        const validatedData = createUserSchema.parse(inputData)
        const user = await prisma.user.create({ data: validatedData })
        ```

        **Drizzle + Zod:**
        ```typescript
        import { z } from 'zod'

        // Create Zod schema from Drizzle schema
        import { createInsertSchema, createSelectSchema } from 'drizzle-zod'

        const insertUserSchema = createInsertSchema(users)
        const selectUserSchema = createSelectSchema(users)

        const validatedData = insertUserSchema.parse(inputData)
        const [user] = await db.insert(users).values(validatedData).returning()
        ```

        **Validation Best Practices:**
        - Validate input before database operations
        - Use Zod schemas for API input validation
        - Leverage ORM types for output typing
        - Combine both for end-to-end type safety
      </content>
    </section>

    <section name="api-integration">
      <title>API Integration Patterns</title>
      <content>
        **Next.js App Router with Prisma:**
        ```typescript
        // app/api/users/route.ts
        import { prisma } from '@/lib/prisma'
        import { NextResponse } from 'next/server'

        export async function GET(request: Request) {
          const users = await prisma.user.findMany()
          return NextResponse.json(users)
        }

        export async function POST(request: Request) {
          const body = await request.json()
          const user = await prisma.user.create({ data: body })
          return NextResponse.json(user, { status: 201 })
        }
        ```

        **tRPC Integration:**
        ```typescript
        import { z } from 'zod'
        import { t } from '../trpc'
        import { prisma } from '@/lib/prisma'

        export const userRouter = t.router({
          list: t.procedure.query(() => {
            return prisma.user.findMany()
          }),
          byId: t.procedure
            .input(z.object({ id: z.string() }))
            .query(({ input }) => {
              return prisma.user.findUnique({ where: { id: input.id } })
            }),
          create: t.procedure
            .input(z.object({
              email: z.string().email(),
              name: z.string()
            }))
            .mutation(({ input }) => {
              return prisma.user.create({ data: input })
            })
        })
        ```
      </content>
    </section>
  </integration_notes>

  <error_handling>
    <section name="prisma-errors">
      <title>Prisma Error Handling</title>
      <content>
        ```typescript
        import { Prisma } from '@prisma/client'

        try {
          await prisma.user.create({ data: { email: 'test@example.com' } })
        } catch (error) {
          if (error instanceof Prisma.PrismaClientKnownRequestError) {
            // Unique constraint violation
            if (error.code === 'P2002') {
              console.error('Unique constraint violation:', error.meta)
            }
            // Record not found
            if (error.code === 'P2025') {
              console.error('Record not found')
            }
            // Foreign key constraint violation
            if (error.code === 'P2003') {
              console.error('Foreign key constraint violation')
            }
          }
          if (error instanceof Prisma.PrismaClientValidationError) {
            console.error('Validation error:', error.message)
          }
          if (error instanceof Prisma.PrismaClientInitializationError) {
            console.error('Initialization error:', error.message)
          }
          throw error
        }
        ```

        **Common Prisma Error Codes:**
        - P2002: Unique constraint violation
        - P2003: Foreign key constraint violation
        - P2025: Record not found
        - P2014: Required connected records not found
      </content>
    </section>

    <section name="drizzle-errors">
      <title>Drizzle Error Handling</title>
      <content>
        ```typescript
        import { eq } from 'drizzle-orm'

        try {
          const [user] = await db.insert(users)
            .values({ email: 'test@example.com' })
            .returning()
        } catch (error) {
          // Unique constraint violation
          if (error.code === '23505') {
            console.error('Unique constraint violation:', error.detail)
          }
          // Foreign key constraint violation
          if (error.code === '23503') {
            console.error('Foreign key constraint violation:', error.detail)
          }
          // Not null violation
          if (error.code === '23502') {
            console.error('Not null violation:', error.column)
          }
          throw error
        }
        ```

        **Common PostgreSQL Error Codes:**
        - 23505: Unique violation
        - 23503: Foreign key violation
        - 23502: Not null violation
        - 22001: String data too long
      </content>
    </section>

    <section name="retry-logic">
      <title>Retry Logic</title>
      <content>
        **Implement retries for transient failures:**

        ```typescript
        import { PrismaClient } from '@prisma/client'

        async function withRetry<T>(
          fn: () => Promise<T>,
          maxRetries = 3,
          delayMs = 1000
        ): Promise<T> {
          for (let i = 0; i < maxRetries; i++) {
            try {
              return await fn()
            } catch (error) {
              if (i === maxRetries - 1) throw error

              // Retry on connection errors
              if (
                error.code === 'P1001' ||
                error.code === 'ECONNRESET'
              ) {
                await new Promise(resolve => setTimeout(resolve, delayMs * (i + 1)))
                continue
              }
              throw error
            }
          }
          throw new Error('Max retries exceeded')
        }

        // Usage
        const user = await withRetry(() =>
          prisma.user.findUnique({ where: { id: userId } })
        )
        ```
      </content>
    </section>
  </error_handling>

  <output_format>
    <section name="query-results">
      <title>Typed Query Results</title>
      <content>
        **Prisma Output Types:**
        ```typescript
        // Full record
        const user: User | null = await prisma.user.findUnique(...)

        // With include
        type UserWithPosts = Prisma.UserGetPayload<{
          include: { posts: true }
        }>
        const user: UserWithPosts | null = await prisma.user.findUnique({
          include: { posts: true }
        })

        // With select
        const user: { email: string; name: string | null } | null =
          await prisma.user.findUnique({
            select: { email: true, name: true }
          })
        ```

        **Drizzle Output Types:**
        ```typescript
        // Infer select type
        type User = typeof users.$inferSelect
        const [user]: User[] = await db.select().from(users)

        // Infer insert type
        type NewUser = typeof users.$inferInsert

        // Query result type
        type UserWithEmail = {
          user: User
          email: string
        }
        const result: UserWithEmail[] = await db
          .select({
            user: users,
            email: users.email
          })
          .from(users)
        ```
      </content>
    </section>
  </output_format>

  <related_skills>
    <skill name="sql-queries" category="database-operations">
      Raw SQL query patterns and optimization techniques
    </skill>
    <skill name="migrations" category="database-operations">
      Database migration strategies and best practices
    </skill>
    <skill name="database-connection" category="integration-connectivity">
      Connection pooling and database configuration
    </skill>
  </related_skills>

  <see_also>
    <resource url="https://www.prisma.io/docs" name="Prisma Documentation">
      Official Prisma ORM documentation with guides and reference
    </resource>
    <resource url="https://orm.drizzle.team/docs/overview" name="Drizzle ORM Documentation">
      Official Drizzle ORM documentation and examples
    </resource>
    <resource url="https://www.prisma.io/docs/guides/performance-and-optimization" name="Prisma Performance Guide">
      Best practices for optimizing Prisma queries
    </resource>
    <resource url="https://orm.drizzle.team/docs/performance" name="Drizzle Performance Guide">
      Performance optimization techniques for Drizzle
    </resource>
    <resource url="https://www.prisma.io/docs/concepts/components/prisma-client/relations" name="Prisma Relations">
      Working with relationships in Prisma
    </resource>
    <resource url="https://orm.drizzle.team/docs/overview" name="Drizzle Relations">
      Working with relationships in Drizzle
    </resource>
  </see_also>
</skill>
```
