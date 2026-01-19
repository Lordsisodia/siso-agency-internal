---
name: e2e-testing
category: development-workflow/testing-quality
version: 1.0.0
description: End-to-end testing workflows, user journey testing, and E2E test management with Playwright and Cypress
author: blackbox5/core
verified: true
tags: [testing, e2e, playwright, cypress, user-journey]
---

# End-to-End Testing Workflows

## Context

<context>
End-to-end (E2E) testing is a software testing technique that validates the entire application flow from start to finish, simulating real user scenarios and interactions across multiple system components.

### The Testing Pyramid

In the testing pyramid, E2E tests sit at the top:
- **Unit Tests**: Bottom layer - fast, isolated, numerous
- **Integration Tests**: Middle layer - moderate speed, test component interactions
- **E2E Tests**: Top layer - slower, test complete user workflows, fewer in number

### Purpose and Value

E2E testing serves critical purposes:
- **User Journey Validation**: Verify complete user workflows work as expected
- **System Integration**: Test all components work together correctly
- **Critical Path Coverage**: Ensure business-critical features function properly
- **Cross-Browser/Device**: Validate consistent behavior across platforms
- **Regression Prevention**: Catch breaking changes before production

### When to Use E2E Tests

Best for:
- Critical user paths (authentication, checkout, data submission)
- Multi-step workflows with complex state changes
- Integrations between multiple subsystems
- Features with high business impact or risk
- Cross-browser/cross-device validation
- User acceptance testing (UAT) scenarios

### When NOT to Use E2E Tests

Avoid for:
- Unit-level logic (use unit tests instead)
- Simple component interactions (use component/integration tests)
- Edge cases in business logic (use integration tests)
- Styling and visual regression (use visual testing tools)
- Performance testing (use dedicated performance testing tools)

### Popular E2E Testing Frameworks

- **Playwright**: Modern, fast, excellent cross-browser support
- **Cypress**: Developer-friendly, great debugging experience
- **Selenium**: Industry standard, extensive language support
- **Puppeteer**: Chrome/Chromium focused, good for single-browser testing
</context>

## Instructions

<instructions>
### Designing Effective E2E Tests

1. **Start with User Journeys**
   - Map out critical user paths through your application
   - Identify happy paths and alternative flows
   - Prioritize business-critical workflows
   - Consider error scenarios and edge cases

2. **Focus on User Perspective**
   - Test what users see and do, not implementation details
   - Use realistic user data and scenarios
   - Test from the user's point of view (UI interactions)
   - Validate outcomes, not just intermediate states

3. **Create Maintainable Tests**
   - Use page object model for better organization
   - Implement reusable helper functions and custom commands
   - Keep tests independent and isolated
   - Use clear, descriptive test names

4. **Ensure Test Reliability**
   - Use stable selectors (data-testid, aria attributes)
   - Implement proper waiting strategies
   - Handle async operations correctly
   - Avoid hard-coded delays (sleep statements)

5. **Optimize Test Performance**
   - Run tests in parallel when possible
   - Minimize browser setup/teardown overhead
   - Use efficient selectors
   - Cache authenticated sessions where safe
</instructions>

## Rules

<rules>
### Critical User Path Rules

1. **Identify Critical Paths**
   - Always E2E test user authentication flows
   - Test core business workflows (e.g., purchase, publish, submit)
   - Cover data persistence and retrieval across sessions
   - Include cross-feature integrations

2. **Test Edge Cases in Critical Flows**
   - Validate error handling in critical paths
   - Test validation and form submissions
   - Include permission/authorization scenarios
   - Test network failure handling

### Test Reliability Rules

1. **Selector Strategy**
   - Prefer `data-testid` attributes over CSS selectors
   - Use ARIA attributes when available (role, aria-label)
   - Avoid selectors tied to styling (classes, structure)
   - Never use XPath unless absolutely necessary

2. **Wait Strategies**
   - Use explicit waits over implicit waits
   - Wait for elements to be actionable (visible + enabled)
   - Use framework-specific await assertions
   - Avoid arbitrary sleep/delay statements

3. **Test Isolation**
   - Each test must be independent and runnable alone
   - Clean up test data after each test
   - Don't rely on test execution order
   - Use fresh state for each test

4. **Flaky Test Prevention**
   - Eliminate timing-dependent assertions
   - Handle network latency gracefully
   - Use retry logic judiciously (framework built-in preferred)
   - Identify and fix root causes of flakiness, not symptoms

### Test Coverage Rules

1. **Coverage Targets**
   - Focus on 100% coverage of critical user paths
   - Aim for 80%+ coverage of important features
   - Don't test every permutation at E2E level
   - Complement with lower-level tests for edge cases

2. **Browser Coverage**
   - Test in browsers your users actually use
   - Prioritize Chrome/Firefox/Safari based on analytics
   - Include mobile browsers/appropriate viewports
   - Consider automated cross-browser testing platforms

3. **Environment Strategy**
   - Run E2E tests against staging/pre-production environments
   - Use dedicated test databases and fixtures
   - Mock external services when appropriate
   - Keep production-like data and configurations
