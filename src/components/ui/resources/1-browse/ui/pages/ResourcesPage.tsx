/**
 * Resources Page
 *
 * Main resources and documents hub
 */

import { DocumentTable } from '@/components/ui/resources/1-browse/ui/components/DocumentTable';

export const ResourcesPage = () => {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Resources</h1>
      <div className="grid gap-6">
        <DocumentTable />
      </div>
    </div>
  );
};

export default ResourcesPage;
