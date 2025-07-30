
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { featureCategories } from '@/data/plan/featureData';

interface FeatureSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export const FeatureSearch: React.FC<FeatureSearchProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-grow">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-siso-text" />
        <Input 
          placeholder="Search features..." 
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 bg-black/30 border-siso-text/20 text-white"
        />
      </div>
      
      <div className="flex space-x-2 overflow-x-auto pb-2 sm:pb-0">
        <Button 
          size="sm"
          variant={selectedCategory === 'all' ? 'default' : 'outline'}
          className={selectedCategory === 'all' ? 'bg-siso-orange hover:bg-siso-orange/90' : 'border-siso-text/20'}
          onClick={() => onCategoryChange('all')}
        >
          All
        </Button>
        
        {featureCategories.map((category) => (
          <Button 
            key={category.id}
            size="sm"
            variant={selectedCategory === category.id ? 'default' : 'outline'}
            className={selectedCategory === category.id ? 'bg-siso-orange hover:bg-siso-orange/90' : 'border-siso-text/20'}
            onClick={() => onCategoryChange(category.id)}
          >
            {category.name}
          </Button>
        ))}
      </div>
    </div>
  );
};
