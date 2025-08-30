# Project Health Check

Comprehensive health check for the SISO project.

## Full Health Check Commands:

1. **TypeScript compilation**:
   ```bash
   npx tsc --noEmit
   ```

2. **Linting**:
   ```bash
   npm run lint
   ```

3. **Testing**:
   ```bash
   npm test -- --coverage
   ```

4. **Database connectivity**:
   ```bash
   node test-database-connection.js
   ```

5. **Build verification**:
   ```bash
   npm run build
   ```

6. **Performance audit** (if available):
   ```bash
   npm run audit
   ```

## Success Criteria:
- ✅ Zero TypeScript errors
- ✅ All linting rules pass
- ✅ 90%+ test coverage
- ✅ Database connects successfully
- ✅ Build completes without errors
- ✅ No security vulnerabilities

## Quick Fix Commands:
- Auto-fix linting: `npm run lint -- --fix`
- Regenerate Prisma: `npx prisma generate`
- Reset test database: `npx prisma migrate reset`