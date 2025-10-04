// 🔄 DUPLICATE REDIRECT
// This file was a diverged duplicate with broken imports (MD5: bc0922e235a498989bbd2edb6aba95b8)
// pointing to non-existent @/components/admin/lifelock/ paths.
//
// Canonical: src/ecosystem/internal/lifelock/AdminLifeLockDay.tsx
// Purpose: LifeLock daily workflow page with tab-based sections
// Lines: 210 (canonical), 205 (this duplicate)
//
// This redirect maintains backward compatibility while eliminating confusion.
// Phase 2.9 - LifeLock component consolidation
//
// Why this was wrong version:
// - Imported from @/components/admin/lifelock/sections/* which doesn't exist
// - Not used by App.tsx (App.tsx uses /ecosystem/internal/lifelock/ version)
// - Had stale/broken import paths

export { default } from '@/ecosystem/internal/lifelock/AdminLifeLockDay';
