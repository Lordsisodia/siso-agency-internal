
import { PortfolioCategory } from '@/types/portfolio';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';

interface PortfolioFiltersProps {
  categories: PortfolioCategory[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export const PortfolioFilters = ({
  categories,
  activeCategory,
  onCategoryChange,
}: PortfolioFiltersProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto mb-8"
      id="portfolio-grid"
    >
      <Tabs defaultValue={activeCategory} value={activeCategory} onValueChange={onCategoryChange}>
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="all">All Projects</TabsTrigger>
          {categories.map((category) => (
            <TabsTrigger key={category.id} value={category.slug}>
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </motion.div>
  );
};
