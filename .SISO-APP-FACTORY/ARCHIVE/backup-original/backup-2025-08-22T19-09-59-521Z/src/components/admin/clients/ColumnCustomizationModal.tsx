
import { useState } from 'react';
import { ClientColumnPreference } from '@/types/client.types';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Check, Trash2, GripVertical } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface ColumnCustomizationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  columns: ClientColumnPreference[];
  onColumnsChange: (columns: ClientColumnPreference[]) => void;
}

export function ColumnCustomizationModal({
  open,
  onOpenChange,
  columns,
  onColumnsChange
}: ColumnCustomizationModalProps) {
  const [newColumnName, setNewColumnName] = useState('');
  const [newColumnKey, setNewColumnKey] = useState('');
  const [newColumnType, setNewColumnType] = useState('text');
  const { toast } = useToast();

  const handleAddNewColumn = () => {
    if (!newColumnName.trim() || !newColumnKey.trim()) {
      toast({
        variant: "destructive",
        title: "Invalid column",
        description: "Please provide both a name and a key for the new column."
      });
      return;
    }

    // Check if the key already exists
    if (columns.some(col => col.key === newColumnKey.trim())) {
      toast({
        variant: "destructive",
        title: "Duplicate column key",
        description: `A column with the key "${newColumnKey}" already exists.`
      });
      return;
    }

    const newColumn: ClientColumnPreference = {
      key: newColumnKey.trim(),
      label: newColumnName.trim(),
      visible: true
    };

    onColumnsChange([...columns, newColumn]);
    
    toast({
      title: "Column added",
      description: `"${newColumnName}" column has been added to the table.`
    });
    
    // Reset form
    setNewColumnName('');
    setNewColumnKey('');
    setNewColumnType('text');
  };

  const handleDeleteColumn = (key: string) => {
    const updatedColumns = columns.filter(col => col.key !== key);
    onColumnsChange(updatedColumns);
    
    toast({
      title: "Column deleted",
      description: `The column has been removed from the table.`
    });
  };

  const handleToggleColumnVisibility = (key: string) => {
    const updatedColumns = columns.map(col => {
      if (col.key === key) {
        return { ...col, visible: !col.visible };
      }
      return col;
    });
    
    onColumnsChange(updatedColumns);
  };

  const handleRenameColumn = (key: string, newLabel: string) => {
    const updatedColumns = columns.map(col => {
      if (col.key === key) {
        return { ...col, label: newLabel };
      }
      return col;
    });
    
    onColumnsChange(updatedColumns);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Customize Columns</DialogTitle>
          <DialogDescription>
            Add, rename, or remove columns to customize your client table view.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          <div className="space-y-4">
            <h3 className="font-medium">Current Columns</h3>
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="w-[100px]">Visible</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {columns.map((column) => (
                    <TableRow key={column.key}>
                      <TableCell>
                        <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {column.label || column.key.replace(/_/g, ' ')}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {column.key}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant={column.visible ? "default" : "outline"}
                          size="sm"
                          className="h-7 w-16"
                          onClick={() => handleToggleColumnVisibility(column.key)}
                        >
                          {column.visible ? (
                            <Check className="h-4 w-4 mr-1" />
                          ) : null}
                          {column.visible ? "Yes" : "No"}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => handleDeleteColumn(column.key)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-medium">Add New Column</h3>
            <div className="space-y-3 border rounded-md p-4">
              <div className="grid gap-2">
                <Label htmlFor="column-name">Column Name (Display Label)</Label>
                <Input
                  id="column-name"
                  placeholder="e.g., Project Budget"
                  value={newColumnName}
                  onChange={(e) => setNewColumnName(e.target.value)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="column-key">Column Key (Database Field)</Label>
                <Input
                  id="column-key"
                  placeholder="e.g., project_budget"
                  value={newColumnKey}
                  onChange={(e) => setNewColumnKey(e.target.value.replace(/\s+/g, '_').toLowerCase())}
                />
                <p className="text-xs text-muted-foreground">
                  The key should be unique and use snake_case format (lowercase with underscores).
                </p>
              </div>
              
              <div className="grid gap-2">
                <Label>Column Type</Label>
                <RadioGroup
                  value={newColumnType}
                  onValueChange={setNewColumnType}
                  className="grid grid-cols-2 gap-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="text" id="type-text" />
                    <Label htmlFor="type-text">Text</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="number" id="type-number" />
                    <Label htmlFor="type-number">Number</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="date" id="type-date" />
                    <Label htmlFor="type-date">Date</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="checkbox" id="type-checkbox" />
                    <Label htmlFor="type-checkbox">Checkbox</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <Button className="mt-4 w-full" onClick={handleAddNewColumn}>
                Add Column
              </Button>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
