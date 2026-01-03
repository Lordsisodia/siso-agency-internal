
import { Check } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface ClientSelectFieldProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}

export function ClientSelectField({
  value,
  onChange,
  options,
  className
}: ClientSelectFieldProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger 
        className={cn(
          "h-8 min-w-[120px] border-border/50",
          "transition-colors duration-200",
          "data-[state=open]:border-primary/50",
          "hover:bg-muted/40",
          className
        )}
      >
        <SelectValue>{options.find(opt => opt.value === value)?.label || value}</SelectValue>
      </SelectTrigger>
      <SelectContent className="min-w-[160px]">
        {options.map((option) => (
          <SelectItem 
            key={option.value} 
            value={option.value}
            className="cursor-pointer"
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
