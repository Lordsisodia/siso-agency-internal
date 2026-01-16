import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Lightbulb,
  Target,
  Clock,
  BarChart3,
  Zap,
  ChevronRight,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SmartInsight {
  id: string;
  type: 'optimization' | 'pattern' | 'prediction' | 'anomaly' | 'opportunity';
  title: string;
  description: string;
  confidence: number;
  actionable: boolean;
  recommendations: string[];
  timestamp: Date;
}

interface SmartInsightsPanelProps {
  className?: string;
}

export const SmartInsightsPanel: React.FC<SmartInsightsPanelProps> = ({ className }) => {
  const [insights, setInsights] = useState<SmartInsight[]>([]);
  const [expandedInsight, setExpandedInsight] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadInsights();
    
    // Refresh insights every 2 minutes
    const interval = setInterval(loadInsights, 120000);
    return () => clearInterval(interval);
  }, [loadInsights]);

  const loadInsights = useCallback(async () => {
    setIsLoading(true);
    try {
      const { intelligentAgentCore } = await import('@/services/intelligentAgentCore');
      const allInsights = intelligentAgentCore.getAllInsights();
      
      // Convert to our interface format
      const formattedInsights: SmartInsight[] = allInsights.map(insight => ({
        id: insight.id,
        type: insight.type,
        title: insight.title,
        description: insight.description,
        confidence: insight.confidence,
        actionable: insight.actionable,
        recommendations: insight.recommendations,
        timestamp: insight.timestamp
      }));

      setInsights(formattedInsights.slice(0, 10)); // Show top 10 insights
    } catch (error) {
      console.error('Failed to load insights:', error);
      // Mock insights for demo
      setInsights(generateMockInsights());
    } finally {
      setIsLoading(false);
    }
  }, []);

  const generateMockInsights = (): SmartInsight[] => {
    return [
      {
        id: '1',
        type: 'optimization',
        title: 'Agent Performance Optimization',
        description: 'API Monitor agent showing 15% efficiency drop. Rate limiting detected.',
        confidence: 0.92,
        actionable: true,
        recommendations: ['Increase API rate limits', 'Implement request batching', 'Add retry logic'],
        timestamp: new Date(Date.now() - 10 * 60 * 1000)
      },
      {
        id: '2',
        type: 'pattern',
        title: 'Communication Peak Detected',
        description: 'WhatsApp activity increases 300% between 2-4 PM daily.',
        confidence: 0.88,
        actionable: true,
        recommendations: ['Schedule auto-replies during peak hours', 'Pre-process routine responses'],
        timestamp: new Date(Date.now() - 30 * 60 * 1000)
      },
      {
        id: '3',
        type: 'prediction',
        title: 'System Resource Prediction',
        description: 'Memory usage trending upward. 90% capacity predicted in 4 hours.',
        confidence: 0.78,
        actionable: true,
        recommendations: ['Scale memory allocation', 'Clear unnecessary caches', 'Restart memory-intensive services'],
        timestamp: new Date(Date.now() - 45 * 60 * 1000)
      },
      {
        id: '4',
        type: 'opportunity',
        title: 'Automation Opportunity',
        description: 'Detected 12 repetitive manual tasks that could be automated.',
        confidence: 0.85,
        actionable: true,
        recommendations: ['Create automation workflows', 'Set up task templates', 'Implement batch processing'],
        timestamp: new Date(Date.now() - 60 * 60 * 1000)
      }
    ];
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'optimization': return <Target className="h-4 w-4" />;
      case 'pattern': return <TrendingUp className="h-4 w-4" />;
      case 'prediction': return <BarChart3 className="h-4 w-4" />;
      case 'anomaly': return <AlertTriangle className="h-4 w-4" />;
      case 'opportunity': return <Lightbulb className="h-4 w-4" />;
      default: return <Sparkles className="h-4 w-4" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'optimization': return 'text-purple-400 bg-purple-400/20 border-purple-500/30';
      case 'pattern': return 'text-blue-400 bg-blue-400/20 border-blue-500/30';
      case 'prediction': return 'text-amber-400 bg-amber-400/20 border-amber-500/30';
      case 'anomaly': return 'text-red-400 bg-red-400/20 border-red-500/30';
      case 'opportunity': return 'text-green-400 bg-green-400/20 border-green-500/30';
      default: return 'text-gray-400 bg-gray-400/20 border-gray-500/30';
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <Card className={cn("bg-gray-900/80 border-gray-700/50", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Brain className="h-4 w-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg text-white">Smart Insights</CardTitle>
              <p className="text-xs text-gray-400">AI-generated recommendations</p>
            </div>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={loadInsights}
            disabled={isLoading}
            className="text-gray-400 hover:text-white"
          >
            {isLoading ? (
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Zap className="h-4 w-4" />
              </motion.div>
            ) : (
              <Zap className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="text-center py-8 text-gray-400">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="inline-block"
            >
              <Brain className="h-8 w-8 mb-2" />
            </motion.div>
            <p>Analyzing systems...</p>
          </div>
        ) : insights.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Sparkles className="h-8 w-8 mx-auto mb-2" />
            <p>No insights available</p>
          </div>
        ) : (
          <AnimatePresence>
            {insights.map((insight, index) => (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "border rounded-lg p-3 cursor-pointer transition-all duration-200",
                  getInsightColor(insight.type),
                  expandedInsight === insight.id ? "ring-1 ring-current" : "hover:bg-opacity-30"
                )}
                onClick={() => setExpandedInsight(
                  expandedInsight === insight.id ? null : insight.id
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="mt-0.5">
                      {getInsightIcon(insight.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="text-sm font-medium text-white truncate">
                          {insight.title}
                        </h4>
                        <Badge 
                          variant="outline" 
                          className="text-xs border-current/50"
                        >
                          {Math.round(insight.confidence * 100)}%
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-300 leading-relaxed">
                        {insight.description}
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge 
                          variant="outline" 
                          className="text-xs capitalize border-current/30"
                        >
                          {insight.type}
                        </Badge>
                        <div className="flex items-center space-x-1 text-xs text-gray-400">
                          <Clock className="h-3 w-3" />
                          <span>{formatTimeAgo(insight.timestamp)}</span>
                        </div>
                        {insight.actionable && (
                          <Badge className="text-xs bg-green-500/20 text-green-300 border-green-500/40">
                            Actionable
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="ml-2 mt-0.5">
                    {expandedInsight === insight.id ? (
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </div>
                
                <AnimatePresence>
                  {expandedInsight === insight.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="mt-3 pt-3 border-t border-current/20"
                    >
                      <h5 className="text-xs font-medium text-white mb-2">
                        Recommended Actions:
                      </h5>
                      <ul className="space-y-1">
                        {insight.recommendations.map((rec, idx) => (
                          <li key={idx} className="text-xs text-gray-300 flex items-start space-x-2">
                            <span className="text-current mt-0.5">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </CardContent>
    </Card>
  );
};

export default SmartInsightsPanel;