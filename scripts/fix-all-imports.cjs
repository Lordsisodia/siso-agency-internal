#!/usr/bin/env node
/**
 * Comprehensive Import Path Fix Script
 *
 * This script fixes ALL import paths after the domain-based reorganization.
 * It handles:
 * - Old lib paths → new domain paths
 * - Utils subdirectory reorganization
 * - Service relocations
 * - Component movements
 * - Hook reorganization
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Color output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

console.log(`${colors.blue}🔧 Comprehensive Import Path Fix Script${colors.reset}\n`);

// Track statistics
const stats = {
  filesScanned: 0,
  filesModified: 0,
  replacementsMade: 0,
  errors: []
};

// ALL import path mappings after reorganization
const importMappings = {
  // ========================================================================
  // HOOKS - Domain migrations
  // ========================================================================

  // Morning Routine
  '@/lib/hooks/useMorningRoutineSupabase': '@/lib/domains/lifelock/1-daily/1-morning-routine/hooks/useMorningRoutineSupabase',

  // Health/Stats
  '@/lib/hooks/useDailyReflections': '@/lib/domains/lifelock/1-daily/5-stats/domain/useDailyReflections',
  '@/lib/hooks/useThoughtDump': '@/lib/domains/lifelock/1-daily/5-stats/domain/useThoughtDump',
  '@/lib/hooks/useCheckInOut': '@/lib/domains/lifelock/1-daily/5-stats/domain/useCheckInOut',
  '@/lib/hooks/useHealthSupabase': '@/lib/domains/lifelock/1-daily/5-stats/domain/useHealthSupabase',
  '@/lib/hooks/useHomeWorkoutSupabase': '@/lib/domains/lifelock/1-daily/5-stats/domain/useHomeWorkoutSupabase',
  '@/lib/hooks/useNutritionSupabase': '@/lib/domains/lifelock/1-daily/5-stats/domain/useNutritionSupabase',
  '@/lib/hooks/useWorkoutSupabase': '@/lib/domains/lifelock/1-daily/5-stats/domain/useWorkoutSupabase',
  '@/lib/hooks/useHealthNonNegotiablesSupabase': '@/lib/domains/lifelock/1-daily/5-stats/domain/useHealthNonNegotiablesSupabase',

  // Nightly Checkout
  '@/lib/hooks/useNightlyCheckoutSupabase': '@/lib/domains/lifelock/1-daily/7-checkout/hooks/useNightlyCheckoutSupabase',

  // Timebox
  '@/lib/hooks/useAutoTimeblocks': '@/lib/domains/lifelock/1-daily/6-timebox/domain/useAutoTimeblocks',

  // Tasks
  '@/lib/hooks/useTaskTimer': '@/lib/domains/lifelock/1-daily/2-tasks/domain/useTaskTimer',
  '@/lib/hooks/useTaskCRUD': '@/lib/domains/lifelock/1-daily/2-tasks/domain/useTaskCRUD',
  '@/lib/hooks/useTaskState': '@/lib/domains/lifelock/1-daily/2-tasks/domain/useTaskState',
  '@/lib/hooks/useTaskValidation': '@/lib/domains/lifelock/1-daily/2-tasks/domain/useTaskValidation',
  '@/lib/hooks/useSubtasks': '@/lib/domains/lifelock/1-daily/2-tasks/domain/useSubtasks',
  '@/lib/hooks/useTimeBlocks': '@/lib/domains/lifelock/1-daily/2-tasks/domain/useTimeBlocks',
  '@/lib/hooks/useTimeWindow': '@/lib/domains/lifelock/1-daily/2-tasks/domain/useTimeWindow',
  '@/lib/hooks/useTasks': '@/lib/domains/lifelock/1-daily/2-tasks/domain/useTaskCRUD',

  // Admin
  '@/lib/hooks/useBlogPostActions': '@/lib/domains/admin/hooks/useBlogPostActions',
  '@/lib/hooks/useVideoDetail': '@/lib/domains/admin/hooks/useVideoDetail',
  '@/lib/hooks/useVideoProcessing': '@/lib/domains/admin/hooks/useVideoProcessing',
  '@/lib/hooks/useBulkImport': '@/lib/domains/admin/hooks/useBulkImport',
  '@/lib/hooks/useRecommendedPackage': '@/lib/domains/admin/hooks/useRecommendedPackage',
  '@/lib/hooks/useReferralsManagement': '@/lib/domains/admin/hooks/useReferralsManagement',
  '@/lib/hooks/useLeadImport': '@/lib/domains/admin/hooks/useLeadImport',
  '@/lib/hooks/useLeadStats': '@/lib/domains/admin/hooks/useLeadStats',
  '@/lib/hooks/useExpensesSort': '@/lib/domains/admin/hooks/useExpensesSort',
  '@/lib/hooks/useExpensesTableData': '@/lib/domains/admin/hooks/useExpensesTableData',
  '@/lib/hooks/useTabConfiguration': '@/lib/domains/admin/hooks/useTabConfiguration',
  '@/lib/hooks/useTableColumns': '@/lib/domains/admin/hooks/useTableColumns',
  '@/lib/hooks/useTableViews': '@/lib/domains/admin/hooks/useTableViews',

  // Features
  '@/lib/hooks/useAiArticleSummary': '@/lib/domains/features/hooks/useAiArticleSummary',
  '@/lib/hooks/useAiDailySummary': '@/lib/domains/features/hooks/useAiDailySummary',
  '@/lib/hooks/useEducationChat': '@/lib/domains/features/hooks/useEducationChat',
  '@/lib/hooks/useFeatureDetail': '@/lib/domains/features/hooks/useFeatureDetail',
  '@/lib/hooks/useFeatureFlags': '@/lib/domains/features/hooks/useFeatureFlags',
  '@/lib/hooks/useFeatureSelection': '@/lib/domains/features/hooks/useFeatureSelection',
  '@/lib/hooks/useFeatures': '@/lib/domains/features/hooks/useFeatures',

  // Partners
  '@/lib/hooks/usePartnerApplication': '@/lib/domains/partners/partnership/hooks/usePartnerApplication',
  '@/lib/hooks/usePartnerNavigation': '@/lib/domains/partners/partnership/hooks/usePartnerNavigation',
  '@/lib/hooks/usePartnerStats': '@/lib/domains/partners/partnership/hooks/usePartnerStats',

  // LifeLock Shared
  '@/lib/hooks/useBasicUserData': '@/lib/domains/lifelock/_shared/hooks/useBasicUserData',
  '@/lib/hooks/useServiceInitialization': '@/lib/domains/lifelock/_shared/hooks/useServiceInitialization',
  '@/lib/hooks/useDayPeriod': '@/lib/domains/lifelock/_shared/hooks/useDayPeriod',
  '@/lib/hooks/useGamificationInit': '@/lib/domains/lifelock/_shared/hooks/useGamificationInit',
  '@/lib/hooks/useLifeLockDataLoader': '@/lib/domains/lifelock/_shared/hooks/useLifeLockDataLoader',

  // Generic Hooks (kept in lib)
  '@/lib/hooks/useAuth': '@/lib/hooks/auth/useClerkUser',
  '@/lib/hooks/useAuthSession': '@/lib/hooks/auth/useAuthSession',
  '@/lib/hooks/useClerkUser': '@/lib/hooks/auth/useClerkUser',
  '@/lib/hooks/useOnboardingAuth': '@/lib/hooks/auth/useOnboardingAuth',
  '@/lib/hooks/useSupabaseAuth': '@/lib/hooks/auth/useSupabaseAuth',
  '@/lib/hooks/useTenant': '@/lib/hooks/auth/useTenant',
  '@/lib/hooks/useUser': '@/lib/hooks/auth/useUser',

  // UI Hooks
  '@/lib/hooks/use-toast': '@/lib/hooks/ui/useToast',
  '@/lib/hooks/use-mobile': '@/lib/hooks/ui/useMobile',
  '@/lib/hooks/useLocalStorage': '@/lib/hooks/ui/useLocalStorage',
  '@/lib/hooks/useLongPress': '@/lib/hooks/ui/useLongPress',
  '@/lib/hooks/useAutoScroll': '@/lib/hooks/ui/useAutoScroll',
  '@/lib/hooks/useElementSize': '@/lib/hooks/ui/useElementSize',
  '@/lib/hooks/useOfflineManager': '@/lib/hooks/ui/useOfflineManager',
  '@/lib/hooks/useOnlineStatus': '@/lib/hooks/ui/useOnlineStatus',
  '@/lib/hooks/usePagination': '@/lib/hooks/ui/usePagination',
  '@/lib/hooks/useSmoothScroll': '@/lib/hooks/ui/useSmoothScroll',
  '@/lib/hooks/useViewportLoading': '@/lib/hooks/ui/useViewportLoading',

  // Performance Hooks
  '@/lib/hooks/useVoiceProcessing': '@/lib/hooks/performance/useVoiceProcessing',

  // ========================================================================
  // UTILS - Subdirectory reorganization
  // ========================================================================

  // Core Utils
  '@/lib/utils/typeHelpers': '@/lib/utils/core/typeHelpers',
  '@/lib/utils/slugUtils': '@/lib/utils/core/slugUtils',
  '@/lib/utils/envCheck': '@/lib/utils/core/envCheck',
  '@/lib/utils/errorSuppressions': '@/lib/utils/core/errorSuppressions',
  '@/lib/utils/registerServiceWorker': '@/lib/utils/core/registerServiceWorker',

  // API Utils
  '@/lib/utils/dashboardMetrics': '@/lib/utils/api/dashboardMetrics',
  '@/lib/utils/dataChecker': '@/lib/utils/api/dataChecker',
  '@/lib/utils/dayProgress': '@/lib/utils/api/dayProgress',
  '@/lib/utils/financialHelpers': '@/lib/utils/api/financialHelpers',
  '@/lib/utils/planTemplatesApi': '@/lib/utils/api/planTemplatesApi',
  '@/lib/utils/xpPsychologyUtils': '@/lib/utils/api/xpPsychologyUtils',

  // Client Utils
  '@/lib/utils/clientData': '@/lib/utils/client/clientData',
  '@/lib/utils/clientDataProcessors': '@/lib/utils/client/clientDataProcessors',
  '@/lib/utils/clientDataUtils': '@/lib/utils/client/clientDataUtils',
  '@/lib/utils/clientFallbackUtils': '@/lib/utils/client/clientFallbackUtils',
  '@/lib/utils/clientQueryBuilders': '@/lib/utils/client/clientQueryBuilders',

  // UI Utils
  '@/lib/utils/confetti': '@/lib/utils/ui/confetti',
  '@/lib/utils/downloadUtils': '@/lib/utils/ui/downloadUtils',

  // Validation Utils
  '@/lib/utils/validation.utils': '@/lib/utils/validation/validation.utils',
  '@/lib/utils/inviteClientUser': '@/lib/utils/validation/inviteClientUser',

  // Timeblock Utils
  '@/lib/utils/timeblock-overlap.utils': '@/lib/utils/timeblock/timeblock-overlap.utils',
  '@/lib/utils/formatTaskProgress': '@/lib/utils/timeblock/formatTaskProgress',

  // Testing Utils
  '@/lib/utils/api-testing.utils': '@/lib/utils/testing/api-testing.utils',
  '@/lib/utils/database-testing.utils': '@/lib/utils/testing/database-testing.utils',
  '@/lib/utils/voice-testing.utils': '@/lib/utils/testing/voice-testing.utils',

  // Performance Utils
  '@/lib/utils/lazyComponents': '@/lib/utils/performance/lazyComponents',
  '@/lib/utils/performanceOptimizations': '@/lib/utils/performance/performanceOptimizations',

  // ========================================================================
  // SERVICES - Domain migrations
  // ========================================================================

  // Task Services
  '@/services/tasks/taskService': '@/lib/domains/tasks/services/taskService',
  '@/services/tasks/sharedTaskDataService': '@/lib/domains/tasks/services/sharedTaskDataService',
  '@/services/tasks/workflowService': '@/lib/domains/tasks/services/workflowService',
  '@/services/tasks/workTypeApiClient': '@/lib/domains/tasks/services/workTypeApiClient',
  '@/services/supabaseTaskService': '@/lib/domains/tasks/services/taskService',

  // Database Services
  '@/services/database/DeepWorkTaskService': '@/services/database/DeepWorkTaskService',
  '@/services/database/LightWorkTaskService': '@/services/database/LightWorkTaskService',

  // Orchestrators
  '@/services/tasks/orchestrators/DeepWorkOrchestrator': '@/lib/domains/tasks/services/orchestrators/DeepWorkOrchestrator',
  '@/services/tasks/orchestrators/LightWorkOrchestrator': '@/lib/domains/tasks/services/orchestrators/LightWorkOrchestrator',

  // Gamification Services
  '@/services/gamificationService': '@/lib/domains/xp-store/services/gamificationService',
  '@/services/gamificationSystem': '@/lib/domains/xp-store/services/gamificationSystem',
  '@/services/xpStoreService': '@/lib/domains/xp-store/services/xpStoreService',
  '@/services/xpStoreAdminService': '@/lib/domains/xp-store/services/xpStoreService',

  // Voice Services
  '@/services/voice': '@/lib/domains/lifelock/services',

  // Data Services
  '@/services/data/feedbackService': '@/services/data/feedbackService',
  '@/services/dataService': '@/services/data/feedbackService',

  // ========================================================================
  // LIB - DOMAINS removal (many paths incorrectly had /lib/domains/)
  // ========================================================================
  '@/lib/domains/': '@/domains/',

  // ========================================================================
  // COMPONENTS - Shared to domain migrations
  // ========================================================================

  '@/components/shared/ProfileContent': '@/lib/domains/profile/ui/ProfileInfo',
  '@/components/shared/ErrorFallback': '@/lib/domains/tasks/components-from-shared/ErrorFallback',
  '@/components/shared/ParticlesBackground': '@/lib/domains/resources/components-from-shared/ParticlesBackground',
  '@/components/shared/ResourceCard': '@/lib/domains/resources/components-from-shared/ResourceCard',
  '@/components/shared/ResourcesGrid': '@/lib/domains/resources/components-from-shared/ResourcesGrid',
  '@/domains/calendar/ui/calendar': '@/components/ui/calendar',

  // Client/Teams components moved to archive
  '@/client/client/': '@/domains/_archive/client/',
  '@/domains/client/': '@/domains/_archive/client/',
  '@/domains/client/hooks/useClientsList': '@/domains/clients/hooks/useClientsList',
  '@/domains/client/hooks/useClientDetail': '@/domains/clients/hooks/useClientDetail',
  '@/domains/client/hooks/useClientTasks': '@/domains/clients/hooks/useClientTasks',
  '@/domains/teams/TimelineTaskView': '@/domains/_archive/teams/TimelineTaskView',

  // Docs components
  '@/docs/DocumentTable': '@/domains/_archive/docs/DocumentTable',

  // ========================================================================
  // STORES - Domain migrations
  // ========================================================================
  '@/lib/stores/tasks/taskProviderCompat': '@/lib/domains/tasks/stores/taskStore',
  '@/lib/stores/tasks/taskStore': '@/lib/domains/tasks/stores/taskStore',

  // ========================================================================
  // REMOVED/DELETED - Comment out or remove
  // ========================================================================
  '@/services/chatMemoryService': null, // Deleted - needs recreation
  '@/services/flowStatsService': null, // Deleted - needs recreation
  '@/services/claudiaIntegrationService': null, // Deleted
  '@/services/analyticsService': null, // Deleted
  '@/lib/hooks/useTaskDragDrop': null, // Deleted
  '@/lib/hooks/useTaskOperations': '@/lib/domains/lifelock/1-daily/2-tasks/domain/useTaskCRUD',
  '@/lib/hooks/useTaskEditing': '@/lib/domains/lifelock/1-daily/2-tasks/domain/useTaskEditing',
  '@/lib/hooks/useTaskFiltering': '@/lib/domains/lifelock/1-daily/2-tasks/domain/useTaskFiltering',
};

// Special patterns for regex matching
const patternReplacements = [
  // Fix /lib/domains/ paths (should be /domains/)
  {
    pattern: /from ['"]@\/lib\/domains\//g,
    replacement: "from '@/domains/",
    description: "Remove /lib/ from domain imports"
  },
  // Fix relative imports that should use absolute paths
  {
    pattern: /from ['"]\.\/useClerkUser['"]/g,
    replacement: "from '@/lib/hooks/auth/useClerkUser'",
    description: "Fix relative useClerkUser imports"
  },
  {
    pattern: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/hooks\/useClerkUser['"]/g,
    replacement: "from '@/lib/hooks/auth/useClerkUser'",
    description: "Fix deep relative useClerkUser imports"
  },
  // Fix @/lib/hooks/use-* paths
  {
    pattern: /from ['"]@\/lib\/hooks\/use-([A-Z][a-zA-Z]*)['"]/g,
    replacement: (match, hookName) => `from '@/lib/hooks/ui/${hookName === 'mobile' ? 'useMobile' : 'use' + hookName.substring(1)}'`,
    description: "Fix kebab-case hook imports"
  },
  // Consolidated utils
  {
    pattern: /from ['"]@\/lib\/utils\/debounce['"]/g,
    replacement: "from '@/lib/utils'",
    description: "Debounce consolidated to utils.ts"
  },
];

/**
 * Fix imports in a single file
 */
