# Solving "Where Do Things Go": Modern Approaches to Information Organization

Research compiled on 2025-01-15

## Executive Summary

This research explores how modern systems solve the fundamental problem of organizing and retrieving information at scale. The goal is to identify machine-readable, queryable, scalable, and maintainable patterns that could replace or improve traditional documentation-based approaches.

---

## 1. Vector Databases & Semantic Search

### Core Concept
Vector databases solve the "meaning" problem by converting content into numerical representations (embeddings) that capture semantic relationships. Instead of exact keyword matching, they find similar content based on meaning.

### How It Works

**Embeddings Creation:**
- Text, images, or other content is converted into high-dimensional vectors (typically 384-4096 dimensions)
- Each dimension represents a semantic feature
- Similar concepts end up close together in vector space

**Example:**
```
"How do I reset my password?" → [0.23, -0.45, 0.67, ...]
"Password reset instructions" → [0.24, -0.44, 0.66, ...]
"Recipe for chocolate cake" → [0.89, 0.12, -0.34, ...]
```

**Indexing & Retrieval:**
1. **HNSW (Hierarchical Navigable Small World)**: Creates a graph structure for fast approximate nearest neighbor search
2. **IVF (Inverted File Index)**: Partitions vectors into clusters for faster lookup
3. **PQ (Product Quantization)**: Compresses vectors to save memory

### Query Patterns

**Semantic Similarity Search:**
```python
# Find similar documents
query = "authentication issues"
results = vector_db.search(query, top_k=5)
# Returns documents about login, passwords, access control, etc.
```

**Hybrid Search:**
```python
# Combine semantic + keyword search
results = vector_db.hybrid_search(
    query="user authentication",
    keywords=["OAuth", "JWT"],
    weights=[0.7, 0.3]  # semantic vs keyword
)
```

**Filtering:**
```python
# Search within metadata constraints
results = vector_db.search(
    query="database setup",
    filters={
        "language": "python",
        "difficulty": {"$lte": "intermediate"}
    }
)
```

### Key Implementations

**Popular Vector Databases (2025):**
- **Pinecone**: Managed service, auto-scaling
- **Weaviate**: Open-source, GraphQL API, modular
- **Qdrant**: Rust-based, high performance, filtering
- **Milvus**: Open-source, distributed
- **Chroma**: Lightweight, embeddable

**SQL with Vector Support:**
- **PostgreSQL + pgvector**: Add vector search to existing DB
- **MySQL 2025**: Native vector search support
- **SQL Server 2025**: Built-in embeddings integration

### Patterns for "Where Things Go"

**1. Semantic Clustering**
- Content automatically groups by meaning
- No manual categorization needed
- Emergent organization structure

**2. Multi-Modal Search**
- Search across text, code, images with same query
- "Show me authentication examples" finds docs, code, diagrams

**3. Dynamic Similarity**
- As content grows, relationships update automatically
- No manual tagging required

### Advantages
- ✅ Machine-native (no human categorization)
- ✅ Queryable (natural language queries)
- ✅ Scalable (handles millions of vectors)
- ✅ Maintainable (embeddings update with content)
- ✅ Fuzzy matching (finds related concepts)

### Limitations
- ❌ Requires embedding model selection
- ❌ Computational overhead for embeddings
- ❌ Less precise for exact matches
- ❌ "Black box" why something matched

---

## 2. Knowledge Graphs & Graph Databases

### Core Concept
Knowledge graphs represent information as entities (nodes) and relationships (edges), enabling reasoning over connections and multi-hop inference.

### How It Works

**Graph Structure:**
```
(:File {name: "auth.ts"})-[:DEFINES]->(:Function {name: "login"})
(:Function)-[:USES]->(:Dependency {name: "bcrypt"})
(:Function)-[:TESTED_BY]->(:Test {name: "login.test.ts"})
```

**Schema Design:**
```cypher
// Define node types and relationships
CREATE CONSTRAINT file_name UNIQUE FOR (f:File) REQUIRE f.name
CREATE INDEX function_name FOR (f:Function) ON (f.name)

// Define relationship types
(:File)-[:DEFINES|:IMPORTS|:TESTS]->(:File)
(:Function)-[:CALLS|:USES|:RETURNS]->(:Function)
```

### Query Patterns

**Multi-Hop Reasoning:**
```cypher
// Find all files that import a function that uses bcrypt
MATCH (f:File)-[:DEFINES]->(fn:Function)-[:USES]->(d:Dependency {name: "bcrypt"})
RETURN f.name, fn.name

// Find impact of changing a function
MATCH path = (changed:Function {name: "login"})<-[:CALLS*1..3]-(dependent:Function)
RETURN dependent.name, length(path) as impact_level
```

**Pattern Matching:**
```cypher
// Find circular dependencies
MATCH cycle = (f1:File)-[:IMPORTS]->(f2:File)-[:IMPORTS*]->(f1)
RETURN f1.name, f2.name

// Find orphaned code (no imports, not imported)
MATCH (f:File)
WHERE NOT (f)-[:IMPORTS]-()
AND NOT ()-[:IMPORTS]->(f)
RETURN f.name
```

