---
name: integration-testing
category: development-workflow/testing-quality
version: 1.0.0
description: Integration testing patterns, strategies for testing component interactions, and managing test dependencies
author: blackbox5/core
verified: true
tags: [testing, integration, api, database, mocking]
---

<integration-testing-skill>
  <metadata>
    <skill_name>integration-testing</skill_name>
    <category>development-workflow/testing-quality</category>
    <version>1.0.0</version>
    <last_updated>2025-01-18</last_updated>
    <status>production-ready</status>
  </metadata>

  <!-- =======================================================================
       CONTEXT: Understanding Integration Testing
       ======================================================================= -->

  <context>
    <section title="What is Integration Testing?">
      <description>
        Integration testing verifies that different modules or services work together
        correctly. It sits between unit testing (individual components) and end-to-end
        testing (full system workflows) in the testing pyramid.
      </description>

      <key_concepts>
        <concept>
          <name>Testing Pyramid</name>
          <definition>
            - **Unit Tests (70%)**: Fast, isolated tests of individual functions/components
            - **Integration Tests (20%)**: Tests of component interactions and interfaces
            - **E2E Tests (10%)**: Full system workflow tests through the UI
          </definition>
        </concept>

        <concept>
          <name>Test Scope</name>
          <definition>
            Integration tests focus on:
            - API endpoints and their database interactions
            - Service layer and external API integrations
            - Component communication and data flow
            - Boundary interactions between modules
          </definition>
        </concept>

        <concept>
          <name>Real vs Mocked</name>
          <definition>
            Integration tests use real implementations of some components while
            mocking external dependencies (payment gateways, third-party APIs)
            to ensure tests are fast and reliable.
          </definition>
        </concept>
      </key_concepts>

      <when_to_use>
        <scenario>Testing API endpoints with database interactions</scenario>
        <scenario>Verifying service integration with external APIs</scenario>
        <scenario>Testing component communication in a module</scenario>
        <scenario>Validating data flow through the application</scenario>
        <scenario>Testing database queries and transactions</scenario>
        <scenario>Verifying authentication and authorization flows</scenario>
      </when_to_use>
    </section>
  </context>

  <!-- =======================================================================
       INSTRUCTIONS: How to Design Integration Tests
       ======================================================================= -->

  <instructions>
    <section title="Design Principles">
      <principle>
        <title>Test Behavior, Not Implementation</title>
        <guidance>
          Focus on what the system should do, not how it achieves it. Tests should
          verify that given valid input, the system produces the expected output
          and maintains the expected state.
        </guidance>
      </principle>

      <principle>
        <title>Arrange-Act-Assert (AAA) Pattern</title>
        <guidance>
          Structure each test into three clear phases:
          1. **Arrange**: Set up test data, configure mocks, initialize the system
          2. **Act**: Execute the function or endpoint being tested
          3. **Assert**: Verify the expected outcome and state changes
        </guidance>
      </principle>

      <principle>
        <title>One Assertion Per Test</title>
        <guidance>
          Each test should verify one specific behavior. Multiple assertions are
          acceptable if they verify different aspects of the same behavior.
        </guidance>
      </principle>

      <principle>
        <title>Test Independence</title>
        <guidance>
          Tests must not depend on each other. Each test should set up its own
          data and clean up after itself. Tests should be able to run in any order.
        </guidance>
      </principle>
    </section>

    <section title="Test Design Workflow">
      <step>
        <number>1</number>
        <title>Identify Integration Points</title>
        <description>
          Map out where components interact: API-to-database, service-to-service,
          component-to-component, or application-to-external-API.
        </description>
      </step>

      <step>
        <number>2</number>
        <title>Define Test Scenarios</title>
        <description>
          For each integration point, define:
          - Happy path: Normal operation succeeds
          - Edge cases: Boundary conditions, empty data
          - Error cases: Invalid input, service failures
        </description>
      </step>

      <step>
        <number>3</number>
        <title>Set Up Test Environment</title>
        <description>
          Configure a test database, mock external services, and set up test data
          fixtures that can be reliably recreated for each test run.
        </description>
      </step>

      <step>
        <number>4</number>
        <title>Write the Test</title>
        <description>
          Implement the test following the AAA pattern, using clear test names
          that describe what is being tested and what the expected outcome is.
        </description>
      </step>

      <step>
        <number>5</number>
        <title>Run and Refine</title>
        <description>
          Execute the test, verify it passes, and refactor for clarity and
          maintainability. Ensure tests run quickly.
        </description>
      </step>
    </section>
  </instructions>

  <!-- =======================================================================
       RULES: Integration Testing Rules
       ======================================================================= -->

  <rules>
    <section title="Core Rules">
      <rule>
        <name>Test Isolation</name>
        <description>Each test must be completely independent</description>
        <implementation>
          - Use a fresh database transaction for each test
          - Roll back transactions after each test
          - Never share state between tests
          - Don't rely on tests running in a specific order
        </implementation>
        <consequence>Violations lead to flaky tests that pass/fail unpredictably</consequence>
      </rule>

      <rule>
        <name>Deterministic Outcomes</name>
        <description>Tests must produce the same result on every run</description>
        <implementation>
          - Avoid random data in tests (use seeded data)
          - Mock date/time functions for consistent timestamps
          - Control all external dependencies
          - Avoid race conditions with proper async handling
        </implementation>
        <consequence>Non-deterministic tests are unreliable and should be fixed immediately</consequence>
      </rule>

      <rule>
        <name>Fixture Management</name>
        <description>Use fixtures for consistent test data</description>
        <implementation>
          - Create reusable fixture factories
          - Use meaningful test data that reflects production
          - Clean up fixtures after each test
          - Version fixtures to prevent breaking changes
        </implementation>
        <consequence>Poor fixture management leads to brittle, hard-to-maintain tests</consequence>
      </rule>

      <rule>
        <name>Speed Requirements</name>
        <description>Integration tests should complete in seconds, not minutes</description>
        <implementation>
          - Use in-memory databases when possible
          - Mock slow external services
          - Parallelize independent tests
          - Avoid unnecessary setup/teardown
        </implementation>
        <consequence>Slow tests discourage running them frequently and slow down development</consequence>
      </rule>

      <rule>
        <name>Clear Test Names</name>
        <description>Test names must clearly describe what is being tested</description>
        <implementation>
          - Use naming convention: should[ExpectedBehavior]When[StateUnderTest]
          - Include the scenario and expected outcome
          - Avoid technical jargon in test names
          - Keep names under 100 characters
        </implementation>
        <consequence>Unclear test names make debugging and maintenance difficult</consequence>
      </rule>

      <rule>
        <name>Minimal Mocking</name>
        <description>Only mock external dependencies and slow services</description>
        <implementation>
          - Test real database interactions
          - Test real service logic
          - Mock only third-party APIs
          - Mock file system operations
          - Mock time-dependent functions
        </implementation>
        <consequence>Over-mocking leads to tests that pass but production code fails</consequence>
      </rule>
    </section>
  </rules>

  <!-- =======================================================================
       WORKFLOW: Integration Testing Workflow
       ======================================================================= -->

  <workflow>
    <phase>
      <name>Test Design</name>
      <duration>Varies by complexity</duration>
      <steps>
        <step>
          <title>Identify Integration Points</title>
          <actions>
            <action>Review the system architecture for component boundaries</action>
            <action>Map data flow between services</action>
            <action>Identify external API integrations</action>
            <action>List database interactions</action>
          </actions>
          <deliverables>Integration test plan with scenarios</deliverables>
        </step>

        <step>
          <title>Design Test Scenarios</title>
          <actions>
            <action>Define happy path scenarios</action>
            <action>Define error handling scenarios</action>
            <action>Define edge cases</action>
            <action>Identify test data requirements</action>
          </actions>
          <deliverables>Test case documentation</deliverables>
        </step>
      </steps>
    </phase>

    <phase>
      <name>Setup</name>
      <duration>One-time setup, ongoing maintenance</duration>
      <steps>
        <step>
          <title>Configure Test Environment</title>
          <actions>
            <action>Set up test database (PostgreSQL, MySQL, SQLite, etc.)</action>
            <action>Configure environment variables for testing</action>
            <action>Set up test fixtures and seed data</action>
            <action>Configure mock servers for external APIs</action>
          </actions>
          <deliverables>Configured test environment</deliverables>
        </step>

        <step>
          <title>Create Test Utilities</title>
          <actions>
            <action>Build fixture factories</action>
            <action>Create helper functions for common test operations</action>
            <action>Set up test database utilities (seed, clean, migrate)</action>
            <action>Create assertion helpers</action>
          </actions>
          <deliverables>Reusable test utilities module</deliverables>
        </step>
      </steps>
    </phase>

    <phase>
      <name>Execution</name>
      <duration>Ongoing during development</duration>
      <steps>
        <step>
          <title>Write Tests</title>
          <actions>
            <action>Implement test cases following AAA pattern</action>
            <action>Use descriptive test names</action>
            <action>Include assertions for expected behavior</action>
            <action>Handle async operations properly</action>
          </actions>
          <deliverables>Integration test suite</deliverables>
        </step>

        <step>
          <title>Run Tests Locally</title>
          <actions>
            <action>Execute tests during development</action>
            <action>Verify tests pass before committing</action>
            <action>Debug failing tests immediately</action>
            <action>Ensure tests run quickly</action>
          </actions>
          <deliverables>Passing test suite</deliverables>
        </step>
      </steps>
    </phase>

    <phase>
      <name>Teardown</name>
      <duration>Automatic after each test run</duration>
      <steps>
        <step>
          <title>Clean Test Data</title>
          <actions>
            <action>Rollback database transactions</action>
            <action>Clear test files and temporary data</action>
            <action>Reset mock servers</action>
            <action>Close database connections</action>
          </actions>
          <deliverables>Clean test environment for next run</deliverables>
        </step>
      </steps>
    </phase>

    <phase>
      <name>Maintenance</name>
      <duration>Ongoing</duration>
      <steps>
        <step>
          <title>Keep Tests Updated</title>
          <actions>
            <action>Update tests when code changes</action>
            <action>Fix flaky tests immediately</action>
            <action>Refactor tests for clarity</action>
            <action>Remove obsolete tests</action>
          </actions>
          <deliverables>Reliable, up-to-date test suite</deliverables>
        </step>

        <step>
          <title>Monitor Test Performance</title>
          <actions>
            <action>Track test execution time</action>
            <action>Identify and optimize slow tests</action>
            <action>Parallelize independent tests</action>
            <action>Review test coverage regularly</action>
          </actions>
          <deliverables>Fast, reliable test suite</deliverables>
        </step>
      </steps>
    </phase>
  </workflow>

  <!-- =======================================================================
       BEST PRACTICES: Integration Testing Best Practices
       ======================================================================= -->

  <best_practices>
    <section title="Testing Boundaries">
      <practice>
        <title>Test Public Interfaces</title>
        <description>
          Focus on testing public APIs and interfaces rather than internal
          implementation details. This makes tests more resilient to refactoring.
        </description>
        <example>
          Test API endpoints rather than internal functions. Test service methods
          rather than helper functions.
        </example>
      </practice>

      <practice>
        <title>Use Test Databases</title>
        <description>
          Use a dedicated test database that matches your production database
          schema. This ensures tests catch real database issues.
        </description>
        <example>
          Use PostgreSQL for testing if you use PostgreSQL in production.
          Avoid SQLite for testing if you use MySQL in production.
        </example>
      </practice>

      <practice>
        <title>Contract Testing</title>
        <description>
          When testing microservices, use contract testing to verify that
          services agree on their API contracts. This prevents integration issues.
        </description>
        <example>
          Use tools like Pact for consumer-driven contract testing.
          Define and verify API contracts between services.
        </example>
      </practice>

      <practice>
        <title>Test Data Management</title>
        <description>
          Use factories and fixtures to create test data. Avoid hardcoding
          test data in tests. Use meaningful data that reflects production.
        </description>
        <example>
          Use factory libraries like factory_bot (Ruby), factory_boy (Python),
          or build custom fixture factories.
        </example>
      </practice>

      <practice>
        <title>Transaction Rollback</title>
        <description>
          Use database transactions for each test and roll back at the end.
          This is faster than truncating tables and ensures clean state.
        </description>
        <example>
          Begin transaction before test, roll back after test.
          Avoid DROP/DELETE operations in favor of rollbacks.
        </example>
      </practice>

      <practice>
        <title>Parallel Test Execution</title>
        <description>
          Design tests to run in parallel. This requires proper test isolation
          and avoiding shared resources.
        </description>
        <example>
          Use Jest's parallel execution, pytest-xdist, or similar tools.
          Ensure each test uses unique data to avoid conflicts.
        </example>
      </practice>

      <practice>
        <title>Mock External Services</title>
        <description>
          Always mock external services like payment gateways, email services,
          and third-party APIs. This keeps tests fast and reliable.
        </description>
        <example>
          Use libraries like nock, sinon, or mock-server to mock HTTP requests.
          Verify requests are made with correct parameters.
        </example>
      </practice>

      <practice>
        <title>Test Error Handling</title>
        <description>
          Don't just test happy paths. Test error scenarios like network failures,
          invalid input, and service unavailability.
        </description>
        <example>
          Test 404 responses, validation errors, timeouts, and rate limiting.
          Verify error messages are helpful and appropriate.
        </example>
      </practice>

      <practice>
        <title>Use Test Coverage Wisely</title>
        <description>
          Aim for high coverage but don't obsess over 100%. Focus on covering
          critical paths and edge cases.
        </description>
        <example>
          Prioritize coverage of business logic, error handling, and edge cases.
          Don't count auto-generated code or simple getters/setters.
        </example>
      </practice>

      <practice>
        <title>Document Complex Tests</title>
        <description>
          Add comments to explain complex test scenarios or non-obvious assertions.
          Keep tests self-documenting with clear names and structure.
        </description>
        <example>
          Add comments explaining why a specific assertion is necessary.
          Document business rules that are being tested.
        </example>
      </practice>
    </section>
  </best_practices>

  <!-- =======================================================================
       ANTI_PATTERNS: Common Integration Testing Anti-Patterns
       ======================================================================= -->

  <anti_patterns>
    <anti_pattern>
      <name>Flaky Tests</name>
      <description>
        Tests that sometimes pass and sometimes fail without code changes.
        These destroy trust in the test suite.
      </description>
      <causes>
        <cause>Race conditions in async operations</cause>
        <cause>Non-deterministic test data (random values, timestamps)</cause>
        <cause>Shared state between tests</cause>
        <cause>Dependency on external services</cause>
        <cause>Improper cleanup of test data</cause>
      </causes>
      <solution>
        - Use proper async/await patterns
        - Seed random data for reproducibility
        - Ensure complete test isolation
        - Mock all external dependencies
        - Always clean up after tests
      </solution>
    </anti_pattern>

    <anti_pattern>
      <name>External Dependencies</name>
      <description>
        Tests that depend on external services like databases, APIs, or file
        systems that aren't properly controlled.
      </description>
      <causes>
        <cause>Testing against production database</cause>
        <cause>Calling real external APIs</cause>
        <cause>Reading/writing to real file system</cause>
        <cause>Dependence on network connectivity</cause>
      </causes>
      <solution>
        - Use dedicated test databases
        - Mock external API calls
        - Use temporary file systems or mocks
        - Make tests runnable offline
      </solution>
    </anti_pattern>

    <anti_pattern>
      <name>Slow Tests</name>
      <description>
        Integration tests that take minutes to run, discouraging frequent
        execution and slowing down development.
      </description>
      <causes>
        <cause>Not using in-memory database</cause>
        <cause>Excessive database setup/teardown</cause>
        <cause>Real HTTP calls to APIs</cause>
        <cause>Sleep statements instead of proper async handling</cause>
        <cause>Large test fixtures</cause>
      </causes>
      <solution>
        - Use in-memory SQLite for testing when possible
        - Use transaction rollbacks instead of cleanup
        - Mock all HTTP calls
        - Use proper async/await, avoid sleep
        - Keep fixtures minimal
      </solution>
    </anti_pattern>

    <anti_pattern>
      <name>Over-Mocking</name>
      <description>
        Mocking too much leads to tests that pass but production code fails.
        You're testing the mocks, not the real code.
      </description>
      <causes>
        <cause>Mocking database queries</cause>
        <cause>Mocking service methods</cause>
        <cause>Mocking internal logic</cause>
      </causes>
      <solution>
        - Test real database interactions
        - Test real service logic
        - Only mock external dependencies
        - Only mock slow operations
      </solution>
    </anti_pattern>

    <anti_pattern>
      <name>Testing Implementation Details</name>
      <description>
        Tests that break when code is refactored, even if behavior is unchanged.
        This makes refactoring dangerous.
      </description>
      <causes>
        <cause>Testing private methods</cause>
        <cause>Testing internal functions</cause>
        <cause>Asserting on specific implementation steps</cause>
      </causes>
      <solution>
        - Test public interfaces only
        - Test behavior, not implementation
        - Focus on inputs and outputs
      </solution>
    </anti_pattern>

    <anti_pattern>
      <name>Shared Test State</name>
      <description>
        Tests that depend on data created by previous tests. This makes tests
        fragile and order-dependent.
      </description>
      <causes>
        <cause>Not cleaning up after tests</cause>
        <cause>Using global test fixtures</cause>
        <cause>Tests relying on specific execution order</cause>
      </causes>
      <solution>
        - Each test creates its own data
        - Use database transactions and rollback
        - Make tests independent of order
        - Run tests in random order to catch issues
      </solution>
    </anti_pattern>

    <anti_pattern>
      <name>Asserting on Everything</name>
      <description>
        Tests with dozens of assertions that test too many things at once.
        When one assertion fails, you don't know what broke.
      </description>
      <causes>
        <cause>Testing multiple behaviors in one test</cause>
        <cause>Asserting on every field in a response</cause>
        <cause>Testing implementation details</cause>
      </causes>
      <solution>
        - One behavior per test
        - Assert only on critical fields
        - Split large tests into smaller ones
      </solution>
    </anti_pattern>
  </anti_patterns>

  <!-- =======================================================================
       EXAMPLES: Integration Testing Examples
       ======================================================================= -->

  <examples>
    <section title="API Integration Test (Node.js/Jest/Supertest)">
      <description>
        Testing a REST API endpoint with real database integration.
      </description>
      <code language="typescript">
