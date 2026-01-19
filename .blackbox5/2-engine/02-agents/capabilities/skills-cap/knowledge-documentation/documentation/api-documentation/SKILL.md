---
name: api-documentation
category: knowledge-documentation/documentation
version: 1.0.0
description: API documentation generation, OpenAPI specifications, and maintaining comprehensive API docs
author: blackbox5/core
verified: true
tags: [api, docs, openapi, swagger, documentation]
---

# API Documentation Generation Skill

## Context

API documentation is the bridge between backend services and frontend consumers. Poor documentation leads to integration failures, increased support burden, and slower development cycles. Comprehensive, accurate, and maintainable API documentation is essential for:

- **Developer Experience**: Clear documentation reduces onboarding time and integration friction
- **API Adoption**: Well-documented APIs see 3-5x higher adoption rates
- **Support Reduction**: Comprehensive docs reduce support tickets by 40-60%
- **Team Efficiency**: Frontend teams can work independently without constant backend consultation
- **Partner Integration**: External partners need clear, complete API specifications

Modern API documentation goes beyond simple endpoint lists. It includes interactive examples, authentication flows, error response catalogs, rate limiting information, webhook documentation, and real-time testing capabilities.

## Instructions

### Creating API Documentation

1. **Analyze the API Surface**
   - List all REST endpoints, GraphQL queries/mutations, or WebSocket events
   - Identify authentication requirements (API keys, OAuth, JWT)
   - Document rate limits, quotas, and throttling behavior
   - Map data models, request/response schemas, and validation rules

2. **Choose Documentation Format**
   - **OpenAPI/Swagger** (preferred for REST APIs)
   - **GraphQL Schema + Docs** (for GraphQL APIs)
   - **AsyncAPI** (for event-driven/WebSocket APIs)
   - **API Blueprint** (alternative to OpenAPI)
   - Custom documentation with interactive examples

3. **Structure Your Documentation**
   ```yaml
   documentation_sections:
     - overview:                  # High-level API introduction
       - purpose_and_use_cases
       - authentication_guide
       - rate_limits_and_quotas
       - changelog
     - quick_start:              # Getting started guide
       - setup_and_configuration
       - first_request_example
       - common_workflows
     - endpoints:                # Detailed endpoint documentation
       - path_and_methods
       - parameters
       - request_body
       - response_schema
       - error_responses
     - models:                   # Data schemas and types
       - request_models
       - response_models
       - enums_and_constants
       - validation_rules
     - examples:                 # Code examples in multiple languages
       - curl_examples
       - javascript_examples
       - python_examples
       - postman_collection
     - webhooks:                 # Webhook documentation (if applicable)
       - webhook_events
       - payload_schemas
       - retry_logic
   ```

4. **Document Each Endpoint**
   - HTTP method (GET, POST, PUT, PATCH, DELETE)
   - Full path with path parameters
   - Authentication requirement
   - Request headers (Content-Type, Authorization, etc.)
   - Query parameters with types, requirements, defaults
   - Request body schema with validation rules
   - Response codes (200, 201, 400, 401, 403, 404, 500, etc.)
   - Response body schema for each code
   - Error response formats
   - Rate limit information
   - Example requests and responses
   - Use cases and edge cases

5. **Create Interactive Examples**
   - cURL commands for quick testing
   - JavaScript/TypeScript examples using fetch/axios
   - Python examples using requests
   - Postman collection import
   - Real-time "Try it out" functionality

6. **Document Error Responses**
   - All possible error codes
   - Error response structure
   - Common error scenarios
   - Troubleshooting steps
   - Error code reference table

## Rules

### OpenAPI Standards Compliance

- **Version Specification**: Always specify OpenAPI version (3.0.x or 3.1.x)
- **Info Object**: Include title, version, description, contact, license
- **Servers**: List all environments (dev, staging, production)
- **Security Schemes**: Define all authentication methods clearly
- **Schema Definitions**: Use reusable components for schemas
- **Response Descriptions**: Every response must have a description
- **Required Fields**: Mark required fields explicitly
- **Examples**: Provide example values for all schemas

### Example Accuracy

- **Tested Examples**: All code examples must be tested and working
- **Real Data**: Use realistic example data, not "foo", "bar"
- **Complete Examples**: Show full request/response cycles
- **Edge Cases**: Include examples for error scenarios
- **Multiple Languages**: Provide examples in common languages
- **Copy-Paste Ready**: Examples should work without modification

### Version Management

- **API Versioning**: Document versioning strategy (URL, header, content negotiation)
- **Changelog**: Maintain detailed changelog with dates
- **Deprecation Warnings**: Clearly mark deprecated endpoints
- **Migration Guides**: Provide upgrade guides between versions
- **Breaking Changes**: Document breaking changes prominently
- **Sunset Dates**: Communicate endpoint sunset timelines

### Completeness

- **No Undocumented Endpoints**: Every endpoint must be documented
- **All Parameters**: Document every parameter, header, and field
- **Error Scenarios**: Cover all possible error responses
- **Authentication**: Complete authentication flow documentation
- **Rate Limits**: Explicit rate limit information per endpoint
- **Webhooks**: Document all webhook events and payloads

