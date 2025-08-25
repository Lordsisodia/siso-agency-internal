import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Wand2, 
  Clock, 
  DollarSign, 
  Users, 
  Lightbulb,
  FileText,
  Cog,
  CheckCircle,
  AlertCircle,
  Loader2,
  Zap,
  Brain
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { appPlanAgent } from '@/services/appPlanAgent';
import { GeneratedAppPlan } from '@/types/appPlan.types';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { AppPlanFeaturesOutput } from './AppPlanFeaturesOutput';

// Enhanced progress tracking interface
interface GenerationProgress {
  stage: 'idle' | 'initializing' | 'analyzing' | 'generating' | 'structuring' | 'finalizing' | 'complete' | 'error';
  progress: number;
  message: string;
  estimatedTimeRemaining?: number;
  startTime?: Date;
}

interface DemoBusinessData {
  businessName: string;
  industry: string;
  appPurpose: string;
  targetAudience: string;
  budget: string;
  timeline: string;
}

export function AppPlanGenerator() {
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedAppPlan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [generationProgress, setGenerationProgress] = useState<GenerationProgress>({
    stage: 'idle',
    progress: 0,
    message: 'Ready to generate your app plan'
  });
  const { toast } = useToast();

  // Demo business data for showcasing capabilities
  const demoBusinessData: DemoBusinessData = {
    businessName: "TechStart Solutions",
    industry: "Financial Technology",
    appPurpose: "Digital banking platform for small businesses",
    targetAudience: "Small business owners aged 25-45",
    budget: "£50,000 - £100,000",
    timeline: "6-8 months"
  };

  // Subscribe to progress updates from the auto-trigger system
  useEffect(() => {
    // Check if generation is already in progress
    const existingPlan = appPlanAgent.getLatestPlan();
    if (existingPlan) {
      setGeneratedPlan(existingPlan);
    }

    // Listen for progress updates (if auto-trigger system is enhanced with events)
    const handleProgressUpdate = (progress: GenerationProgress) => {
      setGenerationProgress(progress);
    };

    // Simulate subscribing to progress events
    window.addEventListener('appPlanProgress', handleProgressUpdate as any);
    
    return () => {
      window.removeEventListener('appPlanProgress', handleProgressUpdate as any);
    };
  }, []);

  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'initializing': return <Clock className="h-4 w-4" />;
      case 'analyzing': return <Brain className="h-4 w-4" />;
      case 'generating': return <Zap className="h-4 w-4" />;
      case 'structuring': return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'finalizing': return <CheckCircle className="h-4 w-4" />;
      case 'complete': return <CheckCircle className="h-4 w-4" />;
      case 'error': return <AlertCircle className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'initializing': return 'bg-blue-500';
      case 'analyzing': return 'bg-purple-500';
      case 'generating': return 'bg-orange-500';
      case 'structuring': return 'bg-yellow-500';
      case 'finalizing': return 'bg-green-500';
      case 'complete': return 'bg-green-600';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const formatTimeRemaining = (seconds?: number): string => {
    if (!seconds) return '';
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const handleDemoGeneration = async () => {
    setIsGenerating(true);
    setError(null);
    setIsDemoMode(true);
    setGenerationProgress({
      stage: 'initializing',
      progress: 10,
      message: `Setting up AI analysis for ${demoBusinessData.businessName}...`,
      startTime: new Date(),
      estimatedTimeRemaining: 25
    });

    toast({
      title: "🎯 Demo Mode Activated",
      description: "Showcasing AI capabilities with sample business data..."
    });

    try {
      // Simulate realistic progress updates with demo data
      const progressUpdates = [
        { 
          stage: 'analyzing', 
          progress: 25, 
          message: `Analyzing ${demoBusinessData.industry} market trends and requirements...`, 
          estimatedTimeRemaining: 20 
        },
        { 
          stage: 'generating', 
          progress: 50, 
          message: `AI generating comprehensive plan for ${demoBusinessData.appPurpose}...`, 
          estimatedTimeRemaining: 15 
        },
        { 
          stage: 'structuring', 
          progress: 80, 
          message: `Organizing features for ${demoBusinessData.targetAudience}...`, 
          estimatedTimeRemaining: 8 
        },
        { 
          stage: 'finalizing', 
          progress: 95, 
          message: `Finalizing ${demoBusinessData.budget} budget analysis and timeline...`, 
          estimatedTimeRemaining: 3 
        }
      ];

      // Simulate realistic progress updates
      for (const update of progressUpdates) {
        await new Promise(resolve => setTimeout(resolve, 3000));
        setGenerationProgress({
          ...update,
          startTime: generationProgress.startTime
        } as GenerationProgress);
      }

      // Create demo plan
      const demoPlan: GeneratedAppPlan = {
        id: `demo-${Date.now()}`,
        clientId: 'demo-client',
        businessName: demoBusinessData.businessName,
        executiveSummary: `${demoBusinessData.businessName} is positioned to revolutionize small business banking through AI-powered financial insights and seamless digital banking experiences. This comprehensive platform will serve ${demoBusinessData.targetAudience} with advanced transaction management, real-time analytics, and intuitive mobile-first design.`,
        features: [
          {
            id: 'secure-auth',
            name: 'Multi-Factor Authentication',
            description: 'Enterprise-grade security with biometric and SMS authentication for business banking',
            priority: 'high',
            complexity: 'moderate',
            estimatedHours: 120,
            dependencies: [],
            userStories: [
              'As a business owner, I want secure access to my banking platform so that my financial data is protected.',
              'As a user, I want biometric login so that I can access my account quickly and securely.'
            ]
          },
          {
            id: 'dashboard-analytics',
            name: 'Financial Dashboard & Analytics',
            description: 'Real-time business financial insights with interactive charts and reporting',
            priority: 'high',
            complexity: 'complex',
            estimatedHours: 200,
            dependencies: ['secure-auth'],
            userStories: [
              'As a business owner, I want to see my financial performance at a glance so that I can make informed decisions.',
              'As a user, I want customizable date ranges so that I can analyze specific time periods.'
            ]
          },
          {
            id: 'transaction-management',
            name: 'Smart Transaction Management',
            description: 'Automated categorization and management of business transactions with AI insights',
            priority: 'high',
            complexity: 'complex',
            estimatedHours: 180,
            dependencies: ['secure-auth', 'dashboard-analytics'],
            userStories: [
              'As a business owner, I want my transactions automatically categorized so that I can track expenses efficiently.',
              'As a user, I want to override AI categorization so that I have control over my data.'
            ]
          },
          {
            id: 'mobile-app',
            name: 'Native Mobile Application',
            description: 'iOS and Android apps with full feature parity and offline capabilities',
            priority: 'medium',
            complexity: 'complex',
            estimatedHours: 300,
            dependencies: ['secure-auth', 'transaction-management'],
            userStories: [
              'As a business owner, I want to manage my finances on-the-go so that I can stay connected to my business.',
              'As a mobile user, I want offline functionality so that I can access my data without internet.'
            ]
          },
          {
            id: 'api-integrations',
            name: 'Third-Party Integrations',
            description: 'Seamless integration with popular accounting and business management tools',
            priority: 'medium',
            complexity: 'moderate',
            estimatedHours: 150,
            dependencies: ['transaction-management'],
            userStories: [
              'As a business owner, I want my banking data synced with my accounting software so that I can streamline my workflow.',
              'As an accountant, I want automated data synchronization so that I can eliminate manual entry.'
            ]
          }
        ],
        technicalRequirements: {
          platform: 'cross-platform',
          techStack: {
            frontend: ['React', 'TypeScript', 'React Native'],
            backend: ['Node.js', 'Express', 'TypeScript'],
            database: ['PostgreSQL', 'Redis'],
            apis: ['REST API', 'GraphQL', 'WebSocket']
          },
          architecture: 'Microservices with API Gateway',
          scalability: 'Auto-scaling on AWS with load balancing',
          security: ['OAuth 2.0', 'JWT', 'AES-256 encryption', 'PCI DSS compliance'],
          integrations: ['Open Banking APIs', 'QuickBooks', 'Xero', 'Stripe']
        },
        developmentPhases: [
          {
            id: 'phase-1',
            name: 'Foundation & Security',
            description: 'Core authentication, security implementation, and basic dashboard',
            features: ['secure-auth'],
            estimatedDuration: '8 weeks',
            milestones: ['Authentication system complete', 'Security audit passed', 'Basic dashboard deployed'],
            deliverables: ['Authentication system', 'Basic dashboard', 'Security documentation']
          },
          {
            id: 'phase-2',
            name: 'Core Features',
            description: 'Full analytics dashboard and transaction management',
            features: ['dashboard-analytics', 'transaction-management'],
            estimatedDuration: '12 weeks',
            milestones: ['Analytics dashboard complete', 'Transaction system live', 'AI categorization trained'],
            deliverables: ['Full analytics dashboard', 'Transaction management system', 'Admin panel']
          },
          {
            id: 'phase-3',
            name: 'Mobile & Integrations',
            description: 'Mobile applications and third-party integrations',
            features: ['mobile-app', 'api-integrations'],
            estimatedDuration: '8 weeks',
            milestones: ['Mobile apps published', 'Integrations live', 'Documentation complete'],
            deliverables: ['iOS and Android apps', 'Third-party integrations', 'API documentation']
          }
        ],
        costBreakdown: {
          development: 95000,
          design: 15000,
          testing: 12000,
          deployment: 8000,
          maintenance: 18000,
          total: 148000,
          currency: 'GBP'
        },
        uiuxPlan: {
          designSystem: 'Material Design 3 with custom financial iconography',
          colorScheme: 'Professional dark theme with blue/green accents for financial data',
          typography: 'Inter font family for clarity and professional appearance',
          userFlow: ['Login → Dashboard → Transaction View → Insights → Settings'],
          wireframes: ['Dashboard layout', 'Transaction management', 'Mobile navigation', 'Settings panel'],
          accessibility: ['WCAG 2.1 AA compliance', 'Screen reader support', 'Keyboard navigation', 'High contrast mode']
        },
        totalTimelineWeeks: 28,
        mvpTimelineWeeks: 16,
        recommendedMVPFeatures: ['secure-auth', 'dashboard-analytics', 'transaction-management'],
        marketAnalysis: 'The UK SME banking market is worth £12B annually with only 33% digital adoption rate. Key opportunities include Open Banking APIs, government digitization initiatives, and post-pandemic digital transformation. Main competitors include Revolut Business, Tide, and traditional banks. Our AI-powered insights provide clear differentiation.',
        competitorInsights: [
          'Revolut Business: Strong mobile experience but limited AI insights',
          'Tide: Good SME focus but basic analytics capabilities',
          'Traditional banks: Comprehensive services but poor digital experience',
          'Opportunity: AI-powered financial insights with superior UX'
        ],
        revenueModel: [
          'Subscription tiers: Basic (£15/month), Professional (£45/month), Enterprise (£95/month)',
          'Transaction fees: 0.1% on high-volume transactions',
          'Premium features: Advanced analytics, custom integrations',
          'Partner revenue: Referral fees from accounting software integrations'
        ],
        risksAndMitigation: [
          'Regulatory risk: Early engagement with FCA and compliance experts',
          'Competition risk: Focus on AI differentiation and superior UX',
          'Technical risk: Proven tech stack and experienced development team',
          'Market risk: Phased rollout with early customer feedback loops'
        ],
        generatedAt: new Date().toISOString(),
        modelUsed: 'Google Gemini 2.0 Flash',
        version: '1.0',
        confidence: 92,
        status: 'draft'
      };

      await new Promise(resolve => setTimeout(resolve, 1000));

      setGenerationProgress({
        stage: 'complete',
        progress: 100,
        message: 'Demo app plan generated successfully!',
        startTime: generationProgress.startTime
      });

      setGeneratedPlan(demoPlan);
      
      toast({
        title: "✅ Demo Plan Generated!",
        description: `Complete business plan created for ${demoPlan.businessName}`,
        duration: 6000
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Demo generation failed';
      setError(errorMessage);
      setGenerationProgress({
        stage: 'error',
        progress: 0,
        message: errorMessage,
        startTime: generationProgress.startTime
      });
      
      toast({
        title: "❌ Demo Generation Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    setError(null);
    setIsDemoMode(false);
    setGenerationProgress({
      stage: 'initializing',
      progress: 10,
      message: 'Setting up AI analysis...',
      startTime: new Date(),
      estimatedTimeRemaining: 45
    });
    
    try {
      // Get business data from onboarding
      const inputData = appPlanAgent.createInputFromOnboardingData();
      
      if (!inputData) {
        throw new Error('No business data found. Please complete onboarding first.');
      }

      toast({
        title: "🤖 AI Agent Activated",
        description: "Analyzing your business requirements..."
      });

      // Simulate progress updates during generation
      const progressUpdates = [
        { stage: 'analyzing', progress: 25, message: `Analyzing ${inputData.industry} industry requirements...`, estimatedTimeRemaining: 35 },
        { stage: 'generating', progress: 50, message: 'AI generating comprehensive app plan...', estimatedTimeRemaining: 20 },
        { stage: 'structuring', progress: 80, message: 'Organizing recommendations and features...', estimatedTimeRemaining: 10 },
        { stage: 'finalizing', progress: 95, message: 'Finalizing plan with timeline and costs...', estimatedTimeRemaining: 5 }
      ];

      // Simulate realistic progress updates
      for (const update of progressUpdates) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        setGenerationProgress({
          ...update,
          startTime: generationProgress.startTime
        } as GenerationProgress);
      }

      // Generate plan with AI
      const plan = await appPlanAgent.generatePlan(inputData, {
        model: 'gpt-4',
        includeMarketAnalysis: true,
        includeCostEstimates: true,
        includeWireframes: false,
        detailLevel: 'detailed',
        focusAreas: ['technical', 'business', 'design']
      });

      setGenerationProgress({
        stage: 'complete',
        progress: 100,
        message: 'App plan generated successfully!',
        startTime: generationProgress.startTime
      });

      setGeneratedPlan(plan);
      
      toast({
        title: "✅ App Plan Generated!",
        description: `Features plan created for ${plan.businessName}`
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate plan';
      setError(errorMessage);
      setGenerationProgress({
        stage: 'error',
        progress: 0,
        message: errorMessage,
        startTime: generationProgress.startTime
      });
      
      toast({
        title: "❌ Generation Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Check if we have existing plan
  const existingPlan = appPlanAgent.getLatestPlan();
  const planToShow = generatedPlan || existingPlan;

  const resetGeneration = () => {
    setGeneratedPlan(null);
    setError(null);
    setIsDemoMode(false);
    setGenerationProgress({
      stage: 'idle',
      progress: 0,
      message: 'Ready to generate your app plan'
    });
    // Clear stored plan for fresh generation
    localStorage.removeItem('latest-app-plan');
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Header with Status */}
      <Card className="bg-gradient-to-r from-gray-800/80 to-gray-900/80 border-gray-700/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <CardTitle className="text-white">AI App Plan Generator</CardTitle>
                <p className="text-gray-400 text-sm mt-1">
                  Powered by Google Gemini 2.0 Flash • 100% Free AI
                </p>
              </div>
            </div>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              {planToShow ? 'Plan Generated' : 'Ready'}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Enhanced Progress Display */}
      <AnimatePresence>
        {(isGenerating || generationProgress.stage !== 'idle') && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <Card className="bg-gray-800/60 border-gray-700/50">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Progress Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getStageColor(generationProgress.stage)}`}>
                        {getStageIcon(generationProgress.stage)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white capitalize">
                          {generationProgress.stage.replace('-', ' ')}
                        </h3>
                        <p className="text-sm text-gray-400">
                          {generationProgress.message}
                        </p>
                      </div>
                    </div>
                    {generationProgress.estimatedTimeRemaining && (
                      <div className="text-right">
                        <div className="text-sm text-gray-400">Est. Time</div>
                        <div className="text-orange-400 font-mono">
                          {formatTimeRemaining(generationProgress.estimatedTimeRemaining)}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Progress</span>
                      <span className="text-white font-mono">{generationProgress.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <motion.div
                        className={`h-2 rounded-full ${getStageColor(generationProgress.stage)}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${generationProgress.progress}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>

                  {/* Stage Indicators */}
                  <div className="flex justify-between items-center">
                    {['initializing', 'analyzing', 'generating', 'structuring', 'finalizing', 'complete'].map((stage, index) => (
                      <div key={stage} className="flex flex-col items-center gap-1">
                        <div className={`w-3 h-3 rounded-full ${
                          generationProgress.stage === stage || (generationProgress.stage === 'complete' && index < 6)
                            ? getStageColor(stage)
                            : 'bg-gray-600'
                        }`} />
                        <span className="text-xs text-gray-500 capitalize">
                          {stage}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generation Controls */}
      <Card className="bg-gray-800/60 border-gray-700/50">
        <CardContent className="p-6">
          <div className="space-y-4">
            {!planToShow && !isGenerating && (
              <div className="text-center space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-white">
                    Generate Your AI App Plan
                  </h3>
                  <p className="text-gray-400">
                    Create a comprehensive app development plan using AI analysis of your business requirements.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={handleGeneratePlan}
                    disabled={isGenerating}
                    size="lg"
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating Plan...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Generate AI App Plan
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleDemoGeneration}
                    disabled={isGenerating}
                    size="lg"
                    variant="outline"
                    className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10 hover:border-purple-400"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Demo Running...
                      </>
                    ) : (
                      <>
                        <Brain className="w-4 h-4 mr-2" />
                        Try Demo Mode
                      </>
                    )}
                  </Button>
                </div>
                <div className="text-xs text-gray-500 max-w-md mx-auto">
                  <p><strong>Demo Mode:</strong> Experience our AI capabilities with pre-configured business data (FinTech startup)</p>
                  <p><strong>Regular Mode:</strong> Generate a plan using your business data from onboarding</p>
                </div>
              </div>
            )}

            {planToShow && (
              <div className="text-center space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-white">
                    {isDemoMode ? '🎯 Demo Plan Ready' : `Plan Ready for ${planToShow.businessName}`}
                  </h3>
                  <p className="text-gray-400">
                    {isDemoMode 
                      ? 'Demo plan showcasing AI capabilities with sample FinTech business data.' 
                      : 'Your comprehensive app development plan has been generated successfully.'
                    }
                  </p>
                </div>
                <div className="flex gap-3 justify-center">
                  {isDemoMode && (
                    <Button
                      onClick={handleGeneratePlan}
                      className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Generate Real Plan
                    </Button>
                  )}
                  <Button
                    onClick={resetGeneration}
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    {isDemoMode ? 'Try Another Demo' : 'Generate New Plan'}
                  </Button>
                </div>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <div className="flex items-center gap-2 text-red-400">
                  <AlertCircle className="w-4 h-4" />
                  <span className="font-medium">Generation Error</span>
                </div>
                <p className="text-sm text-gray-300 mt-2">{error}</p>
                <Button
                  onClick={handleGeneratePlan}
                  size="sm"
                  className="mt-3 bg-red-600 hover:bg-red-700"
                >
                  Try Again
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Plan Display */}
      {planToShow && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <AppPlanFeaturesOutput plan={planToShow} />
        </motion.div>
      )}
    </div>
  );
} 