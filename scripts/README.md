# Scripts

Automation and analysis tools created during codebase consolidation.

## Structure

### `/migration`
One-time migration scripts (historical).
- migrate_*.py - Automated file migration tools
- salvage_*.py - Component salvage scripts
- restore_*.sh - File restoration utilities

**Note:** These are historical artifacts from Oct 2025 consolidation.

### `/analysis`
Codebase analysis tools.
- analyze_*.py/sh - Structure analysis
- check_*.sh - Import and dependency checks
- list_*.py - File listing utilities

### `/fixes`
Code fix and transformation utilities.
- fix_*.py/sh - Import path fixes
- update_*.sh - Batch update scripts

### `/verification`
Build and health check scripts.
- verify_*.sh - System verification
- test_*.sh - Import testing
- runtime_check.sh - Runtime safety checks

### `/utils`
General utility scripts.
- emergency-rollback.sh - Disaster recovery
- find_*.sh - Search utilities

---

## Usage

Most scripts are **historical artifacts** from the consolidation project.

For current development, use **package.json scripts**:
```bash
npm run dev          # Development server
npm run build        # Production build
npm run test         # Run tests
npm run lint         # Lint code
```
