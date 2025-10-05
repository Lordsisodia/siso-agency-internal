import { useParams, Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useClientAppDetails } from '@/hooks/useClientAppDetails';
import { ClientAppHeader } from '@/components/client-app/ClientAppHeader';
import { ClientAppStats } from '@/components/client-app/ClientAppStats';
import { ClientAppTimeline } from '@/components/client-app/ClientAppTimeline';
import { ClientAppFeatures } from '@/components/client-app/ClientAppFeatures';
import { ClientAppMediaPreview } from '@/components/client-app/ClientAppMediaPreview';
import { ClientAppCaseStudy } from '@/components/client-app/ClientAppCaseStudy';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProjectActions } from '@/components/projects/details/ProjectActions';
import { ArrowLeft } from 'lucide-react';
import { Spotlight } from '@/components/ui/spotlight';

// Function to get preview data based on client ID
const getPreviewData = (clientId: string) => {
  // Default wireframe URLs for all projects
  const defaultWireframes = [
    "/images/wireframes/wireframe-1.png",
    "/images/wireframes/wireframe-2.png",
    "/images/wireframes/wireframe-3.png"
  ];
  
  // Map project IDs to specific wireframe images
  const wireframeMap: Record<string, string[]> = {
    'project-1': [
      "/images/wireframes/construction-dashboard.png",
      "/images/wireframes/construction-scheduling.png",
      "/images/wireframes/construction-estimating.png"
    ],
    'project-2': [
      "/images/wireframes/crypto-dashboard.png",
      "/images/wireframes/crypto-trading.png",
      "/images/wireframes/crypto-portfolio.png"
    ],
    'project-3': [
      "/images/wireframes/fitness-dashboard.png",
      "/images/wireframes/fitness-classes.png",
      "/images/wireframes/fitness-members.png"
    ]
  };
  
  // Map project IDs to demo videos
  const videoMap: Record<string, string> = {
    'project-1': "https://www.youtube.com/embed/dQw4w9WgXcQ?si=demo-construction",
    'project-2': "https://www.youtube.com/embed/dQw4w9WgXcQ?si=demo-crypto",
    'project-3': "https://www.youtube.com/embed/dQw4w9WgXcQ?si=demo-fitness"
  };
  
  return {
    videoUrl: videoMap[clientId] || "https://www.youtube.com/embed/dQw4w9WgXcQ",
    wireframeUrls: wireframeMap[clientId] || defaultWireframes
  };
};

export default function ClientAppDetailsPage() {
  const { clientId } = useParams<{ clientId: string }>();
  const { appData, clientData, loading, error } = useClientAppDetails(clientId);

  if (error) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-black/30 border border-siso-text/10 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-semibold mb-4 text-white">App Details Not Found</h2>
            <p className="text-siso-text mb-6">
              We couldn't find the app details you're looking for. This might be because:
              <br />
              - The client ID is invalid
              <br />
              - You don't have access to this client
              <br />
              - The client hasn't set up their app yet
            </p>
            <Button asChild>
              <Link to="/economy/leaderboards">Return to Leaderboard</Link>
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Get preview data for this client
  const previewData = getPreviewData(clientId || '');

  // Mock data for our new components - in a real app this would come from the API
  const mockCaseStudy = {
    challenge: "The client needed a comprehensive platform to manage their business operations, struggling with manual processes and scattered tools.",
    solution: `We developed a centralized management platform for ${appData?.app_name || 'their business'} with automated processes and analytics features.`,
    results: [
      "Reduced manual processing time by 65%",
      "Increased revenue by 30% through better management",
      "Improved team coordination and communication"
    ],
    metrics: {
      timeToMarket: `${appData?.estimated_days || 30} days`,
      costSavings: "£25,000/year",
      userBase: "100+ users"
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 relative">
        <Spotlight className="-top-40 left-0" />
        
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" asChild className="mr-2">
            <Link to="/economy/leaderboards">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to Leaderboard
            </Link>
          </Button>
        </div>

        {loading ? (
          <LoadingState />
        ) : (
          <div className="space-y-8">
            <ClientAppHeader 
              appName={appData?.app_name || "App Name"} 
              clientName={clientData?.full_name || clientData?.business_name || "Client"} 
              status={appData?.status || "pending"}
              description={appData?.description || undefined}
            />
            
            <ClientAppStats 
              estimatedCost={appData?.estimated_cost}
              estimatedDays={appData?.estimated_days}
              completionPercentage={clientData?.current_step ? 
                Math.round((clientData.current_step / (clientData.total_steps || 1)) * 100) : 20}
            />

            <Tabs defaultValue="preview" className="w-full">
              <TabsList className="mb-8">
                <TabsTrigger value="preview">Preview</TabsTrigger>
                <TabsTrigger value="features">Features</TabsTrigger>
                <TabsTrigger value="case-study">Case Study</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
              </TabsList>

              <TabsContent value="preview">
                <ClientAppMediaPreview {...previewData} />
              </TabsContent>

              <TabsContent value="features">
                <ClientAppFeatures features={appData?.features || []} />
              </TabsContent>

              <TabsContent value="case-study">
                <ClientAppCaseStudy {...mockCaseStudy} />
              </TabsContent>

              <TabsContent value="timeline">
                <ClientAppTimeline clientData={clientData} />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

// Loading state component
const LoadingState = () => (
  <div className="space-y-8">
    <div className="space-y-4">
      <Skeleton className="h-12 w-1/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-4/5" />
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
    
    <div className="space-y-4">
      <Skeleton className="h-60 w-full" />
      <Skeleton className="h-40 w-full" />
    </div>
  </div>
);
