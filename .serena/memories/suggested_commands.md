# SISO Internal - Suggested Development Commands

## Essential Development Commands

### Development Server
```bash
npm run dev                    # Start Vite development server (port 5173)
npm run dev:legacy            # Run with legacy server + Vite
npm run dev:hybrid            # Run with hybrid server + Vite  
npm run dev:full              # Run legacy server + Vite concurrently
```

### Build & Deployment
```bash
npm run build                 # Build for production
npm run build:dev             # Development build
npm run preview               # Preview production build locally
npm run deploy:vercel         # Deploy to Vercel via API
```

### Code Quality & Testing
```bash
npm run lint                  # Run ESLint checks
npm run lint:fix              # Auto-fix ESLint issues
npm run test                  # Run Vitest test suite
npm run test:components       # Run component mount tests
```

### Tauri Desktop App
```bash
npm run tauri                 # Tauri CLI commands
npm run tauri:dev             # Development mode for desktop app
npm run tauri:build           # Build desktop app for production
```

### Git & Setup
```bash
npm run prepare               # Initialize Husky git hooks
git add . && git commit -m "message"  # Standard git workflow
```

## macOS/Darwin Specific Commands

### File Operations
```bash
ls -la                        # List files with details
find . -name "*.tsx" -type f  # Find TypeScript React files
grep -r "searchterm" src/     # Search in source files
cd src/pages                  # Navigate to pages directory
```

### Process Management
```bash
ps aux | grep node            # Check running Node processes
lsof -i :5173                 # Check what's using port 5173
killall node                  # Kill all Node processes (if needed)
```

### System Info
```bash
node -v && npm -v             # Check Node/npm versions  
system_profiler SPHardwareDataType | grep "Model Name"  # Check Mac model
```

## Task Completion Workflow
1. **Before coding**: Check `npm run lint` passes
2. **After changes**: Run `npm run test` 
3. **Before commit**: Run `npm run lint:fix`
4. **Production check**: Run `npm run build`

## Performance Monitoring
- Development server runs on port 5173
- Hot Module Replacement (HMR) enabled
- Lazy loading configured for optimal performance
- Build analysis available via Vite bundle analyzer