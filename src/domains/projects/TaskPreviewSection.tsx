
// NOTE: This component has been replaced by TaskDetailsDialog.tsx
// It's kept for reference but no longer used in the application.

import React from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';

interface TaskPreviewSectionProps {
  task: {
    name: string;
    startAt: Date;
    endAt: Date;
    category: string;
    owner: {
      name: string;
      image: string;
    };
    priority: 'low' | 'medium' | 'high';
  } | null;
  onClose: () => void;
}

export function TaskPreviewSection({ task, onClose }: TaskPreviewSectionProps) {
  if (!task) return null;

  return (
    <div className="mb-6 w-full">
      <Collapsible defaultOpen>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-100">Task Preview</h2>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="icon">
              <ChevronUp className="h-4 w-4" />
            </Button>
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent className="space-y-6 bg-[#1A1F2C] border border-[#403E43]/30 p-6 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400">Task Name</label>
                <Input 
                  value={task.name}
                  className="mt-1 bg-black/20"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400">Description</label>
                <Textarea 
                  placeholder="Add task description..."
                  className="mt-1 min-h-[100px] bg-black/20"
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={task.owner.image} />
                  <AvatarFallback>{task.owner.name.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm text-gray-400">Assigned to</p>
                  <p className="text-gray-200">{task.owner.name}</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-400">Priority</p>
                <Badge 
                  variant={task.priority === 'high' ? 'destructive' : 'outline'}
                  className={task.priority === 'high' ? 'bg-red-500/20 text-red-400' : 
                           task.priority === 'medium' ? 'bg-amber-500/20 text-amber-400' : 
                           'bg-blue-500/20 text-blue-400'}
                >
                  {task.priority}
                </Badge>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-400">Category</p>
                <Badge variant="outline" className="bg-purple-500/20 text-purple-400">
                  {task.category}
                </Badge>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-400">Timeline</p>
                <p className="text-gray-200">
                  {format(task.startAt, "MMM d")} - {format(task.endAt, "MMM d, yyyy")}
                </p>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
