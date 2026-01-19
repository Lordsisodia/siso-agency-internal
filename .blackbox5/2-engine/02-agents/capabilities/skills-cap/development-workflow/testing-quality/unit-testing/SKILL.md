---
name: unit-testing
category: development-workflow/testing-quality
title: Unit Testing Best Practices
description: Comprehensive guide to unit testing with AAA pattern, test isolation, mocking, and best practices for Jest, Vitest, and Pytest
version: 1.0.0
last_updated: 2026-01-18
tags: [testing, tdd, jest, vitest, pytest, unit-tests, mocking, coverage]
dependencies: []
related_skills: [test-driven-development, systematic-debugging]
---

<context>
Unit testing is the foundation of a reliable test suite. This skill provides comprehensive patterns for writing effective unit tests that are fast, reliable, and maintainable. You'll learn to use the Arrange-Act-Assert (AAA) pattern, properly isolate tests, mock dependencies effectively, and achieve high test coverage without sacrificing code quality.

This skill covers:
- AAA (Arrange-Act-Assert) pattern
- Test isolation and independence
- Mocking and stubbing strategies
- Test doubles (fakes, dummies, spies)
- Edge case and boundary testing
- Test coverage analysis
- Parameterized tests
- Testing async code
- Setup/teardown patterns
- Test organization and naming

Whether you're using Jest, Vitest, or Pytest, these patterns will help you create comprehensive test suites that catch bugs early and serve as living documentation.
</context>

<instructions>
When writing unit tests:

1. **Follow the AAA pattern consistently**
   - Arrange: Set up test data, configure mocks, initialize system under test
   - Act: Execute the function/method being tested
   - Assert: Verify the expected outcome
   - Keep each section clearly separated

2. **Ensure test isolation**
   - Each test should be independent and runnable in any order
   - Don't share state between tests
   - Clean up in tearDown or after hooks
   - Use fresh fixtures for each test
   - Avoid dependencies on external services

3. **Write descriptive test names**
   - Use the pattern: "should [expected behavior] when [state/context]"
   - Make test names self-documenting
   - Avoid generic names like "test1" or "works"
   - Include business logic context

4. **Test one thing per test**
   - Focus on a single behavior or assertion
   - Use multiple tests for multiple scenarios
   - Avoid multiple act/assert blocks
   - Keep tests short and focused

5. **Mock external dependencies**
   - Mock network calls, database queries, file I/O
   - Use test doubles for complex dependencies
   - Verify mock interactions when relevant
   - Don't mock the system under test

6. **Test edge cases and boundaries**
   - Test with empty inputs, null/undefined values
   - Test at boundaries (0, -1, max value)
   - Test error conditions and exceptions
   - Test with invalid inputs

7. **Maintain test readability**
   - Use helper functions for complex setup
   - Extract reusable test fixtures
   - Keep test code simple and explicit
   - Avoid complex logic in tests
</instructions>

<rules>
- NEVER write tests that depend on execution order
- MUST mock all external dependencies (network, database, filesystem)
- ALWAYS clean up resources in teardown hooks
- NEVER use real dates/times (use fixed time mocks)
- MUST have descriptive test names following AAA convention
- ALWAYS assert on meaningful outcomes (not implementation details)
- NEVER skip or disable tests without a documented reason
- MUST test both success and failure paths
- ALWAYS run tests before committing code
- NEVER use random data in tests without seeding
- MUST maintain consistent test style across the codebase
- ALWAYS fix broken tests immediately (never ignore failures)
</rules>

<workflow>
1. **Test Discovery**
   - Identify the function/class to test
   - Determine inputs, outputs, and side effects
   - List all test scenarios (happy path, edge cases, errors)
   - Identify external dependencies to mock

2. **Test Setup**
   - Create test file if needed
   - Import necessary testing utilities
   - Set up test fixtures and helpers
   - Configure mocks for dependencies

3. **Test Implementation**
   - Write test name following AAA pattern
   - Arrange: Set up test data and mocks
   - Act: Call the function with test input
   - Assert: Verify expected output/state
   - Repeat for each scenario

4. **Test Review**
   - Run tests and ensure they pass
   - Check test coverage (aim for 80%+)
   - Verify tests are independent
   - Ensure test names are descriptive

5. **Refactoring**
   - Extract common setup to fixtures
   - Create helper functions for complex assertions
   - Simplify test code
   - Document any testing patterns
</workflow>

