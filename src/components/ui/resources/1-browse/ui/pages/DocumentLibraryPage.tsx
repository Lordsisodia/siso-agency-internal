/**
 * Document Library Page
 *
 * Dedicated document library view
 */

import { DocumentTable } from '@/components/ui/resources/1-browse/ui/components/DocumentTable';

export const DocumentLibraryPage = () => {
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Document Library</h1>
      </div>
      <DocumentTable />
    </div>
  );
};

export default DocumentLibraryPage;
