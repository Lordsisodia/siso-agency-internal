# AI-Assisted Code Generation

> **Category:** Development Workflow
> **Skill:** code-generation
> **Created:** 2026-01-18
> **Last Updated:** 2026-01-18
> **Status:** Production Ready
> **Agents:** primary, subagent, tools
> **Priority:** High

## Overview

AI-assisted code generation skill for leveraging Claude, GPT, and other AI tools to accelerate development while maintaining code quality. Covers prompt engineering, generation patterns, validation strategies, and integration into development workflows.

## Key Capabilities

- Effective prompt engineering for code generation
- Generation strategies for different code types
- Template-based generation
- Context-aware code completion
- Test generation from implementation
- Documentation generation
- Refactoring assistance
- Code review automation
- Boilerplate reduction
- Multi-file generation workflows

## Prerequisites

- Access to AI coding assistant (Claude, GitHub Copilot, Cursor, etc.)
- Understanding of the codebase architecture
- Knowledge of the programming language/framework
- Quality standards and guidelines

## Prompt Engineering Patterns

### The Context-Request Pattern

```markdown
# Context
I'm working on a Next.js 14 application with TypeScript, Prisma, and PostgreSQL.
We use a modular domain structure under `src/domains/`.

# Request
Generate a complete user management feature with:
- User profile CRUD operations
- Profile picture upload with S3
- Email verification flow
- Password reset functionality

# Constraints
- Use our existing Prisma schema
- Follow the domain structure pattern
- Include comprehensive error handling
- Add TypeScript types for all functions
- Include Zod validation schemas
- Add unit tests with Vitest
```

### The Example-Based Pattern

```markdown
# Example Style
Here's how we structure API routes in our codebase:

\`\`\`typescript
// src/domains/users/api/create-user.ts
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
});

export async function POST(req: Request) {
  const user = await requireAuth();
  const body = await req.json();
  const data = schema.parse(body);

  const result = await prisma.user.create({
    data: { ...data, createdById: user.id },
  });

  return Response.json(result);
}
\`\`\`

# Task
Create a similar API route for updating a user profile that:
1. Validates the request body with Zod
2. Checks the user has permission
3. Updates the user in the database
4. Returns the updated user object

The schema should include:
- name: optional, min 2 chars
- bio: optional, max 500 chars
- avatarUrl: optional, must be a URL
```

### The Iterative Refinement Pattern

```markdown
# Initial Request
Create a React component for a user profile card.

# Feedback - Round 1
Good start, but I need:
- Add a loading skeleton state
- Make it responsive (mobile/desktop)
- Add hover effects
- Use Tailwind CSS for styling

# Feedback - Round 2
Better, but also add:
- Error boundary integration
- Accessibility (ARIA labels)
- Keyboard navigation support
- Storybook story example

# Final Request
Now generate:
1. The component file
2. A separate test file with Vitest
3. A Storybook story
4. TypeScript types in a separate file
```

## Generation Strategies

### Feature Generation Workflow

```typescript
// Step 1: Define the feature spec
const featureSpec = {
  name: 'user-notifications',
  description: 'Real-time user notifications with WebSocket',
  files: [
    'types/notifications.ts',
    'api/notifications/route.ts',
    'components/NotificationList.tsx',
    'hooks/useNotifications.ts',
    'tests/notifications.test.ts'
  ]
};

// Step 2: Generate Prisma schema
prompt: `
Generate Prisma schema for a notification system:

Models:
- Notification: id, userId, type, title, message, readAt, createdAt
- NotificationPreference: userId, emailEnabled, pushEnabled, categories

Include:
- Proper indexes for queries
- Relations to User model
- Enums for notification types
- Default values
`;

// Step 3: Generate API routes
prompt: `
Create Next.js 14 API route handlers for notifications:

GET /api/notifications
- List user's notifications
- Support pagination (cursor-based)
- Filter by read/unread status
- Include unread count in response

POST /api/notifications/mark-read
- Mark notifications as read
- Accept array of notification IDs

PATCH /api/notifications/:id
- Mark single notification as read

Use:
- Prisma for database
- Next.js 14 route handlers
- Proper error handling
- TypeScript throughout
`;

// Step 4: Generate React hooks
prompt: `
Create a React hook for managing notifications:

useNotifications(options)
- Fetch notifications with infinite scroll
- Real-time updates via WebSocket
- Optimistic UI updates
- Mark as read functionality
- Mutation states (loading, error)

Include:
- TypeScript types
- Error handling
- Loading states
- Cache invalidation
`;

// Step 5: Generate components
prompt: `
Create notification components following our design system:

<NotificationList />
- Infinite scroll list
- Group by date (Today, Yesterday, Older)
- Swipe to dismiss (mobile)
- Click to open

<NotificationItem />
- Different styles by notification type
- Read/unread visual distinction
- Avatar/icon for each type
- Time ago formatting

<NotificationBell />
- Bell icon in header
- Unread count badge
- Click to open dropdown
- Real-time updates

Use:
- Tailwind CSS
- Framer Motion for animations
- lucide-react for icons
`;

// Step 6: Generate tests
prompt: `
Generate comprehensive tests for the notification system:

1. API route tests (Vitest + MSW)
   - GET /api/notifications
   - POST /api/notifications/mark-read
   - Authentication required
   - Error handling

2. Hook tests (React Testing Library)
   - useNotifications hook
   - Real-time updates
   - Error states
   - Loading states

3. Component tests
   - NotificationList rendering
   - User interactions
   - Accessibility

Mock:
- Prisma client
- WebSocket connection
- Next.js auth
`;
```

### CRUD Generator Template

```typescript
// Generate complete CRUD for any entity
async function generateCRUD(entityName: string, fields: Field[]) {
  const prompts = {
    schema: generateSchemaPrompt(entityName, fields),
    api: generateAPIPrompt(entityName, fields),
    components: generateComponentsPrompt(entityName, fields),
    tests: generateTestsPrompt(entityName, fields),
  };

  // Execute generation in sequence
  for (const [type, prompt] of Object.entries(prompts)) {
    await executeGeneration(prompt, `generate-${type}-${entityName}`);
  }
}

function generateSchemaPrompt(entity: string, fields: Field[]): string {
  return `
Generate Prisma schema for ${entity}:

Fields:
${fields.map(f => `- ${f.name}: ${f.type}${f.required ? '' : '?'}`).join('\n')}

Requirements:
- Include id (UUID)
- Add createdAt, updatedAt timestamps
- Add soft delete (deletedAt)
- Create indexes for common queries
- Add relations if applicable
`;
}

function generateAPIPrompt(entity: string, fields: Field[]): string {
  return `
Create Next.js 14 API routes for ${entity}:

Routes:
- GET /api/${entity.toLowerCase()}/:id
- GET /api/${entity.toLowerCase()} (list with pagination)
- POST /api/${entity.toLowerCase()} (create)
- PATCH /api/${entity.toLowerCase()}/:id (update)
- DELETE /api/${entity.toLowerCase()}/:id (soft delete)

Include:
- Zod validation schemas
- Authentication checks
- Authorization checks
- Error handling
- Query parameters (filtering, sorting, pagination)
- TypeScript throughout
`;
}
```

## Code Completion Patterns

### Context-Aware Completion

```typescript
// When the AI sees this, it should suggest...

// Pattern 1: Service creation
class UserService {
  constructor(private prisma: PrismaClient) {}

  // AI should suggest:
  // - CRUD methods
  // - Validation
  // - Error handling
  async findAll() { }
  async findById() { }
  async create() { }
  async update() { }
  async delete() { }
}

// Pattern 2: React component
export function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState(null);

  // AI should suggest:
  // - useEffect for data fetching
  // - Loading state
  // - Error handling
  // - Memoized computations
}

// Pattern 3: Zod schema
// AI should suggest:
// - All field types
// - Validation rules
// - Error messages
// - Transformations
const userSchema = z.object({
  // AI completes here
});
```

### Intelligent Suggestions

```typescript
// Suggest imports based on usage
// When typing: useState
// AI suggests: import { useState } from 'react';

// Suggest complete patterns
// When typing: export const GET =
// AI suggests: export const GET = async (req: Request) => { }

// Suggest related code
// After creating user model, suggest:
// - user repository
// - user service
// - user controller
// - user DTOs
```

## Template-Based Generation

### API Route Template

```typescript
// templates/api-route.template.ts
export async function {{METHOD}}(req: Request) {
  try {
    // 1. Authentication
    const user = await requireAuth();

    // 2. Validation
    const body = await req.json();
    const validated = {{SCHEMA}}.parse(body);

    // 3. Business Logic
    const result = await {{SERVICE}}.{{METHOD}}(validated);

    // 4. Response
    return Response.json(result);
  } catch (error) {
    // 5. Error Handling
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### React Component Template

```typescript
// templates/component.template.tsx
import { useState } from 'react';

interface {{COMPONENT_NAME}}Props {
  // Props definition
}

