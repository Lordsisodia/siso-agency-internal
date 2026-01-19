---
name: rest-api
category: integration-connectivity/api-integrations
title: REST API Integration Patterns
description: Comprehensive guide to REST API integration, authentication, error handling, and best practices for building robust API clients
version: 1.0.0
last_updated: 2026-01-18
tags: [rest, api, http, integration, authentication, error-handling]
dependencies: []
related_skills: [webhooks, mcp-integrations/github]
---

<context>
REST APIs are the backbone of modern web services, enabling communication between different systems. This skill provides comprehensive patterns for integrating with REST APIs, handling authentication, managing errors gracefully, and implementing retry logic. You'll learn to build robust API clients that can handle network failures, rate limits, and various authentication schemes.

This skill covers:
- HTTP methods and their proper usage
- Authentication patterns (API keys, OAuth2, JWT, Bearer tokens)
- Error handling and retry strategies
- Request/response transformation
- Rate limiting and throttling
- Testing API integrations
- Security best practices
- Performance optimization

Whether you're building a client for a third-party API or designing your own RESTful service, these patterns will help you create reliable, maintainable integrations.
</context>

<instructions>
When working with REST APIs:

1. **Always implement proper error handling**
   - Never assume requests will succeed
   - Handle network errors, timeouts, and HTTP errors separately
   - Log errors with sufficient context for debugging
   - Implement retry logic with exponential backoff for transient failures

2. **Use appropriate HTTP methods**
   - GET: Retrieve resources (idempotent, safe)
   - POST: Create resources or trigger actions
   - PUT: Update entire resources (idempotent)
   - PATCH: Partial updates (may not be idempotent)
   - DELETE: Remove resources (idempotent)

3. **Implement authentication properly**
   - Never hardcode credentials in source code
   - Use environment variables or secure credential stores
   - Respect token expiration and refresh mechanisms
   - Use the least privilege principle for API keys

4. **Handle rate limiting gracefully**
   - Respect rate limit headers (X-RateLimit-*, Retry-After)
   - Implement queueing for bulk operations
   - Use backpressure when receiving 429 responses
   - Monitor rate limit usage to avoid throttling

5. **Version your API integrations**
   - Include API version in requests (header or URL)
   - Prepare for breaking changes
   - Test against API documentation
   - Monitor deprecation notices

6. **Validate responses**
   - Check HTTP status codes
   - Validate response structure/schema
   - Handle unexpected response formats
   - Sanitize data from external sources
</instructions>

<rules>
- NEVER hardcode API keys, tokens, or passwords in code
- ALWAYS use HTTPS for API calls (never HTTP)
- MUST implement timeout on all requests (default: 30 seconds)
- ALWAYS validate and sanitize external data before using it
- NEVER expose full error messages from external APIs to end users
- MUST implement retry logic for transient errors (5xx, network errors)
- ALWAYS respect robots.txt, terms of service, and rate limits
- NEVER cache sensitive data from API responses
- MUST log all API calls with request ID for tracing
- ALWAYS use appropriate HTTP status code handling (4xx vs 5xx)
</rules>

<workflow>
1. **Discovery Phase**
   - Read API documentation thoroughly
   - Identify authentication requirements
   - Note rate limits and quotas
   - Check for SDK availability (prefer official SDKs)
   - Identify base URL, versioning strategy

2. **Setup Phase**
   - Configure environment variables for credentials
   - Set up HTTP client with default configuration
   - Implement authentication flow
   - Configure retry logic and timeouts
   - Set up logging middleware

3. **Implementation Phase**
   - Create client class or module
   - Implement resource methods
   - Add request/response transformation
   - Implement error handling
   - Add request validation

4. **Testing Phase**
   - Test with mock server or sandbox
   - Verify authentication flow
   - Test error scenarios (network failures, rate limits)
   - Validate response parsing
   - Test retry logic

5. **Integration Phase**
   - Monitor API usage and errors
   - Set up alerts for failures
   - Document integration patterns
   - Create examples for common use cases
</workflow>

