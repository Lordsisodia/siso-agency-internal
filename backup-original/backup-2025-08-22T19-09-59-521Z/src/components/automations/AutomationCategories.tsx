import { memo } from 'react';
import { AutomationCategory } from './types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AutomationCategoriesProps {
  selectedCategory: AutomationCategory;
  onCategoryChange: (category: AutomationCategory) => void;
  getCategoryCount: (category: AutomationCategory) => number;
}

const categories: { id: AutomationCategory; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'featured', label: 'Featured' },
  { id: 'zapier', label: 'Zapier' },
  { id: 'make', label: 'Make' },
  { id: 'n8n', label: 'n8n' },
];

export const AutomationCategories = memo(({ 
  selectedCategory, 
  onCategoryChange,
  getCategoryCount 
}: AutomationCategoriesProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map(({ id, label }) => (
        <Button
          key={id}
          variant="ghost"
          onClick={() => onCategoryChange(id)}
          className={cn(
            "rounded-full px-4 py-2 text-sm transition-all duration-300",
            selectedCategory === id 
              ? "bg-gradient-to-r from-siso-red to-siso-orange text-white"
              : "hover:bg-siso-bg-alt"
          )}
        >
          {label} ({getCategoryCount(id)})
        </Button>
      ))}
    </div>
  );
});

AutomationCategories.displayName = 'AutomationCategories';