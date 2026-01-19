---
name: code-generation
category: development-workflow/coding-assistance
version: 1.0.0
description: AI-assisted code generation workflows, prompting strategies, and best practices for working with Claude Code
author: blackbox5/core
verified: true
tags: [ai, generation, coding, claude, llm]
---

# AI-Assisted Code Generation

> Master the art of working with Claude Code to generate high-quality, production-ready code through effective prompting, iterative refinement, and systematic verification.

## Context

Code generation with AI represents a paradigm shift in software development. Rather than writing every character manually, developers work as orchestrators and editors, leveraging AI to:

- **Accelerate prototyping**: Generate functional code in minutes rather than hours
- **Explore alternatives**: Quickly test different approaches and patterns
- **Reduce boilerplate**: Automate repetitive code structures
- **Learn and discover**: See implementations of new libraries or patterns
- **Maintain flow**: Stay in the creative zone by reducing context switching

### When to Use AI Code Generation

**Ideal For:**
- New feature implementation with clear requirements
- Boilerplate code (components, CRUD operations, API endpoints)
- Test suite generation
- Data transformation and processing scripts
- Integration with new libraries or APIs
- Refactoring existing code to new patterns
- Documentation and comment generation
- Code translation between languages/frameworks

**Less Ideal For:**
- Highly performance-critical code requiring micro-optimizations
- Complex business logic with deep domain knowledge
- Security-sensitive operations (though AI can help review)
- Novel algorithms not well-represented in training data
- Code requiring specific organizational patterns not in context

### The AI-Developer Partnership

Effective code generation is a collaboration, not automation. The developer provides:
- **Context**: Requirements, constraints, existing codebase
- **Direction**: Architecture decisions, patterns, preferences
- **Verification**: Testing, code review, integration
- **Refinement**: Iteration on generated code

The AI provides:
- **Implementation**: Writing the actual code
- **Suggestions**: Alternative approaches and best practices
- **Explanation**: Why certain patterns were chosen
- **Completion**: Handling details and edge cases

## Instructions

### Effective Prompting Strategies

#### 1. Be Specific About Requirements

Bad: "Create a user component"

Good: "Create a React user profile component with:
- Avatar image (circular, 64px)
- User name (heading, truncate at 30 chars)
- Email (secondary text, truncate at 40 chars)
- Last active timestamp (relative time format)
- Click handler that accepts userId
- Responsive design (mobile-first)
- TypeScript with proper types
- Tailwind CSS for styling"

#### 2. Provide Context

Always include:
- **Framework and versions**: "React 18 with TypeScript"
- **Styling approach**: "Using Tailwind CSS v3"
- **State management**: "Context API with hooks"
- **Existing patterns**: "Following our component structure in src/components/ui/"
- **Dependencies**: "Using date-fns for date formatting"

#### 3. Specify Constraints

```markdown
Create an API client for our backend with these constraints:
- Must use fetch API (no axios)
- Implement exponential backoff for retries (max 3 attempts)
- Type-safe request/response using our existing API types
- Error handling that maps to our ErrorOr<T> pattern
- Include request timeout (default 10s)
- Support for request cancellation via AbortController
- Follow our existing service pattern in src/services/
```

#### 4. Reference Existing Code

When extending or modifying code, provide relevant context:

```markdown
Based on the TaskService implementation at src/services/task.service.ts:
1. Create a similar ProjectService
2. Use the same error handling pattern
3. Implement identical CRUD operations
4. Match the TypeScript interface structure
5. Use the same database client configuration
```

#### 5. Request Incremental Generation

For complex features, break into pieces:

```markdown
Phase 1: Create the base component structure
- Component skeleton with props interface
- Basic layout and styling
- Placeholder state management

Phase 2: Implement core functionality
- Add data fetching logic
- Implement user interactions
- Connect to state management

Phase 3: Add advanced features
- Implement filters and sorting
- Add pagination
- Include export functionality
```

#### 6. Specify Testing Requirements

```markdown
Generate the component with:
- Unit tests using React Testing Library
- Test coverage for all user interactions
- Mock implementations for API calls
- Edge case testing (loading, error, empty states)
- Accessibility tests (keyboard navigation, ARIA labels)
```