<best_practices>
- Use keep-alive connections to reduce latency
- Implement request cancellation for long-running operations
- Compress request bodies when appropriate
- Use connection pooling for high-volume operations
- Implement idempotency keys for critical operations
- Cache GET responses when appropriate (respect Cache headers)
- Use streaming for large file uploads/downloads
- Implement circuit breakers for downstream services
- Monitor API response times and error rates
- Use structured logging with correlation IDs
- Implement graceful degradation for non-critical features
- Use exponential backoff with jitter for retries
- Validate request parameters before sending
- Use TypeScript/Python type hints for request/response types
- Document all API integrations with examples
</best_practices>

<anti_patterns>
- ❌ Synchronous API calls in UI threads (blocks UI)
- ❌ Ignoring rate limits (leads to throttling/bans)
- ❌ Hardcoding credentials in source control
- ❌ Treating all errors the same way (network vs HTTP vs business logic)
- ❌ Not implementing timeouts (causes hanging requests)
- ❌ Exposing raw API errors to users (security risk)
- ❌ Making API calls without proper error handling
- ❌ Not validating response structure (causes runtime errors)
- ❌ Using GET requests for state changes (violates HTTP semantics)
- ❌ Not implementing retry logic for transient failures
- ❌ Polling instead of using webhooks when available
- ❌ Ignoring API deprecation notices
- ❌ Making redundant API calls (cache when possible)
- ❌ Not monitoring API usage and costs
- ❌ Using HTTP instead of HTTPS (security risk)
</anti_patterns>

<examples>
Example 1: Basic REST API Client with Authentication (JavaScript/Node.js)
```javascript
// rest-api-client.js
class APIClient {
  constructor(baseURL, apiKey) {
    this.baseURL = baseURL;
    this.apiKey = apiKey;
    this.timeout = 30000; // 30 seconds
    this.maxRetries = 3;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const requestId = crypto.randomUUID();

    const config = {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'MyApp/1.0',
        'X-Request-ID': requestId,
        ...options.headers
      },
      signal: AbortSignal.timeout(this.timeout)
    };

    let lastError;
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(`[API] ${requestId} ${options.method || 'GET'} ${url}`);

        const response = await fetch(url, config);

        // Handle rate limiting
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After');
          const delay = retryAfter ? parseInt(retryAfter) * 1000 : this.calculateBackoff(attempt);
          console.log(`[API] Rate limited, retrying after ${delay}ms`);
          await this.sleep(delay);
          continue;
        }

        // Handle server errors with retry
        if (response.status >= 500 && attempt < this.maxRetries) {
          const delay = this.calculateBackoff(attempt);
          console.log(`[API] Server error, retrying after ${delay}ms`);
          await this.sleep(delay);
          continue;
        }

        if (!response.ok) {
          const error = await this.handleError(response, requestId);
          throw error;
        }

        const data = await response.json();
        console.log(`[API] ${requestId} Success`);
        return data;

      } catch (error) {
        lastError = error;
        if (error.name === 'AbortError') {
          throw new APIError('Request timeout', 408, requestId);
        }
        if (attempt < this.maxRetries && this.isRetryable(error)) {
          const delay = this.calculateBackoff(attempt);
          await this.sleep(delay);
        }
      }
    }

    throw lastError;
  }

  calculateBackoff(attempt) {
    // Exponential backoff with jitter
    const baseDelay = 1000 * Math.pow(2, attempt);
    const jitter = Math.random() * 1000;
    return baseDelay + jitter;
  }

  isRetryable(error) {
    return error.code === 'ECONNRESET' ||
           error.code === 'ETIMEDOUT' ||
           error.message.includes('network');
  }

  async handleError(response, requestId) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = { message: response.statusText };
    }

    console.error(`[API] ${requestId} Error: ${response.status}`, errorData);

    return new APIError(
      errorData.message || 'API request failed',
      response.status,
      requestId,
      errorData
    );
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  get(endpoint, params) {
    const url = params ? `${endpoint}?${new URLSearchParams(params)}` : endpoint;
    return this.request(url, { method: 'GET' });
  }

  post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  patch(endpoint, data) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

class APIError extends Error {
  constructor(message, status, requestId, details = {}) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.requestId = requestId;
    this.details = details;
  }
}

// Usage
const client = new APIClient('https://api.example.com/v1', process.env.API_KEY);

// GET request
const users = await client.get('/users', { limit: 10 });

// POST request
const newUser = await client.post('/users', {
  name: 'John Doe',
  email: 'john@example.com'
});

// Error handling
try {
  const result = await client.get('/protected-resource');
} catch (error) {
  if (error.status === 401) {
    console.log('Authentication failed');
  } else if (error.status === 429) {
    console.log('Rate limited, please wait');
  } else if (error.status >= 500) {
    console.log('Server error, please try again');
  }
}
```

