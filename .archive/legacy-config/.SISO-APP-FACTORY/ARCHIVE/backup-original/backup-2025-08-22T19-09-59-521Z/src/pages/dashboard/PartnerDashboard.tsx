import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  Target,
  Calendar,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  Rocket,
  Zap,
  FileText,
  BarChart3,
  BookOpen,
  HelpCircle,
  User,
  Plus,
  MessageSquare,
  Lightbulb,
  Play,
  Trophy,
  Activity,
  Brain,
  ExternalLink,
  ChevronRight,
  Sparkles,
  GraduationCap,
  Video,
  Download
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { PartnerOnboarding } from '@/components/dashboard/PartnerOnboarding';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { PartnershipLayout } from '@/components/partnership/PartnershipLayout';
import { DashboardGreetingCard } from '@/components/ui/dashboard-templates';
import { useUser } from '@/hooks/useUser';
import { AppPlanMicroChat } from '@/components/dashboard/AppPlanMicroChat';

interface DashboardStats {
  totalEarnings: number;
  monthlyEarnings: number;
  activeReferrals: number;
  completedReferrals: number;
  conversionRate: number;
  currentTier: string;
  nextTierProgress: number;
}

interface RecentActivity {
  id: string;
  type: 'referral_submitted' | 'referral_approved' | 'payment_received' | 'tier_upgraded';
  title: string;
  description: string;
  amount?: number;
  timestamp: string;
  status: 'success' | 'pending' | 'warning';
}

