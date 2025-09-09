# Development Patterns

## AI_INTERFACE Required
Every module must export AI_INTERFACE:
```typescript
export const AI_INTERFACE = {
  purpose: "What this module does",
  exports: ["main", "exports"],
  patterns: ["patterns", "used"]
};
```

## Service Pattern
- Singleton instances
- Clear responsibility
- React hooks for components

## Component Pattern  
- Feature-based organization
- Single component per file
- TypeScript props interface

## No Circular Dependencies
Use dependency injection and clear service layers.
