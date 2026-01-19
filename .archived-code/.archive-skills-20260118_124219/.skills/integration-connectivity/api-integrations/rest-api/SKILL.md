---
name: rest-api
category: integration-connectivity/api-integrations
version: 1.0.0
description: REST API integration patterns, best practices, and error handling for building robust API clients
author: blackbox5/core
verified: true
tags: [api, rest, integration, http, fetch]
---

# REST API Integration Skills

<context>
REST (Representational State Transfer) APIs are the backbone of modern web services, enabling communication between clients and servers through standard HTTP methods. Understanding REST integration patterns is crucial for building reliable, scalable, and maintainable applications.

**Why REST API Integration Matters:**
- Most modern services expose REST APIs (GitHub, Stripe, Twitter, etc.)
- Proper error handling prevents cascading failures
- Rate limit awareness prevents service disruption
- Consistent patterns reduce cognitive load
- Security best practices protect sensitive data

**Core Concepts:**
- **Resources**: Entities exposed by the API (users, posts, products)
- **HTTP Methods**: GET (read), POST (create), PUT/PATCH (update), DELETE (remove)
- **Status Codes**: Indicate outcome (200 success, 400 client error, 500 server error)
- **Authentication**: API keys, OAuth tokens, JWT
- **Pagination**: Handling large datasets across multiple requests

**Integration Challenges:**
- Network failures and timeouts
- Rate limiting and throttling
- Authentication token expiration
- Malformed responses or API changes
- Partial failures and retry logic
</context>

<instructions>
When working with REST APIs in Claude Code, follow these guidelines:

1. **Always start with discovery** - Read API documentation, explore endpoints, understand authentication
2. **Use proper error handling** - Never assume requests succeed; handle all error cases
3. **Respect rate limits** - Implement throttling and backoff strategies
4. **Log appropriately** - Record requests, responses, and errors for debugging
5. **Validate responses** - Check status codes and response structure before processing
6. **Use TypeScript types** - Define interfaces for request/response data
7. **Implement retries** - Use exponential backoff for transient failures

Claude will help you create API clients, handle authentication, implement error handling, and build robust integrations.
</instructions>

<rules>
  <rule priority="critical">Never hardcode API keys, tokens, or credentials in source code</rule>
  <rule priority="critical">Always use HTTPS for API requests to prevent credential theft</rule>
  <rule priority="critical">Validate and sanitize all user input before sending to APIs</rule>
  <rule priority="critical">Implement proper error handling for all API calls</rule>
  <rule priority="high">Set appropriate timeouts (30-60 seconds) for API requests</rule>
  <rule priority="high">Respect rate limits and implement backoff strategies</rule>
  <rule priority="high">Use environment variables for sensitive configuration</rule>
  <rule priority="high">Log API requests and responses for debugging (but sanitize sensitive data)</rule>
  <rule priority="medium">Implement retry logic with exponential backoff for transient failures</rule>
  <rule priority="medium">Use TypeScript interfaces for type safety</rule>
  <rule priority="medium">Cache responses when appropriate to reduce API calls</rule>
  <rule priority="medium">Handle pagination for list endpoints</rule>
  <rule priority="low">Use connection pooling for performance</rule>
  <rule priority="low">Monitor API usage and set up alerts</rule>
</rules>