## Workflow

### Phase 1: Specification Design

1. **Gather Requirements**
   - Interview API designers and developers
   - Review API code and implementation
   - Identify all endpoints, methods, and operations
   - Map authentication and authorization requirements
   - Document rate limiting and quotas

2. **Design OpenAPI Structure**
   - Create OpenAPI skeleton with info, servers, tags
   - Define security schemes
   - Create reusable schema components
   - Organize endpoints into logical tags
   - Plan documentation hierarchy

3. **Define Data Models**
   - Document all request/response schemas
   - Define validation rules and constraints
   - Create reusable types and components
   - Document relationships between models
   - Specify default values and enum options

### Phase 2: Documentation Generation

1. **Write OpenAPI Specification**
   - Use YAML or JSON format
   - Start with paths and operations
   - Add parameters, request bodies, responses
   - Include security requirements
   - Add examples and descriptions

2. **Generate Reference Documentation**
   - Use Swagger UI, Redoc, or similar tools
   - Generate HTML documentation from OpenAPI spec
   - Create navigation and search structure
   - Add custom branding and styling
   - Verify all sections render correctly

3. **Create Guides and Tutorials**
   - Write quick start guide
   - Create authentication walkthrough
   - Document common workflows and use cases
   - Build integration tutorials
   - Add troubleshooting section

### Phase 3: Examples and Testing

1. **Generate Code Examples**
   - Create cURL examples for all endpoints
   - Write JavaScript/TypeScript examples
   - Add Python examples
   - Include other relevant languages
   - Test all examples for accuracy

2. **Create Postman Collection**
   - Import OpenAPI spec to Postman
   - Organize requests into folders
   - Add environment variables
   - Include pre-request scripts
   - Test all requests

3. **Interactive Documentation**
   - Deploy Swagger UI or Redoc
   - Enable "Try it out" functionality
   - Configure authentication in UI
   - Test all interactive examples
   - Verify CORS and authentication work

### Phase 4: Maintenance

1. **Documentation Sync**
   - Update docs with every API change
   - Run automated validation checks
   - Review and update examples
   - Maintain changelog
   - Announce updates to consumers

2. **Version Control**
   - Track documentation versions with API versions
   - Maintain separate docs for each supported version
   - Archive old version documentation
   - Provide migration guides
   - Communicate deprecation timelines

3. **Quality Assurance**
   - Regular documentation audits
   - Validate OpenAPI specifications
   - Test all examples quarterly
   - Gather user feedback
   - Monitor support tickets for doc gaps

## Best Practices

### OpenAPI/Swagger Usage

1. **Use OpenAPI 3.0+**
   - Leverage latest features (discriminator, oneOf, anyOf)
   - Use callbacks for webhook documentation
   - Take advantage of links for related operations
   - Utilize patterned fields for flexible naming

2. **Organize with Tags**
   - Group related endpoints under tags
   - Use hierarchical tag structure
   - Align tags with domain boundaries
   - Create tag descriptions and documentation

3. **Reusable Components**
   - Define schemas in components/schemas
   - Create reusable parameters
   - Share response templates
   - Define common security schemes
   - Use patterned objects for extensibility

4. **Comprehensive Descriptions**
   - Use Markdown for rich text formatting
   - Include usage notes and tips
   - Add warnings for dangerous operations
   - Document pagination behavior
   - Explain filtering and sorting options

### Interactive Documentation

1. **Swagger UI Configuration**
   - Enable try-it-out for safe operations
   - Configure authentication (OAuth2, API keys)
   - Add request interceptors for auth headers
   - Customize branding and logos
   - Set default values for parameters

2. **Redoc for Production**
   - Use Redoc for cleaner, static documentation
   - Enable search functionality
   - Add code samples in multiple languages
   - Include schema diagrams
   - Configure theme and styling

3. **Developer Portal**
   - Combine reference docs with guides
   - Add interactive playgrounds
   - Include SDK documentation
   - Provide status indicators
   - Add feedback mechanisms

### Authentication Examples

1. **API Key Authentication**
   ```yaml
   securitySchemes:
     ApiKeyAuth:
       type: apiKey
       in: header
       name: X-API-Key
       description: API key from developer portal
   ```

2. **Bearer Token/JWT**
   ```yaml
   securitySchemes:
     BearerAuth:
       type: http
       scheme: bearer
       bearerFormat: JWT
       description: JWT token from /auth/login endpoint
   ```

3. **OAuth2 Flows**
   ```yaml
   securitySchemes:
     OAuth2:
       type: oauth2
       flows:
         authorizationCode:
           authorizationUrl: /oauth/authorize
           tokenUrl: /oauth/token
           scopes:
             read: Read access
             write: Write access
   ```

4. **Complete Auth Documentation**
   - Explain how to obtain credentials
   - Document token refresh flow
   - Show auth header examples
   - Handle expired tokens
   - Document scope requirements

### Versioning Documentation

