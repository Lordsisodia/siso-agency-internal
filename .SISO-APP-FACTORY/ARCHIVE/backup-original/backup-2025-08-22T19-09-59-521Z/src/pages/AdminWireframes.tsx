import { useParams } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { WireframeAdmin } from '@/components/projects/admin/WireframeAdmin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminWireframes() {
  const { projectId } = useParams<{ projectId: string }>();
  
  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <Card className="bg-black/20 border-gray-800 mb-6">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white">Wireframes Management</CardTitle>
            <CardDescription className="text-gray-400">
              Add, edit, and manage project wireframes and their documentation links
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-300 mb-4">
              This panel allows administrators to manage wireframes that are shown to clients.
              You can track wireframe status, add Notion document links, and manage the development pipeline.
            </p>
          </CardContent>
        </Card>
        
        <WireframeAdmin projectId={projectId} />
      </div>
    </AdminLayout>
  );
}
