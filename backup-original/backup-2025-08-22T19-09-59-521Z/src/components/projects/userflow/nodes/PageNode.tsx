import { memo } from 'react';
// import { Handle, Position, NodeProps } from 'reactflow';

// Temporarily disabled to fix rendering issues
// Using 'any' type as a temporary fix while ReactFlow is disabled
export const PageNode = memo(({ data, isConnectable }: any) => {
  // Determine background color based on status
  const getBackgroundColor = () => {
    switch (data.status) {
      case 'live':
        return 'bg-gradient-to-br from-emerald-800/50 to-emerald-900/50 border-emerald-500/30';
      case 'development':
        return 'bg-gradient-to-br from-amber-800/50 to-amber-900/50 border-amber-500/30';
      case 'planned':
      default:
        return 'bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-500/30';
    }
  };

  // Get status badge
  const getStatusBadge = () => {
    switch (data.status) {
      case 'live':
        return <div className="bg-emerald-500/80 rounded-sm px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-white">Live</div>;
      case 'development':
        return <div className="bg-amber-500/80 rounded-sm px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-white">In Dev</div>;
      case 'planned':
      default:
        return <div className="bg-slate-500/80 rounded-sm px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-white">Planned</div>;
    }
  };

  return (
    <div className={`px-4 py-3 rounded-md border ${getBackgroundColor()} shadow-lg min-w-[180px]`}>
      {/* Top Handle */}
      {/* Temporarily commented out to fix React Flow issues
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-blue-500/80 border-2 border-blue-700"
      /> */}
      
      <div className="flex items-center justify-between mb-1">
        {getStatusBadge()}
        <div className="bg-black/30 rounded-full p-1">
          <svg className="w-3 h-3 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
      </div>
      
      <div className="text-white font-medium text-sm">{data.label}</div>
      
      {data.description && (
        <div className="text-white/70 text-xs mt-1 line-clamp-2">{data.description}</div>
      )}
      
      {/* Bottom Handle */}
      {/* Temporarily commented out to fix React Flow issues
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-blue-500/80 border-2 border-blue-700"
      /> */}
    </div>
  );
});

PageNode.displayName = 'PageNode';