function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    let modified = false;
    let replacementsInFile = 0;

    // Apply all import mappings
    for (const [oldPath, newPath] of Object.entries(importMappings)) {
      if (newPath === null) {
        // Comment out deleted imports
        const regex = new RegExp(
          `(import\\s*{[^}]*}\\s*from\\s*['"\`]${oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"\`])`,
          'g'
        );
        if (regex.test(content)) {
          content = content.replace(regex, '// $1 // TODO: Recreate this import');
          modified = true;
          replacementsInFile++;
          console.log(`${colors.yellow}  Commented out: ${oldPath}${colors.reset}`);
        }
        continue;
      }

      // Single quote imports
      let regex = new RegExp(
        `from ['"]${oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']`,
        'g'
      );

      if (regex.test(content)) {
        content = content.replace(regex, `from '${newPath}'`);
        modified = true;
        replacementsInFile++;
        console.log(`${colors.green}  ✓${colors.reset} ${oldPath} → ${newPath}`);
      }

      // Double quote imports
      regex = new RegExp(
        `from ["']${oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']`,
        'g'
      );

      if (regex.test(content)) {
        content = content.replace(regex, `from "${newPath}"`);
        modified = true;
        replacementsInFile++;
        console.log(`${colors.green}  ✓${colors.reset} ${oldPath} → ${newPath}`);
      }
    }

    // Apply pattern replacements
    for (const { pattern, replacement, description } of patternReplacements) {
      const before = content;
      content = content.replace(pattern, replacement);
      if (content !== before) {
        modified = true;
        replacementsInFile++;
        console.log(`${colors.blue}  🔧${colors.reset} ${description}`);
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf-8');
      stats.filesModified++;
      stats.replacementsMade += replacementsInFile;
      return true;
    }

    return false;
  } catch (error) {
    stats.errors.push({ file: filePath, error: error.message });
    return false;
  }
}

