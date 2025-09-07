
import { MainLayout } from '@/shared/layout/MainLayout';
import { DashboardHelpCenter } from '@/internal/dashboard/DashboardHelpCenter';

export default function HelpPage() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <DashboardHelpCenter />
      </div>
    </MainLayout>
  );
}