<workflow>
  <phase name="Discovery">
    <goal>Understand the API and its capabilities</goal>
    <steps>
      <step>Read API documentation thoroughly</step>
      <step>Identify authentication method (API key, OAuth, JWT)</step>
      <step>Locate base URL and available endpoints</step>
      <step>Understand rate limits and pagination</step>
      <step>Review request/response formats</step>
      <step>Check for SDK or official client libraries</step>
    </steps>
  </phase>

  <phase name="Integration">
    <goal>Build the API client foundation</goal>
    <steps>
      <step>Create TypeScript interfaces for request/response types</step>
      <step>Implement authentication helper functions</step>
      <step>Build base HTTP client with timeout and retry logic</step>
      <step>Create typed wrapper functions for each endpoint</step>
      <step>Add error handling and response validation</step>
      <step>Implement logging (sanitized)</step>
    </steps>
  </phase>

  <phase name="Error Handling">
    <goal>Make the integration resilient to failures</goal>
    <steps>
      <step>Categorize errors (transient, client, server)</step>
      <step>Implement exponential backoff for retries</step>
      <step>Handle authentication failures and token refresh</step>
      <step>Parse error messages and provide helpful feedback</step>
      <step>Set up monitoring and alerting</step>
      <step>Create fallback behavior for critical failures</step>
    </steps>
  </phase>

  <phase name="Testing">
    <goal>Verify the integration works correctly</goal>
    <steps>
      <step>Write unit tests for error handling logic</step>
      <step>Create integration tests with mock API server</step>
      <step>Test rate limiting behavior</step>
      <step>Verify retry logic with network failures</step>
      <step>Test authentication and token refresh</step>
      <step>Validate response parsing and type safety</step>
    </steps>
  </phase>

  <phase name="Optimization">
    <goal>Improve performance and reliability</goal>
    <steps>
      <step>Implement caching for frequently accessed data</step>
      <step>Add request batching if API supports it</step>
      <step>Optimize pagination strategy</step>
      <step>Monitor API usage and optimize expensive calls</step>
      <step>Set up health checks and monitoring</step>
    </steps>
  </phase>
</workflow>

<best_practices>
  <do>
    <item>Use TypeScript for type safety and better developer experience</item>
    <item>Implement exponential backoff for retries (wait 1s, 2s, 4s, 8s, etc.)</item>
    <item>Set appropriate timeouts to prevent hanging requests</item>
    <item>Validate responses against expected schema</item>
    <item>Log requests and responses (with sensitive data sanitized)</item>
    <item>Use environment variables for API keys and configuration</item>
    <item>Handle pagination gracefully for list endpoints</item>
    <item>Cache responses when data doesn't change frequently</item>
    <item>Monitor API usage and set up alerts for anomalies</item>
    <item>Use official SDKs when available</item>
    <item>Implement circuit breakers for failing services</item>
    <item>Document API contracts and integration patterns</item>
    <item>Use HTTP/2 when available for better performance</item>
  </do>
  <dont>
    <item>Hardcode credentials or API keys in source code</item>
    <item>Ignore error responses or status codes</item>
    <item>Make unlimited requests without rate limiting</item>
    <item>Assume API responses will always match documentation</item>
    <item>Retry indefinitely without backoff</item>
    <item>Expose sensitive data in logs or error messages</item>
    <item>Use HTTP instead of HTTPS</item>
    <item>Ignore pagination limits</item>
    <item>Make requests without timeouts</item>
    <item>Trust user input without validation</item>
    <item>Swallow errors silently</item>
    <item>Mix authentication methods inconsistently</item>
  </dont>
</best_practices>

<anti_patterns>
  <pattern>
    <name>Hardcoded Credentials</name>
    <description>Embedding API keys or tokens directly in source code</description>
    <consequence>Security vulnerability, credentials exposed in version control</consequence>
    <solution>Use environment variables or secret management services</solution>
  </pattern>
  <pattern>
    <name>No Error Handling</name>
    <description>Assuming API calls always succeed</description>
    <consequence>Application crashes, poor user experience, silent failures</consequence>
    <solution>Wrap all API calls in try-catch blocks, handle all status codes</solution>
  </pattern>
  <pattern>
    <name>Infinite Retries</name>
    <description>Retrying failed requests without backoff or limits</description>
    <consequence>API rate limit exhaustion, cascading failures</consequence>
    <solution>Implement exponential backoff with maximum retry limit</solution>
  </pattern>
  <pattern>
    <name>Ignoring Rate Limits</name>
    <description>Making requests without respecting API rate limits</description>
    <consequence>Temporary or permanent API access suspension</consequence>
    <solution>Track request counts, implement throttling, respect rate limit headers</solution>
  </pattern>
  <pattern>
    <name>Assumed Response Structure</name>
    <description>Assuming API responses will always match documentation</description>
    <consequence>Runtime errors when API changes or returns unexpected data</consequence>
    <solution>Validate responses against schema, handle unexpected data gracefully</solution>
  </pattern>
