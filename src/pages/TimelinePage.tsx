import { Helmet } from 'react-helmet';
import { DashboardLayout } from '@/internal/dashboard/layout/DashboardLayout';
import { TimelineSection } from '@/ecosystem/internal/projects/details/TimelineSection';
import { TimelineHeader } from '@/ecosystem/internal/projects/details/timeline/TimelineHeader';

export default function TimelinePage() {
  return (
    <DashboardLayout>
      <Helmet>
        <title>Project Timeline | SISO Resource Hub</title>
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <TimelineHeader />
        <TimelineSection />
      </div>
    </DashboardLayout>
  );
}
