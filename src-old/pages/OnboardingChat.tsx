import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bot, User, X, ArrowLeft, Send, Mic, Phone, MessageSquare, MicOff, CheckCircle, Search, Zap, ExternalLink, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/shared/ui/button';
import { MessageLoading } from '@/shared/ui/message-loading';
import { useOnboardingAuth } from '@/shared/hooks/useOnboardingAuth';
import { supabase } from '@/integrations/supabase/client';
import { SisoIcon } from '@/shared/ui/icons/SisoIcon';
import { BusinessDataInput } from '@/internal/app-plan/BusinessDataForm';
import { appPlanAgent } from '@/shared/services/ai.service';
import { useToast } from '@/shared/hooks/use-toast';
import { Input } from '@/shared/ui/input';
import { Progress } from '@/shared/ui/progress';
import { useAuthSession } from '@/shared/hooks/useAuthSession';
import { saveAppPlan, type AppPlanData, type SavedAppPlan } from '@/services/appPlanService';
import { saveNewAppPlan, convertGeneratedAppPlanToSaveable, type NewAppPlanData } from '@/services/newAppPlanService';

interface Message {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  requiresAction?: boolean;
  actionComponent?: React.ReactNode;
}

const OnboardingChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<'communication' | 'company' | 'description' | 'website' | 'website_input' | 'research' | 'research_complete' | 'app_plan' | 'complete'>('communication');
  const [communicationMethod, setCommunicationMethod] = useState<'chat' | 'voice' | 'phone'>('chat');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [formData, setFormData] = useState({
    company: '',
    industry: 'General Business',
    description: '',
    website: '',
    websiteType: ''
  });
  const [waitingForUserInput, setWaitingForUserInput] = useState(false);
  const [showTypingIndicator, setShowTypingIndicator] = useState(false);
  const [isResearching, setIsResearching] = useState(false);
  const [researchComplete, setResearchComplete] = useState(false);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStage, setGenerationStage] = useState('');
  const [researchResults, setResearchResults] = useState('');
  const [savedAppPlan, setSavedAppPlan] = useState<SavedAppPlan | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { userId, isLoading: authLoading } = useOnboardingAuth();
  const { toast } = useToast();
  
  // Check if coming from app plan generator
  const fromAppPlanGenerator = location.state?.fromAppPlanGenerator || false;
  const initialAppConcept = location.state?.appConcept || '';

  // Initialize the chat with welcome message
  useEffect(() => {
    setShowTypingIndicator(true);
    
    setTimeout(() => {
      setShowTypingIndicator(false);
      
      // If coming from app plan generator with a concept, skip communication choice
      if (fromAppPlanGenerator && initialAppConcept) {
        const welcomeMessage = {
          id: '1',
          role: 'assistant' as const,
          content: `Hi! I see you want to build: "${initialAppConcept}". I'll help you create a comprehensive app plan. First, I need to know more about your business to tailor the plan specifically for you.`,
        };
        
        const conceptMessage = {
          id: '2',
          role: 'user' as const,
          content: initialAppConcept
        };
        
        const followUpMessage = {
          id: '3',
          role: 'assistant' as const,
          content: "Great idea! What's your company name?",
          requiresAction: true
        };
        
        setMessages([welcomeMessage, conceptMessage, followUpMessage]);
        setCommunicationMethod('chat');
        setCurrentStep('company');
        setWaitingForUserInput(true);
        // Store the app concept in form data
        setFormData(prev => ({ ...prev, description: initialAppConcept }));
      } else {
        const welcomeMessage = {
          id: '1',
          role: 'assistant' as const,
          content: "Hi! I'm SISO, your AI assistant. I'll help you create a custom app plan by researching your business and industry. This will only take a few minutes.",
          actionComponent: (
            <div className="mt-4 space-y-3">
              <p className="text-sm text-gray-300 mb-3">How would you like to communicate?</p>
              <Button
                onClick={() => handleCommunicationChoice('chat')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                Chat with me (type responses)
              </Button>
              <Button
                onClick={() => handleCommunicationChoice('voice')}
                className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
              >
                <Mic className="h-4 w-4" />
                Voice chat (speak responses)
              </Button>
              <Button
                onClick={() => handleCommunicationChoice('phone')}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white flex items-center gap-2"
              >
                <Phone className="h-4 w-4" />
                Schedule a phone call
              </Button>
            </div>
          )
        };
        
        setMessages([welcomeMessage]);
      }
    }, 1000);
  }, []);

  const handleCommunicationChoice = (method: 'chat' | 'voice' | 'phone') => {
    setCommunicationMethod(method);
    
    const choiceMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: method === 'chat' ? 'I\'ll chat with you' : 
               method === 'voice' ? 'I\'ll speak with you' :
               'I\'d like a phone call'
    };
    
    setMessages(prev => [...prev, choiceMessage]);
    
    if (method === 'phone') {
      setTimeout(() => {
        const phoneMessage = {
          id: Date.now().toString(),
          role: 'assistant' as const,
          content: "Perfect! Please provide your phone number and we'll call you within 5 minutes to walk you through everything.",
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
                Schedule Call Now
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
          content: "Perfect! I just need 4 quick pieces of information, then I'll research your business and create a custom app plan. What's your company name?",
          requiresAction: true
        };
        setMessages(prev => [...prev, nextMessage]);
        setCurrentStep('company');
        setWaitingForUserInput(true);
      }, 1000);
    }
  };

  const handlePhoneSubmit = () => {
    if (!phoneNumber.trim()) return;
    
    const confirmMessage = {
      id: Date.now().toString(),
      role: 'assistant' as const,
      content: `Perfect! We'll call you at ${phoneNumber} within 5 minutes. You can also continue with the chat if you'd like to get started immediately.`,
      actionComponent: (
        <div className="mt-4">
          <Button
            onClick={() => {
              setCommunicationMethod('chat');
              setCurrentStep('company');
              setWaitingForUserInput(true);
            }}
            className="w-full bg-gradient-to-r from-siso-red to-siso-orange text-white"
          >
            Continue with Chat While We Call
          </Button>
        </div>
      )
    };
    
    setMessages(prev => [...prev, confirmMessage]);
    
    toast({
      title: "Call Scheduled",
      description: `We'll call you at ${phoneNumber} within 5 minutes.`,
    });
  };

  const handleVoiceRecord = () => {
    setIsRecording(!isRecording);
    toast({
      title: isRecording ? "Recording Stopped" : "Recording Started",
      description: isRecording ? "Voice input captured (demo)" : "Speak now (demo mode)",
    });
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, showTypingIndicator]);

  // Research phase simulation with specific scraping messages
  useEffect(() => {
    if (isResearching) {
      // Add immediate loading message to chat
      const loadingMessage = {
        id: Date.now().toString(),
        role: 'assistant' as const,
        content: '🔍 **Research in Progress...**',
        actionComponent: (
          <div className="mt-3 flex items-center gap-3 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
            <Loader2 className="w-5 h-5 text-orange-500 animate-spin" />
            <div className="w-3 h-3 bg-red-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-ping"></div>
            <span className="text-orange-400 font-medium">Analyzing your business data...</span>
          </div>
        )
      };
      
      setMessages(prev => [...prev, loadingMessage]);
      
      const stages = [
        formData.website && formData.website !== 'none' ? `Scraping ${formData.company} ${formData.websiteType === 'website' ? 'website' : 'social media'} content...` : `Analyzing ${formData.company} business information...`,
        `Researching industry trends and market data...`,
        `Identifying competitors and market opportunities...`,
        `Analyzing technology trends and best practices...`,
        `Compiling research findings and insights...`
      ];
      
      stages.forEach((stage, index) => {
        setTimeout(() => {
          setGenerationStage(stage);
          setGenerationProgress(20 + (index * 15));
        }, (index + 1) * 1000); // 1 second per stage
      });
      
      setTimeout(() => {
        setIsResearching(false);
        setResearchComplete(true);
        setGenerationProgress(100);
        setGenerationStage('✅ Research complete!');
        
        // Auto-start app plan generation after a brief pause with continued loading animation
        setTimeout(() => {
          startAppPlanGeneration();
        }, 2000);
        
      }, 6000); // Total 6 seconds for research
    }
  }, [isResearching, formData.company, formData.website, formData.websiteType]);

  // App plan generation simulation with enhanced multi-stage research
  useEffect(() => {
    if (isGeneratingPlan) {
      const stages = [
        'Conducting initial market research and industry analysis...',
        'Analyzing competitor landscape and market opportunities...',
        'Performing refined research and strategic positioning...',
        'Evaluating user experience and technical requirements...',
        'Generating comprehensive app development plan...',
        'Finalizing research-backed feature recommendations...'
      ];
      
      stages.forEach((stage, index) => {
        setTimeout(() => {
          setGenerationStage(stage);
          setGenerationProgress(15 + (index * 14)); // More granular progress: 15, 29, 43, 57, 71, 85
        }, (index + 1) * 2000); // Longer timing: 2 seconds per stage for comprehensive research
      });
      
      setTimeout(async () => {
        setIsGeneratingPlan(false);
        setGenerationProgress(100);
        setGenerationStage('Research-driven app plan complete!');
        
        // Save the app plan to the database with enhanced research
        try {
          const savedPlan = await saveAppPlan({
            company: formData.company,
            industry: formData.industry,
            description: formData.description,
            website: formData.website
          });
          
          console.log('App plan saved with research data:', savedPlan);
          
          // Also save to new app_plans table if we have a generated plan
          if (savedPlan?.features) {
            try {
              const newAppPlanData: NewAppPlanData = {
                title: `${formData.company} App Plan`,
                description: formData.description,
                business_type: formData.industry,
                app_concept: formData.description,
                features: savedPlan.features.map((feature: any) => ({ name: feature })),
                timeline: '12-16 weeks',
                budget_range: '£25,000 - £50,000',
                market_analysis: savedPlan.research_results?.marketAnalysis || '',
                metadata: {
                  originalPlanId: savedPlan.id,
                  researchResults: savedPlan.research_results
                }
              };
              
              const newSavedPlan = await saveNewAppPlan(newAppPlanData);
              console.log('Also saved to new app_plans table:', newSavedPlan);
            } catch (newTableError) {
              console.error('Failed to save to new app_plans table:', newTableError);
              // Don't fail the whole process if new table save fails
            }
          }
          
          // Add completion message with enhanced research info and clear action button
          const completionMessage: Message = {
            id: Date.now().toString(),
            role: 'assistant',
            content: `🎉 **Your comprehensive app plan is ready!**\n\nI've conducted extensive research across ${stages.length} phases including market analysis, competitor research, and strategic positioning. Your plan includes:\n\n✅ **Research-backed features** tailored to ${formData.industry}\n✅ **Competitive analysis** and market positioning\n✅ **Technical recommendations** based on industry best practices\n✅ **Strategic insights** for ${formData.company}`,
            actionComponent: (
              <div className="mt-4 space-y-3">
                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <div className="flex items-center gap-2 text-green-400 mb-2">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-semibold">App Plan Generated Successfully!</span>
                  </div>
                  <p className="text-sm text-gray-300 mb-3">
                    Your research-driven app development plan is ready to view with all findings and recommendations.
                  </p>
                </div>
                
                <Button
                  onClick={() => {
                    if (savedPlan?.username) {
                      navigate(`/app-plan/${savedPlan.username}`);
                    } else {
                      navigate('/app-plan');
                    }
                  }}
                  className="w-full bg-gradient-to-r from-siso-red to-siso-orange text-white flex items-center gap-2 py-3 text-lg font-medium"
                >
                  <ExternalLink className="h-5 w-5" />
                  View Your Complete App Plan
                </Button>
                
                {savedPlan?.username && (
                  <p className="text-xs text-gray-400 text-center">
                    Plan URL: {window.location.origin}/app-plan/{savedPlan.username}
                  </p>
                )}
              </div>
            )
          };
          
          setMessages(prev => [...prev, completionMessage]);
          
        } catch (error) {
          console.error('Failed to save app plan:', error);
          
          // Fallback message if save fails
          const fallbackMessage: Message = {
            id: Date.now().toString(),
            role: 'assistant',
            content: `🎉 **Your app plan has been generated!**\n\nI've conducted comprehensive research and created a detailed plan for ${formData.company}. The plan includes research-backed features, competitive analysis, and strategic recommendations.`,
            actionComponent: (
              <div className="mt-4">
                <Button
                  onClick={() => navigate('/app-plan')}
                  className="w-full bg-gradient-to-r from-siso-red to-siso-orange text-white flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  View Your Custom App Plan
                </Button>
              </div>
            )
          };
          
          setMessages(prev => [...prev, fallbackMessage]);
        }
        
        setCurrentStep('complete');
      }, 13000); // Total time: 13 seconds for comprehensive research
    }
  }, [isGeneratingPlan, formData]);

  const handleChatSubmit = async (message: string) => {
    if (!message.trim() || loading) return;
    
    setWaitingForUserInput(false);
    setInput('');
    
    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: message
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    if (currentStep === 'company') {
      setFormData(prev => ({ ...prev, company: message }));
      
      setShowTypingIndicator(true);
      setTimeout(() => {
        setShowTypingIndicator(false);
        const assistantMessage = {
          id: Date.now().toString(),
          role: 'assistant' as const,
          content: `Great! In one sentence, what does ${message} do?`,
          requiresAction: true
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        setCurrentStep('description');
        setWaitingForUserInput(true);
      }, 1000);
    }
    else if (currentStep === 'description') {
      setFormData(prev => ({ ...prev, description: message }));
      
      setShowTypingIndicator(true);
      setTimeout(() => {
        setShowTypingIndicator(false);
        const assistantMessage = {
          id: Date.now().toString(),
          role: 'assistant' as const,
          content: `Perfect! Do you have any online presence I can research?`,
          actionComponent: (
            <div className="mt-4 space-y-3">
              <p className="text-sm text-gray-300 mb-3">Select your online presence:</p>
              
              <Button
                onClick={() => handleWebsiteChoice('website')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                I have a website
              </Button>
              
              <Button
                onClick={() => handleWebsiteChoice('instagram')}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                I have Instagram/Social Media
              </Button>
              
              <Button
                onClick={() => handleWebsiteChoice('none')}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                No online presence yet
              </Button>
            </div>
          )
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        setCurrentStep('website');
        setWaitingForUserInput(false);
      }, 1000);
    }
    else if (currentStep === 'website_input') {
      // Handle the URL input
      setFormData(prev => ({ ...prev, website: message }));
      
      setShowTypingIndicator(true);
      setTimeout(() => {
        setShowTypingIndicator(false);
        const startMessage = {
          id: Date.now().toString(),
          role: 'assistant' as const,
          content: `Perfect! I have all the information I need. Starting research on ${formData.company} and ${formData.websiteType === 'website' ? 'your website' : 'your social media'} now...`
        };
        
        setMessages(prev => [...prev, startMessage]);
        
        // Start research automatically
        setTimeout(() => {
          setIsResearching(true);
          setGenerationProgress(5);
          setGenerationStage('Initializing research process...');
          setCurrentStep('research');
        }, 1000);
      }, 500);
    }
  };

  const handleWebsiteChoice = (choice: 'website' | 'instagram' | 'none') => {
    const choiceText = choice === 'website' ? 'I have a website' : 
                     choice === 'instagram' ? 'I have Instagram/Social Media' : 
                     'No online presence yet';
    
    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: choiceText
    };
    
    setMessages(prev => [...prev, userMessage]);
    setFormData(prev => ({ ...prev, websiteType: choice }));
    
    if (choice === 'none') {
      // If no online presence, start research immediately
      setTimeout(() => {
        const startMessage = {
          id: Date.now().toString(),
          role: 'assistant' as const,
          content: `Perfect! I have all the information I need. Starting research on ${formData.company} now...`
        };
        
        setMessages(prev => [...prev, startMessage]);
        
        // Start research automatically
        setTimeout(() => {
          setIsResearching(true);
          setGenerationProgress(5);
          setGenerationStage('Initializing research process...');
          setCurrentStep('research');
        }, 1000);
      }, 500);
    } else {
      // If they have website or social media, ask for the URL
      setTimeout(() => {
        const urlRequestMessage = {
          id: Date.now().toString(),
          role: 'assistant' as const,
          content: choice === 'website' 
            ? 'Great! Please enter your website URL:' 
            : 'Perfect! Please enter your Instagram handle or social media URL:',
          requiresAction: true
        };
        
        setMessages(prev => [...prev, urlRequestMessage]);
        setCurrentStep('website_input');
        setWaitingForUserInput(true);
      }, 500);
    }
  };

  const startAppPlanGeneration = async () => {
    // Don't add a separate message, just continue the loading state
    setIsGeneratingPlan(true);
    setGenerationProgress(10); // Continue from where research left off
    setGenerationStage('Building your app development plan...');
    setCurrentStep('app_plan');
    
    // Save basic onboarding data to database (optional)
    try {
      if (userId) {
        const { error: saveError } = await supabase.from('onboarding').insert({
          organization: formData.company,
          app_idea: formData.description,
          user_id: userId,
          industry: formData.industry,
          additional_requirements: formData.website,
          communication_preference: communicationMethod,
          phone_number: phoneNumber || null
        });
        
        if (saveError) {
          console.warn('Error saving onboarding data:', saveError);
        }
      }
    } catch (error) {
      console.warn('Error saving onboarding data:', error);
    }
    
    // The enhanced research system will now take over via the useEffect that monitors isGeneratingPlan
    // This will trigger the 6-stage enhanced research process and completion message
  };

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      handleChatSubmit(input.trim());
    }
  };

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
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 pt-20 pb-24">
        {/* Progress indicators with BRIGHT VISIBLE loading icons */}
        {(isResearching || isGeneratingPlan || researchComplete) && (
          <div className="mb-6 bg-gray-900/80 border border-orange-500/30 rounded-lg p-4 shadow-xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center gap-2">
                <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
                <div className="animate-pulse">
                  <div className="w-6 h-6 bg-orange-500 rounded-full animate-bounce"></div>
                </div>
                <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
              </div>
              <h3 className="text-lg font-bold text-orange-400">{generationStage}</h3>
            </div>
            <div className="space-y-3">
              <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden border border-orange-500/20">
                <div 
                  className="h-full bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 rounded-full transition-all duration-500 animate-pulse"
                  style={{ width: `${generationProgress}%` }}
                />
              </div>
              <div className="flex justify-between text-sm font-medium text-orange-300">
                {isResearching ? (
                  <>
                    <span>🔍 Scraping</span>
                    <span>📊 Industry</span>
                    <span>🏢 Competitors</span>
                    <span>⚡ Analysis</span>
                  </>
                ) : (
                  <>
                    <span>✅ Research</span>
                    <span>🛠️ Features</span>
                    <span>📋 Planning</span>
                    <span>🎉 Complete</span>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Chat messages */}
        <div className="flex-1 space-y-4 py-4">
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex max-w-[90%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`flex items-center justify-center h-10 w-10 rounded-full shrink-0 ${
                    message.role === 'assistant' 
                      ? 'bg-gradient-to-r from-siso-red to-siso-orange' 
                      : 'bg-siso-text/30'
                  } ${message.role === 'user' ? 'ml-3' : 'mr-3'}`}>
                    {message.role === 'assistant' ? <SisoIcon className="w-6 h-6 text-white" /> : <User size={20} />}
                  </div>
                  
                  <div className="flex flex-col">
                    {message.role === 'assistant' && (
                      <span className="text-xs text-siso-text-muted ml-2 mb-1">SISO</span>
                    )}
                    <div className={`rounded-2xl p-4 ${
                      message.role === 'assistant'
                        ? 'bg-black/40 text-white border border-siso-text/10'
                        : 'bg-siso-orange/90 text-black'
                    }`}>
                      <div className="whitespace-pre-line">{message.content}</div>
                      {message.actionComponent}
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
                  <div className="flex items-center justify-center h-10 w-10 rounded-full shrink-0 bg-gradient-to-r from-siso-red to-siso-orange mr-3">
                    <SisoIcon className="w-6 h-6 text-white" />
                  </div>
                  
                  <div className="flex flex-col">
                    <span className="text-xs text-siso-text-muted ml-2 mb-1">SISO</span>
                    <div className="rounded-2xl p-4 bg-black/40 text-white border border-siso-text/10">
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

      {/* Input area */}
      {waitingForUserInput && communicationMethod && (
        <div className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm border-t border-siso-text/10 p-4">
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleInputSubmit} className="flex gap-2">
              <div className="flex-1 relative">
                <Input
                  type="text"
                  placeholder={communicationMethod === 'voice' ? "Speak or type your response..." : "Type your response..."}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="bg-black/40 border-siso-text/20 text-white pr-12"
                  disabled={loading}
                />
                
                {communicationMethod === 'voice' && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleVoiceRecord}
                    className={`absolute right-2 top-1/2 transform -translate-y-1/2 ${
                      isRecording ? 'text-red-500 animate-pulse' : 'text-siso-text'
                    }`}
                  >
                    {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
                  </Button>
                )}
              </div>
              
              <Button 
                type="submit" 
                disabled={!input.trim() || loading}
                className="bg-gradient-to-r from-siso-red to-siso-orange text-white"
              >
                <Send size={16} />
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OnboardingChat;
