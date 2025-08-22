import React, { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { motion } from 'framer-motion';
import { 
  Clock, Calendar, ArrowRight, Zap, Shield, Users, 
  Coins, Sparkles, CheckCircle, Circle, Activity,
  BarChart3, ArrowUpRight, FileText, Info
} from 'lucide-react';
import { FeatureCardProps } from '@/types/feature.types';
import { cn } from '@/lib/utils';

export function FeatureCard({ 
  feature, 
  onViewDetails 
}: FeatureCardProps) {
  // Determine feature category and icon
  const featureCategory = useMemo(() => {
    const title = feature.title.toLowerCase();
    
    if (title.includes('wallet') || title.includes('trading') || title.includes('transaction') || title.includes('market')) {
      return { 
        name: "Trading & Transactions", 
        icon: <Zap className="w-4 h-4" />,
        color: "text-blue-400",
        bgColor: "bg-blue-950/50",
        borderColor: "border-blue-800/50",
        badgeColor: "bg-blue-800"
      };
    } else if (title.includes('smart contract') || title.includes('2fa') || title.includes('security') || title.includes('kyc') || title.includes('ddos')) {
      return { 
        name: "Security & Trust", 
        icon: <Shield className="w-4 h-4" />,
        color: "text-purple-400",
        bgColor: "bg-purple-950/50",
        borderColor: "border-purple-800/50",
        badgeColor: "bg-purple-800"
      };
    } else if (title.includes('staking') || title.includes('token') || title.includes('interest') || title.includes('compound')) {
      return { 
        name: "Staking & Earning", 
        icon: <Coins className="w-4 h-4" />,
        color: "text-amber-400",
        bgColor: "bg-amber-950/50",
        borderColor: "border-amber-800/50",
        badgeColor: "bg-amber-800"
      };
    } else {
      return { 
        name: "Community & Engagement", 
        icon: <Users className="w-4 h-4" />,
        color: "text-emerald-400",
        bgColor: "bg-emerald-950/50",
        borderColor: "border-emerald-800/50",
        badgeColor: "bg-emerald-800"
      };
    }
  }, [feature.title]);

  // Status management helpers
  const statusInfo = useMemo(() => {
    switch (feature.status) {
      case 'pending': 
        return {
          icon: <Circle className="w-3.5 h-3.5" />,
          label: 'Pending',
          color: 'text-slate-400',
          badge: 'bg-slate-700 text-slate-300',
          progress: 0,
          progressColor: 'bg-slate-600'
        };
      case 'in_progress': 
        return {
          icon: <Activity className="w-3.5 h-3.5" />,
          label: 'In Progress',
          color: 'text-blue-400',
          badge: 'bg-blue-800 text-blue-100',
          progress: 50,
          progressColor: 'bg-blue-600'
        };
      case 'completed': 
        return {
          icon: <CheckCircle className="w-3.5 h-3.5" />,
          label: 'Completed',
          color: 'text-emerald-400',
          badge: 'bg-emerald-800 text-emerald-100',
          progress: 100,
          progressColor: 'bg-emerald-600'
        };
      default:
        return {
          icon: <Circle className="w-3.5 h-3.5" />,
          label: 'Pending',
          color: 'text-slate-400',
          badge: 'bg-slate-700 text-slate-300',
          progress: 0,
          progressColor: 'bg-slate-600'
        };
    }
  }, [feature.status]);

  // Format cost for better readability
  const formattedCost = useMemo(() => {
    return new Intl.NumberFormat('en-GB', { 
      style: 'currency', 
      currency: 'GBP',
      maximumFractionDigits: 0
    }).format(feature.estimated_cost);
  }, [feature.estimated_cost]);

  // Format token amount for better readability
  const formattedTokens = useMemo(() => {
    const amount = feature.token_amount || 50000000;
    return new Intl.NumberFormat('en-US', { 
      notation: 'compact',
      maximumFractionDigits: 2
    }).format(amount);
  }, [feature.token_amount]);

  // Priority styling
  const priorityInfo = useMemo(() => {
    switch (feature.priority) {
      case 'low':
        return { label: 'Low Priority', color: 'bg-slate-700 text-slate-300' };
      case 'medium':
        return { label: 'Medium Priority', color: 'bg-amber-800 text-amber-100' };
      case 'high':
        return { label: 'High Priority', color: 'bg-red-800 text-red-100' };
      default:
        return { label: 'Priority', color: 'bg-slate-700 text-slate-300' };
    }
  }, [feature.priority]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.01 }}
    >
      <Card 
        className={cn(
          "bg-slate-900 border border-slate-800 transition-all duration-300",
          "h-full flex flex-col",
          "relative overflow-hidden shadow-lg",
          "hover:shadow-indigo-900/10 hover:border-slate-700"
        )}
      >
        {/* Category indicator band */}
        <div className={`h-1.5 w-full ${featureCategory.badgeColor}`} />
        
        {/* Header section with title and status */}
        <div className="p-5 pb-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-md ${featureCategory.bgColor} ${featureCategory.borderColor}`}>
                <div className={featureCategory.color}>
                  {featureCategory.icon}
                </div>
              </div>
              <h3 className="text-lg font-semibold text-white line-clamp-1">{feature.title}</h3>
            </div>
            
            <Badge className={`${statusInfo.badge} gap-1.5`}>
              {statusInfo.icon}
              {statusInfo.label}
            </Badge>
          </div>
          
          {/* Progress bar */}
          <div className="mt-3 mb-1">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">Progress</span>
              <span className={`${statusInfo.color} font-medium`}>{statusInfo.progress}%</span>
            </div>
            <Progress 
              value={statusInfo.progress} 
              className="h-1.5 bg-slate-800" 
              indicatorClassName={`${statusInfo.progressColor} transition-all duration-1000`} 
            />
          </div>
        </div>
        
        {/* Token allocation badge */}
        <div className="px-5">
          <div className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-950 to-purple-950 px-3 py-2 rounded-md border border-indigo-800/30 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
            <span className="text-xs font-bold text-indigo-300">
              {formattedTokens} {feature.token_symbol || 'UBC'}
            </span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-3 h-3 text-indigo-400/70 ml-1 cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p className="text-xs">Token allocation for this feature</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        
        {/* Description */}
        <div className="px-5 py-3">
          <p className="text-sm text-slate-300 line-clamp-2">
            {feature.description || 'No description provided'}
          </p>
        </div>
        
        {/* Tags section */}
        <div className="px-5 flex flex-wrap gap-1.5 mt-1">
          <Badge variant="outline" className="border-slate-700 bg-slate-800/50 text-slate-300 text-xs">
            {featureCategory.name}
          </Badge>
          <Badge className={priorityInfo.color + " text-xs"}>
            {priorityInfo.label}
          </Badge>
          {feature.difficulty && (
            <Badge variant="outline" className="border-slate-700 bg-slate-800/50 text-slate-300 text-xs">
              {feature.difficulty.charAt(0).toUpperCase() + feature.difficulty.slice(1)} Difficulty
            </Badge>
          )}
        </div>
        
        {/* Timeline info */}
        <div className="px-5 py-3 mt-1 grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 bg-slate-800/50 p-2 rounded-md border border-slate-700">
            <Calendar className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-xs text-slate-300">
              {feature.time_estimate_days || 14} days
            </span>
          </div>
          {feature.timeline_week && (
            <div className="flex items-center gap-2 bg-slate-800/50 p-2 rounded-md border border-slate-700">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs text-slate-300">
                Week {feature.timeline_week}
              </span>
            </div>
          )}
        </div>
        
        {/* Cost and action footer */}
        <div className="mt-auto px-5 py-4 bg-slate-950 border-t border-slate-800/50 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-slate-500">ESTIMATED TOKENS</span>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
              <span className="text-indigo-300 font-medium">
                {formattedTokens} {feature.token_symbol || 'UBC'}
              </span>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onViewDetails(feature)}
            className="gap-1.5 bg-slate-800 hover:bg-slate-700 border-slate-700 hover:border-slate-600 text-white"
          >
            <span>Details</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