/**
 * Main execution
 */
function main() {
  console.log(`${colors.blue}Scanning src/ directory...${colors.reset}\n`);

  let filesProcessed = 0;

  // Find all TypeScript files
  try {
    const files = execSync('find src -name "*.ts" -o -name "*.tsx"', { encoding: 'utf-8' })
      .split('\n')
      .filter(f => f && !f.includes('node_modules') && !f.includes('.next'));

    stats.filesScanned = files.length;

    files.forEach(file => {
      const filePath = file.trim();
      if (filePath && fs.existsSync(filePath)) {
        filesProcessed++;
        process.stdout.write(`\r${colors.blue}Processing: ${filesProcessed}/${files.length}${colors.reset}`);
        fixFile(filePath);
      }
    });

    console.log(`\n\n${colors.green}✅ Fix Complete!${colors.reset}\n`);
    console.log(`${colors.blue}Statistics:${colors.reset}`);
    console.log(`  Files scanned:    ${stats.filesScanned}`);
    console.log(`  Files modified:   ${stats.filesModified}`);
    console.log(`  Replacements made: ${stats.replacementsMade}`);

    if (stats.errors.length > 0) {
      console.log(`\n${colors.red}Errors encountered: ${stats.errors.length}${colors.reset}`);
      stats.errors.slice(0, 5).forEach(({ file, error }) => {
        console.log(`  ${colors.red}✗${colors.reset} ${file}: ${error}`);
      });
      if (stats.errors.length > 5) {
        console.log(`  ... and ${stats.errors.length - 5} more`);
      }
    }

    console.log(`\n${colors.blue}Next steps:${colors.reset}`);
    console.log(`  1. Run: ${colors.green}npm run build${colors.reset}`);
    console.log(`  2. If build fails, run this script again`);
    console.log(`  3. Check git diff to see all changes\n`);

  } catch (error) {
    console.error(`${colors.red}Error:${colors.reset}`, error.message);
    process.exit(1);
  }
}

// Run the script
main();