Example 2: REST API Client with OAuth2 (Python)
```python
# rest_api_client.py
import requests
import time
import logging
from typing import Optional, Dict, Any
from dataclasses import dataclass
from urllib.parse import urljoin

logger = logging.getLogger(__name__)


@dataclass
class APIError(Exception):
    status_code: int
    message: str
    request_id: str
    details: Dict[str, Any] = None


class OAuth2APIClient:
    def __init__(
        self,
        base_url: str,
        client_id: str,
        client_secret: str,
        token_url: str
    ):
        self.base_url = base_url.rstrip('/')
        self.client_id = client_id
        self.client_secret = client_secret
        self.token_url = token_url
        self.timeout = 30
        self.max_retries = 3

        self._access_token: Optional[str] = None
        self._refresh_token: Optional[str] = None
        self._token_expires_at: float = 0

        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'MyApp/1.0',
            'Accept': 'application/json'
        })

    def _ensure_authenticated(self):
        """Ensure we have a valid access token."""
        if time.time() >= self._token_expires_at - 300:  # Refresh 5 min early
            self._refresh_access_token()

    def _refresh_access_token(self):
        """Refresh the access token using OAuth2."""
        try:
            response = requests.post(
                self.token_url,
                data={
                    'grant_type': 'client_credentials',
                    'client_id': self.client_id,
                    'client_secret': self.client_secret
                },
                timeout=self.timeout
            )
            response.raise_for_status()

            data = response.json()
            self._access_token = data['access_token']
            self._refresh_token = data.get('refresh_token')
            expires_in = data.get('expires_in', 3600)
            self._token_expires_at = time.time() + expires_in

            logger.info("Successfully refreshed access token")

        except requests.RequestException as e:
            logger.error(f"Failed to refresh token: {e}")
            raise APIError(500, "Authentication failed", None)

    def _calculate_backoff(self, attempt: int) -> float:
        """Calculate exponential backoff with jitter."""
        base_delay = 1.0 * (2 ** attempt)
        jitter = time.time() % 1.0
        return base_delay + jitter

    def request(
        self,
        method: str,
        endpoint: str,
        **kwargs
    ) -> Dict[str, Any]:
        """Make an API request with retry logic."""
        url = urljoin(self.base_url + '/', endpoint.lstrip('/'))
        request_id = kwargs.pop('request_id', None)

        self._ensure_authenticated()

        headers = kwargs.pop('headers', {})
        headers['Authorization'] = f'Bearer {self._access_token}'

        last_error = None
        for attempt in range(self.max_retries + 1):
            try:
                logger.info(f"[{request_id}] {method} {url}")

                response = self.session.request(
                    method=method,
                    url=url,
                    headers=headers,
                    timeout=self.timeout,
                    **kwargs
                )

                # Handle rate limiting
                if response.status_code == 429:
                    retry_after = int(response.headers.get('Retry-After', 60))
                    logger.warning(f"Rate limited, retrying after {retry_after}s")
                    time.sleep(retry_after)
                    continue

                # Handle server errors with retry
                if response.status_code >= 500 and attempt < self.max_retries:
                    delay = self._calculate_backoff(attempt)
                    logger.warning(f"Server error, retrying after {delay}s")
                    time.sleep(delay)
                    continue

                response.raise_for_status()
                return response.json()

            except requests.RequestException as e:
                last_error = e
                if isinstance(e, requests.Timeout):
                    raise APIError(408, "Request timeout", request_id)

                if isinstance(e, requests.HTTPError):
                    status_code = e.response.status_code
                    if status_code >= 500 and attempt < self.max_retries:
                        delay = self._calculate_backoff(attempt)
                        time.sleep(delay)
                        continue

                    try:
                        error_data = e.response.json()
                    except:
                        error_data = {'message': e.response.text}

                    raise APIError(
                        status_code,
                        error_data.get('message', 'API request failed'),
                        request_id,
                        error_data
                    )

        raise last_error

    def get(self, endpoint: str, params: Dict = None) -> Dict[str, Any]:
        """Make a GET request."""
        return self.request('GET', endpoint, params=params)

    def post(self, endpoint: str, data: Dict = None, json: Dict = None) -> Dict[str, Any]:
        """Make a POST request."""
        return self.request('POST', endpoint, data=data, json=json)

    def put(self, endpoint: str, data: Dict = None, json: Dict = None) -> Dict[str, Any]:
        """Make a PUT request."""
        return self.request('PUT', endpoint, data=data, json=json)

    def patch(self, endpoint: str, data: Dict = None, json: Dict = None) -> Dict[str, Any]:
        """Make a PATCH request."""
        return self.request('PATCH', endpoint, data=data, json=json)

    def delete(self, endpoint: str) -> Dict[str, Any]:
        """Make a DELETE request."""
        return self.request('DELETE', endpoint)


# Usage
import os

client = OAuth2APIClient(
    base_url='https://api.example.com/v1',
    client_id=os.getenv('CLIENT_ID'),
    client_secret=os.getenv('CLIENT_SECRET'),
    token_url='https://auth.example.com/oauth/token'
)

# GET request
users = client.get('/users', params={'limit': 10})

# POST request
new_user = client.post('/users', json={
    'name': 'John Doe',
    'email': 'john@example.com'
})

# Error handling
try:
    result = client.get('/protected-resource')
except APIError as e:
    if e.status_code == 401:
        print("Authentication failed")
    elif e.status_code == 429:
        print("Rate limited, please wait")
    elif e.status_code >= 500:
        print("Server error, please try again")
```