**Semantic Reasoning:**
```cypher
// Infer relationships
MATCH (doc:Documentation)-[:TAGGED]->(tag:Tag {name: "authentication"})
MATCH (code:Code)-[:TOPIC]->(tag)
RETURN doc, code
// Infers: documentation relates to code with same tag
```

### Key Implementations

**Graph Databases:**
- **Neo4j**: Most mature, Cypher query language, ACID compliant
- **ArangoDB**: Multi-model (graph + document), native JavaScript
- **Amazon Neptune**: Serverless, RDF/SPARQL support
- **FalkorDB**: Redis-based, ultra-low latency

**Knowledge Graph Frameworks:**
- **GraphDB**: RDF/OWL reasoning, semantic web standards
- **Stardog**: Enterprise knowledge graph, virtualization
- **Ontotext GraphDB**: Semantic search + reasoning

### Patterns for "Where Things Go"

**1. Relationship-Based Organization**
- Things "go" based on connections, not categories
- Emergent structure from relationships
- Dynamic inference (implicit categorization)

**2. Contextual Navigation**
- "What uses this function?"
- "What will break if I change this?"
- "Show me all authentication-related code"

**3. Hierarchical Abstraction**
- Natural parent-child relationships
- Module boundaries as graph patterns
- Dependency visualization

### Advantages
- ✅ Natural representation of relationships
- ✅ Multi-hop reasoning capabilities
- ✅ Flexible schema (add node/relationship types anytime)
- ✅ Powerful pattern matching
- ✅ Visualizable (graph visualization)
- ✅ Inferencing (derive new knowledge)

### Limitations
- ❌ Steeper learning curve
- ❌ Less efficient for simple lookups
- ❌ Requires relationship modeling
- ❌ Can become complex (spaghetti graphs)

---

## 3. Package Management Systems

### Core Concept
Package managers solve the "where do things go" problem through registries, metadata schemas, and dependency resolution. They provide machine-readable package organization and discovery.

### How It Works

**Registry Architecture:**
```
npm Registry
├── Package Metadata (JSON)
│   ├── name, version, description
│   ├── keywords, tags, categories
│   ├── dependencies (tree structure)
│   ├── author, maintainer, license
│   ├── downloads, popularity metrics
│   └── links (homepage, bugs, repo)
├── Package Tarballs (actual code)
└── Search Index (optimized for discovery)
```

**Metadata Schema (package.json):**
```json
{
  "name": "@blackbox4/core",
  "version": "1.2.3",
  "description": "Core framework for AI agents",
  "keywords": ["ai", "agents", "framework"],
  "categories": ["framework", "machine-learning"],
  "main": "./dist/index.js",
  "exports": {
    ".": "./dist/index.js",
    "./config": "./dist/config.js",
    "./agents": "./dist/agents/*.js"
  },
  "dependencies": {
    "openai": "^4.0.0",
    "anthropic": "^0.10.0"
  },
  "peerDependencies": {
    "typescript": ">=5.0"
  },
  "exports": {
    "types": "./dist/index.d.ts"
  },
  "files": ["dist", "README.md"],
  "homepage": "https://docs.blackbox4.dev",
  "repository": {
    "type": "git",
    "url": "https://github.com/blackbox4/core"
  }
}
```

### Query Patterns

**Registry API:**
```bash
# Search packages
GET https://registry.npmjs.org/-/v1/search?text=ai+agent

# Get package metadata
GET https://registry.npmjs.org/@blackbox4/core

# Get all versions
GET https://registry.npmjs.org/@blackbox4/core/dist-tags
```

**CLI Queries:**
```bash
# Search by keyword
npm search ai agent

# Search by author
npm search author:shaan

# Find dependencies
npm view @blackbox4/core dependencies

# Find dependents (what uses this)
npm dependents @blackbox4/core
```

### Discovery Mechanisms

**1. Semantic Search (npm):**
- Full-text search over name, description, keywords
- Relevance ranking (downloads, recency, quality)
- Faceted filtering (author, keywords, date)

**2. Scoped Packages:**
```json
"@blackbox4/agents"     // Agents framework
"@blackbox4/tools"      // Tools framework
"@blackbox4/templates"  // Templates library
```
- Logical grouping
- Namespace isolation
- Clear ownership

**3. Tagging & Categorization:**
```json
{
  "keywords": ["ai", "agents", "llm", "automation"],
  "categories": ["framework", "developer-tools"],
  "tags": ["stable", "maintained", "typescript"]
}
```

**4. Dependency Graph:**
```bash
# Visualize dependency tree
npm ls @blackbox4/core

# Find why a package is installed
npm ll why openai
```

### Key Patterns

**1. Monorepo Workspaces:**
```json
{
  "workspaces": [
    "packages/*",
    "apps/*"
  ]
}
```
- Local package linking
- Shared dependencies
- Atomic versioning

**2. Semantic Versioning:**
- MAJOR.MINOR.PATCH
- Clear compatibility signaling
- Automated dependency resolution

**3. Registry Metadata:**
- Download counts (popularity)
- Last updated (freshness)
- Quality metrics (lint, test coverage)
- Maintenance status