1. **URL Versioning** (Recommended)
   ```
   /api/v1/users
   /api/v2/users
   ```

2. **Header Versioning**
   ```
   Header: Accept: application/vnd.myapi.v2+json
   ```

3. **Document Version Strategy**
   - Explain versioning approach
   - Show all supported versions
   - Document version-specific differences
   - Provide upgrade guides
   - Communicate deprecation schedule

## Anti-Patterns

### Outdated Documentation

- **Drift from Implementation**: Docs that don't match actual API behavior
- **Missing Endpoints**: New endpoints not documented
- **Deprecated Examples**: Old code examples that no longer work
- **Wrong Schema**: Documentation shows outdated request/response formats
- **Prevention**: Automated testing, CI integration, version control

### Missing Examples

- **No Code Examples**: Only descriptions without working code
- **Incomplete Examples**: Examples missing required parameters
- **Hardcoded Values**: Examples with placeholder values like "YOUR_API_KEY"
- **Single Language**: Only examples in one language
- **No Error Examples**: Only success cases documented
- **Solution**: Provide complete, tested examples in multiple languages

### Poor Error Documentation

- **Generic Error Messages**: "Error occurred" without details
- **Missing Error Codes**: Undocumented error response codes
- **No Troubleshooting**: Errors without explanation or resolution steps
- **Inconsistent Errors**: Different error formats across endpoints
- **Fix**: Document every error code with causes and solutions

### No Interactive Testing

- **Static Docs Only**: No way to test endpoints from documentation
- **Manual Setup**: Require users to configure tools before testing
- **No Try It Out**: Documentation doesn't include interactive examples
- **Authentication Barriers**: Try-it-out doesn't work with auth
- **Solution**: Deploy Swagger UI/Redoc with working auth

### Inconsistent Structure

- **Mixed Documentation Styles**: Some endpoints detailed, others sparse
- **No Templates**: Each endpoint documented differently
- **Missing Standards**: No consistent formatting or organization
- **Hard to Navigate**: Poor information architecture
- **Approach**: Use OpenAPI spec for consistency, follow style guide

### Missing Context

- **API Only**: Documentation without use cases or workflows
- **No Quick Start**: Missing getting started guide
- **Unclear Purpose**: API purpose not explained
- **No Business Context**: Missing domain and use case information
- **Improvement**: Add guides, tutorials, and real-world examples

## Examples

### Complete OpenAPI 3.0 Specification