## Rules

### Code Verification

**Always verify generated code:**
1. **Syntax check**: Does it compile/lint without errors?
2. **Type safety**: Do TypeScript types align correctly?
3. **Imports**: Are all imports available and correctly resolved?
4. **Style consistency**: Does it match project conventions?
5. **Performance**: Are there obvious performance issues?
6. **Security**: Check for common vulnerabilities (XSS, injection, etc.)

### Security Requirements

**Never accept generated code without reviewing:**
- User input handling and sanitization
- Authentication and authorization checks
- API key and secret management
- SQL/NoSQL query construction
- File upload and validation
- Third-party library usage

**Security review checklist:**
- [ ] Inputs are validated and sanitized
- [ ] No hardcoded credentials or API keys
- [ ] Proper error handling (no information leakage)
- [ ] Rate limiting for API endpoints
- [ ] Proper authentication/authorization
- [ ] Dependencies are from trusted sources

### Testing Requirements

**Generated code must include:**
1. **Unit tests** for pure functions and business logic
2. **Integration tests** for API interactions
3. **Component tests** for UI components
4. **Edge case coverage** (empty states, nulls, errors)
5. **Performance tests** for critical paths

**Test quality standards:**
- Minimum 80% code coverage
- Test meaningful behavior, not implementation
- Include both positive and negative test cases
- Mock external dependencies appropriately

### Code Review Standards

Before integrating generated code, ensure:
- [ ] Code is readable and maintainable
- [ ] Proper error handling in place
- [ ] Logging is appropriate (not too much, not too little)
- [ ] Comments explain complex logic, not obvious code
- [ ] No code duplication (DRY principle)
- [ ] Follows SOLID principles

## Workflow

### Phase 1: Requirement Analysis

1. **Clarify the objective**
   - What problem are you solving?
   - What are the success criteria?
   - What are the constraints?

2. **Gather context**
   - What existing code is relevant?
   - What patterns should be followed?
   - What dependencies are available?

3. **Identify edge cases**
   - Error states
   - Empty/null inputs
   - Boundary conditions
   - Concurrency issues

### Phase 2: Prompt Design

1. **Structure your prompt**
   ```markdown
   # Context
   [Framework, patterns, constraints]

   # Requirements
   [Detailed feature specification]

   # Technical Details
   [Libraries, API contracts, data structures]

   # Output Format
   [Single file vs multiple, test requirements]

   # Examples
   [Reference to existing similar code]
   ```

2. **Include examples**
   - Show expected input/output
   - Reference similar existing implementations
   - Provide mock data if applicable

3. **Specify quality criteria**
   - Performance requirements
   - Error handling expectations
   - Testing requirements

### Phase 3: Generation

1. **Start with the core**
   - Generate the main functionality first
   - Get a working baseline before adding features

2. **Iterate incrementally**
   - Build complexity layer by layer
   - Test each layer before proceeding

3. **Handle feedback**
   - If the AI misunderstands, clarify and redirect
   - If code is incorrect, explain what's wrong
   - If better approaches exist, suggest them

### Phase 4: Review and Refine

1. **Static analysis**
   ```bash
   # Run linting
   npm run lint

   # Type checking
   npm run type-check

   # Format check
   npm run format:check
   ```

2. **Code review checklist**
   - [ ] Correct implementation of requirements
   - [ ] Appropriate error handling
   - [ ] Proper TypeScript types
   - [ ] Following project conventions
   - [ ] No security vulnerabilities
   - [ ] Adequate documentation

3. **Iterate if needed**
   - Request fixes for issues found
   - Refactor for better patterns
   - Optimize performance if needed

### Phase 5: Integration

1. **Add to codebase**
   - Place files in correct directory structure
   - Update imports and exports
   - Register components/routes if needed

2. **Update documentation**
   - Add inline comments for complex logic
   - Update README if adding new functionality
   - Document any new API contracts

3. **Team communication**
   - Create PR with clear description
   - Highlight AI-generated code
   - Note any areas needing human review

