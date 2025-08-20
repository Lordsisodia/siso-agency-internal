import React, { useState, useEffect, useRef } from 'react';
import { Clock, CheckCircle, AlertCircle, Loader } from 'lucide-react';

function ActivityFeed({ activities, className = '' }) {
  const feedRef = useRef(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // Auto-scroll to bottom when new activities arrive
  useEffect(() => {
    if (autoScroll && feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [activities, autoScroll]);

  const handleScroll = () => {
    if (feedRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = feedRef.current;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
      setAutoScroll(isAtBottom);
    }
  };

  const getActivityIcon = (activity) => {
    switch (activity.type) {
      case 'tool-started':
        return <span className="text-lg">{activity.icon}</span>;
      case 'tool-waiting':
        return <Loader className="w-4 h-4 animate-spin text-blue-500" />;
      case 'tool-completed':
        return activity.success 
          ? <CheckCircle className="w-4 h-4 text-green-500" />
          : <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'thinking-start':
        return <span className="text-lg">🧠</span>;
      case 'claude-thinking-start':
        return <Loader className="w-4 h-4 animate-spin text-purple-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getActivityColor = (activity) => {
    switch (activity.type) {
      case 'tool-started':
        return 'border-l-blue-500 bg-blue-50 dark:bg-blue-950';
      case 'tool-waiting':
        return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950';
      case 'tool-completed':
        return activity.success 
          ? 'border-l-green-500 bg-green-50 dark:bg-green-950'
          : 'border-l-red-500 bg-red-50 dark:bg-red-950';
      case 'thinking-start':
      case 'claude-thinking-start':
        return 'border-l-purple-500 bg-purple-50 dark:bg-purple-950';
      default:
        return 'border-l-gray-500 bg-gray-50 dark:bg-gray-950';
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  if (!activities || activities.length === 0) {
    return (
      <div className={`${className} flex items-center justify-center h-32 text-gray-500 dark:text-gray-400`}>
        <div className="text-center">
          <Clock className="w-6 h-6 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No activity yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className} bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg`}>
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Activity Feed
          {activities.length > 0 && (
            <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
              {activities.length}
            </span>
          )}
        </h3>
      </div>
      
      <div 
        ref={feedRef}
        onScroll={handleScroll}
        className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600"
      >
        <div className="p-2 space-y-2">
          {activities.map((activity, index) => (
            <div
              key={`${activity.timestamp}-${index}`}
              className={`border-l-4 p-3 rounded-r-md transition-all duration-200 ${getActivityColor(activity)}`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  {getActivityIcon(activity)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {activity.message}
                    </p>
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">
                      {formatTime(activity.timestamp)}
                    </span>
                  </div>
                  
                  {activity.tool && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Tool: {activity.tool}
                    </p>
                  )}
                  
                  {activity.result && (
                    <div className="mt-2 text-xs">
                      <details className="cursor-pointer">
                        <summary className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
                          View result
                        </summary>
                        <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded text-gray-800 dark:text-gray-200 whitespace-pre-wrap text-xs max-h-32 overflow-y-auto">
                          {typeof activity.result === 'string' ? activity.result : JSON.stringify(activity.result, null, 2)}
                        </pre>
                      </details>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {!autoScroll && (
        <div className="p-2 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => {
              setAutoScroll(true);
              if (feedRef.current) {
                feedRef.current.scrollTop = feedRef.current.scrollHeight;
              }
            }}
            className="w-full text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 py-1"
          >
            ↓ Scroll to latest activity
          </button>
        </div>
      )}
    </div>
  );
}

export default ActivityFeed;