import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  Loader2, 
  ArrowRight, 
  Calendar, 
  DollarSign, 
  Users, 
  MessageSquare, 
  FileText, 
  BarChart, 
  Shield, 
  Settings, 
  ExternalLink,
  Sparkles,
  TrendingUp,
  Clock,
  Info,
  Target
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MessageLoading } from '@/components/ui/message-loading';
import { CaseStudy } from '@/components/plan/CaseStudy';
import { WelcomeMessage } from '@/components/plan/WelcomeMessage';
import { PainPointsModal, PainPointDetailProps } from '@/components/plan/PainPointsModal';
import { PlanReviewSummary } from '@/components/plan/PlanReviewSummary';
import { AgencyPainPoints } from '@/components/plan/AgencyPainPoints';
import { ROICalculator } from '@/components/plan/ROICalculator';
import { FeatureSection } from '@/components/plan/FeatureSection';
import { InteractiveCallout } from '@/components/plan/InteractiveCallout';
import { EnhancedNextSteps } from '@/components/plan/EnhancedNextSteps';
import { caseStudies } from '@/data/plan/featureData';
import { ImplementationPlan } from '@/components/plan/ImplementationPlan';
import { usePlanData, PlanDataType } from '@/hooks/usePlanData';
import { Button } from '@/components/ui/button';
import { GradientHeading } from '@/components/ui/gradient-heading';
import { supabase } from '@/integrations/supabase/client';
import { PlanComments } from '@/components/plan/NewsCardComments';
import { usePlanViewTracking } from '@/hooks/usePlanViewTracking';

// Mapping of agency-specific URLs to industry types
const AGENCY_TO_INDUSTRY_MAP: Record<string, string> = {
  'decora': 'onlyfans-management',
  'default': 'onlyfans-management',
  // Add more mappings as needed
};

interface PlanComment {
  id: string;
  content: string;
  created_at: string;
  author_email: string;
  updated_at: string;
  plan_id: string;
}