```yaml
openapi: 3.0.3
info:
  title: User Management API
  version: 2.1.0
  description: |
    Comprehensive user management API including authentication,
    user CRUD operations, and profile management.
  contact:
    name: API Support
    email: api-support@example.com
    url: https://example.com/support
  license:
    name: MIT
    url: https://opensource.org/licenses/MIT

servers:
  - url: https://api.example.com/v2
    description: Production server
  - url: https://staging-api.example.com/v2
    description: Staging server
  - url: http://localhost:3000/v2
    description: Local development server

security:
  - BearerAuth: []

tags:
  - name: Users
    description: User management operations
  - name: Authentication
    description: Login and token management
  - name: Profiles
    description: User profile management

paths:
  /users:
    get:
      operationId: listUsers
      tags: [Users]
      summary: List all users
      description: Retrieve a paginated list of users with filtering and sorting
      parameters:
        - name: page
          in: query
          description: Page number for pagination
          required: false
          schema:
            type: integer
            default: 1
            minimum: 1
        - name: limit
          in: query
          description: Number of items per page
          required: false
          schema:
            type: integer
            default: 20
            minimum: 1
            maximum: 100
        - name: sort
          in: query
          description: Sort field and order
          required: false
          schema:
            type: string
            enum: [name_asc, name_desc, created_desc, created_asc]
            default: created_desc
        - name: status
          in: query
          description: Filter by user status
          required: false
          schema:
            type: string
            enum: [active, inactive, suspended]
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/User'
                  meta:
                    $ref: '#/components/schemas/PaginationMeta'
              examples:
                success:
                  summary: List of users
                  value:
                    data:
                      - id: "123"
                        name: "John Doe"
                        email: "john@example.com"
                        status: "active"
                        createdAt: "2025-01-01T00:00:00Z"
                    meta:
                      page: 1
                      limit: 20
                      total: 150
                      totalPages: 8
        '400':
          $ref: '#/components/responses/BadRequest'
        '401':
          $ref: '#/components/responses/Unauthorized'
        '429':
          $ref: '#/components/responses/RateLimitExceeded'

    post:
      operationId: createUser
      tags: [Users]
      summary: Create a new user
      description: Create a new user account with email verification
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateUserRequest'
            examples:
              standardUser:
                summary: Standard user creation
                value:
                  name: "Jane Smith"
                  email: "jane@example.com"
                  password: "SecurePass123!"
                  role: "user"
              adminUser:
                summary: Admin user creation
                value:
                  name: "Admin User"
                  email: "admin@example.com"
                  password: "AdminPass456!"
                  role: "admin"
                  permissions: ["users:read", "users:write"]
      responses:
        '201':
          description: User created successfully
          headers:
            Location:
              description: URL of the newly created user
              schema:
                type: string
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
        '400':
          $ref: '#/components/responses/BadRequest'
        '409':
          $ref: '#/components/responses/Conflict'
        '422':
          description: Validation error
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ValidationError'

  /users/{userId}:
    get:
      operationId: getUser
      tags: [Users]
      summary: Get user by ID
      description: Retrieve detailed information about a specific user
      parameters:
        - $ref: '#/components/parameters/UserId'
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UserDetail'
        '404':
          $ref: '#/components/responses/NotFound'

    put:
      operationId: updateUser
      tags: [Users]
      summary: Update user
      description: Update user information (partial update supported)
      parameters:
        - $ref: '#/components/parameters/UserId'
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UpdateUserRequest'
      responses:
        '200':
          description: User updated successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
        '400':
          $ref: '#/components/responses/BadRequest'
        '404':
          $ref: '#/components/responses/NotFound'

    delete:
      operationId: deleteUser
      tags: [Users]
      summary: Delete user
      description: Permanently delete a user account
      parameters:
        - $ref: '#/components/parameters/UserId'
      responses:
        '204':
          description: User deleted successfully
        '404':
          $ref: '#/components/responses/NotFound'
        '409':
          description: Cannot delete user with active resources
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: JWT token obtained from /auth/login

  parameters:
    UserId:
      name: userId
      in: path
      description: Unique user identifier
      required: true
      schema:
        type: string
        format: uuid
        example: "123e4567-e89b-12d3-a456-426614174000"

  schemas:
    User:
      type: object
      properties:
        id:
          type: string
          format: uuid
          description: Unique user identifier
        name:
          type: string
          minLength: 1
          maxLength: 100
          description: User's full name
        email:
          type: string
          format: email
          description: User's email address
        status:
          type: string
          enum: [active, inactive, suspended]
          description: Account status
        role:
          type: string
          enum: [user, admin, moderator]
          description: User role
        createdAt:
          type: string
          format: date-time
          description: Account creation timestamp
        updatedAt:
          type: string
          format: date-time
          description: Last update timestamp
      required: [id, name, email, status, role, createdAt]

    UserDetail:
      allOf:
        - $ref: '#/components/schemas/User'
        - type: object
          properties:
            profile:
              $ref: '#/components/schemas/UserProfile'
            permissions:
              type: array
              items:
                type: string
              description: User permissions list
            lastLogin:
              type: string
              format: date-time
              description: Last login timestamp

    CreateUserRequest:
      type: object
      properties:
        name:
          type: string
          minLength: 1
          maxLength: 100
          description: User's full name
          example: "John Doe"
        email:
          type: string
          format: email
          description: User's email address
          example: "john@example.com"
        password:
          type: string
          minLength: 8
          format: password
          description: Password (min 8 characters, must include uppercase, lowercase, number)
          example: "SecurePass123!"
        role:
          type: string
          enum: [user, admin, moderator]
          default: user
          description: User role
        permissions:
          type: array
          items:
            type: string
          description: List of permissions (for admin users)
      required: [name, email, password]

    UpdateUserRequest:
      type: object
      properties:
        name:
          type: string
          minLength: 1
          maxLength: 100
          description: User's full name
        email:
          type: string
          format: email
          description: User's email address
        status:
          type: string
          enum: [active, inactive, suspended]
          description: Account status

    UserProfile:
      type: object
      properties:
        avatar:
          type: string
          format: uri
          description: Profile picture URL
        bio:
          type: string
          maxLength: 500
          description: User biography
        location:
          type: string
          description: User location
        website:
          type: string
          format: uri
          description: Personal website URL

    PaginationMeta:
      type: object
      properties:
        page:
          type: integer
          minimum: 1
          description: Current page number
        limit:
          type: integer
          minimum: 1
          maximum: 100
          description: Items per page
        total:
          type: integer
          minimum: 0
          description: Total number of items
        totalPages:
          type: integer
          minimum: 0
          description: Total number of pages
      required: [page, limit, total, totalPages]

    Error:
      type: object
      properties:
        error:
          type: string
          description: Error message
        code:
          type: string
          description: Machine-readable error code
        details:
          type: object
          description: Additional error details
          additionalProperties: true
      required: [error, code]

    ValidationError:
      allOf:
        - $ref: '#/components/schemas/Error'
        - type: object
          properties:
            errors:
              type: array
              items:
                type: object
                properties:
                  field:
                    type: string
                  message:
                    type: string
              required: [field, message]

  responses:
    BadRequest:
      description: Bad request - Invalid input parameters
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
          example:
            error: "Invalid request parameters"
            code: "BAD_REQUEST"

    Unauthorized:
      description: Unauthorized - Authentication required
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
          example:
            error: "Authentication required"
            code: "UNAUTHORIZED"

    NotFound:
      description: Resource not found
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
          example:
            error: "User not found"
            code: "NOT_FOUND"

    Conflict:
      description: Resource conflict (e.g., duplicate email)
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
          example:
            error: "Email already registered"
            code: "CONFLICT"

    RateLimitExceeded:
      description: Rate limit exceeded
      headers:
        X-RateLimit-Limit:
          schema:
            type: integer
          description: Request limit per time window
        X-RateLimit-Remaining:
          schema:
            type: integer
          description: Remaining requests in window
        X-RateLimit-Reset:
          schema:
            type: integer
          description: Unix timestamp when limit resets
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
          example:
            error: "Rate limit exceeded"
            code: "RATE_LIMIT_EXCEEDED"
```

