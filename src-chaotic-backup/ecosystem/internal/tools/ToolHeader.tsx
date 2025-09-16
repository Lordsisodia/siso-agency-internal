import { Star } from 'lucide-react';
import { Tool } from './types';

interface ToolHeaderProps {
  tool: Tool;
}

export function ToolHeader({ tool }: ToolHeaderProps) {
  return (
    <div className="flex items-center gap-6">
      {tool.profile_image_url ? (
        <img 
          src={tool.profile_image_url} 
          alt={tool.name}
          className="w-24 h-24 rounded-full object-cover ring-2 ring-siso-orange/20"
        />
      ) : (
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-siso-red/20 to-siso-orange/20 flex items-center justify-center ring-2 ring-siso-orange/20">
          <Star className="w-12 h-12 text-siso-orange" />
        </div>
      )}
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-siso-red to-siso-orange text-transparent bg-clip-text mb-2">
          {tool.name}
        </h1>
        <p className="text-lg text-siso-text/80">
          {tool.member_type || tool.category}
        </p>
      </div>
    </div>
  );
}