### Advantages
- ✅ Standardized metadata format
- ✅ Machine-readable discovery
- ✅ Dependency resolution
- ✅ Version management
- ✅ Global namespace (scoped)
- ✅ Automated publishing
- ✅ Usage analytics

### Limitations
- ❌ Centralized registry (usually)
- ❌ Limited to package-level granularity
- ❌ Metadata can be incomplete/inaccurate
- ❌ No semantic understanding (just text search)

---

## 4. Database Indexing & Schema Design

### Core Concept
Databases solve "where do things go" through structured schemas, indexes, and query languages that enable efficient data retrieval.

### How It Works

**Schema Design:**
```sql
-- Hierarchical organization
CREATE TABLE directories (
    id SERIAL PRIMARY KEY,
    parent_id INTEGER REFERENCES directories(id),
    name VARCHAR(255) NOT NULL,
    path VARCHAR(1000) GENERATED ALWAYS AS (
        CASE WHEN parent_id IS NULL THEN name
        ELSE (SELECT path FROM directories WHERE id = parent_id) || '/' || name
        END
    ) STORED,
    type ENUM('agents', 'frameworks', 'modules', 'tools'),
    metadata JSONB
);

-- Files with relationships
CREATE TABLE files (
    id SERIAL PRIMARY KEY,
    directory_id INTEGER REFERENCES directories(id),
    name VARCHAR(255) NOT NULL,
    extension VARCHAR(50),
    content_hash CHAR(64),
    language VARCHAR(50),
    lines INTEGER,
    size_bytes BIGINT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Symbol extraction (code intelligence)
CREATE TABLE symbols (
    id SERIAL PRIMARY KEY,
    file_id INTEGER REFERENCES files(id),
    name VARCHAR(255) NOT NULL,
    type ENUM('function', 'class', 'variable', 'interface', 'type'),
    line_number INTEGER,
    signature TEXT,
    docstring TEXT,
    exports BOOLEAN DEFAULT FALSE
);

-- Relationships between symbols
CREATE TABLE symbol_relationships (
    source_id INTEGER REFERENCES symbols(id),
    target_id INTEGER REFERENCES symbols(id),
    type ENUM('imports', 'calls', 'extends', 'implements', 'uses'),
    context TEXT
);
```

**Indexing Strategy:**
```sql
-- Full-text search
CREATE INDEX idx_files_name ON files USING GIN (to_tsvector('english', name));
CREATE INDEX idx_files_content ON files USING GIN (to_tsvector('english', content));

-- Composite indexes (query patterns)
CREATE INDEX idx_symbols_file_type ON symbols(file_id, type);
CREATE INDEX idx_symbols_exports ON symbols(type, exports) WHERE exports = TRUE;

-- Path traversal optimization
CREATE INDEX idx_directories_path ON directories(path);
CREATE INDEX idx_directories_parent ON directories(parent_id);

-- JSONB metadata indexing
CREATE INDEX idx_files_metadata ON files USING GIN (metadata);
CREATE INDEX idx_files_metadata_specific ON files USING GIN ((metadata->'tags'));

-- Trigram similarity (fuzzy matching)
CREATE INDEX idx_files_name_trgm ON files USING GIN (name gin_trgm_ops);
```

### Query Patterns

**Exact Lookup:**
```sql
-- Find file by path
SELECT * FROM files
WHERE path = '/agents/research/agent.md';

-- Find symbol by name
SELECT * FROM symbols
WHERE name = 'ResearchAgent'
AND type = 'class'
AND exports = TRUE;
```

**Pattern Matching:**
```sql
-- Full-text search
SELECT f.name, ts_rank(f.textsearch, query) AS rank
FROM files f,
     to_tsquery('english', 'authentication & login') query
WHERE f.textsearch @@ query
ORDER BY rank DESC;

-- Fuzzy matching (typos)
SELECT name, similarity(name, 'authentcation') AS sim
FROM files
WHERE name % 'authentcation'
ORDER BY sim DESC;
```

**Hierarchical Queries:**
```sql
-- Find all descendants (recursive)
WITH RECURSIVE tree AS (
    SELECT * FROM directories WHERE id = ?
    UNION ALL
    SELECT d.* FROM directories d
    INNER JOIN tree t ON d.parent_id = t.id
)
SELECT * FROM tree;

-- Find path to root
WITH RECURSIVE path AS (
    SELECT id, name, parent_id, 1 as level
    FROM directories WHERE id = ?
    UNION ALL
    SELECT d.id, d.name, d.parent_id, p.level + 1
    FROM directories d
    INNER JOIN path p ON d.id = p.parent_id
)
SELECT * FROM path ORDER BY level DESC;
```

**Relationship Queries:**
```sql
-- Find all imports of a file
SELECT DISTINCT f.name, f.path
FROM files f
JOIN symbols s ON s.file_id = f.id
JOIN symbol_relationships sr ON sr.source_id = s.id
JOIN symbols target ON sr.target_id = target.id
WHERE target.name = 'BaseAgent'
AND sr.type = 'extends';

-- Impact analysis
WITH RECURSIVE impact AS (
    SELECT id FROM symbols WHERE name = 'BaseAgent'
    UNION
    SELECT s.id FROM symbols s
    JOIN symbol_relationships sr ON sr.source_id = s.id
    JOIN impact i ON sr.target_id = i.id
)
SELECT f.path, s.name, s.type
FROM symbols s
JOIN files f ON f.id = s.file_id
WHERE s.id IN (SELECT id FROM impact);
```

