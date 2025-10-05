
import { AppLayout } from "@/components/layout/AppLayout";
import { DocumentTable } from "@/components/resources/DocumentTable";

const demoDocuments = [
  {
    id: "1",
    name: "Contract.pdf",
    type: "PDF",
    uploadedDate: "2025-03-01",
    project: "Food Delivery MVP",
    url: "#"
  }
];

export default function DocumentLibraryPage() {
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Document Library</h1>
        </div>
        <DocumentTable documents={demoDocuments} />
      </div>
    </AppLayout>
  );
}