```typescript
import request from 'supertest';
import { app } from '../app';
import { Database } from '../database';
import { createUser, truncateTables } from './fixtures';

describe('POST /api/users', () => {
  let db: Database;

  beforeAll(async () => {
    // Set up test database
    db = new Database(process.env.TEST_DATABASE_URL);
    await db.migrate();
  });

  beforeEach(async () => {
    // Begin transaction before each test
    await db.transaction();
  });

  afterEach(async () => {
    // Rollback transaction after each test
    await db.rollback();
  });

  afterAll(async () => {
    // Close database connection
    await db.close();
  });

  it('should create a new user with valid data', async () => {
    // Arrange
    const userData = {
      email: 'test@example.com',
      password: 'SecurePassword123!',
      name: 'Test User'
    };

    // Act
    const response = await request(app)
      .post('/api/users')
      .send(userData)
      .expect(201);

    // Assert
    expect(response.body).toMatchObject({
      id: expect.any(String),
      email: userData.email,
      name: userData.name
    });
    expect(response.body).not.toHaveProperty('password');

    // Verify user was created in database
    const user = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [userData.email]
    );
    expect(user).toHaveLength(1);
    expect(user[0].email).toBe(userData.email);
  });

  it('should return 400 for duplicate email', async () => {
    // Arrange
    const existingUser = await createUser(db, {
      email: 'existing@example.com'
    });

    const duplicateData = {
      email: 'existing@example.com',
      password: 'SecurePassword123!',
      name: 'Another User'
    };

    // Act
    const response = await request(app)
      .post('/api/users')
      .send(duplicateData)
      .expect(400);

    // Assert
    expect(response.body).toMatchObject({
      error: 'Email already exists'
    });
  });

  it('should return 422 for invalid email format', async () => {
    // Arrange
    const invalidData = {
      email: 'not-an-email',
      password: 'SecurePassword123!',
      name: 'Test User'
    };

    // Act
    const response = await request(app)
      .post('/api/users')
      .send(invalidData)
      .expect(422);

    // Assert
    expect(response.body).toMatchObject({
      error: expect.stringContaining('email')
    });
  });
});
```
      </code>
    </section>

    <section title="Database Integration Test (Node.js/PostgreSQL)">
      <description>
        Testing database operations and queries.
      </description>
      <code language="typescript">
