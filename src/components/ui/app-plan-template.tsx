/**
 * App Plan & Project Detail Templates
 * 
 * Comprehensive templates for app development plans, project details, and feature management.
 * Extracted from the project detail pages including wireframes, features, and development phases.
 * 
 * Available Templates:
 * 1. AppPlanPhaseTemplate - Multi-phase development plan with collapsible sections
 * 2. FeatureDashboardTemplate - Feature request and management system with token allocation
 * 3. WireframeGridTemplate - Grid layout for wireframes with status filtering
 * 4. ProjectMetricsTemplate - Project statistics and progress tracking
 * 
 * Key Features:
 * - Phase-based development planning
 * - Interactive feature management with token allocation
 * - Wireframe organization with status tracking
 * - Progress visualization and metrics
 * - Responsive design with animations
 * - Collapsible content sections
 * 
 * Usage:
 * <AppPlanPhaseTemplate 
 *   projectName="My App"
 *   phases={developmentPhases}
 *   onExportPlan={() => {}}
 * />
 */

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  FileCheck, 
  ChevronDown, 
  CheckCircle, 
  ExternalLink, 
  Code, 
  Sparkles,
  BarChart4,
  Calendar,
  Users,
  Coins,
  Activity,
  Circle,
  LucideIcon,
  AlertTriangle,
  FileIcon,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// Types for App Plan Templates
export interface AppPlanPhase {
  id: string;
  title: string;
  description: string;
  subsections: AppPlanSubsection[];
}

export interface AppPlanSubsection {
  id: string;
  title: string;
  content: React.ReactNode;
  actionableSteps?: string[];
  expectedOutcomes?: string[];
  bestPractices?: string[];
  notionLink?: string;
}

export interface ProjectFeature {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  category: string;
  estimatedCost: number;
  tokenAmount: number;
  tokenSymbol?: string;
  timeEstimateDays: number;
}

export interface ProjectWireframe {
  id: string;
  title: string;
  description: string;
  status: 'planned' | 'in-progress' | 'complete';
  category: string;
  imageUrl?: string;
  tags: string[];
}

// App Plan Phase Template Component
interface AppPlanPhaseTemplateProps {
  projectName?: string;
  projectDescription?: string;
  phases: AppPlanPhase[];
  className?: string;
  onExportPlan?: () => void;
  onEditPlan?: () => void;
}

