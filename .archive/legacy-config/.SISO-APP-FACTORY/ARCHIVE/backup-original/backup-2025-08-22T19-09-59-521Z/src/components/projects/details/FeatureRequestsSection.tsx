import { Card } from '@/components/ui/card';
import { useFeatures } from '@/hooks/useFeatures';
import { FeatureCard } from '../features/FeatureCard';
import { FeatureDetailsModal } from '../features/FeatureDetailsModal';
import { FeatureControls } from '../features/FeatureControls';
import { FeatureLoadingState } from '../features/FeatureLoadingState';
import { FeatureErrorState } from '../features/FeatureErrorState';
import { FeatureRequestInput } from '../features/FeatureRequestInput';
import { Progress } from '@/components/ui/progress';
import { MessageSquare, CheckCircle, Circle, Activity, Zap, Shield, Coins, Users, Clock, Calendar, Sparkles, BarChart4 } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export function FeatureRequestsSection() {
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  
  const { 
    features, 
    isLoading,
    error,
    selectedFeature, 
    handleViewFeatureDetails, 
    handleCloseFeatureDetails,
    filter,
    setFilter,
    sortBy,
    setSortBy,
    handleRetry
  } = useFeatures();

  // Calculate metrics
  const getStatusMetrics = () => {
    if (!features || features.length === 0) return { total: 0, pending: 0, inProgress: 0, completed: 0 };
    
    return {
      total: features.length,
      pending: features.filter(f => f.status === 'pending').length,
      inProgress: features.filter(f => f.status === 'in_progress').length,
      completed: features.filter(f => f.status === 'completed').length
    };
  };
  
  const metrics = getStatusMetrics();
  
  // Calculate total cost and tokens
  const totalCost = features?.reduce((sum, feature) => sum + feature.estimated_cost, 0) || 0;
  const totalTokens = features?.reduce((sum, feature) => sum + (feature.token_amount || 50000000), 0) || 0;
  
  // Calculate token distribution by category
  const getTokenDistribution = () => {
    if (!features || features.length === 0) return { trading: 0, security: 0, staking: 0, community: 0 };
    
    return {
      trading: features
        .filter(f => f.category === 'trading')
        .reduce((sum, f) => sum + (f.token_amount || 50000000), 0),
      security: features
        .filter(f => f.category === 'security')
        .reduce((sum, f) => sum + (f.token_amount || 50000000), 0),
      staking: features
        .filter(f => f.category === 'staking')
        .reduce((sum, f) => sum + (f.token_amount || 50000000), 0),
      community: features
        .filter(f => f.category === 'community')
        .reduce((sum, f) => sum + (f.token_amount || 50000000), 0)
    };
  };
  
  const tokenDistribution = getTokenDistribution();
  
  // Calculate percentages for token distribution
  const tokenPercentages = {
    trading: totalTokens ? (tokenDistribution.trading / totalTokens) * 100 : 0,
    security: totalTokens ? (tokenDistribution.security / totalTokens) * 100 : 0,
    staking: totalTokens ? (tokenDistribution.staking / totalTokens) * 100 : 0,
    community: totalTokens ? (tokenDistribution.community / totalTokens) * 100 : 0
  };
  
  // Calculate total development time in days
  const totalDays = features?.reduce((sum, feature) => sum + (feature.time_estimate_days || 14), 0) || 0;

  // Calculate feature categories
  const getCategoryCounts = () => {
    if (!features || features.length === 0) return { trading: 0, security: 0, staking: 0, community: 0 };
    
    // Define category keywords for better categorization
    const categoryKeywords = {
      trading: ['wallet', 'trading', 'transaction', 'market', 'exchange', 'buy', 'sell', 'order', 'payment'],
      security: ['smart contract', '2fa', 'security', 'kyc', 'ddos', 'authentication', 'verification', 'privacy', 'encryption'],
      staking: ['staking', 'token', 'interest', 'compound', 'yield', 'reward', 'mining', 'dividend', 'earn'],
      community: ['referral', 'community', 'social', 'engagement', 'education', 'forum', 'chat', 'message', 'notification']
    };
    
    // Check if a feature has a category field and use it if available
    return {
      trading: features.filter(f => {
        // First check if feature has an explicit category
        if (f.category?.toLowerCase() === 'trading') return true;
        
        // Then check title and description against keywords
        const title = f.title.toLowerCase();
        const description = f.description?.toLowerCase() || '';
        return categoryKeywords.trading.some(keyword => 
          title.includes(keyword) || description.includes(keyword)
        );
      }).length,
      security: features.filter(f => {
        if (f.category?.toLowerCase() === 'security') return true;
        
        const title = f.title.toLowerCase();
        const description = f.description?.toLowerCase() || '';
        return categoryKeywords.security.some(keyword => 
          title.includes(keyword) || description.includes(keyword)
        );
      }).length,
      staking: features.filter(f => {
        if (f.category?.toLowerCase() === 'staking') return true;
        
        const title = f.title.toLowerCase();
        const description = f.description?.toLowerCase() || '';
        return categoryKeywords.staking.some(keyword => 
          title.includes(keyword) || description.includes(keyword)
        );
      }).length,
      community: features.filter(f => {
        if (f.category?.toLowerCase() === 'community') return true;
        
        const title = f.title.toLowerCase();
        const description = f.description?.toLowerCase() || '';
        return categoryKeywords.community.some(keyword => 
          title.includes(keyword) || description.includes(keyword)
        );
      }).length
    };
  };
  
  const categoryCounts = getCategoryCounts();

  // Define category keywords for consistent use
  const categoryKeywords = {
    trading: ['wallet', 'trading', 'transaction', 'market', 'exchange', 'buy', 'sell', 'order', 'payment'],
    security: ['smart contract', '2fa', 'security', 'kyc', 'ddos', 'authentication', 'verification', 'privacy', 'encryption'],
    staking: ['staking', 'token', 'interest', 'compound', 'yield', 'reward', 'mining', 'dividend', 'earn'],
    community: ['referral', 'community', 'social', 'engagement', 'education', 'forum', 'chat', 'message', 'notification']
  };

  // Applied at render time
  let filteredFeatures = features;

  // Format large numbers with abbreviations
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };
  
  // Filter features based on category and status
  const applyFilters = () => {
    let result = features;
    
    // Apply status filter first
    if (filter !== 'all' && result) {
      result = result.filter(feature => feature.status === filter);
    }
    
    // Then apply category filter if set
    if (categoryFilter && result) {
      result = result.filter(feature => {
    if (!categoryFilter) return true;
    
    // First check if feature has an explicit category
    if (feature.category?.toLowerCase() === categoryFilter) return true;
      
      // Then check title and description against keywords
      const title = feature.title.toLowerCase();
      const description = feature.description?.toLowerCase() || '';
      
      switch (categoryFilter) {
        case 'trading':
          return categoryKeywords.trading.some(keyword => title.includes(keyword) || description.includes(keyword));
        case 'security':
          return categoryKeywords.security.some(keyword => title.includes(keyword) || description.includes(keyword));
        case 'staking':
          return categoryKeywords.staking.some(keyword => title.includes(keyword) || description.includes(keyword));
        case 'community':
          return categoryKeywords.community.some(keyword => title.includes(keyword) || description.includes(keyword));
        default:
          return false;
      }
    });
  }
  
  return result;
  };

  filteredFeatures = applyFilters();

  if (isLoading) {
    return (
      <Card className="p-6 bg-black/30 border-siso-text/10">
        <FeatureLoadingState />
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6 bg-black/30 border-siso-text/10">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-xl font-semibold text-white">Project Features</h3>
          <MessageSquare className="w-5 h-5 text-[#9b87f5]" />
        </div>
        <FeatureErrorState 
          message={`Error loading features: ${error instanceof Error ? error.message : 'Unknown error'}`}
          onRetry={handleRetry}
        />
      </Card>
    );
  }

  return (
    <Card className="bg-black/10 backdrop-blur-sm border-none p-6 rounded-xl overflow-hidden relative">
      {/* Token Summary Dashboard */}
      {features && features.length > 0 && (
        <div className="bg-gradient-to-r from-indigo-900/20 to-purple-900/20 rounded-xl p-6 mb-8 border border-indigo-500/20">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            Token Allocation Summary
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {/* Feature Statistics */}
            <div className="bg-black/30 rounded-lg p-4 border border-indigo-500/20 backdrop-blur-sm">
              <div className="text-sm text-gray-400 mb-1">Feature Statistics</div>
              <div className="text-2xl font-bold text-white">
                {features.length} Features
              </div>
              <div className="flex flex-col gap-1 mt-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400 flex items-center gap-1">
                    <Circle className="w-2 h-2 text-gray-400" /> Pending
                  </span>
                  <span className="text-gray-300">{metrics.pending}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400 flex items-center gap-1">
                    <Activity className="w-2 h-2 text-blue-400" /> In Progress
                  </span>
                  <span className="text-gray-300">{metrics.inProgress}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400 flex items-center gap-1">
                    <CheckCircle className="w-2 h-2 text-green-400" /> Completed
                  </span>
                  <span className="text-gray-300">{metrics.completed}</span>
                </div>
              </div>
            </div>
            
            {/* Total Token Allocation */}
            <div className="bg-black/30 rounded-lg p-4 border border-indigo-500/20 backdrop-blur-sm">
              <div className="text-sm text-gray-400 mb-1">Total Token Allocation</div>
              <div className="text-2xl font-bold text-indigo-300">
                {formatNumber(totalTokens)} {features[0]?.token_symbol || 'UBC'}
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>Avg. per feature:</span>
                <span className="text-indigo-400">{formatNumber(totalTokens / features.length)}</span>
              </div>
            </div>
            
            {/* Development Timeframe */}
            <div className="bg-black/30 rounded-lg p-4 border border-indigo-500/20 backdrop-blur-sm">
              <div className="text-sm text-gray-400 mb-1">Development Timeframe</div>
              <div className="text-2xl font-bold text-blue-400">
                {totalDays} days
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
                <Calendar className="w-3 h-3" /> Estimated completion time
              </div>
            </div>
            
            {/* Total Cost */}
            <div className="bg-black/30 rounded-lg p-4 border border-indigo-500/20 backdrop-blur-sm">
              <div className="text-sm text-gray-400 mb-1">Total Cost</div>
              <div className="text-2xl font-bold text-green-400">
                £5,000
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>Package price:</span>
                <span className="text-green-400">Enterprise</span>
              </div>
            </div>
          </div>
          
          {/* Token Distribution by Category */}
          <div className="bg-black/40 rounded-lg p-4 border border-indigo-500/10 mb-4">
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm text-gray-400">Token Distribution by Category</div>
              <div className="text-xs text-gray-500">{features[0]?.token_symbol || 'UBC'}</div>
            </div>
            
            {/* Trading Category */}
            <div className="mb-3">
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-1 text-xs">
                  <Zap className="w-3 h-3 text-blue-400" /> 
                  <span className="text-gray-400">Trading & Transactions</span>
                </div>
                <span className="text-xs text-blue-400">{formatNumber(tokenDistribution.trading)}</span>
              </div>
              <Progress value={tokenPercentages.trading} className="h-1.5 bg-black/40" indicatorClassName="bg-blue-500" />
            </div>
            
            {/* Security Category */}
            <div className="mb-3">
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-1 text-xs">
                  <Shield className="w-3 h-3 text-purple-400" /> 
                  <span className="text-gray-400">Security & Trust</span>
                </div>
                <span className="text-xs text-purple-400">{formatNumber(tokenDistribution.security)}</span>
              </div>
              <Progress value={tokenPercentages.security} className="h-1.5 bg-black/40" indicatorClassName="bg-purple-500" />
            </div>
            
            {/* Staking Category */}
            <div className="mb-3">
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-1 text-xs">
                  <Coins className="w-3 h-3 text-amber-400" /> 
                  <span className="text-gray-400">Staking & Earning</span>
                </div>
                <span className="text-xs text-amber-400">{formatNumber(tokenDistribution.staking)}</span>
              </div>
              <Progress value={tokenPercentages.staking} className="h-1.5 bg-black/40" indicatorClassName="bg-amber-500" />
            </div>
            
            {/* Community Category */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-1 text-xs">
                  <Users className="w-3 h-3 text-green-400" /> 
                  <span className="text-gray-400">Community & Engagement</span>
                </div>
                <span className="text-xs text-green-400">{formatNumber(tokenDistribution.community)}</span>
              </div>
              <Progress value={tokenPercentages.community} className="h-1.5 bg-black/40" indicatorClassName="bg-green-500" />
            </div>
          </div>
        </div>
      )}
      
      {/* Category Stats are now shown in the token distribution chart below */}
      
      {/* Feature Controls */}
      <div className="mb-6">
        <FeatureControls 
          filter={filter} 
          setFilter={setFilter} 
          sortBy={sortBy} 
          setSortBy={setSortBy}
          hasError={!!error}
          onRetry={handleRetry}
          isLoading={isLoading}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
        />
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {filteredFeatures && filteredFeatures.length > 0 ? (
          filteredFeatures.map(feature => (
            <FeatureCard 
              key={feature.id} 
              feature={feature} 
              onViewDetails={handleViewFeatureDetails} 
            />
          ))
        ) : (
          <div className="col-span-full text-center py-8 bg-black/20 rounded-lg border border-siso-text/10">
            <p className="text-gray-400">
              {filter !== 'all' || categoryFilter 
                ? 'No features match the current filters. Try changing your filter.'
                : 'No features have been added yet.'}
            </p>
          </div>
        )}
      </div>

      {/* Feature Details Modal */}
      <FeatureDetailsModal 
        feature={selectedFeature} 
        onClose={handleCloseFeatureDetails} 
      />

      {/* Feature Request Form */}
      <div className="border-t border-siso-text/10 pt-6">
        <FeatureRequestInput />
      </div>
    </Card>
  );
}
