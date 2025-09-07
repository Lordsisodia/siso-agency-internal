import React, { useState } from 'react';
import { UserFlowNavigation } from '@/components/projects/userflow/UserFlowNavigation';
import { UserFlowDiagram } from '@/components/projects/userflow/UserFlowDiagram';
import { NodeDetailsSidebar } from '@/components/projects/userflow/NodeDetailsSidebar';
import { UserFlowToolbar } from '@/components/projects/userflow/UserFlowToolbar';
import { useToast } from '@/components/ui/use-toast';
import { useParams, useNavigate } from 'react-router-dom';
import { ProjectHeader } from '@/components/projects/details/ProjectHeader';
import { ProjectCardNavigation } from '@/components/projects/details/ProjectCardNavigation';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Info } from 'lucide-react';

export default function UserFlowPage() {
  const { projectId = '123' } = useParams<{ projectId: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Mock project data - this would come from an API in a real app
  const projectData = {
    name: 'UbahCrypt Project',
    description: 'A revolutionary blockchain-based cryptocurrency platform with enhanced security features and cross-chain capabilities.',
    status: 'ACTIVE',
    created_at: '2025-04-01T10:00:00Z',
  };
  
  const handleNodeSelect = (node: any) => {
    setSelectedNode(node);
    setIsSidebarOpen(true);
  };
  
  const handleSave = () => {
    toast({
      title: "Changes Saved",
      description: "Your user flow has been saved successfully.",
    });
  };
  
  const handleUndo = () => {
    toast({
      title: "Undo",
      description: "Last change has been undone.",
    });
  };
  
  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };
  
  return (
    <>
      {/* Project Header */}
      <ProjectHeader 
        name={projectData.name} 
        description={projectData.description} 
        status={projectData.status} 
        created_at={projectData.created_at} 
      />
      
      {/* Project Card Navigation */}
      <ProjectCardNavigation projectId={projectId} />
      
      {/* User Flow Info Card */}
      <Card className="p-4 mb-6 bg-black/30 border border-white/10">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-md bg-blue-500/20 text-blue-400">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-white mb-1">User Flow Designer</h3>
            <p className="text-sm text-gray-300">
              Create and edit user flows to map out how users will navigate through your application. 
              Connect screens, define interactions, and visualize the entire user journey.
            </p>
          </div>
          <Badge className="ml-auto" variant="outline">PRO Feature</Badge>
        </div>
      </Card>
      
      <UserFlowNavigation 
        projectId={projectId}
        projectName="Agency Onboarding App"
        onSave={handleSave}
        onUndo={handleUndo}
        canUndo={true}
        status="draft"
      />
      
      <div className="flex-1 flex overflow-hidden" style={{ minHeight: "700px", height: "calc(100vh - 300px)" }}>
        <div className="flex-1 flex flex-col overflow-hidden">
          <UserFlowToolbar />
          
          <div className="flex-1 overflow-auto" style={{ minHeight: "600px" }}>
            <UserFlowDiagram 
              projectId={projectId}
              onNodeSelect={handleNodeSelect}
              setIsLoading={setIsLoading}
            />
          </div>
        </div>
        
        {isSidebarOpen && (
          <NodeDetailsSidebar 
            node={selectedNode || { id: 'dummy-node', type: 'screen', data: { label: 'Home Screen' } }}
            onClose={handleCloseSidebar}
          />
        )}
      </div>
    </>
  );
} 