### Code Examples

#### cURL Examples

```bash
# Authentication - Get JWT Token
curl -X POST https://api.example.com/v2/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "your-password"
  }'

# List Users (with authentication)
curl -X GET "https://api.example.com/v2/users?page=1&limit=20&status=active" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"

# Create New User
curl -X POST https://api.example.com/v2/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "email": "jane@example.com",
    "password": "SecurePass123!",
    "role": "user"
  }'

# Update User
curl -X PUT https://api.example.com/v2/users/123 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "status": "active"
  }'

# Delete User
curl -X DELETE https://api.example.com/v2/users/123 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### JavaScript/TypeScript Examples

```typescript
// API Client Setup
const API_BASE = 'https://api.example.com/v2';
let authToken = '';

// Authentication
async function login(email: string, password: string) {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error('Authentication failed');
  }

  const data = await response.json();
  authToken = data.token;
  return data;
}

// List Users
async function listUsers(params: {
  page?: number;
  limit?: number;
  status?: string;
} = {}) {
  const queryParams = new URLSearchParams({
    page: String(params.page || 1),
    limit: String(params.limit || 20),
    ...(params.status && { status: params.status }),
  });

  const response = await fetch(
    `${API_BASE}/users?${queryParams}`,
    {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch users: ${response.statusText}`);
  }

  return response.json();
}

// Create User
async function createUser(userData: {
  name: string;
  email: string;
  password: string;
  role?: string;
}) {
  const response = await fetch(`${API_BASE}/users`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create user');
  }

  return response.json();
}

// Update User
async function updateUser(
  userId: string,
  updates: Partial<{
    name: string;
    email: string;
    status: string;
  }>
) {
  const response = await fetch(`${API_BASE}/users/${userId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    throw new Error(`Failed to update user: ${response.statusText}`);
  }

  return response.json();
}

// Delete User
async function deleteUser(userId: string) {
  const response = await fetch(`${API_BASE}/users/${userId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${authToken}`,
    },
  });

  if (!response.status === 204) {
    throw new Error(`Failed to delete user: ${response.statusText}`);
  }
}

// Usage Example
async function main() {
  try {
    // Authenticate
    await login('user@example.com', 'password');

    // List users
    const users = await listUsers({ page: 1, limit: 10, status: 'active' });
    console.log('Users:', users);

    // Create new user
    const newUser = await createUser({
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: 'SecurePass123!',
      role: 'user',
    });
    console.log('Created user:', newUser);

    // Update user
    const updatedUser = await updateUser(newUser.id, {
      name: 'Jane Doe',
      status: 'active',
    });
    console.log('Updated user:', updatedUser);

  } catch (error) {
    console.error('Error:', error);
  }
}
```

#### Python Examples

```python
import requests
from typing import Dict, List, Optional

class UserAPIClient:
    def __init__(self, base_url: str = "https://api.example.com/v2"):
        self.base_url = base_url
        self.session = requests.Session()
        self.auth_token: Optional[str] = None

    def login(self, email: str, password: str) -> Dict:
        """Authenticate and store JWT token"""
        response = self.session.post(
            f"{self.base_url}/auth/login",
            json={"email": email, "password": password}
        )
        response.raise_for_status()
        data = response.json()
        self.auth_token = data["token"]
        return data

    def _get_headers(self) -> Dict[str, str]:
        """Get request headers with authentication"""
        headers = {"Content-Type": "application/json"}
        if self.auth_token:
            headers["Authorization"] = f"Bearer {self.auth_token}"
        return headers

    def list_users(
        self,
        page: int = 1,
        limit: int = 20,
        status: Optional[str] = None,
        sort: str = "created_desc"
    ) -> Dict:
        """List all users with pagination and filtering"""
        params = {
            "page": page,
            "limit": limit,
            "sort": sort
        }
        if status:
            params["status"] = status

        response = self.session.get(
            f"{self.base_url}/users",
            headers=self._get_headers(),
            params=params
        )
        response.raise_for_status()
        return response.json()

    def get_user(self, user_id: str) -> Dict:
        """Get user by ID"""
        response = self.session.get(
            f"{self.base_url}/users/{user_id}",
            headers=self._get_headers()
        )
        response.raise_for_status()
        return response.json()

    def create_user(
        self,
        name: str,
        email: str,
        password: str,
        role: str = "user",
        permissions: Optional[List[str]] = None
    ) -> Dict:
        """Create a new user"""
        data = {
            "name": name,
            "email": email,
            "password": password,
            "role": role
        }
        if permissions:
            data["permissions"] = permissions

        response = self.session.post(
            f"{self.base_url}/users",
            headers=self._get_headers(),
            json=data
        )
        response.raise_for_status()
        return response.json()

    def update_user(
        self,
        user_id: str,
        name: Optional[str] = None,
        email: Optional[str] = None,
        status: Optional[str] = None
    ) -> Dict:
        """Update user information"""
        data = {}
        if name:
            data["name"] = name
        if email:
            data["email"] = email
        if status:
            data["status"] = status

        response = self.session.put(
            f"{self.base_url}/users/{user_id}",
            headers=self._get_headers(),
            json=data
        )
        response.raise_for_status()
        return response.json()

    def delete_user(self, user_id: str) -> None:
        """Delete a user"""
        response = self.session.delete(
            f"{self.base_url}/users/{user_id}",
            headers=self._get_headers()
        )
        response.raise_for_status()

