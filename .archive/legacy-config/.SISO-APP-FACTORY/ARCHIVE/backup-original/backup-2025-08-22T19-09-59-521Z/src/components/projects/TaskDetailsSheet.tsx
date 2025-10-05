
import React from 'react';
import { Sheet, SheetContent, SheetHeader } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Share2, Expand, Clock, Star, FileText, 
  Paperclip, MessageSquare, MessageSquarePlus, 
  Square, Check, X, Calendar, DollarSign
} from "lucide-react";
import { format } from 'date-fns';
import { UiTask } from './ActiveTasksView';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface TaskDetailsSheetProps {
  task: UiTask | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateTask?: (task: UiTask) => void;
}

export function TaskDetailsSheet({ task, isOpen, onClose, onUpdateTask }: TaskDetailsSheetProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  if (!task) return null;

  // Get progress percentage from category
  const getProgress = () => {
    if (task.category.includes('%')) {
      const match = task.category.match(/(\d+)%/);
      return match ? parseInt(match[1], 10) : 0;
    }
    
    if (task.status.name === "Done") {
      return 100;
    }
    
    return 0;
  };

  const getTimePeriod = (start: Date, end: Date) => {
    return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
  };
  
  const handleAction = () => {
    if (task.actionLink) {
      navigate(task.actionLink);
      onClose();
    }
  };
  
  const handleApprove = () => {
    if (onUpdateTask && task) {
      onUpdateTask({
        ...task,
        status: { name: "Done", color: "#10B981" }
      });
      
      toast({
        title: "Task Approved",
        description: "You've successfully approved this task!",
      });
    }
  };
  
  const handleFeedback = () => {
    toast({
      title: "Feedback Submitted",
      description: "Thank you for your feedback. Our team will review it shortly.",
    });
    onClose();
  };

  const progress = getProgress();
  const isPaymentTask = task.category.includes('Payment') || task.category.includes('Deposit') || task.category.includes('Instalment');

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[95vw] sm:w-[900px] p-0 bg-[#222]/95 backdrop-blur-xl border-[#333] shadow-xl">
        <ScrollArea className="h-[calc(100vh-2rem)]">
          <div className="p-6 space-y-6">
            {/* Category & Actions Header */}
            <div className="flex justify-between items-center">
              <Badge 
                variant="outline" 
                className="bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500/20"
              >
                {task.category}
              </Badge>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="hover:bg-purple-500/10">
                  <Share2 className="h-4 w-4 text-muted-foreground" />
                </Button>
                <Button variant="ghost" size="icon" className="hover:bg-purple-500/10">
                  <Expand className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            </div>
            
            {/* Title & Priority Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">{task.name}</h2>
              <div className="flex flex-wrap gap-2">
                <Badge 
                  variant="outline" 
                  className={task.priority === 'high' 
                    ? "bg-red-500/10 text-red-400 border-red-500/20" 
                    : task.priority === 'medium'
                    ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    : "bg-green-500/10 text-green-400 border-green-500/20"
                  }
                >
                  <Star className="h-3 w-3 mr-1" />
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                </Badge>
                
                <Badge 
                  variant="outline"
                  style={{ 
                    backgroundColor: `${task.status.color}20`, 
                    color: task.status.color,
                    borderColor: `${task.status.color}30`
                  }}
                >
                  {task.status.name}
                </Badge>
              </div>
            </div>

            {/* Time Period Panel */}
            <div className="bg-purple-950/30 rounded-lg p-4 border border-purple-500/20">
              <div className="flex items-center gap-2 text-sm text-purple-300">
                <Calendar className="h-4 w-4" />
                <span>{getTimePeriod(task.startAt, task.endAt)}</span>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium text-white">
                  <h3>Progress</h3>
                </div>
                <span className="text-sm text-muted-foreground">{progress}%</span>
              </div>
              
              <Progress 
                value={progress} 
                className="h-2.5" 
                indicatorClassName={cn(
                  progress === 100 ? "bg-green-500" : "bg-gradient-to-r from-[#0078D4] to-[#1A91FF]"
                )}
              />
            </div>

            {/* Description Section */}
            <div className="space-y-3 border-t border-[#333] pt-5">
              <div className="flex items-center gap-2 text-sm font-medium text-white">
                <FileText className="h-4 w-4" />
                <h3>Description</h3>
              </div>
              <p className="text-sm text-muted-foreground pl-6 leading-relaxed">
                {task.description || "No description provided."}
              </p>
            </div>

            {/* Action Buttons Section */}
            <div className="space-y-3 border-t border-[#333] pt-5">
              <h3 className="text-sm font-medium text-white">Actions</h3>
              
              <div className="flex flex-wrap gap-3">
                {task.actionButton && (
                  <Button 
                    onClick={handleAction} 
                    className="bg-[#0078D4] hover:bg-[#1A91FF] hover:scale-[1.02] transition-all"
                    size="lg"
                  >
                    {isPaymentTask && <DollarSign className="mr-1 h-4 w-4" />}
                    {task.actionButton}
                  </Button>
                )}
                
                {task.status.name === "Awaiting Your Action" && (
                  <>
                    <Button 
                      variant="outline" 
                      onClick={handleApprove}
                      className="border-green-500/30 text-green-500 hover:bg-green-500/10 hover:scale-[1.02] transition-all"
                      size="lg"
                    >
                      <Check className="mr-1 h-4 w-4" />
                      Approve
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      onClick={handleFeedback}
                      className="border-blue-500/30 text-blue-500 hover:bg-blue-500/10 hover:scale-[1.02] transition-all"
                      size="lg"
                    >
                      <MessageSquare className="mr-1 h-4 w-4" />
                      Submit Feedback
                    </Button>
                  </>
                )}
                
                {task.status.name === "Done" && (
                  <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20 py-1.5 px-3">
                    <Check className="mr-1 h-4 w-4" />
                    Completed
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Related Links Section */}
            {task.actionLink && (
              <div className="space-y-3 border-t border-[#333] pt-5">
                <h3 className="text-sm font-medium text-white">Related Links</h3>
                
                <div className="pl-6 space-y-2">
                  <Button 
                    variant="link" 
                    className="text-[#0078D4] hover:text-[#1A91FF] p-0 h-auto transition-colors"
                    onClick={() => navigate('/projects/ubahcrypt')}
                  >
                    View Project Details
                  </Button>
                  
                  {isPaymentTask && (
                    <Button 
                      variant="link" 
                      className="text-[#0078D4] hover:text-[#1A91FF] p-0 h-auto ml-4 transition-colors"
                      onClick={() => navigate('/financial')}
                    >
                      View Billing History
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Notes or Comments Section */}
            <div className="space-y-4 mt-6 border-t border-[#333] pt-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium text-white">
                  <MessageSquare className="h-4 w-4" />
                  <h3>Comments & Updates</h3>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs hover:bg-purple-500/10 text-muted-foreground hover:text-white transition-colors"
                >
                  <MessageSquarePlus className="h-3 w-3 mr-1" />
                  Add Comment
                </Button>
              </div>
              
              <div className="rounded-lg bg-[#1A1A1A] border border-[#333] p-4">
                <p className="text-sm text-muted-foreground">No comments or updates yet.</p>
              </div>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
