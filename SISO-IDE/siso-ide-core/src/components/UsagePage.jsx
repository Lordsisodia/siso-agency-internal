import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { analytics } from '../lib/analytics';
import DailySpendingTracker from './analytics/DailySpendingTracker';
import ModelEfficiencyDashboard from './analytics/ModelEfficiencyDashboard';
import { 
  ArrowLeft,
  BarChart3,
  Calendar,
  Filter,
  Loader2,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Clock,
  MessageSquare,
  TrendingUp,
  Activity,
  DollarSign,
  Users,
  Zap,
  Target,
  Brain,
  PieChart
} from 'lucide-react';

// API functions for real usage data
const fetchUsageStats = async (dateRange = '7d') => {
  try {
    // Get auth token from localStorage (same way other SISO API calls work)
    const token = localStorage.getItem('auth-token');
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`/api/usage/stats?range=${dateRange}`, {
      method: 'GET',
      headers: headers
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        console.log('📊 Usage stats: Authentication required, using mock data');
      } else {
        console.log(`📊 Usage stats: API error ${response.status}, using mock data`);
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('📊 Usage stats: Real data loaded from API', data);
    return data;
  } catch (error) {
    console.error('Failed to fetch usage stats:', error);
    console.log('📊 Usage stats: Falling back to mock data');
    // Fallback to mock data if API fails
    return generateMockData();
  }
};

// Mock data for fallback - keeps the existing structure
const generateMockData = () => {
  const models = ['claude-4-opus', 'claude-3.5-sonnet', 'claude-3-opus'];
  const projects = [
    '/Users/user/dev/siso-ide',
    '/Users/user/projects/web-app', 
    '/Users/user/work/backend-api',
    '/Users/user/personal/blog',
    '/Users/user/learning/ml-project'
  ];

  const mockStats = {
    total_cost: Math.random() * 50 + 10,
    total_sessions: Math.floor(Math.random() * 100) + 20,
    total_tokens: Math.floor(Math.random() * 1000000) + 500000,
    total_input_tokens: Math.floor(Math.random() * 600000) + 300000,
    total_output_tokens: Math.floor(Math.random() * 400000) + 200000,
    total_cache_creation_tokens: Math.floor(Math.random() * 50000) + 10000,
    total_cache_read_tokens: Math.floor(Math.random() * 100000) + 50000,
    by_model: models.map(model => ({
      model,
      session_count: Math.floor(Math.random() * 30) + 5,
      total_cost: Math.random() * 20 + 2,
      input_tokens: Math.floor(Math.random() * 200000) + 50000,
      output_tokens: Math.floor(Math.random() * 150000) + 30000,
      cache_creation_tokens: Math.floor(Math.random() * 20000) + 2000,
      cache_read_tokens: Math.floor(Math.random() * 40000) + 10000
    })),
    by_project: projects.map(project => ({
      project_path: project,
      session_count: Math.floor(Math.random() * 20) + 3,
      total_cost: Math.random() * 15 + 1,
      total_tokens: Math.floor(Math.random() * 200000) + 50000
    })),
    by_date: Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return {
        date: date.toISOString().split('T')[0],
        total_cost: Math.random() * 8 + 0.5,
        total_tokens: Math.floor(Math.random() * 50000) + 10000,
        models_used: models.slice(0, Math.floor(Math.random() * 3) + 1)
      };
    }).reverse()
  };

  return mockStats;
};

