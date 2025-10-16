import React from 'react';

import { Card, CardContent, CardHeader } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';

export const NightlyCheckoutSkeleton: React.FC = () => (
  <div className="min-h-screen w-full bg-[#121212] relative overflow-x-hidden">
    <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-6 lg:p-8 space-y-6">
      <Card className="mb-24 bg-purple-900/10 border-purple-700/30">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-5 w-5 rounded-full bg-purple-500/30" />
              <Skeleton className="h-5 w-48 bg-purple-400/20" />
            </div>
            <Skeleton className="h-4 w-20 bg-purple-400/20" />
          </div>
          <Skeleton className="h-2 w-full bg-purple-400/20 rounded-full" />
        </CardHeader>
        <CardContent className="pb-24 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={`checkout-stat-skeleton-${index}`}
                className="rounded-xl border border-purple-700/40 bg-purple-900/30 p-4 space-y-3"
              >
                <Skeleton className="h-4 w-1/2 bg-purple-400/20" />
                <Skeleton className="h-6 w-16 bg-purple-400/30" />
                <Skeleton className="h-2 w-full bg-purple-400/20 rounded-full" />
              </div>
            ))}
          </div>

          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={`checkout-reflection-skeleton-${index}`}
                className="rounded-xl border border-purple-700/40 bg-purple-900/30 p-4 space-y-3"
              >
                <Skeleton className="h-4 w-1/3 bg-purple-400/20" />
                <Skeleton className="h-12 w-full bg-purple-400/10 rounded-lg" />
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <Skeleton className="h-10 w-full sm:w-40 bg-purple-400/20 rounded-lg" />
            <Skeleton className="h-10 w-full sm:w-40 bg-purple-400/20 rounded-lg" />
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);