```typescript
import { Pool } from 'pg';
import { UserService } from '../UserService';

describe('UserService Database Integration', () => {
  let pool: Pool;
  let userService: UserService;

  beforeAll(async () => {
    // Set up test database connection
    pool = new Pool({
      connectionString: process.env.TEST_DATABASE_URL
    });
    userService = new UserService(pool);
  });

  beforeEach(async () => {
    // Begin transaction
    await pool.query('BEGIN');
  });

  afterEach(async () => {
    // Rollback transaction
    await pool.query('ROLLBACK');
  });

  afterAll(async () => {
    // Close connection
    await pool.end();
  });

  describe('createUser', () => {
    it('should insert user and return created record', async () => {
      // Arrange
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        age: 30
      };

      // Act
      const user = await userService.createUser(userData);

      // Assert
      expect(user).toMatchObject({
        id: expect.any(Number),
        email: userData.email,
        name: userData.name,
        age: userData.age,
        created_at: expect.any(Date)
      });

      // Verify user exists in database
      const result = await pool.query(
        'SELECT * FROM users WHERE id = $1',
        [user.id]
      );
      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].email).toBe(userData.email);
    });

    it('should enforce unique email constraint', async () => {
      // Arrange
      const userData = {
        email: 'test@example.com',
        name: 'Test User'
      };

      await userService.createUser(userData);

      // Act & Assert
      await expect(
        userService.createUser(userData)
      ).rejects.toThrow('duplicate key value');
    });
  });

  describe('getUserByEmail', () => {
    it('should return user when email exists', async () => {
      // Arrange
      const userData = {
        email: 'test@example.com',
        name: 'Test User'
      };
      await userService.createUser(userData);

      // Act
      const user = await userService.getUserByEmail(userData.email);

      // Assert
      expect(user).toMatchObject({
        email: userData.email,
        name: userData.name
      });
    });

    it('should return null when email does not exist', async () => {
      // Act
      const user = await userService.getUserByEmail('nonexistent@example.com');

      // Assert
      expect(user).toBeNull();
    });
  });

  describe('updateUser', () => {
    it('should update user fields', async () => {
      // Arrange
      const user = await userService.createUser({
        email: 'test@example.com',
        name: 'Test User'
      });

      // Act
      const updatedUser = await userService.updateUser(user.id, {
        name: 'Updated Name'
      });

      // Assert
      expect(updatedUser.name).toBe('Updated Name');
      expect(updatedUser.email).toBe('test@example.com'); // Unchanged
    });

    it('should return null for non-existent user', async () => {
      // Act
      const result = await userService.updateUser(99999, {
        name: 'Updated Name'
      });

      // Assert
      expect(result).toBeNull();
    });
  });
});
```
      </code>
    </section>

    <section title="Service Integration Test (Node.js/Express)">
      <description>
        Testing service layer with external API mocking.
      </description>
      <code language="typescript">
