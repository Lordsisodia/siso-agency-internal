import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Check, 
  Info, 
  Clock, 
  AlertTriangle, 
  Shield, 
  Sparkles, 
  CheckCircle,
  Settings,
  Star,
  Users,
  FileText,
  MessageSquare,
  BarChart
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { FeatureTierCard } from '@/components/plan/FeatureTierCard';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { TierComparison } from '@/components/plan/TierComparison';
import { PriceSlider } from '@/components/plan/PriceSlider';
import { FeatureSelection } from '@/components/plan/FeatureSelection';
import { GradientHeading } from '@/components/ui/gradient-heading';

// Feature data types
export interface FeatureItem {
  id: string;
  name: string;
  description: string;
  timeEstimate: number; // in days
  price: number;
  category: 'client' | 'content' | 'communication' | 'analytics' | 'security' | 'automation';
  tier: 'mvp' | 'advanced' | 'premium';
  included: boolean;
  recommended?: boolean;
  roi?: string;
}

export interface FeatureTier {
  id: string;
  name: string;
  maxFeatures: number | 'unlimited';
  baseTimeEstimate: number; // in days
  basePrice: number;
  icon: React.ReactNode;
  description: string;
  recommended?: boolean;
}

interface TierFeatureSelectionProps {
  onFeaturesSelected: (features: FeatureItem[], tier: string, totalTime: number, totalPrice: number) => void;
}

// Define tiers
const tiers: FeatureTier[] = [
  {
    id: 'mvp',
    name: 'MVP',
    maxFeatures: 10,
    baseTimeEstimate: 90,
    basePrice: 0,
    icon: <Settings className="h-5 w-5 text-siso-text" />,
    description: 'Essential features to get your platform started. Free tier with up to 10 features.'
  },
  {
    id: 'advanced',
    name: 'Advanced',
    maxFeatures: 'unlimited',
    baseTimeEstimate: 60,
    basePrice: 249,
    icon: <Shield className="h-5 w-5 text-siso-text" />,
    description: 'Enhanced features with faster delivery and unlimited selections.',
    recommended: true
  },
  {
    id: 'premium',
    name: 'Premium',
    maxFeatures: 'unlimited',
    baseTimeEstimate: 21,
    basePrice: 499,
    icon: <Sparkles className="h-5 w-5 text-siso-text" />,
    description: 'All features included with priority support and fastest delivery.'
  }
];

