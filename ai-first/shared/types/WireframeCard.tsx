import React, { useCallback } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Eye, FileIcon } from 'lucide-react';
import { Wireframe } from '@/hooks/useProjectWireframes';
import { useNavigate } from 'react-router-dom';

interface WireframeCardProps {
  wireframe: Wireframe;
  projectId: string;
  onClick?: () => void;
  isActive?: boolean;
}

export function WireframeCard({ wireframe, projectId, onClick, isActive = false }: WireframeCardProps) {
  const navigate = useNavigate();
  
  // Define status color logic as a memoized function
  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'complete':
        return 'bg-emerald-500 text-white';
      case 'in-progress':
        return 'bg-blue-500 text-white';
      case 'approved':
        return 'bg-emerald-500 text-white';
      case 'in-review':
        return 'bg-amber-500 text-white';
      case 'pending':
      default:
        return 'bg-slate-600 text-slate-100';
    }
  }, []);

  // Handle view click
  const handleViewClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/projects/${projectId}/wireframes/${wireframe.id}`);
  }, [navigate, projectId, wireframe.id]);

  // Handle external link click
  const handleExternalLinkClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (wireframe.notionUiPlanLink) {
      window.open(wireframe.notionUiPlanLink, '_blank');
    }
  }, [wireframe.notionUiPlanLink]);

  // Get a background color based on the first letter of the title
  const getCardColor = () => {
    const colorOptions = [
      {
        header: 'bg-indigo-600',
        bg: 'bg-indigo-900/40',
        border: 'border-indigo-700'
      },
      {
        header: 'bg-blue-600',
        bg: 'bg-blue-900/40',
        border: 'border-blue-700'
      },
      {
        header: 'bg-emerald-600',
        bg: 'bg-emerald-900/40',
        border: 'border-emerald-700'
      },
      {
        header: 'bg-amber-600',
        bg: 'bg-amber-900/40',
        border: 'border-amber-700'
      },
      {
        header: 'bg-violet-600',
        bg: 'bg-violet-900/40',
        border: 'border-violet-700'
      },
      {
        header: 'bg-pink-600',
        bg: 'bg-pink-900/40',
        border: 'border-pink-700'
      },
      {
        header: 'bg-cyan-600',
        bg: 'bg-cyan-900/40',
        border: 'border-cyan-700'
      }
    ];
    
    // Simple hash function based on the title
    const index = wireframe.title.charCodeAt(0) % colorOptions.length;
    return colorOptions[index];
  };

  const colorSet = getCardColor();

  return (
    <Card 
      className={`transition-all hover:shadow-lg overflow-hidden 
        border ${colorSet.border} bg-slate-800 h-full
        ${isActive ? 'ring-2 ring-indigo-400 shadow-md' : ''}
      `}
      onClick={onClick}
    >
      <div className={`h-6 w-full ${colorSet.header} relative`}>
        <Badge className="absolute right-2 top-1 text-xs capitalize bg-slate-800 text-white border-0">
          {wireframe.category}
        </Badge>
      </div>
      
      <CardHeader className={`pb-2 pt-4 ${colorSet.bg}`}>
        <CardTitle className="text-lg font-semibold text-white truncate">
          {wireframe.title}
        </CardTitle>
        <CardDescription className="line-clamp-3 text-slate-300 text-sm">
          {wireframe.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pb-2 space-y-3">
        <div className="flex flex-wrap gap-2 text-xs">
          <Badge variant="outline" className={`capitalize ${getStatusColor(wireframe.wireframeStatus)} border-slate-600`}>
            Design: {wireframe.wireframeStatus}
          </Badge>
          <Badge variant="outline" className={`capitalize ${getStatusColor(wireframe.specsStatus)} border-slate-600`}>
            Specs: {wireframe.specsStatus}
          </Badge>
          <Badge variant="outline" className={`capitalize ${getStatusColor(wireframe.devStatus)} border-slate-600`}>
            Dev: {wireframe.devStatus}
          </Badge>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between pt-2 mt-auto bg-slate-900/50">
        {wireframe.notionUiPlanLink ? (
          <Button 
            variant="outline" 
            size="sm" 
            className="text-indigo-300 hover:text-indigo-200 border-indigo-700 hover:border-indigo-600 bg-slate-800/70"
            onClick={handleExternalLinkClick}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Notion
          </Button>
        ) : (
          <div></div> // Empty div to maintain flex spacing when no Notion link
        )}
        <Button 
          variant="default" 
          size="sm" 
          className="bg-indigo-600 hover:bg-indigo-500 text-white" 
          onClick={handleViewClick}
        >
          <Eye className="h-4 w-4 mr-2" />
          View
        </Button>
      </CardFooter>
    </Card>
  );
} 