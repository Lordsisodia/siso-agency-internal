import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Download, FileArchive, FilePlus, Image, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ClientDocument } from '@/types/client.types';
import { ClientDashboardLayout } from "@/components/client/ClientDashboardLayout";

export default function ClientDocumentsPage() {
  const [documents, setDocuments] = useState<ClientDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [clientId, setClientId] = useState<string | null>(null);
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchClientData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Use RPC to fetch client ID safely
        const { data: clientIdData, error: clientIdError } = await supabase.rpc('get_client_by_user_id', { user_uuid: user.id });

        if (clientIdError || !clientIdData || clientIdData.length === 0) return;
        const id = clientIdData[0].client_id;
        setClientId(id);

        // Fetch documents for this client
        const { data, error } = await supabase
          .from('client_documents')
          .select('*')
          .eq('client_id', id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Cast the document_type to ensure it matches the ClientDocument type
        const typedDocuments = (data || []).map(doc => ({
          ...doc,
          document_type: doc.document_type as "app_plan" | "functionalities" | "wireframes" | "inspiration"
        })) as ClientDocument[];

        setDocuments(typedDocuments);
      } catch (error) {
        console.error('Error fetching documents:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load documents",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchClientData();
  }, [toast]);

  const getDocumentIcon = (documentType: string) => {
    switch (documentType) {
      case 'app_plan':
        return <FileArchive className="h-5 w-5 text-orange-500" />;
      case 'functionalities':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'wireframes':
        return <Image className="h-5 w-5 text-purple-500" />;
      case 'inspiration':
        return <FilePlus className="h-5 w-5 text-green-500" />;
      default:
        return <File className="h-5 w-5 text-slate-500" />;
    }
  };

  const getDocumentTypeName = (documentType: string) => {
    switch (documentType) {
      case 'app_plan':
        return 'App Plan';
      case 'functionalities':
        return 'Functionalities';
      case 'wireframes':
        return 'Wireframes';
      case 'inspiration':
        return 'Inspiration';
      default:
        return documentType;
    }
  };

  const filteredDocuments = documents.filter(doc => 
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    getDocumentTypeName(doc.document_type).toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <ClientDashboardLayout>
        <div>
          <Skeleton className="h-10 w-48 mb-6" />
          <Skeleton className="h-12 w-full mb-6 rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Skeleton key={i} className="h-32 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </ClientDashboardLayout>
    );
  }

  return (
    <ClientDashboardLayout>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-slate-900">Documents</h1>

        <div className="mb-6">
          <Input
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>

        {filteredDocuments.length === 0 ? (
          <Card className="p-8 text-center">
            <FileText className="h-12 w-12 mx-auto text-slate-300 mb-3" />
            <h2 className="text-xl font-medium mb-2">No Documents Found</h2>
            <p className="text-slate-500 mb-6">
              {documents.length === 0 
                ? "No documents have been shared with you yet."
                : "No documents match your search criteria."}
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDocuments.map((doc) => (
              <Card key={doc.id} className="p-5 border border-slate-200 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-slate-100 rounded-md">
                    {getDocumentIcon(doc.document_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-slate-900 truncate" title={doc.title}>
                      {doc.title}
                    </h3>
                    <p className="text-sm text-slate-500 mb-1">
                      {getDocumentTypeName(doc.document_type)}
                    </p>
                    <p className="text-xs text-slate-400">
                      Updated: {new Date(doc.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" className="mt-0.5">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </ClientDashboardLayout>
  );
}
