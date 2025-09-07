/**
 * Dashboard Templates Collection
 * 
 * A comprehensive collection of reusable dashboard UI components extracted from
 * the client dashboard and designed for use across different dashboard types
 * (partnership, admin, client, etc.).
 * 
 * Available Templates:
 * 1. DashboardGreetingCard - Time-based greeting with dynamic colors
 * 2. BatchProgressSection - Multi-step progress tracking with tasks
 * 3. StatsOverviewCard - Quick stats display with icons
 * 4. ActionCard - Call-to-action cards with buttons
 * 5. QuickActionsGrid - Grid of action items
 * 
 * Design Philosophy:
 * - Consistent SISO branding (orange/yellow theme)
 * - Responsive and mobile-friendly
 * - Smooth animations and transitions
 * - Accessibility compliant
 * - Highly customizable via props
 */

// Re-export template components for easy access
export { DashboardGreetingCard } from './dashboard-greeting-card';
export { BatchProgressSection } from './batch-progress-section';
export type { BatchTask } from './batch-progress-section';

// Re-export new template components
export { ResourcesHelpTemplate } from './resources-help-template';
export type { 
  FeaturedArticle, 
  QuickHelpCard, 
  HelpCenterCard, 
  HelpCategory 
} from './resources-help-template';

export { LeaderboardTemplate } from './leaderboard-template';
export type { LeaderboardEntry } from './leaderboard-template';

export { 
  AppPlanPhaseTemplate, 
  FeatureDashboardTemplate, 
  WireframeGridTemplate 
} from './app-plan-template';
export type { 
  AppPlanPhase, 
  AppPlanSubsection, 
  ProjectFeature, 
  ProjectWireframe 
} from './app-plan-template';

// Additional template components for comprehensive dashboard building
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

/**
 * Stats Overview Card Template
 * 
 * Displays key metrics with icon, value, and description.
 * Perfect for dashboard overview sections.
 */
interface StatsOverviewCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  color?: 'orange' | 'green' | 'blue' | 'purple' | 'red';
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

