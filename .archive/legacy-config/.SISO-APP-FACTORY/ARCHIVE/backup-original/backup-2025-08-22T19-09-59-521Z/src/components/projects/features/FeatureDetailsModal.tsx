import React, { useEffect } from 'react';
import { 
  AlertCircle, Clock, PieChart, Tag, CheckCircle, X, 
  TrendingUp, ScrollText, Calendar, BarChart4 
} from 'lucide-react';
import { Feature } from '@/types/feature.types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface FeatureDetailsModalProps {
  feature: Feature | null;
  onClose: () => void;
}

export function FeatureDetailsModal({ feature, onClose }: FeatureDetailsModalProps) {
  if (!feature) return null;

  // Function to ensure scrolling is restored
  const enableScrolling = () => {
    document.body.classList.remove('overflow-hidden');
  };

  // Enhanced close handler to ensure scrolling is restored
  const handleClose = () => {
    enableScrolling();
    onClose();
  };

  // Prevent background scrolling when modal is open
  useEffect(() => {
    // Add class to body to prevent scrolling
    document.body.classList.add('overflow-hidden');
    
    // Cleanup function to remove class when component unmounts
    return () => {
      enableScrolling();
    };
  }, []);

  // Handle backdrop click to close the modal
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // Calculate progress based on status
  const getProgress = () => {
    switch (feature.status) {
      case 'pending': return 0;
      case 'in_progress': return 50;
      case 'completed': return 100;
    }
  };

  // Get difficulty and priority colors
  const getDifficultyColor = () => {
    switch (feature.difficulty) {
      case 'low': return 'bg-green-500/20 text-green-400';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400';
      case 'high': return 'bg-red-500/20 text-red-400';
    }
  };

  const getPriorityColor = () => {
    switch (feature.priority) {
      case 'low': return 'bg-green-500/20 text-green-400';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400';
      case 'high': return 'bg-red-500/20 text-red-400';
    }
  };

  // Format cost breakdown for display
  const renderCostBreakdown = () => {
    if (!feature.cost_breakdown || Object.keys(feature.cost_breakdown).length === 0) {
      return <p className="text-gray-400">No detailed cost breakdown available.</p>;
    }

    return (
      <div className="space-y-3">
        {Object.entries(feature.cost_breakdown).map(([category, amount]) => (
          <div key={category} className="flex justify-between">
            <span className="text-gray-400">{category}</span>
            <span className="text-white font-medium">£{amount.toLocaleString()}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" 
      onClick={handleBackdropClick}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-black/80 border border-siso-text/20 rounded-lg w-full max-w-2xl my-4 flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header - Fixed at top */}
        <div className="p-6 border-b border-siso-text/20 flex justify-between items-center sticky top-0 bg-black/95 backdrop-blur-sm z-10">
          <h2 className="text-xl font-bold text-white">{feature.title}</h2>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleClose} 
            className="h-8 w-8 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Content - Scrollable */}
        <div className="p-6 space-y-6 overflow-y-auto flex-grow">
          {/* Status and Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Status</span>
              <span className="flex items-center gap-1 font-medium">
                {feature.status === 'completed' && <CheckCircle className="h-4 w-4 text-green-400" />}
                {feature.status === 'in_progress' && <TrendingUp className="h-4 w-4 text-yellow-400" />}
                {feature.status === 'pending' && <AlertCircle className="h-4 w-4 text-gray-400" />}
                <span className={cn(
                  feature.status === 'completed' && 'text-green-400',
                  feature.status === 'in_progress' && 'text-yellow-400',
                  feature.status === 'pending' && 'text-gray-400'
                )}>
                  {feature.status === 'in_progress' ? 'In Progress' : 
                    feature.status.charAt(0).toUpperCase() + feature.status.slice(1)}
                </span>
              </span>
            </div>
            <Progress value={getProgress()} className="h-1.5" />
          </div>

          {/* Metadata badges */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className={getDifficultyColor()}>
              <PieChart className="w-3.5 h-3.5 mr-1" />
              {feature.difficulty.charAt(0).toUpperCase() + feature.difficulty.slice(1)} Difficulty
            </Badge>
            <Badge variant="outline" className={getPriorityColor()}>
              <Tag className="w-3.5 h-3.5 mr-1" />
              {feature.priority.charAt(0).toUpperCase() + feature.priority.slice(1)} Priority
            </Badge>
            {feature.timeline_week && (
              <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-0">
                <Calendar className="w-3.5 h-3.5 mr-1" />
                Week {feature.timeline_week}
              </Badge>
            )}
            <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-0">
              <BarChart4 className="w-3.5 h-3.5 mr-1" />
              £{feature.estimated_cost.toLocaleString()}
            </Badge>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
            <p className="text-gray-300">
              {feature.description || 'No description provided.'}
            </p>
          </div>

          {/* Implementation Plan */}
          {feature.implementation_plan && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Implementation Plan</h3>
              <div className="bg-black/30 border border-siso-text/10 rounded-md p-4">
                <p className="text-gray-300 whitespace-pre-wrap">{feature.implementation_plan}</p>
              </div>
            </div>
          )}

          {/* Cost Breakdown */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Cost Breakdown</h3>
            <div className="bg-black/30 border border-siso-text/10 rounded-md p-4">
              {renderCostBreakdown()}
            </div>
          </div>

          {/* Timeline */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Timeline</h3>
            <div className="bg-black/30 border border-siso-text/10 rounded-md p-4 flex items-center gap-3">
              <Clock className="h-5 w-5 text-blue-400" />
              {feature.timeline_week ? (
                <span className="text-gray-300">Scheduled for Week {feature.timeline_week}</span>
              ) : (
                <span className="text-gray-400">No timeline specified yet</span>
              )}
            </div>
          </div>

          {/* Dates */}
          <div className="flex justify-between text-xs text-gray-400">
            <div>Created: {new Date(feature.created_at).toLocaleDateString()}</div>
            <div>Last Updated: {new Date(feature.updated_at).toLocaleDateString()}</div>
          </div>
        </div>
        
        {/* Footer - Fixed at bottom */}
        <div className="p-6 border-t border-siso-text/20 flex justify-end sticky bottom-0 bg-black/95 backdrop-blur-sm">
          <Button 
            variant="default"
            onClick={handleClose}
            className="bg-[#9b87f5] hover:bg-[#9b87f5]/90"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