### Optimization Patterns

**1. Index Selection (Query Patterns):**
```sql
-- Analyze query patterns
EXPLAIN ANALYZE SELECT ...

-- Create indexes based on WHERE clauses
CREATE INDEX idx_example ON table(col1, col2)
WHERE frequently_filtered_column = 'common_value';

-- Partial indexes (filtered)
CREATE INDEX idx_active_users ON users(email)
WHERE status = 'active';
```

**2. Materialized Views:**
```sql
-- Pre-computed expensive queries
CREATE MATERIALIZED VIEW file_stats AS
SELECT
    d.path,
    COUNT(f.id) as file_count,
    SUM(f.size_bytes) as total_size,
    AVG(f.lines) as avg_lines
FROM directories d
LEFT JOIN files f ON f.directory_id = d.id
GROUP BY d.path;

-- Refresh periodically
REFRESH MATERIALIZED VIEW file_stats;
```

**3. Partitioning:**
```sql
-- Split large tables
CREATE TABLE files (
    -- schema
) PARTITION BY RANGE (created_at);

CREATE TABLE files_2024_q1 PARTITION OF files
FOR VALUES FROM ('2024-01-01') TO ('2024-04-01');
```

### Advantages
- ✅ Structured query language (SQL)
- ✅ ACID guarantees (consistency)
- ✅ Powerful indexing strategies
- ✅ Relationship integrity (foreign keys)
- ✅ Mature tooling ecosystem
- ✅ Scalable (partitioning, sharding)
- ✅ Query optimization (query planner)

### Limitations
- ❌ Rigid schema (migration required)
- ❌ Limited semantic understanding
- ❌ Complex relationships require JOINs
- ❌ Scaling write operations is complex
- ❌ Not suitable for unstructured data

---

## 5. Modern Frameworks (Next.js, Django, Rails)

### Core Concept
Modern frameworks provide conventions and structures for organizing large codebases through architectural patterns, file system conventions, and separation of concerns.

### Next.js Patterns

**File-Based Routing:**
```
app/
├── (auth)/              # Route group (not in URL)
│   ├── login/
│   │   └── page.tsx
│   └── register/
│       └── page.tsx
├── (dashboard)/         # Protected routes
│   ├── layout.tsx
│   ├── page.tsx
│   └── settings/
│       └── page.tsx
├── api/                 # API routes
│   ├── users/
│   │   └── route.ts
│   └── auth/
│       └── route.ts
└── layout.tsx
```

**Key Conventions:**
- `page.tsx` = Route page
- `layout.tsx` = Shared layout
- `loading.tsx` = Loading state
- `error.tsx` = Error boundary
- `route.ts` = API endpoint
- `(group)` = Route organization (no URL segment)

**Server Actions:**
```typescript
// app/actions/users.ts
'use server'

export async function createUser(formData: FormData) {
  const name = formData.get('name')
  // Server-side logic
  return { success: true }
}

// Usage in component
<form action={createUser}>
  <input name="name" />
</form>
```

**Feature-Based Organization:**
```
src/
├── features/
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── api/
│   │   └── types/
│   ├── dashboard/
│   │   └── ...
│   └── users/
│       └── ...
├── shared/
│   ├── components/
│   ├── utils/
│   └── types/
└── config/
```

### Django Patterns

**App Structure:**
```
project/
├── apps/
│   ├── authentication/
│   │   ├── models.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   ├── serializers.py
│   │   └── tests/
│   ├── users/
│   │   └── ...
│   └── content/
│       └── ...
├── config/
│   ├── settings/
│   │   ├── base.py
│   │   ├── development.py
│   │   └── production.py
│   ├── urls.py
│   └── wsgi.py
├── templates/
├── static/
└── manage.py
```

**MVT Architecture:**
```python
# models.py - Data structure
class User(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)

# views.py - Business logic
class UserListView(ListView):
    model = User
    template_name = 'users/list.html'

# urls.py - Routing
urlpatterns = [
    path('users/', UserListView.as_view(), name='user-list'),
]
```

**Django Apps (Components):**
```python
# Each app is self-contained
# INSTALLED_APPS = [
#     'authentication',
#     'users',
#     'content',
# ]

# Cross-app communication via imports
from authentication.models import User
from content.models import Post
```

### Rails Patterns

**Convention over Configuration:**
```
app/
├── models/
│   └── user.rb
├── controllers/
│   └── users_controller.rb
├── views/
│   └── users/
│       ├── index.html.erb
│       └── show.html.erb
├── helpers/
│   └── users_helper.rb
└── services/
    └── user_service.rb
```

**Resource Routing:**
```ruby
# config/routes.rb
resources :users do
  resources :posts
  member do
    get :profile
  end
  collection do
    get :admins
  end
end

# Generates:
#   GET    /users          => index
#   GET    /users/:id      => show
#   POST   /users          => create
#   PUT    /users/:id      => update
#   DELETE /users/:id      => destroy
#   GET    /users/:id/profile
#   GET    /users/admins
#   GET    /users/:user_id/posts
```