<best_practices>
- Use test runners with watch mode for rapid feedback
- Keep tests fast (unit tests should run in milliseconds)
- Use describe blocks to group related tests
- Parameterize tests to test multiple inputs with one test
- Use beforeEach/afterEach for setup/teardown
- Test behavior, not implementation details
- Use type checking with tests (TypeScript/Python type hints)
- Maintain high test coverage but aim for meaningful coverage
- Write tests before or alongside code (TDD)
- Use custom matchers for domain-specific assertions
- Keep test code as clean as production code
- Review test code in code reviews
- Use snapshot testing judiciously (not for dynamic data)
- Test async code properly (await assertions, handle errors)
- Use test coverage tools to find untested code
- Document complex test scenarios
</best_practices>

<anti_patterns>
- ❌ Tests that depend on execution order
- ❌ Multiple assertions testing different behaviors
- ❌ Testing implementation details instead of behavior
- ❌ Mocking the system under test
- ❌ Tests that require external services (database, APIs)
- ❌ Using real dates/times (non-deterministic)
- ❌ Vague test names like "test1" or "works"
- ❌ Commented out or skipped tests
- ❌ Tests with complex logic (should be simple)
- ❌ Not cleaning up resources (memory leaks)
- ❌ Testing multiple scenarios in one test
- ❌ Not testing error paths
- ❌ Over-mocking (tests become brittle)
- ❌ Asserting on internal state instead of outputs
- ❌ Tests that take seconds to run (too slow for unit tests)
</anti_patterns>

<examples>
Example 1: AAA Pattern with Jest (JavaScript)
```javascript
// user.service.js
class UserService {
  constructor(userRepository, emailService) {
    this.userRepository = userRepository;
    this.emailService = emailService;
  }

  async createUser(userData) {
    // Validate input
    if (!userData.email || !userData.name) {
      throw new Error('Email and name are required');
    }

    // Check if user exists
    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Create user
    const user = await this.userRepository.create({
      name: userData.name,
      email: userData.email,
      createdAt: new Date()
    });

    // Send welcome email
    await this.emailService.sendWelcomeEmail(user.email, user.name);

    return user;
  }

  async getUserById(userId) {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }
}

module.exports = { UserService };
```

```javascript
// user.service.test.js
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UserService } from './user.service';

describe('UserService', () => {
  let userService;
  let mockUserRepository;
  let mockEmailService;

  beforeEach(() => {
    // Arrange: Set up mocks before each test
    mockUserRepository = {
      findByEmail: vi.fn(),
      create: vi.fn(),
      findById: vi.fn()
    };

    mockEmailService = {
      sendWelcomeEmail: vi.fn()
    };

    userService = new UserService(mockUserRepository, mockEmailService);
  });

  describe('createUser', () => {
    it('should create a new user when valid data is provided', async () => {
      // Arrange
      const userData = {
        name: 'John Doe',
        email: 'john@example.com'
      };

      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue({
        id: '123',
        ...userData,
        createdAt: new Date()
      });

      // Act
      const result = await userService.createUser(userData);

      // Assert
      expect(result).toMatchObject({
        id: '123',
        name: 'John Doe',
        email: 'john@example.com'
      });
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('john@example.com');
      expect(mockUserRepository.create).toHaveBeenCalled();
      expect(mockEmailService.sendWelcomeEmail).toHaveBeenCalledWith(
        'john@example.com',
        'John Doe'
      );
    });

    it('should throw error when email is missing', async () => {
      // Arrange
      const userData = {
        name: 'John Doe'
      };

      // Act & Assert
      await expect(userService.createUser(userData))
        .rejects.toThrow('Email and name are required');

      expect(mockUserRepository.findByEmail).not.toHaveBeenCalled();
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });

    it('should throw error when name is missing', async () => {
      // Arrange
      const userData = {
        email: 'john@example.com'
      };

      // Act & Assert
      await expect(userService.createUser(userData))
        .rejects.toThrow('Email and name are required');

      expect(mockUserRepository.findByEmail).not.toHaveBeenCalled();
    });

    it('should throw error when user with email already exists', async () => {
      // Arrange
      const userData = {
        name: 'John Doe',
        email: 'john@example.com'
      };

      mockUserRepository.findByEmail.mockResolvedValue({
        id: 'existing-123',
        email: 'john@example.com'
      });

      // Act & Assert
      await expect(userService.createUser(userData))
        .rejects.toThrow('User with this email already exists');

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('john@example.com');
      expect(mockUserRepository.create).not.toHaveBeenCalled();
      expect(mockEmailService.sendWelcomeEmail).not.toHaveBeenCalled();
    });

    it('should send welcome email after creating user', async () => {
      // Arrange
      const userData = {
        name: 'Jane Doe',
        email: 'jane@example.com'
      };

      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue({
        id: '456',
        ...userData,
        createdAt: new Date()
      });

      // Act
      await userService.createUser(userData);

      // Assert
      expect(mockEmailService.sendWelcomeEmail).toHaveBeenCalledWith(
        'jane@example.com',
        'Jane Doe'
      );
    });

    it('should handle repository errors gracefully', async () => {
      // Arrange
      const userData = {
        name: 'John Doe',
        email: 'john@example.com'
      };

      mockUserRepository.findByEmail.mockRejectedValue(
        new Error('Database connection failed')
      );

      // Act & Assert
      await expect(userService.createUser(userData))
        .rejects.toThrow('Database connection failed');
    });
  });

  describe('getUserById', () => {
    it('should return user when valid ID is provided', async () => {
      // Arrange
      const userId = 'user-123';
      const expectedUser = {
        id: userId,
        name: 'John Doe',
        email: 'john@example.com'
      };

      mockUserRepository.findById.mockResolvedValue(expectedUser);

      // Act
      const result = await userService.getUserById(userId);

      // Assert
      expect(result).toEqual(expectedUser);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
    });

    it('should throw error when ID is not provided', async () => {
      // Act & Assert
      await expect(userService.getUserById())
        .rejects.toThrow('User ID is required');

      expect(mockUserRepository.findById).not.toHaveBeenCalled();
    });

    it('should throw error when user is not found', async () => {
      // Arrange
      const userId = 'non-existent';
      mockUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(userService.getUserById(userId))
        .rejects.toThrow('User not found');

      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
    });

    it('should throw error when ID is empty string', async () => {
      // Act & Assert
      await expect(userService.getUserById(''))
        .rejects.toThrow('User ID is required');
    });
  });
});
```

