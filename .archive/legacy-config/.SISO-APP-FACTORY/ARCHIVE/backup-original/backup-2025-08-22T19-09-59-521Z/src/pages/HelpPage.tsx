
import { MainLayout } from '@/components/layout/MainLayout';
import { DashboardHelpCenter } from '@/components/dashboard/DashboardHelpCenter';

export default function HelpPage() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <DashboardHelpCenter />
      </div>
    </MainLayout>
  );
}