```typescript
import nock from 'nock';
import { PaymentService } from '../PaymentService';

describe('PaymentService Integration', () => {
  let paymentService: PaymentService;

  beforeEach(() => {
    paymentService = new PaymentService(process.env.STRIPE_SECRET_KEY);
  });

  afterEach(() => {
    nock.cleanAll();
  });

  describe('createPaymentIntent', () => {
    it('should create payment intent via Stripe API', async () => {
      // Arrange - Mock Stripe API
      const mockPaymentIntent = {
        id: 'pi_1234567890',
        amount: 2000,
        currency: 'usd',
        status: 'requires_payment_method'
      };

      nock('https://api.stripe.com')
        .post('/v1/payment_intents')
        .reply(200, mockPaymentIntent);

      // Act
      const result = await paymentService.createPaymentIntent({
        amount: 2000,
        currency: 'usd'
      });

      // Assert
      expect(result).toMatchObject({
        id: 'pi_1234567890',
        amount: 2000,
        currency: 'usd',
        status: 'requires_payment_method'
      });
    });

    it('should handle Stripe API errors', async () => {
      // Arrange - Mock Stripe API error
      nock('https://api.stripe.com')
        .post('/v1/payment_intents')
        .reply(400, {
          error: {
            message: 'Invalid amount',
            type: 'invalid_request_error'
          }
        });

      // Act & Assert
      await expect(
        paymentService.createPaymentIntent({
          amount: -100,
          currency: 'usd'
        })
      ).rejects.toThrow('Invalid amount');
    });

    it('should handle network errors', async () => {
      // Arrange - Mock network error
      nock('https://api.stripe.com')
        .post('/v1/payment_intents')
        .replyWithError('Network error');

      // Act & Assert
      await expect(
        paymentService.createPaymentIntent({
          amount: 2000,
          currency: 'usd'
        })
      ).rejects.toThrow('Network error');
    });
  });

  describe('refundPayment', () => {
    it('should refund payment and update database', async () => {
      // Arrange
      const mockRefund = {
        id: 're_1234567890',
        amount: 2000,
        status: 'succeeded'
      };

      nock('https://api.stripe.com')
        .post('/v1/refunds')
        .reply(200, mockRefund);

      // Create a payment record in database
      const payment = await paymentService.createPaymentRecord({
        amount: 2000,
        stripe_id: 'pi_1234567890'
      });

      // Act
      const refund = await paymentService.refundPayment(payment.id);

      // Assert - Verify refund was created in Stripe
      expect(refund).toMatchObject({
        id: 're_1234567890',
        amount: 2000,
        status: 'succeeded'
      });

      // Verify payment status in database
      const updatedPayment = await paymentService.getPayment(payment.id);
      expect(updatedPayment.status).toBe('refunded');
    });
  });
});
```
      </code>
    </section>

    <section title="Python Integration Test (pytest/FastAPI)">
      <description>
        Testing a FastAPI application with database integration.
      </description>
      <code language="python">
