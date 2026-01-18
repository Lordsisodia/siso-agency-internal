
import { TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { CalendarIcon, CheckSquare } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface TaskDetailsTabProps {
  task: any;
  isEditing: boolean;
  onStatusChange: (value: string) => void;
  onPriorityChange: (value: 'low' | 'medium' | 'high') => void;
  onCategoryChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function TaskDetailsTab({
  task,
  isEditing,
  onStatusChange,
  onPriorityChange,
  onCategoryChange
}: TaskDetailsTabProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-400';
      case 'medium': return 'bg-amber-500/20 text-amber-400';
      case 'low': return 'bg-blue-500/20 text-blue-400';
      default: return 'bg-blue-500/20 text-blue-400';
    }
  };

  return (
    <TabsContent value="details" className="pb-6 focus-visible:outline-none focus-visible:ring-0">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Status</label>
            <div className="flex items-center gap-2">
              <Button 
                variant={task.status?.name === 'To Do' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onStatusChange('To Do')}
              >
                To Do
              </Button>
              <Button 
                variant={task.status?.name === 'In Progress' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onStatusChange('In Progress')}
              >
                In Progress
              </Button>
              <Button 
                variant={task.status?.name === 'Completed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onStatusChange('Completed')}
              >
                <CheckSquare className="h-4 w-4 mr-1" />
                Completed
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400">Priority</label>
            {isEditing ? (
              <RadioGroup 
                value={task.priority} 
                onValueChange={onPriorityChange}
                className="flex space-x-2"
              >
                <div className="flex items-center space-x-1">
                  <RadioGroupItem value="low" id="low" />
                  <Label htmlFor="low" className="text-blue-400">Low</Label>
                </div>
                <div className="flex items-center space-x-1">
                  <RadioGroupItem value="medium" id="medium" />
                  <Label htmlFor="medium" className="text-amber-400">Medium</Label>
                </div>
                <div className="flex items-center space-x-1">
                  <RadioGroupItem value="high" id="high" />
                  <Label htmlFor="high" className="text-red-400">High</Label>
                </div>
              </RadioGroup>
            ) : (
              <Badge 
                variant="outline" 
                className={getPriorityColor(task.priority)}
              >
                {task.priority}
              </Badge>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400">Category</label>
            {isEditing ? (
              <Input 
                name="category"
                value={task.category}
                onChange={onCategoryChange}
                className="bg-black/20"
              />
            ) : (
              <Badge variant="outline" className="bg-purple-500/20 text-purple-400">
                {task.category}
              </Badge>
            )}
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
            <label className="text-sm text-gray-400">Timeline</label>
            <div className="flex items-center">
              <CalendarIcon className="h-4 w-4 mr-2 text-gray-500" />
              <p className="text-gray-200">
                {format(task.startAt, "MMM d")} - {format(task.endAt, "MMM d, yyyy")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </TabsContent>
  );
}
