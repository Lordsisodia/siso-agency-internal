# Setup Development Environment

Quick command to set up the SISO development environment.

## Steps to Execute:

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up database**:
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

3. **Run development server**:
   ```bash
   npm run dev
   ```

4. **Run tests** (in separate terminal):
   ```bash
   npm test
   ```

5. **Check project health**:
   ```bash
   npm run lint
   npm run typecheck
   ```

## Environment Requirements:
- Node.js 18+
- PostgreSQL (production) or SQLite (development)
- Required environment variables in `.env`

## Troubleshooting:
- Database connection issues: Check `test-database-connection.js`
- Build failures: Run `npm run build` to check for TypeScript errors
- Test failures: Check `/src/tests/` for failing test suites