Example 2: Parameterized Tests with Pytest (Python)
```python
# calculator.py
class Calculator:
    @staticmethod
    def add(a, b):
        return a + b

    @staticmethod
    def subtract(a, b):
        return a - b

    @staticmethod
    def multiply(a, b):
        return a * b

    @staticmethod
    def divide(a, b):
        if b == 0:
            raise ValueError("Cannot divide by zero")
        return a / b

    @staticmethod
    def power(base, exponent):
        return base ** exponent
```

```python
# test_calculator.py
import pytest
from calculator import Calculator


class TestCalculator:
    """Test suite for Calculator class using AAA pattern."""

    def test_add_should_return_sum_when_both_numbers_are_positive(self):
        # Arrange
        calculator = Calculator()
        a = 5
        b = 3
        expected = 8

        # Act
        result = calculator.add(a, b)

        # Assert
        assert result == expected

    def test_add_should_return_negative_sum_when_both_numbers_are_negative(self):
        # Arrange
        calculator = Calculator()
        a = -5
        b = -3
        expected = -8

        # Act
        result = calculator.add(a, b)

        # Assert
        assert result == expected

    @pytest.mark.parametrize("a,b,expected", [
        (5, 3, 8),      # Positive numbers
        (-5, -3, -8),    # Negative numbers
        (5, -3, 2),      # Mixed signs
        (0, 0, 0),       # Zeros
        (1.5, 2.5, 4.0), # Floats
        (100, 200, 300), # Large numbers
    ])
    def test_add_should_return_sum_for_various_inputs(self, a, b, expected):
        # Arrange
        calculator = Calculator()

        # Act
        result = calculator.add(a, b)

        # Assert
        assert result == expected

    @pytest.mark.parametrize("a,b,expected", [
        (10, 2, 5),
        (20, 4, 5),
        (100, 10, 10),
        (7, 2, 3.5),
    ])
    def test_divide_should_return_quotient_when_divisor_is_not_zero(self, a, b, expected):
        # Arrange
        calculator = Calculator()

        # Act
        result = calculator.divide(a, b)

        # Assert
        assert result == expected

    @pytest.mark.parametrize("a,b", [
        (10, 0),
        (0, 0),
        (-5, 0),
    ])
    def test_divide_should_raise_error_when_divisor_is_zero(self, a, b):
        # Arrange
        calculator = Calculator()

        # Act & Assert
        with pytest.raises(ValueError, match="Cannot divide by zero"):
            calculator.divide(a, b)

    @pytest.mark.parametrize("base,exponent,expected", [
        (2, 3, 8),      # Positive exponent
        (2, -2, 0.25),  # Negative exponent
        (5, 0, 1),      # Zero exponent
        (10, 1, 10),    # Exponent of 1
        (-2, 3, -8),    # Negative base
        (-2, 2, 4),     # Negative base, even exponent
    ])
    def test_power_should_return_correct_result_for_various_exponents(
        self, base, exponent, expected
    ):
        # Arrange
        calculator = Calculator()

        # Act
        result = calculator.power(base, exponent)

        # Assert
        assert result == expected

    def test_multiply_should_return_zero_when_one_operand_is_zero(self):
        # Arrange
        calculator = Calculator()

        # Act
        result = calculator.multiply(5, 0)

        # Assert
        assert result == 0

    def test_multiply_should_return_product_when_both_operands_are_positive(self):
        # Arrange
        calculator = Calculator()
        a = 5
        b = 3
        expected = 15

        # Act
        result = calculator.multiply(a, b)

        # Assert
        assert result == expected

    def test_multiply_should_return_negative_product_when_one_operand_is_negative(self):
        # Arrange
        calculator = Calculator()
        a = 5
        b = -3
        expected = -15

        # Act
        result = calculator.multiply(a, b)

        # Assert
        assert result == expected

    def test_multiply_should_return_positive_product_when_both_operands_are_negative(self):
        # Arrange
        calculator = Calculator()
        a = -5
        b = -3
        expected = 15

        # Act
        result = calculator.multiply(a, b)

        # Assert
        assert result == expected
```

