
import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FileText } from 'lucide-react';
import { FileUpload } from '../FileUpload';
import { DataPreview } from '../DataPreview';

interface FileInputSectionProps {
  rawData: string;
  previewData: string[][];
  columnMappings: { sourceColumn: string; targetField: string; }[];
  onDataInput: (content: string) => void;
}

export const FileInputSection = ({ 
  rawData, 
  previewData, 
  columnMappings,
  onDataInput 
}: FileInputSectionProps) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileText className="h-4 w-4" />
          <span>Upload a file or paste your data below</span>
        </div>
        <FileUpload onFileSelect={onDataInput} />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileText className="h-4 w-4" />
          <span>Or paste your data here</span>
        </div>
        <Textarea
          placeholder="Paste your data here (tab or comma separated)..."
          className="min-h-[200px] font-mono"
          value={rawData}
          onChange={(e) => onDataInput(e.target.value)}
        />
      </div>

      {previewData.length > 0 && (
        <DataPreview 
          data={previewData} 
          columnMappings={columnMappings}
        />
      )}
    </div>
  );
};
