// Vitest global test setup
// - Extend expect with jest-dom matchers
// - Provide lightweight mocks for heavy integrations

import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Enhanced fetch mock for Supabase operations
if (!(global as any).fetch) {
  (global as any).fetch = vi.fn(async (url: string, options?: any) => {
    const urlStr = url.toString();
    
    // Mock Supabase REST API responses
    if (urlStr.includes('/rest/v1/')) {
      const method = options?.method || 'GET';
      
      // Mock successful responses for common operations
      if (method === 'GET') {
        return {
          ok: true,
          status: 200,
          json: async () => ([]), // Empty array for GET requests
          headers: new Headers({
            'content-type': 'application/json',
            'content-range': '0-0/0'
          })
        };
      }
      
      if (method === 'POST') {
        return {
          ok: true,
          status: 201,
          json: async () => ({ id: 'test-id', created_at: new Date().toISOString() }),
          headers: new Headers({ 'content-type': 'application/json' })
        };
      }
      
      if (method === 'PATCH' || method === 'PUT') {
        return {
          ok: true,
          status: 200,
          json: async () => ({ id: 'test-id', updated_at: new Date().toISOString() }),
          headers: new Headers({ 'content-type': 'application/json' })
        };
      }
      
      if (method === 'DELETE') {
        return {
          ok: true,
          status: 204,
          json: async () => ({}),
          headers: new Headers({ 'content-type': 'application/json' })
        };
      }
    }
    
    // Mock Supabase Auth responses
    if (urlStr.includes('/auth/v1/')) {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          user: {
            id: 'test-user-id',
            email: 'test@example.com',
            user_metadata: { firstName: 'Test', lastName: 'User' }
          },
          session: {
            access_token: 'test-token',
            refresh_token: 'test-refresh-token',
            expires_at: Date.now() + 3600000
          }
        }),
        headers: new Headers({ 'content-type': 'application/json' })
      };
    }
    
    // Default response for other requests
    return {
      ok: true,
      status: 200,
      json: async () => ({}),
      headers: new Headers({ 'content-type': 'application/json' })
    };
  });
}

// Mock Supabase client to avoid real database calls
vi.mock('@supabase/supabase-js', () => {
  const mockSelect = () => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    gt: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lt: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    like: vi.fn().mockReturnThis(),
    ilike: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    contains: vi.fn().mockReturnThis(),
    containedBy: vi.fn().mockReturnThis(),
    rangeGt: vi.fn().mockReturnThis(),
    rangeGte: vi.fn().mockReturnThis(),
    rangeLt: vi.fn().mockReturnThis(),
    rangeLte: vi.fn().mockReturnThis(),
    rangeAdjacent: vi.fn().mockReturnThis(),
    overlaps: vi.fn().mockReturnThis(),
    textSearch: vi.fn().mockReturnThis(),
    match: vi.fn().mockReturnThis(),
    not: vi.fn().mockReturnThis(),
    or: vi.fn().mockReturnThis(),
    filter: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    abortSignal: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockReturnThis(),
    then: vi.fn((resolve) => {
      // Return realistic mock data based on the query context
      const mockData = [
        {
          id: 'test-task-1',
          title: 'Mock Task 1',
          description: 'Test task description',
          priority: 'medium',
          status: 'pending',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          user_id: 'test-user-id',
          subtasks: [],
          focusIntensity: 5,
          estimated_duration: 60,
          actual_duration: null,
          completion_percentage: 0,
          tags: [],
          dependencies: [],
          notes: '',
          task_date: '2024-01-01'
        },
        {
          id: 'test-task-2', 
          title: 'Mock Task 2',
          description: 'Another test task',
          priority: 'high',
          status: 'completed',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          user_id: 'test-user-id',
          subtasks: [
            {
              id: 'subtask-1',
              title: 'Mock Subtask',
              completed: true,
              created_at: '2024-01-01T00:00:00Z'
            }
          ],
          focusIntensity: 8,
          estimated_duration: 120,
          actual_duration: 110,
          completion_percentage: 100,
          tags: ['urgent', 'important'],
          dependencies: [],
          notes: 'Completed successfully',
          task_date: '2024-01-01'
        }
      ];
      return resolve({ data: mockData, error: null, count: 2, status: 200, statusText: 'OK' });
    })
  });

  const mockSupabaseClient = {
    from: vi.fn(() => mockSelect()),
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: {
          session: {
            user: { id: 'test-user-id', email: 'test@example.com' },
            access_token: 'test-token'
          }
        },
        error: null
      }),
      getUser: vi.fn().mockResolvedValue({
        data: {
          user: { id: 'test-user-id', email: 'test@example.com' }
        },
        error: null
      }),
      signInWithPassword: vi.fn().mockResolvedValue({
        data: { user: { id: 'test-user-id' }, session: { access_token: 'test-token' } },
        error: null
      }),
      signUp: vi.fn().mockResolvedValue({
        data: { user: { id: 'test-user-id' }, session: { access_token: 'test-token' } },
        error: null
      }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } }))
    },
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn().mockResolvedValue({ data: { path: 'test-path' }, error: null }),
        download: vi.fn().mockResolvedValue({ data: new Blob(), error: null }),
        remove: vi.fn().mockResolvedValue({ data: [], error: null }),
        list: vi.fn().mockResolvedValue({ data: [], error: null }),
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'test-url' } })
      }))
    },
    rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnThis(),
      unsubscribe: vi.fn().mockResolvedValue('ok')
    }))
  };

  return {
    createClient: vi.fn(() => mockSupabaseClient),
    SupabaseClient: vi.fn(() => mockSupabaseClient)
  };
});

// Mock Clerk in tests to avoid requiring real keys or network
vi.mock('@clerk/clerk-react', () => {
  return {
    ClerkProvider: ({ children }: any) => children,
    useUser: () => ({ user: { id: 'test-user', emailAddresses: [{ emailAddress: 'test@example.com' }], firstName: 'Test', lastName: 'User', imageUrl: '' }, isSignedIn: true, isLoaded: true })
  };
});

// Avoid noisy console errors from React Suspense/lazy during component tests
const origError = console.error;
console.error = (...args: any[]) => {
  const msg = String(args[0] || '');
  if (msg.includes('React DOM') || msg.includes('Not implemented: navigation')) return;
  origError(...args);
};