</rules>

## Workflow

<workflow>
### Phase 1: User Journey Mapping

1. **Identify Critical Workflows**
   - List all major user journeys through the application
   - Map step-by-step user interactions
   - Document expected outcomes at each step
   - Identify decision points and alternative paths

2. **Prioritize Test Scenarios**
   - High priority: Business-critical paths (authentication, checkout)
   - Medium priority: Common user workflows, cross-feature interactions
   - Low priority: Edge cases, rarely used features
   - Create a test matrix to ensure comprehensive coverage

3. **Create User Stories**
   - Write scenarios from user perspective
   - Include preconditions and expected outcomes
   - Document acceptance criteria
   - Identify test data requirements

### Phase 2: Test Design

1. **Test Structure**
   - Use Given-When-Then format for clarity
   - Create test cases for happy paths
   - Add tests for error scenarios
   - Include edge case validations

2. **Page Object Design**
   - Create page objects for each major screen/component
   - Encapsulate element locators and interactions
   - Implement reusable methods for common actions
   - Maintain separation between test logic and page structure

3. **Test Data Strategy**
   - Create test fixtures for common scenarios
   - Use factories or builders for complex data
   - Plan for test data cleanup
   - Consider using APIs for efficient data setup

### Phase 3: Test Setup

1. **Framework Configuration**
   - Configure browsers and devices to test
   - Set up test reporters and CI integration
   - Configure base URLs and environment variables
   - Set up authentication helpers

2. **Test Environment**
   - Ensure test environment is stable and consistent
   - Set up test database and seed data
   - Configure any external service mocks
   - Verify network connectivity and access

3. **Development Tools**
   - Configure IDE with E2E test framework support
   - Set up debugging capabilities
   - Configure code generation tools (record & playback)
   - Integrate with development workflow

### Phase 4: Test Implementation

1. **Write Initial Tests**
   - Start with happy path scenarios
   - Use page objects for maintainability
   - Implement proper assertions and waits
   - Add descriptive comments and test names

2. **Refine Tests**
   - Review for flakiness and timing issues
   - Optimize selectors and waits
   - Extract common patterns into helpers
   - Ensure tests are readable and maintainable

3. **Validate Tests**
   - Run tests locally to verify they pass
   - Check test reports for issues
   - Confirm tests actually catch bugs (intentionally break tests)
   - Review test coverage metrics

### Phase 5: Execution and Maintenance

1. **CI/CD Integration**
   - Add E2E tests to CI pipeline
   - Configure parallel execution for speed
   - Set up test result reporting and notifications
   - Define failure thresholds and rollback procedures

2. **Regular Maintenance**
   - Update tests when UI changes
   - Fix flaky tests promptly
   - Review and refactor test code regularly
   - Keep dependencies updated

3. **Continuous Improvement**
   - Analyze test failures for patterns
   - Identify areas needing more or less coverage
   - Optimize slow tests
   - Share learnings with team
</workflow>

## Best Practices

<best_practices>
### Page Object Model (POM)

1. **Structure Page Objects**
   - One page object per page or major component
   - Encapsulate element locators as private constants
   - Provide public methods for user actions
   - Return page objects for chainable navigation

2. **Keep Tests Clean**
   - Tests should read like user scenarios
   - No direct selector access in tests
   - Use domain language in method names
   - Separate test data from test logic

3. **Example Page Object Pattern**

```typescript
// LoginPage.ts
class LoginPage {
  private readonly emailInput = this.page.getByTestId('email-input');
  private readonly passwordInput = this.page.getByTestId('password-input');
  private readonly loginButton = this.page.getByTestId('login-button');

  constructor(private page: Page) {}

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async goto() {
    await this.page.goto('/login');
  }
}

// Test file
test('user can login with valid credentials', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('user@example.com', 'password123');
  await expect(page).toHaveURL('/dashboard');
});
```

### Test Isolation

1. **Independent Tests**
   - Each test should be able to run alone
   - Don't share state between tests
   - Clean up created data after each test
   - Use beforeEach/afterEach hooks appropriately

2. **Fresh State**
   - Start each test with clean application state
   - Clear browser storage and cookies
   - Reset database to known state
   - Use transactions and rollbacks where possible

3. **Parallel Execution**
   - Design tests to run in parallel
   - Avoid shared resources or file locks
   - Use unique test data for each test run
   - Consider test runner parallelization features

### Selector Best Practices

1. **Priority Order for Selectors**
   - Best: `data-testid` attributes (dedicated for testing)
   - Good: ARIA attributes (role, aria-label, aria-describedby)
   - Acceptable: Semantic HTML (heading, label, input)
   - Avoid: CSS classes and structural selectors
   - Never: XPath (except for very specific edge cases)

2. **Selector Examples**

