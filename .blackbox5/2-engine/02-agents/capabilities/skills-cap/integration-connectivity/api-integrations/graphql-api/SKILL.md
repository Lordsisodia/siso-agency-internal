# GraphQL API Integration

> **Category:** Integration & Connectivity
> **Skill:** graphql-api
> **Created:** 2026-01-18
> **Last Updated:** 2026-01-18
> **Status:** Production Ready
> **Agents:** primary, subagent, tools
> **Priority:** High

## Overview

GraphQL API integration skill for building efficient, type-safe API clients using Apollo Client, Relay, or URQL. Covers queries, mutations, subscriptions, error handling, caching strategies, and performance optimization.

## Key Capabilities

- Query composition and execution
- Mutation design and optimistic updates
- Real-time subscriptions
- Error handling and retry logic
- Cache management strategies
- Type-safe client generation
- Authentication and authorization
- File uploads with GraphQL
- Pagination patterns
- Batching and performance optimization

## Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- GraphQL server endpoint
- Basic understanding of GraphQL concepts
- TypeScript or JavaScript knowledge

## Core Concepts

### GraphQL Query Structure

```graphql
# Basic query
query GetUser($id: ID!) {
  user(id: $id) {
    id
    name
    email
    posts {
      id
      title
    }
  }
}

# Query with directives
query GetPosts($first: Int, $after: String) {
  posts(first: $first, after: $after) @connection(key: "posts") {
    edges {
      node {
        id
        title
        author {
          id
          name
        }
      }
      cursor
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
```

### Apollo Client Setup

```typescript
// apollo-client.ts
import { ApolloClient, InMemoryCache, HttpLink, from } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { RetryLink } from '@apollo/client/link/retry';

// Error handling link
const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path, extensions }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
        extensions
      );

      // Handle authentication errors
      if (extensions?.code === 'UNAUTHENTICATED') {
        // Refresh token and retry
        return forward(operation);
      }
    });
  }

  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
  }
});

// Retry link with exponential backoff
const retryLink = new RetryLink({
  delay: {
    initial: 300,
    max: Infinity,
    jitter: true,
  },
  attempts: {
    max: 5,
    retryIf: (error, _operation) => !!error,
  },
});

// HTTP link with authentication
const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT,
  credentials: 'include',
  headers: () => ({
    Authorization: `Bearer ${getAuthToken()}`,
  }),
});

// Apollo Client instance
export const apolloClient = new ApolloClient({
  link: from([errorLink, retryLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          posts: {
            keyArgs: ['filter'],
            merge(existing = [], incoming, { args }) {
              if (args?.after) {
                return [...existing, ...incoming];
              }
              return incoming;
            },
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all',
    },
    query: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
});
```

## Query Patterns

### Simple Query with TypeScript

```typescript
// queries/user.ts
import { gql, useQuery } from '@apollo/client';

export const GET_USER = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      name
      email
      avatar
      createdAt
    }
  }
`;

export interface GetUserVariables {
  id: string;
}

export interface GetUserData {
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
    createdAt: string;
  } | null;
}

export function useUser(id: string) {
  return useQuery<GetUserData, GetUserVariables>(GET_USER, {
    variables: { id },
    skip: !id,
  });
}

// Usage in component
function UserProfile({ userId }: { userId: string }) {
  const { data, loading, error, refetch } = useUser(userId);

  if (loading) return <Skeleton />;
  if (error) return <ErrorMessage error={error} />;
  if (!data?.user) return <NotFound />;

  return (
    <div>
      <h1>{data.user.name}</h1>
      <p>{data.user.email}</p>
    </div>
  );
}
```

### Query with Variables and Fragments

```typescript
// queries/posts.ts
import { gql } from '@apollo/client';

const POST_FIELDS = gql`
  fragment PostFields on Post {
    id
    title
    excerpt
    coverImage
    publishedAt
    author {
      id
      name
      avatar
    }
    tags {
      id
      name
      slug
    }
  }
`;