export function AppPlanPhaseTemplate({
  projectName = "Development Plan",
  projectDescription = "Comprehensive roadmap for development lifecycle",
  phases = [],
  className = "",
  onExportPlan,
  onEditPlan
}: AppPlanPhaseTemplateProps) {
  const [activePhaseId, setActivePhaseId] = useState(phases[0]?.id || "");
  const phaseSectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    const sectionRef = phaseSectionRefs.current[activePhaseId];
    if (sectionRef) {
      sectionRef.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [activePhaseId]);

  return (
    <div className={`space-y-8 ${className}`}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">{projectName}</h2>
          <p className="text-gray-400">{projectDescription}</p>
        </div>
        <div className="flex gap-3">
          {onExportPlan && (
            <Button onClick={onExportPlan} className="bg-orange-600 hover:bg-orange-700 text-white">
              Export Plan
            </Button>
          )}
          {onEditPlan && (
            <Button onClick={onEditPlan} variant="outline" className="border-white/10 text-white">
              Edit Plan
            </Button>
          )}
        </div>
      </div>

      <div className="relative">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="sticky top-4 z-10 mb-4"
        >
          <div className="bg-black/50 backdrop-blur-md rounded-lg border border-white/10 p-4">
            <div className="flex flex-wrap gap-2">
              {phases.map(phase => (
                <Button 
                  key={phase.id}
                  variant={activePhaseId === phase.id ? "default" : "outline"}
                  className={activePhaseId === phase.id 
                    ? "bg-orange-600 hover:bg-orange-700 text-white border-transparent" 
                    : "bg-transparent border-white/10 text-white hover:bg-white/5"
                  }
                  onClick={() => setActivePhaseId(phase.id)}
                >
                  {phase.title}
                </Button>
              ))}
            </div>
          </div>
        </motion.div>

        <div className="mt-8 space-y-12">
          {phases.map(phase => (
            <div 
              key={phase.id} 
              id={phase.id}
              ref={el => phaseSectionRefs.current[phase.id] = el}
              className="scroll-mt-20"
            >
              <Card className="mb-8 border border-white/10 bg-black/20">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
                    <div>
                      <h3 className="text-xl font-semibold text-white">{phase.title}</h3>
                      <p className="text-lg text-orange-400">{phase.description}</p>
                    </div>
                    <Badge variant="outline" className="bg-orange-600/10 text-orange-400 border-orange-600/20 px-3 py-1">
                      {phase.id.replace("-", " ").toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {phase.subsections.map(subsection => (
                    <Collapsible 
                      key={subsection.id}
                      defaultOpen={true}
                      className="border border-white/10 rounded-lg overflow-hidden"
                    >
                      <CollapsibleTrigger className="w-full p-4 flex items-center justify-between bg-black/20 hover:bg-black/30 transition-colors">
                        <h4 className="text-md font-medium text-white text-left">{subsection.title}</h4>
                        <div className="flex items-center">
                          <Badge className="mr-2 bg-orange-600 hover:bg-orange-700">Details</Badge>
                          <ChevronDown className="h-5 w-5 text-orange-400 transition-transform duration-200" />
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="p-4 bg-black/10">
                        {subsection.content}
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Feature Dashboard Template Component
interface FeatureDashboardTemplateProps {
  features: ProjectFeature[];
  totalTokens?: number;
  tokenSymbol?: string;
  totalCost?: number;
  currencySymbol?: string;
  onFeatureClick?: (feature: ProjectFeature) => void;
  onAddFeature?: () => void;
  className?: string;
}

export function FeatureDashboardTemplate({
  features = [],
  totalTokens,
  tokenSymbol = "TOKENS",
  totalCost = 5000,
  currencySymbol = "£",
  onFeatureClick,
  onAddFeature,
  className = ""
}: FeatureDashboardTemplateProps) {
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

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
  const calculatedTotalTokens = totalTokens || features.reduce((sum, f) => sum + f.tokenAmount, 0);
  const totalDays = features.reduce((sum, f) => sum + f.timeEstimateDays, 0);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <Card className={`bg-black/10 backdrop-blur-sm border-none p-6 rounded-xl overflow-hidden relative ${className}`}>
      {/* Token Summary Dashboard */}
      {features.length > 0 && (
        <div className="bg-gradient-to-r from-indigo-900/20 to-purple-900/20 rounded-xl p-6 mb-8 border border-indigo-500/20">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            Feature Overview
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-black/30 rounded-lg p-4 border border-indigo-500/20 backdrop-blur-sm">
              <div className="text-sm text-gray-400 mb-1">Features</div>
              <div className="text-2xl font-bold text-white">{features.length}</div>
              <div className="flex flex-col gap-1 mt-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400 flex items-center gap-1">
                    <Circle className="w-2 h-2" /> Pending
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
            
            <div className="bg-black/30 rounded-lg p-4 border border-indigo-500/20 backdrop-blur-sm">
              <div className="text-sm text-gray-400 mb-1">Total Tokens</div>
              <div className="text-2xl font-bold text-indigo-300">
                {formatNumber(calculatedTotalTokens)} {tokenSymbol}
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Avg: {formatNumber(calculatedTotalTokens / features.length)}
              </div>
            </div>
            
            <div className="bg-black/30 rounded-lg p-4 border border-indigo-500/20 backdrop-blur-sm">
              <div className="text-sm text-gray-400 mb-1">Timeline</div>
              <div className="text-2xl font-bold text-blue-400">{totalDays} days</div>
              <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
                <Calendar className="w-3 h-3" /> Est. completion
              </div>
            </div>
            
            <div className="bg-black/30 rounded-lg p-4 border border-indigo-500/20 backdrop-blur-sm">
              <div className="text-sm text-gray-400 mb-1">Total Cost</div>
              <div className="text-2xl font-bold text-green-400">
                {currencySymbol}{totalCost.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500 mt-2">Package price</div>
            </div>
          </div>
        </div>
      )}

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {features.length > 0 ? (
          features.map(feature => (
            <motion.div
              key={feature.id}
              whileHover={{ scale: 1.02 }}
              className="cursor-pointer"
              onClick={() => onFeatureClick?.(feature)}
            >
              <Card className="bg-black/30 border-white/10 hover:border-orange-500/40 transition-all h-full">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <Badge 
                      variant="outline" 
                      className={cn(
                        feature.status === 'completed' ? 'border-green-500/30 text-green-400' :
                        feature.status === 'in_progress' ? 'border-blue-500/30 text-blue-400' :
                        'border-gray-500/30 text-gray-400'
                      )}
                    >
                      {feature.status.replace('_', ' ')}
                    </Badge>
                    <Badge 
                      variant="outline"
                      className={cn(
                        feature.priority === 'high' ? 'border-red-500/30 text-red-400' :
                        feature.priority === 'medium' ? 'border-yellow-500/30 text-yellow-400' :
                        'border-blue-500/30 text-blue-400'
                      )}
                    >
                      {feature.priority}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg text-white">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 text-sm mb-4 line-clamp-3">{feature.description}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Tokens:</span>
                      <span className="text-indigo-400">{formatNumber(feature.tokenAmount)} {feature.tokenSymbol || tokenSymbol}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Timeline:</span>
                      <span className="text-blue-400">{feature.timeEstimateDays} days</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Category:</span>
                      <span className="text-gray-300">{feature.category}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full text-center py-8 bg-black/20 rounded-lg border border-white/10">
            <p className="text-gray-400">No features have been added yet.</p>
            {onAddFeature && (
              <Button onClick={onAddFeature} className="mt-4 bg-orange-600 hover:bg-orange-700">
                <Plus className="mr-2 h-4 w-4" />
                Add Feature
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

// Wireframe Grid Template Component
interface WireframeGridTemplateProps {
  wireframes: ProjectWireframe[];
  onWireframeClick?: (wireframe: ProjectWireframe) => void;
  onAddWireframe?: () => void;
  loading?: boolean;
  error?: string;
  className?: string;
}

export function WireframeGridTemplate({
  wireframes = [],
  onWireframeClick,
  onAddWireframe,
  loading = false,
  error,
  className = ""
}: WireframeGridTemplateProps) {
  const [activeTab, setActiveTab] = useState('all');

  const complete = wireframes.filter(w => w.status === 'complete');
  const inProgress = wireframes.filter(w => w.status === 'in-progress');
  const planned = wireframes.filter(w => w.status === 'planned');

  if (loading) {
    return (
      <div className={`space-y-6 text-white ${className}`}>
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Wireframes</h2>
          <Button disabled className="bg-indigo-500 hover:bg-indigo-600 text-white">
            <Plus className="mr-2 h-4 w-4" />
            Add Wireframe
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-64 bg-gray-800 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-8 text-center border rounded-lg border-red-800 bg-red-950/30 ${className}`}>
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2 text-white">Error loading wireframes</h3>
        <p className="text-gray-300 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()} className="bg-indigo-600 hover:bg-indigo-500 text-white">
          Retry
        </Button>
      </div>
    );
  }

  if (wireframes.length === 0) {
    return (
      <div className={`p-8 text-center border rounded-lg border-gray-700 bg-gray-800/50 ${className}`}>
        <FileIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2 text-white">No wireframes found</h3>
        <p className="text-gray-300 mb-6">Get started by creating your first wireframe</p>
        {onAddWireframe && (
          <Button onClick={onAddWireframe} className="bg-indigo-600 hover:bg-indigo-500 text-white">
            <Plus className="mr-2 h-4 w-4" />
            Create Wireframe
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Wireframes ({wireframes.length})</h2>
        {onAddWireframe && (
          <Button onClick={onAddWireframe} className="bg-indigo-600 hover:bg-indigo-500 text-white">
            <Plus className="mr-2 h-4 w-4" />
            Add Wireframe
          </Button>
        )}
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-gray-800">
          <TabsTrigger value="all">All ({wireframes.length})</TabsTrigger>
          <TabsTrigger value="complete">Complete ({complete.length})</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress ({inProgress.length})</TabsTrigger>
          <TabsTrigger value="planned">Planned ({planned.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wireframes.map((wireframe) => (
              <WireframeCard
                key={wireframe.id}
                wireframe={wireframe}
                onClick={() => onWireframeClick?.(wireframe)}
              />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="complete" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {complete.map((wireframe) => (
              <WireframeCard
                key={wireframe.id}
                wireframe={wireframe}
                onClick={() => onWireframeClick?.(wireframe)}
              />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="in-progress" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {inProgress.map((wireframe) => (
              <WireframeCard
                key={wireframe.id}
                wireframe={wireframe}
                onClick={() => onWireframeClick?.(wireframe)}
              />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="planned" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {planned.map((wireframe) => (
              <WireframeCard
                key={wireframe.id}
                wireframe={wireframe}
                onClick={() => onWireframeClick?.(wireframe)}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Wireframe Card Component
interface WireframeCardProps {
  wireframe: ProjectWireframe;
  onClick?: () => void;
}

function WireframeCard({ wireframe, onClick }: WireframeCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'in-progress':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'planned':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="cursor-pointer"
      onClick={onClick}
    >
      <Card className="bg-black/30 border-white/10 hover:border-indigo-500/40 transition-all overflow-hidden h-full">
        <div className="h-6 w-full bg-indigo-600"></div>
        <div className="p-4 bg-indigo-900/40">
          <h3 className="font-medium text-white mb-2">{wireframe.title}</h3>
          <p className="text-gray-300 text-sm mb-3 line-clamp-2">{wireframe.description}</p>
        </div>
        <div className="p-4">
          <div className="flex gap-2 mb-3">
            <Badge variant="outline" className={getStatusColor(wireframe.status)}>
              {wireframe.status.replace('-', ' ')}
            </Badge>
            <Badge variant="outline" className="border-gray-500/30 text-gray-400">
              {wireframe.category}
            </Badge>
          </div>
          <div className="flex flex-wrap gap-1">
            {wireframe.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs bg-gray-700 text-gray-300">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}