```typescript
// Best - data-testid
await page.getByTestId('submit-button').click();

// Good - ARIA attributes
await page.getByRole('button', { name: 'Submit' }).click();
await page.getByLabel('Email').fill('user@example.com');

// Acceptable - Semantic HTML
await page.locator('h1').toHaveText('Dashboard');

// Avoid - CSS classes (brittle)
await page.locator('.btn.btn-primary').click();

// Never - XPath
await page.locator('//div[@class="container"]/button[1]').click();
```

### Wait Strategies

1. **Explicit Waits**
   - Wait for specific conditions, not arbitrary time
   - Use framework assertions that auto-wait
   - Chain assertions for precise conditions
   - Set appropriate but reasonable timeouts

2. **Auto-Waiting Features**
   - Modern frameworks (Playwright, Cypress) auto-wait
   - Leverage built-in smart waiting
   - Avoid manual waits unless absolutely necessary
   - Use retry capabilities in assertions

3. **Timeout Configuration**
   - Set global timeouts for test suite
   - Override for specific tests when needed
   - Balance between reliability and speed
   - Monitor timeout failures for optimization

### Test Organization

1. **Logical Grouping**
   - Group tests by feature or user journey
   - Use describe blocks for organization
   - Create separate files for major features
   - Follow project structure conventions

2. **Clear Test Names**
   - Use descriptive, human-readable test names
   - Describe what is being tested, not how
   - Include expected outcome in name
   - Use consistent naming convention

3. **Documentation**
   - Comment complex test scenarios
   - Document business rules and constraints
   - Explain why certain waits or workarounds exist
   - Keep test documentation updated with code changes

### Performance Optimization

1. **Reduce Test Execution Time**
   - Run tests in parallel across multiple workers
   - Skip unnecessary browser startup/shutdown
   - Reuse authenticated sessions where safe
   - Optimize test data setup/teardown

2. **Efficient Selectors**
   - Use efficient, fast selectors
   - Avoid complex selector queries
   - Cache page elements when appropriate
   - Minimize DOM queries

3. **Smart Test Execution**
   - Run full suite only when needed
   - Use selective test runs during development
   - Implement test tagging for targeted runs
   - Configure incremental test runs in CI
</best_practices>

## Anti-Patterns

<anti_patterns>
### Brittle Selectors

1. **Problem: Using Implementation Details**
   - Selecting by CSS classes that change with styling
   - Using structural selectors that break with layout changes
   - Targeting generated IDs or random attributes

2. **Example Anti-Pattern**

```typescript
// Brittle - will break with CSS changes
await page.locator('.container > div:nth-child(2) > button.btn-primary').click();

// Brittle - uses generated IDs
await page.locator('#btn_abc123xyz').click();

// Brittle - depends on DOM structure
await page.locator('div > div > div > button').click();
```

3. **Solution: Use Stable Selectors**

```typescript
// Robust - data-testid
await page.getByTestId('submit-button').click();

// Robust - ARIA attributes
await page.getByRole('button', { name: 'Submit' }).click();

// Robust - accessible name
await page.getByLabel('Email').fill('user@example.com');
```

### Testing Implementation Details

1. **Problem: Testing Internals Instead of Behavior**
   - Testing internal state or methods
   - Verifying CSS classes directly
   - Checking component internals
   - Testing implementation rather than user experience

2. **Example Anti-Pattern**

```typescript
// Wrong - testing CSS classes
await expect(page.locator('.error-message')).toHaveClass(/hidden/);

// Wrong - testing internal state
const state = await page.evaluate(() => window.__STATE__);
expect(state).toEqual({ loading: true });

// Wrong - testing implementation detail
await expect(page.locator('input')).toHaveAttribute('value', 'test');
```

3. **Solution: Test User-Visible Behavior**

```typescript
// Right - test visibility
await expect(page.getByText('Error message')).not.toBeVisible();

// Right - test user outcome
await expect(page.getByText('Loading...')).toBeVisible();

// Right - test user experience
await expect(page.getByRole('textbox')).toHaveValue('test');
```

### Testing Third-Party Code

1. **Problem: Testing External Libraries**
   - Testing library functionality (e.g., date picker, rich text editor)
   - Validating third-party integrations at E2E level
   - Testing external service integrations in detail

2. **Example Anti-Pattern**

```typescript
// Unnecessary - testing the date picker library
test('date picker shows calendar', async ({ page }) => {
  await page.getByTestId('date-input').click();
  await expect(page.locator('.calendar')).toBeVisible();
  // Don't test every calendar interaction - library tests this
});
```

3. **Solution: Integration Testing for Third-Party**

```typescript
// Appropriate - test your integration, not the library
test('user can select a date and submit', async ({ page }) => {
  await page.getByTestId('date-input').fill('2025-01-18');
  await page.getByTestId('submit-button').click();
  await expect(page.getByText('Date saved')).toBeVisible();
});
```

### Slow Tests

1. **Problem: Unnecessary Delays**
   - Using fixed wait times (sleep statements)
   - Overly generous timeout configurations
   - Sequential test execution when parallel possible
   - Redundant test scenarios

2. **Example Anti-Pattern**

