
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FeatureErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function FeatureErrorState({ message, onRetry }: FeatureErrorStateProps) {
  return (
    <div className="bg-black/30 border border-red-500/20 rounded-lg p-6 text-center">
      <AlertCircle className="h-10 w-10 text-red-400 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-white mb-2">Error Loading Features</h3>
      <p className="text-gray-400 mb-4">
        {message || "We encountered a problem while loading your features. Please try again."}
      </p>
      {onRetry && (
        <Button 
          onClick={onRetry}
          variant="outline" 
          className="border-red-500/30 text-red-400 hover:bg-red-500/10"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      )}
    </div>
  );
}