const PartnerDashboard = () => {
  const { user } = useUser();
  const [isOnboardingComplete, setIsOnboardingComplete] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalEarnings: 2450,
    monthlyEarnings: 1500,
    activeReferrals: 3,
    completedReferrals: 7,
    conversionRate: 68,
    currentTier: 'Silver Partner',
    nextTierProgress: 65
  });

  // Add custom CSS styles for optimal grid layout
  const gridStyles = `
    .dashboard-container {
      display: grid;
      grid-template-columns: repeat(12, 1fr);
      gap: 1.5rem;
      max-width: 1400px;
      margin: 0 auto;
      padding: 1.5rem;
      min-height: 100vh;
    }

    .row-1 { 
      grid-column: 1 / -1; 
      min-height: 120px;
    }

    .row-2a { 
      grid-column: 1 / 9; 
      min-height: 140px;
    }

    .row-2b { 
      grid-column: 9 / -1; 
      min-height: 140px;
    }

    .row-3-cards { 
      grid-column: 1 / -1; 
      display: grid; 
      grid-template-columns: repeat(4, 1fr); 
      gap: 1.5rem;
      min-height: 180px;
    }

    .row-4 { 
      grid-column: 1 / -1; 
      min-height: 400px;
    }

    .row-5-container {
      grid-column: 1 / -1;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
      min-height: 350px;
    }

    .row-5a { 
      grid-column: 1;
    }

    .row-5b { 
      grid-column: 2;
    }

    .row-6 { 
      grid-column: 1 / -1; 
      min-height: 200px;
    }

    /* Responsive adjustments */
    @media (max-width: 1199px) {
      .dashboard-container {
        grid-template-columns: repeat(8, 1fr);
        gap: 1rem;
        padding: 1rem;
      }
      
      .row-2a { grid-column: 1 / 6; }
      .row-2b { grid-column: 6 / -1; }
      
      .row-5-container {
        grid-template-columns: 1fr;
        gap: 1rem;
      }
      
      .row-5a, .row-5b { 
        grid-column: 1; 
      }
    }

    @media (max-width: 767px) {
      .dashboard-container {
        grid-template-columns: 1fr;
        gap: 1rem;
        padding: 1rem;
      }
      
      .row-2a, .row-2b, .row-3-cards {
        grid-column: 1;
      }
      
      .row-3-cards {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `;

  // Check if partner has completed onboarding
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsLoading(false);
          return;
        }

        // Check if partner profile exists and is complete
        const { data: profile } = await supabase
          .from('partner_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (profile && profile.full_name && profile.network_description) {
          setIsOnboardingComplete(true);
        } else {
          setIsOnboardingComplete(false);
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        setIsOnboardingComplete(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkOnboardingStatus();
  }, []);

  const handleOnboardingComplete = async (data: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Save or update partner profile
      const { error } = await supabase
        .from('partner_profiles')
        .upsert({
          user_id: user.id,
          email: user.email,
          full_name: data.fullName,
          phone: data.phone,
          company: data.company,
          professional_background: data.professionalBackground,
          network_description: data.networkDescription,
          expected_monthly_referrals: data.expectedMonthlyReferrals,
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Error saving partner profile:', error);
        toast.error('Failed to save partner profile');
        return;
      }

      setIsOnboardingComplete(true);
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast.error('Failed to complete onboarding');
    }
  };

  const handleOnboardingSkip = () => {
    setIsOnboardingComplete(true);
    toast.info('You can complete your profile later from settings');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  // Show onboarding if not complete (temporarily disabled to show new dashboard)
  if (false && isOnboardingComplete === false) {
    return (
      <div className="p-6">
        <PartnerOnboarding 
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />
      </div>
    );
  }


  return (
    <PartnershipLayout>
      {/* Inject custom CSS styles for optimal grid layout */}
      <style>{gridStyles}</style>
      
      {/* Optimized Dashboard Container with CSS Grid Layout */}
      <div className="dashboard-container">
      
      {/* ROW 1: Smart Dashboard Greeting Card - Full Width */}
      <div className="row-1">
        <DashboardGreetingCard 
          pageTitle="Partnership Dashboard"
          pageSubtitle="Here's what's happening with your partnership today"
          showDate={true}
          pageContext={{
            pageType: 'dashboard',
            keyMetrics: {
              primary: { value: '£1,247', label: 'Monthly Earnings', trend: '+23%' },
              secondary: { value: '18', label: 'Active Referrals' }
            }
          }}
        />
      </div>

      {/* ROW 2: App Plan Micro Chat (8 cols) + Quick Stats Summary (4 cols) */}
      <div className="row-2a">
        <AppPlanMicroChat 
          onNavigateToFullBuilder={() => window.location.href = '/partner/app-plan-generator'}
        />
      </div>
      
      <div className="row-2b">
        <Card className="bg-black/60 backdrop-blur-xl border-orange-500/20 h-full">
          <CardContent className="p-4 h-full flex flex-col justify-center">
            <div className="text-center space-y-2">
              <h3 className="text-sm font-semibold text-orange-400">Quick Overview</h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <div className="text-lg font-bold text-white">£{stats.totalEarnings.toLocaleString()}</div>
                  <div className="text-gray-400">Total</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-white">{stats.conversionRate}%</div>
                  <div className="text-gray-400">Rate</div>
                </div>
              </div>
              <Badge className="bg-green-500/20 text-green-400 text-xs">+12% Growth</Badge>
            </div>
          </CardContent>
        </Card>
      </div>


      {/* ROW 3: Stats Grid - 4 Equal Columns */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="row-3-cards"
      >
        {/* Total Earnings */}
        <Card className="bg-black border-orange-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-400">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-white">£{stats.totalEarnings.toLocaleString()}</div>
            <div className="flex items-center text-xs text-orange-400 mt-1">
              <ArrowUpRight className="w-3 h-3 mr-1" />
              +12% from last month
            </div>
          </CardContent>
        </Card>

        {/* Monthly Earnings */}
        <Card className="bg-black border-orange-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-400">This Month</CardTitle>
            <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-white">£{stats.monthlyEarnings.toLocaleString()}</div>
            <div className="flex items-center text-xs text-orange-400 mt-1">
              <ArrowUpRight className="w-3 h-3 mr-1" />
              +8% from last month
            </div>
          </CardContent>
        </Card>

        {/* Active Referrals */}
        <Card className="bg-black border-orange-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-400">Active Referrals</CardTitle>
            <Users className="h-4 w-4 sm:h-5 sm:w-5 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-white">{stats.activeReferrals}</div>
            <div className="flex items-center text-xs text-orange-400 mt-1">
              <Clock className="w-3 h-3 mr-1" />
              In progress
            </div>
          </CardContent>
        </Card>

        {/* Conversion Rate */}
        <Card className="bg-black border-orange-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-400">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-white">{stats.conversionRate}%</div>
            <div className="flex items-center text-xs text-orange-400 mt-1">
              <ArrowUpRight className="w-3 h-3 mr-1" />
              +5% from last month
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ROW 4: Premium Partner Advancement & Leaderboard - Full Width */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="row-4"
      >
        <Card className="bg-black/60 backdrop-blur-xl border-yellow-500/20 shadow-2xl hover:border-yellow-500/40 transition-all overflow-hidden cursor-pointer"
              onClick={() => window.location.href = '/partner/leaderboard'}>
          <div className="relative">
            {/* Hero Header with Trophy Theme */}
            <div className="relative h-32 bg-gradient-to-br from-yellow-600/30 via-amber-500/20 to-orange-500/30 overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(245,158,11,0.3),transparent_50%)]"></div>
              <div className="absolute top-4 right-4">
                <Badge className="bg-yellow-500/30 text-yellow-300 border-yellow-500/40 backdrop-blur-sm">
                  🏆 Leaderboard
                </Badge>
              </div>
              <div className="absolute bottom-4 left-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-yellow-500/20 backdrop-blur-sm border border-yellow-500/30">
                    <Award className="h-5 w-5 text-yellow-300" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Partner Advancement</h3>
                    <p className="text-sm text-yellow-200">Progress to Gold Tier</p>
                  </div>
                </div>
              </div>
              {/* Floating rank indicator */}
              <div className="absolute top-4 left-4">
                <div className="flex items-center gap-2 bg-black/30 backdrop-blur-sm rounded-full px-3 py-1 border border-white/20">
                  <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                    #5
                  </div>
                  <span className="text-white text-sm font-medium">Current Rank</span>
                </div>
              </div>
            </div>

            <CardContent className="p-6 space-y-4">
              {/* Current Tier Status */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-silver-400" />
                    <span className="text-sm font-medium text-gray-300">Current Tier: Silver Partner</span>
                  </div>
                  <span className="text-xs text-gray-400">{stats.nextTierProgress}% to Gold</span>
                </div>
                
                <div className="bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/20 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-yellow-400">Progress to Gold Partner</span>
                    <span className="text-sm font-bold text-white">{stats.nextTierProgress}%</span>
                  </div>
                  <Progress value={stats.nextTierProgress} className="h-3 mb-3" />
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-400">{stats.completedReferrals}</div>
                      <div className="text-xs text-gray-400">Completed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-orange-400">3</div>
                      <div className="text-xs text-gray-400">Needed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-yellow-400">£500</div>
                      <div className="text-xs text-gray-400">Bonus</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mini Leaderboard Preview */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-300">Top Performers</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-yellow-400 hover:bg-yellow-500/10 h-6 px-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.location.href = '/partner/leaderboard';
                    }}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    View All
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center text-xs font-bold text-black">1</div>
                      <span className="text-sm text-white">Sarah Johnson</span>
                      <Badge className="bg-purple-500/20 text-purple-400 text-xs ml-1">Platinum</Badge>
                    </div>
                    <span className="text-sm text-green-400 font-medium">£15,420</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-2 bg-gray-900/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-gray-400 rounded-full flex items-center justify-center text-xs font-bold text-black">2</div>
                      <span className="text-sm text-white">Michael Chen</span>
                      <Badge className="bg-yellow-500/20 text-yellow-400 text-xs ml-1">Gold</Badge>
                    </div>
                    <span className="text-sm text-green-400">£12,350</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-2 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center text-xs font-bold text-white">5</div>
                      <span className="text-sm text-orange-400 font-medium">You</span>
                      <Badge className="bg-gray-500/20 text-gray-400 text-xs ml-1">Silver</Badge>
                    </div>
                    <span className="text-sm text-green-400">£8,750</span>
                  </div>
                </div>
              </div>

              {/* Tier Benefits Preview */}
              <div className="bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/20 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-yellow-400" />
                  <span className="text-sm font-medium text-yellow-400">Gold Tier Benefits</span>
                </div>
                <div className="space-y-1 text-xs text-gray-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-400" />
                    <span>15% commission rate (vs 12% Silver)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-400" />
                    <span>Priority support & dedicated account manager</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-400" />
                    <span>Access to exclusive Gold partner events</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  className="bg-yellow-600 hover:bg-yellow-700 text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.location.href = '/partner/leaderboard';
                  }}
                >
                  <Trophy className="h-4 w-4 mr-2" />
                  View Rankings
                </Button>
                <Button 
                  variant="outline"
                  className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.location.href = '/partner/referrals';
                  }}
                >
                  <Target className="h-4 w-4 mr-2" />
                  Add Referral
                </Button>
              </div>
            </CardContent>
          </div>
        </Card>
      </motion.div>

      {/* ROW 5: Training Hub (Left) + Client Management (Right) */}
      <div className="row-5-container">
        
        {/* Training Hub - Premium Learning Experience Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="row-5a"
        >
          <Card className="bg-black/60 backdrop-blur-xl border-green-500/20 shadow-2xl hover:border-green-500/40 transition-all overflow-hidden">
            <div className="relative">
              {/* Hero Image Header */}
              <div className="relative h-32 bg-gradient-to-br from-green-600/30 via-emerald-500/20 to-teal-500/30 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,197,94,0.3),transparent_50%)]"></div>
                <div className="absolute top-4 right-4">
                  <Badge className="bg-green-500/30 text-green-300 border-green-500/40 backdrop-blur-sm">
                    🎓 Learning Hub
                  </Badge>
                </div>
                <div className="absolute bottom-4 left-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-green-500/20 backdrop-blur-sm border border-green-500/30">
                      <GraduationCap className="h-5 w-5 text-green-300" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Training & Development</h3>
                      <p className="text-sm text-green-200">Partner Success Mastery</p>
                    </div>
                  </div>
                </div>
              </div>

              <CardContent className="p-6 space-y-4">
                {/* Featured Learning Path Preview */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-400" />
                      <span className="text-sm font-medium text-yellow-400">Recommended Path</span>
                    </div>
                    <span className="text-xs text-gray-400">60% Complete</span>
                  </div>
                  
                  <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg p-3">
                    <h4 className="text-white font-medium mb-2">🚀 Partner Success Mastery</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-3 w-3 text-green-400" />
                        <span className="text-green-300">Referral Strategies</span>
                        <Badge className="bg-green-500/20 text-green-400 text-xs ml-auto">✅</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Play className="h-3 w-3 text-orange-400" />
                        <span className="text-orange-300">Client Communication</span>
                        <Badge className="bg-orange-500/20 text-orange-400 text-xs ml-auto">📚</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span className="text-gray-400">Closing Techniques</span>
                        <Badge className="bg-gray-500/20 text-gray-400 text-xs ml-auto">🔒</Badge>
                      </div>
                    </div>
                    <Progress value={60} className="h-2 mt-3" />
                  </div>
                </div>

                {/* Course Categories Preview */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-300">Course Categories</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.location.href = '/partner/training-hub'}
                      className="text-green-400 hover:bg-green-500/10 h-6 px-2"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      View All
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg hover:bg-orange-500/20 transition-colors cursor-pointer group">
                      <div className="flex items-center gap-2 mb-1">
                        <Target className="h-4 w-4 text-orange-400" />
                        <span className="text-sm font-medium text-white group-hover:text-orange-100">Sales & Marketing</span>
                      </div>
                      <div className="text-xs text-gray-400">8 courses</div>
                    </div>
                    
                    <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 transition-colors cursor-pointer group">
                      <div className="flex items-center gap-2 mb-1">
                        <Zap className="h-4 w-4 text-blue-400" />
                        <span className="text-sm font-medium text-white group-hover:text-blue-100">Technical Skills</span>
                      </div>
                      <div className="text-xs text-gray-400">12 courses</div>
                    </div>
                    
                    <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg hover:bg-purple-500/20 transition-colors cursor-pointer group">
                      <div className="flex items-center gap-2 mb-1">
                        <Users className="h-4 w-4 text-purple-400" />
                        <span className="text-sm font-medium text-white group-hover:text-purple-100">Client Relations</span>
                      </div>
                      <div className="text-xs text-gray-400">5 courses</div>
                    </div>
                    
                    <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg hover:bg-cyan-500/20 transition-colors cursor-pointer group">
                      <div className="flex items-center gap-2 mb-1">
                        <BookOpen className="h-4 w-4 text-cyan-400" />
                        <span className="text-sm font-medium text-white group-hover:text-cyan-100">Tools & Resources</span>
                      </div>
                      <div className="text-xs text-gray-400">15 courses</div>
                    </div>
                  </div>
                </div>

                {/* Learning Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div className="text-lg font-bold text-green-400">12</div>
                    <div className="text-xs text-gray-400">Completed</div>
                  </div>
                  <div className="text-center p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                    <div className="text-lg font-bold text-orange-400">48</div>
                    <div className="text-xs text-gray-400">Hours</div>
                  </div>
                  <div className="text-center p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                    <div className="text-lg font-bold text-purple-400">3</div>
                    <div className="text-xs text-gray-400">Certificates</div>
                  </div>
                </div>

                {/* Upcoming Webinar Preview */}
                <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-yellow-400" />
                    <span className="text-sm font-medium text-yellow-400">Next Live Session</span>
                    <Badge className="bg-red-500/20 text-red-400 text-xs ml-auto">🔴 LIVE</Badge>
                  </div>
                  <div className="text-sm text-white font-medium">Advanced Referral Strategies</div>
                  <div className="text-xs text-gray-400">Jan 28 • 2:00 PM • Sarah Johnson</div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => window.location.href = '/partner/training-hub'}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Continue Learning
                  </Button>
                  <Button 
                    variant="outline"
                    className="border-green-500/30 text-green-400 hover:bg-green-500/10"
                    onClick={() => window.location.href = '/partner/training-hub'}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Resources
                  </Button>
                </div>
              </CardContent>
            </div>
          </Card>
        </motion.div>


        {/* Client Management - Enhanced Rich Data Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="row-5b"
        >
          <Card className="bg-black/60 backdrop-blur-xl border-blue-500/20 shadow-2xl hover:border-blue-500/40 transition-all overflow-hidden">
            <div className="relative">
              {/* Hero Image Header */}
              <div className="relative h-32 bg-gradient-to-br from-blue-600/30 via-cyan-500/20 to-indigo-500/30 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.3),transparent_50%)]"></div>
                <div className="absolute top-4 right-4">
                  <Badge className="bg-blue-500/30 text-blue-300 border-blue-500/40 backdrop-blur-sm">
                    👥 Client Hub
                  </Badge>
                </div>
                <div className="absolute bottom-4 left-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-blue-500/20 backdrop-blur-sm border border-blue-500/30">
                      <Users className="h-5 w-5 text-blue-300" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Client Management</h3>
                      <p className="text-sm text-blue-200">Relationship Excellence</p>
                    </div>
                  </div>
                </div>
              </div>

              <CardContent className="p-6 space-y-4">
                {/* Featured Client Relationship Preview */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-400" />
                      <span className="text-sm font-medium text-yellow-400">Top Performers</span>
                    </div>
                    <span className="text-xs text-gray-400">12 Active Clients</span>
                  </div>
                  
                  <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-lg p-3">
                    <h4 className="text-white font-medium mb-2">🎯 Client Pipeline Status</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-3 w-3 text-green-400" />
                        <span className="text-green-300">TechCorp signed contract</span>
                        <Badge className="bg-green-500/20 text-green-400 text-xs ml-auto">£12K</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-3 w-3 text-orange-400" />
                        <span className="text-orange-300">StartupXYZ meeting scheduled</span>
                        <Badge className="bg-orange-500/20 text-orange-400 text-xs ml-auto">£8K</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <AlertCircle className="h-3 w-3 text-blue-400" />
                        <span className="text-blue-300">FinanceApp needs follow-up</span>
                        <Badge className="bg-blue-500/20 text-blue-400 text-xs ml-auto">£15K</Badge>
                      </div>
                    </div>
                    <Progress value={75} className="h-2 mt-3" />
                  </div>
                </div>

                {/* Client Categories & Types */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-300">Client Categories</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.location.href = '/partner/clients'}
                      className="text-blue-400 hover:bg-blue-500/10 h-6 px-2"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      View All
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg hover:bg-green-500/20 transition-colors cursor-pointer group">
                      <div className="flex items-center gap-2 mb-1">
                        <Rocket className="h-4 w-4 text-green-400" />
                        <span className="text-sm font-medium text-white group-hover:text-green-100">Startups</span>
                      </div>
                      <div className="text-xs text-gray-400">4 clients</div>
                    </div>
                    
                    <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg hover:bg-purple-500/20 transition-colors cursor-pointer group">
                      <div className="flex items-center gap-2 mb-1">
                        <BarChart3 className="h-4 w-4 text-purple-400" />
                        <span className="text-sm font-medium text-white group-hover:text-purple-100">Enterprise</span>
                      </div>
                      <div className="text-xs text-gray-400">3 clients</div>
                    </div>
                    
                    <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg hover:bg-orange-500/20 transition-colors cursor-pointer group">
                      <div className="flex items-center gap-2 mb-1">
                        <Zap className="h-4 w-4 text-orange-400" />
                        <span className="text-sm font-medium text-white group-hover:text-orange-100">SaaS</span>
                      </div>
                      <div className="text-xs text-gray-400">5 clients</div>
                    </div>
                    
                    <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg hover:bg-cyan-500/20 transition-colors cursor-pointer group">
                      <div className="flex items-center gap-2 mb-1">
                        <Target className="h-4 w-4 text-cyan-400" />
                        <span className="text-sm font-medium text-white group-hover:text-cyan-100">E-commerce</span>
                      </div>
                      <div className="text-xs text-gray-400">2 clients</div>
                    </div>
                  </div>
                </div>

                {/* Client Management Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <div className="text-lg font-bold text-blue-400">12</div>
                    <div className="text-xs text-gray-400">Active</div>
                  </div>
                  <div className="text-center p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div className="text-lg font-bold text-green-400">8</div>
                    <div className="text-xs text-gray-400">Converted</div>
                  </div>
                  <div className="text-center p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                    <div className="text-lg font-bold text-orange-400">3</div>
                    <div className="text-xs text-gray-400">Pending</div>
                  </div>
                </div>

                {/* Next Meeting Preview */}
                <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-purple-400" />
                    <span className="text-sm font-medium text-purple-400">Next Meeting</span>
                    <Badge className="bg-blue-500/20 text-blue-400 text-xs ml-auto">📅 Today</Badge>
                  </div>
                  <div className="text-sm text-white font-medium">Client Discovery Call - FinTech Startup</div>
                  <div className="text-xs text-gray-400">Today • 3:00 PM • Sarah Johnson</div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => window.location.href = '/partner/clients'}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Manage Clients
                  </Button>
                  <Button 
                    variant="outline"
                    className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                    onClick={() => window.location.href = '/partner/referrals'}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Client
                  </Button>
                </div>
              </CardContent>
            </div>
          </Card>
        </motion.div>

      {/* ROW 6: Support Center - Full Width */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.0 }}
        className="row-6"
      >
          <Card className="bg-black/60 backdrop-blur-xl border-orange-500/20 shadow-2xl hover:border-orange-500/40 transition-all overflow-hidden">
            <div className="relative">
              {/* Header with Background Pattern */}
              <div className="bg-gradient-to-r from-orange-500/20 to-amber-500/20 p-6 border-b border-orange-500/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500">
                      <HelpCircle className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Support Center</h3>
                      <p className="text-sm text-gray-400">Get help when you need it</p>
                    </div>
                  </div>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    24/7 Available
                  </Badge>
                </div>
              </div>
              
              <CardContent className="p-6 space-y-4">
                {/* Support Options */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-900/50 border border-gray-700/30 rounded-lg hover:bg-orange-500/10 transition-colors cursor-pointer">
                    <MessageSquare className="h-5 w-5 text-orange-400 mb-2" />
                    <div className="text-sm font-medium text-white">Live Chat</div>
                    <div className="text-xs text-gray-400">Instant help</div>
                  </div>
                  <div className="p-3 bg-gray-900/50 border border-gray-700/30 rounded-lg hover:bg-orange-500/10 transition-colors cursor-pointer">
                    <FileText className="h-5 w-5 text-orange-400 mb-2" />
                    <div className="text-sm font-medium text-white">Knowledge Base</div>
                    <div className="text-xs text-gray-400">Self-service</div>
                  </div>
                  <div className="p-3 bg-gray-900/50 border border-gray-700/30 rounded-lg hover:bg-orange-500/10 transition-colors cursor-pointer">
                    <Video className="h-5 w-5 text-orange-400 mb-2" />
                    <div className="text-sm font-medium text-white">Video Guides</div>
                    <div className="text-xs text-gray-400">Step-by-step</div>
                  </div>
                  <div className="p-3 bg-gray-900/50 border border-gray-700/30 rounded-lg hover:bg-orange-500/10 transition-colors cursor-pointer">
                    <Download className="h-5 w-5 text-orange-400 mb-2" />
                    <div className="text-sm font-medium text-white">Resources</div>
                    <div className="text-xs text-gray-400">Templates & tools</div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="flex justify-between text-sm">
                  <div className="text-center">
                    <div className="text-lg font-bold text-orange-400">&lt; 2min</div>
                    <div className="text-xs text-gray-400">Avg Response</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-400">98%</div>
                    <div className="text-xs text-gray-400">Satisfaction</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-400">24/7</div>
                    <div className="text-xs text-gray-400">Available</div>
                  </div>
                </div>

                {/* Action Button */}
                <Button 
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                  onClick={() => window.location.href = '/partner/support'}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Get Support Now
                </Button>
              </CardContent>
            </div>
          </Card>
        </motion.div>

      </div>

      </div>
    </PartnershipLayout>
  );
};

export default PartnerDashboard; 