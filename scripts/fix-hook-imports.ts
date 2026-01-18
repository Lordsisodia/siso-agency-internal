import { execSync } from 'child_process';
import { writeFileSync, readFileSync } from 'fs';
import { join } from 'path';

const hookMappings = {
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
  '@/lib/hooks/useNightlyCheckoutSupabase': '@/lib/domains/lifelock/1-daily/7-checkout/hooks/useNightlyCheckoutSupabase',

  // Timebox
  '@/lib/hooks/useAutoTimeblocks': '@/lib/domains/lifelock/1-daily/6-timebox/domain/useAutoTimeblocks',

  // Admin
  '@/lib/hooks/useBlogPostActions': '@/lib/domains/admin/hooks/useBlogPostActions',
  '@/lib/hooks/useVideoDetail': '@/lib/domains/admin/hooks/useVideoDetail',
  '@/lib/hooks/useVideoProcessing': '@/lib/domains/admin/hooks/useVideoProcessing',
  '@/lib/hooks/useBulkImport': '@/lib/domains/admin/hooks/useBulkImport',
  '@/lib/hooks/useRecommendedPackage': '@/lib/domains/admin/hooks/useRecommendedPackage',
  '@/lib/hooks/useReferralsManagement': '@/lib/domains/admin/hooks/useReferralsManagement',
  '@/lib/hooks/useExpensesSort': '@/lib/domains/admin/hooks/useExpensesSort',
  '@/lib/hooks/useExpensesTableData': '@/lib/domains/admin/hooks/useExpensesTableData',
  '@/lib/hooks/useTabConfiguration': '@/lib/domains/admin/hooks/useTabConfiguration',
  '@/lib/hooks/useTableColumns': '@/lib/domains/admin/hooks/useTableColumns',
  '@/lib/hooks/useTableViews': '@/lib/domains/admin/hooks/useTableViews',

  // LifeLock Shared
  '@/lib/hooks/useBasicUserData': '@/lib/domains/lifelock/_shared/hooks/useBasicUserData',
  '@/lib/hooks/useServiceInitialization': '@/lib/domains/lifelock/_shared/hooks/useServiceInitialization',
  '@/lib/hooks/useDayPeriod': '@/lib/domains/lifelock/_shared/hooks/useDayPeriod',
  '@/lib/hooks/useGamificationInit': '@/lib/domains/lifelock/_shared/hooks/useGamificationInit',
  '@/lib/hooks/useLifeLockDataLoader': '@/lib/domains/lifelock/_shared/hooks/useLifeLockDataLoader',

  // UI Hooks (stay in lib but correct path)
  '@/lib/hooks/use-mobile': '@/lib/hooks/ui/useMobile',
  '@/lib/hooks/use-toast': '@/lib/hooks/ui/useToast',
  '@/lib/hooks/useLocalStorage': '@/lib/hooks/ui/useLocalStorage',
  '@/lib/hooks/useLongPress': '@/lib/hooks/ui/useLongPress',
  '@/lib/hooks/useAutoScroll': '@/lib/hooks/ui/useAutoScroll',
  '@/lib/hooks/useElementSize': '@/lib/hooks/ui/useElementSize',
  '@/lib/hooks/useOfflineManager': '@/lib/hooks/ui/useOfflineManager',
  '@/lib/hooks/useOnlineStatus': '@/lib/hooks/ui/useOnlineStatus',
  '@/lib/hooks/usePagination': '@/lib/hooks/ui/usePagination',
  '@/lib/hooks/useSmoothScroll': '@/lib/hooks/ui/useSmoothScroll',
  '@/lib/hooks/useViewportLoading': '@/lib/hooks/ui/useViewportLoading',

  // Auth Hooks (stay in lib)
  '@/lib/hooks/useAuthSession': '@/lib/hooks/auth/useAuthSession',
  '@/lib/hooks/useClerkUser': '@/lib/hooks/auth/useClerkUser',
  '@/lib/hooks/useOnboardingAuth': '@/lib/hooks/auth/useOnboardingAuth',
  '@/lib/hooks/useSupabaseAuth': '@/lib/hooks/auth/useSupabaseAuth',
  '@/lib/hooks/useTenant': '@/lib/hooks/auth/useTenant',
  '@/lib/hooks/useUser': '@/lib/hooks/auth/useUser',

  // Performance (stay in lib)
  '@/lib/hooks/useVoiceProcessing': '@/lib/hooks/performance/useVoiceProcessing',
};

function fixImports(filePath: string): string {
  let content = readFileSync(filePath, 'utf-8');
  let modified = false;

  for (const [oldPath, newPath] of Object.entries(hookMappings)) {
    const regex = new RegExp(`from ['"]${oldPath.replace('/', '\\/')}['"]`, 'g');
    if (regex.test(content)) {
      content = content.replace(regex, `from '${newPath}'`);
      modified = true;
    }
  }

  return modified ? content : null;
}

// Run sed commands for bulk replacement
function runSedCommands() {
  console.log('🔧 Running bulk import fixes...');

  for (const [oldPath, newPath] of Object.entries(hookMappings)) {
    const escapedOld = oldPath.replace(/\//g, '\\/').replace(/-/g, '\\-');
    const command = `find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' "s|from '${escapedOld}'|from '${newPath}'|g"`;
    try {
      execSync(command, { stdio: 'inherit' });
    } catch (e) {
      // Ignore errors
    }
  }

  console.log('✅ Import fixes complete');
}

runSedCommands();
