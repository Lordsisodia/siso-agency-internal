import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, RefreshCw } from 'lucide-react';
import { checkAllSavedData, getDataSummary } from '@/utils/dataChecker';
import { cn } from '@/lib/utils';

export function DataViewer() {
  const [data, setData] = useState<any>(null);
  const [summary, setSummary] = useState<string>('');
  const [showRawData, setShowRawData] = useState(false);
  const [lastChecked, setLastChecked] = useState<string>('');

  const refreshData = () => {
    const savedData = checkAllSavedData();
    const dataSummary = getDataSummary();
    
    setData(savedData);
    setSummary(dataSummary);
    setLastChecked(new Date().toLocaleTimeString());
  };

  useEffect(() => {
    refreshData();
    
    // Auto-refresh every 5 seconds
    const interval = setInterval(refreshData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="bg-black/30 backdrop-blur-sm border border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
            🔍 Your Saved Data
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">
              Last checked: {lastChecked}
            </span>
            <Button
              onClick={refreshData}
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Summary View */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-white">📋 Data Summary:</h3>
          <pre className="text-xs text-gray-300 bg-black/20 p-3 rounded-lg whitespace-pre-wrap font-mono border border-white/10">
            {summary || 'No data found'}
          </pre>
        </div>

        {/* Toggle Raw Data */}
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setShowRawData(!showRawData)}
            size="sm"
            variant="outline"
            className="border-white/20 text-gray-300 hover:bg-white/10"
          >
            {showRawData ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {showRawData ? 'Hide' : 'Show'} Raw Data
          </Button>
        </div>

        {/* Raw Data View */}
        {showRawData && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-white">🛠 Raw Data:</h3>
            <pre className="text-xs text-gray-300 bg-black/40 p-3 rounded-lg overflow-auto max-h-96 whitespace-pre-wrap font-mono border border-white/10">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}

        {/* Storage Locations */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-white">💾 Storage Locations:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            {[
              'business-onboarding-data',
              'client-profile', 
              'workflow-completed-tasks',
              'plan-builder-data',
              'user-project-data',
              'generated-app-plans',
              'latest-app-plan'
            ].map(key => {
              const hasData = localStorage.getItem(key) !== null;
              return (
                <div 
                  key={key}
                  className={cn(
                    "p-2 rounded border",
                    hasData 
                      ? "bg-green-500/10 border-green-500/30 text-green-400" 
                      : "bg-gray-500/10 border-gray-500/30 text-gray-500"
                  )}
                >
                  {hasData ? '✅' : '❌'} {key}
                </div>
              );
            })}
          </div>
        </div>

        {/* Instructions */}
        <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-xs text-blue-300">
            💡 <strong>Tip:</strong> This shows all data saved in your browser's localStorage. 
            When you complete the onboarding, generate app plans, or any workflow tasks, the data appears here instantly!
          </p>
        </div>
      </CardContent>
    </Card>
  );
} 