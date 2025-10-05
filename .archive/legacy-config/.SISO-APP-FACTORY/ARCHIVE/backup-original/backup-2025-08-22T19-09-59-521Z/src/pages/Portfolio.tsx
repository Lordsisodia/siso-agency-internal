import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { usePortfolioData } from '@/hooks/usePortfolioData';
import { PortfolioCard } from '@/components/portfolio/PortfolioCard';
import { PortfolioHero } from '@/components/portfolio/PortfolioHero';
import { PortfolioFilters } from '@/components/portfolio/PortfolioFilters';
import { Skeleton } from '@/components/ui/skeleton';
import { PortfolioDetails } from '@/components/portfolio/PortfolioDetails';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { PortfolioItem } from '@/types/portfolio';
import { motion, AnimatePresence } from 'framer-motion';
import { AddPortfolioButton } from '@/components/portfolio/AddPortfolioButton';

export default function Portfolio() {
  const { items, categories, loading } = usePortfolioData();
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);

  const filteredItems = activeCategory === 'all'
    ? items
    : items.filter(item => {
        const category = categories.find(cat => cat.id === item.category_id);
        return category?.slug === activeCategory;
      });

  const handleSelectItem = (item: PortfolioItem) => {
    setSelectedItem(item);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setSelectedItem(null);
  };

  if (loading) {
    return (
      <MainLayout>
        <PortfolioHero />
        <div className="container mx-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-[400px] rounded-lg" />
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PortfolioHero />
      
      <div className="container mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {selectedItem ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              key="details"
            >
              <Button 
                variant="ghost" 
                className="mb-4 flex items-center gap-1 hover:bg-siso-text/5"
                onClick={handleBack}
              >
                <ArrowLeft className="h-4 w-4" />
                Back to all projects
              </Button>
              <PortfolioDetails item={selectedItem} />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              key="grid"
              className="space-y-8"
            >
              <div className="flex items-center justify-between">
                <AddPortfolioButton />
              </div>

              <PortfolioFilters
                categories={categories}
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map((item) => (
                  <PortfolioCard 
                    key={item.id} 
                    item={item} 
                    onSelect={() => handleSelectItem(item)}
                  />
                ))}
              </div>
              
              {filteredItems.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-lg text-siso-text/70">No projects found in this category</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MainLayout>
  );
}
