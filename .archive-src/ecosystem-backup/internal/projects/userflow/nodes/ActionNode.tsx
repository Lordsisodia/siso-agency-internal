/**
 * DRAFT IMPLEMENTATION - TO BE USED IN NEXT UPDATE
 * 
 * This file contains a draft implementation of the ActionNode component
 * for the ReactFlow user flow diagram.
 */

import { Handle, NodeProps, Position } from 'reactflow';
import { BadgePlusIcon, MousePointer, FingerprintIcon } from 'lucide-react';

interface ActionNodeData {
  label: string;
  action: string;
  description?: string;
}

// Action icon mapping
const actionIcons = {
  button_click: MousePointer,
  tap: FingerprintIcon,
  form_submit: BadgePlusIcon,
};

export function ActionNode({ data, selected }: NodeProps<ActionNodeData>) {
  // Default to button click if action isn't recognized
  const ActionIcon = actionIcons[data.action] || MousePointer;

  return (
    <div 
      className={`px-4 py-3 rounded-lg shadow-md ${
        selected 
          ? 'ring-2 ring-blue-500 bg-blue-950/50 border border-blue-500/50' 
          : 'bg-black/60 border border-white/10 hover:border-blue-500/30'
      } transition-all duration-200 w-[160px]`}
    >
      {/* Input handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-blue-500 border-2 border-black"
      />
      
      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-blue-500 border-2 border-black"
      />
      
      <div className="flex flex-col">
        <div className="flex items-center justify-center mb-2">
          <div className="p-1.5 rounded-full bg-blue-900/30 text-blue-400">
            <ActionIcon className="w-4 h-4" />
          </div>
        </div>
        
        <h3 className="text-sm font-medium text-white mb-1 text-center">{data.label}</h3>
        
        {data.description && (
          <p className="text-xs text-gray-400 mb-2 text-center line-clamp-2">{data.description}</p>
        )}
        
        <div className="mt-1 bg-blue-900/20 text-blue-400 rounded-sm px-2 py-1 text-xs text-center">
          {data.action.replace('_', ' ')}
        </div>
      </div>
    </div>
  );
}