### Phase 6: Testing

1. **Run generated tests**
   ```bash
   # Unit tests
   npm run test:unit

   # Integration tests
   npm run test:integration

   # E2E tests
   npm run test:e2e
   ```

2. **Manual testing**
   - Test user flows in development
   - Verify edge cases
   - Check error handling

3. **Fix issues**
   - Address test failures
   - Fix bugs discovered during testing
   - Refactor if tests reveal design issues

## Best Practices

### Incremental Generation

**Generate in small, testable pieces:**

```markdown
# Don't: Generate entire application at once
"Create a full e-commerce site with cart, checkout, payments, admin panel, etc."

# Do: Build feature by feature
"Create a product listing component with:
- Product cards with image, title, price
- Grid layout (responsive)
- Add to cart button
- Loading and error states"
```

**Benefits:**
- Easier to verify correctness
- Faster iteration cycles
- Better understanding of generated code
- Earlier detection of misunderstandings

### Context Management

**Provide relevant context:**
- Show related files or patterns
- Explain the broader architecture
- Reference similar implementations
- Include data structures or interfaces

**Manage context window:**
- Start with essential context
- Add more detail if needed
- Use file references rather than copying large files
- Summarize when appropriate

### Verification Strategy

**Layered verification:**
1. **Quick scan**: Does it look right at a glance?
2. **Type check**: Do types align correctly?
3. **Logic review**: Does the logic make sense?
4. **Test execution**: Do tests pass?
5. **Integration**: Does it work in the application?

**Automated checks:**
```bash
# Run all quality checks
npm run verify

# Or individual checks
npm run lint
npm run type-check
npm run test
npm run build
```

### Pattern Consistency

**Match existing patterns:**
- Use same component structure
- Follow naming conventions
- Match error handling style
- Align with state management approach
- Use consistent import organization

### Documentation

**Document non-obvious code:**
```typescript
/**
 * Calculates the optimal retry delay using exponential backoff
 * with jitter to prevent thundering herd problems.
 *
 * Formula: base_delay * (2 ^ attempt) + random_jitter
 *
 * @param attempt - Current retry attempt (0-indexed)
 * @param baseDelay - Starting delay in milliseconds
 * @returns Delay in milliseconds before next retry
 */
function calculateRetryDelay(attempt: number, baseDelay: number): number {
  const exponentialDelay = baseDelay * Math.pow(2, attempt);
  const jitter = Math.random() * 1000; // Up to 1 second jitter
  return exponentialDelay + jitter;
}
```

## Anti-Patterns

### Blind Acceptance

**Problem**: Accepting AI-generated code without review

**Risks:**
- Security vulnerabilities
- Performance issues
- Incorrect business logic
- Maintenance nightmares

**Solution**: Always review, test, and verify

### Over-Promising

**Problem**: Requesting too much at once

**Example**: "Create a complete project management system"

**Solution**: Break into small, focused requests

### No Verification

**Problem**: Skipping testing phase

**Example**: Generating code and committing without testing

**Solution**: Run tests, lint, and type checking before committing

### Ignoring Context

**Problem**: Not providing enough context about codebase

**Example**: "Create a form" (without specifying form library, validation approach, etc.)

**Solution**: Always include framework, patterns, and relevant context

### Poor Prompting

**Problem**: Vague or ambiguous requests

**Example**: "Make it better" or "Fix the code"

**Solution**: Be specific about what you want changed

### Copy-Paste Mentality

**Problem**: Treating AI as copy-paste source without understanding

**Risks**:
- Can't maintain code you don't understand
- Miss learning opportunities
- Can't debug effectively

**Solution**: Read and understand generated code before using

### Over-Reliance

**Problem**: Using AI for trivial tasks or as crutch

**Example**: Asking AI to write simple functions or basic syntax

**Solution**: Use AI for complex tasks, learn the basics yourself

## Examples

### Example 1: React Component Generation

