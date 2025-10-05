import React from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { ProjectHeader } from '@/components/projects/details/ProjectHeader';
import { ProjectCardNavigation } from '@/components/projects/details/ProjectCardNavigation';
import { UserFlowNavigation } from '@/components/projects/userflow/UserFlowNavigation';
import { Table } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Pencil, 
  Trash2, 
  Plus, 
  Layers, 
  ExternalLink
} from 'lucide-react';

export default function UserFlowNodesPage() {
  const { projectId = '123' } = useParams<{ projectId: string }>();
  
  // Mock project data - this would come from an API in a real app
  const projectData = {
    name: 'UbahCrypt Project',
    description: 'A revolutionary blockchain-based cryptocurrency platform with enhanced security features and cross-chain capabilities.',
    status: 'ACTIVE',
    created_at: '2025-04-01T10:00:00Z',
  };
  
  // Mock nodes data
  const nodes = [
    {
      id: 'screen-login',
      name: 'Login Screen',
      type: 'screenNode',
      status: 'implemented',
      lastUpdated: '2023-10-15',
      connections: 2
    },
    {
      id: 'screen-dashboard',
      name: 'Dashboard',
      type: 'screenNode',
      status: 'implemented',
      lastUpdated: '2023-10-14',
      connections: 3
    },
    {
      id: 'screen-profile',
      name: 'User Profile',
      type: 'screenNode',
      status: 'in-progress',
      lastUpdated: '2023-10-12',
      connections: 1
    },
    {
      id: 'screen-wallet',
      name: 'Wallet View',
      type: 'screenNode',
      status: 'implemented',
      lastUpdated: '2023-10-10',
      connections: 2
    },
    {
      id: 'screen-trading',
      name: 'Trading Interface',
      type: 'screenNode',
      status: 'in-progress',
      lastUpdated: '2023-10-08',
      connections: 1
    },
    {
      id: 'screen-security',
      name: 'Security Center',
      type: 'screenNode',
      status: 'planned',
      lastUpdated: '2023-10-05',
      connections: 0
    }
  ];
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'implemented':
        return <Badge className="bg-green-500">Implemented</Badge>;
      case 'in-progress':
        return <Badge className="bg-amber-500">In Progress</Badge>;
      case 'planned':
        return <Badge className="bg-slate-500">Planned</Badge>;
      default:
        return <Badge className="bg-gray-500">Unknown</Badge>;
    }
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
      
      {/* User Flow Navigation */}
      <UserFlowNavigation 
        projectId={projectId}
        projectName="Agency Onboarding App"
        status="draft"
      />
      
      {/* Screen Nodes Content */}
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Screen Nodes</h2>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Screen
          </Button>
        </div>
        
        <Card className="overflow-hidden bg-black/20 border border-siso-text/10">
          <div className="overflow-x-auto">
            <Table>
              <thead className="bg-black/30">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Last Updated</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Connections</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {nodes.map((node) => (
                  <tr key={node.id} className="hover:bg-white/5">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="p-1.5 rounded-md bg-indigo-900/30 text-indigo-400 mr-3">
                          <Layers className="h-4 w-4" />
                        </div>
                        <span className="font-medium text-white">{node.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">Screen</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {getStatusBadge(node.status)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{node.lastUpdated}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{node.connections}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                          <ExternalLink className="h-4 w-4 text-gray-400" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                          <Pencil className="h-4 w-4 text-gray-400" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                          <Trash2 className="h-4 w-4 text-gray-400" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card>
      </div>
    </>
  );
} 