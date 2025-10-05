import { useEffect } from 'react';
import { ProjectOnboarding } from '@/components/projects/ProjectOnboarding';
import { AppLayout } from '@/components/layout/AppLayout';

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