```typescript
// Bad - arbitrary sleep
await page.click('.button');
await page.waitForTimeout(3000); // Don't do this!
await expect(page.getByText('Success')).toBeVisible();

// Bad - overly long timeout
await page.click('.button', { timeout: 60000 }); // Too long!
```

3. **Solution: Smart Waits and Optimization**

```typescript
// Good - auto-waiting assertions
await page.getByTestId('button').click();
await expect(page.getByText('Success')).toBeVisible();

// Good - explicit wait for condition
await page.getByTestId('button').click();
await page.waitForURL('**/dashboard');
await expect(page.getByText('Welcome')).toBeVisible();
```

### Testing Too Much at E2E Level

1. **Problem: Over-Coverage**
   - Testing every validation rule at E2E level
   - Covering all edge cases in E2E tests
   - Duplicating unit test scenarios
   - Testing components in isolation at E2E level

2. **Example Anti-Pattern**

```typescript
// Overkill - testing every validation
test('email validation - invalid format', async ({ page }) => { });
test('email validation - missing @', async ({ page }) => { });
test('email validation - missing domain', async ({ page }) => { });
test('email validation - special chars', async ({ page }) => { });
// These are better as unit/integration tests
```

3. **Solution: Strategic Coverage**

```typescript
// Appropriate - test critical validation at E2E level
test('form shows validation errors for invalid input', async ({ page }) => {
  await page.getByLabel('Email').fill('invalid-email');
  await page.getByTestId('submit-button').click();
  await expect(page.getByText('Please enter a valid email')).toBeVisible();
});
```

### Flaky Tests

1. **Problem: Timing Dependencies**
   - Race conditions in test execution
   - Depending on external APIs without retries
   - Assuming network speeds
   - Testing time-sensitive features without control

2. **Example Anti-Pattern**

```typescript
// Flaky - no wait for condition
await page.getByTestId('load-more').click();
await expect(page.getByTestId('item-10')).toBeVisible();
// Might fail if network is slow

// Flaky - time-dependent
const currentTime = new Date().getHours();
await expect(page.getByText(`Good ${currentTime < 12 ? 'morning' : 'evening'}`)).toBeVisible();
```

3. **Solution: Robust Waiting and Control**

```typescript
// Reliable - explicit wait
await page.getByTestId('load-more').click();
await page.waitForSelector('[data-testid="item-10"]');
await expect(page.getByTestId('item-10')).toBeVisible();

// Reliable - control time in tests
await page.clock.install();
await page.clock.setFixedTime('2025-01-18T09:00:00');
await expect(page.getByText('Good morning')).toBeVisible();
```
</anti_patterns>

## Examples

<examples>
### Example 1: Playwright Authentication Test

```typescript
import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('user can login with valid credentials', async ({ page }) => {
    // Given: user is on login page
    await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();

    // When: user enters valid credentials
    await page.getByLabel('Email address').fill('test@example.com');
    await page.getByLabel('Password', { exact: true }).fill('SecurePass123!');
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Then: user is redirected to dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByRole('heading', { name: 'Welcome' })).toBeVisible();
  });

  test('shows error with invalid credentials', async ({ page }) => {
    // Given: user is on login page
    await page.getByLabel('Email address').fill('test@example.com');
    await page.getByLabel('Password', { exact: true }).fill('WrongPassword');

    // When: user submits invalid credentials
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Then: error message is displayed
    await expect(page.getByText('Invalid email or password')).toBeVisible();
    await expect(page).toHaveURL('/login');
  });

  test('can logout from application', async ({ page }) => {
    // Given: user is logged in
    await page.goto('/login');
    await page.getByLabel('Email address').fill('test@example.com');
    await page.getByLabel('Password', { exact: true }).fill('SecurePass123!');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page).toHaveURL('/dashboard');

    // When: user clicks logout
    await page.getByRole('button', { name: 'Logout' }).click();

    // Then: user is redirected to login page
    await expect(page).toHaveURL('/login');
    await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();
  });

  test('password field toggles visibility', async ({ page }) => {
    // Given: user is on login page
    const passwordInput = page.getByLabel('Password', { exact: true });
    const toggleButton = page.getByRole('button', { name: /show password/i });

    // When: user clicks show password
    await passwordInput.fill('password123');
    await toggleButton.click();

    // Then: password is visible
    await expect(passwordInput).toHaveAttribute('type', 'text');

    // When: user clicks hide password
    await toggleButton.click();

    // Then: password is hidden
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });
});
```

### Example 2: Cypress E-Commerce Checkout Test