# Usage Example
def main():
    client = UserAPIClient()

    try:
        # Authenticate
        client.login("user@example.com", "password")

        # List users
        users = client.list_users(page=1, limit=10, status="active")
        print(f"Found {users['meta']['total']} users")

        # Create new user
        new_user = client.create_user(
            name="Jane Smith",
            email="jane@example.com",
            password="SecurePass123!",
            role="user"
        )
        print(f"Created user: {new_user['name']}")

        # Update user
        updated_user = client.update_user(
            new_user['id'],
            name="Jane Doe",
            status="active"
        )
        print(f"Updated user: {updated_user['name']}")

    except requests.exceptions.HTTPError as e:
        print(f"API Error: {e}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
```

### Postman Collection Example

```json
{
  "info": {
    "name": "User Management API",
    "description": "Complete collection for User Management API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "https://api.example.com/v2",
      "type": "string"
    },
    {
      "key": "authToken",
      "value": "",
      "type": "string"
    }
  ],
  "auth": {
    "type": "bearer",
    "bearer": [
      {
        "key": "token",
        "value": "{{authToken}}",
        "type": "string"
      }
    ]
  },
  "item": [
    {
      "name": "Authentication",
      "item": [
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/auth/login",
              "host": ["{{baseUrl}}"],
              "path": ["auth", "login"]
            },
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"user@example.com\",\n  \"password\": \"your-password\"\n}"
            }
          },
          "response": [],
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "var jsonData = pm.response.json();",
                  "pm.collectionVariables.set(\"authToken\", jsonData.token);"
                ],
                "type": "text/javascript"
              }
            }
          ]
        }
      ]
    },
    {
      "name": "Users",
      "item": [
        {
          "name": "List Users",
          "request": {
            "method": "GET",
            "url": {
              "raw": "{{baseUrl}}/users?page=1&limit=20&status=active",
              "host": ["{{baseUrl}}"],
              "path": ["users"],
              "query": [
                {
                  "key": "page",
                  "value": "1"
                },
                {
                  "key": "limit",
                  "value": "20"
                },
                {
                  "key": "status",
                  "value": "active",
                  "disabled": true
                }
              ]
            }
          }
        },
        {
          "name": "Create User",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/users",
              "host": ["{{baseUrl}}"],
              "path": ["users"]
            },
            "body": {
              "mode": "raw",
              "raw": "{\n  \"name\": \"Jane Smith\",\n  \"email\": \"jane@example.com\",\n  \"password\": \"SecurePass123!\",\n  \"role\": \"user\"\n}"
            }
          }
        },
        {
          "name": "Get User",
          "request": {
            "method": "GET",
            "url": {
              "raw": "{{baseUrl}}/users/:userId",
              "host": ["{{baseUrl}}"],
              "path": ["users", ":userId"],
              "variable": [
                {
                  "key": "userId",
                  "value": "123"
                }
              ]
            }
          }
        },
        {
          "name": "Update User",
          "request": {
            "method": "PUT",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/users/:userId",
              "host": ["{{baseUrl}}"],
              "path": ["users", ":userId"],
              "variable": [
                {
                  "key": "userId",
                  "value": "123"
                }
              ]
            },
            "body": {
              "mode": "raw",
              "raw": "{\n  \"name\": \"Jane Doe\",\n  \"status\": \"active\"\n}"
            }
          }
        },
        {
          "name": "Delete User",
          "request": {
            "method": "DELETE",
            "url": {
              "raw": "{{baseUrl}}/users/:userId",
              "host": ["{{baseUrl}}"],
              "path": ["users", ":userId"],
              "variable": [
                {
                  "key": "userId",
                  "value": "123"
                }
              ]
            }
          }
        }
      ]
    }
  ]
}
```

### API Reference Documentation

```markdown
# User Management API Reference

## Base URL
```
https://api.example.com/v2
```

## Authentication

All API requests require authentication using a JWT bearer token.

### How to Authenticate

1. Send a POST request to `/auth/login` with your credentials
2. Receive a JWT token in the response
3. Include the token in the Authorization header for subsequent requests:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

### Token Expiration

- Tokens expire after 24 hours
- Refresh token endpoint: `/auth/refresh`
- On 401 responses, re-authenticate and retry the request

