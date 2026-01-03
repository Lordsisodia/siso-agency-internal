import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { api, type UsageStats, type ProjectUsage } from "@/lib/claudia-api";
import { 
  ArrowLeft, 
  TrendingUp, 
  Calendar, 
  Filter,
  Loader2,
  DollarSign,
  Activity,
  FileText,
  Briefcase
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RealUsageDashboardProps {
  /**
   * Callback when back button is clicked
   */
  onBack: () => void;
}

/**
 * RealUsageDashboard component - Displays Claude API usage statistics and costs
 * This is the REAL component from Claudia, adapted for the agency dashboard
 * 
 * @example
 * <RealUsageDashboard onBack={() => setShowModal(false)} />
 */
export const RealUsageDashboard: React.FC<RealUsageDashboardProps> = ({ onBack }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [sessionStats, setSessionStats] = useState<ProjectUsage[] | null>(null);
  const [selectedDateRange, setSelectedDateRange] = useState<"all" | "7d" | "30d">("all");
  const [activeTab, setActiveTab] = useState("overview");

  const loadUsageStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let statsData: UsageStats;
      let sessionData: ProjectUsage[];
      
      if (selectedDateRange === "all") {
        statsData = await api.getUsageStats();
        sessionData = await api.getSessionStats();
      } else {
        const endDate = new Date();
        const startDate = new Date();
        const days = selectedDateRange === "7d" ? 7 : 30;
        startDate.setDate(startDate.getDate() - days);
        
        const formatDateForApi = (date: Date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}${month}${day}`;
        }

        statsData = await api.getUsageByDateRange(
          startDate.toISOString(),
          endDate.toISOString()
        );
        sessionData = await api.getSessionStats(
            formatDateForApi(startDate),
            formatDateForApi(endDate),
            'desc'
        );
      }
      
      setStats(statsData);
      setSessionStats(sessionData);
    } catch (err) {
      console.error("Failed to load usage stats:", err);
      setError("Failed to load usage statistics. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [selectedDateRange]);

  useEffect(() => {
    loadUsageStats();
  }, [loadUsageStats]);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    }).format(amount);
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatTokens = (num: number): string => {
    if (num >= 1_000_000) {
      return `${(num / 1_000_000).toFixed(2)}M`;
    } else if (num >= 1_000) {
      return `${(num / 1_000).toFixed(1)}K`;
    }
    return formatNumber(num);
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

  const getModelColor = (model: string): string => {
    if (model.includes("opus")) return "text-purple-500";
    if (model.includes("sonnet")) return "text-blue-500";
    return "text-gray-500";
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="border-b border-orange-500/20 bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/60"
      >
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="h-8 w-8 text-white hover:bg-orange-500/20"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-white">Claude Usage Dashboard</h1>
              <p className="text-xs text-gray-400">
                Track your Claude Code usage and costs
              </p>
            </div>
          </div>
          
          {/* Date Range Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <div className="flex space-x-1">
              {(["all", "30d", "7d"] as const).map((range) => (
                <Button
                  key={range}
                  variant={selectedDateRange === range ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedDateRange(range)}
                  className={cn(
                    "text-xs",
                    selectedDateRange === range 
                      ? "bg-orange-500 text-white hover:bg-orange-600"
                      : "text-gray-300 hover:bg-orange-500/20"
                  )}
                >
                  {range === "all" ? "All Time" : range === "7d" ? "Last 7 Days" : "Last 30 Days"}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-4 bg-black">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500 mx-auto mb-4" />
              <p className="text-sm text-gray-400">Loading usage statistics...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <p className="text-sm text-red-400 mb-4">{error}</p>
              <Button onClick={loadUsageStats} size="sm" className="bg-orange-500 hover:bg-orange-600">
                Try Again
              </Button>
            </div>
          </div>
        ) : stats ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="max-w-6xl mx-auto space-y-6"
          >
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Total Cost Card */}
              <Card className="p-4 bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400">Total Cost</p>
                    <p className="text-2xl font-bold mt-1 text-white">
                      {formatCurrency(stats.total_cost)}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-500/20" />
                </div>
              </Card>

              {/* Total Sessions Card */}
              <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400">Total Sessions</p>
                    <p className="text-2xl font-bold mt-1 text-white">
                      {formatNumber(stats.total_sessions)}
                    </p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-500/20" />
                </div>
              </Card>

              {/* Total Tokens Card */}
              <Card className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400">Total Tokens</p>
                    <p className="text-2xl font-bold mt-1 text-white">
                      {formatTokens(stats.total_tokens)}
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-purple-500/20" />
                </div>
              </Card>

              {/* Average Cost per Session Card */}
              <Card className="p-4 bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-500/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400">Avg Cost/Session</p>
                    <p className="text-2xl font-bold mt-1 text-white">
                      {formatCurrency(
                        stats.total_sessions > 0 
                          ? stats.total_cost / stats.total_sessions 
                          : 0
                      )}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-orange-500/20" />
                </div>
              </Card>
            </div>

            {/* Tabs for different views */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-5 bg-gray-900/50">
                <TabsTrigger value="overview" className="text-gray-300 data-[state=active]:bg-orange-500 data-[state=active]:text-white">Overview</TabsTrigger>
                <TabsTrigger value="models" className="text-gray-300 data-[state=active]:bg-orange-500 data-[state=active]:text-white">By Model</TabsTrigger>
                <TabsTrigger value="projects" className="text-gray-300 data-[state=active]:bg-orange-500 data-[state=active]:text-white">By Project</TabsTrigger>
                <TabsTrigger value="sessions" className="text-gray-300 data-[state=active]:bg-orange-500 data-[state=active]:text-white">By Session</TabsTrigger>
                <TabsTrigger value="timeline" className="text-gray-300 data-[state=active]:bg-orange-500 data-[state=active]:text-white">Timeline</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-4">
                <Card className="p-6 bg-gray-900/50 border-gray-700/50">
                  <h3 className="text-sm font-semibold mb-4 text-white">Token Breakdown</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-gray-400">Input Tokens</p>
                      <p className="text-lg font-semibold text-white">{formatTokens(stats.total_input_tokens)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Output Tokens</p>
                      <p className="text-lg font-semibold text-white">{formatTokens(stats.total_output_tokens)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Cache Write</p>
                      <p className="text-lg font-semibold text-white">{formatTokens(stats.total_cache_creation_tokens)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Cache Read</p>
                      <p className="text-lg font-semibold text-white">{formatTokens(stats.total_cache_read_tokens)}</p>
                    </div>
                  </div>
                </Card>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="p-6 bg-gray-900/50 border-gray-700/50">
                    <h3 className="text-sm font-semibold mb-4 text-white">Most Used Models</h3>
                    <div className="space-y-3">
                      {stats.by_model.slice(0, 3).map((model) => (
                        <div key={model.model} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className={cn("text-xs", getModelColor(model.model))}>
                              {getModelDisplayName(model.model)}
                            </Badge>
                            <span className="text-xs text-gray-400">
                              {model.session_count} sessions
                            </span>
                          </div>
                          <span className="text-sm font-medium text-white">
                            {formatCurrency(model.total_cost)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card className="p-6 bg-gray-900/50 border-gray-700/50">
                    <h3 className="text-sm font-semibold mb-4 text-white">Top Projects</h3>
                    <div className="space-y-3">
                      {stats.by_project.slice(0, 3).map((project) => (
                        <div key={project.project_path} className="flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium truncate max-w-[200px] text-white" title={project.project_path}>
                              {project.project_path}
                            </span>
                            <span className="text-xs text-gray-400">
                              {project.session_count} sessions
                            </span>
                          </div>
                          <span className="text-sm font-medium text-white">
                            {formatCurrency(project.total_cost)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </TabsContent>

              {/* Models Tab */}
              <TabsContent value="models">
                <Card className="p-6 bg-gray-900/50 border-gray-700/50">
                  <h3 className="text-sm font-semibold mb-4 text-white">Usage by Model</h3>
                  <div className="space-y-4">
                    {stats.by_model.map((model) => (
                      <div key={model.model} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Badge 
                              variant="outline" 
                              className={cn("text-xs", getModelColor(model.model))}
                            >
                              {getModelDisplayName(model.model)}
                            </Badge>
                            <span className="text-sm text-gray-400">
                              {model.session_count} sessions
                            </span>
                          </div>
                          <span className="text-sm font-semibold text-white">
                            {formatCurrency(model.total_cost)}
                          </span>
                        </div>
                        <div className="grid grid-cols-4 gap-2 text-xs">
                          <div>
                            <span className="text-gray-400">Input: </span>
                            <span className="font-medium text-white">{formatTokens(model.input_tokens)}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Output: </span>
                            <span className="font-medium text-white">{formatTokens(model.output_tokens)}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Cache W: </span>
                            <span className="font-medium text-white">{formatTokens(model.cache_creation_tokens)}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Cache R: </span>
                            <span className="font-medium text-white">{formatTokens(model.cache_read_tokens)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </TabsContent>

              {/* Projects Tab */}
              <TabsContent value="projects">
                <Card className="p-6 bg-gray-900/50 border-gray-700/50">
                  <h3 className="text-sm font-semibold mb-4 text-white">Usage by Project</h3>
                  <div className="space-y-3">
                    {stats.by_project.map((project) => (
                      <div key={project.project_path} className="flex items-center justify-between py-2 border-b border-gray-700/50 last:border-0">
                        <div className="flex flex-col truncate">
                          <span className="text-sm font-medium truncate text-white" title={project.project_path}>
                            {project.project_path}
                          </span>
                          <div className="flex items-center space-x-3 mt-1">
                            <span className="text-xs text-gray-400">
                              {project.session_count} sessions
                            </span>
                            <span className="text-xs text-gray-400">
                              {formatTokens(project.total_tokens)} tokens
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-white">{formatCurrency(project.total_cost)}</p>
                          <p className="text-xs text-gray-400">
                            {formatCurrency(project.total_cost / project.session_count)}/session
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </TabsContent>

              {/* Sessions Tab */}
              <TabsContent value="sessions">
                  <Card className="p-6 bg-gray-900/50 border-gray-700/50">
                      <h3 className="text-sm font-semibold mb-4 text-white">Usage by Session</h3>
                      <div className="space-y-3">
                          {sessionStats?.map((session) => (
                              <div key={`${session.project_path}-${session.project_name}`} className="flex items-center justify-between py-2 border-b border-gray-700/50 last:border-0">
                                  <div className="flex flex-col">
                                      <div className="flex items-center space-x-2">
                                        <Briefcase className="h-4 w-4 text-gray-400" />
                                        <span className="text-xs font-mono text-gray-400 truncate max-w-[200px]" title={session.project_path}>
                                            {session.project_path.split('/').slice(-2).join('/')}
                                        </span>
                                      </div>
                                      <span className="text-sm font-medium mt-1 text-white">
                                          {session.project_name}
                                      </span>
                                  </div>
                                  <div className="text-right">
                                      <p className="text-sm font-semibold text-white">{formatCurrency(session.total_cost)}</p>
                                      <p className="text-xs text-gray-400">
                                          {new Date(session.last_used).toLocaleDateString()}
                                      </p>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </Card>
              </TabsContent>

              {/* Timeline Tab */}
              <TabsContent value="timeline">
                <Card className="p-6 bg-gray-900/50 border-gray-700/50">
                  <h3 className="text-sm font-semibold mb-6 flex items-center space-x-2 text-white">
                    <Calendar className="h-4 w-4" />
                    <span>Daily Usage</span>
                  </h3>
                  {stats.by_date.length > 0 ? (() => {
                    const maxCost = Math.max(...stats.by_date.map(d => d.total_cost), 0);
                    const halfMaxCost = maxCost / 2;

                    return (
                      <div className="relative pl-8 pr-4">
                        {/* Y-axis labels */}
                        <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-xs text-gray-400">
                          <span>{formatCurrency(maxCost)}</span>
                          <span>{formatCurrency(halfMaxCost)}</span>
                          <span>{formatCurrency(0)}</span>
                        </div>
                        
                        {/* Chart container */}
                        <div className="flex items-end space-x-2 h-64 border-l border-b border-gray-700 pl-4">
                          {stats.by_date.slice().reverse().map((day) => {
                            const heightPercent = maxCost > 0 ? (day.total_cost / maxCost) * 100 : 0;
                            const date = new Date(day.date.replace(/-/g, '/'));
                            const formattedDate = date.toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric'
                            });
                            
                            return (
                              <div key={day.date} className="flex-1 h-full flex flex-col items-center justify-end group relative">
                                {/* Tooltip */}
                                <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                                  <div className="bg-black border border-gray-700 rounded-lg shadow-lg p-3 whitespace-nowrap">
                                    <p className="text-sm font-semibold text-white">{formattedDate}</p>
                                    <p className="text-sm text-gray-400 mt-1">
                                      Cost: {formatCurrency(day.total_cost)}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                      {formatTokens(day.total_tokens)} tokens
                                    </p>
                                    <p className="text-xs text-gray-400">
                                      {day.models_used.length} model{day.models_used.length !== 1 ? 's' : ''}
                                    </p>
                                  </div>
                                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                                    <div className="border-4 border-transparent border-t-gray-700"></div>
                                  </div>
                                </div>
                                
                                {/* Bar */}
                                <div 
                                  className="w-full bg-orange-500 hover:opacity-80 transition-opacity rounded-t cursor-pointer"
                                  style={{ height: `${heightPercent}%` }}
                                />
                                
                                {/* X-axis label – absolutely positioned below the bar so it doesn't affect bar height */}
                                <div
                                  className="absolute left-1/2 top-full mt-1 -translate-x-1/2 text-xs text-gray-400 -rotate-45 origin-top-left whitespace-nowrap pointer-events-none"
                                >
                                  {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        
                        {/* X-axis label */}
                        <div className="mt-8 text-center text-xs text-gray-400">
                          Daily Usage Over Time
                        </div>
                      </div>
                    )
                  })() : (
                    <div className="text-center py-8 text-sm text-gray-400">
                      No usage data available for the selected period
                    </div>
                  )}
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        ) : null}
      </div>
    </div>
  );
};