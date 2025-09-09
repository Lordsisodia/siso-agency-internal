# Service Pattern

## Structure
- Single responsibility
- Export AI_INTERFACE
- Use singleton pattern
- Provide React hooks

## Example
```typescript
class MyService {
  // Implementation
}

export const myService = new MyService();
export function useMyService() {
  // React hook
}
```
