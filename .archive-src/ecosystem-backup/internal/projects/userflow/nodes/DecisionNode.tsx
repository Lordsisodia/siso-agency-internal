/**
 * DRAFT IMPLEMENTATION - TO BE USED IN NEXT UPDATE
 * 
 * This file contains a draft implementation of the DecisionNode component
 * for the ReactFlow user flow diagram.
 */

import { Handle, NodeProps, Position } from 'reactflow';
import { GitBranch } from 'lucide-react';

interface DecisionNodeData {
  label: string;
  description?: string;
}

export function DecisionNode({ data, selected }: NodeProps<DecisionNodeData>) {
  return (
    <div 
      className={`px-3 py-3 rounded-lg shadow-md ${
        selected 
          ? 'ring-2 ring-emerald-500 bg-emerald-950/50 border border-emerald-500/50' 
          : 'bg-black/60 border border-white/10 hover:border-emerald-500/30'
      } transition-all duration-200 w-[160px] diamond-shape`}
      style={{
        clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
        transform: 'rotate(0deg)'
      }}
    >
      {/* Input handle - Top */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-emerald-500 border-2 border-black"
      />
      
      {/* Output handles - Left, Right, Bottom */}
      <Handle
        type="source"
        position={Position.Left}
        className="w-3 h-3 bg-emerald-500 border-2 border-black"
        id="left"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-emerald-500 border-2 border-black"
        id="right"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-emerald-500 border-2 border-black"
        id="bottom"
      />
      
      <div className="flex flex-col items-center">
        <div className="flex items-center justify-center mb-2">
          <div className="p-1.5 rounded-full bg-emerald-900/30 text-emerald-400">
            <GitBranch className="w-4 h-4" />
          </div>
        </div>
        
        <h3 className="text-sm font-medium text-white mb-1 text-center">{data.label}</h3>
        
        {data.description && (
          <p className="text-xs text-gray-400 mb-1 text-center line-clamp-2">{data.description}</p>
        )}
        
        <div className="flex justify-between w-full mt-1">
          <div className="bg-emerald-900/20 text-emerald-400 rounded-sm px-2 py-0.5 text-[10px]">Yes</div>
          <div className="bg-rose-900/20 text-rose-400 rounded-sm px-2 py-0.5 text-[10px]">No</div>
        </div>
      </div>
    </div>
  );
} 