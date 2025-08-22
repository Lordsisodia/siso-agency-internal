
import React from 'react';

export const LoadingFallback = ({ error }: { error?: Error }) => {
  return (
    <div className="flex items-center justify-center p-12">
      <div className="text-center">
        {error ? (
          <p className="text-red-400">Something went wrong loading this section</p>
        ) : (
          <p className="text-gray-400">Loading...</p>
        )}
      </div>
    </div>
  );
};
