import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  Brain, 
  Zap, 
  DollarSign, 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  Gauge
} from 'lucide-react';

const ModelEfficiencyDashboard = () => {
  const [modelData, setModelData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRange, setSelectedRange] = useState('30d');

  useEffect(() => {
    fetchModelEfficiency();
  }, [selectedRange]);

  const fetchModelEfficiency = async () => {
    try {
      const token = localStorage.getItem('auth-token');
      const response = await fetch(`/api/usage/model-efficiency?range=${selectedRange}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setModelData(data.model_efficiency);
      }
    } catch (error) {
      console.error('Failed to fetch model efficiency:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => `$${amount.toFixed(2)}`;
  const formatTokens = (tokens) => {
    if (tokens >= 1000000) return `${(tokens / 1000000).toFixed(1)}M`;
    if (tokens >= 1000) return `${(tokens / 1000).toFixed(1)}K`;
    return tokens.toString();
  };

  const getEfficiencyGrade = (costPerMillion) => {
    if (costPerMillion < 200) return { grade: 'A+', color: 'text-green-600 bg-green-50 border-green-200' };
    if (costPerMillion < 500) return { grade: 'A', color: 'text-green-600 bg-green-50 border-green-200' };
    if (costPerMillion < 800) return { grade: 'B', color: 'text-blue-600 bg-blue-50 border-blue-200' };
    if (costPerMillion < 1200) return { grade: 'C', color: 'text-orange-600 bg-orange-50 border-orange-200' };
    return { grade: 'D', color: 'text-red-600 bg-red-50 border-red-200' };
  };

  const getModelDisplayName = (model) => {
    const names = {
      'claude-opus-4-20250514': 'Claude Opus 4',
      'claude-opus-4-1-20250805': 'Claude Opus 4.1',
      'claude-sonnet-4-20250514': 'Claude Sonnet 4', 
      'claude-3-5-sonnet-20241022': 'Claude 3.5 Sonnet',
      'claude-3-opus': 'Claude 3 Opus',
      'claude-3-haiku': 'Claude 3 Haiku'
    };
    return names[model] || model;
  };

  const getBenchmarkComparison = () => {
    if (modelData.length === 0) return [];
    
    const sortedByEfficiency = [...modelData].sort((a, b) => a.cost_per_million_tokens - b.cost_per_million_tokens);
    const mostEfficient = sortedByEfficiency[0];
    const leastEfficient = sortedByEfficiency[sortedByEfficiency.length - 1];
    
    return modelData.map(model => ({
      ...model,
      efficiency_vs_best: model.cost_per_million_tokens / mostEfficient.cost_per_million_tokens,
      is_most_efficient: model.model === mostEfficient.model,
      is_least_efficient: model.model === leastEfficient.model
    }));
  };

  const calculateInsights = () => {
    if (modelData.length === 0) return {};
    
    const totalSpent = modelData.reduce((sum, model) => sum + model.total_cost, 0);
    const totalTokens = modelData.reduce((sum, model) => sum + model.total_tokens, 0);
    const avgCostPerMillion = (totalSpent / totalTokens) * 1000000;
    
    const highestUsage = modelData.reduce((max, model) => 
      model.usage_count > max.usage_count ? model : max
    );
    
    const mostExpensive = modelData.reduce((max, model) => 
      model.cost_per_million_tokens > max.cost_per_million_tokens ? model : max
    );
    
    const mostEfficient = modelData.reduce((min, model) => 
      model.cost_per_million_tokens < min.cost_per_million_tokens ? model : min
    );
    
    return {
      totalSpent,
      avgCostPerMillion,
      highestUsage,
      mostExpensive,
      mostEfficient,
      totalModels: modelData.length
    };
  };

  const insights = calculateInsights();
  const benchmarkData = getBenchmarkComparison();

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-32">
            <div className="text-sm text-gray-500">Loading model efficiency analysis...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Range Selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
            <Brain className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Model Efficiency</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Cost performance analysis across Claude models</p>
          </div>
        </div>
        
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {['7d', '30d', 'all'].map((range) => (
            <button
              key={range}
              onClick={() => setSelectedRange(range)}
              className={`px-3 py-1.5 text-sm rounded-md transition-all ${
                selectedRange === range
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {range === 'all' ? 'All Time' : range}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mr-3">
                <BarChart3 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Models Used</p>
                <p className="text-2xl font-bold">{insights.totalModels}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mr-3">
                <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Spent</p>
                <p className="text-2xl font-bold">{formatCurrency(insights.totalSpent)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-3">
                <Gauge className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Cost/1M</p>
                <p className="text-2xl font-bold">${insights.avgCostPerMillion?.toFixed(0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mr-3">
                <Target className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Most Used</p>
                <p className="text-sm font-bold">{getModelDisplayName(insights.highestUsage?.model)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Model Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Brain className="w-5 h-5 text-blue-600" />
            Model Performance Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {benchmarkData.map((model, index) => {
              const efficiency = getEfficiencyGrade(model.cost_per_million_tokens);
              
              return (
                <div key={model.model} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {getModelDisplayName(model.model)}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={efficiency.color}>
                            {efficiency.grade} Grade
                          </Badge>
                          {model.is_most_efficient && (
                            <Badge className="text-green-600 bg-green-50 border-green-200">
                              Most Efficient
                            </Badge>
                          )}
                          {model.is_least_efficient && modelData.length > 1 && (
                            <Badge className="text-red-600 bg-red-50 border-red-200">
                              Least Efficient
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        ${model.cost_per_million_tokens}/1M
                      </p>
                      <p className="text-sm text-gray-500">
                        {model.efficiency_vs_best.toFixed(1)}x vs best
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Total Cost</p>
                      <p className="font-semibold">{formatCurrency(model.total_cost)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Usage Count</p>
                      <p className="font-semibold">{model.usage_count.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Total Tokens</p>
                      <p className="font-semibold">{formatTokens(model.total_tokens)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Output Ratio</p>
                      <p className="font-semibold">{model.avg_output_input_ratio?.toFixed(1)}:1</p>
                    </div>
                  </div>
                  
                  {/* Cost Efficiency Bar */}
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Cost Efficiency</span>
                      <span>{model.efficiency_vs_best.toFixed(1)}x baseline</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          model.is_most_efficient 
                            ? 'bg-green-500' 
                            : model.efficiency_vs_best < 2 
                              ? 'bg-blue-500' 
                              : model.efficiency_vs_best < 4 
                                ? 'bg-orange-500' 
                                : 'bg-red-500'
                        }`}
                        style={{ 
                          width: `${Math.min(100, (1 / model.efficiency_vs_best) * 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-600" />
              Optimization Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {insights.mostEfficient && insights.mostExpensive && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Cost Optimization Opportunity
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  Switching from {getModelDisplayName(insights.mostExpensive.model)} to {getModelDisplayName(insights.mostEfficient.model)} 
                  could save ${((insights.mostExpensive.cost_per_million_tokens - insights.mostEfficient.cost_per_million_tokens) / 1000000 * insights.mostExpensive.total_tokens).toFixed(2)} 
                  on similar workloads.
                </p>
              </div>
            )}
            
            {modelData.find(m => m.avg_output_input_ratio < 10) && (
              <div className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                  Low Output Efficiency Detected
                </p>
                <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                  Some models are generating low output relative to input. Consider refining prompts or using different models for simple tasks.
                </p>
              </div>
            )}
            
            <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                Best Practice
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                Use {getModelDisplayName(insights.mostEfficient?.model)} for cost-effective tasks and 
                {modelData.length > 1 ? ` ${getModelDisplayName(insights.mostExpensive?.model)}` : ' premium models'} for complex reasoning.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-600" />
              Usage Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <span className="text-sm font-medium">Highest Usage</span>
              <span className="text-sm">{getModelDisplayName(insights.highestUsage?.model)}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <span className="text-sm font-medium">Most Cost-Effective</span>
              <span className="text-sm">{getModelDisplayName(insights.mostEfficient?.model)}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <span className="text-sm font-medium">Premium Model Usage</span>
              <span className="text-sm">
                {((modelData.find(m => m.cost_per_million_tokens > 1000)?.usage_count || 0) / 
                  modelData.reduce((sum, m) => sum + m.usage_count, 0) * 100).toFixed(1)}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ModelEfficiencyDashboard;