```javascript
describe('Checkout Flow', () => {
  beforeEach(() => {
    // Set up test data and authentication
    cy.loginAsTestUser();
    cy.visit('/products');
  });

  it('completes a full checkout process', () => {
    // Add product to cart
    cy.getByTestId('product-1').within(() => {
      cy.getByRole('button', { name: 'Add to Cart' }).click();
    });

    // Verify cart notification
    cy.getByTestId('cart-count').should('contain', '1');

    // Navigate to cart
    cy.getByRole('link', { name: 'Cart' }).click();
    cy.url().should('include', '/cart');

    // Verify cart contents
    cy.getByTestId('cart-items').within(() => {
      cy.getByTestId('cart-item-0').within(() => {
        cy.getByTestId('product-name').should('contain', 'Test Product');
        cy.getByTestId('product-price').should('contain', '$29.99');
      });
    });

    // Proceed to checkout
    cy.getByRole('button', { name: 'Proceed to Checkout' }).click();
    cy.url().should('include', '/checkout');

    // Fill in shipping information
    cy.getByLabel('First Name').type('John');
    cy.getByLabel('Last Name').type('Doe');
    cy.getByLabel('Email').type('john.doe@example.com');
    cy.getByLabel('Address').type('123 Main St');
    cy.getByLabel('City').type('San Francisco');
    cy.getByLabel('State').select('California');
    cy.getByLabel('ZIP Code').type('94102');

    // Continue to payment
    cy.getByRole('button', { name: 'Continue to Payment' }).click();

    // Fill in payment information
    cy.getByLabel('Card Number').type('4242424242424242');
    cy.getByLabel('Cardholder Name').type('John Doe');
    cy.getByLabel('Expiry Date').type('12/25');
    cy.getByLabel('CVV').type('123');

    // Complete purchase
    cy.getByRole('button', { name: 'Complete Purchase' }).click();

    // Verify success
    cy.url().should('include', '/order-confirmation');
    cy.getByRole('heading', { name: 'Order Confirmed' }).should('be.visible');
    cy.getByTestId('order-number').should('not.be.empty');
  });

  it('validates required fields in checkout form', () => {
    cy.visit('/checkout');

    // Try to submit without filling form
    cy.getByRole('button', { name: 'Continue to Payment' }).click();

    // Verify validation errors
    cy.getByTestId('error-first-name').should('contain', 'First name is required');
    cy.getByTestId('error-email').should('contain', 'Email is required');
  });

  it('calculates correct order total', () => {
    // Add multiple products
    cy.getByTestId('product-1').within(() => {
      cy.getByRole('button', { name: 'Add to Cart' }).click();
    });
    cy.getByTestId('product-2').within(() => {
      cy.getByRole('button', { name: 'Add to Cart' }).click();
    });

    // Go to cart and verify total
    cy.getByRole('link', { name: 'Cart' }).click();
    cy.getByTestId('cart-subtotal').should('contain', '$59.98');
    cy.getByTestId('cart-tax').should('contain', '$5.40');
    cy.getByTestId('cart-total').should('contain', '$65.38');
  });
});
```

### Example 3: Playwright Data Management Flow

```typescript
import { test, expect } from '@playwright/test';

test.describe('Data Management', () => {
  test.beforeEach(async ({ page }) => {
    // Authenticate and navigate
    await page.goto('/login');
    await page.getByLabel('Email').fill('admin@example.com');
    await page.getByLabel('Password').fill('admin123');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL('/dashboard');
  });

  test('creates a new project successfully', async ({ page }) => {
    // Navigate to projects page
    await page.getByRole('link', { name: 'Projects' }).click();
    await expect(page.getByRole('heading', { name: 'Projects' })).toBeVisible();

    // Click create new project
    await page.getByRole('button', { name: 'New Project' }).click();

    // Fill in project details
    await page.getByLabel('Project Name').fill('E2E Test Project');
    await page.getByLabel('Description').fill('Created by automated E2E test');
    await page.getByLabel('Status').selectOption('Active');
    await page.getByLabel('Priority').selectOption('High');

    // Submit form
    await page.getByRole('button', { name: 'Create Project' }).click();

    // Verify success message
    await expect(page.getByText('Project created successfully')).toBeVisible();

    // Verify project appears in list
    await expect(page.getByRole('cell', { name: 'E2E Test Project' })).toBeVisible();
  });

  test('edits an existing project', async ({ page }) => {
    // Navigate to specific project
    await page.goto('/projects/test-project-id');

    // Click edit button
    await page.getByRole('button', { name: 'Edit' }).click();

    // Update project details
    await page.getByLabel('Project Name').fill('Updated Project Name');
    await page.getByLabel('Description').fill('Updated description');

    // Save changes
    await page.getByRole('button', { name: 'Save Changes' }).click();

    // Verify updates
    await expect(page.getByText('Project updated successfully')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Updated Project Name' })).toBeVisible();
  });

  test('deletes a project with confirmation', async ({ page }) => {
    // Navigate to project
    await page.goto('/projects/test-project-id');

    // Click delete button
    await page.getByRole('button', { name: 'Delete' }).click();

    // Confirm deletion in modal
    await page.getByRole('dialog').within(() => {
      await page.getByRole('button', { name: 'Delete' }).click();
    });

    // Verify deletion
    await expect(page.getByText('Project deleted successfully')).toBeVisible();
    await expect(page).toHaveURL('/projects');
    await expect(page.getByRole('cell', { name: 'Test Project' })).not.toBeVisible();
  });

  test('search and filter functionality', async ({ page }) => {
    await page.goto('/projects');

    // Search for specific project
    await page.getByPlaceholder('Search projects...').fill('Test Project');
    await page.keyboard.press('Enter');

    // Verify search results
    await expect(page.getByRole('cell', { name: 'Test Project' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Other Project' })).not.toBeVisible();

    // Clear search
    await page.getByRole('button', { name: 'Clear search' }).click();

    // Apply status filter
    await page.getByRole('combobox', { name: 'Status' }).selectOption('Active');

    // Verify filtered results
    const activeProjects = page.getByRole('row').filter({ hasText: 'Active' });
    await expect(activeProjects.first()).toBeVisible();
  });
});
```