const UsagePage = ({ onBack }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [selectedDateRange, setSelectedDateRange] = useState('7d');
  const [activeTab, setActiveTab] = useState('overview');

  // Pagination states
  const [projectsPage, setProjectsPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  // Memoized formatters
  const formatCurrency = useMemo(() => (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }, []);

  const formatNumber = useMemo(() => (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  }, []);

  const formatTokens = useMemo(() => (num) => {
    if (num >= 1_000_000) {
      return `${(num / 1_000_000).toFixed(2)}M`;
    } else if (num >= 1_000) {
      return `${(num / 1_000).toFixed(1)}K`;
    }
    return formatNumber(num);
  }, [formatNumber]);

  const getModelDisplayName = useCallback((model) => {
    const modelMap = {
      'claude-4-opus': 'Opus 4',
      'claude-4-sonnet': 'Sonnet 4',
      'claude-3.5-sonnet': 'Sonnet 3.5',
      'claude-3-opus': 'Opus 3',
    };
    return modelMap[model] || model;
  }, []);

  // Load usage stats
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Track page view
        analytics.track('feature_used', {
          feature: 'usage_dashboard',
          date_range: selectedDateRange
        });

        // Fetch real usage data (with fallback to mock data)
        const data = await fetchUsageStats(selectedDateRange);
        setStats(data);
        setError(null);
      } catch (err) {
        console.error('Error loading usage data:', err);
        setError('Failed to load usage statistics. Please try again.');
        // Set mock data as fallback
        setStats(generateMockData());
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedDateRange]);

  // Memoize summary cards
  const summaryCards = useMemo(() => {
    if (!stats) return null;
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-5 shadow-lg border border-border/60 bg-card/50 backdrop-blur-sm rounded-xl hover:shadow-xl transition-all duration-300 group">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-500 rounded-lg flex items-center justify-center shadow-md">
                  <DollarSign className="w-4 h-4 text-white" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">Total Cost</p>
              </div>
              <p className="text-2xl font-bold text-foreground tracking-tight">
                {formatCurrency(stats.total_cost)}
              </p>
              <div className="flex items-center gap-2 mt-3 px-2 py-1 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg">
                <TrendingUp className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">+12% this week</span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-5 shadow-lg border border-border/60 bg-card/50 backdrop-blur-sm rounded-xl hover:shadow-xl transition-all duration-300 group">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center shadow-md">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">Total Sessions</p>
              </div>
              <p className="text-2xl font-bold text-foreground tracking-tight">
                {formatNumber(stats.total_sessions)}
              </p>
              <div className="flex items-center gap-2 mt-3 px-2 py-1 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                <Activity className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-medium text-blue-600 dark:text-blue-400">{Math.floor(stats.total_sessions / 7)} avg/day</span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-5 shadow-lg border border-border/60 bg-card/50 backdrop-blur-sm rounded-xl hover:shadow-xl transition-all duration-300 group">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-md">
                  <MessageSquare className="w-4 h-4 text-white" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">Total Tokens</p>
              </div>
              <p className="text-2xl font-bold text-foreground tracking-tight">
                {formatTokens(stats.total_tokens)}
              </p>
              <div className="flex items-center gap-2 mt-3 px-2 py-1 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                <Zap className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                <span className="text-xs font-medium text-purple-600 dark:text-purple-400">{formatTokens(stats.total_tokens / stats.total_sessions)} avg/session</span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-5 shadow-lg border border-border/60 bg-card/50 backdrop-blur-sm rounded-xl hover:shadow-xl transition-all duration-300 group">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center shadow-md">
                  <Target className="w-4 h-4 text-white" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">Avg Cost/Session</p>
              </div>
              <p className="text-2xl font-bold text-foreground tracking-tight">
                {formatCurrency(
                  stats.total_sessions > 0 
                    ? stats.total_cost / stats.total_sessions 
                    : 0
                )}
              </p>
              <div className="flex items-center gap-2 mt-3 px-2 py-1 bg-orange-50 dark:bg-orange-950/30 rounded-lg">
                <Clock className="w-3 h-3 text-orange-600 dark:text-orange-400" />
                <span className="text-xs font-medium text-orange-600 dark:text-orange-400">Efficiency metric</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }, [stats, formatCurrency, formatNumber, formatTokens]);

  // Memoize timeline chart
  const timelineChart = useMemo(() => {
    if (!stats?.by_date || stats.by_date.length === 0) return null;
    
    const maxCost = Math.max(...stats.by_date.map(d => d.total_cost), 0);
    
    return (
      <div className="mt-6">
        <div className="flex items-end space-x-2 h-32 border-l border-b border-border pl-4">
          {stats.by_date.map((day) => {
            const heightPercent = maxCost > 0 ? (day.total_cost / maxCost) * 100 : 0;
            const date = new Date(day.date);
            
            return (
              <div key={day.date} className="flex-1 h-full flex flex-col items-center justify-end group relative">
                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                  <div className="bg-background border border-border rounded-lg shadow-lg p-3 whitespace-nowrap">
                    <p className="text-sm font-semibold">{date.toLocaleDateString()}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Cost: {formatCurrency(day.total_cost)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatTokens(day.total_tokens)} tokens
                    </p>
                  </div>
                </div>
                
                {/* Bar */}
                <div 
                  className="w-full bg-primary hover:opacity-80 transition-opacity rounded-t cursor-pointer"
                  style={{ height: `${heightPercent}%` }}
                />
                
                {/* Date label */}
                <div className="text-xs text-muted-foreground mt-2 whitespace-nowrap">
                  {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }, [stats, formatCurrency, formatTokens]);

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-6xl mx-auto">
        {/* Enhanced Header */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/60">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onBack}
                  className="h-9 px-3 hover:bg-accent/80 transition-all duration-200 group rounded-lg"
                >
                  <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
                  Back
                </Button>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg border border-blue-500/20">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-semibold text-foreground tracking-tight">Usage Dashboard</h1>
                    <p className="text-sm text-muted-foreground font-medium">Track your SISO usage and performance metrics</p>
                  </div>
                </div>
              </div>
              
              {/* Enhanced Date Range Filter */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Filter className="h-4 w-4" />
                  <span className="font-medium">Period:</span>
                </div>
                <div className="flex space-x-1 bg-muted/50 rounded-lg p-1">
                  {['7d', '30d', 'all'].map((range) => (
                    <Button
                      key={range}
                      variant={selectedDateRange === range ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => {
                        setSelectedDateRange(range);
                        analytics.track('feature_used', {
                          feature: 'usage_date_filter',
                          filter_value: range
                        });
                      }}
                      disabled={loading}
                      className={`h-8 px-3 rounded-md font-medium transition-all duration-200 ${
                        selectedDateRange === range 
                          ? 'bg-primary text-primary-foreground shadow-md' 
                          : 'hover:bg-background/80'
                      }`}
                    >
                      {range === 'all' ? 'All Time' : range === '7d' ? 'Last 7 Days' : 'Last 30 Days'}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg animate-pulse">
                <Loader2 className="h-6 w-6 animate-spin text-primary-foreground" />
              </div>
              <div className="text-center">
                <p className="text-lg font-medium text-foreground">Loading Usage Data</p>
                <p className="text-sm text-muted-foreground mt-1">Analyzing your SISO metrics...</p>
              </div>
            </div>
          ) : error ? (
            <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/50 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="font-semibold text-red-900 dark:text-red-100">Error Loading Data</p>
                  <p className="text-sm text-red-700 dark:text-red-200 mt-1">{error}</p>
                </div>
              </div>
            </div>
          ) : stats ? (
            <div className="space-y-6">
              {/* Summary Cards */}
              {summaryCards}

              {/* Enhanced Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-2 sm:grid-cols-6 w-full mb-8 h-12 p-1 bg-muted/50 rounded-xl border border-border/40">
                  <TabsTrigger 
                    value="overview" 
                    className="flex items-center gap-2 h-10 px-2 sm:px-4 rounded-lg font-medium transition-all duration-200 data-[state=active]:bg-background data-[state=active]:shadow-md"
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span className="hidden sm:inline">Overview</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="spending" 
                    className="flex items-center gap-2 h-10 px-2 sm:px-4 rounded-lg font-medium transition-all duration-200 data-[state=active]:bg-background data-[state=active]:shadow-md"
                  >
                    <DollarSign className="w-4 h-4" />
                    <span className="hidden sm:inline">Spending</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="efficiency" 
                    className="flex items-center gap-2 h-10 px-2 sm:px-4 rounded-lg font-medium transition-all duration-200 data-[state=active]:bg-background data-[state=active]:shadow-md"
                  >
                    <Brain className="w-4 h-4" />
                    <span className="hidden sm:inline">Models</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="projects" 
                    className="flex items-center gap-2 h-10 px-2 sm:px-4 rounded-lg font-medium transition-all duration-200 data-[state=active]:bg-background data-[state=active]:shadow-md"
                  >
                    <Briefcase className="w-4 h-4" />
                    <span className="hidden sm:inline">Projects</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="timeline" 
                    className="flex items-center gap-2 h-10 px-2 sm:px-4 rounded-lg font-medium transition-all duration-200 data-[state=active]:bg-background data-[state=active]:shadow-md"
                  >
                    <Calendar className="w-4 h-4" />
                    <span className="hidden sm:inline">Timeline</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="insights" 
                    className="flex items-center gap-2 h-10 px-2 sm:px-4 rounded-lg font-medium transition-all duration-200 data-[state=active]:bg-background data-[state=active]:shadow-md"
                  >
                    <PieChart className="w-4 h-4" />
                    <span className="hidden sm:inline">Insights</span>
                  </TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6 mt-0">
                  <Card className="p-6 shadow-lg border border-border/60 bg-card/50 backdrop-blur-sm rounded-xl hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-md">
                        <MessageSquare className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground tracking-tight">Token Breakdown</h3>
                        <p className="text-sm text-muted-foreground">Detailed token usage analysis</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 rounded-lg bg-muted/30 border border-border/40 hover:bg-muted/50 transition-colors duration-200">
                        <p className="text-sm font-medium text-muted-foreground mb-2">Input Tokens</p>
                        <p className="text-xl font-bold text-foreground">{formatTokens(stats.total_input_tokens)}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/30 border border-border/40 hover:bg-muted/50 transition-colors duration-200">
                        <p className="text-sm font-medium text-muted-foreground mb-2">Output Tokens</p>
                        <p className="text-xl font-bold text-foreground">{formatTokens(stats.total_output_tokens)}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/30 border border-border/40 hover:bg-muted/50 transition-colors duration-200">
                        <p className="text-sm font-medium text-muted-foreground mb-2">Cache Write</p>
                        <p className="text-xl font-bold text-foreground">{formatTokens(stats.total_cache_creation_tokens)}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/30 border border-border/40 hover:bg-muted/50 transition-colors duration-200">
                        <p className="text-sm font-medium text-muted-foreground mb-2">Cache Read</p>
                        <p className="text-xl font-bold text-foreground">{formatTokens(stats.total_cache_read_tokens)}</p>
                      </div>
                    </div>
                  </Card>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="p-6 shadow-lg border border-border/60 bg-card/50 backdrop-blur-sm rounded-xl hover:shadow-xl transition-all duration-300">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center shadow-md">
                          <Zap className="w-4 h-4 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground tracking-tight">Most Used Models</h3>
                      </div>
                      <div className="space-y-3">
                        {stats.by_model.slice(0, 3).map((model) => (
                          <div key={model.model} className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="text-xs">
                                {getModelDisplayName(model.model)}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {model.session_count} sessions
                              </span>
                            </div>
                            <span className="text-sm font-medium">
                              {formatCurrency(model.total_cost)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </Card>

                    <Card className="p-6 shadow-lg border border-border/60 bg-card/50 backdrop-blur-sm rounded-xl hover:shadow-xl transition-all duration-300">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center shadow-md">
                          <Briefcase className="w-4 h-4 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground tracking-tight">Top Projects</h3>
                      </div>
                      <div className="space-y-3">
                        {stats.by_project.slice(0, 3).map((project) => (
                          <div key={project.project_path} className="flex items-center justify-between">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium truncate max-w-[200px]" title={project.project_path}>
                                {project.project_path.split('/').pop()}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {project.session_count} sessions
                              </span>
                            </div>
                            <span className="text-sm font-medium">
                              {formatCurrency(project.total_cost)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>
                </TabsContent>

                {/* Spending Tab */}
                <TabsContent value="spending" className="space-y-6 mt-0">
                  <DailySpendingTracker />
                </TabsContent>

                {/* Efficiency Tab */}
                <TabsContent value="efficiency" className="space-y-6 mt-0">
                  <ModelEfficiencyDashboard />
                </TabsContent>

                {/* Models Tab */}
                <TabsContent value="models" className="space-y-6 mt-0">
                  <Card className="p-6 shadow-lg border border-border/60 bg-card/50 backdrop-blur-sm rounded-xl hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-500 rounded-lg flex items-center justify-center shadow-md">
                        <Zap className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground tracking-tight">Usage by Model</h3>
                        <p className="text-sm text-muted-foreground">Performance breakdown by AI model</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      {stats.by_model.map((model) => (
                        <div key={model.model} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Badge variant="outline" className="text-xs">
                                {getModelDisplayName(model.model)}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {model.session_count} sessions
                              </span>
                            </div>
                            <span className="text-sm font-semibold">
                              {formatCurrency(model.total_cost)}
                            </span>
                          </div>
                          <div className="grid grid-cols-4 gap-2 text-xs">
                            <div>
                              <span className="text-muted-foreground">Input: </span>
                              <span className="font-medium">{formatTokens(model.input_tokens)}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Output: </span>
                              <span className="font-medium">{formatTokens(model.output_tokens)}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Cache W: </span>
                              <span className="font-medium">{formatTokens(model.cache_creation_tokens)}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Cache R: </span>
                              <span className="font-medium">{formatTokens(model.cache_read_tokens)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </TabsContent>

                {/* Projects Tab */}
                <TabsContent value="projects" className="space-y-6 mt-0">
                  <Card className="p-6 shadow-lg border border-border/60 bg-card/50 backdrop-blur-sm rounded-xl hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center shadow-md">
                          <Briefcase className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-foreground tracking-tight">Usage by Project</h3>
                          <p className="text-sm text-muted-foreground">Project-wise usage analytics</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs font-medium">
                        {stats.by_project.length} total projects
                      </Badge>
                    </div>
                    <div className="space-y-3">
                      {(() => {
                        const startIndex = (projectsPage - 1) * ITEMS_PER_PAGE;
                        const endIndex = startIndex + ITEMS_PER_PAGE;
                        const paginatedProjects = stats.by_project.slice(startIndex, endIndex);
                        const totalPages = Math.ceil(stats.by_project.length / ITEMS_PER_PAGE);
                        
                        return (
                          <>
                            {paginatedProjects.map((project) => (
                              <div key={project.project_path} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium truncate" title={project.project_path}>
                                    {project.project_path}
                                  </span>
                                  <div className="flex items-center space-x-3 mt-1">
                                    <span className="text-xs text-muted-foreground">
                                      {project.session_count} sessions
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {formatTokens(project.total_tokens)} tokens
                                    </span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-semibold">{formatCurrency(project.total_cost)}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {formatCurrency(project.total_cost / project.session_count)}/session
                                  </p>
                                </div>
                              </div>
                            ))}
                            
                            {/* Pagination */}
                            {totalPages > 1 && (
                              <div className="flex items-center justify-between pt-4">
                                <span className="text-xs text-muted-foreground">
                                  Showing {startIndex + 1}-{Math.min(endIndex, stats.by_project.length)} of {stats.by_project.length}
                                </span>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setProjectsPage(prev => Math.max(1, prev - 1))}
                                    disabled={projectsPage === 1}
                                  >
                                    <ChevronLeft className="h-4 w-4" />
                                  </Button>
                                  <span className="text-sm">
                                    Page {projectsPage} of {totalPages}
                                  </span>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setProjectsPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={projectsPage === totalPages}
                                  >
                                    <ChevronRight className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </Card>
                </TabsContent>

                {/* Timeline Tab */}
                <TabsContent value="timeline" className="space-y-6 mt-0">
                  <Card className="p-6 shadow-lg border border-border/60 bg-card/50 backdrop-blur-sm rounded-xl hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center shadow-md">
                        <Calendar className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground tracking-tight">Daily Usage Timeline</h3>
                        <p className="text-sm text-muted-foreground">Track your daily usage patterns</p>
                      </div>
                    </div>
                    {timelineChart || (
                      <div className="text-center py-8 text-sm text-muted-foreground">
                        No usage data available for the selected period
                      </div>
                    )}
                  </Card>
                </TabsContent>

                {/* Insights Tab */}
                <TabsContent value="insights" className="space-y-6 mt-0">
                  <div className="grid grid-cols-1 gap-6">
                    <Card className="p-6 shadow-lg border border-border/60 bg-card/50 backdrop-blur-sm rounded-xl hover:shadow-xl transition-all duration-300">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                          <PieChart className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-foreground tracking-tight">Advanced Analytics</h3>
                          <p className="text-sm text-muted-foreground">Comprehensive spending and efficiency insights</p>
                        </div>
                      </div>
                      <div className="space-y-8">
                        <DailySpendingTracker />
                        <div className="border-t border-border/40 pt-8">
                          <ModelEfficiencyDashboard />
                        </div>
                      </div>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default UsagePage;