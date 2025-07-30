import React from 'react';

export const PageLoader = React.memo(function PageLoader() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto"></div>
        <p className="text-gray-300 text-sm">Loading...</p>
      </div>
    </div>
  );
});

export const ComponentLoader = React.memo(function ComponentLoader() {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="w-6 h-6 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin"></div>
    </div>
  );
});