## Endpoints

### List Users

Retrieve a paginated list of users with filtering and sorting options.

**Endpoint:** `GET /users`

**Authentication:** Required

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| page | integer | No | 1 | Page number for pagination |
| limit | integer | No | 20 | Items per page (1-100) |
| sort | string | No | created_desc | Sort field and order |
| status | string | No | all | Filter by status (active, inactive, suspended) |

**Sort Options:**
- `name_asc` - Name A-Z
- `name_desc` - Name Z-A
- `created_desc` - Newest first
- `created_asc` - Oldest first

**Response:** `200 OK`

```json
{
  "data": [
    {
      "id": "123",
      "name": "John Doe",
      "email": "john@example.com",
      "status": "active",
      "role": "user",
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-01-01T00:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

**Error Responses:**

- `400 Bad Request` - Invalid query parameters
- `401 Unauthorized` - Missing or invalid authentication
- `429 Too Many Requests` - Rate limit exceeded

---

### Create User

Create a new user account. The user will receive a verification email.

**Endpoint:** `POST /users`

**Authentication:** Required

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | User's full name (1-100 characters) |
| email | string | Yes | User's email address (must be unique) |
| password | string | Yes | Password (min 8 characters, must include uppercase, lowercase, number) |
| role | string | No | User role (user, admin, moderator) - default: user |
| permissions | array | No | List of permissions for admin users |

**Example Request:**

```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "SecurePass123!",
  "role": "user"
}
```

**Response:** `201 Created`

```json
{
  "id": "456",
  "name": "Jane Smith",
  "email": "jane@example.com",
  "status": "active",
  "role": "user",
  "createdAt": "2025-01-18T10:30:00Z",
  "updatedAt": "2025-01-18T10:30:00Z"
}
```

**Headers:**

```
Location: /users/456
```

**Error Responses:**

- `400 Bad Request` - Invalid request data
- `409 Conflict` - Email already exists
- `422 Unprocessable Entity` - Validation error

**Example Error Response:**

```json
{
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "errors": [
    {
      "field": "email",
      "message": "Email is invalid"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters"
    }
  ]
}
```

---

## Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `BAD_REQUEST` | Invalid request parameters | 400 |
| `UNAUTHORIZED` | Authentication required | 401 |
| `FORBIDDEN` | Insufficient permissions | 403 |
| `NOT_FOUND` | Resource not found | 404 |
| `CONFLICT` | Resource conflict (duplicate) | 409 |
| `VALIDATION_ERROR` | Request validation failed | 422 |
| `RATE_LIMIT_EXCEEDED` | Too many requests | 429 |
| `INTERNAL_ERROR` | Server error | 500 |

## Rate Limits

- **Default Limit**: 1000 requests per hour
- **Burst Limit**: 100 requests per minute
- **Headers Included**:
  - `X-RateLimit-Limit`: Request limit per window
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Unix timestamp when limit resets

## Changelog

### Version 2.1.0 (2025-01-15)
- Added filtering by status
- Added new sort options
- Improved error responses

### Version 2.0.0 (2024-12-01)
- Breaking: Changed base URL from `/api/v1` to `/api/v2`
- Breaking: Updated authentication to use JWT tokens
- Added pagination support
- Enhanced user detail endpoint
```

## Integration Notes

### Swagger UI Setup

```javascript
// Install dependencies
npm install swagger-ui-express

// Configure in Express app
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./openapi.yaml');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  customSiteTitle: "User Management API Docs",
  customCss: '.swagger-ui .topbar { display: none }',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    docExpansion: "list",
    filter: true,
    showRequestHeaders: true,
    tryItOutEnabled: true
  }
}));
```

### Redoc Deployment

```html
<!DOCTYPE html>
<html>
<head>
  <title>API Reference</title>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link href="https://fonts.googleapis.com/css?family=Montserrat:300,400,700|Roboto:300,400,700" rel="stylesheet">
  <style>
    body { margin: 0; padding: 0; }
  </style>
</head>
<body>
  <redoc spec-url='/openapi.yaml'></redoc>
  <script src="https://cdn.jsdelivr.net/npm/redoc@latest/bundles/redoc.standalone.js"></script>
</body>
</html>
```

### Documentation Generation Tools

1. **Swagger Codegen**
   - Generate client SDKs from OpenAPI spec
   - Supports 40+ languages
   - Command: `swagger-codegen generate -i openapi.yaml -l typescript-fetch -o ./client`

2. **OpenAPI Generator**
   - Modern alternative to Swagger Codegen
   - Active development and updates
   - Command: `openapi-generator generate -i openapi.yaml -g typescript-axios -o ./client`

3. **Redocly CLI**
   - Lint and validate OpenAPI specs
   - Split specs into multiple files
   - Command: `redocly lint openapi.yaml`

### CI/CD Integration

