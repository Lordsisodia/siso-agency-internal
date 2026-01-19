---
name: graphql-api
category: integration-connectivity/api-integrations
version: 1.0.0
description: GraphQL integration patterns, query construction, and best practices for efficient GraphQL clients
author: blackbox5/core
verified: true
tags: [api, graphql, integration, queries, gql]
---

# GraphQL API Integration Skill

## Context

GraphQL is a query language for APIs that provides a more efficient, powerful, and flexible alternative to REST. Unlike REST APIs that require multiple endpoints for different resources, GraphQL exposes a single endpoint through which clients can query exactly the data they need.

### Key Differences from REST

1. **Single Endpoint**: GraphQL uses one endpoint for all operations (typically `/graphql`)
2. **Data Fetching**: Clients specify exactly what fields they need
3. **Strong Typing**: GraphQL schemas define types, relationships, and operations
4. **Introspection**: Clients can query the schema itself to discover available types and fields
5. **Real-time**: Built-in support for subscriptions via WebSocket

### GraphQL Core Concepts

- **Query**: Read-only operations to fetch data
- **Mutation**: Operations to modify data (create, update, delete)
- **Subscription**: Real-time data updates via WebSocket
- **Schema**: Type system that defines API capabilities
- **Resolver**: Functions that resolve field values on the server
- **Fragment**: Reusable units of query fields
- **Variable**: Dynamic values passed to queries
- **Directive**: Instructions to affect query execution (e.g., `@include`, `@skip`)

## Instructions

### 1. Schema Discovery

Before writing queries, always explore the GraphQL schema:

```graphql
# Query the schema for available types
query {
  __schema {
    types {
      name
      kind
      description
      fields {
        name
        type {
          name
          kind
        }
      }
    }
  }
}

# Get specific type information
query {
  __type(name: "User") {
    name
    description
    fields {
      name
      type {
        name
        kind
        ofType {
          name
        }
      }
    }
  }
}
```

### 2. Constructing Queries

#### Basic Query Structure

```graphql
query GetUser($userId: ID!) {
  user(id: $userId) {
    id
    name
    email
    createdAt
  }
}
```

#### Using Variables

```javascript
// Always use variables for dynamic values
const query = `
  query GetUser($userId: ID!, $includePosts: Boolean!) {
    user(id: $userId) {
      id
      name
      email
      posts @include(if: $includePosts) {
        id
        title
      }
    }
  }
`;

const variables = {
  userId: "user_123",
  includePosts: true
};
```

#### Using Fragments

```graphql
# Define reusable fragments
fragment UserFields on User {
  id
  name
  email
  avatar
}

fragment PostFields on Post {
  id
  title
  content
  createdAt
}

# Use fragments in queries
query GetUsersWithPosts {
  users {
    ...UserFields
    posts {
      ...PostFields
      author {
        ...UserFields
      }
    }
  }
}
```

### 3. Constructing Mutations

```graphql
mutation CreateUser($input: CreateUserInput!) {
  createUser(input: $input) {
    user {
      id
      name
      email
    }
    errors {
      field
      message
    }
    success
  }
}

mutation UpdateUser($userId: ID!, $input: UpdateUserInput!) {
  updateUser(id: $userId, input: $input) {
    user {
      id
      name
      email
    }
  }
}

mutation DeleteUser($userId: ID!) {
  deleteUser(id: $userId) {
    success
    message
  }
}
```

### 4. Subscriptions

```graphql
subscription OnUserCreated($limit: Int) {
  userCreated {
    id
    name
    email
    createdAt
  }
}

subscription OnPostUpdated($postId: ID!) {
  postUpdated(postId: $postId) {
    id
    title
    content
    updatedAt
  }
}
```

## Rules

### Query Optimization Rules

1. **Request Only Needed Fields**: Never request fields you don't use
2. **Avoid Deep Nesting**: Limit query depth to prevent performance issues
3. **Use Pagination**: Always paginate list queries (edges-based or offset-based)
4. **Batch Queries**: Combine related operations into a single request
5. **Query Complexity**: Be aware of server-side query complexity limits

