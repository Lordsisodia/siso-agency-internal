
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Settings2 } from 'lucide-react';

interface ViewOptionsMenuProps {
  pageSize: number;
  onPageSizeChange: (size: number) => void;
}

export function ViewOptionsMenu({
  pageSize,
  onPageSizeChange
}: ViewOptionsMenuProps) {
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 shadow-sm border-border/50 hover:bg-muted/50 control-button">
          <Settings2 className="h-4 w-4 mr-2" />
          View Options
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 border-border/70 bg-card/95 backdrop-blur-sm shadow-lg">
        <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">Customize View</DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs font-medium">Page Size</DropdownMenuLabel>
        <div className="px-2 py-1.5 grid grid-cols-3 gap-1">
          {[5, 10, 20, 50, 100].map((size) => (
            <Button
              key={size}
              variant={pageSize === size ? 'default' : 'outline'}
              size="sm"
              className={`h-8 ${pageSize === size ? 'bg-primary hover:bg-primary/90' : 'hover:bg-muted/50'} transition-all`}
              onClick={() => onPageSizeChange(size)}
            >
              {size}
            </Button>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
