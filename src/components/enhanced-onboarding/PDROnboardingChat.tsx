import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bot, User, X, ArrowLeft, Send, Mic, Phone, MessageSquare, MicOff, CheckCircle, Search, Zap, ExternalLink, Loader2, Building, TrendingUp, Users, DollarSign, Target, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/shared/ui/button';
import { MessageLoading } from '@/shared/ui/message-loading';
import { useOnboardingAuth } from '@/shared/hooks/useOnboardingAuth';
import { supabase } from '@/integrations/supabase/client';
import { SisoIcon } from '@/shared/ui/icons/SisoIcon';
import { Input } from '@/shared/ui/input';
import { Progress } from '@/shared/ui/progress';
import { useToast } from '@/shared/hooks/use-toast';
import { CompanyIntelligenceForm } from './forms/CompanyIntelligenceForm';
import { BusinessAnalysisForm } from './forms/BusinessAnalysisForm';
import { MarketIntelligenceForm } from './forms/MarketIntelligenceForm';
import { CompetitiveAnalysisForm } from './forms/CompetitiveAnalysisForm';
import { TechnicalRequirementsForm } from './forms/TechnicalRequirementsForm';
import { StrategicFrameworkForm } from './forms/StrategicFrameworkForm';
import { MultiAgentResearchSystem } from '../pdr-system/MultiAgentResearchSystem';
import { PDRGenerator } from '../pdr-system/PDRGenerator';
import { type PDRData } from '@/types/pdr';

interface Message {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  requiresAction?: boolean;
  actionComponent?: React.ReactNode;
  category?: 'welcome' | 'company' | 'business' | 'market' | 'competitive' | 'technical' | 'strategic' | 'research' | 'complete';
}

type OnboardingStep = 
  | 'communication'
  | 'company_intelligence' 
  | 'business_analysis'
  | 'market_intelligence'
  | 'competitive_analysis'
  | 'technical_requirements'
  | 'strategic_framework'
  | 'multi_agent_research'
  | 'pdr_generation'
  | 'complete';

const PDROnboardingChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('communication');
  const [communicationMethod, setCommunicationMethod] = useState<'chat' | 'voice' | 'phone'>('chat');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [waitingForUserInput, setWaitingForUserInput] = useState(false);
  const [showTypingIndicator, setShowTypingIndicator] = useState(false);
  const [researchProgress, setResearchProgress] = useState(0);
  const [researchStage, setResearchStage] = useState('');
  const [isResearching, setIsResearching] = useState(false);
  
  // PDR Data Collection State
  const [pdrData, setPDRData] = useState<Partial<PDRData>>({
    companyIntelligence: {},
    businessAnalysis: {},
    marketIntelligence: {},
    competitiveAnalysis: {},
    technicalRequirements: {},
    strategicFramework: {}
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { userId, isLoading: authLoading } = useOnboardingAuth();
  const { toast } = useToast();

  // Initialize the chat with enhanced welcome message
  useEffect(() => {
    setShowTypingIndicator(true);
    
    setTimeout(() => {
      setShowTypingIndicator(false);
      
      const welcomeMessage = {
        id: '1',
        role: 'assistant' as const,
        category: 'welcome' as const,
        content: `🚀 Welcome to SISO's **Revolutionary PDR System**!\n\nI'm your AI strategic consultant. I'll conduct comprehensive research across 6 specialized areas using 8 parallel AI agents to create your complete Project Development Report.\n\n✨ **What you'll get:**\n📊 Market intelligence & competitive analysis\n🏢 Business model optimization\n⚡ Technical architecture recommendations\n🎯 Strategic implementation roadmap\n💰 Investment & ROI projections\n🛡️ Risk assessment & mitigation\n\nThis typically takes 10-15 minutes and replaces weeks of traditional consulting work.`,
        actionComponent: (
          <div className="mt-6 space-y-4">
            <div className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-lg">
              <div className="flex items-center gap-2 text-blue-400 mb-2">
                <Zap className="h-5 w-5" />
                <span className="font-semibold">Revolutionary AI-Powered Analysis</span>
              </div>
              <p className="text-sm text-gray-300">
                Our 8 specialized AI agents will analyze your business in parallel, delivering insights that typically require a team of consultants.
              </p>
            </div>
            
            <p className="text-sm text-gray-300 mb-3">How would you like to proceed?</p>
            
            <div className="grid grid-cols-1 gap-3">
              <Button
                onClick={() => handleCommunicationChoice('chat')}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white flex items-center gap-2 py-3"
              >
                <MessageSquare className="h-5 w-5" />
                Interactive Chat Experience
                <span className="text-xs bg-blue-800 px-2 py-1 rounded-full ml-auto">Recommended</span>
              </Button>
              
              <Button
                onClick={() => handleCommunicationChoice('voice')}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white flex items-center gap-2 py-3"
              >
                <Mic className="h-5 w-5" />
                Voice-Powered Session
                <span className="text-xs bg-green-800 px-2 py-1 rounded-full ml-auto">Premium</span>
              </Button>
              
              <Button
                onClick={() => handleCommunicationChoice('phone')}
                className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white flex items-center gap-2 py-3"
              >
                <Phone className="h-5 w-5" />
                Personal Consultation Call
                <span className="text-xs bg-orange-800 px-2 py-1 rounded-full ml-auto">VIP</span>
              </Button>
            </div>
            
            <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <p className="text-xs text-yellow-300">
                💡 Each method provides the same comprehensive analysis. Choose what feels most comfortable for you.
              </p>
            </div>
          </div>
        )
      };
      
      setMessages([welcomeMessage]);
    }, 1000);
  }, []);

  const handleCommunicationChoice = (method: 'chat' | 'voice' | 'phone') => {
    setCommunicationMethod(method);
    
    const choiceMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      category: 'welcome' as const,
      content: method === 'chat' ? 'Interactive Chat Experience' : 
               method === 'voice' ? 'Voice-Powered Session' :
               'Personal Consultation Call'
    };
    
    setMessages(prev => [...prev, choiceMessage]);
    
    if (method === 'phone') {
      setTimeout(() => {
        const phoneMessage = {
          id: Date.now().toString(),
          role: 'assistant' as const,
          category: 'welcome' as const,
          content: "Perfect! Our strategic consultant will call you within 5 minutes to walk through the comprehensive PDR process personally.",
          actionComponent: (
            <div className="mt-4 space-y-3">
              <Input 
                type="tel"
                placeholder="Enter your phone number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="bg-black/30 border-siso-text/20 text-white"
              />
              <Button
                onClick={handlePhoneSubmit}
                disabled={!phoneNumber.trim()}
                className="w-full bg-gradient-to-r from-siso-red to-siso-orange text-white"
              >
                Schedule VIP Consultation Now
              </Button>
            </div>
          )
        };
        setMessages(prev => [...prev, phoneMessage]);
      }, 1000);
    } else {
      setTimeout(() => {
        const nextMessage = {
          id: Date.now().toString(),
          role: 'assistant' as const,
          category: 'company' as const,
          content: `Excellent choice! Let's begin your comprehensive PDR analysis.\n\n🏢 **Phase 1: Company Intelligence**\n\nI'll gather deep insights about your company structure, leadership, and background. This forms the foundation for all strategic analysis.`,
          requiresAction: true,
          actionComponent: <CompanyIntelligenceForm onComplete={handleCompanyIntelligenceComplete} />
        };
        setMessages(prev => [...prev, nextMessage]);
        setCurrentStep('company_intelligence');
      }, 1000);
    }
  };

  const handlePhoneSubmit = () => {
    if (!phoneNumber.trim()) return;
    
    const confirmMessage = {
      id: Date.now().toString(),
      role: 'assistant' as const,
      category: 'welcome' as const,
      content: `🎉 VIP Consultation Scheduled!\n\nWe'll call you at **${phoneNumber}** within 5 minutes.\n\nYour personal consultant will walk you through our revolutionary PDR system and create your comprehensive report during the call.`,
      actionComponent: (
        <div className="mt-4 space-y-3">
          <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
            <div className="flex items-center gap-2 text-green-400 mb-2">
              <CheckCircle className="h-5 w-5" />
              <span className="font-semibold">Call Confirmed</span>
            </div>
            <p className="text-sm text-gray-300">
              Please keep your phone nearby. Our consultant will guide you through the entire process.
            </p>
          </div>
          
          <Button
            onClick={() => {
              setCommunicationMethod('chat');
              handleCommunicationChoice('chat');
            }}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white"
          >
            Continue with Chat While We Call
          </Button>
        </div>
      )
    };
    
    setMessages(prev => [...prev, confirmMessage]);
    
    toast({
      title: "VIP Consultation Scheduled",
      description: `We'll call you at ${phoneNumber} within 5 minutes.`,
    });
  };

  // Handler for each form completion
  const handleCompanyIntelligenceComplete = (data: any) => {
    setPDRData(prev => ({ ...prev, companyIntelligence: data }));
    
    const completionMessage = {
      id: Date.now().toString(),
      role: 'assistant' as const,
      category: 'business' as const,
      content: `✅ **Company Intelligence Captured**\n\n📊 **Phase 2: Business Analysis**\n\nNow I'll analyze your business model, revenue streams, and value proposition to understand your market position and growth potential.`,
      requiresAction: true,
      actionComponent: <BusinessAnalysisForm onComplete={handleBusinessAnalysisComplete} />
    };
    
    setMessages(prev => [...prev, completionMessage]);
    setCurrentStep('business_analysis');
  };

  const handleBusinessAnalysisComplete = (data: any) => {
    setPDRData(prev => ({ ...prev, businessAnalysis: data }));
    
    const completionMessage = {
      id: Date.now().toString(),
      role: 'assistant' as const,
      category: 'market' as const,
      content: `✅ **Business Analysis Complete**\n\n🎯 **Phase 3: Market Intelligence**\n\nTime to analyze your market landscape, target customers, and growth opportunities. This will inform our strategic positioning recommendations.`,
      requiresAction: true,
      actionComponent: <MarketIntelligenceForm onComplete={handleMarketIntelligenceComplete} />
    };
    
    setMessages(prev => [...prev, completionMessage]);
    setCurrentStep('market_intelligence');
  };

  const handleMarketIntelligenceComplete = (data: any) => {
    setPDRData(prev => ({ ...prev, marketIntelligence: data }));
    
    const completionMessage = {
      id: Date.now().toString(),
      role: 'assistant' as const,
      category: 'competitive' as const,
      content: `✅ **Market Intelligence Gathered**\n\n🏆 **Phase 4: Competitive Analysis**\n\nI'll analyze your competitive landscape to identify opportunities, threats, and strategic advantages for your app development.`,
      requiresAction: true,
      actionComponent: <CompetitiveAnalysisForm onComplete={handleCompetitiveAnalysisComplete} />
    };
    
    setMessages(prev => [...prev, completionMessage]);
    setCurrentStep('competitive_analysis');
  };

  const handleCompetitiveAnalysisComplete = (data: any) => {
    setPDRData(prev => ({ ...prev, competitiveAnalysis: data }));
    
    const completionMessage = {
      id: Date.now().toString(),
      role: 'assistant' as const,
      category: 'technical' as const,
      content: `✅ **Competitive Analysis Complete**\n\n⚡ **Phase 5: Technical Requirements**\n\nNow I'll determine the optimal technical architecture, integrations, and development approach for your specific needs.`,
      requiresAction: true,
      actionComponent: <TechnicalRequirementsForm onComplete={handleTechnicalRequirementsComplete} />
    };
    
    setMessages(prev => [...prev, completionMessage]);
    setCurrentStep('technical_requirements');
  };

  const handleTechnicalRequirementsComplete = (data: any) => {
    setPDRData(prev => ({ ...prev, technicalRequirements: data }));
    
    const completionMessage = {
      id: Date.now().toString(),
      role: 'assistant' as const,
      category: 'strategic' as const,
      content: `✅ **Technical Architecture Defined**\n\n🚀 **Phase 6: Strategic Framework**\n\nFinal phase! I'll create your implementation roadmap, budget framework, and success metrics for the project.`,
      requiresAction: true,
      actionComponent: <StrategicFrameworkForm onComplete={handleStrategicFrameworkComplete} />
    };
    
    setMessages(prev => [...prev, completionMessage]);
    setCurrentStep('strategic_framework');
  };

  const handleStrategicFrameworkComplete = (data: any) => {
    setPDRData(prev => ({ ...prev, strategicFramework: data }));
    
    const completionMessage = {
      id: Date.now().toString(),
      role: 'assistant' as const,
      category: 'research' as const,
      content: `🎉 **All Data Collected Successfully!**\n\n🤖 **Multi-Agent Research Phase Initiating**\n\nDeploying 8 specialized AI agents to analyze your data in parallel:\n\n🔍 **Market Research Agent** - TAM analysis & trends\n🏢 **Competitive Intelligence Agent** - Deep competitor analysis\n⚡ **Technical Architecture Agent** - Tech recommendations\n💰 **Business Model Agent** - Revenue optimization\n👥 **User Experience Agent** - Customer journey analysis\n📊 **Financial Analysis Agent** - Budget & ROI projections\n🎯 **Strategic Planning Agent** - Implementation roadmap\n🛡️ **Risk Assessment Agent** - Challenge mitigation\n\nThis revolutionary process typically takes 3-5 minutes...`
    };
    
    setMessages(prev => [...prev, completionMessage]);
    setCurrentStep('multi_agent_research');
    
    // Start the multi-agent research process
    setTimeout(() => {
      startMultiAgentResearch();
    }, 2000);
  };

  const startMultiAgentResearch = () => {
    setIsResearching(true);
    setResearchProgress(0);
    setResearchStage('🚀 Initializing 8 AI Research Agents...');
    
    // Simulate the 8-agent parallel research process
    const researchPhases = [
      { stage: '🔍 Market Research Agent - Analyzing TAM and industry trends...', progress: 15 },
      { stage: '🏢 Competitive Intelligence Agent - Deep competitor forensics...', progress: 25 },
      { stage: '⚡ Technical Architecture Agent - Evaluating tech stacks...', progress: 40 },
      { stage: '💰 Business Model Agent - Optimizing revenue streams...', progress: 55 },
      { stage: '👥 User Experience Agent - Mapping customer journeys...', progress: 70 },
      { stage: '📊 Financial Analysis Agent - Building ROI models...', progress: 80 },
      { stage: '🎯 Strategic Planning Agent - Creating implementation roadmap...', progress: 90 },
      { stage: '🛡️ Risk Assessment Agent - Identifying mitigation strategies...', progress: 95 },
      { stage: '🎉 All 8 Agents Complete - Compiling comprehensive PDR...', progress: 100 }
    ];
    
    researchPhases.forEach((phase, index) => {
      setTimeout(() => {
        setResearchStage(phase.stage);
        setResearchProgress(phase.progress);
        
        if (index === researchPhases.length - 1) {
          // Research complete, start PDR generation
          setTimeout(() => {
            startPDRGeneration();
          }, 2000);
        }
      }, (index + 1) * 1500); // 1.5 seconds per phase
    });
  };

  const startPDRGeneration = () => {
    setIsResearching(false);
    
    const completionMessage = {
      id: Date.now().toString(),
      role: 'assistant' as const,
      category: 'complete' as const,
      content: `🎉 **Revolutionary PDR Complete!**\n\nYour comprehensive Project Development Report has been generated using our 8-agent AI system. This report includes:\n\n✅ **70+ data points** across 6 strategic areas\n✅ **Market intelligence** with TAM analysis\n✅ **Competitive forensics** with gap opportunities\n✅ **Technical architecture** recommendations\n✅ **Financial projections** and ROI models\n✅ **Implementation roadmap** with timelines\n✅ **Risk assessment** with mitigation strategies\n✅ **Strategic positioning** for market advantage\n\nThis revolutionary analysis typically replaces 4-6 weeks of traditional consulting work.`,
      actionComponent: (
        <div className="mt-6 space-y-4">
          <div className="p-4 bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/30 rounded-lg">
            <div className="flex items-center gap-2 text-green-400 mb-2">
              <CheckCircle className="h-6 w-6" />
              <span className="font-semibold text-lg">PDR Generation Complete!</span>
            </div>
            <p className="text-sm text-gray-300">
              Your comprehensive Project Development Report is ready with revolutionary AI-powered insights across all strategic areas.
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            <Button
              onClick={() => handleViewPDR()}
              className="w-full bg-gradient-to-r from-siso-red via-siso-orange to-yellow-500 text-white flex items-center gap-2 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <ExternalLink className="h-6 w-6" />
              View Your Revolutionary PDR
              <span className="text-xs bg-white/20 px-2 py-1 rounded-full ml-auto">PREMIUM</span>
            </Button>
            
            <Button
              onClick={() => handleCreateMoodBoard()}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white flex items-center gap-2 py-3"
            >
              <Target className="h-5 w-5" />
              Continue to Mood Board Creation
            </Button>
          </div>
          
          <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-xs text-blue-300 text-center">
              🚀 Enhanced Flow: PDR → Mood Board → AI Development → Launch
            </p>
          </div>
        </div>
      )
    };
    
    setMessages(prev => [...prev, completionMessage]);
    setCurrentStep('complete');
    
    // Save the complete PDR to database
    savePDRToDatabase();
  };

  const handleViewPDR = () => {
    // Navigate to PDR view with the collected data
    navigate('/pdr-report', { state: { pdrData } });
  };

  const handleCreateMoodBoard = () => {
    // Navigate to mood board creation with PDR context
    navigate('/mood-board', { state: { pdrData } });
  };

  const savePDRToDatabase = async () => {
    try {
      if (userId) {
        const { error } = await supabase.from('pdr_reports').insert({
          user_id: userId,
          pdr_data: pdrData,
          communication_method: communicationMethod,
          phone_number: phoneNumber || null,
          created_at: new Date().toISOString(),
          status: 'complete'
        });
        
        if (error) {
          console.error('Error saving PDR:', error);
        } else {
          toast({
            title: "PDR Saved Successfully",
            description: "Your comprehensive Project Development Report has been saved.",
          });
        }
      }
    } catch (error) {
      console.error('Error saving PDR:', error);
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, showTypingIndicator]);

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-black via-siso-bg to-black">
      {authLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="w-10 h-10 border-4 border-siso-orange/50 border-t-siso-orange rounded-full animate-spin" />
        </div>
      )}
      
      {/* Header */}
      <header className="p-4 border-b border-siso-text/10 flex items-center justify-between bg-black/30 backdrop-blur-sm fixed top-0 left-0 right-0 z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          className="text-siso-text hover:text-siso-text-bold hover:bg-black/20"
        >
          <ArrowLeft size={20} />
        </Button>
        <div className="text-center">
          <div className="text-lg font-bold text-white">SISO PDR System</div>
          <div className="text-xs text-siso-text-muted">Revolutionary AI Analysis</div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/thankyou')}
          className="text-siso-text hover:text-siso-text-bold hover:bg-black/20"
        >
          <X size={20} />
        </Button>
      </header>
      
      {/* Main chat container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 pt-20 pb-8">
        {/* Research Progress Indicator */}
        {isResearching && (
          <div className="mb-6 bg-gradient-to-r from-gray-900/80 to-black/80 border border-orange-500/30 rounded-xl p-6 shadow-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-3">
                <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                <div className="flex gap-1">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-bounce"></div>
                  <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
              <h3 className="text-xl font-bold text-orange-400">{researchStage}</h3>
            </div>
            
            <div className="space-y-4">
              <div className="w-full h-4 bg-gray-800 rounded-full overflow-hidden border border-orange-500/20">
                <div 
                  className="h-full bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 rounded-full transition-all duration-1000 animate-pulse"
                  style={{ width: `${researchProgress}%` }}
                />
              </div>
              
              <div className="grid grid-cols-4 gap-2 text-xs font-medium">
                <div className="text-center">
                  <div className={`w-8 h-8 mx-auto mb-1 rounded-full flex items-center justify-center ${researchProgress >= 15 ? 'bg-green-500' : 'bg-gray-600'}`}>
                    <Search className="w-4 h-4" />
                  </div>
                  <span className={researchProgress >= 15 ? 'text-green-400' : 'text-gray-400'}>Market</span>
                </div>
                <div className="text-center">
                  <div className={`w-8 h-8 mx-auto mb-1 rounded-full flex items-center justify-center ${researchProgress >= 40 ? 'bg-green-500' : 'bg-gray-600'}`}>
                    <Building className="w-4 h-4" />
                  </div>
                  <span className={researchProgress >= 40 ? 'text-green-400' : 'text-gray-400'}>Competitive</span>
                </div>
                <div className="text-center">
                  <div className={`w-8 h-8 mx-auto mb-1 rounded-full flex items-center justify-center ${researchProgress >= 70 ? 'bg-green-500' : 'bg-gray-600'}`}>
                    <Users className="w-4 h-4" />
                  </div>
                  <span className={researchProgress >= 70 ? 'text-green-400' : 'text-gray-400'}>Technical</span>
                </div>
                <div className="text-center">
                  <div className={`w-8 h-8 mx-auto mb-1 rounded-full flex items-center justify-center ${researchProgress >= 95 ? 'bg-green-500' : 'bg-gray-600'}`}>
                    <Target className="w-4 h-4" />
                  </div>
                  <span className={researchProgress >= 95 ? 'text-green-400' : 'text-gray-400'}>Strategic</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Chat messages */}
        <div className="flex-1 space-y-6 py-4">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex max-w-[95%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`flex items-center justify-center h-12 w-12 rounded-full shrink-0 ${
                    message.role === 'assistant' 
                      ? 'bg-gradient-to-r from-siso-red via-siso-orange to-yellow-500 shadow-lg' 
                      : 'bg-gradient-to-r from-blue-600 to-purple-600'
                  } ${message.role === 'user' ? 'ml-4' : 'mr-4'}`}>
                    {message.role === 'assistant' ? 
                      <SisoIcon className="w-7 h-7 text-white" /> : 
                      <User size={20} className="text-white" />
                    }
                  </div>
                  
                  <div className="flex flex-col">
                    {message.role === 'assistant' && (
                      <span className="text-xs text-siso-text-muted ml-2 mb-2 font-semibold">SISO AI Strategic Consultant</span>
                    )}
                    <div className={`rounded-3xl px-6 py-4 ${
                      message.role === 'assistant'
                        ? 'bg-gradient-to-br from-black/60 to-gray-900/60 text-white border border-siso-text/10 shadow-xl backdrop-blur-sm'
                        : 'bg-gradient-to-r from-siso-orange to-yellow-500 text-black font-medium shadow-lg'
                    }`}>
                      <div className="whitespace-pre-line text-sm leading-relaxed">{message.content}</div>
                      {message.actionComponent && (
                        <div className="mt-4">
                          {message.actionComponent}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {/* Typing indicator */}
            {showTypingIndicator && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="flex max-w-[80%] flex-row">
                  <div className="flex items-center justify-center h-12 w-12 rounded-full shrink-0 bg-gradient-to-r from-siso-red via-siso-orange to-yellow-500 shadow-lg mr-4">
                    <SisoIcon className="w-7 h-7 text-white" />
                  </div>
                  
                  <div className="flex flex-col">
                    <span className="text-xs text-siso-text-muted ml-2 mb-2 font-semibold">SISO AI Strategic Consultant</span>
                    <div className="rounded-3xl px-6 py-4 bg-gradient-to-br from-black/60 to-gray-900/60 text-white border border-siso-text/10 shadow-xl backdrop-blur-sm">
                      <MessageLoading />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div ref={messagesEndRef} />
        </div>
      </main>
    </div>
  );
};

export default PDROnboardingChat;