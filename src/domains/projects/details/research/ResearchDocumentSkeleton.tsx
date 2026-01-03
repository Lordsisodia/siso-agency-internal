import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

export function ResearchDocumentSkeleton() {
  return (
    <Card className="bg-slate-900 border border-slate-800 h-full flex flex-col relative overflow-hidden shadow-lg">
      {/* Category indicator band */}
      <Skeleton className="h-1.5 w-full bg-slate-800" />
      
      {/* Header section */}
      <div className="p-5 pb-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-md bg-slate-800" />
            <Skeleton className="h-6 w-40 bg-slate-800" />
          </div>
          <Skeleton className="h-7 w-7 rounded-md bg-slate-800" />
        </div>
        
        <Skeleton className="h-4 w-full bg-slate-800 mb-2" />
        <Skeleton className="h-4 w-4/5 bg-slate-800 mb-3" />
        
        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mt-2">
          <Skeleton className="h-6 w-16 rounded-full bg-slate-800" />
          <Skeleton className="h-6 w-20 rounded-full bg-slate-800" />
          <Skeleton className="h-6 w-24 rounded-full bg-slate-800" />
        </div>
      </div>
      
      {/* Bottom section */}
      <div className="mt-auto">
        <div className="px-5 py-4 bg-slate-950 border-t border-slate-800/50">
          <div className="flex justify-between items-center mb-3">
            <Skeleton className="h-5 w-24 bg-slate-800" />
            <Skeleton className="h-6 w-16 bg-slate-800 rounded-md" />
          </div>
          
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-28 rounded-full bg-slate-800" />
            <Skeleton className="h-4 w-24 bg-slate-800" />
          </div>
        </div>
      </div>
    </Card>
  );
}

export function PinnedResearchAssetSkeleton() {
  return (
    <Card className="bg-slate-900 border border-indigo-700/30 h-full flex flex-col relative overflow-hidden shadow-lg bg-gradient-to-br from-indigo-950/40 to-slate-900">
      {/* Category indicator band */}
      <Skeleton className="h-1.5 w-full bg-indigo-800/50" />
      
      {/* Pinned indicator */}
      <div className="absolute top-3 right-3">
        <Skeleton className="h-5 w-5 rounded-full bg-indigo-800/50" />
      </div>
      
      {/* Header section */}
      <div className="p-5 pb-3">
        <div className="flex items-center gap-2 mb-3">
          <Skeleton className="h-8 w-8 rounded-md bg-indigo-800/30" />
          <Skeleton className="h-6 w-40 bg-indigo-800/30" />
        </div>
        
        <Skeleton className="h-4 w-full bg-indigo-800/30 mb-2" />
        <Skeleton className="h-4 w-4/5 bg-indigo-800/30 mb-3" />
        
        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mt-2">
          <Skeleton className="h-6 w-16 rounded-full bg-indigo-800/30" />
          <Skeleton className="h-6 w-20 rounded-full bg-indigo-800/30" />
        </div>
      </div>
      
      {/* Bottom section */}
      <div className="mt-auto">
        <div className="px-5 py-4 bg-slate-950/80 border-t border-indigo-700/20">
          <div className="flex justify-between items-center mb-3">
            <Skeleton className="h-5 w-24 bg-indigo-800/30" />
            <Skeleton className="h-7 w-7 rounded-md bg-indigo-800/30" />
          </div>
          
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-28 rounded-full bg-indigo-800/30" />
            <Skeleton className="h-4 w-24 bg-indigo-800/30" />
          </div>
        </div>
      </div>
    </Card>
  );
} 