**Prompt:**
```markdown
Create a React component for displaying user avatars with the following specs:

Requirements:
- Display circular avatar image (64px diameter)
- Fallback to user initials if no image
- Show online status indicator (green dot)
- Tooltip with user name on hover
- Click handler that accepts onUserClick callback
- Loading state (skeleton)
- Error state (placeholder icon)

Technical:
- React 18 with TypeScript
- Tailwind CSS for styling
- Use our existing Tooltip component from @/components/ui/Tooltip
- Follow component pattern in @/components/ui/avatar/

Types:
interface User {
  id: string;
  name: string;
  avatarUrl?: string | null;
  isOnline: boolean;
}

interface UserAvatarProps {
  user: User;
  onUserClick?: (userId: string) => void;
  size?: 'sm' | 'md' | 'lg';
}

Include:
- Component file
- Unit tests with React Testing Library
- Storybook story if applicable
```

**Expected Output Structure:**
```
components/
  avatar/
    UserAvatar.tsx          # Main component
    UserAvatar.test.tsx     # Tests
    UserAvatar.stories.tsx  # Storybook
    index.ts                # Export
```

### Example 2: API Client Generation

**Prompt:**
```markdown
Generate a TypeScript API client for our projects endpoint based on this OpenAPI spec:

Endpoint: GET /api/projects
Query Params:
  - status: 'active' | 'archived' | 'all'
  - page: number
  - limit: number (default 20)
  - search: string (optional)

Response:
{
  projects: Array<{
    id: string;
    name: string;
    description: string;
    status: 'active' | 'archived';
    createdAt: string; // ISO date
    updatedAt: string; // ISO date
  }>;
  total: number;
  page: number;
  limit: number;
}

Requirements:
- Use fetch API (native, no axios)
- TypeScript with strict types
- Exponential backoff retry (max 3 attempts)
- Request timeout (10 seconds)
- AbortController support for cancellation
- Proper error handling with typed errors
- Return type: Promise<ProjectsResponse>

Error handling:
- Network errors: NetworkError
- Timeout: TimeoutError
- 4xx: ClientError with status code
- 5xx: ServerError with retry logic

Follow our service pattern:
- Class-based service
- Constructor accepts base URL and optional config
- Methods return typed responses
- Private methods for retries, timeouts, etc.

File location: src/services/projects/ProjectsService.ts
```

### Example 3: Test Generation

**Prompt:**
```markdown
Generate comprehensive tests for our TaskService class.

Context:
- Located at: src/services/task.service.ts
- Uses our TaskRepository for data access
- Implements CRUD operations for tasks
- Has business logic for task transitions (todo → in-progress → done)

Test requirements:
- Use Vitest as test runner
- Mock TaskRepository using vi.mock()
- Test suite should cover:

1. CRUD Operations:
   - createTask() with valid data
   - createTask() with invalid data (validation errors)
   - getTaskById() for existing and non-existent tasks
   - updateTask() partial updates
   - deleteTask() soft delete

2. Business Logic:
   - Task status transitions (valid and invalid)
   - Task assignment to users
   - Task completion with timestamps

3. Edge Cases:
   - Concurrent updates
   - Non-existent task operations
   - Invalid status transitions
   - Null/undefined inputs

4. Error Handling:
   - Repository errors are properly propagated
   - Validation errors are clear
   - Error messages are helpful

Each test should:
- Have clear descriptions
- Follow AAA pattern (Arrange, Act, Assert)
- Use descriptive test names
- Include setup/teardown if needed
- Test one thing per test

Generate test file at: src/services/task.service.test.ts
```

### Example 4: Boilerplate Generation