```yaml
# GitHub Actions example
name: Validate API Documentation

on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Validate OpenAPI Spec
        uses: char0n/swagger-editor-validate@v1
        with:
          swagger-file: openapi.yaml
      - name: Lint with Redocly
        run: |
          npm install -g @redocly/cli
          redocly lint openapi.yaml
      - name: Build Documentation
        run: |
          npm install -g @redocly/cli
          redocly build-docs openapi.yaml --output api-docs.html
      - name: Deploy to GitHub Pages
        if: github.ref == 'refs/heads/main'
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./docs
```

### Automated Documentation Testing

```javascript
// Test API documentation against implementation
const { validate } = require('openapi-schema-validator');
const axios = require('axios');

async function testDocumentation() {
  // 1. Validate OpenAPI spec
  const spec = require('./openapi.yaml');
  const validation = validate(spec);
  if (validation.errors.length > 0) {
    console.error('OpenAPI validation errors:', validation.errors);
    process.exit(1);
  }

  // 2. Test each endpoint
  for (const [path, methods] of Object.entries(spec.paths)) {
    for (const [method, details] of Object.entries(methods)) {
      try {
        const response = await axios({
          method: method,
          url: `https://api.example.com${path}`,
          headers: { 'Authorization': 'Bearer TEST_TOKEN' }
        });

        // Validate response matches spec
        const expectedStatus = Object.keys(details.responses)[0];
        if (response.status.toString() !== expectedStatus.replace(/'/g, '')) {
          console.error(`Status mismatch for ${method} ${path}`);
        }
      } catch (error) {
        console.error(`Error testing ${method} ${path}:`, error.message);
      }
    }
  }
}

testDocumentation();
```

## Error Handling

### Common Documentation Errors

1. **Invalid OpenAPI Syntax**
   - Error: Schema validation fails
   - Solution: Use linters (Redocly, Spectral)
   - Prevention: CI validation in build pipeline

2. **Missing Required Fields**
   - Error: Required fields not documented
   - Solution: Compare OpenAPI spec against implementation
   - Prevention: Automated schema testing

3. **Outdated Examples**
   - Error: Examples don't match actual API responses
   - Solution: Regular example validation
   - Prevention: Example testing in CI/CD

4. **Type Mismatches**
   - Error: Documented types don't match actual types
   - Solution: Type checking tools
   - Prevention: Schema-first development

### Schema Validation

```bash
# Using Redocly CLI
redocly lint openapi.yaml

# Using Swagger CLI
swagger-cli validate openapi.yaml

# Using Spectral (rules-based linting)
spectral lint openapi.yaml
```

### Documentation Testing Checklist

- [ ] All endpoints documented
- [ ] All parameters documented with types
- [ ] All response codes documented
- [ ] All error responses documented
- [ ] Authentication flows documented
- [ ] Rate limits specified
- [ ] Code examples tested
- [ ] Examples work in "Try it out"
- [ ] OpenAPI spec validates
- [ ] Links between operations work
- [ ] Examples use realistic data
- [ ] Changelog is up to date

## Output Format

### OpenAPI Specification Structure

```yaml
openapi: 3.0.x                    # OpenAPI version
info:                             # API metadata
  title: string
  version: string
  description: string (markdown)
servers:                          # Server URLs
  - url: string
    description: string
security:                         # Global security
  - SecurityScheme: []
tags:                             # Endpoint categories
  - name: string
    description: string
paths:                            # API endpoints
  /path:
    method:
      summary: string
      description: string
      parameters: []
      requestBody: {}
      responses: {}
components:                       # Reusable components
  securitySchemes: {}
  parameters: {}
  schemas: {}
  responses: {}
```

### Required Sections

1. **Info Object** - Title, version, description
2. **Servers** - At least one server URL
3. **Paths** - All API endpoints
4. **Components** - Reusable schemas and definitions

### Recommended Sections

1. **Security Schemes** - Authentication methods
2. **Tags** - Endpoint grouping
3. **Examples** - Request/response examples
4. **External Docs** - Additional documentation links

## Related Skills

- **rest-api** - REST API design and implementation
- **graphql-api** - GraphQL API development
- **api-testing** - API testing strategies
- **api-versioning** - API version management
- **async-api** - Event-driven API documentation

## See Also

### Documentation

- [OpenAPI Specification](https://swagger.io/specification/)
- [Swagger Documentation](https://swagger.io/docs/)
- [Redoc Documentation](https://github.com/Redocly/redoc)
- [API Style Guides](https://github.com/microsoft/api-guidelines)

### Tools

- [Swagger Editor](https://editor.swagger.io/) - Online OpenAPI editor
- [Redocly CLI](https://redocly.com/docs/cli/) - OpenAPI linter and bundler
- [OpenAPI Generator](https://openapi-generator.tech/) - Generate SDKs
- [Postman](https://www.postman.com/) - API testing and documentation
- [Insomnia](https://insomnia.rest/) - REST client with OpenAPI support

### Best Practices

- [Zalando RESTful API Guidelines](https://github.com/zalando/restful-api-guidelines)
- [Google API Design Guide](https://cloud.google.com/apis/design)
- [Microsoft REST API Guidelines](https://github.com/Microsoft/api-guidelines)
- [API First Design](https://apistylebook.com/design/guidelines/api-first/)
