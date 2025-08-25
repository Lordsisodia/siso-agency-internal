
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Bookmark, 
  Check, 
  Save, 
  X, 
  Trash2 
} from 'lucide-react';
import { ClientViewPreference, SavedView } from '@/types/client.types';
import { useToast } from '@/hooks/use-toast';

interface SavedViewsManagerProps {
  currentPreference: ClientViewPreference;
  onLoadView: (preference: ClientViewPreference) => void;
}

export function SavedViewsManager({ currentPreference, onLoadView }: SavedViewsManagerProps) {
  const [savedViews, setSavedViews] = useState<SavedView[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newViewName, setNewViewName] = useState('');
  const { toast } = useToast();

  // Load saved views from localStorage
  useEffect(() => {
    const savedViewsJson = localStorage.getItem('clientSavedViews');
    if (savedViewsJson) {
      try {
        const views = JSON.parse(savedViewsJson);
        setSavedViews(views);
      } catch (e) {
        console.error('Failed to parse saved views', e);
      }
    }
  }, []);

  // Save views to localStorage
  const persistViews = (views: SavedView[]) => {
    localStorage.setItem('clientSavedViews', JSON.stringify(views));
    setSavedViews(views);
  };

  const handleSaveCurrentView = () => {
    if (!newViewName.trim()) {
      toast({
        variant: "destructive",
        title: "View name required",
        description: "Please enter a name for your saved view."
      });
      return;
    }

    const newView: SavedView = {
      id: uuidv4(),
      name: newViewName.trim(),
      preference: { ...currentPreference },
      createdAt: new Date().toISOString() // Add the required createdAt property
    };

    const updatedViews = [...savedViews, newView];
    persistViews(updatedViews);
    
    toast({
      title: "View saved",
      description: `"${newViewName}" view has been saved.`
    });
    
    setNewViewName('');
    setIsCreating(false);
  };

  const handleLoadView = (view: SavedView) => {
    onLoadView(view.preference);
    
    toast({
      title: "View loaded",
      description: `"${view.name}" view has been loaded.`
    });
  };

  const handleDeleteView = (viewId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const viewToDelete = savedViews.find(v => v.id === viewId);
    if (!viewToDelete) return;
    
    const updatedViews = savedViews.filter(v => v.id !== viewId);
    persistViews(updatedViews);
    
    toast({
      title: "View deleted",
      description: `"${viewToDelete.name}" view has been deleted.`
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 shadow-sm border-border/50 hover:bg-muted/50">
          <Bookmark className="h-4 w-4 mr-2" />
          Saved Views
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60 border-border/70 bg-card/95 backdrop-blur-sm">
        <DropdownMenuLabel>Saved Views</DropdownMenuLabel>
        
        {savedViews.length > 0 ? (
          <>
            {savedViews.map((view) => (
              <DropdownMenuItem 
                key={view.id} 
                onClick={() => handleLoadView(view)}
                className="flex items-center justify-between cursor-pointer group py-2 px-3 hover:bg-muted/50"
              >
                <span className="text-sm font-medium">{view.name}</span>
                <Button
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => handleDeleteView(view.id, e)}
                >
                  <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                </Button>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
          </>
        ) : (
          <div className="px-2 py-3 text-sm text-muted-foreground text-center">
            No saved views yet
          </div>
        )}
        
        {isCreating ? (
          <div className="p-2 flex items-center gap-1">
            <Input 
              placeholder="View name" 
              value={newViewName}
              onChange={(e) => setNewViewName(e.target.value)}
              className="h-8 text-sm border-border/50"
              autoFocus
            />
            <div className="flex">
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-8 w-8 p-0" 
                onClick={handleSaveCurrentView}
              >
                <Check className="h-4 w-4 text-green-500" />
              </Button>
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-8 w-8 p-0" 
                onClick={() => setIsCreating(false)}
              >
                <X className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        ) : (
          <DropdownMenuItem 
            onClick={() => setIsCreating(true)}
            className="cursor-pointer flex items-center py-2 hover:bg-muted/50"
          >
            <Save className="h-4 w-4 mr-2" />
            Save current view
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
