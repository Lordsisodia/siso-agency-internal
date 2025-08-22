import { Skeleton } from "@/components/ui/skeleton";

export function ToolSkeleton() {
  return (
    <div className="group relative flex flex-col gap-4 rounded-lg border border-siso-text/10 bg-siso-text/5 p-6 h-[200px]">
      <div className="flex items-start gap-4">
        <Skeleton className="h-12 w-12 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
      <div className="mt-auto">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5 mt-2" />
      </div>
    </div>
  );
}