const Plan = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { loading, planData, error } = usePlanData(username);
  const [selectedColor, setSelectedColor] = useState('#3182CE');
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [showPainPointModal, setShowPainPointModal] = useState(false);
  const [selectedPainPoint, setSelectedPainPoint] = useState<PainPointDetailProps | null>(null);
  const [showSolutionsSection, setShowSolutionsSection] = useState(false);
  const [showFeatureSelection, setShowFeatureSelection] = useState(true);
  const [totalTime, setTotalTime] = useState<number>(14);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const mainContentRef = useRef<HTMLDivElement>(null);
  
  // Add new hooks for comments
  const [comments, setComments] = useState<PlanComment[]>([]);
  
  // Track view
  usePlanViewTracking(planData?.id || '');

  useEffect(() => {
    const fetchComments = async () => {
      if (!planData?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('plan_comments')
          .select('*')
          .eq('plan_id', planData.id)
          .order('created_at', { ascending: true });

        if (error) throw error;
        setComments(data || []);
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    };

    fetchComments();
  }, [planData?.id]);
  
  useEffect(() => {
    if (planData) {
      setSelectedColor(planData.branding?.primary_color || '#3182CE');
      if (planData.estimated_days) {
        setTotalTime(planData.estimated_days);
      }
      if (planData.estimated_cost) {
        setTotalPrice(planData.estimated_cost);
      }
    }
  }, [planData]);
  
  const handlePainPointClick = (painPoint: PainPointDetailProps) => {
    setSelectedPainPoint(painPoint);
    setShowPainPointModal(true);
  };
  
  const handleShowSolutions = () => {
    setShowSolutionsSection(true);
    
    setTimeout(() => {
      if (mainContentRef.current) {
        const solutionsSection = mainContentRef.current.querySelector('#solutions-section');
        if (solutionsSection) {
          solutionsSection.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }, 100);
  };
  
  const handleFinalizeFeatures = (features: string[]) => {
    setSelectedFeatures(features);
    
    setTimeout(() => {
      const reviewSection = document.getElementById('review-section');
      if (reviewSection) {
        reviewSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 300);
  };
  
  const handleShowFeatures = () => {
    setShowFeatureSelection(true);
    
    setTimeout(() => {
      if (mainContentRef.current) {
        const featuresSection = mainContentRef.current.querySelector('#features-section');
        if (featuresSection) {
          featuresSection.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }, 100);
  };
  
  const handleApprovePlan = async () => {
    setIsSubmitting(true);
    
    try {
      if (username && planData) {
        // Update the plan status in the database
        const { error } = await supabase
          .from('plans')
          .update({ 
            status: 'approved',
            features: selectedFeatures
          })
          .eq('username', username);
          
        if (error) {
          throw error;
        }
      }
      
      toast({
        title: "Plan Approved!",
        description: "Your selections have been saved. We'll contact you shortly to begin implementation.",
      });
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (error) {
      console.error('Error approving plan:', error);
      toast({
        title: "Error Approving Plan",
        description: "There was a problem saving your plan. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-b from-black via-siso-bg to-black p-4 md:p-8">
        <div className="text-center space-y-4">
          <MessageLoading className="justify-center mb-4" />
          <h2 className="text-xl font-semibold text-white">Loading your personalized plan...</h2>
          <p className="text-siso-text">We're preparing everything just for you</p>
        </div>
      </div>
    );
  }
  
  if (error || !planData) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-b from-black via-siso-bg to-black p-4 md:p-8">
        <div className="text-center">
          <h2 className="mb-2 text-2xl font-bold text-white">Plan Not Found</h2>
          <p className="mb-6 text-siso-text">We couldn't find a plan for this username.</p>
          <Button onClick={() => navigate('/')} variant="default">
            Go Home
          </Button>
        </div>
      </div>
    );
  }
  
  // Get the industry type for the current agency
  const industryType = planData.industry_type || 
    (username ? AGENCY_TO_INDUSTRY_MAP[username] || AGENCY_TO_INDUSTRY_MAP.default : 'onlyfans-management');
  
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-black via-siso-bg to-black p-4 md:p-8">
      
      {planData && (
        <div className="mx-auto max-w-5xl">
          <div ref={mainContentRef} className="space-y-8">
            <WelcomeMessage 
              agencyName={planData.company_name || 'Your Company'} 
              industryType="OnlyFans"
              scrollToFeatures={handleShowFeatures}
            />
            
            <motion.section 
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <GradientHeading 
                className="text-2xl font-bold" 
                variant="primary"
              >
                Understanding Your Agency's Challenges
              </GradientHeading>
              
              <p className="text-siso-text">
                Before we dive into the solution, it's important to understand the challenges 
                that agencies like yours face when scaling beyond $100k/month. Based on our 
                extensive research and surveys, we've identified these key pain points:
              </p>
              
              <AgencyPainPoints 
                onSolutionRequest={handleShowFeatures} 
                agencyTypeSlug={industryType} 
              />
            </motion.section>
            
            {showSolutionsSection && (
              <motion.section 
                id="solutions-section" 
                className="space-y-4 pt-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <GradientHeading 
                  className="text-2xl font-bold" 
                  variant="primary"
                >
                  Our Complete Solution
                </GradientHeading>
                
                <div className="rounded-lg bg-black/20 backdrop-blur-sm border border-siso-text/10 p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="rounded-full bg-siso-orange/10 p-3">
                      <Sparkles className="h-6 w-6 text-siso-orange" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">
                        {planData.app_name || 'OnlyFans Management Suite'}
                      </h3>
                      <p className="text-siso-text">
                        A comprehensive platform designed specifically for OnlyFans agencies
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <InteractiveCallout 
                      title="Industry Focus"
                      value="OnlyFans Agency Management"
                      type="niche"
                      description="Our platform is specifically designed for the unique challenges of managing OnlyFans creator accounts as an agency."
                    />
                    
                    <InteractiveCallout 
                      title="Your Company"
                      value={planData.company_name || 'Your Agency'}
                      type="company"
                      description="Customized to match your agency's workflow and branding, ensuring a perfect fit for your team."
                    />
                    
                    <InteractiveCallout 
                      title="Product"
                      value="All-in-One Management Platform"
                      type="product"
                      description="Combining content management, analytics, client communication, and business operations in one seamless platform."
                    />
                    
                    <InteractiveCallout 
                      title="Release Timeline"
                      value={`${planData.estimated_days} Days to Launch`}
                      type="niche"
                      description={`Your custom platform can be ready for your team in just ${planData.estimated_days} days with our expedited implementation process.`}
                    />
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                        <Target className="h-5 w-5 mr-2 text-siso-orange" />
                        Core Features
                      </h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {planData.features?.map((feature, index) => (
                          <div key={index} className="flex items-start gap-2 bg-black/30 rounded-lg p-3 border border-siso-text/10">
                            <CheckCircle className="h-5 w-5 text-siso-orange shrink-0 mt-0.5" />
                            <span className="text-siso-text">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                        <BarChart className="h-5 w-5 mr-2 text-siso-orange" />
                        Business Impact
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="bg-black/30 rounded-lg p-3 border border-siso-text/10">
                          <div className="flex items-center gap-2 mb-2">
                            <DollarSign className="h-4 w-4 text-siso-orange" />
                            <h4 className="text-white font-medium">Revenue Growth</h4>
                          </div>
                          <p className="text-2xl font-bold text-siso-orange mb-1">+35%</p>
                          <p className="text-xs text-siso-text">Average increase in monthly agency revenue</p>
                        </div>
                        
                        <div className="bg-black/30 rounded-lg p-3 border border-siso-text/10">
                          <div className="flex items-center gap-2 mb-2">
                            <Users className="h-4 w-4 text-siso-orange" />
                            <h4 className="text-white font-medium">Client Retention</h4>
                          </div>
                          <p className="text-2xl font-bold text-siso-orange mb-1">+60%</p>
                          <p className="text-xs text-siso-text">Improvement in creator retention rate</p>
                        </div>
                        
                        <div className="bg-black/30 rounded-lg p-3 border border-siso-text/10">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="h-4 w-4 text-siso-orange" />
                            <h4 className="text-white font-medium">Time Saved</h4>
                          </div>
                          <p className="text-2xl font-bold text-siso-orange mb-1">15+ hrs</p>
                          <p className="text-xs text-siso-text">Weekly time saved on administrative tasks</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.section>
            )}
            
            {showFeatureSelection && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <FeatureSection onFinalizeFeatures={handleFinalizeFeatures} />
              </motion.div>
            )}
            
            {selectedFeatures.length > 0 && (
              <motion.section 
                id="review-section" 
                className="space-y-4 pt-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <GradientHeading 
                  className="text-2xl font-bold" 
                  variant="primary"
                >
                  Review Your Plan
                </GradientHeading>
                
                <PlanReviewSummary
                  selectedFeatures={selectedFeatures}
                  timeline={totalTime}
                  totalCost={0}
                  onApprove={handleApprovePlan}
                  isSubmitting={isSubmitting}
                />
                
                <div className="mt-8">
                  <GradientHeading 
                    className="text-xl font-bold mb-4" 
                    variant="primary"
                  >
                    Calculate Your Return on Investment
                  </GradientHeading>
                  
                  <ROICalculator
                    selectedFeatures={selectedFeatures}
                    featuresTimeEstimate={totalTime}
                    tier="mvp"
                    basePrice={0}
                  />
                </div>
              </motion.section>
            )}
            
            <motion.section 
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <GradientHeading 
                className="text-2xl font-bold" 
                variant="primary"
              >
                Proven Success Stories
              </GradientHeading>
              
              <p className="text-siso-text mb-4">
                See how other OnlyFans agencies have transformed their businesses with our platform:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {caseStudies.map((study, index) => (
                  <CaseStudy 
                    key={index}
                    title={study.title}
                    description={study.description}
                    imageUrl={study.imageUrl}
                    notionUrl={study.notionUrl}
                  />
                ))}
              </div>
            </motion.section>
            
            <motion.section 
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <GradientHeading 
                className="text-2xl font-bold" 
                variant="primary"
              >
                Your Implementation Plan
              </GradientHeading>
              
              <ImplementationPlan onScrollToFeatures={handleShowFeatures} />
            </motion.section>
            
            <EnhancedNextSteps 
              showFeatureSelection={showFeatureSelection}
              onShowFeatures={handleShowFeatures}
            />
          </div>
          
          <div className="mt-8 space-y-4">
            <GradientHeading className="text-xl font-bold" variant="primary">
              Feedback & Comments
            </GradientHeading>
            <div className="relative">
              <PlanComments planId={planData.id} comments={comments} />
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default Plan;
