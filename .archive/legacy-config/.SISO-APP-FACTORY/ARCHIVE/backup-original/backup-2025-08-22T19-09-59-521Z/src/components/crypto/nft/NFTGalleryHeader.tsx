
import { motion } from 'framer-motion';
import { Grid, List, SortAsc, SortDesc } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from '@/lib/utils';

interface NFTGalleryHeaderProps {
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (order: 'asc' | 'desc') => void;
  filterAttribute: string;
  setFilterAttribute: (attr: string) => void;
  uniqueAttributes: string[];
}

export const NFTGalleryHeader = ({
  viewMode,
  setViewMode,
  sortOrder,
  setSortOrder,
  filterAttribute,
  setFilterAttribute,
  uniqueAttributes,
}: NFTGalleryHeaderProps) => {
  return (
    <motion.div 
      className="flex flex-wrap gap-4 items-center justify-between"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setViewMode('grid')}
          className={cn(
            "transition-all duration-300",
            viewMode === 'grid' ? 'bg-siso-text/10 hover:bg-siso-text/20' : ''
          )}
        >
          <Grid className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setViewMode('list')}
          className={cn(
            "transition-all duration-300",
            viewMode === 'list' ? 'bg-siso-text/10 hover:bg-siso-text/20' : ''
          )}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          className="transition-all duration-300 hover:bg-siso-text/10"
        >
          {sortOrder === 'asc' ? (
            <SortAsc className="h-4 w-4" />
          ) : (
            <SortDesc className="h-4 w-4" />
          )}
        </Button>
      </div>
      <Select
        value={filterAttribute}
        onValueChange={setFilterAttribute}
      >
        <SelectTrigger className="w-[180px] bg-black/20 border-siso-text/10">
          <SelectValue placeholder="Filter by attribute" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Attributes</SelectItem>
          {uniqueAttributes.map((attr) => (
            <SelectItem key={attr} value={attr}>
              {attr}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </motion.div>
  );
};
