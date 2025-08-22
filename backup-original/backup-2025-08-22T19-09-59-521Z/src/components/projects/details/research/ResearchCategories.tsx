
import { Badge } from '@/components/ui/badge';

interface ResearchCategoriesProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  categoryColors: Record<string, string>;
  getCategoryCount: (category: string) => number;
}

export function ResearchCategories({
  categories,
  activeCategory,
  onCategoryChange,
  categoryColors,
  getCategoryCount
}: ResearchCategoriesProps) {
  return (
    <div className="flex flex-nowrap overflow-x-auto pb-2 gap-2 scrollbar-hide">
      {categories.map((category) => {
        const count = getCategoryCount(category);
        
        return (
          <Badge 
            key={category} 
            variant={category === activeCategory ? 'purple' : 'secondary'} 
            className={`cursor-pointer px-4 py-2 whitespace-nowrap ${
              category !== 'All' && categoryColors[category]
            }`}
            onClick={() => onCategoryChange(category)}
          >
            {category} {count > 0 && <span className="ml-1 opacity-70">({count})</span>}
          </Badge>
        );
      })}
    </div>
  );
}