export function {{COMPONENT_NAME}}({ {{PROPS}} }: {{COMPONENT_NAME}}Props) {
  const [state, setState] = useState(initialState);

  // Event handlers
  const handleEvent = () => {
    // Handler logic
  };

  // Effects
  useEffect(() => {
    // Effect logic
  }, [dependencies]);

  return (
    <div className="{{TAILWIND_CLASSES}}">
      {/* JSX content */}
    </div>
  );
}
```

## Test Generation

### From Implementation

```markdown
# Given this implementation:
function calculateDiscount(order: Order, customer: Customer): number {
  const baseDiscount = customer.tier === 'vip' ? 0.15 : 0.05;
  const orderBonus = order.total > 1000 ? 0.05 : 0;
  return order.total * (baseDiscount + orderBonus);
}

# Generate tests:
describe('calculateDiscount', () => {
  it('should give 5% discount for regular customers', () => {
    const order = { total: 500 };
    const customer = { tier: 'regular' };
    expect(calculateDiscount(order, customer)).toBe(25);
  });

  it('should give 15% discount for VIP customers', () => {
    const order = { total: 500 };
    const customer = { tier: 'vip' };
    expect(calculateDiscount(order, customer)).toBe(75);
  });

  it('should add 5% bonus for orders over $1000', () => {
    const order = { total: 1500 };
    const customer = { tier: 'regular' };
    expect(calculateDiscount(order, customer)).toBe(150);
  });

  it('should stack VIP discount with order bonus', () => {
    const order = { total: 1500 };
    const customer = { tier: 'vip' };
    expect(calculateDiscount(order, customer)).toBe(300);
  });

  it('should handle zero orders', () => {
    const order = { total: 0 };
    const customer = { tier: 'regular' };
    expect(calculateDiscount(order, customer)).toBe(0);
  });
});
```

### Test Data Generation

```typescript
// Generate test data factories
function generateFactory(modelName: string, fields: Field[]): string {
  return `
import { faker } from '@faker-js/faker';

export const ${modelName}Factory = {
  create(overrides: Partial<${modelName}> = {}): ${modelName} {
    return {
${fields.map(f => `      ${f.name}: ${getFakerForType(f.type)},`).join('\n')}
      ...overrides,
    };
  },

  createMany(count: number, overrides?: Partial<${modelName}>): ${modelName}[] {
    return Array.from({ length: count }, () => this.create(overrides));
  },
};
`;
}
```

## Documentation Generation

### From Code to Documentation

```markdown
# Prompt to generate docs from code:
Read this file: src/services/userService.ts

Generate documentation that includes:
1. Overview of what the service does
2. All public methods with signatures
3. Parameters and return types
4. Usage examples for each method
5. Error scenarios
6. Dependencies and requirements

Format as Markdown with proper code blocks.
```

### API Documentation

```markdown
# Generate OpenAPI spec from code:
Read all API routes in src/domains/*/api/**/*.ts

Generate an OpenAPI 3.0 spec that includes:
- All endpoints with methods
- Request schemas (from Zod validation)
- Response schemas
- Authentication requirements
- Error response formats
- Example requests/responses

Include:
- Tags for grouping by domain
- Descriptions for each endpoint
- Parameter descriptions
- Response codes and meanings
```

## Refactoring Assistance

### Code Improvement Prompts

```markdown
# Modernize Code
Review this code and suggest modern JavaScript/TypeScript improvements:

\`\`\`typescript
[PASTE CODE]
\`\`\`

Focus on:
- ES6+ features
- Async/await patterns
- Optional chaining
- Nullish coalescing
- Type safety improvements
- Performance optimizations

Provide before/after examples.
```

```markdown
# Apply SOLID Principles
Analyze this class for SOLID principle violations:

\`\`\`typescript
[PASTE CODE]
\`\`\`

Identify:
- Single Responsibility violations
- Open/Closed violations
- Liskov Substitution violations
- Interface Segregation violations
- Dependency Inversion violations

Provide refactored code with explanations.
```

### Performance Optimization

```markdown
# Optimize Performance
Analyze this function for performance issues:

\`\`\`typescript
[PASTE CODE]
\`\`\`

Identify:
- Unnecessary re-renders (React)
- Memory leaks
- Inefficient algorithms
- Missing memoization
- Database query issues

Provide optimized version with benchmarks.
```

## Multi-File Workflows

### Feature Scaffolding