### Example 4: Cross-Browser Testing with Playwright

```typescript
import { test, expect } from '@playwright/test';

// Run this test across multiple browsers
test.describe('Cross-Browser Validation', () => {
  test('responsive layout works across viewports', async ({ page }) => {
    await page.goto('/dashboard');

    // Test desktop view
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.getByTestId('sidebar')).toBeVisible();
    await expect(page.getByTestId('main-content')).toBeVisible();

    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.getByTestId('sidebar')).not.toBeVisible();
    await page.getByRole('button', { name: 'Menu' }).click();
    await expect(page.getByTestId('mobile-menu')).toBeVisible();

    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.getByTestId('sidebar')).not.toBeVisible();
    await expect(page.getByTestId('main-content')).toBeVisible();
  });

  test('file upload works across browsers', async ({ page, browserName }) => {
    await page.goto('/upload');

    // Get test file path
    const fileInput = page.getByLabel('Upload File');
    await fileInput.setInputFiles('tests/fixtures/test-file.pdf');

    // Verify upload
    await page.getByRole('button', { name: 'Upload' }).click();
    await expect(page.getByText('File uploaded successfully')).toBeVisible();
  });

  test('downloads work correctly', async ({ page }) => {
    await page.goto('/documents');

    // Start download
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('link', { name: 'Download Report' }).click();
    const download = await downloadPromise;

    // Verify download
    expect(download.suggestedFilename()).toBe('report.pdf');
  });
});
```

### Example 5: API-First E2E Test with Data Seeding

```typescript
import { test, expect } from '@playwright/test';

test.describe('API-First E2E Tests', () => {
  test('creates data via API and validates in UI', async ({ page, request }) => {
    // Create test data via API
    const createResponse = await request.post('/api/projects', {
      data: {
        name: 'API Test Project',
        description: 'Created via API for E2E test',
        status: 'active'
      }
    });

    const project = await createResponse.json();
    expect(createResponse.ok()).toBeTruthy();

    // Navigate to UI and verify data appears
    await page.goto('/projects');
    await expect(page.getByRole('cell', { name: project.name })).toBeVisible();

    // Interact with data in UI
    await page.getByRole('cell', { name: project.name }).click();
    await expect(page.getByRole('heading', { name: project.name })).toBeVisible();
  });

  test('authenticated user flow using session cookie', async ({ page, context }) => {
    // Get auth token via API
    const loginResponse = await context.request.post('/api/auth/login', {
      data: {
        email: 'test@example.com',
        password: 'password123'
      }
    });

    const { token } = await loginResponse.json();

    // Set cookie and navigate (avoids login UI)
    await context.addCookies([
      {
        name: 'auth_token',
        value: token,
        domain: 'localhost',
        path: '/'
      }
    ]);

    // Go directly to protected page
    await page.goto('/dashboard');
    await expect(page.getByRole('heading', { name: 'Welcome' })).toBeVisible();
  });

  test('cleans up test data via API', async ({ page, request }) => {
    // Create data
    const createResponse = await request.post('/api/tasks', {
      data: { title: 'Test Task', status: 'todo' }
    });
    const task = await createResponse.json();

    // Interact in UI
    await page.goto('/tasks');
    await page.getByRole('checkbox', { name: task.title }).check();
    await expect(page.getByTestId(`task-${task.id}`)).toHaveClass(/completed/);

    // Cleanup via API after test
    test.afterEach(async () => {
      await request.delete(`/api/tasks/${task.id}`);
    });
  });
});
```

### Example 6: Visual Regression Testing

```typescript
import { test, expect } from '@playwright/test';

test.describe('Visual Regression Tests', () => {
  test('dashboard matches screenshots', async ({ page }) => {
    await page.goto('/dashboard');

    // Take full page screenshot
    await expect(page).toHaveScreenshot('dashboard.png');

    // Take element screenshot
    await expect(page.getByTestId('stats-card')).toHaveScreenshot('stats-card.png');
  });

  test('dark mode visual validation', async ({ page }) => {
    await page.goto('/settings');

    // Enable dark mode
    await page.getByRole('switch', { name: 'Dark Mode' }).click();

    // Screenshot in dark mode
    await expect(page).toHaveScreenshot('settings-dark-mode.png');
  });

  test('responsive screenshots', async ({ page }) => {
    await page.goto('/dashboard');

    // Capture different viewports
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page).toHaveScreenshot('dashboard-desktop.png');

    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page).toHaveScreenshot('dashboard-tablet.png');

    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page).toHaveScreenshot('dashboard-mobile.png');
  });
});
```
</examples>

