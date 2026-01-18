
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Save, FileDown } from "lucide-react";

interface SavedView {
  id: string;
  name: string;
  filters: any;
  columns: any[];
}

interface SavedViewsManagerProps {
  views: SavedView[];
  onViewSelect: (view: SavedView) => void;
  onViewSave: (name: string, currentState: any) => void;
}

export function SavedViewsManager({ views, onViewSelect, onViewSave }: SavedViewsManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newViewName, setNewViewName] = useState('');

  const handleSaveView = () => {
    if (newViewName.trim()) {
      onViewSave(newViewName, {
        // Current state would be passed from parent
        filters: {},
        columns: []
      });
      setNewViewName('');
      setIsDialogOpen(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <FileDown className="h-4 w-4 mr-2" />
            Views
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px]">
          {views.map((view) => (
            <DropdownMenuItem
              key={view.id}
              onClick={() => onViewSelect(view)}
            >
              {view.name}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Save className="h-4 w-4 mr-2" />
                Save Current View
              </DropdownMenuItem>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Save Current View</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Input
                  placeholder="View name"
                  value={newViewName}
                  onChange={(e) => setNewViewName(e.target.value)}
                />
                <Button onClick={handleSaveView} disabled={!newViewName.trim()}>
                  Save View
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
