import React from 'react';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Filter, X } from 'lucide-react';
import type { CategoryFilterProps } from '../types';

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategories,
  onCategoryToggle
}) => {
  const allCategories: Array<'admin' | 'communication' | 'learning' | 'planning' | 'quick-wins'> = [
    'admin', 'communication', 'learning', 'planning', 'quick-wins'
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'admin': return 'bg-purple-100 text-purple-700 hover:bg-purple-200';
      case 'communication': return 'bg-blue-100 text-blue-700 hover:bg-blue-200';
      case 'learning': return 'bg-orange-100 text-orange-700 hover:bg-orange-200';
      case 'planning': return 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200';
      case 'quick-wins': return 'bg-green-100 text-green-700 hover:bg-green-200';
      default: return 'bg-gray-100 text-gray-700 hover:bg-gray-200';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'admin': return 'Admin';
      case 'communication': return 'Communication';
      case 'learning': return 'Learning';
      case 'planning': return 'Planning';
      case 'quick-wins': return 'Quick Wins';
      default: return category;
    }
  };

  const hasActiveFilters = selectedCategories.length > 0 && selectedCategories.length < allCategories.length;

  return (
    <div className="flex flex-wrap items-center gap-2 p-3 bg-green-900/10 border border-green-700/30 rounded-lg">
      <div className="flex items-center gap-2 text-green-300 text-sm font-medium">
        <Filter className="h-4 w-4" />
        Categories:
      </div>
      
      <div className="flex flex-wrap gap-2">
        {allCategories.map((category) => {
          const isSelected = selectedCategories.includes(category);
          const isAvailable = categories.includes(category);
          
          if (!isAvailable) return null;
          
          return (
            <Badge
              key={category}
              variant="outline"
              className={`cursor-pointer transition-all duration-200 ${
                isSelected 
                  ? getCategoryColor(category)
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border-gray-600'
              }`}
              onClick={() => onCategoryToggle(category)}
            >
              {getCategoryLabel(category)}
              {isSelected && <X className="h-3 w-3 ml-1" />}
            </Badge>
          );
        })}
      </div>

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            // Clear all filters by selecting all categories
            allCategories.forEach(cat => {
              if (categories.includes(cat) && !selectedCategories.includes(cat)) {
                onCategoryToggle(cat);
              }
            });
          }}
          className="text-green-400 hover:text-green-300 hover:bg-green-900/20 h-6 px-2 text-xs"
        >
          Clear Filters
        </Button>
      )}
    </div>
  );
};