import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Progress } from '@/shared/ui/progress';
import { 
  DollarSign, 
  CreditCard, 
  TrendingUp, 
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

interface PaymentMetrics {
  monthlyRevenue: number;
  revenueGrowth: number;
  totalTransactions: number;
  successRate: number;
  pendingPayments: number;
  averageTransaction: number;
  recurringRevenue: number;
  chargebacks: number;
}

export function PaymentIntegrationWidget() {
  const [metrics, setMetrics] = useState<PaymentMetrics>({
    monthlyRevenue: 24650,
    revenueGrowth: 18.5,
    totalTransactions: 342,
    successRate: 98.7,
    pendingPayments: 12,
    averageTransaction: 72.15,
    recurringRevenue: 18420,
    chargebacks: 2
  });

  const [isLoading, setIsLoading] = useState(false);

  const refreshMetrics = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setMetrics(prev => ({
      ...prev,
      monthlyRevenue: prev.monthlyRevenue + Math.floor(Math.random() * 500),
      totalTransactions: prev.totalTransactions + Math.floor(Math.random() * 10)
    }));
    setIsLoading(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <Card className="bg-gradient-to-br from-green-900/20 to-emerald-700/10 border-green-500/20 hover:border-green-400/40 transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="flex items-center gap-2 text-white">
            <div className="p-2 rounded-lg bg-green-500/20">
              <DollarSign className="h-5 w-5 text-green-400" />
            </div>
            Revenue Dashboard
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={refreshMetrics}
            disabled={isLoading}
            className="text-green-400 hover:text-green-300 hover:bg-green-500/10"
          >
            {isLoading ? 'Syncing...' : 'Refresh'}
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Main Revenue Display */}
          <div className="text-center p-4 rounded-lg bg-green-500/10 border border-green-500/20">
            <div className="flex items-center justify-center gap-2 mb-2">
              <DollarSign className="h-6 w-6 text-green-400" />
              <span className="text-sm text-green-300">Monthly Revenue</span>
            </div>
            <p className="text-3xl font-bold text-green-400 mb-2">
              {formatCurrency(metrics.monthlyRevenue)}
            </p>
            <div className="flex items-center justify-center gap-1">
              {metrics.revenueGrowth > 0 ? (
                <ArrowUpRight className="h-4 w-4 text-green-400" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-400" />
              )}
              <span className={`text-sm font-medium ${
                metrics.revenueGrowth > 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {metrics.revenueGrowth > 0 ? '+' : ''}{metrics.revenueGrowth}% vs last month
              </span>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-gray-800/50 border border-gray-700/50">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="h-4 w-4 text-blue-400" />
                <span className="text-xs text-gray-300">Transactions</span>
              </div>
              <p className="text-lg font-bold text-white">{metrics.totalTransactions}</p>
              <p className="text-xs text-gray-400">This month</p>
            </div>
            
            <div className="p-3 rounded-lg bg-gray-800/50 border border-gray-700/50">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span className="text-xs text-gray-300">Success Rate</span>
              </div>
              <p className="text-lg font-bold text-green-400">{metrics.successRate}%</p>
              <p className="text-xs text-gray-400">Last 30 days</p>
            </div>
            
            <div className="p-3 rounded-lg bg-gray-800/50 border border-gray-700/50">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-yellow-400" />
                <span className="text-xs text-gray-300">Pending</span>
              </div>
              <p className="text-lg font-bold text-yellow-400">{metrics.pendingPayments}</p>
              <p className="text-xs text-gray-400">Awaiting</p>
            </div>
            
            <div className="p-3 rounded-lg bg-gray-800/50 border border-gray-700/50">
              <div className="flex items-center gap-2 mb-2">
                <Receipt className="h-4 w-4 text-purple-400" />
                <span className="text-xs text-gray-300">Avg. Order</span>
              </div>
              <p className="text-lg font-bold text-purple-400">{formatCurrency(metrics.averageTransaction)}</p>
              <p className="text-xs text-gray-400">Per transaction</p>
            </div>
          </div>

          {/* Revenue Breakdown */}
          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-300">Recurring Revenue</span>
                <span className="text-sm text-green-400">{formatCurrency(metrics.recurringRevenue)}</span>
              </div>
              <Progress value={75} className="h-2 bg-gray-800" />
              <p className="text-xs text-gray-400 mt-1">75% of total revenue</p>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-300">One-time Payments</span>
                <span className="text-sm text-blue-400">{formatCurrency(metrics.monthlyRevenue - metrics.recurringRevenue)}</span>
              </div>
              <Progress value={25} className="h-2 bg-gray-800" />
              <p className="text-xs text-gray-400 mt-1">25% of total revenue</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <Button 
              size="sm" 
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Receipt className="h-4 w-4 mr-1" />
              New Invoice
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="border-green-500/50 text-green-400 hover:bg-green-500/10"
            >
              <CreditCard className="h-4 w-4 mr-1" />
              Payments
            </Button>
          </div>

          {/* Alerts Section */}
          {metrics.chargebacks > 0 && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <span className="text-sm text-red-300">
                  {metrics.chargebacks} chargeback{metrics.chargebacks > 1 ? 's' : ''} require attention
                </span>
              </div>
            </div>
          )}

          {/* Status Indicator */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-700/50">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
              <span className="text-xs text-gray-400">Connected to Stripe</span>
            </div>
            <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
              Live
            </Badge>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
} 