export const GET_POSTS = gql`
  ${POST_FIELDS}
  query GetPosts($first: Int, $after: String, $filter: PostFilter) {
    posts(first: $first, after: $after, filter: $filter) {
      edges {
        node {
          ...PostFields
        }
        cursor
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      totalCount
    }
  }
`;

export interface GetPostsVariables {
  first?: number;
  after?: string | null;
  filter?: {
    published?: boolean;
    authorId?: string;
    tag?: string;
    search?: string;
  };
}

export interface GetPostsData {
  posts: {
    edges: Array<{
      node: {
        id: string;
        title: string;
        excerpt: string;
        coverImage: string | null;
        publishedAt: string;
        author: {
          id: string;
          name: string;
          avatar: string | null;
        };
        tags: Array<{
          id: string;
          name: string;
          slug: string;
        }>;
      };
      cursor: string;
    }>;
    pageInfo: {
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor: string | null;
      endCursor: string | null;
    };
    totalCount: number;
  };
}
```

## Mutation Patterns

### Mutation with Optimistic Response

```typescript
// mutations/createPost.ts
import { gql, useMutation } from '@apollo/client';
import { GET_POSTS } from '../queries/posts';

export const CREATE_POST = gql`
  mutation CreatePost($input: CreatePostInput!) {
    createPost(input: $input) {
      id
      title
      excerpt
      content
      coverImage
      publishedAt
      author {
        id
        name
        avatar
      }
    }
  }
`;

export interface CreatePostVariables {
  input: {
    title: string;
    excerpt: string;
    content: string;
    coverImage?: string;
    tagIds?: string[];
  };
}

export interface CreatePostData {
  createPost: {
    id: string;
    title: string;
    excerpt: string;
    content: string;
    coverImage: string | null;
    publishedAt: string;
    author: {
      id: string;
      name: string;
      avatar: string | null;
    };
  };
}

export function useCreatePost() {
  return useMutation<CreatePostData, CreatePostVariables>(CREATE_POST, {
    optimisticResponse: (variables) => ({
      createPost: {
        __typename: 'Post',
        id: `temp-${Date.now()}`,
        title: variables.input.title,
        excerpt: variables.input.excerpt,
        content: variables.input.content,
        coverImage: variables.input.coverImage || null,
        publishedAt: new Date().toISOString(),
        author: {
          __typename: 'Author',
          id: 'current-user',
          name: 'You',
          avatar: null,
        },
      },
    }),
    update: (cache, { data }) => {
      if (!data?.createPost) return;

      // Update the posts list cache
      const existingPosts = cache.readQuery<{
        posts: { edges: Array<{ node: any; cursor: string }>;
          pageInfo: any; totalCount: number; };
      }>({
        query: GET_POSTS,
        variables: { first: 20 },
      });

      if (existingPosts) {
        cache.writeQuery({
          query: GET_POSTS,
          variables: { first: 20 },
          data: {
            posts: {
              ...existingPosts.posts,
              edges: [
                {
                  node: data.createPost,
                  cursor: data.createPost.id,
                },
                ...existingPosts.posts.edges,
              ],
              totalCount: existingPosts.posts.totalCount + 1,
            },
          },
        });
      }
    },
  });
}

// Usage
function CreatePostForm() {
  const [createPost, { loading, error }] = useCreatePost();

  const handleSubmit = async (data: PostFormData) => {
    try {
      await createPost({
        variables: {
          input: {
            title: data.title,
            excerpt: data.excerpt,
            content: data.content,
            coverImage: data.coverImage,
          },
        },
      });
      toast.success('Post created successfully');
    } catch (err) {
      toast.error('Failed to create post');
    }
  };

  return <Form onSubmit={handleSubmit} />;
}
```

### Mutation with Refetch

```typescript
// mutations/updateUser.ts
export const UPDATE_USER = gql`
  mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
    updateUser(id: $id, input: $input) {
      id
      name
      email
      avatar
      bio
    }
  }
`;