**Prompt:**
```markdown
Generate a complete Express.js API route module for managing "Clients" resources.

Pattern to follow: Similar to our existing routes at src/api/routes/projects.routes.ts

Requirements:
- Express router with TypeScript
- Routes: GET /, GET /:id, POST /, PUT /:id, DELETE /:id
- Input validation using express-validator
- Error handling middleware
- Async error wrapping
- Route protection with auth middleware

Endpoints:
1. GET /clients
   - Query: status, page, limit, search
   - Returns paginated client list
   - Requires: authentication

2. GET /clients/:id
   - Returns single client by ID
   - 404 if not found
   - Requires: authentication

3. POST /clients
   - Body: name, email, company, status
   - Validation: required fields, email format
   - Returns created client
   - Requires: authentication + admin role

4. PUT /clients/:id
   - Body: partial client update
   - Returns updated client
   - 404 if not found
   - Requires: authentication + admin role

5. DELETE /clients/:id
   - Soft delete
   - Returns 204 on success
   - 404 if not found
   - Requires: authentication + admin role

Validation rules:
- name: required, string, 3-100 chars
- email: required, valid email format
- company: optional, string, max 100 chars
- status: optional, enum ['active', 'inactive', 'pending']

Include:
- Route file: src/api/routes/clients.routes.ts
- Types: src/api/types/clients.types.ts
- Validators: src/api/validators/clients.validator.ts
- Controller stub: src/api/controllers/clients.controller.ts
```

## Integration Notes

### Working with Claude Code

**Claude Code-specific considerations:**

1. **Context awareness**
   - Claude Code has access to your file system
   - Can read existing code for context
   - Use file paths rather than copying code

2. **Tool usage**
   - Claude Code can run bash commands
   - Can execute tests, linters, build tools
   - Leverage this for verification

3. **Interactive development**
   - Can iterate on code in real-time
   - Get immediate feedback on changes
   - Use conversation to refine requirements

4. **File operations**
   - Can read, write, and edit files
   - Can create new files
   - Can modify existing files

**Best workflow with Claude Code:**
1. Start with a clear description of what you want
2. Let Claude Code read relevant existing files
3. Review generated code together
4. Ask for explanations of complex parts
5. Request changes or iterations
6. Run tests through Claude Code
7. Make final adjustments based on results

### Prompt Templates

**Component Generation Template:**
```markdown
Create a [COMPONENT_TYPE] component with:
- Purpose: [WHAT IT DOES]
- Props: [PROPS_INTERFACE]
- State: [STATE_NEEDED]
- Styling: [CSS_APPROACH]
- Framework: [FRAMEWORK_VERSION]

Features:
- [FEATURE_1]
- [FEATURE_2]

Follow pattern in: [REFERENCE_FILE_PATH]
```

**API Client Template:**
```markdown
Generate an API client for [RESOURCE_NAME]:

Endpoint details:
- Method: [HTTP_METHOD]
- Path: [API_PATH]
- Auth: [AUTH_TYPE]
- Request: [REQUEST_BODY]
- Response: [RESPONSE_BODY]

Requirements:
- Error handling: [ERROR_STRATEGY]
- Retry logic: [RETRY_CONFIG]
- Timeout: [TIMEOUT_MS]

Output: [FILE_PATH]
```

**Test Generation Template:**
```markdown
Generate tests for [COMPONENT/SERVICE]:

File location: [FILE_PATH]

Test coverage needed:
- [SCENARIO_1]
- [SCENARIO_2]
- [SCENARIO_3]

Use: [TEST_FRAMEWORK]
Mock: [MOCK_STRATEGY]
```

## Error Handling

### Common Issues

**1. Hallucinations**

AI may generate code that looks correct but doesn't exist or work.

Signs:
- Importing non-existent libraries
- Using API methods that don't exist
- Referencing undefined variables

Solutions:
- Verify all imports exist
- Check library documentation
- Run type checker/linter
- Test in isolated environment first

**2. Syntax Errors**

Even with AI, syntax errors can occur.

Detection:
- Linter errors
- Compiler errors
- Type checking failures

Solutions:
- Run linter before committing
- Use IDE syntax highlighting
- Enable auto-format on save

**3. Logic Bugs**

Code may compile but not work as intended.

Detection:
- Unit test failures
- Unexpected behavior in manual testing
- Edge cases not handled

Solutions:
- Comprehensive test coverage
- Code review focusing on logic
- Manual testing of edge cases

**4. Type Mismatches**

TypeScript types may not align correctly.

Detection:
- TypeScript compiler errors
- 'any' type usage (anti-pattern)
- Type assertions needed

Solutions:
- Strict TypeScript mode
- No 'any' types without justification
- Proper type inference

**5. Performance Issues**

Generated code may not be optimized.

