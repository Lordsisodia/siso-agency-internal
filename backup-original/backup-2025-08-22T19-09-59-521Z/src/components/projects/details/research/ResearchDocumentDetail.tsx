import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '@/components/ui/breadcrumb';
import { Calendar, Download, Tag, ChevronLeft, FileText, Lightbulb, ListChecks, CodeIcon, Copy } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResearchDocument } from '../types';
import { toast } from '@/components/ui/use-toast';

// This would come from an API or context in a real app
import { researchDocuments } from './mockData';

// A fallback document to use if the requested document is not found
const fallbackDocument: ResearchDocument = {
  id: 'template',
  title: 'Research Document Template',
  description: 'This is a template for a research document. In a real application, this would be replaced with actual data from your Supabase database.',
  category: 'Market Research',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  tags: ['template', 'research', 'example'],
  insights: [
    'Key insight 1: This is where you would put your first key insight',
    'Key insight 2: This is where you would put your second key insight',
    'Key insight 3: This is where you would put a third insight with more details about what was found'
  ],
  nextSteps: [
    'Recommendation 1: Implement feature based on findings',
    'Recommendation 2: Further research needed in specific area',
    'Recommendation 3: Consider alternative approach based on data'
  ],
  code_snippet: `// Example code snippet
function analyzeData(data) {
  // This is where your code implementation would go
  const results = data.map(item => {
    return {
      ...item,
      analyzed: true
    };
  });
  
  return results;
}`,
};

