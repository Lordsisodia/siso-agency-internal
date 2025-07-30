import { motion } from 'framer-motion';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ToolsCategoriesProps {
  categories: Array<{
    id: string;
    label: string;
    count?: number;
  }>;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  isLoading?: boolean;
}

export function ToolsCategories({
  categories,
  selectedCategory,
  onCategoryChange,
  isLoading
}: ToolsCategoriesProps) {
  return (
    <ScrollArea className="w-full">
      <Tabs 
        value={selectedCategory} 
        className="w-full" 
        onValueChange={onCategoryChange}
      >
        <TabsList className="h-auto flex-wrap bg-siso-text/5 p-2 mb-6 border border-siso-text/10 rounded-xl">
          {categories.map((category) => (
            <motion.div
              key={category.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <TabsTrigger
                value={category.id}
                className="m-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-siso-red/20 data-[state=active]:to-siso-orange/20 data-[state=active]:text-siso-orange transition-all duration-300 hover:text-siso-orange/80"
                disabled={isLoading}
              >
                {category.label}
                {category.count !== undefined && (
                  <motion.span 
                    className="ml-2 text-sm text-siso-text/60"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    ({category.count})
                  </motion.span>
                )}
              </TabsTrigger>
            </motion.div>
          ))}
        </TabsList>
      </Tabs>
    </ScrollArea>
  );
}