**Service Objects Pattern:**
```ruby
# app/services/user_authentication_service.rb
class UserAuthenticationService
  def initialize(email, password)
    @email = email
    @password = password
  end

  def call
    user = User.find_by(email: @email)
    return Failure.new('User not found') unless user
    return Failure.new('Invalid password') unless user.authenticate(@password)
    Success.new(user)
  end
end

# Usage
result = UserAuthenticationService.new(params[:email], params[:password]).call
if result.success?
  sign_in result.user
else
  render error: result.error
end
```

**Concerns (Shared Logic):**
```ruby
# app/controllers/concerns/authenticatable.rb
module Authenticatable
  extend ActiveSupport::Concern

  included do
    before_action :authenticate_user!
  end

  def authenticate_user!
    head :unauthorized unless current_user
  end
end

# Usage
class UsersController < ApplicationController
  include Authenticatable
end
```

### Common Patterns Across Frameworks

**1. Separation of Concerns:**
- Models (data)
- Views/Controllers (presentation/logic)
- Services (business logic)
- Helpers/Utilities (shared code)

**2. Convention over Configuration:**
- Standardized file structure
- Naming conventions (automatic discovery)
- Default behaviors (override when needed)

**3. Dependency Injection:**
```python
# Django
class UserService:
    def __init__(self, email_service=None):
        self.email_service = email_service or EmailService()
```

```ruby
# Rails
class UsersController < ApplicationController
  def create
    @user = User.new(user_params)
    @service = UserRegistrationService.new(@user, email_service: EmailService.new)
  end
end
```

**4. Modular Architecture:**
- Feature-based grouping
- App/component isolation
- Clear interfaces between modules

### Advantages
- ✅ Established conventions (less decision fatigue)
- ✅ Built-in routing/discovery
- ✅ Separation of concerns
- ✅ Scalable patterns (proven at scale)
- ✅ Community best practices
- ✅ Tooling support (generators, linters)

### Limitations
- ❌ Framework-specific (not portable)
- ❌ Can be rigid (fighting conventions)
- ❌ Learning curve for framework specifics
- ❌ May not fit all use cases

---

## 6. Monorepo Organization Patterns

### Core Concept
Monorepos organize multiple projects/packages in a single repository with workspace management, shared dependencies, and atomic changes.

### Structure Patterns

**1. Nx/Turborepo Style:**
```
monorepo/
├── apps/
│   ├── web/                    # Next.js app
│   ├── api/                    # NestJS API
│   └── admin/                  # Admin dashboard
├── packages/
│   ├── ui/                     # Shared UI components
│   ├── config/                 # ESLint, TypeScript configs
│   ├── utils/                  # Shared utilities
│   └── types/                  # Shared TypeScript types
├── tools/
│   ├── scripts/                # Build/deploy scripts
│   └── generators/             # Code generators
├── nx.json / turbo.json
└── package.json
```

**2. Yarn/pnpm Workspaces:**
```json
{
  "name": "monorepo",
  "workspaces": [
    "packages/*",
    "apps/*"
  ],
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint"
  },
  "devDependencies": {
    "turbo": "latest"
  }
}
```

**3. Bazel/Buck (Build Systems):**
```
monorepo/
├── src/
│   ├── java/
│   │   └── com/example/
│   │       ├── BUILD           # Build definition
│   │       ├── UserService.java
│   │       └── UserController.java
│   └── python/
│       └── example/
│           ├── BUILD
│           └── pipeline.py
├── third_party/
│   └── BUILD
└── WORKSPACE                   # Workspace definition
```

### Dependency Management

**1. Local Package Linking:**
```json
// packages/ui/package.json
{
  "name": "@myrepo/ui",
  "version": "1.0.0"
}

// apps/web/package.json
{
  "dependencies": {
    "@myrepo/ui": "*"  // Links to local package
  }
}
```

**2. Shared Dependencies:**
```json
// package.json (root)
{
  "devDependencies": {
    "typescript": "5.3.0",
    "prettier": "3.0.0",
    "eslint": "8.50.0"
  }
}

// All workspaces use same version
```

**3. Task Orchestration:**
```json
// turbo.json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],  // Build dependencies first
      "outputs": ["dist/**"]
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": []
    },
    "lint": {
      "outputs": []
    }
  }
}
```

### Discovery Patterns

**1. Code Owners:**
```
# .github/CODEOWNERS
# Format: pattern @username

*.go @go-team
apps/web/** @frontend-team
packages/ui/** @design-system-team

# Default owner
* @everyone
```

**2. Visibility Constraints:**
```javascript
// nx.json
{
  "namedInputs": {
    "default": ["{projectRoot}/**"],
    "shared": ["{workspaceRoot}/packages/shared/**"]
  },
  "targetDefaults": {
    "build": {
      "inputs": ["default", "^shared"]  // Depend on shared
    }
  }
}
```

**3. Dependency Visualization:**
```bash
# Nx dependency graph
nx graph

# View what depends on a package
nx show project @myrepo/ui --web

# Affected projects (what changed)
nx affected:graph
```

