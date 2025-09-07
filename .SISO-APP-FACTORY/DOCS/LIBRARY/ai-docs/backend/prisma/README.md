# Prisma ORM Documentation

This documentation contains comprehensive information about Prisma ORM for database operations.

## Key Features

### 🗃️ **Database Operations**
- Type-safe database queries
- Auto-generated client based on schema
- Support for multiple databases (PostgreSQL, MySQL, SQLite, MongoDB, SQL Server)
- Built-in connection pooling

### 📝 **Schema Management**
- Declarative data modeling
- Automatic migrations
- Multi-schema support
- Database introspection

### 🔍 **Query API**
- CRUD operations (create, read, update, delete)
- Relation queries and nested reads
- Aggregations and grouping
- Raw SQL support

## Quick Start

### Schema Definition
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id    Int    @id @default(autoincrement())
  email String @unique
  name  String?
  posts Post[]
}

model Post {
  id       Int    @id @default(autoincrement())
  title    String
  content  String?
  author   User   @relation(fields: [authorId], references: [id])
  authorId Int
}
```

### Client Usage
```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Query all users with their posts
const users = await prisma.user.findMany({
  include: {
    posts: true,
  },
})

// Create user with posts
const user = await prisma.user.create({
  data: {
    email: 'alice@example.com',
    name: 'Alice',
    posts: {
      create: {
        title: 'Hello World',
        content: 'My first post'
      }
    }
  }
})
```

## Advanced Features

### Client Extensions
```typescript
const prisma = new PrismaClient().$extends({
  query: {
    user: {
      async create({ args, query }) {
        // Custom logic before user creation
        return query(args)
      },
    },
  },
})
```

### Transactions
```typescript
const [user, posts] = await prisma.$transaction([
  prisma.user.create({ data: { email: 'bob@example.com' } }),
  prisma.post.findMany(),
])
```

### Raw Queries
```typescript
const users = await prisma.$queryRaw`
  SELECT * FROM User WHERE email = ${email}
`
```

## Commands

- `npx prisma generate` - Generate Prisma Client
- `npx prisma db push` - Push schema to database
- `npx prisma migrate dev` - Create and apply migrations
- `npx prisma studio` - Open database browser

Last Updated: August 2025
Source: Context7 MCP - /prisma/docs