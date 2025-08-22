
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CategoryBadgeCellProps {
  value: string;
}

export function CategoryBadgeCell({ value }: CategoryBadgeCellProps) {
  const getCategoryBadgeColor = (category: string) => {
    if (!category || category === "Uncategorized") return "bg-gray-900/20 text-gray-400 border-gray-700";
    if (category.toLowerCase().includes("software")) return "bg-blue-900/30 text-blue-300 border-blue-800/60";
    if (category.toLowerCase().includes("marketing")) return "bg-pink-900/25 text-pink-300 border-pink-900/40";
    if (category.toLowerCase().includes("office")) return "bg-yellow-900/30 text-yellow-300 border-yellow-700/50";
    if (category.toLowerCase().includes("utilities")) return "bg-green-700/20 text-green-400 border-green-900/30";
    if (category.toLowerCase().includes("travel")) return "bg-cyan-900/10 text-cyan-300 border-cyan-900/40";
    return "bg-purple-900/20 text-purple-200 border-purple-800/40";
  };

  return (
    <Badge variant="outline" className={cn(
      "ml-1 mr-1 px-2", getCategoryBadgeColor(value)
    )}>
      {value || "Uncategorized"}
    </Badge>
  );
}
