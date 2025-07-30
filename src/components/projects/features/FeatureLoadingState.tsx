import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

export function FeatureLoadingState() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 mb-8">
        <Skeleton className="h-8 w-48 bg-slate-800" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-24 bg-slate-800 rounded-md" />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array(6).fill(0).map((_, i) => (
          <Card key={i} className="bg-slate-900 border border-slate-800 overflow-hidden shadow-lg">
            {/* Category indicator band */}
            <Skeleton className="h-1.5 w-full bg-slate-800" />
            
            {/* Header section */}
            <div className="p-5 pb-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded-md bg-slate-800" />
                  <Skeleton className="h-6 w-40 bg-slate-800" />
                </div>
                <Skeleton className="h-6 w-24 rounded-full bg-slate-800" />
              </div>
              
              {/* Progress bar area */}
              <div className="mt-3 mb-1">
                <div className="flex justify-between mb-1">
                  <Skeleton className="h-3 w-16 bg-slate-800" />
                  <Skeleton className="h-3 w-8 bg-slate-800" />
                </div>
                <Skeleton className="h-1.5 w-full bg-slate-800" />
              </div>
            </div>
            
            {/* Token allocation */}
            <div className="px-5">
              <Skeleton className="h-9 w-full rounded-md bg-slate-800" />
            </div>
            
            {/* Description */}
            <div className="px-5 py-3">
              <Skeleton className="h-4 w-full bg-slate-800 mb-2" />
              <Skeleton className="h-4 w-3/4 bg-slate-800" />
            </div>
            
            {/* Tags */}
            <div className="px-5 flex gap-2">
              <Skeleton className="h-6 w-32 rounded-full bg-slate-800" />
              <Skeleton className="h-6 w-24 rounded-full bg-slate-800" />
            </div>
            
            {/* Timeline */}
            <div className="px-5 py-3 grid grid-cols-2 gap-2">
              <Skeleton className="h-8 w-full rounded-md bg-slate-800" />
              <Skeleton className="h-8 w-full rounded-md bg-slate-800" />
            </div>
            
            {/* Footer */}
            <div className="mt-auto px-5 py-4 bg-slate-950 border-t border-slate-800/50">
              <div className="flex justify-between">
                <div>
                  <Skeleton className="h-3 w-24 bg-slate-800 mb-1" />
                  <Skeleton className="h-5 w-28 bg-slate-800" />
                </div>
                <Skeleton className="h-9 w-24 rounded-md bg-slate-800" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
