
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface Wireframe {
  id: string;
  title: string;
  imageUrl?: string;
  category: 'layout' | 'user-flow' | 'component' | 'page';
  description?: string;
  notionUiPlanLink?: string;
  notionDetailsLink?: string;
  wireframeStatus?: string;
  specsStatus?: string;
  devStatus?: string;
}

interface WireframeNavigationProps {
  wireframes: Wireframe[];
  activeWireframeId: string;
  onSelect: (wireframeId: string) => void;
}

export function WireframeNavigation({ 
  wireframes, 
  activeWireframeId, 
  onSelect 
}: WireframeNavigationProps) {
  const [filter, setFilter] = useState<string | null>(null);

  const categories = [...new Set(wireframes.map(w => w.category))];
  const filteredWireframes = filter 
    ? wireframes.filter(w => w.category === filter)
    : wireframes;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "bg-black/30 border-gray-700 text-gray-300 hover:bg-black/40",
            !filter && "bg-purple-500/20 border-purple-500/50 text-purple-400"
          )}
          onClick={() => setFilter(null)}
        >
          All
        </Button>
        {categories.map(category => (
          <Button
            key={category}
            variant="outline"
            size="sm"
            className={cn(
              "bg-black/30 border-gray-700 text-gray-300 hover:bg-black/40",
              filter === category && "bg-purple-500/20 border-purple-500/50 text-purple-400"
            )}
            onClick={() => setFilter(category)}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </Button>
        ))}
      </div>

      <div className="space-y-2">
        {filteredWireframes.map(wireframe => (
          <div
            key={wireframe.id}
            className={cn(
              "flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors",
              activeWireframeId === wireframe.id
                ? "bg-purple-500/10 border border-purple-500/30"
                : "bg-black/20 border border-gray-800 hover:bg-black/30"
            )}
            onClick={() => onSelect(wireframe.id)}
          >
            <div className="h-14 w-14 bg-black/40 rounded-md flex-shrink-0 overflow-hidden">
              {wireframe.imageUrl ? (
                <img
                  src={wireframe.imageUrl}
                  alt={wireframe.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-600">
                  No image
                </div>
              )}
            </div>
            <div className="flex-grow">
              <h4 className="text-sm font-medium text-white">{wireframe.title}</h4>
              {wireframe.description && (
                <p className="text-xs text-gray-400 line-clamp-2">{wireframe.description}</p>
              )}
              <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-black/30 rounded-full text-gray-400">
                {wireframe.category}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
