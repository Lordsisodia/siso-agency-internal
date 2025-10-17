/**
 * XP Store Main Page
 * Complete XP economy interface separate from life log tracking
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useUser } from '@clerk/clerk-react';
import { XPEconomyDashboard } from '@/internal/xp-store/components/XPEconomyDashboard';
import { XPStoreBalance } from '@/internal/xp-store/components/XPStoreBalance';
import { PurchaseHistory } from '@/internal/xp-store/components/PurchaseHistory';
import { XPAnalytics } from '@/internal/xp-store/components/XPAnalytics';
import { Card, CardContent } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import {
  ShoppingCart,
  Coins,
  BarChart3,
  History,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { XPStoreProvider, useXPStoreContext } from '@/ecosystem/internal/xp-store/context/XPStoreContext';
import { AdminLayout } from '@/ecosystem/internal/admin/layout/AdminLayout';

const XPStorePage = () => {
  const { section } = useParams<{ section?: string }>();
  const { user } = useUser();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState(section || 'store');

  useEffect(() => {
    if (section && section !== activeSection) {
      setActiveSection(section);
    }
  }, [section, activeSection]);

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

  return (
    <AdminLayout>
      <XPStoreProvider userId={user.id}>
        <XPStoreContent activeSection={activeSection} onSectionChange={handleSectionChange} />
      </XPStoreProvider>
    </AdminLayout>
  );
};

interface XPStoreContentProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const XPStoreContent = ({ activeSection, onSectionChange }: XPStoreContentProps) => {
  const { balance } = useXPStoreContext();

  return (
    <div className="min-h-screen bg-siso-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-siso-orange to-siso-red flex items-center justify-center shadow-lg shadow-siso-orange/30">
                  <ShoppingCart className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-siso-text-bold md:text-4xl">XP Store</h1>
                  <p className="text-siso-text-muted">
                    Trade verified progress for restorative rewards and strategic upgrades.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge className="bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-orange-500/20 text-purple-200 border-transparent">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Psychology Calibrated
                </Badge>
                <Badge variant="outline" className="border-siso-border text-siso-text-muted">
                  <Target className="h-3 w-3 mr-1" />
                  Earned Indulgence
                </Badge>
                <Badge variant="outline" className="border-siso-border text-siso-text-muted">
                  <Trophy className="h-3 w-3 mr-1" />
                  Streak-Aware Pricing
                </Badge>
              </div>
            </div>

            <div className="w-full sm:w-auto">
              <Card className="border-siso-border bg-siso-bg-alt/80">
                <CardContent className="p-5">
                  <div className="text-xs uppercase tracking-wide text-siso-text-muted">Spendable XP</div>
                  <div className="mt-2 text-3xl font-bold text-siso-orange">
                    {balance ? balance.canSpend.toLocaleString() : '—'}
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-xs text-siso-text-muted">
                    <Zap className="h-3 w-3" />
                    {balance
                      ? 'Updated live from your most recent sync.'
                      : 'We’ll sync your XP the moment data loads.'}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex flex-wrap gap-2 rounded-xl border border-siso-border bg-siso-bg-alt p-1">
            <XPStoreNavButton
              icon={<ShoppingCart className="h-4 w-4" />}
              label="Store"
              isActive={activeSection === 'store'}
              onClick={() => onSectionChange('store')}
            />
            <XPStoreNavButton
              icon={<Coins className="h-4 w-4" />}
              label="Balance"
              isActive={activeSection === 'balance'}
              onClick={() => onSectionChange('balance')}
            />
            <XPStoreNavButton
              icon={<History className="h-4 w-4" />}
              label="History"
              isActive={activeSection === 'history'}
              onClick={() => onSectionChange('history')}
            />
            <XPStoreNavButton
              icon={<BarChart3 className="h-4 w-4" />}
              label="Analytics"
              isActive={activeSection === 'analytics'}
              onClick={() => onSectionChange('analytics')}
            />
          </div>
        </motion.div>

        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {activeSection === 'store' && <XPEconomyDashboard />}

          {activeSection === 'balance' && (
            <div className="max-w-4xl mx-auto">
              <XPStoreBalance />
            </div>
          )}

          {activeSection === 'history' && <PurchaseHistory />}

          {activeSection === 'analytics' && <XPAnalytics />}
        </motion.div>

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
                  Rewards Built Around Sustainable Motivation
                </h3>
                <p className="text-siso-text-muted max-w-2xl mx-auto">
                  Every unlock in the XP Store is tied to the work you’ve already banked. We keep the
                  psychology sharp so indulgence stays earned, restorative, and guilt-free.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4 mt-4 text-sm text-siso-text-muted">
                  <div className="flex items-center gap-1">
                    <Target className="h-4 w-4" />
                    <span>Loss Aversion Guardrails</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Sparkles className="h-4 w-4" />
                    <span>Variable Ratio Motivation</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Trophy className="h-4 w-4" />
                    <span>Identity-Locked Rewards</span>
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

interface XPStoreNavButtonProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const XPStoreNavButton = ({ icon, label, isActive, onClick }: XPStoreNavButtonProps) => (
  <Button
    variant={isActive ? 'default' : 'ghost'}
    size="sm"
    onClick={onClick}
    className={cn(
      'flex-1 min-w-[120px] justify-center gap-2 rounded-lg',
      isActive ? 'bg-siso-orange text-white hover:bg-siso-red' : 'text-siso-text-muted'
    )}
  >
    {icon}
    {label}
  </Button>
);

export default XPStorePage;