Example 3: Testing Async Code with Vitest (JavaScript)
```javascript
// api.service.js
class ApiService {
  constructor(httpClient) {
    this.httpClient = httpClient;
  }

  async fetchUser(userId) {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const response = await this.httpClient.get(`/users/${userId}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch user: ${response.status}`);
    }

    return response.json();
  }

  async fetchUsersWithRetry(userId, maxRetries = 3) {
    let lastError;

    for (let i = 0; i < maxRetries; i++) {
      try {
        return await this.fetchUser(userId);
      } catch (error) {
        lastError = error;
        await this.delay(1000 * (i + 1)); // Exponential backoff
      }
    }

    throw lastError;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async fetchMultipleUsers(userIds) {
    const promises = userIds.map(id => this.fetchUser(id));
    return Promise.all(promises);
  }
}

module.exports = { ApiService };
```

```javascript
// api.service.test.js
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ApiService } from './api.service';

describe('ApiService', () => {
  let apiService;
  let mockHttpClient;

  beforeEach(() => {
    vi.useFakeTimers();

    mockHttpClient = {
      get: vi.fn()
    };

    apiService = new ApiService(mockHttpClient);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('fetchUser', () => {
    it('should return user data when request is successful', async () => {
      // Arrange
      const userId = 'user-123';
      const expectedUser = { id: userId, name: 'John Doe' };

      mockHttpClient.get.mockResolvedValue({
        ok: true,
        json: async () => expectedUser
      });

      // Act
      const result = await apiService.fetchUser(userId);

      // Assert
      expect(result).toEqual(expectedUser);
      expect(mockHttpClient.get).toHaveBeenCalledWith(`/users/${userId}`);
    });

    it('should throw error when user ID is not provided', async () => {
      // Act & Assert
      await expect(apiService.fetchUser())
        .rejects.toThrow('User ID is required');

      expect(mockHttpClient.get).not.toHaveBeenCalled();
    });

    it('should throw error when request fails', async () => {
      // Arrange
      const userId = 'user-123';

      mockHttpClient.get.mockResolvedValue({
        ok: false,
        status: 404
      });

      // Act & Assert
      await expect(apiService.fetchUser(userId))
        .rejects.toThrow('Failed to fetch user: 404');
    });

    it('should throw error when network fails', async () => {
      // Arrange
      const userId = 'user-123';
      mockHttpClient.get.mockRejectedValue(new Error('Network error'));

      // Act & Assert
      await expect(apiService.fetchUser(userId))
        .rejects.toThrow('Network error');
    });
  });

  describe('fetchUsersWithRetry', () => {
    it('should return user on first attempt', async () => {
      // Arrange
      const userId = 'user-123';
      const expectedUser = { id: userId, name: 'John Doe' };

      mockHttpClient.get.mockResolvedValue({
        ok: true,
        json: async () => expectedUser
      });

      // Act
      const result = await apiService.fetchUsersWithRetry(userId);

      // Assert
      expect(result).toEqual(expectedUser);
      expect(mockHttpClient.get).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and eventually succeed', async () => {
      // Arrange
      const userId = 'user-123';
      const expectedUser = { id: userId, name: 'John Doe' };

      mockHttpClient.get
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValue({
          ok: true,
          json: async () => expectedUser
        });

      // Act
      const promise = apiService.fetchUsersWithRetry(userId);

      // Fast-forward timers
      await vi.advanceTimersByTimeAsync(1000); // First retry delay
      await vi.advanceTimersByTimeAsync(2000); // Second retry delay

      const result = await promise;

      // Assert
      expect(result).toEqual(expectedUser);
      expect(mockHttpClient.get).toHaveBeenCalledTimes(3);
    });

    it('should throw error after max retries', async () => {
      // Arrange
      const userId = 'user-123';
      mockHttpClient.get.mockRejectedValue(new Error('Network error'));

      // Act & Assert
      const promise = apiService.fetchUsersWithRetry(userId, 2);

      // Fast-forward all retries
      await vi.advanceTimersByTimeAsync(1000); // First retry
      await vi.advanceTimersByTimeAsync(2000); // Second retry

      await expect(promise).rejects.toThrow('Network error');
      expect(mockHttpClient.get).toHaveBeenCalledTimes(2);
    });
  });

  describe('fetchMultipleUsers', () => {
    it('should fetch all users successfully', async () => {
      // Arrange
      const userIds = ['user-1', 'user-2', 'user-3'];
      const expectedUsers = [
        { id: 'user-1', name: 'User 1' },
        { id: 'user-2', name: 'User 2' },
        { id: 'user-3', name: 'User 3' }
      ];

      mockHttpClient.get
        .mockResolvedValueOnce({ ok: true, json: async () => expectedUsers[0] })
        .mockResolvedValueOnce({ ok: true, json: async () => expectedUsers[1] })
        .mockResolvedValueOnce({ ok: true, json: async () => expectedUsers[2] });

      // Act
      const result = await apiService.fetchMultipleUsers(userIds);

      // Assert
      expect(result).toEqual(expectedUsers);
      expect(mockHttpClient.get).toHaveBeenCalledTimes(3);
    });

    it('should fail fast when one request fails', async () => {
      // Arrange
      const userIds = ['user-1', 'user-2', 'user-3'];

      mockHttpClient.get
        .mockResolvedValueOnce({ ok: true, json: async () => ({ id: 'user-1' }) })
        .mockRejectedValueOnce(new Error('Network error'));

      // Act & Assert
      await expect(apiService.fetchMultipleUsers(userIds))
        .rejects.toThrow('Network error');
    });
  });
});
```

