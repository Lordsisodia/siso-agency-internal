import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  Box, 
  Code, 
  CopyCheck, 
  Layout, 
  MessageSquare, 
  Pencil, 
  Save, 
  Share2, 
  Undo2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { QuickFeedbackDialog } from './feedback/QuickFeedbackDialog';

interface UserFlowNavigationProps {
  projectId: string;
  projectName?: string;
  onSave?: () => void;
  onUndo?: () => void;
  canUndo?: boolean;
  status?: 'draft' | 'review' | 'approved';
}

export function UserFlowNavigation({
  projectId,
  projectName = 'App Project',
  onSave,
  onUndo,
  canUndo = false,
  status = 'draft'
}: UserFlowNavigationProps) {
  const getStatusBadge = () => {
    switch (status) {
      case 'draft':
        return <Badge className="bg-amber-500">Draft</Badge>;
      case 'review':
        return <Badge className="bg-blue-500">In Review</Badge>;
      case 'approved':
        return <Badge className="bg-green-500">Approved</Badge>;
      default:
        return <Badge className="bg-gray-500">Unknown</Badge>;
    }
  };
  
  return (
    <div className="w-full bg-black/20 border-b border-siso-text/10 backdrop-blur-md sticky top-0 z-20">
      <div className="container mx-auto py-2 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-medium flex items-center gap-2">
              <Activity className="h-5 w-5 text-siso-orange" />
              <span>User Flow</span>
            </h1>
            <div className="hidden md:block mx-2 h-4 w-px bg-siso-text/20"></div>
            <h2 className="hidden md:block text-sm text-muted-foreground">{projectName}</h2>
            <div className="ml-2">{getStatusBadge()}</div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="hidden md:flex gap-1"
              onClick={onUndo}
              disabled={!canUndo}
            >
              <Undo2 className="h-4 w-4" />
              Undo
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="hidden sm:flex gap-1"
              onClick={onSave}
            >
              <Save className="h-4 w-4" />
              Save
            </Button>
            
            <Button 
              variant="outline"
              size="sm"
              className="hidden md:flex gap-1"
              asChild
            >
              <Link to={`/projects/${projectId}/wireframes`}>
                <Layout className="h-4 w-4" />
                Wireframes
              </Link>
            </Button>
            
            <Button 
              variant="outline"
              size="sm"
              className="hidden md:flex gap-1"
              asChild
            >
              <Link to={`/projects/${projectId}/plan`}>
                <CopyCheck className="h-4 w-4" />
                Plan
              </Link>
            </Button>
            
            <QuickFeedbackDialog 
              nodeId="userflow-general"
              screenName="User Flow"
            />
            
            <div className="ml-2 hidden md:block">
              <Button variant="default" size="sm" className="gap-1">
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            </div>
            
            <Button variant="ghost" size="icon" className="md:hidden">
              <MessageSquare className="h-5 w-5" />
            </Button>
            
            <Button variant="ghost" size="icon" className="md:hidden">
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        <div className="flex overflow-x-auto -mb-px pt-2 scrollbar-none gap-4">
          <Link 
            to={`/projects/${projectId}/userflow`}
            className="text-sm text-muted-foreground hover:text-siso-text border-b-2 border-transparent hover:border-siso-orange pb-2 transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <Box className="h-4 w-4" />
              Flow Editor
            </span>
          </Link>
          <Link 
            to={`/projects/${projectId}/userflow/nodes`}
            className="text-sm text-muted-foreground hover:text-siso-text border-b-2 border-transparent hover:border-siso-orange pb-2 transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <Pencil className="h-4 w-4" />
              Screen Nodes
            </span>
          </Link>
          <Link 
            to={`/projects/${projectId}/userflow/feedback`}
            className="text-sm text-muted-foreground hover:text-siso-text border-b-2 border-transparent hover:border-siso-orange pb-2 transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <MessageSquare className="h-4 w-4" />
              Feedback Log
            </span>
          </Link>
          <Link 
            to={`/projects/${projectId}/userflow/code`}
            className="text-sm text-muted-foreground hover:text-siso-text border-b-2 border-transparent hover:border-siso-orange pb-2 transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <Code className="h-4 w-4" />
              Code Export
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
} 