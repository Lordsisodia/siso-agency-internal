import { useParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProjectDetails } from '@/components/projects/ProjectDetails';

interface ProjectDetailsPageProps {
  tab?: string;
}

export default function ProjectDetailsPage({ tab: propTab }: ProjectDetailsPageProps = {}) {
  const { id, tab: paramTab, documentId } = useParams();
  
  // Normalize tab name - handle both wireframe and wireframes
  let normalizedPropTab = propTab;
  if (propTab === 'wireframe') normalizedPropTab = 'wireframes';
  
  let normalizedParamTab = paramTab;
  if (paramTab === 'wireframe') normalizedParamTab = 'wireframes';
  
  const activeTab = normalizedPropTab || normalizedParamTab;
  
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <ProjectDetails initialTab={activeTab} />
      </div>
    </AppLayout>
  );
}
