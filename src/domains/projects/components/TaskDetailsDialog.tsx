
import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TaskDetailsHeader } from './task-details/TaskDetailsHeader';
import { TaskDetailsTab } from './task-details/TaskDetailsTab';
import { TaskDescriptionTab } from './task-details/TaskDescriptionTab';
import { TaskActivityTab } from './task-details/TaskActivityTab';

interface TaskDetailsDialogProps {
  task: {
    id: string;
    name: string;
    startAt: Date;
    endAt: Date;
    category: string;
    owner: {
      name: string;
      image: string;
    };
    priority: 'low' | 'medium' | 'high';
    status?: {
      name: string;
      color: string;
    };
    description?: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (updatedTask: any) => void;
}

export function TaskDetailsDialog({ task, isOpen, onClose, onSave }: TaskDetailsDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState(task);
  const [activeTab, setActiveTab] = useState('details');

  React.useEffect(() => {
    setEditedTask(task);
    setIsEditing(false);
  }, [task]);

  if (!task) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedTask(prev => {
      if (!prev) return prev;
      return { ...prev, [name]: value };
    });
  };

  const handleStatusChange = (status: string) => {
    setEditedTask(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        status: {
          name: status,
          color: status === 'Completed' ? '#10B981' : 
                 status === 'In Progress' ? '#F59E0B' : '#6B7280'
        }
      };
    });
  };

  const handlePriorityChange = (value: 'low' | 'medium' | 'high') => {
    setEditedTask(prev => {
      if (!prev) return prev;
      return { ...prev, priority: value };
    });
  };

  const handleSave = () => {
    if (onSave && editedTask) {
      onSave(editedTask);
    }
    setIsEditing(false);
  };

  const handleClose = () => {
    setIsEditing(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[650px] bg-[#1A1F2C] border border-[#403E43]/30 p-0 max-h-[85vh] overflow-y-auto">
        <TaskDetailsHeader
          name={editedTask?.name || ''}
          isEditing={isEditing}
          onEdit={() => setIsEditing(true)}
          onSave={handleSave}
          onNameChange={handleInputChange}
        />

        <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab} className="px-6">
          <TabsList className="bg-black/20 mb-6">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          {editedTask && (
            <>
              <TaskDetailsTab
                task={editedTask}
                isEditing={isEditing}
                onStatusChange={handleStatusChange}
                onPriorityChange={handlePriorityChange}
                onCategoryChange={handleInputChange}
              />
              <TaskDescriptionTab
                description={editedTask.description || ''}
                isEditing={isEditing}
                onDescriptionChange={handleInputChange}
              />
              <TaskActivityTab />
            </>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
