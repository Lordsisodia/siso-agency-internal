
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Skeleton loading component for ClientsTable
export const ClientsTableSkeleton = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {Array(4).fill(0).map((_, i) => (
        <Skeleton key={i} className="h-32 w-full rounded-lg opacity-70" />
      ))}
    </div>
    <Skeleton className="h-14 w-full mb-6 rounded-lg opacity-70" />
    <div className="rounded-md border bg-card/30 border-border/50">
      <div className="h-12 border-b border-border/50 flex items-center px-4 py-2">
        <Skeleton className="h-5 w-5 rounded-md opacity-70" />
        <Skeleton className="h-5 w-32 ml-4 rounded-md opacity-70" />
      </div>
      {Array(5).fill(0).map((_, i) => (
        <div key={i} className="border-b border-border/50 px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Skeleton className="h-5 w-5 rounded-md opacity-70" />
            <div>
              <Skeleton className="h-5 w-36 mb-2 rounded-md opacity-70" />
              <Skeleton className="h-4 w-24 rounded-md opacity-70" />
            </div>
          </div>
          <Skeleton className="h-6 w-20 rounded-full opacity-70" />
        </div>
      ))}
    </div>
  </div>
);
