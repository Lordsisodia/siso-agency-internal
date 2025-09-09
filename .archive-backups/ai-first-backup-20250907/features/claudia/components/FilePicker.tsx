import React from 'react';
import { Button } from '@/shared/ui/button';
import { FileText, Folder } from 'lucide-react';

interface FilePickerProps {
  onSelect: (files: string[]) => void;
  multiple?: boolean;
  accept?: string;
}

export const FilePicker: React.FC<FilePickerProps> = ({ 
  onSelect, 
  multiple = false,
  accept 
}) => {
  const handleClick = async () => {
    try {
      // In a real Tauri app, this would use the file dialog API
      // For now, we'll just mock it
      onSelect(['example-file.txt']);
    } catch (error) {
      console.error('Error selecting files:', error);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      className="flex items-center gap-2"
    >
      <Folder className="w-4 h-4" />
      Browse Files
    </Button>
  );
};