import { DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Edit2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface TaskDetailsHeaderProps {
  name: string;
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function TaskDetailsHeader({ 
  name, 
  isEditing, 
  onEdit, 
  onSave, 
  onNameChange 
}: TaskDetailsHeaderProps) {
  return (
    <DialogHeader className="px-6 pt-6 pb-2">
      <div className="flex items-center justify-between">
        <DialogTitle className="text-xl text-white">
          {isEditing ? (
            <Input 
              name="name"
              value={name}
              onChange={onNameChange}
              className="text-xl font-semibold bg-black/20"
            />
          ) : name}
        </DialogTitle>
        <div className="flex items-center gap-2">
          {!isEditing ? (
            <Button size="sm" variant="ghost" onClick={onEdit}>
              <Edit2 className="h-4 w-4 mr-1" /> Edit
            </Button>
          ) : (
            <Button size="sm" variant="ghost" onClick={onSave}>
              <Save className="h-4 w-4 mr-1" /> Save
            </Button>
          )}
          <DialogClose asChild>
            <Button size="icon" variant="ghost">
              <X className="h-4 w-4" />
            </Button>
          </DialogClose>
        </div>
      </div>
    </DialogHeader>
  );
}