### Advantages
- ✅ Atomic changes (update multiple packages together)
- ✅ Shared code without publishing
- ✅ Unified tooling (CI/CD, linting, testing)
- ✅ Code ownership visibility
- ✅ Dependency visualization
- ✅ Efficient caching (shared builds)
- ✅ Simplified onboarding

### Limitations
- ❌ Slower git operations (large repo)
- ❌ CI/CD complexity (smart caching needed)
- ❌ Tooling dependency (Nx, Turbo, Bazel)
- ❌ Can become monolithic (if not modularized)

---

## Comparative Analysis

### Queryability Comparison

| Approach | Query Language | Flexibility | Learning Curve |
|----------|---------------|-------------|----------------|
| **Vector Search** | Natural language + filters | High | Low |
| **Knowledge Graph** | Graph patterns (Cypher, Gremlin) | Very High | High |
| **SQL Database** | SQL | Medium | Medium |
| **Package Registry** | REST API + keywords | Low | Low |
| **File System** | File paths | Low | Very Low |

### Scalability Comparison

| Approach | Data Size | Write Speed | Query Speed | Maintenance |
|----------|-----------|-------------|-------------|-------------|
| **Vector Search** | Millions | Medium | Fast | Low (auto-updates) |
| **Knowledge Graph** | Millions | Fast | Medium | Medium |
| **SQL Database** | Billions | Fast | Very Fast | High (migrations) |
| **Package Registry** | Thousands | Slow | Fast | Low (metadata) |
| **File System** | Unlimited | Fast | Medium | High (manual) |

### Use Case Fit

| Use Case | Best Approach | Why |
|----------|---------------|-----|
| **Semantic search** | Vector DB | Understands meaning, fuzzy matches |
| **Code relationships** | Knowledge Graph | Native relationship modeling |
| **Structured data** | SQL Database | ACID, mature tooling |
| **Package discovery** | Registry API | Standard metadata, global search |
| **Project organization** | Monorepo | Atomic changes, shared code |
| **Documentation** | Vector + Graph | Semantic + related docs |

---

## Synthesis: Patterns for "Where Things Go"

### Key Principles

**1. Machine-Readable Metadata**
```yaml
# File: agents/research-agent.yaml
kind: Agent
name: research-agent
version: 1.0.0
tags:
  - research
  - analysis
  - web-search
dependencies:
  - name: web-search-tool
    version: ^2.0.0
  - name: vector-db
    version: ^1.0.0
capabilities:
  - web-search
  - document-analysis
  - summarization
exports:
  - ResearchAgent
  - ResearchResult
```

**2. Multiple Organization Dimensions**
- **Hierarchical**: Folder structure (filesystem)
- **Relational**: Imports, dependencies (graph)
- **Semantic**: Similar meaning, topics (vector)
- **Categorical**: Type, kind, tags (metadata)

**3. Query-First Design**
```typescript
// Define query patterns before organization
queries = {
  "Find research agents": {
    filter: { kind: "Agent" },
    tags: ["research"],
    semantic: "web search analysis"
  },
  "Find tools used by agent": {
    relationship: "USES",
    from: "Agent",
    to: "Tool"
  },
  "Find similar documentation": {
    semantic: true,
    threshold: 0.8
  }
}
```

**4. Automatic Indexing**
```python
# Scan and index automatically
def index_artifact(artifact_path):
    # Extract metadata
    metadata = extract_metadata(artifact_path)

    # Create embedding
    embedding = embed(artifact_path)

    # Extract relationships
    relationships = parse_imports(artifact_path)

    # Store in multiple indexes
    vector_db.store(metadata.id, embedding, metadata)
    graph_db.store(metadata.id, relationships)
    sql_db.store(metadata)
```

---

## Recommended Hybrid Approach

### Multi-Layer Index Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Query Layer                           │
│  Natural Language | Graph Patterns | SQL | Keywords    │
└─────────────────────────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Vector Index │  │ Graph Index  │  │ SQL Database │
│              │  │              │  │              │
│ • Embeddings │  │ • Nodes      │  │ • Tables     │
│ • Semantic   │  │ • Edges      │  │ • Indexes    │
│ • Similarity │  │ • Traversals │  │ • Relations  │
└──────────────┘  └──────────────┘  └──────────────┘
        │                  │                  │
        └──────────────────┼──────────────────┘
                           ▼
                   ┌──────────────┐
                   │  Raw Files   │
                   │  (Filesystem)│
                   └──────────────┘
```

### Implementation Strategy

**Layer 1: File System (Primary Storage)**
```
/artifacts/
  /agents/
    /research-agent/
      agent.md
      config.yaml
      tests/
  /tools/
    /web-search/
      tool.md
      implementation.ts
```

**Layer 2: Metadata Database (Structured Queries)**
```sql
-- artifacts table
CREATE TABLE artifacts (
    id UUID PRIMARY KEY,
    path TEXT UNIQUE,
    kind TEXT, -- Agent, Tool, Module
    name TEXT,
    version TEXT,
    tags TEXT[],
    metadata JSONB,
    embedding vector(1536),
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
);

-- Full-text search
CREATE INDEX idx_artifacts_fts ON artifacts
USING GIN (to_tsvector('english', name || ' ' || metadata->>'description'));