## Integration Notes

<integration_notes>
### Playwright Integration

1. **Setup and Configuration**
   - Install: `npm install -D @playwright/test`
   - Initialize: `npx playwright init`
   - Install browsers: `npx playwright install`
   - Configure in `playwright.config.ts`

2. **Key Features**
   - Auto-waiting for elements before actions
   - Network interception and mocking
   - Multi-tab and multi-browser support
   - Trace viewer for debugging
   - Built-in test generator (codegen)

3. **CI/CD Integration**

```yaml
# GitHub Actions example
- name: Install dependencies
  run: npm ci

- name: Install Playwright Browsers
  run: npx playwright install --with-deps

- name: Run Playwright tests
  run: npx playwright test

- name: Upload test results
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

### Cypress Integration

1. **Setup and Configuration**
   - Install: `npm install -D cypress`
   - Open Cypress: `npx cypress open`
   - Run tests: `npx cypress run`
   - Configure in `cypress.config.js`

2. **Key Features**
   - Time travel debugging
   - Real-time reloads
   - Automatic waiting
   - Spies, stubs, and clocks
   - Network traffic control

3. **CI/CD Integration**

```yaml
# GitHub Actions example
- name: Run Cypress tests
  uses: cypress-io/github-action@v4
  with:
    browser: chrome
    record: true
  env:
    CYPRESS_RECORD_KEY: ${{ secrets.CYPRESS_RECORD_KEY }}
```

### Test Automation Platforms

1. **BrowserStack Integration**
   - Cross-browser testing at scale
   - Real device cloud
   - Parallel test execution
   - Automated screenshots and videos

2. **Sauce Labs Integration**
   - Sauce Labs integration for cloud testing
   - Support for emulators and simulators
   - Live testing capabilities
   - Performance metrics

3. **TestingBot Integration**
   - Large browser and device coverage
   - Video recording of tests
   - Screenshots on failure
   - REST API for test management

### Custom Integrations

1. **Docker Integration**

```dockerfile
FROM mcr.microsoft.com/playwright:v1.40.0-jammy

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

CMD ["npx", "playwright", "test"]
```

2. **Allure Reporting**
   - Generate detailed test reports
   - Attach screenshots and videos
   - Trend analysis over time
   - Integration with CI/CD pipelines

3. **Slack/Discord Notifications**
   - Alert on test failures
   - Summarize test results
   - Tag relevant team members
   - Link to detailed reports
</integration_notes>

## Error Handling

<error_handling>
### Handling Flaky Tests

1. **Identify Flaky Tests**
   - Run tests multiple times to detect flakiness
   - Use CI platforms that track test history
   - Monitor test failure patterns
   - Set up flaky test detection in CI

2. **Common Causes and Solutions**

**Timing Issues:**
- Cause: Race conditions, network latency
- Solution: Use explicit waits, retry mechanisms, proper selectors

**State Leaks:**
- Cause: Tests sharing state, improper cleanup
- Solution: Ensure test isolation, proper setup/teardown

**External Dependencies:**
- Cause: Unreliable external APIs/services
- Solution: Mock external services, use API-first approach

**Browser/Environment Issues:**
- Cause: Browser crashes, resource exhaustion
- Solution: Restart browser between tests, monitor resources

3. **Retry Strategies**

```typescript
// Playwright built-in retry
test('flaky test', async ({ page }) => {
  // Test will retry up to 3 times if it fails
  await page.goto('/');
  await expect(page.getByText('Content')).toBeVisible();
}).configure({ retries: 3 });

// Custom retry logic
async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Max retries exceeded');
}
```

### Timeout Handling

1. **Configurable Timeouts**

```typescript
// Global timeout in playwright.config.ts
export default defineConfig({
  timeout: 30000, // 30 seconds for each test
  expect: {
    timeout: 5000 // 5 seconds for each assertion
  }
});

// Per-test timeout
test('slow test', async ({ page }) => {
  test.setTimeout(60000); // 60 seconds for this test
  await page.goto('/');
});

// Per-action timeout
await page.click('[data-testid="button"]', { timeout: 10000 });
```

2. **Timeout Best Practices**
   - Set reasonable default timeouts
   - Override only when necessary with clear justification
   - Monitor test execution times
   - Optimize slow tests instead of just increasing timeouts

### Network Error Handling

1. **Handling Failed Requests**

```typescript
// Intercept and handle network errors
page.route('**/api/**', route => {
  route.fulfill({
    status: 500,
    body: JSON.stringify({ error: 'Server error' })
  });
});

