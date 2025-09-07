
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Sidebar } from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ChevronLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { safeSupabase } from '@/utils/supabaseHelpers';

const BlogPost = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  console.log('BlogPost - postId from params:', postId);

  // Simple placeholder query since we're removing the blog-post service
  const { isLoading, error } = useQuery({
    queryKey: ['blog-post', postId],
    queryFn: async () => {
      // Placeholder function that will just return null
      // This query is kept just to maintain the component structure
      return null;
    },
    enabled: !!postId,
  });

  // Go back to news list
  const handleGoBack = () => {
    navigate('/ai-news');
  };

  // Loading state with improved UI
  if (isLoading) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-background">
          <Sidebar />
          <div className="flex-1 p-8">
            <Button
              variant="ghost"
              onClick={handleGoBack}
              className="mb-6"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to News
            </Button>
            
            <div className="animate-pulse space-y-8 max-w-4xl mx-auto">
              <div className="h-8 w-48 bg-siso-border rounded" />
              <div className="h-64 w-full bg-siso-border rounded" />
              <div className="space-y-4">
                <div className="h-4 w-full bg-siso-border rounded" />
                <div className="h-4 w-2/3 bg-siso-border rounded" />
              </div>
            </div>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  // Error state with retry option
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar />
        <div className="flex-1 p-8">
          <Button
            variant="ghost"
            onClick={handleGoBack}
            className="mb-6"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to News
          </Button>
          
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="bg-red-500/10 p-4 rounded-full mb-6">
              <AlertTriangle className="h-12 w-12 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Article Not Found</h2>
            <p className="text-gray-400 max-w-md mb-8">
              We couldn't load this article. It may have been removed or is currently unavailable.
            </p>
            <div className="flex gap-4">
              <Button onClick={handleGoBack}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to Articles
              </Button>
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default BlogPost;