// Define features by category
const features: FeatureItem[] = [
  // Client Management Features
  {
    id: 'client-profiles',
    name: 'Client Profiles',
    description: 'Detailed profiles for each creator with basic information.',
    timeEstimate: 0.5,
    price: 0,
    category: 'client',
    tier: 'mvp',
    included: false
  },
  {
    id: 'performance-dashboard',
    name: 'Basic Performance Dashboard',
    description: 'View key metrics like earnings and subscriber count.',
    timeEstimate: 1,
    price: 0,
    category: 'client',
    tier: 'mvp',
    included: false,
    recommended: true,
    roi: 'Better visibility leads to 25% more effective client management'
  },
  {
    id: 'earnings-tracking',
    name: 'Earnings Tracking',
    description: 'Monitor creator revenue over time with basic charts.',
    timeEstimate: 1.5,
    price: 0,
    category: 'client',
    tier: 'mvp',
    included: false
  },
  {
    id: 'subscriber-tracking',
    name: 'Subscriber Count Tracking',
    description: 'Track subscriber growth or decline over time.',
    timeEstimate: 1,
    price: 0,
    category: 'client',
    tier: 'mvp',
    included: false
  },
  {
    id: 'advanced-analytics',
    name: 'Advanced Creator Analytics',
    description: 'In-depth performance insights with predictive trends.',
    timeEstimate: 3,
    price: 0,
    category: 'client',
    tier: 'advanced',
    included: false,
    recommended: true,
    roi: 'Helps identify top performers and increase overall revenue by 30%'
  },
  {
    id: 'predictive-insights',
    name: 'Predictive Performance Insights',
    description: 'AI-powered forecasts for future earnings or growth.',
    timeEstimate: 5,
    price: 0,
    category: 'client',
    tier: 'premium',
    included: false
  },
  
  // Content Management Features
  {
    id: 'content-calendar',
    name: 'Simple Content Calendar',
    description: 'Plan posts with a basic scheduling tool.',
    timeEstimate: 1.5,
    price: 0,
    category: 'content',
    tier: 'mvp',
    included: false,
    recommended: true,
    roi: 'Helps maintain consistent posting, increasing engagement by 45%'
  },
  {
    id: 'media-library',
    name: 'Media Library with Basic Tagging',
    description: 'Store and categorize assets with simple tags.',
    timeEstimate: 2,
    price: 0,
    category: 'content',
    tier: 'mvp',
    included: false
  },
  {
    id: 'content-approval',
    name: 'Content Approval Workflow',
    description: 'Approve or reject creator content before posting.',
    timeEstimate: 1.5,
    price: 0,
    category: 'content',
    tier: 'mvp',
    included: false
  },
  {
    id: 'ai-content-optimization',
    name: 'AI Content Optimization',
    description: 'Get suggestions to improve content based on trending topics.',
    timeEstimate: 4,
    price: 0,
    category: 'content',
    tier: 'advanced',
    included: false,
    recommended: true,
    roi: 'Optimized content can increase engagement by 60% and subscriptions by 25%'
  },
  {
    id: 'cross-platform-posting',
    name: 'Cross-Platform Posting',
    description: 'Post content to multiple platforms simultaneously.',
    timeEstimate: 3,
    price: 0,
    category: 'content',
    tier: 'advanced',
    included: false
  },
  {
    id: 'ai-content-generation',
    name: 'AI Content Generation',
    description: 'Generate content ideas, captions, and hashtags automatically.',
    timeEstimate: 7,
    price: 0,
    category: 'content',
    tier: 'premium',
    included: false,
    roi: 'Save 5-10 hours weekly on content creation while increasing quality'
  },
  
  // Communication Features
  {
    id: 'in-app-messaging',
    name: 'In-App Messaging',
    description: 'Direct messaging between agency and creators.',
    timeEstimate: 3,
    price: 0,
    category: 'communication',
    tier: 'mvp',
    included: false,
    recommended: true,
    roi: 'Centralized communication improves response time by 65%'
  },
  {
    id: 'notification-system',
    name: 'Notification System',
    description: 'Alerts for deadlines, updates, and important events.',
    timeEstimate: 2,
    price: 0,
    category: 'communication',
    tier: 'mvp',
    included: false
  },
  {
    id: 'fan-interaction',
    name: 'Fan Interaction Tools',
    description: 'Manage fan messages and interactions efficiently.',
    timeEstimate: 4,
    price: 0,
    category: 'communication',
    tier: 'advanced',
    included: false,
    recommended: true,
    roi: 'Better fan engagement leads to 40% higher subscription renewal rates'
  },
  {
    id: 'smart-replies',
    name: 'Smart Auto-Replies',
    description: 'AI-driven responses to common fan queries.',
    timeEstimate: 3.5,
    price: 0,
    category: 'communication',
    tier: 'premium',
    included: false
  },
  
  // Analytics Features
  {
    id: 'basic-earnings',
    name: 'Basic Earnings Report',
    description: 'Simple revenue overview with basic filtering.',
    timeEstimate: 1,
    price: 0,
    category: 'analytics',
    tier: 'mvp',
    included: false,
    recommended: true,
    roi: 'Clear financial tracking increases profitability by 20%'
  },
  {
    id: 'subscriber-growth',
    name: 'Subscriber Growth Chart',
    description: 'Visualize subscriber trends over time.',
    timeEstimate: 1,
    price: 0,
    category: 'analytics',
    tier: 'mvp',
    included: false
  },
  {
    id: 'content-performance',
    name: 'Content Performance Metrics',
    description: 'Track likes, views, and engagement for each post.',
    timeEstimate: 2,
    price: 0,
    category: 'analytics',
    tier: 'mvp',
    included: false
  },
  {
    id: 'real-time-analytics',
    name: 'Real-Time Analytics Dashboard',
    description: 'Live data updates for all key performance indicators.',
    timeEstimate: 4,
    price: 0,
    category: 'analytics',
    tier: 'advanced',
    included: false
  },
  {
    id: 'competitor-benchmarking',
    name: 'Competitor Benchmarking',
    description: 'Compare performance to similar creators and agencies.',
    timeEstimate: 5,
    price: 0,
    category: 'analytics',
    tier: 'premium',
    included: false,
    roi: 'Strategic insights that can increase market positioning by 35%'
  },
  
  // Security Features
  {
    id: 'user-authentication',
    name: 'User Authentication',
    description: 'Secure login for agency staff and creators.',
    timeEstimate: 1,
    price: 0,
    category: 'security',
    tier: 'mvp',
    included: false
  },
  {
    id: 'role-based-access',
    name: 'Role-Based Access Control',
    description: 'Limit access based on user roles within the agency.',
    timeEstimate: 2,
    price: 0,
    category: 'security',
    tier: 'mvp',
    included: false,
    recommended: true,
    roi: 'Reduces security incidents by 75% while improving workflow'
  },
  {
    id: 'two-factor',
    name: 'Two-Factor Authentication',
    description: 'Extra layer of security for account access.',
    timeEstimate: 1.5,
    price: 0,
    category: 'security',
    tier: 'advanced',
    included: false
  },
  {
    id: 'end-to-end-encryption',
    name: 'End-to-End Encryption',
    description: 'Secure all sensitive data and communications.',
    timeEstimate: 3,
    price: 0,
    category: 'security',
    tier: 'premium',
    included: false,
    recommended: true,
    roi: 'Provides enterprise-grade security that builds client trust and retention'
  },
  
  // Automation Features
  {
    id: 'automated-reminders',
    name: 'Automated Reminders',
    description: 'Notify creators of upcoming deadlines automatically.',
    timeEstimate: 1,
    price: 0,
    category: 'automation',
    tier: 'mvp',
    included: false
  },
  {
    id: 'workflow-automation',
    name: 'Basic Workflow Automation',
    description: 'Automate repetitive steps like content approvals.',
    timeEstimate: 2.5,
    price: 0,
    category: 'automation',
    tier: 'mvp',
    included: false,
    recommended: true,
    roi: 'Saves 10+ hours per week on administrative tasks'
  },
  {
    id: 'fan-engagement',
    name: 'Automated Fan Engagement',
    description: 'Schedule and automate fan outreach campaigns.',
    timeEstimate: 4,
    price: 0,
    category: 'automation',
    tier: 'advanced',
    included: false
  },
  {
    id: 'intelligent-task',
    name: 'Intelligent Task Assignment',
    description: 'Automatically assign tasks based on staff availability.',
    timeEstimate: 3.5,
    price: 0,
    category: 'automation',
    tier: 'premium',
    included: false
  }
];