Example 3: Testing API Integrations (JavaScript)
```javascript
// rest-api.test.js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { APIClient } from './rest-api-client';

describe('APIClient', () => {
  let client;
  let mockFetch;

  beforeEach(() => {
    client = new APIClient('https://api.test.com/v1', 'test-key');
    mockFetch = vi.fn();
    global.fetch = mockFetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should make GET request with proper headers', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: 'test' })
    });

    const result = await client.get('/test');

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.test.com/v1/test',
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': 'Bearer test-key',
          'Content-Type': 'application/json'
        })
      })
    );
    expect(result).toEqual({ data: 'test' });
  });

  it('should retry on 500 errors', async () => {
    mockFetch
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: 'success' })
      });

    const result = await client.get('/test');

    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(result).toEqual({ data: 'success' });
  });

  it('should handle rate limiting with Retry-After header', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: false,
        status: 429,
        headers: { get: (name) => name === 'Retry-After' ? '2' : null }
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: 'success' })
      });

    const startTime = Date.now();
    const result = await client.get('/test');
    const elapsed = Date.now() - startTime;

    expect(elapsed).toBeGreaterThanOrEqual(2000);
    expect(result).toEqual({ data: 'success' });
  });

  it('should throw APIError on 404', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ message: 'Not found' })
    });

    await expect(client.get('/test')).rejects.toThrow('Not found');
  });

  it('should timeout after configured duration', async () => {
    mockFetch.mockImplementationOnce(() =>
      new Promise(resolve => setTimeout(resolve, 40000))
    );

    await expect(client.get('/test')).rejects.toThrow('timeout');
  });
});
```

