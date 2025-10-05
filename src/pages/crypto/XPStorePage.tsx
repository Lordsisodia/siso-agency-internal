/**
 * XP Store Main Page
 * Complete XP economy interface separate from life log tracking
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useUser } from '@clerk/clerk-react';
import { useXPStore } from '@/ecosystem/internal/xp-store/hooks/useXPStore';
import { XPEconomyDashboard } from '@/ecosystem/internal/xp-store/XPEconomyDashboard';
import { XPStoreBalance } from '@/ecosystem/internal/xp-store/XPStoreBalance';
import { RewardCatalog } from '@/ecosystem/internal/xp-store/RewardCatalog';
import { PurchaseHistory } from '@/ecosystem/internal/xp-store/PurchaseHistory';
import { XPAnalytics } from '@/ecosystem/internal/xp-store/XPAnalytics';
import { Card, CardContent } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { 
  ShoppingCart, 
  Coins, 
  BarChart3, 
  History,
  ArrowLeft,
  Sparkles,
  Target,
  Trophy
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';

const XPStorePage = () => {
  const { section } = useParams<{ section?: string }>();
  const { user } = useUser();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState(section || 'store');
  
  // Get XP Store data for header display
  const { balance } = useXPStore(user?.id || '');

  useEffect(() => {
    if (section && section !== activeSection) {
      setActiveSection(section);
    }
  }, [section]);

  const handleSectionChange = (newSection: string) => {
    setActiveSection(newSection);
    navigate(newSection === 'store' ? '/xp-store' : `/xp-store/${newSection}`);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-siso-bg flex items-center justify-center">
        <Card className="p-8 max-w-md">
          <CardContent className="text-center space-y-4">
            <ShoppingCart className="h-12 w-12 text-siso-orange mx-auto" />
            <h2 className="text-xl font-bold text-siso-text-bold">Sign in to access XP Store</h2>
            <p className="text-siso-text-muted">
              Start earning XP and purchasing your earned rewards
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const userId = user.id;

  return (
    <div className="min-h-screen bg-siso-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/home')}
              className="text-siso-text-muted hover:text-siso-text"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Dashboard
            </Button>
            <span className="text-siso-text-muted">/</span>
            <span className="text-siso-text font-medium">XP Store</span>
            {activeSection !== 'store' && (
              <>
                <span className="text-siso-text-muted">/</span>
                <span className="text-siso-text-muted capitalize">{activeSection}</span>
              </>
            )}
          </div>

          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-gradient-to-br from-siso-orange to-siso-red rounded-lg flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-siso-text-bold">XP Store</h1>
                  <p className="text-siso-text-muted">
                    Your earned indulgence economy - transforming productivity into pleasure
                  </p>
                </div>
              </div>
              
              {/* Psychology Tagline */}
              <div className="flex items-center gap-2 mt-3">
                <Badge className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border-purple-500/20">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Psychology-Optimized Rewards
                </Badge>
                <Badge variant="outline" className="border-siso-border text-siso-text-muted">
                  <Target className="h-3 w-3 mr-1" />
                  Guilt-Free Indulgence
                </Badge>
                <Badge variant="outline" className="border-siso-border text-siso-text-muted">
                  <Trophy className="h-3 w-3 mr-1" />
                  Earned Through Work
                </Badge>
              </div>
            </div>

            {/* Quick Stats - Only show on main store page */}
            {activeSection === 'store' && balance && (
              <div className="hidden lg:flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm text-siso-text-muted">Available to Spend</div>
                  <div className="text-2xl font-bold text-siso-orange">
                    {balance.canSpend.toLocaleString()} XP
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Section Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 bg-siso-bg-alt rounded-lg p-1 border border-siso-border">
            <Button
              variant={activeSection === 'store' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleSectionChange('store')}
              className={cn(
                activeSection === 'store' && 'bg-siso-orange text-white hover:bg-siso-red'
              )}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Store
            </Button>
            <Button
              variant={activeSection === 'balance' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleSectionChange('balance')}
              className={cn(
                activeSection === 'balance' && 'bg-siso-orange text-white hover:bg-siso-red'
              )}
            >
              <Coins className="h-4 w-4 mr-2" />
              Balance
            </Button>
            <Button
              variant={activeSection === 'history' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleSectionChange('history')}
              className={cn(
                activeSection === 'history' && 'bg-siso-orange text-white hover:bg-siso-red'
              )}
            >
              <History className="h-4 w-4 mr-2" />
              History
            </Button>
            <Button
              variant={activeSection === 'analytics' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleSectionChange('analytics')}
              className={cn(
                activeSection === 'analytics' && 'bg-siso-orange text-white hover:bg-siso-red'
              )}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </Button>
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {activeSection === 'store' && (
            <XPEconomyDashboard userId={userId} />
          )}
          
          {activeSection === 'balance' && (
            <div className="max-w-4xl mx-auto">
              <XPStoreBalance userId={userId} />
            </div>
          )}
          
          {activeSection === 'history' && (
            <PurchaseHistory userId={userId} />
          )}
          
          {activeSection === 'analytics' && (
            <XPAnalytics userId={userId} />
          )}
        </motion.div>

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center"
        >
          <Card className="bg-gradient-to-r from-siso-bg to-siso-bg-alt border-siso-border">
            <CardContent className="p-6">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-siso-text-bold">
                  Revolutionary Psychology-Based Rewards
                </h3>
                <p className="text-siso-text-muted max-w-2xl mx-auto">
                  This XP Store uses scientifically-backed psychology to transform your relationship 
                  with productivity and indulgence. Every reward is earned through genuine work, 
                  eliminating guilt and creating sustainable motivation patterns.
                </p>
                <div className="flex items-center justify-center gap-6 mt-4 text-sm text-siso-text-muted">
                  <div className="flex items-center gap-1">
                    <Target className="h-4 w-4" />
                    <span>Loss Aversion Optimization</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Sparkles className="h-4 w-4" />
                    <span>Variable Ratio Psychology</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Trophy className="h-4 w-4" />
                    <span>Identity-Based Habits</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default XPStorePage;