// Feature category information
const featureCategories = [
  { id: 'client', name: 'Client Management', icon: <Users className="h-5 w-5 text-siso-orange" /> },
  { id: 'content', name: 'Content Management', icon: <FileText className="h-5 w-5 text-siso-orange" /> },
  { id: 'communication', name: 'Communication', icon: <MessageSquare className="h-5 w-5 text-siso-orange" /> },
  { id: 'analytics', name: 'Analytics', icon: <BarChart className="h-5 w-5 text-siso-orange" /> },
  { id: 'security', name: 'Security', icon: <Shield className="h-5 w-5 text-siso-orange" /> },
  { id: 'automation', name: 'Automation', icon: <Settings className="h-5 w-5 text-siso-orange" /> }
];

// Features comparison for tier table
const tierFeatureComparison = [
  {
    name: 'Client Management',
    description: 'Tools for managing your OnlyFans creators',
    tiers: { mvp: true, standard: true, premium: true, enterprise: true }
  },
  {
    name: 'Content Scheduling',
    description: 'Plan and schedule content for your creators',
    tiers: { mvp: true, standard: true, premium: true, enterprise: true }
  },
  {
    name: 'In-App Messaging',
    description: 'Communication between agency and creators',
    tiers: { mvp: true, standard: true, premium: true, enterprise: true }
  },
  {
    name: 'Basic Analytics',
    description: 'Simple performance tracking and insights',
    tiers: { mvp: true, standard: true, premium: true, enterprise: true }
  },
  {
    name: 'Advanced Analytics',
    description: 'In-depth performance metrics and trends',
    tiers: { mvp: false, standard: true, premium: true, enterprise: true }
  },
  {
    name: 'AI Content Suggestions',
    description: 'Smart recommendations for better content',
    tiers: { mvp: false, standard: false, premium: true, enterprise: true }
  },
  {
    name: 'Content Generation',
    description: 'AI-powered content creation tools',
    tiers: { mvp: false, standard: false, premium: false, enterprise: true }
  },
  {
    name: 'Fan Interaction Tools',
    description: 'Manage and engage with subscriber messages',
    tiers: { mvp: false, standard: true, premium: true, enterprise: true }
  },
  {
    name: 'White Labeling',
    description: 'Custom branding for your agency',
    tiers: { mvp: false, standard: false, premium: false, enterprise: true }
  },
  {
    name: 'Priority Support',
    description: 'Dedicated support and faster response times',
    tiers: { mvp: false, standard: false, premium: true, enterprise: true }
  }
];

