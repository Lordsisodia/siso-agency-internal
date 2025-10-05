
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFileSelect: (content: string) => void;
}

export const FileUpload = ({ onFileSelect }: FileUploadProps) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        onFileSelect(content);
      };
      reader.readAsText(file);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'text/plain': ['.txt'],
    },
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
        isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/20",
        "hover:border-primary hover:bg-primary/5"
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-2">
        <div className="p-3 rounded-full bg-primary/10">
          {isDragActive ? (
            <FileText className="h-6 w-6 text-primary" />
          ) : (
            <Upload className="h-6 w-6 text-primary" />
          )}
        </div>
        <div>
          {isDragActive ? (
            <p className="text-sm text-primary">Drop the file here</p>
          ) : (
            <div className="space-y-1">
              <p className="text-sm font-medium">Drop a CSV file or click to browse</p>
              <p className="text-xs text-muted-foreground">Supports CSV and TXT files</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
