import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { api, type UsageStats } from '../lib/api';
import { 
  DollarSign, 
  Activity, 
  TrendingUp, 
  Loader2, 
  BarChart3,
  FileText,
  Calendar,
  Filter,
  ChevronLeft,
  ChevronRight,
  Briefcase
} from 'lucide-react';

interface UsageDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UsageDashboardModal({ isOpen, onClose }: UsageDashboardModalProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [selectedDateRange, setSelectedDateRange] = useState<'7d' | '30d' | 'all'>('7d');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (isOpen) {
      loadUsageStats();
    }
  }, [isOpen, selectedDateRange]);

  const loadUsageStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let statsData: UsageStats;
      if (selectedDateRange === 'all') {
        statsData = await api.getUsageStats();
      } else {
        const endDate = new Date();
        const startDate = new Date();
        const days = selectedDateRange === '7d' ? 7 : 30;
        startDate.setDate(startDate.getDate() - days);
        
        statsData = await api.getUsageByDateRange(
          startDate.toISOString(),
          endDate.toISOString()
        );
      }
      
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load usage stats:', err);
      setError('Failed to load usage statistics');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    }).format(amount);
  };

  const formatTokens = (num: number): string => {
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

  const getModelDisplayName = (model: string): string => {
    const modelMap: Record<string, string> = {
      "claude-4-opus": "Opus 4",
      "claude-4-sonnet": "Sonnet 4", 
      "claude-3.5-sonnet": "Sonnet 3.5",
      "claude-3-opus": "Opus 3",
    };
    return modelMap[model] || model;
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'models', label: 'By Model' },
    { id: 'projects', label: 'By Project' },
    { id: 'timeline', label: 'Timeline' }
  ];

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Claude Usage Dashboard"
      className="max-w-6xl h-[90vh]"
    >
      <div className="flex flex-col h-full">
        {/* Header with filters */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Track your Claude Code usage and costs
              </p>
            </div>
            
            {/* Date Range Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <div className="flex space-x-1">
                {(['7d', '30d', 'all'] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => setSelectedDateRange(range)}
                    className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                      selectedDateRange === range
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                    disabled={loading}
                  >
                    {range === 'all' ? 'All Time' : range === '7d' ? 'Last 7 Days' : 'Last 30 Days'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <p className="text-red-600 dark:text-red-400">{error}</p>
              <button
                onClick={loadUsageStats}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : stats ? (
            <div className="p-6 space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Cost</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {formatCurrency(stats.total_cost)}
                  </p>
                  <p className="text-xs text-gray-500">Across all sessions</p>
                </div>

                <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="h-4 w-4 text-blue-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Sessions</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {formatNumber(stats.total_sessions)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatCurrency(stats.total_cost / stats.total_sessions)} avg/session
                  </p>
                </div>

                <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-purple-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Tokens</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {formatTokens(stats.total_tokens)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatCurrency(stats.total_cost / stats.total_tokens * 1000)}/K tokens
                  </p>
                </div>

                <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-500/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-orange-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Cache Efficiency</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {Math.round((stats.total_cache_read_tokens / (stats.total_cache_creation_tokens + stats.total_cache_read_tokens)) * 100)}%
                  </p>
                  <p className="text-xs text-gray-500">Cache read ratio</p>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex space-x-8">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === tab.id
                          ? 'border-blue-600 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Token Breakdown */}
                  <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Token Breakdown</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Input Tokens</span>
                        <span className="font-semibold">{formatTokens(stats.total_input_tokens)}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(stats.total_input_tokens / stats.total_tokens) * 100}%` }}
                        />
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Output Tokens</span>
                        <span className="font-semibold">{formatTokens(stats.total_output_tokens)}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${(stats.total_output_tokens / stats.total_tokens) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Top Models */}
                  <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Most Used Models</h3>
                    <div className="space-y-3">
                      {stats.by_model.slice(0, 3).map((model) => (
                        <div key={model.model} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded">
                              {getModelDisplayName(model.model)}
                            </span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {model.session_count} sessions
                            </span>
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {formatCurrency(model.total_cost)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'models' && (
                <div className="space-y-4">
                  {stats.by_model.map((model) => (
                    <div key={model.model} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded">
                            {getModelDisplayName(model.model)}
                          </span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {model.session_count} sessions
                          </span>
                        </div>
                        <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                          {formatCurrency(model.total_cost)}
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Input: </span>
                          <span className="font-medium">{formatTokens(model.input_tokens)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Output: </span>
                          <span className="font-medium">{formatTokens(model.output_tokens)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Cache W: </span>
                          <span className="font-medium">{formatTokens(model.cache_creation_tokens)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Cache R: </span>
                          <span className="font-medium">{formatTokens(model.cache_read_tokens)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'projects' && (
                <div className="space-y-3">
                  {stats.by_project.map((project) => (
                    <div key={project.project_path} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {project.project_name}
                          </span>
                          <div className="flex items-center space-x-3 mt-1">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {project.session_count} sessions
                            </span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {formatTokens(project.total_tokens)} tokens
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900 dark:text-gray-100">
                            {formatCurrency(project.total_cost)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatCurrency(project.total_cost / project.session_count)}/session
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'timeline' && (
                <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <span>Daily Usage</span>
                  </h3>
                  {stats.by_date.length > 0 ? (
                    <div className="space-y-3">
                      {stats.by_date.slice().reverse().map((day) => (
                        <div key={day.date} className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg">
                          <div>
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              {new Date(day.date).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </div>
                            <div className="text-sm text-gray-500">
                              {formatTokens(day.total_tokens)} tokens • {day.models_used.length} model{day.models_used.length !== 1 ? 's' : ''}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-gray-900 dark:text-gray-100">
                              {formatCurrency(day.total_cost)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No usage data available for the selected period
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500">No usage data available</p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}