export function StatsOverviewCard({
  title,
  value,
  description,
  icon: Icon,
  color = 'orange',
  trend = 'neutral',
  className
}: StatsOverviewCardProps) {
  const colorClasses = {
    orange: 'from-orange-500/20 to-red-500/10 border-orange-500/30 text-orange-400',
    green: 'from-green-500/20 to-emerald-500/10 border-green-500/30 text-green-400',
    blue: 'from-blue-500/20 to-cyan-500/10 border-blue-500/30 text-blue-400',
    purple: 'from-purple-500/20 to-pink-500/10 border-purple-500/30 text-purple-400',
    red: 'from-red-500/20 to-pink-500/10 border-red-500/30 text-red-400'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={cn("bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700", className)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center">
            <Icon className={`mr-2 h-4 w-4 ${colorClasses[color].split(' ')[2]}`} />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{value}</div>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

/**
 * Action Card Template
 * 
 * Call-to-action card with title, description, and button.
 * Great for featuring important actions or navigation.
 */
interface ActionCardProps {
  title: string;
  description: string;
  buttonText: string;
  onAction: () => void;
  icon?: LucideIcon;
  variant?: 'primary' | 'secondary' | 'success' | 'warning';
  className?: string;
}

export function ActionCard({
  title,
  description,
  buttonText,
  onAction,
  icon: Icon,
  variant = 'primary',
  className
}: ActionCardProps) {
  const variantClasses = {
    primary: 'border-orange-500/30 hover:border-orange-500/50 bg-gradient-to-br from-orange-500/10 to-red-500/5',
    secondary: 'border-slate-600/30 hover:border-slate-500/50 bg-gradient-to-br from-slate-800 to-slate-900',
    success: 'border-green-500/30 hover:border-green-500/50 bg-gradient-to-br from-green-500/10 to-emerald-500/5',
    warning: 'border-yellow-500/30 hover:border-yellow-500/50 bg-gradient-to-br from-yellow-500/10 to-orange-500/5'
  };

  const buttonVariant = {
    primary: 'bg-orange-600 hover:bg-orange-700',
    secondary: 'bg-slate-600 hover:bg-slate-700',
    success: 'bg-green-600 hover:bg-green-700', 
    warning: 'bg-yellow-600 hover:bg-yellow-700'
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
    >
      <Card className={cn(
        "transition-all duration-300 cursor-pointer",
        variantClasses[variant],
        className
      )}>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            {Icon && (
              <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center">
                <Icon className="h-6 w-6 text-white" />
              </div>
            )}
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
              <p className="text-gray-300 text-sm mb-4">{description}</p>
              <Button 
                onClick={onAction}
                className={`${buttonVariant[variant]} text-white`}
              >
                {buttonText}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/**
 * Quick Actions Grid Template
 * 
 * Grid layout for quick action buttons with icons and labels.
 * Perfect for dashboard shortcuts and common actions.
 */
interface QuickAction {
  id: string;
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  color?: 'orange' | 'green' | 'blue' | 'purple';
}

interface QuickActionsGridProps {
  title?: string;
  actions: QuickAction[];
  columns?: 2 | 3 | 4;
  className?: string;
}

export function QuickActionsGrid({
  title = "Quick Actions",
  actions,
  columns = 3,
  className
}: QuickActionsGridProps) {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
    4: 'grid-cols-2 lg:grid-cols-4'
  };

  const colorClasses = {
    orange: 'hover:bg-orange-500/10 hover:border-orange-500/30 text-orange-400',
    green: 'hover:bg-green-500/10 hover:border-green-500/30 text-green-400',
    blue: 'hover:bg-blue-500/10 hover:border-blue-500/30 text-blue-400',
    purple: 'hover:bg-purple-500/10 hover:border-purple-500/30 text-purple-400'
  };

  return (
    <div className={className}>
      {title && (
        <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      )}
      <div className={cn("grid gap-4", gridCols[columns])}>
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <motion.button
              key={action.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              onClick={action.onClick}
              className={cn(
                "p-4 rounded-xl border border-white/10 bg-black/20 transition-all duration-300 text-center hover:scale-105",
                colorClasses[action.color || 'orange']
              )}
            >
              <Icon className="h-8 w-8 mx-auto mb-2" />
              <span className="text-sm font-medium text-white">{action.label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Template Usage Examples and Documentation
 */
export const DashboardTemplateExamples = {
  greetingCard: `
    <DashboardGreetingCard 
      userName="John Doe" 
      welcomeMessage="Welcome to your partnership dashboard"
      showDate={true}
    />
  `,
  
  batchProgress: `
    <BatchProgressSection 
      title="Partnership Onboarding"
      currentBatch={1}
      totalBatches={3}
      tasks={partnershipTasks}
    />
  `,
  
  resourcesHelp: `
    <ResourcesHelpTemplate
      title="Partnership Support"
      subtitle="Get help with your partnership journey"
      featuredArticles={partnershipArticles}
      helpCategories={partnershipTabs}
      quickHelpCards={supportCards}
    />
  `,
  
  leaderboard: `
    <LeaderboardTemplate
      title="Partner Rankings"
      subtitle="Top performing partners this month"
      entries={partnerData}
      onUserClick={(user) => navigate(\`/partner/\${user.id}\`)}
      showSearch={true}
      showFilters={true}
    />
  `,
  
  appPlanPhase: `
    <AppPlanPhaseTemplate
      projectName="My App Development"
      phases={developmentPhases}
      onExportPlan={() => exportPlan()}
      onEditPlan={() => editPlan()}
    />
  `,
  
  featureDashboard: `
    <FeatureDashboardTemplate
      features={projectFeatures}
      totalTokens={500000}
      tokenSymbol="UBC"
      onFeatureClick={(feature) => viewFeature(feature)}
      onAddFeature={() => addNewFeature()}
    />
  `,
  
  wireframeGrid: `
    <WireframeGridTemplate
      wireframes={projectWireframes}
      onWireframeClick={(wireframe) => viewWireframe(wireframe)}
      onAddWireframe={() => createWireframe()}
    />
  `,
  
  statsCard: `
    <StatsOverviewCard
      title="Total Referrals"
      value={42}
      description="This month"
      icon={Users}
      color="green"
    />
  `,
  
  actionCard: `
    <ActionCard
      title="Create New Referral"
      description="Start earning by referring new clients"
      buttonText="Get Started"
      onAction={() => navigate('/referrals/new')}
      icon={Plus}
      variant="primary"
    />
  `,
  
  quickActions: `
    <QuickActionsGrid
      title="Quick Actions"
      actions={[
        { id: '1', label: 'New Referral', icon: Plus, onClick: () => {} },
        { id: '2', label: 'View Stats', icon: BarChart, onClick: () => {} },
        { id: '3', label: 'Training', icon: BookOpen, onClick: () => {} }
      ]}
      columns={3}
    />
  `
};