-- Vector similarity
CREATE INDEX idx_artifacts_embedding ON artifacts
USING ivfflat (embedding vector_cosine_ops);
```

**Layer 3: Knowledge Graph (Relationships)**
```cypher
-- Create nodes
CREATE (a:Artifact {
    id: 'uuid',
    kind: 'Agent',
    name: 'research-agent',
    path: '/agents/research-agent'
})

-- Create relationships
CREATE (a)-[:DEPENDS_ON]->(t:Tool {name: 'web-search'})
CREATE (a)-[:TESTED_BY]->(test:Test {path: '/agents/research-agent/test'})
```

**Layer 4: Vector Index (Semantic Search)**
```python
# Automatic embedding
def on_artifact_change(artifact):
    text = extract_text(artifact)
    embedding = openai.embed(text)
    vector_db.upsert(artifact.id, embedding, artifact.metadata)

# Semantic search
def search(query: str):
    query_embedding = openai.embed(query)
    results = vector_db.search(query_embedding, top_k=10)
    return results
```

### Query Router

```python
class ArtifactQueryRouter:
    def query(self, query: str, query_type: str):
        if query_type == "semantic":
            return self.vector_search(query)
        elif query_type == "relationship":
            return self.graph_query(query)
        elif query_type == "structured":
            return self.sql_query(query)
        else:
            return self.hybrid_query(query)

    def vector_search(self, query: str):
        # Find by meaning
        embedding = embed(query)
        results = vector_db.similarity_search(embedding)
        return results

    def graph_query(self, query: GraphQuery):
        # Find by relationships
        cypher = query.to_cypher()
        results = graph_db.execute(cypher)
        return results

    def sql_query(self, query: SQLQuery):
        # Find by structured filters
        sql = query.to_sql()
        results = sql_db.execute(sql)
        return results

    def hybrid_query(self, query: str):
        # Combine multiple approaches
        vector_results = self.vector_search(query)
        sql_results = self.sql_query(SQLQuery.from_text(query))
        return merge_and_rank(vector_results, sql_results)
```

---

## Practical Recommendations

### For Blackbox4 Implementation

**1. Start Simple: Metadata-First**
```yaml
# Every artifact has metadata.yaml
kind: Agent
name: research-agent
version: 1.0.0
description: "Performs web research and analysis"
tags: [research, web-search, analysis]
dependencies: [web-search-tool, vector-db]
exports: [ResearchAgent, ResearchResult]
```

**2. Add Search: Full-Text Index**
```bash
# Build search index
ripgrep --files | \
  while read file; do
    extract_metadata "$file" | \
    jq -c '{path, kind, name, tags}' >> index.jsonl
  done

# Search
jq -r 'select(.kind == "Agent" and (.tags[] | select(. == "research")))' index.jsonl
```

**3. Add Relationships: Dependency Graph**
```python
# Parse imports
def build_dependency_graph():
    for artifact in artifacts:
        for imp in parse_imports(artifact):
            graph.add_edge(artifact.path, imp)
```

**4. Add Semantic Search: Vector Index**
```python
# Periodic indexing
def rebuild_vector_index():
    for artifact in artifacts:
        text = artifact.content + " " + artifact.description
        embedding = embed(text)
        vector_db.upsert(artifact.id, embedding)