Example 4: Mocking with Pytest (Python)
```python
# order_service.py
from datetime import datetime
from typing import List, Optional


class OrderService:
    def __init__(self, order_repository, payment_service, email_service):
        self.order_repository = order_repository
        self.payment_service = payment_service
        self.email_service = email_service

    def create_order(self, user_id: str, items: List[dict]) -> dict:
        # Calculate total
        total = sum(item['price'] * item['quantity'] for item in items)

        # Create order
        order = {
            'id': 'order-123',
            'user_id': user_id,
            'items': items,
            'total': total,
            'status': 'pending',
            'created_at': datetime.now()
        }

        # Save order
        saved_order = self.order_repository.save(order)

        # Process payment
        payment_result = self.payment_service.charge(
            user_id=user_id,
            amount=total,
            order_id=order['id']
        )

        if not payment_result['success']:
            saved_order['status'] = 'payment_failed'
            self.order_repository.update(saved_order)
            raise ValueError('Payment failed')

        # Update order status
        saved_order['status'] = 'confirmed'
        self.order_repository.update(saved_order)

        # Send confirmation email
        self.email_service.send_order_confirmation(
            user_id=user_id,
            order_id=order['id']
        )

        return saved_order

    def get_order(self, order_id: str) -> Optional[dict]:
        return self.order_repository.find_by_id(order_id)
```

