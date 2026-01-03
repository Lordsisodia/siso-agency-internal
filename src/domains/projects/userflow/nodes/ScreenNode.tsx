/**
 * DRAFT IMPLEMENTATION - TO BE USED IN NEXT UPDATE
 * 
 * This file contains a draft implementation of the ScreenNode component
 * for the ReactFlow user flow diagram.
 */

import { Handle, NodeProps, Position } from 'reactflow';
import { Badge } from '@/components/ui/badge';
import { Layers, ExternalLink } from 'lucide-react';

interface ScreenNodeData {
  label: string;
  status: 'implemented' | 'in-progress' | 'planned';
  description?: string;
  screenshot?: string | null;
}

// Status badge colors
const statusColors = {
  implemented: 'bg-green-500/20 text-green-400 border-green-500/40',
  'in-progress': 'bg-amber-500/20 text-amber-400 border-amber-500/40',
  planned: 'bg-slate-500/20 text-slate-400 border-slate-500/40',
};

// Status labels
const statusLabels = {
  implemented: 'Implemented',
  'in-progress': 'In Progress',
  planned: 'Planned',
};

export function ScreenNode({ data, selected }: NodeProps<ScreenNodeData>) {
  return (
    <div 
      className={`px-4 py-3 rounded-lg shadow-md ${
        selected 
          ? 'ring-2 ring-indigo-500 bg-indigo-950/50 border border-indigo-500/50' 
          : 'bg-black/60 border border-white/10 hover:border-indigo-500/30'
      } transition-all duration-200 w-[180px]`}
    >
      {/* Input handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-indigo-500 border-2 border-black"
      />
      
      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-indigo-500 border-2 border-black"
      />
      
      <div className="flex flex-col">
        <div className="flex items-start justify-between mb-2">
          <div className="p-1.5 rounded-md bg-indigo-900/30 text-indigo-400">
            <Layers className="w-4 h-4" />
          </div>
          <Badge 
            variant="outline" 
            className={`text-xs ${statusColors[data.status]}`}
          >
            {statusLabels[data.status]}
          </Badge>
        </div>
        
        <h3 className="text-sm font-medium text-white mb-1">{data.label}</h3>
        
        {data.description && (
          <p className="text-xs text-gray-400 mb-2 line-clamp-2">{data.description}</p>
        )}
        
        {data.screenshot && (
          <div className="mt-2 h-20 rounded-md bg-slate-800/50 flex items-center justify-center mb-2">
            <img 
              src={data.screenshot} 
              alt={data.label} 
              className="h-full w-full object-cover rounded" 
            />
          </div>
        )}
        
        {!data.screenshot && selected && (
          <div className="mt-1 bg-indigo-900/20 text-indigo-400 rounded-sm px-2 py-1 text-xs flex items-center justify-center cursor-pointer">
            <ExternalLink className="w-3 h-3 mr-1" />
            Add screenshot
          </div>
        )}
      </div>
    </div>
  );
} 