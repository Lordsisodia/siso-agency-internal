/**
 * XP Store Main Page - Mobile-First Redesign
 * Clean, focused interface optimized for mobile usability
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthSession } from '@/lib/hooks/auth/useAuthSession';
import { XPEconomyDashboard } from '@/domains/admin/xp-store/2-dashboard/ui/pages/XPEconomyDashboard';
import { XPStoreBalance } from '@/domains/admin/xp-store/2-dashboard/ui/components/XPStoreBalance';
import { PurchaseHistory } from '@/domains/admin/xp-store/2-dashboard/ui/components/PurchaseHistory';
import { XPAnalytics } from '@/domains/admin/xp-store/2-dashboard/ui/components/XPAnalytics';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ShoppingCart,
  Coins,
  BarChart3,
  History,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { XPStoreProvider, useXPStoreContext } from '@/domains/admin/xp-store/_shared/core/XPStoreContext';
import { AdminLayout } from '@/domains/admin/layout/AdminLayout';

const XPStorePage = () => {
  const { section } = useParams<{ section?: string }>();
  const { user } = useAuthSession();
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
      <div className="min-h-screen bg-siso-bg flex items-center justify-center p-4">
        <Card className="p-8 max-w-md w-full">
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
      {/* XP Balance Header Card - Sticky on mobile */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 bg-siso-bg border-b border-siso-border"
      >
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Title */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-siso-orange to-siso-red flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-siso-text-bold">XP Store</h1>
                <p className="text-xs text-siso-text-muted">Redeem your progress</p>
              </div>
            </div>

            {/* Balance Display */}
            <div className="flex items-center gap-2 bg-siso-bg-alt rounded-xl px-4 py-2 border border-siso-border">
              <Coins className="h-4 w-4 text-siso-orange" />
              <div className="text-right">
                <div className="text-lg font-bold text-siso-orange leading-none">
                  {balance ? balance.canSpend.toLocaleString() : '—'}
                </div>
                <div className="text-[10px] text-siso-text-muted uppercase tracking-wide">XP</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Navigation Tabs - Below header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="border-b border-siso-border bg-siso-bg"
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto hide-scrollbar -mx-4 px-4">
            <StoreTab
              icon={<ShoppingCart className="h-4 w-4" />}
              label="Store"
              isActive={activeSection === 'store'}
              onClick={() => onSectionChange('store')}
              count={null}
            />
            <StoreTab
              icon={<Coins className="h-4 w-4" />}
              label="Balance"
              isActive={activeSection === 'balance'}
              onClick={() => onSectionChange('balance')}
              count={null}
            />
            <StoreTab
              icon={<History className="h-4 w-4" />}
              label="History"
              isActive={activeSection === 'history'}
              onClick={() => onSectionChange('history')}
              count={null}
            />
            <StoreTab
              icon={<BarChart3 className="h-4 w-4" />}
              label="Analytics"
              isActive={activeSection === 'analytics'}
              onClick={() => onSectionChange('analytics')}
              count={null}
            />
          </div>
        </div>
      </motion.div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {activeSection === 'store' && <XPEconomyDashboard />}

          {activeSection === 'balance' && (
            <div className="max-w-2xl mx-auto">
              <XPStoreBalance />
            </div>
          )}

          {activeSection === 'history' && <PurchaseHistory />}

          {activeSection === 'analytics' && (
            <XPAnalytics
              onNavigateToStore={() => onSectionChange('store')}
              onNavigateBack={() => onSectionChange('store')}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
};

interface StoreTabProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
  count?: number | null;
}

const StoreTab = ({ icon, label, isActive, onClick, count }: StoreTabProps) => (
  <button
    onClick={onClick}
    className={cn(
      'flex items-center gap-2 px-4 py-3 rounded-lg font-medium text-sm whitespace-nowrap transition-all relative',
      isActive
        ? 'text-siso-orange bg-siso-orange/10'
        : 'text-siso-text-muted hover:text-siso-text hover:bg-siso-bg-alt'
    )}
  >
    {icon}
    <span>{label}</span>
    {count !== null && count !== undefined && (
      <span className={cn(
        'ml-1 px-2 py-0.5 rounded-full text-xs font-bold',
        isActive
          ? 'bg-siso-orange text-white'
          : 'bg-siso-border text-siso-text-muted'
      )}>
        {count}
      </span>
    )}
    {isActive && (
      <motion.div
        layoutId="activeTab"
        className="absolute bottom-0 left-0 right-0 h-0.5 bg-siso-orange"
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    )}
  </button>
);

export default XPStorePage;