```python
# test_order_service.py
import pytest
from unittest.mock import Mock, MagicMock, patch
from datetime import datetime
from order_service import OrderService


class TestOrderService:
    """Test suite for OrderService with proper mocking."""

    @pytest.fixture
    def mock_order_repository(self):
        """Fixture for mocked order repository."""
        return Mock()

    @pytest.fixture
    def mock_payment_service(self):
        """Fixture for mocked payment service."""
        return Mock()

    @pytest.fixture
    def mock_email_service(self):
        """Fixture for mocked email service."""
        return Mock()

    @pytest.fixture
    def order_service(self, mock_order_repository, mock_payment_service, mock_email_service):
        """Fixture for order service with mocked dependencies."""
        return OrderService(
            order_repository=mock_order_repository,
            payment_service=mock_payment_service,
            email_service=mock_email_service
        )

    def test_create_order_should_save_and_confirm_when_payment_succeeds(
        self, order_service, mock_order_repository, mock_payment_service, mock_email_service
    ):
        # Arrange
        user_id = 'user-123'
        items = [
            {'product_id': 'prod-1', 'price': 10.0, 'quantity': 2},
            {'product_id': 'prod-2', 'price': 5.0, 'quantity': 1}
        ]

        expected_order = {
            'id': 'order-123',
            'user_id': user_id,
            'items': items,
            'total': 25.0,
            'status': 'confirmed',
            'created_at': datetime.now()
        }

        mock_order_repository.save.return_value = {
            'id': 'order-123',
            'user_id': user_id,
            'items': items,
            'total': 25.0,
            'status': 'pending'
        }
        mock_order_repository.update.return_value = expected_order
        mock_payment_service.charge.return_value = {'success': True, 'transaction_id': 'txn-123'}

        # Act
        result = order_service.create_order(user_id, items)

        # Assert
        assert result['status'] == 'confirmed'
        assert result['total'] == 25.0

        # Verify repository calls
        mock_order_repository.save.assert_called_once()
        saved_order = mock_order_repository.save.call_args[0][0]
        assert saved_order['status'] == 'pending'
        assert saved_order['total'] == 25.0

        # Verify payment service call
        mock_payment_service.charge.assert_called_once_with(
            user_id=user_id,
            amount=25.0,
            order_id='order-123'
        )

        # Verify email service call
        mock_email_service.send_order_confirmation.assert_called_once_with(
            user_id=user_id,
            order_id='order-123'
        )

    def test_create_order_should_fail_when_payment_fails(
        self, order_service, mock_order_repository, mock_payment_service, mock_email_service
    ):
        # Arrange
        user_id = 'user-123'
        items = [{'product_id': 'prod-1', 'price': 10.0, 'quantity': 2}]

        mock_order_repository.save.return_value = {
            'id': 'order-123',
            'status': 'pending',
            'total': 20.0
        }
        mock_order_repository.update.return_value = {
            'id': 'order-123',
            'status': 'payment_failed',
            'total': 20.0
        }
        mock_payment_service.charge.return_value = {'success': False, 'error': 'Insufficient funds'}

        # Act & Assert
        with pytest.raises(ValueError, match='Payment failed'):
            order_service.create_order(user_id, items)

        # Verify order was updated with failed status
        mock_order_repository.update.assert_called()
        updated_order = mock_order_repository.update.call_args[0][0]
        assert updated_order['status'] == 'payment_failed'

        # Verify email was NOT sent
        mock_email_service.send_order_confirmation.assert_not_called()

    def test_get_order_should_return_order_when_exists(
        self, order_service, mock_order_repository
    ):
        # Arrange
        order_id = 'order-123'
        expected_order = {
            'id': order_id,
            'status': 'confirmed'
        }
        mock_order_repository.find_by_id.return_value = expected_order

        # Act
        result = order_service.get_order(order_id)

        # Assert
        assert result == expected_order
        mock_order_repository.find_by_id.assert_called_once_with(order_id)

    def test_get_order_should_return_none_when_not_found(
        self, order_service, mock_order_repository
    ):
        # Arrange
        order_id = 'non-existent'
        mock_order_repository.find_by_id.return_value = None

        # Act
        result = order_service.get_order(order_id)

        # Assert
        assert result is None
        mock_order_repository.find_by_id.assert_called_once_with(order_id)

    @patch('order_service.datetime')
    def test_create_order_should_use_current_datetime(
        self, mock_datetime, order_service, mock_order_repository, mock_payment_service
    ):
        # Arrange
        user_id = 'user-123'
        items = [{'product_id': 'prod-1', 'price': 10.0, 'quantity': 1}]
        fixed_time = datetime(2024, 1, 18, 10, 0, 0)

        mock_datetime.now.return_value = fixed_time
        mock_order_repository.save.return_value = {
            'id': 'order-123',
            'status': 'pending',
            'created_at': fixed_time
        }
        mock_order_repository.update.return_value = {
            'id': 'order-123',
            'status': 'confirmed'
        }
        mock_payment_service.charge.return_value = {'success': True}

        # Act
        order_service.create_order(user_id, items)

        # Assert
        saved_order = mock_order_repository.save.call_args[0][0]
        assert saved_order['created_at'] == fixed_time
```

