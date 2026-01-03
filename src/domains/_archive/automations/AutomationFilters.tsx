import { Search } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AutomationCategory } from './types';

interface AutomationFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedCategory: AutomationCategory;
  onCategoryChange: (value: AutomationCategory) => void;
  getCategoryCount: (category: AutomationCategory) => number;
}

export function AutomationFilters({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  getCategoryCount
}: AutomationFiltersProps) {
  return (
    <div className="space-y-4 w-full">
      <div className="relative w-full md:w-96">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-siso-text/60" />
        <Input
          placeholder="Search automations..."
          className="pl-10 bg-siso-text/5 border-siso-text/10 focus-visible:ring-siso-orange"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <Tabs defaultValue={selectedCategory} className="w-full" onValueChange={(value) => onCategoryChange(value as AutomationCategory)}>
        <TabsList className="flex flex-wrap gap-2 p-4 bg-siso-text/5 border border-siso-text/10 rounded-lg">
          <TabsTrigger 
            value="all" 
            className="flex-1 min-w-[120px] data-[state=active]:bg-siso-orange/20 data-[state=active]:text-siso-orange hover:bg-siso-text/10"
          >
            All
            <Badge variant="secondary" className="ml-2 bg-siso-text/10">
              {getCategoryCount('all')}
            </Badge>
          </TabsTrigger>
          <TabsTrigger 
            value="featured" 
            className="flex-1 min-w-[120px] data-[state=active]:bg-siso-orange/20 data-[state=active]:text-siso-orange hover:bg-siso-text/10"
          >
            Featured
            <Badge variant="secondary" className="ml-2 bg-siso-text/10">
              {getCategoryCount('featured')}
            </Badge>
          </TabsTrigger>
          <TabsTrigger 
            value="linkedin" 
            className="flex-1 min-w-[120px] data-[state=active]:bg-siso-orange/20 data-[state=active]:text-siso-orange hover:bg-siso-text/10"
          >
            LinkedIn
            <Badge variant="secondary" className="ml-2 bg-siso-text/10">
              {getCategoryCount('linkedin')}
            </Badge>
          </TabsTrigger>
          <TabsTrigger 
            value="instagram" 
            className="flex-1 min-w-[120px] data-[state=active]:bg-siso-orange/20 data-[state=active]:text-siso-orange hover:bg-siso-text/10"
          >
            Instagram
            <Badge variant="secondary" className="ml-2 bg-siso-text/10">
              {getCategoryCount('instagram')}
            </Badge>
          </TabsTrigger>
          <TabsTrigger 
            value="x" 
            className="flex-1 min-w-[120px] data-[state=active]:bg-siso-orange/20 data-[state=active]:text-siso-orange hover:bg-siso-text/10"
          >
            X
            <Badge variant="secondary" className="ml-2 bg-siso-text/10">
              {getCategoryCount('x')}
            </Badge>
          </TabsTrigger>
          <TabsTrigger 
            value="reddit" 
            className="flex-1 min-w-[120px] data-[state=active]:bg-siso-orange/20 data-[state=active]:text-siso-orange hover:bg-siso-text/10"
          >
            Reddit
            <Badge variant="secondary" className="ml-2 bg-siso-text/10">
              {getCategoryCount('reddit')}
            </Badge>
          </TabsTrigger>
          <TabsTrigger 
            value="youtube" 
            className="flex-1 min-w-[120px] data-[state=active]:bg-siso-orange/20 data-[state=active]:text-siso-orange hover:bg-siso-text/10"
          >
            YouTube
            <Badge variant="secondary" className="ml-2 bg-siso-text/10">
              {getCategoryCount('youtube')}
            </Badge>
          </TabsTrigger>
          <TabsTrigger 
            value="tiktok" 
            className="flex-1 min-w-[120px] data-[state=active]:bg-siso-orange/20 data-[state=active]:text-siso-orange hover:bg-siso-text/10"
          >
            TikTok
            <Badge variant="secondary" className="ml-2 bg-siso-text/10">
              {getCategoryCount('tiktok')}
            </Badge>
          </TabsTrigger>
          <TabsTrigger 
            value="general" 
            className="flex-1 min-w-[120px] data-[state=active]:bg-siso-orange/20 data-[state=active]:text-siso-orange hover:bg-siso-text/10"
          >
            General
            <Badge variant="secondary" className="ml-2 bg-siso-text/10">
              {getCategoryCount('general')}
            </Badge>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}