export const TierFeatureSelection = ({ onFeaturesSelected }: TierFeatureSelectionProps) => {
  const [selectedTier, setSelectedTier] = useState<string>('mvp');
  const [selectedFeatures, setSelectedFeatures] = useState<FeatureItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [currentPrice, setCurrentPrice] = useState(0);

  // Initialize features with tier selection
  useEffect(() => {
    const initFeatures = features.map(feature => {
      // Reset selection when changing tiers
      return {
        ...feature,
        included: false
      };
    });
    setSelectedFeatures(initFeatures);
    // Reset current price to base price of selected tier
    const tier = tiers.find(t => t.id === selectedTier);
    if (tier) {
      setCurrentPrice(tier.basePrice);
    }
  }, [selectedTier]);

  // Get active tier object
  const activeTier = tiers.find(t => t.id === selectedTier) || tiers[0];

  // Filter features by tier and category
  const getFilteredFeatures = () => {
    let filteredFeatures = [...selectedFeatures];
    
    // Filter by tier level
    if (selectedTier === 'mvp') {
      filteredFeatures = filteredFeatures.filter(f => f.tier === 'mvp');
    } else if (selectedTier === 'advanced') {
      filteredFeatures = filteredFeatures.filter(f => f.tier === 'mvp' || f.tier === 'advanced');
    }
    
    // Filter by category if not showing all
    if (activeCategory !== 'all') {
      filteredFeatures = filteredFeatures.filter(f => f.category === activeCategory);
    }
    
    return filteredFeatures;
  };

  // Calculate selected features count
  const selectedCount = selectedFeatures.filter(f => f.included).length;
  
  // Calculate total time estimate
  const calculateTotalTime = () => {
    const baseDays = activeTier.baseTimeEstimate;
    const extraDays = selectedFeatures
      .filter(f => f.included)
      .reduce((total, feature) => total + feature.timeEstimate, 0);
    
    return baseDays + extraDays;
  };

  const totalTimeEstimate = calculateTotalTime();

  // Format time display
  const formatTimeEstimate = (days: number) => {
    if (days < 1) {
      return `${Math.round(days * 24)} hours`;
    }
    return days === 1 ? `${days} day` : `${days} days`;
  };

  // Handle feature toggle
  const handleFeatureToggle = (updatedFeatures: FeatureItem[]) => {
    // Count how many features would be selected
    const wouldBeSelectedCount = updatedFeatures.filter(f => f.included).length;
    
    // Check if we'd exceed the limit for MVP tier
    if (selectedTier === 'mvp' && wouldBeSelectedCount > 10) {
      setShowUpgradePrompt(true);
      return;
    }
    
    setSelectedFeatures(updatedFeatures);
    
    // Calculate selected features for parent component
    const selectedFeaturesList = updatedFeatures.filter(f => f.included);
    onFeaturesSelected(
      selectedFeaturesList,
      selectedTier,
      totalTimeEstimate,
      currentPrice
    );
  };

  // Handle tier selection
  const handleTierChange = (tierId: string) => {
    setSelectedTier(tierId);
    setShowUpgradePrompt(false);
    
    // Update price when changing tier
    const tier = tiers.find(t => t.id === tierId);
    if (tier) {
      setCurrentPrice(tier.basePrice);
    }
  };

  // Convert FeatureItem to Feature for FeatureSelection component
  const mapFeatureItemsToFeatures = (items: FeatureItem[]) => {
    return items.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      included: item.included,
      timeEstimate: item.timeEstimate,
      category: item.tier as "mvp" | "advanced" | "premium", // Map category to tier for compatibility
      recommended: item.recommended,
      roi: item.roi
    }));
  };

  // Handle features from FeatureSelection component
  const handleFeaturesFromSelection = (features: any[]) => {
    // Map the features back to FeatureItem format
    const updatedFeatures = selectedFeatures.map(original => {
      const updatedFeature = features.find(f => f.id === original.id);
      if (updatedFeature) {
        return {
          ...original,
          included: updatedFeature.included
        };
      }
      return original;
    });
    
    handleFeatureToggle(updatedFeatures);
  };

  return (
    <TooltipProvider>
      <section className="space-y-6">
        <GradientHeading className="text-2xl font-bold">
          Choose Your Features
        </GradientHeading>
        
        <div className="bg-black/20 border border-siso-text/10 rounded-lg p-6">
          {/* Introduction */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-2">Customize Your OnlyFans Management Platform</h3>
            <p className="text-siso-text">
              Select the features you need for your agency. The MVP tier is free and includes up to 10 features.
              Upgrade to Advanced or Premium for unlimited features and faster delivery.
            </p>
          </div>
          
          {/* Tier selection */}
          <div className="mb-8">
            <h3 className="text-md font-medium text-white mb-3">1. Select Your Tier</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {tiers.map((tier) => (
                <FeatureTierCard
                  key={tier.id}
                  name={tier.name}
                  price={tier.basePrice}
                  features={[
                    `${tier.maxFeatures === 'unlimited' ? 'Unlimited' : tier.maxFeatures} features`,
                    `${tier.baseTimeEstimate} day${tier.baseTimeEstimate !== 1 ? 's' : ''} base delivery`,
                    tier.id === 'premium' ? 'Priority support included' : 'Standard support',
                    tier.id !== 'mvp' ? 'Advanced features available' : 'Basic features only'
                  ]}
                  isActive={selectedTier === tier.id}
                  icon={tier.icon}
                  isRecommended={tier.recommended}
                  onClick={() => handleTierChange(tier.id)}
                />
              ))}
            </div>
          </div>
          
          {/* Feature categories filter */}
          <div className="mb-6">
            <h3 className="text-md font-medium text-white mb-3">2. Feature Categories</h3>
            <ToggleGroup 
              type="single" 
              value={activeCategory}
              onValueChange={(value) => value && setActiveCategory(value)}
              className="justify-start bg-black/30 p-1.5 rounded-lg border border-siso-text/10"
            >
              <ToggleGroupItem value="all" className="px-3 data-[state=on]:bg-siso-orange data-[state=on]:text-white">
                All
              </ToggleGroupItem>
              {featureCategories.map((category) => (
                <ToggleGroupItem 
                  key={category.id} 
                  value={category.id} 
                  className="px-3 data-[state=on]:bg-siso-orange data-[state=on]:text-white"
                >
                  {category.name}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
          
          {/* Features selection */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-md font-medium text-white">3. Select Features</h3>
              {selectedTier === 'mvp' ? (
                <div className="text-sm font-medium px-3 py-1 bg-black/30 rounded-full">
                  {selectedCount}/10 selected
                </div>
              ) : (
                <div className="text-sm font-medium px-3 py-1 bg-siso-orange/20 text-siso-orange rounded-full">
                  Unlimited features
                </div>
              )}
            </div>
            
            <FeatureSelection
              features={mapFeatureItemsToFeatures(getFilteredFeatures())}
              onChange={handleFeaturesFromSelection}
              filterCategory={activeCategory as any}
              showPricing={false}
            />
            
            {/* Show upgrade prompt if needed */}
            {showUpgradePrompt && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 bg-siso-orange/10 border border-siso-orange/30 rounded-lg"
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-siso-orange shrink-0 mt-1" />
                  <div>
                    <h4 className="text-white font-medium mb-1">Feature Limit Reached</h4>
                    <p className="text-sm text-siso-text mb-3">
                      You've reached the 10-feature limit for the MVP tier. Upgrade to Advanced or Premium for unlimited features.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleTierChange('advanced')}
                        className="bg-gradient-to-r from-siso-red to-siso-orange hover:opacity-90"
                      >
                        Upgrade to Advanced
                        <Star className="ml-2 h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowUpgradePrompt(false)}
                        className="border-siso-text/20 text-siso-text"
                      >
                        Stay with MVP
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
          
          {/* Development timeline */}
          <div className="mb-8 bg-black/30 border border-siso-text/10 rounded-lg p-4">
            <h3 className="text-md font-medium text-white mb-3">Development Timeline</h3>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
              <div className="flex items-center mb-2 sm:mb-0">
                <Clock className="h-5 w-5 text-siso-orange mr-2" />
                <div>
                  <div className="text-white font-medium">
                    {activeTier.baseTimeEstimate} days base + {formatTimeEstimate(totalTimeEstimate - activeTier.baseTimeEstimate)} for selected features
                  </div>
                  <div className="text-sm text-siso-text">Estimated time to complete your project</div>
                </div>
              </div>
              <div className="text-3xl font-bold text-siso-orange">
                {totalTimeEstimate} days
              </div>
            </div>
          </div>
          
          {/* Further details */}
          <div>
            <Button 
              onClick={() => {
                const selectedFeaturesList = selectedFeatures.filter(f => f.included);
                onFeaturesSelected(
                  selectedFeaturesList,
                  selectedTier,
                  totalTimeEstimate,
                  currentPrice
                );
              }}
              className="w-full bg-gradient-to-r from-siso-red to-siso-orange hover:opacity-90"
            >
              Confirm Feature Selection
              <CheckCircle className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Feature comparison table */}
        <div className="bg-black/20 border border-siso-text/10 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Features By Tier</h3>
          <TierComparison 
            features={tierFeatureComparison} 
            activeTier={selectedTier as any} 
          />
        </div>
      </section>
    </TooltipProvider>
  );
};