```python
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.main import app
from app.database import get_db
from app.models import User
from tests.factories import UserFactory


@pytest.fixture
async def client(db_session: AsyncSession):
    """Override database dependency for testing"""
    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_create_user(client: AsyncClient):
    """Test creating a new user"""
    # Arrange
    user_data = {
        "email": "test@example.com",
        "password": "SecurePassword123!",
        "name": "Test User"
    }

    # Act
    response = await client.post("/api/users", json=user_data)

    # Assert
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == user_data["email"]
    assert data["name"] == user_data["name"]
    assert "id" in data
    assert "password" not in data


@pytest.mark.asyncio
async def test_create_duplicate_email(client: AsyncClient, db_session: AsyncSession):
    """Test that duplicate emails are rejected"""
    # Arrange
    existing_user = UserFactory(email="existing@example.com")
    db_session.add(existing_user)
    await db_session.commit()

    duplicate_data = {
        "email": "existing@example.com",
        "password": "SecurePassword123!",
        "name": "Another User"
    }

    # Act
    response = await client.post("/api/users", json=duplicate_data)

    # Assert
    assert response.status_code == 400
    assert "already exists" in response.json()["error"].lower()


@pytest.mark.asyncio
async def test_get_user(client: AsyncClient, db_session: AsyncSession):
    """Test retrieving a user by ID"""
    # Arrange
    user = UserFactory(
        email="test@example.com",
        name="Test User"
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)

    # Act
    response = await client.get(f"/api/users/{user.id}")

    # Assert
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == user.id
    assert data["email"] == "test@example.com"
    assert data["name"] == "Test User"


@pytest.mark.asyncio
async def test_get_nonexistent_user(client: AsyncClient):
    """Test retrieving a non-existent user"""
    # Act
    response = await client.get("/api/users/99999")

    # Assert
    assert response.status_code == 404
```
      </code>
    </section>
  </examples>

  <!-- =======================================================================
       INTEGRATION_NOTES: Framework Integration
       ======================================================================= -->

  <integration_notes>
    <section title="Jest (JavaScript/TypeScript)">
      <description>
        Popular testing framework for JavaScript/TypeScript with built-in
        assertion library and mocking support.
      </description>
      <configuration>
        <step>Install dependencies: npm install --save-dev jest @types/jest ts-jest</step>
        <step>Create jest.config.js with test environment settings</step>
        <step>Set up test scripts in package.json</step>
        <step>Configure testMatch patterns for integration tests</step>
      </configuration>
      <features>
        <feature>Built-in test runner and assertion library</feature>
        <feature>Powerful mocking capabilities</feature>
        <feature>Parallel test execution</feature>
        <feature>Snapshot testing</feature>
        <feature>Code coverage reporting</feature>
      </features>
      <example_commands>
        <command>jest --testPathPattern=integration</command>
        <command>jest --coverage</command>
        <command>jest --watch</command>
      </example_commands>
    </section>

    <section title="Supertest (Node.js API Testing)">
      <description>
        HTTP assertion library for testing Node.js HTTP servers.
      </description>
      <usage>
        Provides high-level assertions for HTTP requests. Works with Express,
        Koa, NestJS, and other Node.js frameworks.
      </usage>
      <features>
        <feature>Chainable assertions for HTTP responses</feature>
        <feature>Supports testingExpress apps</feature>
        <feature>Works with any test framework</feature>
        <feature>Easy to test authentication and cookies</feature>
      </features>
      <example>