Example 4: Testing API Integrations (Python)
```python
# test_rest_api_client.py
import pytest
import requests
from unittest.mock import Mock, patch
from rest_api_client import OAuth2APIClient, APIError


@pytest.fixture
def client():
    return OAuth2APIClient(
        base_url='https://api.test.com/v1',
        client_id='test-id',
        client_secret='test-secret',
        token_url='https://auth.test.com/oauth/token'
    )


def test_get_request_with_auth(client, monkeypatch):
    """Test that GET request includes authorization header."""
    mock_response = Mock()
    mock_response.status_code = 200
    mock_response.json.return_value = {'data': 'test'}

    mock_post = Mock()
    mock_post.return_value.json.return_value = {
        'access_token': 'test-token',
        'expires_in': 3600
    }

    with patch('requests.post', mock_post):
        with patch('requests.Session.request') as mock_request:
            mock_request.return_value = mock_response
            result = client.get('/test')

            mock_request.assert_called_once()
            call_kwargs = mock_request.call_args[1]
            assert 'Authorization' in call_kwargs['headers']
            assert call_kwargs['headers']['Authorization'] == 'Bearer test-token'
            assert result == {'data': 'test'}


def test_rate_limiting(client, monkeypatch):
    """Test that 429 response triggers retry."""
    mock_response_429 = Mock()
    mock_response_429.status_code = 429
    mock_response_429.headers = {'Retry-After': '1'}

    mock_response_success = Mock()
    mock_response_success.status_code = 200
    mock_response_success.json.return_value = {'data': 'success'}

    mock_post = Mock()
    mock_post.return_value.json.return_value = {
        'access_token': 'test-token',
        'expires_in': 3600
    }

    with patch('requests.post', mock_post):
        with patch('requests.Session.request') as mock_request:
            mock_request.side_effect = [mock_response_429, mock_response_success]
            result = client.get('/test')

            assert mock_request.call_count == 2
            assert result == {'data': 'success'}


def test_server_error_retry(client, monkeypatch):
    """Test that 500 errors trigger retry."""
    mock_response_500 = Mock()
    mock_response_500.status_code = 500
    mock_response_500.raise_for_status.side_effect = requests.HTTPError()

    mock_response_success = Mock()
    mock_response_success.status_code = 200
    mock_response_success.json.return_value = {'data': 'success'}

    mock_post = Mock()
    mock_post.return_value.json.return_value = {
        'access_token': 'test-token',
        'expires_in': 3600
    }

    with patch('requests.post', mock_post):
        with patch('requests.Session.request') as mock_request:
            mock_request.side_effect = [mock_response_500, mock_response_success]
            result = client.get('/test')

            assert mock_request.call_count == 2
            assert result == {'data': 'success'}


def test_api_error_handling(client):
    """Test that APIError is raised with proper details."""
    mock_response = Mock()
    mock_response.status_code = 404
    mock_response.json.return_value = {'message': 'Not found'}
    mock_response.raise_for_status.side_effect = requests.HTTPError()

    mock_post = Mock()
    mock_post.return_value.json.return_value = {
        'access_token': 'test-token',
        'expires_in': 3600
    }

    with patch('requests.post', mock_post):
        with patch('requests.Session.request', return_value=mock_response):
            with pytest.raises(APIError) as exc_info:
                client.get('/test')

            assert exc_info.value.status_code == 404
            assert exc_info.value.message == 'Not found'
```

Example 5: Using curl for API Testing
```bash
#!/bin/bash
# api-test.sh - API testing with curl

API_BASE="https://api.example.com/v1"
API_KEY="your-api-key-here"

# Helper function for colored output
color_echo() {
    local color=$1
    shift
    echo -e "\033[${color}m$@\033[0m"
}

# Make authenticated request
api_request() {
    local method=$1
    local endpoint=$2
    local data=$3

    local url="${API_BASE}${endpoint}"
    local opts="-s -w '\nHTTP_CODE:%{http_code}\n'"

    color_echo "36" ">>> $method $url"

    if [ -n "$data" ]; then
        curl $opts \
            -X $method \
            -H "Authorization: Bearer $API_KEY" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$url"
    else
        curl $opts \
            -X $method \
            -H "Authorization: Bearer $API_KEY" \
            -H "Content-Type: application/json" \
            "$url"
    fi
}

# GET request
echo "=== GET /users ==="
response=$(api_request "GET" "/users?limit=5")
http_code=$(echo "$response" | grep "HTTP_CODE:" | cut -d: -f2)
body=$(echo "$response" | sed '/HTTP_CODE:/d')

if [ "$http_code" = "200" ]; then
    color_echo "32" "✓ Success"
    echo "$body" | jq '.'
else
    color_echo "31" "✗ Error: $http_code"
    echo "$body"
fi
echo

# POST request
echo "=== POST /users ==="
data='{"name":"Test User","email":"test@example.com"}'
response=$(api_request "POST" "/users" "$data")
http_code=$(echo "$response" | grep "HTTP_CODE:" | cut -d: -f2)
body=$(echo "$response" | sed '/HTTP_CODE:/d')

if [ "$http_code" = "201" ]; then
    color_echo "32" "✓ Created"
    echo "$body" | jq '.'
else
    color_echo "31" "✗ Error: $http_code"
    echo "$body"
fi

# PUT request
echo "=== PUT /users/123 ==="
data='{"name":"Updated Name"}'
response=$(api_request "PUT" "/users/123" "$data")
http_code=$(echo "$response" | grep "HTTP_CODE:" | cut -d: -f2)
body=$(echo "$response" | sed '/HTTP_CODE:/d')

if [ "$http_code" = "200" ]; then
    color_echo "32" "✓ Updated"
    echo "$body" | jq '.'
else
    color_echo "31" "✗ Error: $http_code"
    echo "$body"
fi

# DELETE request
echo "=== DELETE /users/123 ==="
response=$(api_request "DELETE" "/users/123")
http_code=$(echo "$response" | grep "HTTP_CODE:" | cut -d: -f2)

if [ "$http_code" = "204" ]; then
    color_echo "32" "✓ Deleted"
else
    color_echo "31" "✗ Error: $http_code"
fi
```
</examples>

