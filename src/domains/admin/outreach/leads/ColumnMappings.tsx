
import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ColumnMapping {
  sourceColumn: string;
  targetField: string;
}

interface ColumnMappingsProps {
  columnMappings: ColumnMapping[];
  onMappingChange: (newMappings: ColumnMapping[]) => void;
}

const AVAILABLE_FIELDS = [
  { value: 'username', label: 'Username' },
  { value: 'full_name', label: 'Full Name' },
  { value: 'followers_count', label: 'Followers Count' },
  { value: 'following_count', label: 'Following Count' },
  { value: 'posts_count', label: 'Posts Count' },
  { value: 'bio', label: 'Bio' },
  { value: 'profile_url', label: 'Profile URL' },
];

export const ColumnMappings = ({ columnMappings, onMappingChange }: ColumnMappingsProps) => {
  return (
    <div className="space-y-2">
      <h4 className="font-medium">Column Mappings</h4>
      <ScrollArea className="max-h-[300px] pr-4">
        <div className="grid gap-2">
          {columnMappings.map((mapping, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground w-1/3">
                {mapping.sourceColumn}
              </span>
              <Select
                value={mapping.targetField || "skip"}
                onValueChange={(value) => {
                  const newMappings = [...columnMappings];
                  newMappings[index].targetField = value === "skip" ? "" : value;
                  onMappingChange(newMappings);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Map to field..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="skip">Skip this column</SelectItem>
                  {AVAILABLE_FIELDS.map(field => (
                    <SelectItem key={field.value} value={field.value}>
                      {field.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
