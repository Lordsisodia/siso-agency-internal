import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { api, type UsageStats } from '@/lib/claudia-api';
import { 
  DollarSign, 
  Activity, 
  TrendingUp, 
  Loader2, 
  BarChart3,
  FileText,
  Calendar,
  Eye
} from 'lucide-react';

interface ClaudeUsageWidgetProps {
  className?: string;
}

export function ClaudeUsageWidget({ className }: ClaudeUsageWidgetProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadUsageStats();
  }, []);

  const loadUsageStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const statsData = await api.getUsageStats();
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load usage stats:', err);
      setError('Failed to load usage data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrencyLocal = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    }).format(amount);
  };

  const formatTokensLocal = (num: number): string => {
    if (num >= 1_000_000) {
      return `${(num / 1_000_000).toFixed(2)}M`;
    } else if (num >= 1_000) {
      return `${(num / 1_000).toFixed(1)}K`;
    }
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  // Get top model for compact display
  const getTopModel = () => {
    if (!stats || !stats.by_model.length) return null;
    return stats.by_model.sort((a, b) => b.total_cost - a.total_cost)[0];
  };

  const getModelDisplayName = (model: string): string => {
    const modelMap: Record<string, string> = {
      "claude-4-opus": "Opus 4",
      "claude-4-sonnet": "Sonnet 4", 
      "claude-3.5-sonnet": "Sonnet 3.5",
      "claude-3-opus": "Opus 3",
    };
    return modelMap[model] || model;
  };

  const topModel = getTopModel();

  return (
    <>
      <Card className={`border-orange-500/20 bg-black backdrop-blur-sm ${className}`}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-orange-500" />
            Claude Usage
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
            </div>
          ) : error ? (
            <div className="text-center py-4">
              <p className="text-sm text-red-400 mb-2">{error}</p>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={loadUsageStats}
                className="text-xs"
              >
                Retry
              </Button>
            </div>
          ) : stats ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              {/* Cost Overview */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3 text-green-500" />
                    <span className="text-xs text-gray-400">Total Cost</span>
                  </div>
                  <p className="text-lg font-bold text-white">
                    {formatCurrencyLocal(stats.total_cost)}
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <Activity className="h-3 w-3 text-blue-500" />
                    <span className="text-xs text-gray-400">Sessions</span>
                  </div>
                  <p className="text-lg font-bold text-white">
                    {formatNumber(stats.total_sessions)}
                  </p>
                </div>
              </div>

              {/* Tokens */}
              <div className="space-y-2">
                <div className="flex items-center gap-1">
                  <FileText className="h-3 w-3 text-purple-500" />
                  <span className="text-xs text-gray-400">Total Tokens</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-white">
                    {formatTokensLocal(stats.total_tokens)}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {formatCurrencyLocal(stats.total_cost / stats.total_tokens * 1000)}/K
                  </Badge>
                </div>
                <Progress 
                  value={Math.min((stats.total_tokens / 10_000_000) * 100, 100)} 
                  className="h-1.5"
                />
              </div>

              {/* Top Model */}
              {topModel && (
                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-orange-500" />
                    <span className="text-xs text-gray-400">Primary Model</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-white">
                      {getModelDisplayName(topModel.model)}
                    </span>
                    <Badge className="text-xs bg-orange-500/20 text-orange-300">
                      {formatCurrencyLocal(topModel.total_cost)}
                    </Badge>
                  </div>
                </div>
              )}

              {/* View Details Button */}
              <Button 
                variant="outline"
                size="sm"
                onClick={() => setShowModal(true)}
                className="w-full mt-3 bg-gradient-to-r from-orange-500/10 to-orange-600/10 border-orange-500/30 text-orange-300 hover:bg-orange-500/20"
              >
                <Eye className="h-3 w-3 mr-2" />
                View Details
              </Button>
            </motion.div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-gray-400">No usage data available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Usage Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden bg-black border-orange-500/20">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-orange-500" />
              Claude Usage Dashboard
            </DialogTitle>
          </DialogHeader>
          
          <div className="overflow-y-auto">
            {stats && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6 p-1"
              >
                {/* Detailed Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-gray-400">Total Cost</span>
                    </div>
                    <p className="text-xl font-bold text-white">{formatCurrencyLocal(stats.total_cost)}</p>
                    <p className="text-xs text-gray-500">Across all sessions</p>
                  </div>

                  <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="h-4 w-4 text-blue-500" />
                      <span className="text-sm text-gray-400">Sessions</span>
                    </div>
                    <p className="text-xl font-bold text-white">{formatNumber(stats.total_sessions)}</p>
                    <p className="text-xs text-gray-500">
                      {formatCurrencyLocal(stats.total_cost / stats.total_sessions)} avg/session
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4 text-purple-500" />
                      <span className="text-sm text-gray-400">Input Tokens</span>
                    </div>
                    <p className="text-xl font-bold text-white">{formatTokensLocal(stats.total_input_tokens)}</p>
                    <p className="text-xs text-gray-500">
                      {((stats.total_input_tokens / stats.total_tokens) * 100).toFixed(1)}% of total
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-500/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-orange-500" />
                      <span className="text-sm text-gray-400">Output Tokens</span>
                    </div>
                    <p className="text-xl font-bold text-white">{formatTokensLocal(stats.total_output_tokens)}</p>
                    <p className="text-xs text-gray-500">
                      {((stats.total_output_tokens / stats.total_tokens) * 100).toFixed(1)}% of total
                    </p>
                  </div>
                </div>

                {/* Models Breakdown */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-white">Usage by Model</h3>
                  <div className="space-y-2">
                    {stats.by_model.map((model) => (
                      <div key={model.model} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg border border-gray-700/50">
                        <div className="flex items-center gap-3">
                          <Badge className="bg-orange-500/20 text-orange-300">
                            {getModelDisplayName(model.model)}
                          </Badge>
                          <span className="text-sm text-gray-400">
                            {formatNumber(model.session_count)} sessions
                          </span>
                        </div>
                        <div className="text-right space-y-1">
                          <p className="text-sm font-semibold text-white">
                            {formatCurrencyLocal(model.total_cost)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatTokensLocal(model.total_tokens)} tokens
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Projects */}
                {stats.by_project.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-white">Recent Projects</h3>
                    <div className="space-y-2">
                      {stats.by_project.slice(0, 5).map((project) => (
                        <div key={project.project_path} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg border border-gray-700/50">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                              {project.project_name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatNumber(project.session_count)} sessions • Last used {new Date(project.last_used).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-white">
                              {formatCurrencyLocal(project.total_cost)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatTokensLocal(project.total_tokens)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}