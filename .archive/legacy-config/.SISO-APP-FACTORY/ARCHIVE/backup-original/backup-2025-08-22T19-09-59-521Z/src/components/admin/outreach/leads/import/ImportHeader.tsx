
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { downloadTemplate } from '@/utils/downloadUtils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ImportHeaderProps {
  delimiter: string;
  onDelimiterChange: (value: string) => void;
}

export const ImportHeader = ({ delimiter, onDelimiterChange }: ImportHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold">Bulk Import Leads</h3>
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={downloadTemplate}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Download Template
        </Button>
        <Select
          value={delimiter}
          onValueChange={onDelimiterChange}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Select delimiter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="\t">Tab</SelectItem>
            <SelectItem value=",">Comma</SelectItem>
            <SelectItem value=";">Semicolon</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