```typescript
// Generate entire feature structure
const featureStructure = {
  'user-onboarding': {
    files: [
      'src/domains/users/onboarding/types.ts',
      'src/domains/users/onboarding/api/complete-onboarding.ts',
      'src/domains/users/onboarding/components/OnboardingWizard.tsx',
      'src/domains/users/onboarding/components/OnboardingStep.tsx',
      'src/domains/users/onboarding/hooks/useOnboarding.ts',
      'src/domains/users/onboarding/tests/onboarding.test.ts',
      'src/domains/users/onboarding/tests/onboardingWizard.test.tsx',
    ],
    prompts: {
      types: 'Generate TypeScript types for onboarding flow...',
      api: 'Create API route for completing onboarding...',
      components: 'Create onboarding wizard component...',
      hooks: 'Create custom hook for onboarding state...',
      tests: 'Generate comprehensive tests for onboarding...',
    }
  }
};

async function generateFeature(featureName: string) {
  const feature = featureStructure[featureName];

  for (const [file, prompt] of Object.entries(feature.prompts)) {
    const content = await callAI(prompt);
    await writeFile(file, content);
  }
}
```

## Validation Strategies

### Code Review Checklist

```markdown
# After AI generates code, verify:

## Correctness
- [ ] Code compiles without errors
- [ ] Logic is correct
- [ ] Edge cases handled
- [ ] Error handling present

## Quality
- [ ] Follows project conventions
- [ ] Proper typing (TypeScript)
- [ ] Clear variable names
- [ ] Appropriate comments

## Security
- [ ] No hardcoded secrets
- [ ] Input validation
- [ ] SQL injection prevention
- [ ] XSS prevention

## Testing
- [ ] Tests cover main flows
- [ ] Tests cover edge cases
- [ ] Tests are maintainable
- [ ] Mocking is appropriate

## Documentation
- [ ] Complex logic explained
- [ ] Public API documented
- [ ] Examples provided
```

### Automated Validation

```typescript
// Validate generated code
async function validateGeneratedCode(code: string, type: string) {
  const checks = {
    typescript: async () => {
      // Run TypeScript compiler
      const result = await exec('tsc --noEmit');
      return result.exitCode === 0;
    },

    lint: async () => {
      // Run ESLint
      const result = await exec('eslint --stdin', { input: code });
      return result.exitCode === 0;
    },

    format: async () => {
      // Check formatting
      const result = await exec('prettier --check stdin', { input: code });
      return result.exitCode === 0;
    },

    tests: async () => {
      // Run tests
      const result = await exec('vitest run');
      return result.exitCode === 0;
    }
  };

  const results = await Promise.all([
    checks.typescript(),
    checks.lint(),
    checks.format(),
  ]);

  return results.every(r => r);
}
```

## Best Practices

### Effective Prompts

1. **Be Specific**: Clearly state what you want
2. **Provide Context**: Give relevant background information
3. **Use Examples**: Show the style you want
4. **Set Constraints**: Define what not to do
5. **Iterate**: Refine prompts based on results
6. **Validate**: Always review generated code
7. **Test**: Ensure code works as expected

### Red Flags

- Generated code looks perfect (too good to be true)
- No error handling
- Missing edge cases
- Hardcoded values
- Inconsistent style
- Security vulnerabilities
- Performance issues
- Incomplete implementations

### Integration Workflow

1. **Generate**: Use AI to create initial code
2. **Review**: Carefully review the generated code
3. **Test**: Write and run tests
4. **Refine**: Make adjustments as needed
5. **Integrate**: Merge into codebase
6. **Monitor**: Watch for issues in production

## Tool-Specific Tips

### GitHub Copilot
- Use comments to guide suggestions
- Accept/reject suggestions inline
- Use Copilot Chat for explanations
- Leverage Copilot Labs for refactoring

### Cursor AI
- Use Cmd+K for inline edits
- Use Cmd+L for chat interface
- Reference files with @ symbol
- Use tabs for multi-file context

### Claude Code
- Provide file context with Read tool
- Use specific, detailed prompts
- Request explanations, not just code
- Iterate based on feedback

## Common Generation Patterns

### REST API Endpoint
```
Generate a Next.js 14 API route for [resource]
Include: list, get, create, update, delete
Use: Prisma, Zod validation, TypeScript
Add: Authentication, error handling, pagination
```

### React Component
```
Generate a React component for [feature]
Props: [list props]
State: [describe state]
Effects: [describe side effects]
Styling: Tailwind CSS
Include: Loading states, error handling, accessibility
```

### Database Model
```
Generate Prisma schema for [entity]
Fields: [list fields]
Include: Relations, indexes, constraints
Add: Timestamps, soft delete
Optimize for: [query patterns]
```

### Test Suite
```
Generate tests for [component/function]
Testing framework: Vitest/Jest
Include: Unit tests, edge cases, error scenarios
Mock: [list dependencies]
Coverage goal: 90%+
```