export function ResearchDocumentDetail() {
  const { id, documentId } = useParams<{ id: string; documentId: string }>();
  const projectId = id; // Alias for clearer code within component
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // Find the document by ID (in a real app, you would fetch this from an API)
  // If not found, use the fallback template document
  const document = researchDocuments.find(doc => doc.id === documentId) || fallbackDocument;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "The code snippet has been copied to your clipboard.",
      duration: 3000,
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Market Research': 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      'Technical': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      'UX Research': 'bg-green-500/10 text-green-500 border-green-500/20',
      'Legal': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      'Competition': 'bg-red-500/10 text-red-500 border-red-500/20',
      'Project Planning': 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20'
    };
    return colors[category] || '';
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumbs Navigation */}
      <Breadcrumb className="mb-6">
        <BreadcrumbItem>
          <BreadcrumbLink href={`/projects/${projectId}`}>Project</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink href={`/projects/${projectId}/market-research`}>Research</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink>{document.title}</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>

      {/* Document Header */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <Badge variant="outline" className={`${getCategoryColor(document.category)}`}>
              {document.category}
            </Badge>
            <span className="text-sm text-neutral-400 flex items-center">
              <Calendar className="h-4 w-4 mr-1" /> 
              Last updated: {formatDate(document.updated_at)}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">{document.title}</h1>
          <p className="text-neutral-300 max-w-3xl">{document.description}</p>
        </div>

        <div className="flex gap-3">
          <Button 
            onClick={() => navigate(`/projects/${projectId}/market-research`)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" /> Back to Research
          </Button>
          {document.fileUrl && (
            <Button className="flex items-center gap-2">
              <Download className="h-4 w-4" /> Download Document
            </Button>
          )}
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-6">
        {document.tags.map((tag) => (
          <Badge key={tag} variant="outline" className="text-sm">
            <Tag className="h-3 w-3 mr-1" />{tag}
          </Badge>
        ))}
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          {document.insights && document.insights.length > 0 && (
            <TabsTrigger value="insights">Insights</TabsTrigger>
          )}
          {document.nextSteps && document.nextSteps.length > 0 && (
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          )}
          {document.code_snippet && (
            <TabsTrigger value="code">Code Examples</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card className="bg-black/30 border-white/10 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Document Overview</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-neutral-300 mb-2">Description</h3>
                <p className="text-neutral-200">{document.description}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-neutral-300 mb-2">Created</h3>
                  <p className="text-neutral-200">{formatDate(document.created_at)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-neutral-300 mb-2">Last Updated</h3>
                  <p className="text-neutral-200">{formatDate(document.updated_at)}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Summary of all sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {document.insights && document.insights.length > 0 && (
              <Card className="bg-black/30 border-white/10 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="h-5 w-5 text-amber-500" />
                  <h3 className="text-lg font-semibold text-white">Key Insights</h3>
                </div>
                <p className="text-neutral-400 text-sm mb-2">
                  Critical findings from the research:
                </p>
                <ul className="list-disc list-inside text-sm text-neutral-300 space-y-1">
                  {document.insights.slice(0, 2).map((insight, idx) => (
                    <li key={idx}>{insight}</li>
                  ))}
                  {document.insights.length > 2 && (
                    <li className="text-neutral-400">
                      <Button 
                        variant="link" 
                        className="p-0 text-[#FF9800] hover:text-[#FF5722]"
                        onClick={() => setActiveTab('insights')}
                      >
                        +{document.insights.length - 2} more insights...
                      </Button>
                    </li>
                  )}
                </ul>
              </Card>
            )}

            {document.nextSteps && document.nextSteps.length > 0 && (
              <Card className="bg-black/30 border-white/10 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <ListChecks className="h-5 w-5 text-green-500" />
                  <h3 className="text-lg font-semibold text-white">Recommendations</h3>
                </div>
                <p className="text-neutral-400 text-sm mb-2">
                  Suggested next actions:
                </p>
                <ul className="list-disc list-inside text-sm text-neutral-300 space-y-1">
                  {document.nextSteps.slice(0, 2).map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                  {document.nextSteps.length > 2 && (
                    <li className="text-neutral-400">
                      <Button 
                        variant="link" 
                        className="p-0 text-[#FF9800] hover:text-[#FF5722]"
                        onClick={() => setActiveTab('recommendations')}
                      >
                        +{document.nextSteps.length - 2} more recommendations...
                      </Button>
                    </li>
                  )}
                </ul>
              </Card>
            )}

            {document.code_snippet && (
              <Card className="bg-black/30 border-white/10 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <CodeIcon className="h-5 w-5 text-blue-500" />
                  <h3 className="text-lg font-semibold text-white">Code Examples</h3>
                </div>
                <p className="text-neutral-400 text-sm mb-2">
                  Implementation examples available:
                </p>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setActiveTab('code')}
                >
                  View Code Examples
                </Button>
              </Card>
            )}
          </div>
        </TabsContent>

        {document.insights && document.insights.length > 0 && (
          <TabsContent value="insights">
            <Card className="bg-black/30 border-white/10 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="h-6 w-6 text-amber-500" />
                <h2 className="text-xl font-semibold text-white">Key Insights & Findings</h2>
              </div>
              <div className="space-y-4">
                {document.insights.map((insight, idx) => (
                  <div key={idx} className="bg-black/30 p-4 rounded-lg border border-white/5">
                    <p className="text-neutral-200">{insight}</p>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        )}

        {document.nextSteps && document.nextSteps.length > 0 && (
          <TabsContent value="recommendations">
            <Card className="bg-black/30 border-white/10 p-6">
              <div className="flex items-center gap-2 mb-4">
                <ListChecks className="h-6 w-6 text-green-500" />
                <h2 className="text-xl font-semibold text-white">Recommendations & Next Steps</h2>
              </div>
              <div className="space-y-4">
                {document.nextSteps.map((step, idx) => (
                  <div key={idx} className="bg-black/30 p-4 rounded-lg border border-white/5">
                    <p className="text-neutral-200">{step}</p>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        )}

        {document.code_snippet && (
          <TabsContent value="code">
            <Card className="bg-black/30 border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <CodeIcon className="h-6 w-6 text-blue-500" />
                  <h2 className="text-xl font-semibold text-white">Code Examples</h2>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-sm"
                  onClick={() => copyToClipboard(document.code_snippet as string)}
                >
                  <Copy className="h-4 w-4 mr-1" /> Copy
                </Button>
              </div>
              <div className="bg-black/50 p-4 rounded-lg border border-white/10 font-mono text-sm overflow-x-auto">
                <pre className="whitespace-pre-wrap text-neutral-200">
                  {document.code_snippet}
                </pre>
              </div>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
} 