// Retry failed requests
test('handles network errors gracefully', async ({ page }) => {
  page.on('response', response => {
    if (response.status() === 500) {
      // Log error, retry, or fail gracefully
    }
  });
});
```

2. **Offline Testing**

```typescript
test('works offline', async ({ page, context }) => {
  await context.setOffline(true);
  await page.goto('/');
  await expect(page.getByText('Offline mode')).toBeVisible();
});
```

### Authentication Failures

1. **Handle Auth Errors**

```typescript
test('redirects to login on auth failure', async ({ page }) => {
  // Set invalid token
  await page.goto('/dashboard');
  await page.evaluate(() => {
    localStorage.setItem('auth_token', 'invalid_token');
  });

  // Reload and verify redirect
  await page.reload();
  await expect(page).toHaveURL('/login');
  await expect(page.getByText('Session expired')).toBeVisible();
});
```

2. **Test Multiple Auth Scenarios**
   - Valid credentials
   - Invalid credentials
   - Expired tokens
   - Permission denied scenarios

### Error Reporting

1. **Comprehensive Error Messages**

```typescript
test('provides clear error messages', async ({ page }) => {
  try {
    await page.click('[data-testid="submit"]');
    await expect(page.getByText('Success')).toBeVisible();
  } catch (error) {
    // Add context to error
    const screenshot = await page.screenshot();
    console.error('Test failed at:', page.url());
    console.error('Screenshot saved:', screenshot);
    throw error;
  }
});
```

2. **Test Artifacts on Failure**
   - Automatically capture screenshots
   - Record video of test execution
   - Save page HTML/DOM state
   - Log network requests and console errors
</error_handling>

## Output Format

<output_format>
### Test Report Structure

E2E tests should produce comprehensive reports including:

1. **Execution Summary**
   - Total tests run
   - Passed/Failed/Skipped counts
   - Execution time
   - Success rate percentage

2. **Detailed Results**
   - Test name and description
   - Execution status (pass/fail/skip)
   - Duration
   - Error messages and stack traces

3. **Artifacts**
   - Screenshots (especially on failure)
   - Videos of test execution
   - Trace files for debugging
   - HTML snapshots

4. **Coverage Metrics**
   - User journey coverage
   - Feature coverage
   - Browser/device coverage matrix

### Report Formats

1. **Console Output**
   - Real-time progress updates
   - Clear pass/fail indicators
   - Test execution times
   - Error summaries

2. **HTML Reports**
   - Interactive test results
   - Embedded screenshots and videos
   - Filterable by status/browser
   - Trend analysis over time

3. **JSON Reports**
   - Machine-readable format
   - CI/CD integration
   - Custom report generation
   - Historical data analysis

4. **Allure Reports**
   - Comprehensive dashboard
   - Test history and trends
   - Screenshots and attachments
   - Environment information

### CI/CD Integration

1. **Exit Codes**
   - 0: All tests passed
   - Non-zero: Tests failed or errored
   - Proper CI failure triggers

2. **Test Artifacts Storage**
   - Upload reports as artifacts
   - Retention policies for historical data
   - Easy access for team members
   - Integration with monitoring tools

3. **Notifications**
   - Alert on test failures
   - Summary reports to communication channels
   - Tag relevant team members
   - Link to detailed reports
</output_format>

## Related Skills

<related_skills>
- **integration-testing**: Testing interactions between components and modules
- **unit-testing**: Testing individual functions and components in isolation
- **test-driven-development**: Writing tests before implementation code
- **continuous-integration**: Integrating E2E tests into CI/CD pipelines
- **playwright**: Advanced Playwright testing techniques and patterns
- **cypress**: Advanced Cypress testing techniques and patterns
- **visual-testing**: Visual regression testing with automated screenshot comparison
- **api-testing**: Testing API endpoints and integrations
- **performance-testing**: Measuring and optimizing application performance
</related_skills>

## See Also

<see_also>
### Documentation

- **Playwright Documentation**: https://playwright.dev
  - Best Practices: https://playwright.dev/docs/best-practices
  - Guides: https://playwright.dev/docs/intro
  - API Reference: https://playwright.dev/docs/api/class-playwright

- **Cypress Documentation**: https://docs.cypress.io
  - Best Practices: https://docs.cypress.io/guides/references/best-practices
  - API Testing: https://docs.cypress.io/guides/api-testing
  - Custom Commands: https://docs.cypress.io/api/cypress-api/custom-commands

### Testing Best Practices

- **Google Testing Blog**: Testing strategies and best practices from industry experts
- **Martin Fowler's Testing Blog**: Thought leadership on testing methodologies
- **Testing JavaScript**: Book by Mark Ethan Trostler on JavaScript testing
- **The Art of Unit Testing**: Roy Osherove's guide to test design

### Tools and Platforms

- **BrowserStack**: https://www.browserstack.com
- **Sauce Labs**: https://saucelabs.com
- **TestingBot**: https://testingbot.com
- **Applitools**: Visual testing and AI-powered validation

### Community Resources

- **Testing Library**: https://testing-library.com - User-centric testing utilities
- **Awesome Testing**: Curated list of testing resources
- **E2E Testing Discussions**: GitHub discussions on E2E testing patterns
</see_also>
