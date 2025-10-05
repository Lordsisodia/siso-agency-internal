import { useParams } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { ProjectHeader } from './ProjectHeader';
import { ProjectCardNavigation } from './ProjectCardNavigation';
import { ProjectOverviewCards } from './ProjectOverviewCards';
import { ProjectMetricsDashboard } from './ProjectMetricsDashboard';
import { ActiveTasksSection } from './ActiveTasksSection';
import { DevelopmentProgress } from './DevelopmentProgress';
import { AppPlanSection } from './app-plan/AppPlanSection';
import { AgencyStepsSection } from './agency-steps/AgencyStepsSection';
import { FeatureRequestsSection } from './FeatureRequestsSection';
import { TimelineSection } from './TimelineSection';
import { FinancialSummarySection } from './FinancialSummarySection';
import { ResearchSection } from './ResearchSection';
import { AnimatedCard } from '@/components/ui/animated-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function ProjectDetails() {
  
  const { id, tab } = useParams<{ id?: string; tab?: string }>();
  const projectId = id || 'ubahcrypt';
  const activeTab = tab || 'overview';
  const contentRef = useRef<HTMLDivElement>(null);
  
  const [projectData, setProjectData] = useState({
    name: 'UbahCrypt Project',
    description: 'A revolutionary blockchain-based cryptocurrency platform with enhanced security features and cross-chain capabilities.',
    status: 'ACTIVE',
    created_at: '2025-04-01T10:00:00Z',
  });

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

  const renderAppPlanOverview = () => (
    <div ref={contentRef}>
      <AnimatedCard className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-4">Development Plan</h2>
        <p className="text-gray-300">
          This plan outlines the step-by-step process for developing your custom application,
          following our AI-Powered SaaS Development Best Practices Framework. Each phase leverages AI tools 
          to enhance efficiency, quality, and user satisfaction, tailored to your project's unique requirements.
        </p>
      </AnimatedCard>
      
      <AppPlanSection />
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderAppPlanOverview();
      case 'agency-steps':
        return <AgencyStepsSection />;
      case 'market-research':
        return <ResearchSection />;
      case 'features':
        return <FeatureRequestsSection />;
      case 'wireframe':
        return (
          <div className="p-6 text-center text-neutral-400 bg-black/30 rounded-lg border border-white/10" ref={contentRef}>
            <p>Wireframe content is under development.</p>
          </div>
        );
      case 'user-flow':
        return (
          <div className="p-6 text-center text-neutral-400 bg-black/30 rounded-lg border border-white/10" ref={contentRef}>
            <p>User Flow content is under development.</p>
          </div>
        );
      case 'feedback-log':
        return (
          <div className="p-6 text-center text-neutral-400 bg-black/30 rounded-lg border border-white/10" ref={contentRef}>
            <p>Feedback Log content is under development.</p>
          </div>
        );
      default:
        return (
          <div className="p-6 text-center text-neutral-400 bg-black/30 rounded-lg border border-white/10" ref={contentRef}>
            <p>Content for {activeTab} tab is under development.</p>
          </div>
        );
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
      <ProjectCardNavigation projectId={projectId} />
      {renderTabContent()}
    </div>
  );
}
