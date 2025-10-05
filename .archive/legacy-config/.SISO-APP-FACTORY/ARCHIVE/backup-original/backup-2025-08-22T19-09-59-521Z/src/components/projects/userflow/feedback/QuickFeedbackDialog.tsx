import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { MessageSquarePlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QuickFeedbackDialogProps {
  nodeId?: string;
  screenName?: string;
  onSubmit?: (feedback: any) => void;
}

export function QuickFeedbackDialog({ 
  nodeId,
  screenName = 'Current Screen',
  onSubmit
}: QuickFeedbackDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [feedbackData, setFeedbackData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    screen: screenName,
    nodeId: nodeId
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFeedbackData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFeedbackData(prev => ({ ...prev, priority: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!feedbackData.title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a title for your feedback",
        variant: "destructive"
      });
      return;
    }

    if (!feedbackData.description.trim()) {
      toast({
        title: "Error",
        description: "Please enter a description for your feedback",
        variant: "destructive"
      });
      return;
    }

    // Create feedback entry
    const newFeedback = {
      ...feedbackData,
      id: `fb-${Date.now()}`,
      status: 'open',
      date: new Date().toISOString(),
      author: {
        name: 'You',
        avatar: '/avatars/default.jpg'
      }
    };

    // Call onSubmit with the new feedback data
    if (onSubmit) {
      onSubmit(newFeedback);
    }

    // Show success toast
    toast({
      title: "Feedback Submitted",
      description: "Your feedback has been recorded successfully."
    });

    // Reset form and close dialog
    setFeedbackData({
      title: '',
      description: '',
      priority: 'medium',
      screen: screenName,
      nodeId: nodeId
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <MessageSquarePlus className="h-4 w-4" />
          Add Feedback
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Quick Feedback</DialogTitle>
          <DialogDescription>
            Provide feedback for {screenName}. This will be added to the feedback log.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                name="title"
                value={feedbackData.title}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="Brief title for the feedback"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                value={feedbackData.description}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="Detailed description of the feedback"
                rows={4}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="priority" className="text-right">
                Priority
              </Label>
              <Select
                value={feedbackData.priority}
                onValueChange={handleSelectChange}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="screen" className="text-right">
                Screen
              </Label>
              <Input
                id="screen"
                name="screen"
                value={feedbackData.screen}
                onChange={handleInputChange}
                className="col-span-3"
                disabled
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Submit Feedback</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 