### Security Rules

1. **Sanitize All Variables**: Validate variables before sending to server
2. **Rate Limiting**: Respect API rate limits even if not explicitly enforced
3. **Authentication**: Include auth tokens in headers for all requests
4. **Sensitive Data**: Never include passwords or tokens in query strings
5. **CSRF Protection**: Include CSRF tokens for mutations

### Error Handling Rules

1. **Always Handle Errors**: Check for errors in the response
2. **Partial Errors**: GraphQL can return partial data with errors
3. **Validation Errors**: Handle validation errors in mutation responses
4. **Network Errors**: Distinguish between network and GraphQL errors
5. **User Feedback**: Provide meaningful error messages to users

### Pagination Rules

1. **Cursor-Based Pagination**: Preferred for large datasets
2. **Connection Pattern**: Use edges and nodes structure
3. **Page Size**: Request reasonable page sizes (10-50 items)
4. **Forward/Backward**: Support both directions when needed
5. **Total Count**: Request total counts only when necessary

## Workflow

### Phase 1: Schema Discovery

1. **Introspection Query**: Run introspection queries to understand the schema
2. **Documentation**: Read schema documentation if available
3. **Type Exploration**: Explore types, fields, and relationships
4. **Operation Discovery**: Identify available queries, mutations, subscriptions
5. **Tool Integration**: Use tools like GraphiQL, Apollo Sandbox, or GraphQL Playground

### Phase 2: Query Design

1. **Identify Requirements**: Determine exactly what data is needed
2. **Design Query**: Construct query with minimal fields
3. **Fragment Creation**: Create reusable fragments for repeated fields
4. **Variable Planning**: Define variables for dynamic values
5. **Directives Application**: Use directives for conditional fields

### Phase 3: Pagination Strategy

1. **Choose Pattern**: Select cursor-based or offset-based pagination
2. **Connection Query**: Use edges/nodes pattern for cursor-based
3. **Page Info**: Request page info (hasNextPage, endCursor)
4. **Load More**: Implement infinite scroll or pagination controls
5. **Caching**: Cache paginated results appropriately

```graphql
# Cursor-based pagination example
query GetPosts($first: Int, $after: String) {
  posts(first: $first, after: $after) {
    edges {
      node {
        id
        title
        createdAt
      }
      cursor
    }
    pageInfo {
      hasNextPage
      endCursor
      hasPreviousPage
      startCursor
    }
    totalCount
  }
}
```

### Phase 4: Error Handling

1. **Error Detection**: Check for errors in response
2. **Error Classification**: Categorize errors (validation, network, business logic)
3. **Partial Data**: Handle cases where partial data is returned
4. **Retry Logic**: Implement retry logic for transient errors
5. **User Notification**: Display appropriate error messages

```javascript
// Error handling pattern
try {
  const response = await client.query({ query, variables });

  if (response.errors) {
    // Handle GraphQL errors
    response.errors.forEach(error => {
      console.error('GraphQL Error:', error.message);
    });
    return;
  }

  // Process successful response
  return response.data;
} catch (error) {
  // Handle network errors
  if (error.networkError) {
    console.error('Network Error:', error.networkError);
  } else {
    console.error('Error:', error);
  }
}
```

### Phase 5: Caching Strategy

1. **Cache Configuration**: Configure cache behavior (normalization, TTL)
2. **Cache Keys**: Use unique cache keys for queries
3. **Cache Updates**: Update cache after mutations
4. **Cache Invalidation**: Invalidate stale data appropriately
5. **Offline Support**: Implement offline support with cache

## Best Practices

### 1. Query Construction

- **Use Named Operations**: Always name your queries, mutations, and subscriptions
- **Type-Safe Variables**: Define variables with proper types in operation definitions
- **Fragments for Reuse**: Create fragments for commonly used field sets
- **Directive Usage**: Use `@include` and `@skip` for conditional fields
- **Avoid String Interpolation**: Never interpolate variables directly into query strings