Detection:
- Slow rendering in components
- Memory leaks
- Unnecessary re-renders

Solutions:
- Performance profiling
- Code review for optimization opportunities
- Load testing for APIs

### Recovery Strategies

**When code generation fails:**

1. **Clarify requirements**
   - Be more specific
   - Provide examples
   - Reference existing patterns

2. **Simplify request**
   - Break into smaller pieces
   - Focus on core functionality first
   - Add complexity incrementally

3. **Provide more context**
   - Show related code
   - Explain the architecture
   - Include data structures

4. **Change approach**
   - Try different prompting strategy
   - Ask for explanation first, then code
   - Request pseudocode before implementation

## Output Format

### Generated Code Structure

**Standard format for AI-generated code:**

```typescript
// ============================================================================
// ComponentName.tsx
// ============================================================================
// Description: Brief description of what this component does
// Author: AI-generated (reviewed by [Your Name])
// Created: [Date]
// ============================================================================

/**
 * Detailed component description including:
 * - Purpose and functionality
 * - Props and their usage
 * - State management approach
 * - Dependencies
 */

// Imports organized by type
import React, { useState, useCallback } from 'react';
import { SomeType } from '@/types';
import { SomeComponent } from '@/components';
import { someHelper } from '@/utils';

// ============================================================================
// Types
// ============================================================================

interface ComponentProps {
  /** Description of prop1 */
  prop1: string;
  /** Description of prop2 */
  prop2?: number;
}

interface ComponentState {
  /** Description of state field */
  field: string;
}

// ============================================================================
// Component
// ============================================================================

export const ComponentName: React.FC<ComponentProps> = ({
  prop1,
  prop2
}) => {
  // State
  const [state, setState] = useState<ComponentState>({ field: '' });

  // Handlers
  const handleClick = useCallback(() => {
    // Implementation
  }, []);

  // Effects
  React.useEffect(() => {
    // Side effects
  }, []);

  // Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
};

export default ComponentName;
```

### Code Explanations

**Include explanations for:**
1. **Why** certain patterns were chosen
2. **How** complex logic works
3. **Trade-offs** considered
4. **Alternatives** not chosen (and why)
5. **Dependencies** and why they're needed
6. **Testing strategy** and what's covered

**Example explanation format:**
```typescript
/**
 * Implements exponential backoff with jitter for retry logic.
 *
 * Why exponential backoff?
 * - Prevents overwhelming the server during outages
 * - Standard pattern for distributed systems
 * - Provides increasing delays between retries
 *
 * Why jitter?
 * - Prevents "thundering herd" problem
 * - Adds randomness to distribute retry attempts
 * - Improves system resilience under load
 *
 * Alternative considered: Fixed delay
 * Rejected because: Doesn't adapt to server load
 */
```

## Related Skills

- **test-driven-development**: Writing tests alongside code
- **refactoring**: Improving code structure after generation
- **code-review**: Reviewing AI-generated code effectively
- **debugging**: Troubleshooting generated code
- **documentation**: Documenting AI-generated functionality

## See Also

### Prompt Engineering Resources

- [Anthropic's Prompt Engineering Guide](https://docs.anthropic.com/claude/docs/prompt-engineering)
- [OpenAI's Prompt Design Best Practices](https://platform.openai.com/docs/guides/prompt-engineering)

### Code Quality Resources

- [Clean Code principles](https://github.com/ryanmcdermott/clean-code-javascript)
- [You Don't Know JS (book series)](https://github.com/getify/You-Dont-Know-JS)
- [React Testing Library documentation](https://testing-library.com/docs/react-testing-library/intro/)

### AI Code Generation Tools

- [Claude Code documentation](https://claude.ai/code)
- [GitHub Copilot documentation](https://docs.github.com/en/copilot)
- [Cursor AI documentation](https://cursor.sh/docs)

---

**Version History:**
- v1.0.0 (2025-01-18): Initial skill definition for AI-assisted code generation workflows

**Maintainers:**
- blackbox5/core team

**Feedback:**
For improvements or issues with this skill, please refer to the main Agent OS documentation or contact the core team.
