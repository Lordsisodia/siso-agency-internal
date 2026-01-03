import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  Settings, 
  ArrowRight, 
  Plus, 
  Mic, 
  Timer, 
  Camera 
} from 'lucide-react';

interface TaskCard {
  id: string;
  date: Date;
  title: string;
  completed: boolean;
  tasks: {
    id: string;
    title: string;
    completed: boolean;
  }[];
}

interface QuickActionsProps {
  card: TaskCard;
  showFocusTimer: boolean;
  isMobile?: boolean;
  onViewDetails: (card: TaskCard) => void;
  onQuickAdd?: (sectionId: string) => void;
  onVoiceInput?: () => void;
  onToggleFocusTimer: () => void;
  onQuickPhoto?: () => void;
}

/**
 * QuickActions - Action buttons for InteractiveTodayCard
 * 
 * Extracted from InteractiveTodayCard.tsx (1,232 lines → focused component)
 * Handles all user action buttons with mobile-optimized layouts
 */
export const QuickActions: React.FC<QuickActionsProps> = ({
  card,
  showFocusTimer,
  isMobile = false,
  onViewDetails,
  onQuickAdd,
  onVoiceInput,
  onToggleFocusTimer,
  onQuickPhoto
}) => {
  return (
    <div className="space-y-3">
      {/* Primary Actions */}
      <div className={cn(
        'flex gap-2',
        isMobile && 'flex-col'
      )}>
        <Button 
          variant="outline" 
          onClick={() => onViewDetails(card)}
          className={cn(
            'flex-1 border-orange-500/30 text-orange-300 hover:bg-orange-500/20 hover:border-orange-500/50 hover:text-orange-200 transition-all duration-300',
            isMobile ? 'text-sm px-4 py-3 h-12' : 'text-sm px-4 py-2'
          )}
        >
          <Settings className="h-4 w-4 mr-2" />
          View Details
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
        <Button 
          onClick={() => onQuickAdd?.('quick')}
          className={cn(
            'flex-1 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white transition-all duration-300',
            isMobile ? 'text-sm px-4 py-3 h-12' : 'text-sm px-4 py-2'
          )}
        >
          <Plus className="h-4 w-4 mr-2" />
          Quick Add
        </Button>
      </div>

      {/* Secondary Actions */}
      <div className="grid grid-cols-3 gap-2">
        <Button 
          variant="ghost"
          size={isMobile ? "default" : "sm"}
          onClick={() => onVoiceInput?.()}
          className={cn(
            'text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-300',
            isMobile ? 'text-sm px-3 py-3 h-11' : 'text-xs px-2 py-2'
          )}
        >
          <Mic className={cn(isMobile ? 'h-4 w-4 mr-1' : 'h-3 w-3 mr-1')} />
          Voice
        </Button>
        <Button 
          variant="ghost"
          size={isMobile ? "default" : "sm"}
          onClick={onToggleFocusTimer}
          className={cn(
            "transition-all duration-300",
            isMobile ? 'text-sm px-3 py-3 h-11' : 'text-xs px-2 py-2',
            showFocusTimer 
              ? "text-orange-400 bg-orange-500/20 hover:bg-orange-500/30" 
              : "text-gray-300 hover:text-white hover:bg-white/10"
          )}
        >
          <Timer className={cn(isMobile ? 'h-4 w-4 mr-1' : 'h-3 w-3 mr-1')} />
          {isMobile ? (showFocusTimer ? 'Timer' : 'Timer') : (showFocusTimer ? 'Hide Timer' : 'Focus Timer')}
        </Button>
        <Button 
          variant="ghost"
          size={isMobile ? "default" : "sm"}
          onClick={() => onQuickPhoto?.()}
          className={cn(
            'text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-300',
            isMobile ? 'text-sm px-3 py-3 h-11' : 'text-xs px-2 py-2'
          )}
        >
          <Camera className={cn(isMobile ? 'h-4 w-4 mr-1' : 'h-3 w-3 mr-1')} />
          Photo
        </Button>
      </div>
    </div>
  );
};