```typescript
await request(app)
  .post('/api/users')
  .send(userData)
  .expect(201)
  .expect('Content-Type', /json/)
  .expect(response => {
    expect(response.body.id).toBeDefined();
  });
```
      </example>
    </section>

    <section title="pytest (Python)">
      <description>
        Powerful testing framework for Python with fixtures and plugins.
      </description>
      <configuration>
        <step>Install pytest: pip install pytest pytest-asyncio</step>
        <step>Create conftest.py for shared fixtures</step>
        <step>Use @pytest.mark.asyncio for async tests</step>
        <step>Configure pytest.ini for test discovery</step>
      </configuration>
      <features>
        <feature>Powerful fixture system</feature>
        <feature>Plugin ecosystem</feature>
        <feature>Parallel execution with pytest-xdist</feature>
        <feature>Async test support</feature>
        <feature>Detailed assertion output</feature>
      </features>
      <example_commands>
        <command>pytest tests/integration/</command>
        <command>pytest -v</command>
        <command>pytest --cov=app</command>
      </example_commands>
    </section>

    <section title="Database Testing Setup">
      <description>
        Setting up databases for integration testing.
      </description>
      <best_practices>
        <practice>Use separate test database from development/production</practice>
        <practice>Run migrations before test suite</practice>
        <practice>Use transactions and rollback for cleanup</practice>
        <practice>Seed only necessary test data</practice>
        <practice>Use in-memory databases for speed when appropriate</practice>
      </best_practices>
      <tools>
        <tool>SQLite: Fast in-memory database</tool>
        <tool>Testcontainers: Run real databases in Docker</tool>
        <tool>pglite: In-memory PostgreSQL for testing</tool>
      </tools>
    </section>

    <section title="CI/CD Integration">
      <description>
        Running integration tests in continuous integration pipelines.
      </description>
      <setup>
        <step>Set up test database in CI environment</step>
        <step>Configure environment variables for testing</step>
        <step>Run tests as part of pull request checks</step>
        <step>Fail build if tests fail</step>
        <step>Report test coverage</step>
      </setup>
      <example_configs>
        <config>GitHub Actions: Use services for PostgreSQL</config>
        <config>GitLab CI: Use before_script for setup</config>
        <config>Docker: Use docker-compose for test environment</config>
      </example_configs>
    </section>
  </integration_notes>

  <!-- =======================================================================
       ERROR_HANDLING: Test Failures and Debugging
       ======================================================================= -->

  <error_handling>
    <section title="Common Test Failures">
      <error>
        <name>Connection Refused</name>
        <description>Cannot connect to test database or service</description>
        <solutions>
          <solution>Ensure test database is running</solution>
          <solution>Check connection string in environment variables</solution>
          <solution>Verify database migrations have been run</solution>
          <solution>Check firewall settings in CI environment</solution>
        </solutions>
      </error>

      <error>
        <name>Timeout Errors</name>
        <description>Tests take too long and exceed timeout</description>
        <solutions>
          <solution>Increase timeout for slow operations</solution>
          <solution>Fix hanging async operations</solution>
          <solution>Mock slow external services</solution>
          <solution>Check for infinite loops or recursion</solution>
        </solutions>
      </error>

      <error>
        <name>Assertion Errors</name>
        <description>Expected value doesn't match actual value</description>
        <solutions>
          <solution>Check test data setup</solution>
          <solution>Verify expected values are correct</solution>
          <solution>Review actual vs expected output</solution>
          <solution>Check for async timing issues</solution>
        </solutions>
      </error>

      <error>
        <name>Flaky Tests</name>
        <description>Tests pass/fail intermittently</description>
        <solutions>
          <solution>Ensure proper test isolation</solution>
          <solution>Fix race conditions in async code</solution>
          <solution>Mock external dependencies</solution>
          <solution>Use seeded random data</solution>
          <solution>Implement proper cleanup</solution>
        </solutions>
      </error>

      <error>
        <name>Mock Failures</name>
        <description>Mocks not configured correctly</description>
        <solutions>
          <solution>Verify mock expectations match actual calls</solution>
          <solution>Check mock setup is before test execution</solution>
          <solution>Ensure mocks are cleaned up after tests</solution>
          <solution>Use proper mock matching (exact vs. partial)</solution>
        </solutions>
      </error>
    </section>

    <section title="Debugging Techniques">
      <technique>
        <title>Verbose Output</title>
        <description>
          Run tests with verbose output to see detailed execution information.
        </description>
        <examples>
          <example>jest --verbose</example>
          <example>pytest -vv</example>
          <example>pytest --log-cli-level=DEBUG</example>
        </examples>
      </technique>

      <technique>
        <title>Debug Mode</title>
        <description>
          Attach debugger to test execution for step-by-step debugging.
        </description>
        <examples>
          <example>node --inspect-brk node_modules/.bin/jest --runInBand</example>
          <example>pytest --pdb</example>
        </examples>
      </technique>

      <technique>
        <title>Single Test Execution</title>
        <description>
          Run only the failing test to isolate the issue.
        </description>
        <examples>
          <example>jest -t "test name"</example>
          <example>pytest tests/test_file.py::test_function</example>
        </examples>
      </technique>

      <technique>
        <title>Console Logging</title>
        <description>
          Add console.log statements to inspect values during test execution.
        </description>
        <usage>
          Use sparingly and remove before committing. Use debugging
          breakpoints for complex issues.
        </usage>
      </technique>
    </section>
  </error_handling>

  <!-- =======================================================================
       OUTPUT_FORMAT: Test Results Format
       ======================================================================= -->

  <output_format>
    <section title="Standard Output">
      <description>
        Integration tests should output results in a standard format that
        can be parsed by CI/CD systems and displayed to developers.
      </description>
      <components>
        <component>
          <name>Test Summary</name>
          <fields>
            <field>Total tests run</field>
            <field>Tests passed</field>
            <field>Tests failed</field>
            <field>Tests skipped</field>
            <field>Execution time</field>
            <field>Code coverage percentage</field>
          </fields>
        </component>

        <component>
          <name>Failure Details</name>
          <fields>
            <field>Test name and file path</field>
            <field>Error message</field>
            <field>Stack trace</field>
            <field>Difference between expected and actual</field>
          </fields>
        </component>

        <component>
          <name>Slow Tests</name>
          <fields>
            <field>List of slowest tests</field>
            <field>Execution time for each</field>
          </fields>
          <purpose>Identify performance bottlenecks</purpose>
        </component>
      </components>
    </section>

    <section title="JUnit XML Format">
      <description>
        Standard XML format for test results, compatible with most CI/CD systems.
      </description>
      <usage>
        Generate JUnit XML reports for integration with GitHub Actions,
        Jenkins, CircleCI, and other CI platforms.
      </usage>
      <example_output>
