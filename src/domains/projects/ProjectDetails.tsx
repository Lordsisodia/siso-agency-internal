import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { ProjectHeader } from './details/ProjectHeader';
import { ProjectCardNavigation } from './details/ProjectCardNavigation';
import { ProjectOverviewCards } from './details/ProjectOverviewCards';
import { ProjectMetricsDashboard } from './details/ProjectMetricsDashboard';
import { ActiveTasksSection } from './details/ActiveTasksSection';
import { DevelopmentProgress } from './details/DevelopmentProgress';
import { AppPlanSection } from './details/AppPlanSection';
import { AgencyStepsSection } from './details/agency-steps/AgencyStepsSection';
import { FeatureRequestsSection } from './details/FeatureRequestsSection';
import { TimelineSection } from './details/TimelineSection';
import { FinancialSummarySection } from './details/FinancialSummarySection';
import { ResearchSection } from './details/ResearchSection';
import { ResearchDocumentDetail } from './details/research/ResearchDocumentDetail';
import { WireframeSection } from './details/WireframeSection';
import { AnimatedCard } from '@/components/ui/animated-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ProjectDetailsProps {
  initialTab?: string;
}

export function ProjectDetails({ initialTab }: ProjectDetailsProps) {
  const { id, tab, documentId } = useParams<{ id?: string; tab?: string; documentId?: string }>();
  const location = useLocation();
  const projectId = id || 'ubahcrypt';
  const navigate = useNavigate();
  
  // Normalize tab name - handle both wireframe and wireframes
  let normalizedInitialTab = initialTab;
  if (initialTab === 'wireframe') normalizedInitialTab = 'wireframes';
  
  let normalizedTab = tab;
  if (tab === 'wireframe') normalizedTab = 'wireframes';
  
  const activeTab = normalizedInitialTab || normalizedTab || 'overview';
  
  const contentRef = useRef<HTMLDivElement>(null);
  
  const [projectData, setProjectData] = useState({
    name: 'UbahCrypt Project',
    description: 'A revolutionary blockchain-based cryptocurrency platform with enhanced security features and cross-chain capabilities.',
    status: 'ACTIVE',
    created_at: '2025-04-01T10:00:00Z',
  });

  const [tabs, setTabs] = useState([]);

  // Determine if we're on a research document detail page
  const isResearchDocumentDetail = location.pathname.includes('/market-research/') && documentId;

  // This would typically fetch project data from your API
  useEffect(() => {
    // Simulate API fetch
    // const fetchProject = async () => {
    //   const { data } = await supabase.from('projects').select('*').eq('id', projectId).single();
    //   if (data) setProjectData(data);
    // };
    // fetchProject();
    
    // For now using static data
  }, [projectId]);

  // Handle tab navigation with automatic scrolling
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [activeTab]);

  useEffect(() => {
    const projectTabs = [
      { id: 'overview', label: 'Overview' },
      { id: 'agency-steps', label: 'Agency Steps' },
      { id: 'market-research', label: 'Market Research' },
      { id: 'wireframes', label: 'Wireframes' },
      { id: 'features', label: 'Feature Requests' },
      { id: 'user-flow', label: 'User Flow' },
      { id: 'feedback', label: 'Feedback' },
      { id: 'timeline', label: 'Timeline' },
    ];
    setTabs(projectTabs);
  }, []);

  const renderAppPlanOverview = () => (
    <div ref={contentRef}>
      <AnimatedCard className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-4">Crypto App Development Plan</h2>
        <p className="text-gray-300">
          This plan outlines the step-by-step process for developing the UbahCrypt application, 
          following the AI-Powered SaaS Development Best Practices Framework. The app will provide 
          users with features such as real-time crypto price tracking, portfolio management, and 
          secure transaction capabilities. Each phase leverages AI tools to enhance efficiency, quality, 
          and user satisfaction, tailored to the unique needs of a crypto app.
        </p>
      </AnimatedCard>
      
      <AppPlanSection />
    </div>
  );

  const renderTabContent = () => {
    // If we're on a research document detail page, render the detail component
    if (isResearchDocumentDetail) {
      return <ResearchDocumentDetail />;
    }

    switch (activeTab) {
      case 'overview':
        return renderAppPlanOverview();
      case 'agency-steps':
        return <AgencyStepsSection />;
      case 'market-research':
        return <ResearchSection />;
      case 'features':
        return <FeatureRequestsSection />;
      case 'wireframes':
        console.log("Rendering wireframes section");
        return (
          <div ref={contentRef}>
            <WireframeSection />
          </div>
        );
      case 'user-flow':
        // Use React Router navigation to avoid full page reload
        // This will properly navigate using the React Router context
        navigate(`/projects/${projectId}/userflow`);
        return null;
      case 'feedback':
        return (
          <div className="p-6 text-center" ref={contentRef}>
            <h3 className="text-xl font-semibold mb-2">Feedback</h3>
            <p className="text-gray-500 mb-4">Feedback section is coming soon.</p>
          </div>
        );
      case 'timeline':
        return (
          <div className="p-6 text-center" ref={contentRef}>
            <h3 className="text-xl font-semibold mb-2">Timeline</h3>
            <p className="text-gray-500 mb-4">Timeline section is coming soon.</p>
          </div>
        );
      default:
        return renderAppPlanOverview();
    }
  };

  return (
    <div className="space-y-8">
      <ProjectHeader 
        name={projectData.name} 
        description={projectData.description} 
        status={projectData.status} 
        created_at={projectData.created_at} 
      />
      {!isResearchDocumentDetail && <ProjectCardNavigation projectId={projectId} />}
      {renderTabContent()}
    </div>
  );
}