### 2. Query Batching

```javascript
// Bad: Multiple requests
const user = await client.query({ query: GetUserQuery });
const posts = await client.query({ query: GetPostsQuery });

// Good: Batched request
const response = await client.query({
  query: `
    ${UserFragment}
    ${PostFragment}
    query GetData($userId: ID!) {
      user(id: $userId) {
        ...UserFields
      }
      posts {
        ...PostFields
      }
    }
  `,
  variables: { userId: '123' }
});
```

### 3. Data Normalization

```javascript
// Use Apollo Client's normalized cache
// Data is stored by id and referenced throughout
const cache = new InMemoryCache({
  typePolicies: {
    User: {
      keyFields: ['id'],
      fields: {
        posts: {
          merge(existing = [], incoming) {
            return [...existing, ...incoming];
          }
        }
      }
    }
  }
});
```

### 4. Fragment Usage

```graphql
# Good: Fragment for repeated fields
fragment UserBasicInfo on User {
  id
  name
  email
  avatar
}

query GetUsers {
  users {
    ...UserBasicInfo
    posts {
      id
      author {
        ...UserBasicInfo
      }
    }
  }
}
```

### 5. Pagination Implementation

```javascript
// Implement cursor-based pagination
const loadMore = async () => {
  const response = await client.query({
    query: GET_POSTS,
    variables: {
      first: 20,
      after: cursor
    },
    fetchPolicy: 'cache-first'
  });

  // Update cursor
  setCursor(response.data.posts.pageInfo.endCursor);
  setHasNextPage(response.data.posts.pageInfo.hasNextPage);

  // Merge results
  setPosts(prev => [...prev, ...response.data.posts.edges]);
};
```

## Anti-Patterns

### 1. Over-Fetching

```graphql
# Bad: Requesting unnecessary fields
query GetUsers {
  users {
    id
    name
    email
    posts {  # You might not need posts
      id
      title
      content
      comments {
        id
        content
        author {
          id
          name
        }
      }
    }
  }
}

# Good: Request only needed fields
query GetUsers {
  users {
    id
    name
  }
}
```

### 2. N+1 Query Problem

```graphql
# Bad: Causes N+1 queries on the server
query GetUsersWithPosts {
  users {
    id
    name
    posts {  # Server must query posts for each user
      id
      title
    }
  }
}

# Better: Batch queries or use DataLoader on server
# Consider requesting posts separately with userIds
```

### 3. Anonymous Operations

```graphql
# Bad: Anonymous operation
query {
  user(id: "123") {
    name
  }
}

# Good: Named operation
query GetUser($userId: ID!) {
  user(id: $userId) {
    name
  }
}
```

### 4. String Interpolation

```javascript
// Bad: Direct string interpolation (security risk)
const query = `
  query {
    user(id: "${userId}") {
      name
    }
  }
`;

// Good: Use variables
const query = `
  query GetUser($userId: ID!) {
    user(id: $userId) {
      name
    }
  }
`;
```

### 5. Ignoring Errors

```javascript
// Bad: Ignoring errors
const response = await client.query({ query });
return response.data.user;

// Good: Proper error handling
if (response.errors) {
  throw new Error(response.errors[0].message);
}
return response.data.user;
```

### 6. Deep Nesting

```graphql
# Bad: Too deeply nested query
query {
  users {
    posts {
      comments {
        author {
          posts {
            comments {
              author {
                posts {
                  comments {
                    author {
                      name
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}

# Better: Flatten or use separate queries
```

## Examples

### Example 1: Basic Query with Error Handling

```javascript
import { gql, useQuery } from '@apollo/client';

const GET_USER = gql`
  query GetUser($userId: ID!) {
    user(id: $userId) {
      id
      name
      email
      avatar
      createdAt
    }
  }