```xml
<?xml version="1.0" encoding="UTF-8"?>
<testsuites>
  <testsuite name="API Integration Tests" tests="3" failures="1" time="5.23">
    <testcase name="should create user" time="0.45"/>
    <testcase name="should reject duplicate email" time="0.38"/>
    <testcase name="should validate email format" time="0.52">
      <failure message="Expected 422 but got 400">
        at UserAPI.test.js:45:12
      </failure>
    </testcase>
  </testsuite>
</testsuites>
```
      </example_output>
    </section>

    <section title="Coverage Reports">
      <description>
        Generate code coverage reports to identify untested code.
      </description>
      <formats>
        <format>HTML: Detailed interactive report</format>
        <format>JSON: Machine-readable for CI/CD</format>
        <format>LCOV: Standard coverage format</format>
        <format>Terminal: Summary output</format>
      </formats>
      <metrics>
        <metric>Line coverage: % of lines executed</metric>
        <metric>Branch coverage: % of code branches tested</metric>
        <metric>Function coverage: % of functions called</metric>
        <metric>Statement coverage: % of statements executed</metric>
      </metrics>
    </section>
  </output_format>

  <!-- =======================================================================
       RELATED_SKILLS: Related Agent Skills
       ======================================================================= -->

  <related_skills>
    <skill>
      <name>unit-testing</name>
      <path>@.agent-os/skills/development-workflow/testing-quality/unit-testing/SKILL.md</path>
      <description>
        Testing individual functions and components in isolation.
        Unit tests are faster and more granular than integration tests.
      </description>
      <relationship>
        Integration tests build on unit tests. Unit tests verify individual
        components work correctly, while integration tests verify those
        components work together correctly.
      </relationship>
    </skill>

    <skill>
      <name>e2e-testing</name>
      <path>@.agent-os/skills/development-workflow/testing-quality/e2e-testing/SKILL.md</path>
      <description>
        End-to-end testing of complete user workflows through the UI.
        E2E tests are slower but verify the entire system works together.
      </description>
      <relationship>
        E2E tests sit above integration tests in the testing pyramid.
        Integration tests verify component interactions, while E2E tests
        verify complete user workflows.
      </relationship>
    </skill>

    <skill>
      <name>test-driven-development</name>
      <path>@.agent-os/skills/development-workflow/testing-quality/test-driven-development/SKILL.md</path>
      <description>
        Writing tests before implementation code. TDD encourages better
        design and comprehensive test coverage.
      </description>
      <relationship>
        TDD can be applied to integration tests. Write integration tests
        first, then implement the code to make them pass.
      </relationship>
    </skill>

    <skill>
      <name>api-design</name>
      <path>@.agent-os/skills/core-infrastructure/development-tools/api-design/SKILL.md</path>
      <description>
        Designing RESTful APIs and service interfaces. Good API design
        makes integration testing easier and more effective.
      </description>
      <relationship>
        Well-designed APIs are easier to test. Integration tests verify
        that APIs work correctly with real databases and services.
      </relationship>
    </skill>

    <skill>
      <name>database-management</name>
      <path>@.agent-os/skills/core-infrastructure/development-tools/database-management/SKILL.md</path>
      <description>
        Database schema design, migrations, and query optimization.
        Integration tests often require database setup and management.
      </description>
      <relationship>
        Integration tests frequently test database interactions.
        Understanding database management is crucial for effective
        integration testing.
      </relationship>
    </skill>

    <skill>
      <name>mocking</name>
      <path>@.agent-os/skills/development-workflow/testing-quality/mocking/SKILL.md</path>
      <description>
        Techniques for mocking external dependencies and services.
        Proper mocking keeps integration tests fast and reliable.
      </description>
      <relationship>
        Integration tests use mocking for external dependencies while
        testing real interactions with internal components.
      </relationship>
    </skill>
  </related_skills>

  <!-- =======================================================================
       SEE_ALSO: Additional Resources
       ======================================================================= -->

  <see_also>
    <resource>
      <title>The Testing Pyramid</title>
      <type>Concept</type>
      <url>https://martinfowler.com/articles/practical-test-pyramid.html</url>
      <description>
        Martin Fowler's guide to the testing pyramid and how to balance
        unit, integration, and end-to-end tests.
      </description>
    </resource>

    <resource>
      <title>Integration Testing Best Practices</title>
      <type>Guide</type>
      <url>https://kentcdodds.com/blog/write-tests</url>
      <description>
        Kent C. Dodds' guide to writing tests, including integration tests.
        Emphasizes testing behavior over implementation.
      </description>
    </resource>

    <resource>
      <title>Jest Documentation</title>
      <type>Documentation</type>
      <url>https://jestjs.io/docs/getting-started</url>
      <description>
        Official Jest documentation for JavaScript/TypeScript testing.
        Includes guides for setup, writing tests, and mocking.
      </description>
    </resource>

    <resource>
      <title>Pytest Documentation</title>
      <type>Documentation</type>
      <url>https://docs.pytest.org/</url>
      <description>
        Official pytest documentation for Python testing. Includes fixture
        system, plugins, and best practices.
      </description>
    </resource>

    <resource>
      <title>Testcontainers</title>
      <type>Tool</type>
      <url>https://www.testcontainers.org/</url>
      <description>
        Run real databases and services in Docker containers for testing.
        Provides lightweight, throwaway instances for integration tests.
      </description>
    </resource>

    <resource>
      <title>Supertest Documentation</title>
      <type>Documentation</type>
      <url>https://github.com/visionmedia/supertest</url>
      <description>
        HTTP assertion library for testing Node.js servers. Provides
        fluent API for testing endpoints.
      </description>
    </resource>

    <resource>
      <title>Contract Testing with Pact</title>
      <type>Guide</type>
      <url>https://docs.pact.io/</url>
      <description>
        Consumer-driven contract testing for microservices. Ensures
        services agree on their API contracts.
      </description>
    </resource>

    <resource>
      <title>Google's Testing Blog</title>
      <type>Blog</type>
      <url>https://testing.googleblog.com/</url>
      <description>
        Google's testing blog with articles on testing strategies,
        best practices, and lessons learned at scale.
      </description>
    </resource>

    <resource>
      <title>Integration Tests vs Unit Tests</title>
      <type>Article</type>
      <url>https://www.martinfowler.com/bliki/UnitTest.html</url>
      <description>
        Martin Fowler discusses the distinction between unit tests and
        integration tests, and when to use each.
      </description>
    </resource>

    <resource>
      <title>Testing Anti-Patterns</title>
      <type>Article</type>
      <url>https://kentcdodds.com/blog/common-mistakes-with-react-testing-library-tests</url>
      <description>
        Common testing mistakes and anti-patterns to avoid. While focused
        on React, the principles apply broadly.
      </description>
    </resource>
  </see_also>

  <!-- =======================================================================
       GLOSSARY: Key Terms
       ======================================================================= -->

  <glossary>
    <term>
      <name>Integration Test</name>
      <definition>
        A test that verifies that different modules or services work together
        correctly. Integration tests test the interactions between components.
      </definition>
    </term>

    <term>
      <name>Fixture</name>
      <definition>
        Fixed state or set of objects used as a baseline for running tests.
        Fixtures ensure tests have consistent starting data.
      </definition>
    </term>

    <term>
      <name>Mock</name>
      <definition>
        A simulated object that mimics the behavior of real objects in a
        controlled way. Used to isolate code from external dependencies.
      </definition>
    </term>

    <term>
      <name>Flaky Test</name>
      <definition>
        A test that sometimes passes and sometimes fails without any changes
        to the code. Flaky tests undermine confidence in the test suite.
      </definition>
    </term>

    <term>
      <name>Test Isolation</name>
      <definition>
        The practice of ensuring each test is independent and doesn't rely
        on other tests. Tests should be able to run in any order.
      </definition>
    </term>

    <term>
      <name>AAA Pattern</name>
      <definition>
        Arrange-Act-Assert pattern for structuring tests. Arrange sets up
        test data, Act executes the code, Assert verifies the result.
      </definition>
    </term>

    <term>
      <name>Contract Testing</name>
      <definition>
        A technique for testing the integration points between microservices
        by verifying they agree on their API contracts.
      </definition>
    </term>

    <term>
      <name>Test Coverage</name>
      <definition>
        A measure of how much code is executed by tests. Can be measured at
        the line, branch, function, or statement level.
      </definition>
    </term>

    <term>
      <name>End-to-End Test</name>
      <definition>
        A test that verifies a complete workflow through the entire system,
        typically through the UI. E2E tests are the slowest but most realistic.
      </definition>
    </term>

    <term>
      <name>Unit Test</name>
      <definition>
        A test that verifies a single function or component in isolation.
        Unit tests are fast and focus on small pieces of code.
      </definition>
    </term>
  </glossary>
</integration-testing-skill>
