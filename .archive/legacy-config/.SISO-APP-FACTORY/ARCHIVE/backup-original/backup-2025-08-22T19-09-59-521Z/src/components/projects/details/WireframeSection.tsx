import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, AlertTriangle, FileIcon } from 'lucide-react';
import { useProjectWireframes } from '@/hooks/useProjectWireframes';
import { WireframeCard } from '@/components/projects/wireframes/WireframeCard';
import { Skeleton } from '@/components/ui/skeleton';

export function WireframeSection() {
  // All hooks MUST be called at the top level, unconditionally
  const { id: projectId } = useParams();
  const [activeTab, setActiveTab] = useState('all');
  
  const {
    wireframes,
    loading,
    error,
    activeWireframeId,
    setActiveWireframeId 
  } = useProjectWireframes();

  // We'll use these states for content selection rather than early returns
  const [contentType, setContentType] = useState<'loading' | 'error' | 'empty' | 'normal'>('loading');
  
  // Log state for debugging
  useEffect(() => {
    console.log("WireframeSection rendered with:", { 
      projectId, 
      wireframesCount: wireframes?.length || 0,
      loading,
      error,
      activeTab,
      contentType
    });
  }, [projectId, wireframes, loading, error, activeTab, contentType]);

  // Determine content type based on loading/error/empty states
  useEffect(() => {
  if (loading) {
      setContentType('loading');
    } else if (error) {
      setContentType('error');
    } else if (!wireframes || wireframes.length === 0) {
      setContentType('empty');
    } else {
      setContentType('normal');
    }
  }, [loading, error, wireframes]);

  // Handle tab change - defined once, not recreated on each render
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  // Handle retry button - defined once, not recreated on each render
  const handleRetry = () => {
    window.location.reload();
  };

  // Prepare filtered wireframe lists
  const complete = wireframes?.filter(w => w.wireframeStatus === 'complete') || [];
  const inProgress = wireframes?.filter(w => w.wireframeStatus === 'in-progress') || [];
  const planned = wireframes?.filter(w => w.wireframeStatus === 'planned') || [];

  // UI components for different states
  const LoadingContent = () => (
    <div className="space-y-6 text-slate-900 dark:text-white">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Wireframes</h2>
        <Button disabled className="bg-indigo-500 hover:bg-indigo-600 text-white">
          <Plus className="mr-2 h-4 w-4" />
          Add Wireframe
        </Button>
      </div>
      
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="bg-slate-100 dark:bg-slate-800">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="complete">Complete</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          <TabsTrigger value="planned">Planned</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="space-y-0 overflow-hidden border border-slate-700 rounded-md bg-slate-800">
                <div className="h-6 w-full bg-indigo-600"></div>
                <div className="p-4 bg-indigo-900/40">
                  <Skeleton className="h-5 w-3/4 rounded-md bg-slate-700 mb-2" />
                  <Skeleton className="h-4 w-full rounded-md bg-slate-700 mb-2" />
                  <Skeleton className="h-4 w-full rounded-md bg-slate-700 mb-3" />
                    </div>
                <div className="p-4">
                  <div className="flex gap-2 mb-3">
                    <Skeleton className="h-6 w-20 rounded-full bg-slate-700" />
                    <Skeleton className="h-6 w-20 rounded-full bg-slate-700" />
                    <Skeleton className="h-6 w-20 rounded-full bg-slate-700" />
                  </div>
                </div>
                <div className="p-4 flex justify-between bg-slate-900/50">
                  <Skeleton className="h-8 w-20 rounded-md bg-slate-700" />
                  <Skeleton className="h-8 w-20 rounded-md bg-slate-700" />
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );

  const ErrorContent = () => (
    <div className="p-8 text-center border rounded-lg border-amber-800 bg-amber-950/30">
      <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
      <h3 className="text-xl font-semibold mb-2 text-white">Error loading wireframes</h3>
      <p className="text-slate-300 mb-4">We couldn't load the wireframes. Please try again later.</p>
      <p className="text-red-400 mb-4 text-sm font-mono p-2 bg-red-950/30 rounded border border-red-800 max-w-md mx-auto">{error}</p>
      <Button onClick={handleRetry} className="bg-indigo-600 hover:bg-indigo-500 text-white">
        Retry
      </Button>
    </div>
  );

  const EmptyContent = () => (
    <div className="p-8 text-center border rounded-lg border-slate-700 bg-slate-800/50">
      <FileIcon className="h-12 w-12 text-slate-400 mx-auto mb-4" />
      <h3 className="text-xl font-semibold mb-2 text-white">No wireframes found</h3>
      <p className="text-slate-300 mb-6">Get started by creating your first wireframe</p>
      <Button className="bg-indigo-600 hover:bg-indigo-500 text-white">
        <Plus className="mr-2 h-4 w-4" />
        Create Wireframe
      </Button>
    </div>
  );

  const NormalContent = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Wireframes ({wireframes?.length || 0})</h2>
        <Button className="bg-indigo-600 hover:bg-indigo-500 text-white">
          <Plus className="mr-2 h-4 w-4" />
          Add Wireframe
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="bg-slate-100 dark:bg-slate-800">
          <TabsTrigger value="all">All ({wireframes?.length || 0})</TabsTrigger>
          <TabsTrigger value="complete">Complete ({complete.length})</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress ({inProgress.length})</TabsTrigger>
          <TabsTrigger value="planned">Planned ({planned.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wireframes?.map((wireframe) => (
              <WireframeCard
                key={wireframe.id}
                wireframe={wireframe}
                projectId={projectId || 'ubahcrypt'}
                isActive={wireframe.id === activeWireframeId}
                onClick={() => setActiveWireframeId(wireframe.id)}
              />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="complete" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {complete.map((wireframe) => (
              <WireframeCard
                key={wireframe.id}
                wireframe={wireframe}
                projectId={projectId || 'ubahcrypt'}
                isActive={wireframe.id === activeWireframeId}
                onClick={() => setActiveWireframeId(wireframe.id)}
              />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="in-progress" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {inProgress.map((wireframe) => (
              <WireframeCard
                key={wireframe.id}
                wireframe={wireframe}
                projectId={projectId || 'ubahcrypt'}
                isActive={wireframe.id === activeWireframeId}
                onClick={() => setActiveWireframeId(wireframe.id)}
              />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="planned" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {planned.map((wireframe) => (
              <WireframeCard
                key={wireframe.id}
                wireframe={wireframe}
                projectId={projectId || 'ubahcrypt'}
                isActive={wireframe.id === activeWireframeId}
                onClick={() => setActiveWireframeId(wireframe.id)}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );

  // Render the correct content based on state
  return (
    <>
      {contentType === 'loading' && <LoadingContent />}
      {contentType === 'error' && <ErrorContent />}
      {contentType === 'empty' && <EmptyContent />}
      {contentType === 'normal' && <NormalContent />}
    </>
  );
}