</anti_patterns>

<examples>
  <example>
    <scenario>Simple GET Request with Error Handling</scenario>
    <code><![CDATA[
interface User {
  id: string;
  name: string;
  email: string;
}

async function getUser(userId: string): Promise<User> {
  const response = await fetch(`https://api.example.com/users/${userId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${process.env.API_KEY}`,
      'Content-Type': 'application/json',
    },
    signal: AbortSignal.timeout(30000), // 30 second timeout
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('User not found');
    } else if (response.status === 401) {
      throw new Error('Authentication failed');
    } else if (response.status >= 500) {
      throw new Error('Server error, please try again later');
    }
    throw new Error(`Request failed with status ${response.status}`);
  }

  const data = await response.json();
  return data as User;
}
    ]]></code>
  </example>

  <example>
    <scenario>POST Request with Retry Logic</scenario>
    <code><![CDATA[
interface CreatePostRequest {
  title: string;
  content: string;
  authorId: string;
}

interface CreatePostResponse {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

async function createPostWithRetry(
  data: CreatePostRequest,
  maxRetries: number = 3
): Promise<CreatePostResponse> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch('https://api.example.com/posts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(30000),
      });

      if (response.ok) {
        return await response.json() as CreatePostResponse;
      }

      // Don't retry client errors (4xx)
      if (response.status >= 400 && response.status < 500) {
        const error = await response.json();
        throw new Error(error.message || 'Client error');
      }

      // Retry server errors (5xx)
      if (attempt < maxRetries - 1) {
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      throw new Error(`Server error: ${response.status}`);
    } catch (error) {
      if (attempt === maxRetries - 1) {
        throw error;
      }
      // Retry network errors
      const delay = Math.pow(2, attempt) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw new Error('Max retries exceeded');
}
    ]]></code>
  </example>

  <example>
    <scenario>Paginated List Request</scenario>
    <code><![CDATA[
interface ListOptions {
  limit?: number;
  startingAfter?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  hasMore: boolean;
  nextCursor?: string;
}

async function getAllUsers(options: ListOptions = {}): Promise<User[]> {
  const allUsers: User[] = [];
  let cursor: string | undefined;

  do {
    const params = new URLSearchParams({
      limit: String(options.limit || 100),
      ...(cursor && { startingAfter: cursor }),
    });

    const response = await fetch(
      `https://api.example.com/users?${params}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.API_KEY}`,
        },
        signal: AbortSignal.timeout(30000),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.status}`);
    }

    const result = await response.json() as PaginatedResponse<User>;
    allUsers.push(...result.data);
    cursor = result.nextCursor;
  } while (cursor);

  return allUsers;
}
    ]]></code>
  </example>
</examples>

<error_handling>
  <error>
    <condition>Network Timeout</condition>
    <solution>
      <step>Set appropriate timeout (30-60 seconds)</step>
      <step>Implement retry logic with exponential backoff</step>
      <step>Log timeout incidents for monitoring</step>
      <step>Provide user feedback if operation takes time</step>
    </solution>
  </error>
  <error>
    <condition>Authentication Failure (401)</condition>
    <solution>
      <step>Verify API key/token is valid</step>
      <step>Check token hasn't expired</step>
      <step>Implement token refresh if using OAuth</step>
      <step>Ensure credentials are stored securely</step>
    </solution>
  </error>
  <error>
    <condition>Rate Limit Exceeded (429)</condition>
    <solution>
      <step>Parse rate limit headers (Retry-After, X-RateLimit-Reset)</step>
      <step>Implement request throttling</step>
      <step>Use exponential backoff before retrying</step>
      <step>Consider caching to reduce request frequency</step>
    </solution>
  </error>
  <error>
    <condition>Resource Not Found (404)</condition>
    <solution>
      <step>Verify resource ID is correct</step>
      <step>Check if resource was deleted</step>
      <step>Provide clear error message to user</step>
      <step>Offer to list available resources</step>
    </solution>
  </error>
  <error>
    <condition>Server Error (5xx)</condition>
    <solution>
      <step>Implement retry logic with exponential backoff</step>
      <step>Set maximum retry limit (3-5 attempts)</step>
      <step>Log error details for debugging</step>
      <step>Provide user feedback about service issues</step>
    </solution>
  </error>
  <error>
    <condition>Malformed Response</condition>
    <solution>
      <step>Validate response against expected schema</step>
      <step>Handle unexpected data gracefully</step>
      <step>Log response for debugging</step>
      <step>Contact API provider if structure changed</step>
    </solution>
  </error>
</error_handling>

<authentication>
  <method name="API Key">
    <description>Simple authentication using a secret key</description>
    <implementation>Pass in header: `Authorization: Bearer YOUR_KEY` or `X-API-Key: YOUR_KEY`</implementation>
    <security>Store in environment variables, never commit to version control</security>
  </method>
  <method name="OAuth 2.0">
    <description>Token-based authentication with refresh capability</description>
    <implementation>
      <step>Obtain access token via authorization flow</step>
      <step>Include token in Authorization header</step>
      <step>Refresh token when expired</step>
      <step>Store tokens securely (encrypted at rest)</step>
    </implementation>
  </method>
  <method name="JWT">
    <description>JSON Web Tokens for stateless authentication</description>
    <implementation>Include token in Authorization header: `Bearer JWT_TOKEN`</implementation>
    <rotation>Implement token refresh before expiration</rotation>
  </method>
  <method name="HMAC">
    <description>Hash-based message authentication for request signing</description>
    <implementation>Sign requests with secret key, include signature in header</implementation>
    <use_case>Financial APIs, webhook verification</use_case>
  </method>
</authentication>

<pagination>
  <strategy name="Offset-based">
    <description>Use offset and limit parameters</description>
    <example>?page=1&limit=50 or ?offset=0&limit=50</example>
    <pros>Simple to implement, easy to jump to pages</pros>
    <cons>Slow for large offsets, duplicate data if items added</cons>
  </strategy>
  <strategy name="Cursor-based">
    <description>Use cursor from previous response</description>
    <example>?startingAfter=cursor_id or ?cursor=abc123</example>
    <pros>Efficient for large datasets, consistent results</pros>
    <cons>Cannot jump to specific page</cons>
  </strategy>
  <strategy name="Link Header">
    <description>API provides links in response headers</description>
    <example>Link: <https://api.example.com?page=2>; rel="next"</example>
    <pros>API controls pagination, flexible</pros>
    <cons>Requires parsing headers, more complex</cons>
  </strategy>
</pagination>

<rate_limiting>
  <type name="Fixed Window">
    <description>Limit requests per time window (e.g., 1000/hour)</description>
    <handling>Track request count, reset at window boundary</handling>
  </type>
  <type name="Sliding Window">
    <description>Limit requests in rolling time window</description>
    <handling>Track timestamps, count requests in window</handling>
  </type>
  <type name="Token Bucket">
    <description>Requests consume tokens, tokens refill over time</description>
    <handling>Parse X-RateLimit-Remaining and X-RateLimit-Reset headers</handling>
  </type>
  <best_practices>
    <item>Parse rate limit headers from responses</item>
    <item>Implement client-side throttling</item>
    <item>Use exponential backoff when limited</item>
    <item>Queue requests when approaching limits</item>
    <item>Monitor usage and set up alerts</item>
  </best_practices>
</rate_limiting>

<caching>
  <strategy name="In-Memory Cache">
    <description>Cache responses in process memory</description>
    <duration>Short-lived (seconds to minutes)</duration>
    <use_case>Frequently accessed, rarely changing data</use_case>
  </strategy>
  <strategy name="Redis/Memcached">
    <description>Distributed caching layer</description>
    <duration>Medium-lived (minutes to hours)</duration>
    <use_case>Shared cache across multiple instances</use_case>
  </strategy>
  <strategy name="HTTP Caching">
    <description>Use ETag and Cache-Control headers</description>
    <implementation>Respect API's caching headers</implementation>
  </strategy>
  <considerations>
    <item>Cache data that changes infrequently</item>
    <item>Set appropriate TTL based on data freshness needs</item>
    <item>Invalidate cache on mutations</item>
    <item>Don't cache sensitive or user-specific data</item>
  </considerations>
</caching>

<testing>
  <approach name="Unit Tests">
    <description>Test error handling, parsing, and retry logic</description>
    <tools>Jest, Vitest, Mocha</tools>
    <mock>Use fetch-mock or nock to mock HTTP requests</mock>
  </approach>
  <approach name="Integration Tests">
    <description>Test against mock API server</description>
    <tools>MSW (Mock Service Worker), MirageJS</tools>
    <coverage>Happy path, error cases, edge cases</coverage>
  </approach>
  <approach name="Contract Tests">
    <description>Verify API contract matches expectations</description>
    <tools>Pact, OpenAPI validation</tools>
  </approach>
</testing>

<monitoring>
  <metric name="Request Rate">
    <description>Requests per second/minute</description>
    <alert>Sudden spike or drop</alert>
  </metric>
  <metric name="Error Rate">
    <description>Percentage of failed requests</description>
    <alert>Error rate exceeds threshold (e.g., 5%)</alert>
  </metric>
  <metric name="Latency">
    <description>Response time percentiles (p50, p95, p99)</description>
    <alert>Latency degrades significantly</alert>
  </metric>
  <metric name="Rate Limit Hits">
    <description>Frequency of 429 responses</description>
    <alert>Consistent rate limit breaches</alert>
  </metric>
</monitoring>

<output_format>
When working with REST APIs, Claude will:

1. **Create TypeScript interfaces** for request/response types
2. **Implement error handling** with proper categorization
3. **Add retry logic** with exponential backoff
4. **Set timeouts** to prevent hanging requests
5. **Handle authentication** securely
6. **Implement pagination** for list endpoints
7. **Add logging** (sanitized) for debugging
8. **Provide usage examples** for each endpoint
9. **Document edge cases** and error scenarios
10. **Include tests** for critical functionality

All code will be production-ready, type-safe, and follow security best practices.
</output_format>

<tools>
  <tool name="fetch">
    <description>Native browser API for HTTP requests</description>
    <built_in>true</built_in>
    <notes>Use AbortSignal for timeout handling</notes>
  </tool>
  <tool name="axios">
    <description>Popular HTTP client with interceptors and automatic transforms</description>
    <install>npm install axios</install>
    <features>Request/response interceptors, automatic JSON transformation, timeout support</features>
  </tool>
  <tool name="ky">
    <description>Modern fetch wrapper with simpler API</description>
    <install>npm install ky</install>
    <features>Retry logic, HTTP exceptions, JSON parsing</features>
  </tool>
  <tool name="ofetch">
    <description>Modern fetch wrapper by Nuxt team</description>
    <install>npm install ofetch</install>
    <features>Automatic retries, base URL, interceptors</features>
  </tool>
</tools>

<related_skills>
  <skill name="graphql-api">GraphQL integration patterns</skill>
  <skill name="webhooks">Webhook handling and verification</skill>
  <skill name="oauth">OAuth authentication flows</skill>
  <skill name="api-testing">API testing strategies</skill>
</related_skills>

<see_also>
  <resource>
    <name>MDN Web Docs - Fetch API</name>
    <url>https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API</url>
  </resource>
  <resource>
    <name>REST API Tutorial</name>
    <url>https://restfulapi.net/</url>
  </resource>
  <resource>
    <name>HTTP Status Codes</name>
    <url>https://httpstatuses.com/</url>
  </resource>
  <resource>
    <name>OAuth 2.0 Specification</name>
    <url>https://oauth.net/2/</url>
  </resource>
  <resource>
    <name>OpenAPI Specification</name>
    <url>https://swagger.io/specification/</url>
  </resource>
  <resource>
    <name>Rate Limiting Best Practices</name>
    <url>https://cloud.google.com/architecture/rate-limiting-strategies-techniques</url>
  </resource>
</see_also>
