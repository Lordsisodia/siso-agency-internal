import { Button } from "@/components/ui/button";
import { ExternalLink, Youtube, Info, Share2, Twitter, MessageSquare } from 'lucide-react';
import { Tool } from './types';

interface ToolActionsProps {
  tool: Tool;
  onShare: () => void;
  onTwitterShare: () => void;
}

export function ToolActions({ tool, onShare, onTwitterShare }: ToolActionsProps) {
  return (
    <div className="space-y-6 relative z-10">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-siso-text/80">
          Pricing:
        </span>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          tool.pricing_type?.toLowerCase() === 'free' 
            ? 'bg-green-500/20 text-green-400'
            : 'bg-siso-orange/20 text-siso-orange'
        }`}>
          {tool.pricing_type || 'Contact for Pricing'}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {tool.assistant_type && (
          <Button
            className="w-full justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all duration-300"
            onClick={() => window.open('/chat', '_blank')}
          >
            <MessageSquare className="h-4 w-4" />
            GPT Assistant
          </Button>
        )}
        {tool.website_url && (
          <Button
            className="w-full justify-center gap-2 bg-gradient-to-r from-siso-red to-siso-orange hover:from-siso-red/90 hover:to-siso-orange/90 transition-all duration-300"
            onClick={() => window.open(tool.website_url!, '_blank')}
          >
            <ExternalLink className="h-4 w-4" />
            View Website
          </Button>
        )}
        {tool.youtube_url && (
          <Button
            variant="outline"
            className="w-full justify-center gap-2 border-siso-text/20 hover:bg-siso-text/5 hover:border-red-500/50"
            onClick={() => window.open(tool.youtube_url!, '_blank')}
          >
            <Youtube className="h-4 w-4 text-red-500" />
            View on YouTube
          </Button>
        )}
        <Button
          variant="outline"
          className="w-full justify-center gap-2 border-siso-text/20 hover:bg-siso-text/5"
          onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(tool.name)}`, '_blank')}
        >
          <Info className="h-4 w-4 text-siso-text/80" />
          Learn More
        </Button>
        <Button
          variant="outline"
          className="w-full justify-center gap-2 border-siso-text/20 hover:bg-siso-text/5"
          onClick={onTwitterShare}
        >
          <Twitter className="h-4 w-4 text-blue-400" />
          Share on X
        </Button>
        <Button
          variant="outline"
          className="w-full justify-center gap-2 border-siso-text/20 hover:bg-siso-text/5"
          onClick={onShare}
        >
          <Share2 className="h-4 w-4 text-siso-text/80" />
          Share
        </Button>
      </div>
    </div>
  );
}