`;

function UserProfile({ userId }) {
  const { loading, error, data } = useQuery(GET_USER, {
    variables: { userId },
    onError: (error) => {
      console.error('Error fetching user:', error.message);
      // Handle error (show notification, redirect, etc.)
    }
  });

  if (loading) return <SkeletonLoader />;
  if (error) return <ErrorMessage message={error.message} />;
  if (!data?.user) return <NotFound />;

  return (
    <div>
      <img src={data.user.avatar} alt={data.user.name} />
      <h1>{data.user.name}</h1>
      <p>{data.user.email}</p>
    </div>
  );
}
```

### Example 2: Mutation with Optimistic UI

```javascript
const CREATE_POST = gql`
  mutation CreatePost($input: CreatePostInput!) {
    createPost(input: $input) {
      post {
        id
        title
        content
        author {
          id
          name
        }
        createdAt
      }
      errors {
        field
        message
      }
    }
  }
`;

function CreatePostForm() {
  const [createPost, { loading, error }] = useMutation(CREATE_POST, {
    update(cache, { data }) {
      cache.modify({
        fields: {
          posts(existingPosts = []) {
            const newPostRef = cache.writeFragment({
              data: data.createPost.post,
              fragment: gql`
                fragment NewPost on Post {
                  id
                  title
                  content
                  author {
                    id
                    name
                  }
                  createdAt
                }
              `
            });
            return [...existingPosts, newPostRef];
          }
        }
      });
    },
    optimisticResponse: {
      createPost: {
        __typename: 'CreatePostPayload',
        post: {
          __typename: 'Post',
          id: 'temp-id',
          title: input.title,
          content: input.content,
          author: currentUser,
          createdAt: new Date().toISOString()
        },
        errors: []
      }
    }
  });

  const handleSubmit = async (values) => {
    try {
      await createPost({
        variables: { input: values }
      });
      // Show success message
    } catch (err) {
      // Handle error
    }
  };

  return <Form onSubmit={handleSubmit} />;
}
```

### Example 3: Infinite Scroll Pagination

```javascript
const GET_POSTS = gql`
  fragment PostFields on Post {
    id
    title
    content
    createdAt
    author {
      id
      name
      avatar
    }
  }

  query GetPosts($first: Int, $after: String) {
    posts(first: $first, after: $after) {
      edges {
        node {
          ...PostFields
        }
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
      }
      totalCount
    }
  }
`;

function PostList() {
  const [hasNextPage, setHasNextPage] = useState(true);
  const [cursor, setCursor] = useState(null);
  const [posts, setPosts] = useState([]);

  const { loading, fetchMore } = useQuery(GET_POSTS, {
    variables: { first: 20 },
    onCompleted: (data) => {
      setPosts(data.posts.edges);
      setHasNextPage(data.posts.pageInfo.hasNextPage);
      setCursor(data.posts.pageInfo.endCursor);
    }
  });

  const loadMore = () => {
    if (!hasNextPage || loading) return;

    fetchMore({
      variables: {
        first: 20,
        after: cursor
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;

        return {
          posts: {
            ...fetchMoreResult.posts,
            edges: [
              ...prev.posts.edges,
              ...fetchMoreResult.posts.edges
            ]
          }
        };
      }
    });
  };

  return (
    <InfiniteScroll
      dataLength={posts.length}
      next={loadMore}
      hasMore={hasNextPage}
      loader={<Spinner />}
    >
      {posts.map(edge => (
        <PostCard key={edge.node.id} post={edge.node} />
      ))}
    </InfiniteScroll>
  );
}
```

### Example 4: Subscription with WebSocket

```javascript
import { gql, useSubscription } from '@apollo/client';

const POST_UPDATED = gql`
  fragment PostFields on Post {
    id
    title
    content
    status
    updatedAt
  }

  subscription OnPostUpdated($postId: ID!) {
    postUpdated(postId: $postId) {
      ...PostFields
    }
  }
