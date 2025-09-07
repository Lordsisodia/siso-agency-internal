# AI Navigation Guide

## Quick Start
1. `core/` - Essential services (8 total)
2. `features/` - Business logic by domain
3. `shared/` - Reusable components/utils
4. `ai-tools/` - Templates and patterns

## File Conventions
- `.service.ts` - Business logic
- `.component.tsx` - React components  
- `.types.ts` - Type definitions
- `.hooks.ts` - React hooks
- `.utils.ts` - Pure functions

## Import Patterns
Always use absolute imports:
```typescript
import { authService } from '@/core/auth.service';
import { Button } from '@/shared/ui/Button.component';
```