export function useUpdateUser() {
  return useMutation(UPDATE_USER, {
    refetchQueries: ({ data }) => {
      if (!data?.updateUser) return [];

      return [
        {
          query: GET_USER,
          variables: { id: data.updateUser.id },
        },
      ];
    },
  });
}
```

## Subscription Patterns

### Real-time Subscription

```typescript
// subscriptions/postUpdates.ts
import { gql, useSubscription } from '@apollo/client';

export const POST_UPDATES = gql`
  subscription OnPostUpdate($postId: ID!) {
    postUpdate(postId: $postId) {
      id
      title
      content
      updatedAt
      updatedBy {
        id
        name
        avatar
      }
    }
  }
`;

export interface PostUpdatesVariables {
  postId: string;
}

export interface PostUpdatesData {
  postUpdate: {
    id: string;
    title: string;
    content: string;
    updatedAt: string;
    updatedBy: {
      id: string;
      name: string;
      avatar: string | null;
    };
  };
}

export function usePostUpdates(postId: string) {
  return useSubscription<PostUpdatesData, PostUpdatesVariables>(
    POST_UPDATES,
    {
      variables: { postId },
      skip: !postId,
      onData: ({ data }) => {
        console.log('Post updated:', data);
        toast.info('Post has been updated');
      },
    }
  );
}

// Usage with WebSocket link setup
// apollo-client.ts
import { WebSocketLink } from '@apollo/client/link/ws';
import { split, HttpLink } from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';

const wsLink = new WebSocketLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_WS_ENDPOINT || '',
  options: {
    reconnect: true,
    connectionParams: () => ({
      authToken: getAuthToken(),
    }),
  },
});

const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT,
});

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
```

## Error Handling

### Comprehensive Error Management

```typescript
// utils/graphqlErrors.ts
import { GraphQLError, ApolloError } from '@apollo/client';

export interface FormattedError {
  message: string;
  code?: string;
  field?: string;
}

export function formatGraphQLErrors(
  error: ApolloError
): FormattedError[] {
  if (!error.graphQLErrors) {
    return [{ message: error.message || 'An unknown error occurred' }];
  }

  return error.graphQLErrors.map((err: GraphQLError) => {
    const code = err.extensions?.code as string | undefined;
    const field = err.extensions?.field as string | undefined;

    return {
      message: err.message,
      code,
      field,
    };
  });
}

export function getErrorMessage(error: ApolloError): string {
  const formatted = formatGraphQLErrors(error);

  // Handle specific error codes
  const validationError = formatted.find(e => e.code === 'VALIDATION_ERROR');
  if (validationError) {
    return `Validation failed: ${validationError.message}`;
  }

  const authError = formatted.find(e => e.code === 'UNAUTHENTICATED');
  if (authError) {
    return 'Please log in to continue';
  }

  const forbiddenError = formatted.find(e => e.code === 'FORBIDDEN');
  if (forbiddenError) {
    return "You don't have permission to perform this action";
  }

  const notFoundError = formatted.find(e => e.code === 'NOT_FOUND');
  if (notFoundError) {
    return 'The requested resource was not found';
  }

  return formatted[0]?.message || 'An unexpected error occurred';
}

// Usage in components
function PostEditor() {
  const [updatePost, { error }] = useUpdatePost();

  const handleSave = async () => {
    try {
      await updatePost({ variables: { ... } });
    } catch (err) {
      const message = getErrorMessage(err);
      toast.error(message);
    }
  };
}
```

## Type Generation

### Codegen Configuration

```yaml
# codegen.yml
overwrite: true
schema: ${GRAPHQL_ENDPOINT}
documents:
  - 'src/**/*.{ts,tsx}'