`;

function PostSubscription({ postId }) {
  const { data, error, loading } = useSubscription(
    POST_UPDATED,
    {
      variables: { postId },
      onSubscriptionData: ({ subscriptionData }) => {
        // Handle real-time update
        const updatedPost = subscriptionData.data.postUpdated;
        // Update UI or trigger action
        showNotification(`Post "${updatedPost.title}" updated!`);
      }
    }
  );

  if (error) {
    console.error('Subscription error:', error);
    return null;
  }

  return null; // or render subscription status
}

// Usage in component
function PostEditor({ post }) {
  // Subscribe to updates
  useSubscriptionWrapper(post.id);

  // ... rest of component
}
```

### Example 5: Query with Directives and Fragments

```graphql
# Define reusable fragments
fragment UserInfo on User {
  id
  name
  email
  avatar
}

fragment PostInfo on Post {
  id
  title
  excerpt
  createdAt
}

# Query with directives for conditional fetching
query GetUserContent(
  $userId: ID!
  $includeEmail: Boolean!
  $includePosts: Boolean!
  $postCount: Int!
) {
  user(id: $userId) {
    ...UserInfo
    email @include(if: $includeEmail)

    # Conditional relationships
    posts(first: $postCount) @include(if: $includePosts) {
      edges {
        node {
          ...PostInfo
          author {
            ...UserInfo
          }
        }
      }
      totalCount
    }
  }
}

# Variables
{
  "userId": "user_123",
  "includeEmail": false,
  "includePosts": true,
  "postCount": 10
}
```

## Integration Notes

### GraphQL Clients

#### Apollo Client

```javascript
import { ApolloClient, InMemoryCache, HttpLink, from } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { WebSocketLink } from '@apollo/client/link/ws';

// HTTP connection
const httpLink = new HttpLink({
  uri: 'https://api.example.com/graphql',
  headers: {
    Authorization: `Bearer ${token}`
  }
});

// WebSocket connection for subscriptions
const wsLink = new WebSocketLink({
  uri: 'wss://api.example.com/graphql',
  options: {
    reconnect: true,
    connectionParams: {
      Authorization: `Bearer ${token}`
    }
  }
});

// Error handling link
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      );
    });
  }
  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
  }
});

// Split based on operation type
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  httpLink
);

// Create client
const client = new ApolloClient({
  link: from([errorLink, splitLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          posts: {
            keyArgs: ['first'],
            merge(existing = [], incoming) {
              return [...existing, ...incoming];
            }
          }
        }
      }
    }
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all'
    },
    query: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all'
    },
    mutation: {
      errorPolicy: 'all'
    }
  }
});
```

#### URQL

```javascript
import { createClient, dedupExchange, cacheExchange, fetchExchange, subscriptionExchange } from 'urql';
import { devtoolsExchange } from '@urql/devtools';
import { subscribe } from 'graphql-ws/lib/client';
import { createClient as createWSClient } from 'graphql-ws';

const wsClient = createWSClient({
  url: 'wss://api.example.com/graphql',
  connectionParams: {
    Authorization: `Bearer ${token}`
  }
});

const client = createClient({
  url: 'https://api.example.com/graphql',
  exchanges: [
    devtoolsExchange,
    dedupExchange,
    cacheExchange,
    fetchExchange,
    subscriptionExchange({
      forwardSubscription: (request) => subscribe({
        ...request,
        wsClient
      })
    })
  ],
  fetchOptions: {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }
});
```

### Code Generation

```bash
# Generate TypeScript types from schema
npm install @graphql-codegen/cli

# Setup codegen
npx graphql-codegen init

# Generate types
npm run generate
```

```yaml
# codegen.yml
schema: https://api.example.com/graphql
documents: ./src/**/*.graphql
generates:
  ./src/generated/graphql.tsx:
    plugins:
      - typescript
      - typescript-operations
      - typescript-react-apollo
    config:
      withHooks: true
      withHOC: false
      withComponent: false
```

### Testing GraphQL Operations

```javascript
import { MockedProvider, mockSingleLink } from '@apollo/client/testing';
import { render, screen, waitFor } from '@testing-library/react';
import { GET_USER } from './queries';
import UserProfile from './UserProfile';

const mocks = [
  {
    request: {
      query: GET_USER,
      variables: { userId: '123' }
    },
    result: {
      data: {
        user: {
          id: '123',
          name: 'John Doe',
          email: 'john@example.com'
        }
      }
    }
  }
];

test('renders user profile', async () => {
  render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <UserProfile userId="123" />
    </MockedProvider>
  );

  await waitFor(() => {
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });
});
```

