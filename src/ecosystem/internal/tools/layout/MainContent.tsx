
import { Tool } from '../core/types';
import { ToolsCategories } from '../ui/ToolsCategories';
import { ToolsFilters } from '../ui/ToolsFilters';
import { ToolsGrid } from '../views/ToolsGrid';
import { motion } from 'framer-motion';

interface MainContentProps {
  categories: Array<{ id: string; label: string; count?: number }>;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  filteredTools: Tool[];
  isLoading: boolean;
  categoryStats: { [key: string]: number };
}

export function MainContent({
  categories,
  selectedCategory,
  onCategoryChange,
  sortBy,
  onSortChange,
  filteredTools,
  isLoading,
  categoryStats
}: MainContentProps) {
  return (
    <motion.div 
      className="max-w-7xl mx-auto space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between">
        <ToolsCategories 
          categories={categories.map(cat => ({
            ...cat,
            count: categoryStats[cat.label]
          }))}
          selectedCategory={selectedCategory}
          onCategoryChange={onCategoryChange}
          isLoading={isLoading}
        />
        <ToolsFilters
          sortBy={sortBy}
          onSortChange={onSortChange}
        />
      </div>

      <ToolsGrid tools={filteredTools} isLoading={isLoading} />
    </motion.div>
  );
}
