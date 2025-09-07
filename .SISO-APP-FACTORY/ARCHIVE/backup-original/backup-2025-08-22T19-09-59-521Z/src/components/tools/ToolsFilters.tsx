import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ToolsFiltersProps {
  sortBy: string;
  onSortChange: (value: string) => void;
}

export function ToolsFilters({ sortBy, onSortChange }: ToolsFiltersProps) {
  return (
    <Select
      value={sortBy}
      onValueChange={onSortChange}
    >
      <SelectTrigger className="w-[180px] bg-siso-text/5 border-siso-text/10">
        <SelectValue placeholder="Sort by..." />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="rating">Highest Rated</SelectItem>
        <SelectItem value="name">Alphabetical</SelectItem>
        <SelectItem value="newest">Newest First</SelectItem>
        <SelectItem value="popular">Most Popular</SelectItem>
      </SelectContent>
    </Select>
  );
}