<integration_notes>
This skill integrates with:

- **webhooks**: Use webhooks for real-time updates instead of polling
- **mcp-integrations/github**: GitHub API follows REST patterns
- **development-tools/github-cli**: CLI alternative to REST API calls
- **systematic-debugging**: For troubleshooting API integration issues

When to use this skill:
- Building API clients for third-party services
- Creating internal microservices
- Integrating payment gateways, CRMs, or other SaaS products
- Implementing OAuth2 authentication flows
- Handling large-scale API integrations with rate limiting

Common pitfalls:
- Forgetting to implement retry logic
- Not handling rate limiting properly
- Exposing sensitive data in logs
- Not validating API responses
- Ignoring API version changes
</integration_notes>

<error_handling>
Common errors and solutions:

**Network Errors**
- ECONNREFUSED: Service unavailable, implement retry with backoff
- ETIMEDOUT: Request timeout, increase timeout or reduce payload
- ENOTFOUND: DNS resolution failed, check endpoint URL

**HTTP 4xx Errors**
- 400 Bad Request: Validate request payload
- 401 Unauthorized: Check credentials, refresh tokens
- 403 Forbidden: Insufficient permissions, check API key scopes
- 404 Not Found: Resource doesn't exist, check endpoint path
- 409 Conflict: Resource state conflict, retry with updated data
- 422 Unprocessable Entity: Validation error, check request format
- 429 Too Many Requests: Rate limited, respect Retry-After header

**HTTP 5xx Errors**
- 500 Internal Server Error: Server error, retry with backoff
- 502 Bad Gateway: Upstream service error, retry
- 503 Service Unavailable: Service down, retry later
- 504 Gateway Timeout: Request timeout, retry

**Authentication Errors**
- Invalid token: Refresh or re-authenticate
- Expired token: Use refresh token if available
- Insufficient scope: Request additional permissions

Debugging tips:
1. Enable verbose logging to see full request/response
2. Use request IDs to trace requests through logs
3. Test with curl or Postman to isolate the issue
4. Check API status page for service issues
5. Review API documentation for breaking changes
</error_handling>

<output_format>
When implementing REST API integrations:

1. Return structured responses:
```javascript
{
  success: true,
  data: {...},
  meta: {
    requestId: "uuid",
    timestamp: "2024-01-18T10:00:00Z",
    rateLimit: {
      remaining: 98,
      resetAt: "2024-01-18T10:01:00Z"
    }
  }
}
```

2. Include error details in failures:
```javascript
{
  success: false,
  error: {
    message: "Resource not found",
    code: "NOT_FOUND",
    status: 404,
    requestId: "uuid",
    details: {...}
  }
}
```

3. Log all requests with correlation ID
4. Include rate limit information in response metadata
5. Transform external API responses to internal format
6. Sanitize sensitive data before logging
</output_format>

<related_skills>
- webhooks: Real-time event notifications
- mcp-integrations/supabase: Database API patterns
- development-tools/github-cli: Alternative to GitHub REST API
- systematic-debugging: Troubleshooting integration issues
- test-driven-development: Testing API clients
</related_skills>

<see_also>
- REST API Tutorial: https://restfulapi.net/
- HTTP Status Codes: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
- OAuth 2.0 Specification: https://oauth.net/2/
- API Design Best Practices: https://apisyouwonthate.com/
- Fetch API: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
- Requests Library: https://requests.readthedocs.io/
</see_also>
