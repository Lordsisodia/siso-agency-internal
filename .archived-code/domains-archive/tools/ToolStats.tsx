import { Star, Download, Heart } from 'lucide-react';
import { Tool } from './types';

interface ToolStatsProps {
  tool: Tool;
}

export function ToolStats({ tool }: ToolStatsProps) {
  if (tool.member_type) return null;

  return (
    <div className="grid grid-cols-3 gap-4 relative z-10">
      <div className="text-center p-4 rounded-lg bg-siso-text/5 hover:bg-siso-text/10 transition-all duration-300">
        <Star className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
        <div className="text-xl font-semibold text-siso-text-bold">{tool.rating?.toFixed(1) || '-'}</div>
        <div className="text-sm text-siso-text/80">Rating</div>
      </div>
      <div className="text-center p-4 rounded-lg bg-siso-text/5 hover:bg-siso-text/10 transition-all duration-300">
        <Download className="h-6 w-6 text-siso-text/60 mx-auto mb-2" />
        <div className="text-xl font-semibold text-siso-text-bold">{tool.downloads_count?.toLocaleString() || '0'}</div>
        <div className="text-sm text-siso-text/80">Users</div>
      </div>
      <div className="text-center p-4 rounded-lg bg-siso-text/5 hover:bg-siso-text/10 transition-all duration-300">
        <Heart className="h-6 w-6 text-red-500 mx-auto mb-2" />
        <div className="text-xl font-semibold text-siso-text-bold">{tool.likes_count?.toLocaleString() || '0'}</div>
        <div className="text-sm text-siso-text/80">Likes</div>
      </div>
    </div>
  );
}