## Error Handling

### GraphQL Error Types

1. **Syntax Errors**: Invalid GraphQL syntax
2. **Validation Errors**: Query doesn't match schema
3. **Execution Errors**: Errors during query execution
4. **Network Errors**: Connection/transport issues

### Error Response Structure

```javascript
// GraphQL error response
{
  "data": {
    "user": null
  },
  "errors": [
    {
      "message": "User not found",
      "locations": [{ "line": 2, "column": 3 }],
      "path": ["user"],
      "extensions": {
        "code": "USER_NOT_FOUND",
        "timestamp": "2025-01-18T10:00:00Z"
      }
    }
  ]
}
```

### Error Handling Patterns

```javascript
// Pattern 1: Check for errors
const handleError = (response) => {
  if (response.errors) {
    // Handle GraphQL errors
    const errorMessages = response.errors.map(err => err.message);
    throw new Error(errorMessages.join(', '));
  }
  return response.data;
};

// Pattern 2: Partial data handling
const handlePartialData = (response) => {
  if (response.errors) {
    // Log errors but use partial data
    response.errors.forEach(error => {
      console.warn('Partial data warning:', error.message);
    });
  }
  return response.data;
};

// Pattern 3: Mutation error handling
const handleMutationResult = (result) => {
  if (result.errors) {
    // Return validation errors
    return {
      success: false,
      errors: result.errors
    };
  }

  if (result.data?.createPost?.errors) {
    // Return field-level validation errors
    return {
      success: false,
      errors: result.data.createPost.errors
    };
  }

  return {
    success: true,
    data: result.data.createPost.post
  };
};
```

## Output Format

When working with GraphQL APIs, responses should follow this structure:

```javascript
// Success response
{
  data: {
    [operationName]: {
      // Requested data
    }
  }
}

// Error response
{
  data: {
    // Partial data (if any)
  },
  errors: [
    {
      message: "Error message",
      locations: [{ line: 2, column: 3 }],
      path: ["field", "nestedField"],
      extensions: {
        code: "ERROR_CODE",
        // Additional metadata
      }
    }
  ]
}

// Mutation response pattern
{
  data: {
    [mutationName]: {
      [entity]: {
        // Created/updated entity
      },
      errors: [
        {
          field: "fieldName",
          message: "Validation error"
        }
      ],
      success: true
    }
  }
}
```

## Related Skills

- **rest-api**: REST API integration patterns
- **api-documentation**: Reading and understanding API documentation
- **authentication**: OAuth, JWT, and API authentication
- **rate-limiting**: Handling API rate limits and quotas
- **data-pagination**: Pagination patterns for large datasets
- **error-handling**: General error handling strategies

## See Also

- [GraphQL Official Documentation](https://graphql.org/learn/)
- [Apollo Client Documentation](https://www.apollographql.com/docs/react/)
- [GraphQL Best Practices](https://graphql.best Practices/)
- [GraphQL Specification](https://spec.graphql.org/)
- [GraphiQL](https://github.com/graphql/graphiql)
- [GraphQL Playground](https://github.com/prisma-labs/graphql-playground)
- [GraphQL Code Generator](https://www.graphql-code-generator.com/)
- [GraphQL Tools](https://www.graphql-tools.com/)

---

**Author Notes:**

This skill provides comprehensive guidance on GraphQL API integration. Always prioritize type safety, error handling, and efficient data fetching. Use tools like code generators to maintain type safety and reduce boilerplate. GraphQL's flexibility comes with responsibility - structure your queries carefully to avoid performance issues.

Remember that GraphQL schemas can evolve, so implement your client code to handle schema changes gracefully. Use fragments to maintain consistency across your codebase and make schema updates easier to manage.
