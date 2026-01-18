
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface IndustryFilterProps {
  selectedIndustry?: string;
  onIndustryChange: (value: string) => void;
}

export const IndustryFilter = ({ selectedIndustry, onIndustryChange }: IndustryFilterProps) => {
  return (
    <Select 
      value={selectedIndustry} 
      onValueChange={onIndustryChange}
    >
      <SelectTrigger className="w-[200px] mt-4">
        <SelectValue placeholder="Filter by industry" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Industries</SelectItem>
        <SelectItem value="onlyfans">OnlyFans Management</SelectItem>
        <SelectItem value="ecommerce">E-commerce</SelectItem>
        <SelectItem value="saas">SaaS</SelectItem>
        <SelectItem value="agency">Agency</SelectItem>
      </SelectContent>
    </Select>
  );
};
