
import { useState } from 'react';
import { ZoomIn, ZoomOut, Move, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface WireframeViewerProps {
  imageUrl: string;
  title: string;
  description?: string;
  notionUiPlanLink?: string;
  notionDetailsLink?: string;
  onDownload?: () => void;
}

export function WireframeViewer({ imageUrl, title, description, notionUiPlanLink, notionDetailsLink, onDownload }: WireframeViewerProps) {
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.1, 3));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.1, 0.5));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-white">{title}</h3>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleZoomIn}
            className="bg-black/30 border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleZoomOut}
            className="bg-black/30 border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleReset}
            className="bg-black/30 border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
          >
            <Move className="h-4 w-4" />
          </Button>
          {onDownload && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onDownload}
              className="bg-black/30 border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
            >
              <Download className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      <div 
        className={cn(
          "relative overflow-hidden border border-gray-800 rounded-lg bg-black/20 h-[400px]",
          isDragging ? "cursor-grabbing" : "cursor-grab"
        )}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div 
          className="absolute transition-transform"
          style={{ 
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: '0 0'
          }}
        >
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={title} 
              className="max-w-full object-contain rounded-lg" 
            />
          ) : (
            <div className="flex items-center justify-center h-96 w-full">
              <p className="text-gray-500">No wireframe image available</p>
            </div>
          )}
        </div>
      </div>
      <div className="text-sm text-gray-400 space-y-4">
        <div className="flex justify-between items-center">
          <span>Scale: {Math.round(scale * 100)}%</span>
          <span>Click and drag to move</span>
        </div>
        
        {description && (
          <div className="bg-black/30 p-3 rounded-lg border border-gray-800">
            <h4 className="text-white font-medium mb-1">Description</h4>
            <p className="text-gray-300">{description}</p>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row gap-2">
          {notionUiPlanLink && (
            <a 
              href={notionUiPlanLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex-1 bg-purple-700/20 hover:bg-purple-700/30 transition-colors border border-purple-500/40 text-purple-300 py-2 px-3 rounded-md flex items-center justify-center gap-2"
            >
              <span>UI Plan Documentation</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
            </a>
          )}
          
          {notionDetailsLink && (
            <a
              href={notionDetailsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-indigo-700/20 hover:bg-indigo-700/30 transition-colors border border-indigo-500/40 text-indigo-300 py-2 px-3 rounded-md flex items-center justify-center gap-2"
            >
              <span>Detailed Requirements</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
