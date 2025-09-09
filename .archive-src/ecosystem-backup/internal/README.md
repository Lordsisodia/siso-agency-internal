# 🏢 SISO Internal Ecosystem - Core Business Operations

**Status:** Active  
**Owner:** SISO Team  
**Last Updated:** 2025-09-08

## Quick Start
- **Main Entry Point:** `AdminLifeLock.tsx` (daily planning hub)
- **Key Dependencies:** Supabase, Clerk Auth, Task Management
- **Feature Flags:** Multiple migration flags active (see `src/migration/feature-flags.ts`)

## What This Does
The internal SISO ecosystem powers daily operations, task management, client administration, and team coordination. This is the core of SISO's productivity system.

## Domain Structure (30+ Organized Domains)
- **🎯 lifelock/** - Daily planning and life organization system
- **⚙️ admin/** - Client management, financials, team administration  
- **📋 tasks/** - Task management and project tracking
- **📊 dashboard/** - Internal dashboards and analytics
- **🤖 claudia/** - AI integration and automation tools
- **👥 teams/** - Internal team coordination
- **🎮 points/** - Gamification and XP system
- **📈 leaderboard/** - Performance tracking
- **🛠️ automations/** - Workflow automation
- **📅 calendar/** - Calendar integration
- **🎯 projects/** - Project management
- **💡 ai-tools/** - AI-powered productivity tools
- **📱 onboarding/** - User onboarding flows
- **🏪 xp-store/** - XP rewards and purchasing
- **📞 support/** - Internal support tools
- **👤 profile/** - User profile management
- **💬 feedback/** - Feedback collection
- **🏠 home/** - Home dashboard
- **🧱 blocks/** - Reusable UI blocks
- **🎨 demo/** - Demo and showcase components
- **🔧 dev-tools/** - Development utilities
- **⚡ breakthrough/** - Innovation tracking
- **🛠️ tools/** - General productivity tools
- **📱 app-plan/** - Application planning
- **📊 plan/** - Strategic planning
- **🗂️ core/** - Core system utilities

## Migration Status
- ✅ **Completed:** Component organization, ecosystem structure
- 🚧 **In Progress:** Hook decomposition, component consolidation  
- 📋 **TODO:** Complete UnifiedTaskCard migration, test coverage

## Related Folders
- **Shared with:** `src/shared/` (UI components, auth, utilities)
- **Dependencies:** `src/services/` (business logic), `src/hooks/` (data management)
- **Used by:** `src/pages/admin/` (routing), `src/refactored/` (migration targets)

## Navigation Tips
Each domain folder should contain:
- Components specific to that business area
- Domain-specific hooks and utilities  
- Types and interfaces for that domain
- Integration with shared systems

## Development Guidelines
1. **Keep domains separate** - Don't cross-import between domains unnecessarily
2. **Use shared components** - Import UI from `src/shared/ui/`
3. **Check feature flags** - Some components may be in migration state
4. **Follow naming conventions** - Use clear, descriptive folder and file names

## Need Help?
- **Architecture questions:** Check `SISO-ECOSYSTEM-ARCHITECTURE.md` in project root
- **Migration status:** Check `src/migration/` folder for current refactoring state
- **Component consolidation:** Check `src/refactored/` for newer versions