Example 5: Edge Cases and Boundary Testing
```javascript
// validator.service.js
class ValidatorService {
  validateAge(age) {
    if (age === null || age === undefined) {
      throw new Error('Age is required');
    }

    if (typeof age !== 'number') {
      throw new Error('Age must be a number');
    }

    if (!Number.isInteger(age)) {
      throw new Error('Age must be an integer');
    }

    if (age < 0) {
      throw new Error('Age cannot be negative');
    }

    if (age > 150) {
      throw new Error('Age must be realistic');
    }

    if (age < 18) {
      return { valid: false, reason: 'Must be 18 or older' };
    }

    return { valid: true };
  }

  validateEmail(email) {
    if (!email || typeof email !== 'string') {
      throw new Error('Email is required and must be a string');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email);

    return {
      valid: isValid,
      reason: isValid ? null : 'Invalid email format'
    };
  }

  validateUsername(username) {
    if (!username || typeof username !== 'string') {
      throw new Error('Username is required and must be a string');
    }

    if (username.length < 3) {
      return { valid: false, reason: 'Username too short (min 3 characters)' };
    }

    if (username.length > 20) {
      return { valid: false, reason: 'Username too long (max 20 characters)' };
    }

    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(username)) {
      return { valid: false, reason: 'Username can only contain letters, numbers, hyphens, and underscores' };
    }

    return { valid: true };
  }
}

module.exports = { ValidatorService };
```

```javascript
// validator.service.test.js
import { describe, it, expect } from 'vitest';
import { ValidatorService } from './validator.service';

describe('ValidatorService', () => {
  let validator;

  beforeEach(() => {
    validator = new ValidatorService();
  });

  describe('validateAge', () => {
    describe('should throw error for invalid inputs', () => {
      it('should throw when age is null', () => {
        expect(() => validator.validateAge(null))
          .toThrow('Age is required');
      });

      it('should throw when age is undefined', () => {
        expect(() => validator.validateAge(undefined))
          .toThrow('Age is required');
      });

      it('should throw when age is a string', () => {
        expect(() => validator.validateAge('25'))
          .toThrow('Age must be a number');
      });

      it('should throw when age is a float', () => {
        expect(() => validator.validateAge(25.5))
          .toThrow('Age must be an integer');
      });

      it('should throw when age is negative', () => {
        expect(() => validator.validateAge(-1))
          .toThrow('Age cannot be negative');
      });

      it('should throw when age is unrealistically high', () => {
        expect(() => validator.validateAge(151))
          .toThrow('Age must be realistic');
      });
    });

    describe('boundary tests', () => {
      it('should return invalid when age is 0', () => {
        const result = validator.validateAge(0);
        expect(result.valid).toBe(false);
        expect(result.reason).toBe('Must be 18 or older');
      });

      it('should return invalid when age is 17', () => {
        const result = validator.validateAge(17);
        expect(result.valid).toBe(false);
        expect(result.reason).toBe('Must be 18 or older');
      });

      it('should return valid when age is exactly 18', () => {
        const result = validator.validateAge(18);
        expect(result.valid).toBe(true);
      });

      it('should return valid when age is 19', () => {
        const result = validator.validateAge(19);
        expect(result.valid).toBe(true);
      });

      it('should return valid when age is 150', () => {
        const result = validator.validateAge(150);
        expect(result.valid).toBe(true);
      });

      it('should return valid when age is 100', () => {
        const result = validator.validateAge(100);
        expect(result.valid).toBe(true);
      });
    });
  });

  describe('validateEmail', () => {
    it('should throw when email is null', () => {
      expect(() => validator.validateEmail(null))
        .toThrow('Email is required and must be a string');
    });

    it('should throw when email is not a string', () => {
      expect(() => validator.validateEmail(123))
        .toThrow('Email is required and must be a string');
    });

    it('should return invalid for empty string', () => {
      const result = validator.validateEmail('');
      expect(result.valid).toBe(false);
    });

    it('should return invalid for email without @', () => {
      const result = validator.validateEmail('invalidemail.com');
      expect(result.valid).toBe(false);
    });

    it('should return invalid for email without domain', () => {
      const result = validator.validateEmail('user@');
      expect(result.valid).toBe(false);
    });

    it('should return invalid for email without TLD', () => {
      const result = validator.validateEmail('user@domain');
      expect(result.valid).toBe(false);
    });

    it('should return valid for proper email', () => {
      const result = validator.validateEmail('user@example.com');
      expect(result.valid).toBe(true);
    });

    it('should return valid for email with subdomain', () => {
      const result = validator.validateEmail('user@mail.example.com');
      expect(result.valid).toBe(true);
    });

    it('should return valid for email with numbers', () => {
      const result = validator.validateEmail('user123@example.com');
      expect(result.valid).toBe(true);
    });

    it('should return valid for email with dots', () => {
      const result = validator.validateEmail('first.last@example.com');
      expect(result.valid).toBe(true);
    });

    it('should return valid for email with plus sign', () => {
      const result = validator.validateEmail('user+tag@example.com');
      expect(result.valid).toBe(true);
    });
  });

  describe('validateUsername', () => {
    it('should throw when username is null', () => {
      expect(() => validator.validateUsername(null))
        .toThrow('Username is required and must be a string');
    });

    it('should return invalid when username is too short', () => {
      const result = validator.validateUsername('ab');
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('Username too short (min 3 characters)');
    });

    it('should return invalid when username is exactly at min length', () => {
      const result = validator.validateUsername('ab');
      expect(result.valid).toBe(false);
    });

    it('should return valid when username is exactly 3 characters', () => {
      const result = validator.validateUsername('abc');
      expect(result.valid).toBe(true);
    });

    it('should return valid when username is exactly 20 characters', () => {
      const result = validator.validateUsername('a'.repeat(20));
      expect(result.valid).toBe(true);
    });

    it('should return invalid when username is 21 characters', () => {
      const result = validator.validateUsername('a'.repeat(21));
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('Username too long (max 20 characters)');
    });

    it('should return invalid when username contains spaces', () => {
      const result = validator.validateUsername('user name');
      expect(result.valid).toBe(false);
    });

    it('should return invalid when username contains special characters', () => {
      const result = validator.validateUsername('user@name');
      expect(result.valid).toBe(false);
    });

    it('should return valid when username contains hyphens', () => {
      const result = validator.validateUsername('user-name');
      expect(result.valid).toBe(true);
    });

    it('should return valid when username contains underscores', () => {
      const result = validator.validateUsername('user_name');
      expect(result.valid).toBe(true);
    });

    it('should return valid when username contains numbers', () => {
      const result = validator.validateUsername('user123');
      expect(result.valid).toBe(true);
    });
  });
});
```
</examples>

