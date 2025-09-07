import { useEffect } from 'react';
import { ProjectOnboarding } from '@/ecosystem/internal/projects/ProjectOnboarding';
import { AppLayout } from '@/shared/layout/AppLayout';

export default function ProjectOnboardingPage() {
  // Set page title
  useEffect(() => {
    document.title = 'Create New Project | SISO AGENCY';
  }, []);

  return (
    <AppLayout>
      <div className="flex flex-col gap-6 py-6">
        <ProjectOnboarding />
      </div>
    </AppLayout>
  );
} 