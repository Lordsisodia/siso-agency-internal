import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, Download, ExternalLink, FileText, 
  Zap, Shield, Users, Clock, BarChart, Pin
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { ResearchDocument } from '../types';
import { Link, useParams } from 'react-router-dom';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface PinnedResearchAssetProps {
  doc: ResearchDocument;
  categoryColors: Record<string, string>;
}

// Helper function to get category-specific styling
const getCategoryStyle = (category: string) => {
  switch(category) {
    case 'Market Research':
      return {
        icon: <BarChart className="w-4 h-4" />,
        color: "text-purple-400",
        bgColor: "bg-purple-950/50",
        borderColor: "border-purple-800/50",
        badgeColor: "bg-purple-800",
        headerColor: "from-purple-900/20 to-indigo-900/10"
      };
    case 'Technical':
      return {
        icon: <Zap className="w-4 h-4" />,
        color: "text-blue-400",
        bgColor: "bg-blue-950/50",
        borderColor: "border-blue-800/50",
        badgeColor: "bg-blue-800",
        headerColor: "from-blue-900/20 to-indigo-900/10"
      };
    case 'UX Research':
      return {
        icon: <Users className="w-4 h-4" />,
        color: "text-emerald-400",
        bgColor: "bg-emerald-950/50",
        borderColor: "border-emerald-800/50",
        badgeColor: "bg-emerald-800",
        headerColor: "from-emerald-900/20 to-teal-900/10"
      };
    case 'Legal':
      return {
        icon: <Shield className="w-4 h-4" />,
        color: "text-amber-400",
        bgColor: "bg-amber-950/50",
        borderColor: "border-amber-800/50",
        badgeColor: "bg-amber-800",
        headerColor: "from-amber-900/20 to-yellow-900/10"
      };
    case 'Competition':
      return {
        icon: <BarChart className="w-4 h-4" />,
        color: "text-red-400",
        bgColor: "bg-red-950/50",
        borderColor: "border-red-800/50",
        badgeColor: "bg-red-800",
        headerColor: "from-red-900/20 to-rose-900/10"
      };
    case 'Project Planning':
      return {
        icon: <Clock className="w-4 h-4" />,
        color: "text-indigo-400",
        bgColor: "bg-indigo-950/50",
        borderColor: "border-indigo-800/50",
        badgeColor: "bg-indigo-800",
        headerColor: "from-indigo-900/20 to-violet-900/10"
      };
    default:
      return {
        icon: <FileText className="w-4 h-4" />,
        color: "text-slate-400",
        bgColor: "bg-slate-950/50",
        borderColor: "border-slate-800/50",
        badgeColor: "bg-slate-800",
        headerColor: "from-slate-900/20 to-slate-900/10"
      };
  }
};

export function PinnedResearchAsset({ doc, categoryColors }: PinnedResearchAssetProps) {
  const { id: projectId } = useParams<{ id: string }>();
  const categoryStyle = getCategoryStyle(doc.category);
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.01 }}
    >
      <Card 
        className={cn(
          "bg-slate-900 border border-indigo-700/30 h-full flex flex-col",
          "relative overflow-hidden shadow-lg",
          "hover:shadow-indigo-900/20 hover:border-indigo-700/50 transition-all duration-300",
          "bg-gradient-to-br from-indigo-950/40 to-slate-900"
        )}
      >
        {/* Category indicator band */}
        <div className={`h-1.5 w-full bg-indigo-600`} />
        
        {/* Pinned indicator */}
        <div className="absolute top-3 right-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="h-5 w-5 rounded-full bg-indigo-600/50 flex items-center justify-center">
                  <Pin className="h-3 w-3 text-indigo-300" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p className="text-xs">Pinned Document</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        {/* Header section */}
        <div className="p-5 pb-3">
          <div className="flex items-center gap-2 mb-3">
            <div className={`p-1.5 rounded-md ${categoryStyle.bgColor} ${categoryStyle.borderColor}`}>
              <div className={categoryStyle.color}>
                {categoryStyle.icon}
              </div>
            </div>
            <h3 className="text-lg font-semibold text-white line-clamp-1">{doc.title}</h3>
          </div>
          
          <p className="text-sm text-slate-300 line-clamp-2 mb-3">{doc.description}</p>
          
          {/* Tags */}
          {doc.tags && doc.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {doc.tags.map((tag) => (
                <Badge 
                  key={tag} 
                  variant="outline" 
                  className="text-xs bg-indigo-950/60 border-indigo-700/30 text-indigo-300 flex items-center"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
        
        {/* Bottom section and actions */}
        <div className="mt-auto">
          <div className="px-5 py-4 bg-slate-950/80 border-t border-indigo-700/20">
            <div className="flex justify-between items-center mb-3">
              <Link 
                to={`/projects/${projectId}/market-research/${doc.id}`}
                className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 text-sm font-medium"
              >
                View Details
                <ExternalLink className="h-3 w-3" />
              </Link>
              
              {doc.fileUrl && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-indigo-400 hover:text-indigo-300 h-7 w-7">
                        <Download className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p className="text-xs">Download document</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <Badge 
                variant="outline" 
                className={`bg-indigo-900/60 text-xs border-0 text-indigo-300`}
              >
                {doc.category}
              </Badge>
              <div className="text-xs text-slate-500 flex items-center gap-1">
                <Calendar className="h-3 w-3" /> 
                {new Date(doc.updated_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
