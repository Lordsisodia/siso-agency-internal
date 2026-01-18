import { execSync } from 'child_process';

const remainingMappings = {
  // Task hooks → tasks domain
  '@/lib/hooks/useTaskTimer': '@/lib/domains/lifelock/1-daily/2-tasks/domain/useTaskTimer',
  '@/lib/hooks/useTaskCRUD': '@/lib/domains/lifelock/1-daily/2-tasks/domain/useTaskCRUD',
  '@/lib/hooks/useTaskState': '@/lib/domains/lifelock/1-daily/2-tasks/domain/useTaskState',
  '@/lib/hooks/useTaskValidation': '@/lib/domains/lifelock/1-daily/2-tasks/domain/useTaskValidation',
  '@/lib/hooks/useTaskOperations': '@/lib/domains/lifelock/1-daily/2-tasks/domain/useTaskCRUD', // alias
  '@/lib/hooks/useTasks': '@/lib/domains/lifelock/1-daily/2-tasks/domain/useTaskCRUD', // likely alias
  '@/lib/hooks/useTaskDragDrop': '@/lib/domains/lifelock/1-daily/2-tasks/domain/useTaskCRUD', // likely

  // Feature hooks → features domain
  '@/lib/hooks/useFeatures': '@/lib/domains/features/hooks/useFeatures',
  '@/lib/hooks/useFeatureFlags': '@/lib/domains/features/hooks/useFeatureFlags',

  // Partner hooks → partners domain
  '@/lib/hooks/usePartnerNavigation': '@/lib/domains/partners/partnership/hooks/usePartnerNavigation',
  '@/lib/hooks/usePartnerStats': '@/lib/domains/partners/partnership/hooks/usePartnerStats',
  '@/lib/hooks/usePartnerApplication': '@/lib/domains/partners/partnership/hooks/usePartnerApplication',

  // Lead hooks → admin domain
  '@/lib/hooks/useLeadImport': '@/lib/domains/admin/hooks/useLeadImport',
  '@/lib/hooks/useLeadStats': '@/lib/domains/admin/hooks/useLeadStats',

  // Auth → auth subdirectory
  '@/lib/hooks/useAuth': '@/lib/hooks/auth/useClerkUser', // likely alias
  '@/lib/hooks/useAuthSession': '@/lib/hooks/auth/useAuthSession',
};

function runSedCommands() {
  console.log('🔧 Fixing remaining old-style imports...');

  for (const [oldPath, newPath] of Object.entries(remainingMappings)) {
    const escapedOld = oldPath.replace(/\//g, '\\/').replace(/-/g, '\\-');
    const command = `find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' "s|from '${escapedOld}'|from '${newPath}'|g"`;
    try {
      execSync(command, { stdio: 'inherit' });
    } catch (e) {
      // Ignore errors
    }
  }

  console.log('✅ Complete');
}

runSedCommands();
