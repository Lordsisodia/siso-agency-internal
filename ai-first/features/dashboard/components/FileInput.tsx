
import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileText, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileInputProps {
  onDataReady: (data: any[]) => void;
  isImporting: boolean;
}

export function FileInput({ onDataReady, isImporting }: FileInputProps) {
  const processCSV = (text: string) => {
    const lines = text.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    const expenses = lines.slice(1)
      .filter(line => line.trim())
      .map(line => {
        const values = line.split(',').map(v => v.trim());
        const expense: any = {};
        
        headers.forEach((header, index) => {
          expense[header.toLowerCase()] = values[index];
        });

        // Add required fields
        expense.type = 'expense';
        
        return expense;
      });

    onDataReady(expenses);
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        processCSV(text);
      };
      reader.readAsText(file);
    }
  }, [onDataReady]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'text/plain': ['.txt'],
    },
    multiple: false,
    disabled: isImporting,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
        isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/20",
        "hover:border-primary hover:bg-primary/5",
        isImporting && "opacity-50 cursor-not-allowed"
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
              <p className="text-xs text-muted-foreground">
                Supports CSV and TXT files with headers
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