<integration_notes>
This skill integrates with:

- **test-driven-development**: TDD workflow for writing tests before code
- **systematic-debugging**: Debugging test failures and flaky tests
- **rest-api**: Testing API clients and integrations
- **sql-queries**: Testing database queries and migrations

When to use this skill:
- Writing unit tests for new features
- Improving test coverage for existing code
- Debugging test failures
- Reviewing test code in PRs
- Setting up testing infrastructure

Common pitfalls:
- Testing implementation instead of behavior
- Not isolating tests properly
- Over-mocking leading to brittle tests
- Ignoring edge cases and boundaries
- Not testing error paths
</integration_notes>

<error_handling>
Common test errors and solutions:

**Test Isolation Issues**
- Tests pass individually but fail in suite: Shared state between tests
- Solution: Use proper setup/teardown, fresh fixtures for each test

**Mocking Issues**
- Mock not being called: Wrong mock setup or method signature
- Solution: Verify mock setup matches actual implementation

**Async Test Issues**
- Timeout: Missing await or improper async handling
- Solution: Always await async operations, use proper async test patterns

**Flaky Tests**
- Intermittent failures: Timing issues, race conditions
- Solution: Mock time, eliminate external dependencies, use deterministic data

**Coverage Issues**
- Low coverage: Missing test scenarios
- Solution: Add tests for edge cases, error paths, branches

**Assertion Errors**
- Expected vs actual mismatch: Wrong expectations or implementation bug
- Solution: Debug with console.log, verify test data, check implementation
</error_handling>

<output_format>
Test files should follow this structure:

1. Import dependencies
2. Describe block for the class/module
3. Nested describe blocks for methods
4. Each test with descriptive name following "should [behavior] when [context]"
5. Comments for Arrange/Act/Assert sections (optional but helpful)

Example structure:
```javascript
describe('ClassName', () => {
  let subject;

  beforeEach(() => {
    // Setup
  });

  describe('methodName', () => {
    it('should return result when valid input', () => {
      // Arrange
      // Act
      // Assert
    });

    it('should throw error when invalid input', () => {
      // Arrange
      // Act & Assert
    });
  });
});
```
</output_format>

<related_skills>
- test-driven-development: TDD methodology
- systematic-debugging: Debugging techniques
- rest-api: Testing API integrations
- sql-queries: Testing database code
- linting-formatting: Maintaining test code quality
</related_skills>

<see_also>
- Jest Documentation: https://jestjs.io/
- Vitest Documentation: https://vitest.dev/
- Pytest Documentation: https://docs.pytest.org/
- Testing Best Practices: https://testingjavascript.com/
- Test-Driven Development: https://martinfowler.com/bliki/TestDrivenDevelopment.html
- AAA Pattern: https://wiki.c2.com/?ArrangeActAssert
</see_also>