generates:
  src/generated/graphql.tsx:
    plugins:
      - 'typescript'
      - 'typescript-operations'
      - 'typescript-react-apollo'
    config:
      withHooks: true
      withComponent: false
      withHOC: false
  src/generated/graphql.ts:
    plugins:
      - 'typescript'
    config:
      skipTypename: false
      enumsAsTypes: true
hooks:
  afterOneFileWrite:
    - eslint --fix
```

### Using Generated Types

```typescript
import { useGetUserQuery, useCreatePostMutation } from '@/generated/graphql';

function UserProfile({ userId }: { userId: string }) {
  const { data, loading, error } = useGetUserQuery({
    variables: { id: userId },
  });

  const [createPost] = useCreatePostMutation({
    variables: {
      input: {
        title: 'New Post',
        excerpt: 'This is a new post',
        content: 'Post content here',
      },
    },
  });

  // All types are auto-generated and type-safe
}
```

## Performance Optimization

### Query Batching

```typescript
// apollo-client.ts
import { ApolloLink } from '@apollo/client';

const batchLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT,
  batchInterval: 10,
  batchMax: 10,
});

export const apolloClient = new ApolloClient({
  link: batchLink,
  cache: new InMemoryCache(),
});
```

### Prefetching and Cache-First

```typescript
// Optimized query with prefetch
function PostList() {
  const { data, loading } = usePosts({
    fetchPolicy: 'cache-first',
    nextFetchPolicy: 'cache-and-network',
  });

  // Prefetch on hover
  const handleMouseEnter = (postId: string) => {
    client.query({
      query: GET_POST,
      variables: { id: postId },
      fetchPolicy: 'cache-first',
    });
  };

  return (
    <div>
      {data?.posts.map(post => (
        <PostCard
          key={post.id}
          post={post}
          onMouseEnter={() => handleMouseEnter(post.id)}
        />
      ))}
    </div>
  );
}
```

## Best Practices

1. **Use Fragments**: Define reusable fragments to avoid duplication
2. **Pagination**: Implement cursor-based pagination for infinite lists
3. **Error Boundaries**: Wrap components in error boundaries
4. **Type Safety**: Use codegen for auto-generated types
5. **Optimistic Updates**: Provide immediate feedback for mutations
6. **Cache Strategy**: Choose appropriate fetch policies
7. **Subscriptions**: Use subscriptions sparingly for real-time features
8. **Authentication**: Handle auth tokens with proper error handling
9. **File Uploads**: Use multipart requests for file uploads
10. **Testing**: Mock GraphQL responses in tests

## Troubleshooting

### Cache Issues
```typescript
// Reset cache when needed
client.resetStore();

// Clear specific query
client.cache.evict({ id: 'Post:123' });
```

### Subscription Reconnection
```typescript
const wsLink = new WebSocketLink({
  uri: WS_ENDPOINT,
  options: {
    reconnect: true,
    lazy: true,
    connectionParams: async () => ({
      token: await getAuthToken(),
    }),
  },
});
```

## Common Patterns

### Lazy Loading with defer
```graphql
query GetUserWithDeferred($id: ID!) {
  user(id: $id) {
    id
    name
    email
  }
  ... @defer(label: "UserDetails") {
    user(id: $id) {
      posts {
        id
        title
      }
    }
  }
}
```

### Nested Queries with DataLoader
```typescript
// Server-side pattern for N+1 prevention
const DataLoader = require('dataloader');

const userLoader = new DataLoader(async (ids) => {
  const users = await User.query().whereIn('id', ids);
  return ids.map(id => users.find(u => u.id === id));
});
```

## Integration Checklist

- [ ] GraphQL endpoint configured
- [ ] Apollo/Relay client setup
- [ ] Error handling implemented
- [ ] Cache strategy defined
- [ ] Authentication flow working
- [ ] File uploads configured (if needed)
- [ ] Subscriptions connected (if needed)
- [ ] Type generation configured
- [ ] Error boundaries in place
- [ ] Performance monitoring set up
