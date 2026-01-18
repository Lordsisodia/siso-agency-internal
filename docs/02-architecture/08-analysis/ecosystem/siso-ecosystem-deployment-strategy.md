# SISO Ecosystem Architecture & Deployment Strategy
**Date:** January 9, 2025
**Analysis:** Monorepo vs Multi-Repo + Vercel Deployment Options

## 🎯 Your Requirements Analysis

From your thought dump, key constraints:
- **3 separate apps**: internal, client, partnership
- **Subdomain structure**: `SISO.agency/internal`, `SISO.agency/client`, `SISO.agency/partnership`
- **Vercel limits**: Want to bypass 12k file limit + edge function constraints
- **Separate GitHub repos**: For individual hosting control
- **Shared system**: All apps connect to same core system
- **Main branch auto-push**: After testing everything works

## 📊 Vercel 2025 Limits Research

### File Size Limits:
- **Edge Functions**: 2MB (Pro), 4MB (Enterprise)
- **No specific 12k file limit** found - this might be outdated info
- **Function Size**: 50MB uncompressed per function

### Plan Limits:
- **Hobby (Free)**: Limited, no overage billing
- **Pro ($20/user/month)**: 150k edge requests, 100 serverless hours, $200 default budget
- **Enterprise ($3500+/month)**: Custom limits

### Edge Function Limits:
- **Hobby**: 500k executions/month
- **Pro**: 1M executions/month  
- **Enterprise**: Custom

## 🏗️ Architecture Options

### Option 1: Multi-Repo + Separate Vercel Projects (RECOMMENDED)
```
GitHub Organization:
├── SISO-INTERNAL          → vercel.app/siso-internal
├── SISO-CLIENT            → vercel.app/siso-client  
├── SISO-PARTNERSHIP       → vercel.app/siso-partnership
├── SISO-SHARED            → npm package for common code
└── SISO-MAIN              → SISO.agency (routing config)
```

**Benefits:**
✅ **Separate Vercel projects** = separate limits for each app
✅ **Independent deployments** = no single point of failure  
✅ **Isolated resources** = each app gets full Pro plan limits
✅ **Team permissions** = different access for each repo
✅ **Easier scaling** = can upgrade individual apps to Enterprise

### Option 2: Monorepo + Multi-Zone Deployment
```
SISO-ECOSYSTEM/
├── apps/
│   ├── internal/          → deployed separately
│   ├── client/            → deployed separately
│   └── partnership/       → deployed separately
├── packages/
│   └── shared/            → shared components
└── apps/main/             → routing configuration
```

**Benefits:**
✅ **Shared code** = easier maintenance
✅ **Single CI/CD** = unified testing
❌ **Single Vercel project** = shared limits
❌ **Complex routing** = more configuration

## 🌐 Subdomain Routing Strategy

### Recommended Setup:
1. **Main Domain**: `SISO.agency` (routing config only)
2. **Subdomains**: 
   - `internal.SISO.agency` → SISO-INTERNAL deployment
   - `client.SISO.agency` → SISO-CLIENT deployment  
   - `partnership.SISO.agency` → SISO-PARTNERSHIP deployment

### Vercel Configuration:
```json
// SISO.agency vercel.json
{
  "rewrites": [
    {
      "source": "/internal/:path*",
      "destination": "https://internal.siso.agency/:path*"
    },
    {
      "source": "/client/:path*", 
      "destination": "https://client.siso.agency/:path*"
    },
    {
      "source": "/partnership/:path*",
      "destination": "https://partnership.siso.agency/:path*"
    }
  ]
}
```

## 💰 Cost Analysis

### Option 1 (Multi-Repo): 
- **4 Pro plans**: $80/month ($20 x 4 projects)
- **Individual limits**: Each app gets full Pro quotas
- **Scaling**: Can upgrade just one app to Enterprise if needed

### Option 2 (Monorepo):
- **1 Pro plan**: $20/month  
- **Shared limits**: All apps share single Pro quota
- **Risk**: One app can consume all resources

## 🔧 Implementation Approach

### Phase 1: Repository Setup
1. Create GitHub organization: `SISO-Agency`
2. Create repositories:
   - `SISO-INTERNAL` 
   - `SISO-CLIENT`
   - `SISO-PARTNERSHIP`
   - `SISO-SHARED` (npm package)
   - `SISO-MAIN` (routing only)

### Phase 2: Shared Package
```
SISO-SHARED/
├── src/
│   ├── components/        # Shared UI components
│   ├── services/          # API clients, auth
│   ├── types/             # TypeScript definitions
│   ├── hooks/             # React hooks
│   └── utils/             # Helper functions
├── package.json           # Private npm package
└── tsconfig.json
```

### Phase 3: App Structure
```
SISO-INTERNAL/
├── src/
│   ├── pages/
│   ├── components/        # App-specific components
│   └── features/
├── package.json           # includes @siso/shared
└── next.config.js         # basePath: '/internal'
```

### Phase 4: Deployment
1. Deploy each app to separate Vercel project
2. Configure custom domains
3. Set up main routing project
4. Test subdomain routing

## 🚀 Migration Strategy

### From Current SISO-INTERNAL:
1. **Extract shared code** → SISO-SHARED package
2. **Keep internal features** → SISO-INTERNAL repo
3. **Move client code** from Mac Mini → SISO-CLIENT repo
4. **Move partnership code** from Mac Mini → SISO-PARTNERSHIP repo

### CI/CD Pipeline:
```yaml
# Each repo gets this workflow
name: Deploy
on:
  push:
    branches: [main]
jobs:
  test:
    # Run all tests
  deploy:
    # Deploy to Vercel
    # Update shared package if needed
```

## 📊 Recommendation: Option 1 (Multi-Repo)

**Why this works best for your needs:**
- ✅ Separate Vercel limits per app (no 12k limit issues)
- ✅ Independent deployments and scaling
- ✅ Clean subdomain structure you wanted
- ✅ Individual GitHub repos as requested
- ✅ Shared code via npm package
- ✅ Can upgrade individual apps later
- ✅ Team access control per app

**Next Steps:**
1. Set up GitHub organization
2. Create shared package structure  
3. Extract current code into separate repos
4. Configure Vercel deployments
5. Set up subdomain routing

Want me to start implementing this architecture?