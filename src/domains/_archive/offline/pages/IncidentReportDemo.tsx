import React, { Suspense } from 'react';
const AdvancedNormalizedIncidentReport = React.lazy(() => import('@/components/ui/advanced-normalized-incident-report'));

function AdvancedNormalizedIncidentReportDemoPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-800 p-4 transition-colors duration-300">
      <Suspense fallback={<div className="text-center p-8">Loading report...</div>}>
        <AdvancedNormalizedIncidentReport />
      </Suspense>
    </div>
  );
}

export default AdvancedNormalizedIncidentReportDemoPage;