```

### Technology Stack Recommendations

**Lightweight (Start Here):**
- **Metadata**: YAML files
- **Search**: ripgrep + jq
- **Graph**: NetworkX (Python)
- **Vector**: chromadb (local)

**Medium Scale:**
- **Metadata**: SQLite + JSONB
- **Search**: PostgreSQL full-text
- **Graph**: Neo4j (community)
- **Vector**: pgvector (PostgreSQL extension)

**Large Scale:**
- **Metadata**: PostgreSQL
- **Search**: Elasticsearch or Meilisearch
- **Graph**: Neo4j or Amazon Neptune
- **Vector**: Pinecone or Weaviate

---

## Conclusion

The "where do things go" problem is best solved with a **multi-layered approach** that combines:

1. **File System**: Primary storage, simple access
2. **Metadata Schema**: Structured queries, filtering
3. **Knowledge Graph**: Relationships, impact analysis
4. **Vector Search**: Semantic similarity, discovery
5. **Full-Text Search**: Keyword matching, exact lookup

**Key Insights:**

- **No single approach is sufficient** - each has strengths
- **Machine-readable metadata is essential** - enables automation
- **Semantic search handles ambiguity** - fuzzy matching
- **Knowledge graphs enable reasoning** - multi-hop queries
- **Start simple, add layers as needed** - don't over-engineer

**For Blackbox4 specifically:**

1. Begin with **metadata.yaml** in every artifact
2. Add **ripgrep + jq** for basic search
3. Implement **SQLite + JSONB** for structured queries
4. Add **NetworkX** for dependency graph
5. Later: **PostgreSQL + pgvector** for full solution

This approach provides immediate value while scaling to sophisticated querying capabilities.

---

## Sources

### Vector Databases & Semantic Search
- [Semantic Search for Enterprise: The 2025 Implementation](https://salfati.group/topics/semantic-search)
- [Vector Databases: Building a Semantic Search Engine](https://medium.com/@amdj3dax/building-a-semantic-search-engine-with-vector-databases-a-practical-guide-4829fc934e53)
- [What is vector search? Complete guide (2025)](https://www.meilisearch.com/blog/what-is-vector-search)
- [Best Vector Databases in 2025](https://www.firecrawl.dev/blog/best-vector-databases-2025)
- [The Complete Guide to Vector Databases](https://machinelearningmastery.com/the-complete-guide-to-vector-databases-for-machine-learning/)
- [How I Built Semantic Vector Search Using SQL Server 2025](https://blog.stackademic.com/how-i-built-semantic-vector-search-using-sql-server-2025-ef-core-10-step-by-step-for-net-88819b09de2b)
- [LangChain Vector Stores Setup Guide](https://latenode.com/blog/ai-frameworks-technical-infrastructure/vector-databases-embeddings/langchain-vector-stores-complete-setup-guide-8-databases-local-implementation-2025)
- [Top Embedding Models in 2025](https://artsmart.ai/blog/top-embedding-models-in-2025/)
- [Semantic Kernel Python Vector Store Migration Guide](https://learn.microsoft.com/en-us/semantic-kernel/support/migration/vectorstore-python-june-2025)

### Knowledge Graphs
- [Multi-Hop Reasoning With Knowledge Graphs and LLMs](https://neo4j.com/blog/genai/knowledge-graph-llm-multi-hop-reasoning/)
- [Knowledge Graph vs Graph Database: Key Differences](https://www.puppygraph.com/blog/knowledge-graph-vs-graph-database)
- [The Intuitions Behind Knowledge Graphs and Reasoning](https://www.oxfordsemantic.tech/blog/the-intuitions-behind-knowledge-graphs-and-reasoning)
- [The Knowledge Graph Transformation: From Retrieval to Reasoning](https://medium.com/building-piper-morgan/the-knowledge-graph-transformation-from-retrieval-to-reasoning-bd3b9048c537)
- [How to Build a Knowledge Graph: Step-by-Step Guide](https://www.falkordb.com/blog/how-to-build-a-knowledge-graph/)

### Package Management
- [npm Registry Documentation](https://docs.npmjs.com/cli/v8/using-npm/registry/)
- [npm Package Metadata Endpoint](https://github.com/npm/registry/blob/master/docs/responses/package-metadata.md)
- [package-metadata npm package](https://www.npmjs.com/package/package-metadata)
- [discovery npm package](https://www.npmjs.com/package/discovery)

### Database Design
- [Database Schema Design Principles](https://medium.com/@artemkhrenov/database-schema-design-principles-every-developer-must-know-fee567414f6d)
- [Complete Guide to Database Design](https://www.geeksforgeeks.org/system-design/complete-reference-to-databases-in-designing-systems/)
- [What is a Database Schema?](https://www.datacamp.com/tutorial/database-schema)
- [Database Schema Design for Scalability](https://dev.to/dhanush___b/database-schema-design-for-scalability-best-practices-techniques-and-real-world-examples-for-ida)
- [Guide to PostgreSQL Database Design](https://www.tigerdata.com/learn/guide-to-postgresql-database-design)
- [Top 10 Database Schema Design Best Practices](https://www.bytebase.com/blog/top-database-schema-design-best-practices/)

### Modern Frameworks
- [Getting Started: Project Structure](https://nextjs.org/docs/app/getting-started/project-structure)
- [Mastering Next.js: Large-Scale Project Structuring](https://medium.com/@finnkumar6/mastering-next-js-the-ultimate-guide-to-structuring-your-large-scale-project-for-success-ae4877c4f4f2)
- [5 Design Patterns for Building Scalable Next.js Applications](https://dev.to/nithya_iyer/5-design-patterns-for-building-scalable-nextjs-applications-1c80)
- [SaaS Architecture Patterns with Next.js](https://vladimirsiedykh.com/blog/saas-architecture-patterns-nextjs)
- [Next.js Enterprise Project Structure](https://blog.dennisokeeffe.com/blog/2021-12-06-nextjs-enterprise-project-structure)
- [Rails vs Django Comparison](https://goudeketting.nl/posts/2025/06/16/rails-vs-django-crm-comparison)

### Monorepo Organization
- [The Ultimate Guide to Building a Monorepo in 2026](https://medium.com/@sanjaytomar717/the-ultimate-guide-to-building-a-monorepo-in-2025-sharing-code-like-the-pros-ee4d6d56abaa)
- [Structuring a Repository](https://turborepo.com/docs/crafting-your-repository/structuring-a-repository)
- [What Is a Monorepo? Benefits, Best Practices](https://talent500.com/blog/monorepo-benefits-best-practices-full-stack/)
- [Mastering Nx: Complete Guide](https://dev.to/mcheremnov/mastering-nx-the-complete-guide-to-modern-monorepo-development-5573)
- [Monorepo Best Practices](https://docs.earna.sh/infrastructure/development-setup/monorepo)
- [Managing TypeScript Packages in Monorepos](https://nx.dev/blog/managing-ts-packages-in-monorepos)
- [Managing Dependencies in a Monorepo](https://graphite.com/guides/managing-dependencies-monorepo)
