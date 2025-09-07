import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, Download, Tag, ChevronUp, ChevronDown, 
  ExternalLink, FileText, Zap, Shield, Users, Lightbulb,
  BookOpen, BarChart, Info, Clock
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Link, useParams } from 'react-router-dom';
import { ResearchDocument } from '../types';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ResearchDocumentProps {
  doc: ResearchDocument;
  isExpanded: boolean;
  onToggleExpand: () => void;
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

export function ResearchDocumentCard({ 
  doc, 
  isExpanded, 
  onToggleExpand,
  categoryColors 
}: ResearchDocumentProps) {
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
          "bg-slate-900 border border-slate-800 h-full flex flex-col",
          "relative overflow-hidden shadow-lg",
          "hover:shadow-indigo-900/10 hover:border-slate-700 transition-all duration-300"
        )}
      >
        {/* Category indicator band */}
        <div className={`h-1.5 w-full ${categoryStyle.badgeColor}`} />
        
        <Collapsible open={isExpanded} onOpenChange={onToggleExpand} className="flex flex-col h-full">
          {/* Main content area */}
          <div className="p-5 pb-3 flex-1">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-md ${categoryStyle.bgColor} ${categoryStyle.borderColor}`}>
                  <div className={categoryStyle.color}>
                    {categoryStyle.icon}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-white line-clamp-1">{doc.title}</h3>
              </div>
              
              {doc.fileUrl && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white h-7 w-7">
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
            
            <p className="text-sm text-slate-300 line-clamp-2 mb-3">{doc.description}</p>
            
            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {doc.tags.map((tag) => (
                <Badge 
                  key={tag} 
                  variant="outline" 
                  className="text-xs bg-slate-800/60 border-slate-700 text-slate-300 flex items-center"
                >
                  <Tag className="h-3 w-3 mr-1 text-slate-400" />{tag}
                </Badge>
              ))}
            </div>
            
            {/* Collapsible content - insights, nextSteps, code */}
            <CollapsibleContent className="space-y-3 mt-3">
              {doc.insights && doc.insights.length > 0 && (
                <div className="bg-slate-800/50 rounded-md p-3 border border-slate-700/50">
                  <h4 className="text-sm font-semibold text-indigo-300 mb-2 flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5" />
                    Key Insights
                  </h4>
                  <ul className="list-disc list-inside text-xs text-slate-300 space-y-1.5">
                    {doc.insights.map((insight, idx) => (
                      <li key={idx}>{insight}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {doc.nextSteps && doc.nextSteps.length > 0 && (
                <div className="bg-slate-800/50 rounded-md p-3 border border-slate-700/50">
                  <h4 className="text-sm font-semibold text-emerald-300 mb-2 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5" />
                    Recommended Actions
                  </h4>
                  <ul className="list-disc list-inside text-xs text-slate-300 space-y-1.5">
                    {doc.nextSteps.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {doc.code_snippet && (
                <div className="bg-slate-800/80 rounded-md p-3 font-mono border border-slate-700/50">
                  <h4 className="text-sm font-semibold text-blue-300 mb-2 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    Code Example
                  </h4>
                  <pre className="text-xs overflow-x-auto whitespace-pre-wrap text-slate-300 p-2 bg-black/30 rounded border border-slate-700/30">
                    {doc.code_snippet}
                  </pre>
                </div>
              )}
            </CollapsibleContent>
          </div>
          
          {/* Bottom section and actions */}
          <div className="mt-auto">
            <div className="px-5 py-4 bg-slate-950 border-t border-slate-800/50">
              <div className="flex justify-between items-center mb-3">
                <Link 
                  to={`/projects/${projectId}/market-research/${doc.id}`}
                  className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 text-sm font-medium"
                >
                  View Details
                  <ExternalLink className="h-3 w-3" />
                </Link>
                
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 p-0 text-xs text-slate-400 hover:text-white hover:bg-slate-800">
                    {isExpanded ? (
                      <div className="flex items-center">
                        <ChevronUp className="h-3 w-3 mr-1" /> Less
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <ChevronDown className="h-3 w-3 mr-1" /> More
                      </div>
                    )}
                  </Button>
                </CollapsibleTrigger>
              </div>
              
              <div className="flex items-center justify-between">
                <Badge 
                  variant="outline" 
                  className={`bg-slate-800/60 text-xs border-0 ${categoryStyle.color}`}
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
        </Collapsible>
      </Card>
    </motion.div>
  );
}
