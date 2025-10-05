import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, User, X, ArrowLeft, Send, Mic, Phone, MessageSquare, MicOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageLoading } from '@/components/ui/message-loading';
import { toast } from '@/hooks/use-toast';
import { SisoIcon } from '@/components/ui/icons/SisoIcon';
import { autoTriggerSystem } from '@/services/autoTriggerSystem';

interface Message {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  requiresAction?: boolean;
  actionComponent?: React.ReactNode;
}

interface BusinessInfo {
  businessName: string;
  appPurpose: string;
  industry: string;
  targetAudience: string;
  completedAt: string;
  // Enhanced client data
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  companySize?: string;
  budget?: string;
  timeline?: string;
  communicationPreference?: 'chat' | 'voice' | 'phone';
}

export function BusinessOnboarding() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<'intro' | 'businessName' | 'appPurpose' | 'industry' | 'targetAudience' | 'complete'>('intro');
  const [formData, setFormData] = useState({
    businessName: '',
    appPurpose: '',
    industry: '',
    targetAudience: ''
  });
  const [waitingForUserInput, setWaitingForUserInput] = useState(false);
  const [showTypingIndicator, setShowTypingIndicator] = useState(false);
  const [communicationMethod, setCommunicationMethod] = useState<'chat' | 'voice' | 'phone' | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Initialize with communication method selection
  useEffect(() => {
    const welcomeMessage = {
      id: '1',
      role: 'assistant' as const,
      content: "👋 Hi! I'm SISO, your AI assistant. I'll help you get started by collecting some information about your business. How would you like to communicate with me?",
      actionComponent: (
        <div className="mt-4 space-y-3">
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
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, showTypingIndicator]);

  const handleCommunicationChoice = (method: 'chat' | 'voice' | 'phone') => {
    setCommunicationMethod(method);
    
    let responseMessage = '';
    let nextAction = null;
    
    if (method === 'chat') {
      responseMessage = "Perfect! I'll ask you a few questions via chat. Let's start with your business information.";
      nextAction = () => startBusinessQuestions();
    } else if (method === 'voice') {
      responseMessage = "Great! I'll ask questions and you can speak your responses. Make sure your microphone is enabled.";
      nextAction = () => startBusinessQuestions();
    } else {
      responseMessage = "I'd love to speak with you! Please book a call with our team and we'll collect this information during our conversation.";
      nextAction = () => handlePhoneCall();
    }
    
    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: method === 'chat' ? 'I want to chat' : method === 'voice' ? 'I want to use voice' : 'I want a phone call'
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Show typing indicator
    setShowTypingIndicator(true);
    
    setTimeout(() => {
      setShowTypingIndicator(false);
      const assistantMessage = {
        id: Date.now().toString(),
        role: 'assistant' as const,
        content: responseMessage
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      if (nextAction) {
        setTimeout(nextAction, 1000);
      }
    }, 1000);
  };

  const handlePhoneCall = () => {
    // Show phone call scheduling component
    setShowTypingIndicator(true);
    
    setTimeout(() => {
      setShowTypingIndicator(false);
      const callMessage = {
        id: Date.now().toString(),
        role: 'assistant' as const,
        content: "Here's how to schedule a call with our team:",
        actionComponent: (
          <div className="mt-4 space-y-3">
            <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
              <h3 className="font-medium text-orange-400 mb-2">Schedule Your Call</h3>
              <p className="text-sm text-gray-300 mb-3">
                Our team will collect your business information and help you get started.
              </p>
              <div className="space-y-2">
                <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                  <Phone className="h-4 w-4 mr-2" />
                  Book a 15-minute call
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full border-white/20 text-gray-300"
                  onClick={() => navigate('/home')}
                >
                  Back to Dashboard
                </Button>
              </div>
            </div>
          </div>
        )
      };
      
      setMessages(prev => [...prev, callMessage]);
    }, 1000);
  };

  const startBusinessQuestions = () => {
    setShowTypingIndicator(true);
    
    setTimeout(() => {
      setShowTypingIndicator(false);
      const firstQuestion = {
        id: Date.now().toString(),
        role: 'assistant' as const,
        content: "What's your business or company name?",
        requiresAction: true
      };
      
      setMessages(prev => [...prev, firstQuestion]);
      setCurrentStep('businessName');
      setWaitingForUserInput(true);
    }, 1000);
  };

  const handleVoiceToggle = () => {
    if (isRecording) {
      // Stop recording
      setIsRecording(false);
      toast({
        title: "Voice recording stopped",
        description: "Processing your response..."
      });
      
      // Simulate voice processing
      setTimeout(() => {
        handleChatSubmit("My business name is SISO Agency"); // This would be the transcribed text
      }, 2000);
    } else {
      // Start recording
      setIsRecording(true);
      toast({
        title: "Voice recording started",
        description: "Speak your response now..."
      });
    }
  };

  const handleChatSubmit = async (message: string) => {
    if (!message.trim() || loading) return;
    
    setWaitingForUserInput(false);
    setInput('');
    
    // Add user message to chat
    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: message
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Process the user's message based on current step
    if (currentStep === 'businessName') {
      setFormData(prev => ({ ...prev, businessName: message }));
      
      setShowTypingIndicator(true);
      
      setTimeout(() => {
        setShowTypingIndicator(false);
        const assistantMessage = {
          id: Date.now().toString(),
          role: 'assistant' as const,
          content: `Great! What do you want your app to do, ${message}? Tell me about the main purpose or problem it will solve.`,
          requiresAction: true
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        setCurrentStep('appPurpose');
        setWaitingForUserInput(true);
      }, 1000);
    } 
    else if (currentStep === 'appPurpose') {
      setFormData(prev => ({ ...prev, appPurpose: message }));
      
      setShowTypingIndicator(true);
      
      setTimeout(() => {
        setShowTypingIndicator(false);
        const assistantMessage = {
          id: Date.now().toString(),
          role: 'assistant' as const,
          content: "That sounds interesting! What industry are you in? (This is optional, but helps us understand your market)",
          requiresAction: true
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        setCurrentStep('industry');
        setWaitingForUserInput(true);
      }, 1000);
    }
    else if (currentStep === 'industry') {
      setFormData(prev => ({ ...prev, industry: message }));
      
      setShowTypingIndicator(true);
      
      setTimeout(() => {
        setShowTypingIndicator(false);
        const assistantMessage = {
          id: Date.now().toString(),
          role: 'assistant' as const,
          content: "Perfect! One last question - who will be using your app? (Your target audience - also optional)",
          requiresAction: true
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        setCurrentStep('targetAudience');
        setWaitingForUserInput(true);
      }, 1000);
    }
    else if (currentStep === 'targetAudience') {
      setFormData(prev => ({ ...prev, targetAudience: message }));
      
      // Complete the onboarding
      handleComplete();
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    
    const businessData: BusinessInfo = {
      businessName: formData.businessName,
      appPurpose: formData.appPurpose,
      industry: formData.industry || 'Not specified',
      targetAudience: formData.targetAudience || 'Not specified',
      completedAt: new Date().toISOString(),
      // Enhanced client data
      communicationPreference: communicationMethod || 'chat',
    };

    try {
      // Save to localStorage for immediate use
      localStorage.setItem('business-onboarding-data', JSON.stringify(businessData));
      
      // Also save as client data for wider platform use
      localStorage.setItem('client-profile', JSON.stringify({
        company_name: businessData.businessName,
        project_description: businessData.appPurpose,
        industry: businessData.industry,
        target_audience: businessData.targetAudience,
        communication_preference: businessData.communicationPreference,
        onboarding_completed: true,
        onboarding_date: businessData.completedAt,
        contact_name: businessData.businessName, // Will be enhanced later
        status: 'onboarded'
      }));
      
      // Mark the onboarding task as completed
      const completedTasks = JSON.parse(localStorage.getItem('workflow-completed-tasks') || '[]');
      if (!completedTasks.includes('workflow-1')) {
        completedTasks.push('workflow-1');
        localStorage.setItem('workflow-completed-tasks', JSON.stringify(completedTasks));
      }

      // 🚀 TRIGGER AUTOMATIC APP PLAN GENERATION
      console.log('🤖 Triggering automatic app plan generation...');
      
      // Configure auto-trigger for this session
      autoTriggerSystem.configure({
        enabled: true,
        delay: 2000, // 2 second delay
        showProgress: true,
        redirectAfterGeneration: false, // Don't redirect automatically
        redirectUrl: '/app-plan'
      });

      // Trigger the auto-generation
      const triggerResult = await autoTriggerSystem.checkAndTrigger();
      
      if (triggerResult) {
        toast({
          title: '🤖 AI Agent Activated',
          description: 'Generating your comprehensive app plan in the background...',
          duration: 5000
        });
      }

      setShowTypingIndicator(true);
      
      setTimeout(() => {
        setShowTypingIndicator(false);
        const completionMessage = {
          id: Date.now().toString(),
          role: 'assistant' as const,
          content: `Excellent! I've saved your business information. ${businessData.businessName} sounds like a great project! 🎉

${triggerResult ? '🤖 I\'m also generating a comprehensive app plan for you using AI. This will be ready in about 30-60 seconds!' : ''}`,
          actionComponent: (
            <div className="mt-4 space-y-3">
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <h3 className="font-medium text-green-400 mb-2">✅ Step 1 Complete!</h3>
                <p className="text-sm text-gray-300 mb-3">
                  Your business information has been saved. {triggerResult ? 'AI is generating your app plan automatically!' : 'Ready for the next step?'}
                </p>
                <div className="space-y-2">
                  {triggerResult && (
                    <Button 
                      onClick={() => navigate('/app-plan')}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      🤖 View AI App Plan Generator →
                    </Button>
                  )}
                  <Button 
                    onClick={() => navigate('/plan-builder')}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    Next: Define App Requirements →
                  </Button>
                  <Button 
                    onClick={() => navigate('/home')}
                    variant="outline"
                    className="w-full border-white/20 text-gray-300 hover:bg-white/10"
                  >
                    Back to Dashboard
                  </Button>
                </div>
              </div>
            </div>
          )
        };
        
        setMessages(prev => [...prev, completionMessage]);
        setCurrentStep('complete');
        
        toast({
          title: 'Business information saved! 🎉',
          description: `Welcome ${businessData.businessName}! Your information has been recorded.`,
        });
      }, 1000);

    } catch (error) {
      console.error('Error in onboarding completion:', error);
      toast({
        title: 'Error saving information',
        description: 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    if (currentStep === 'industry' || currentStep === 'targetAudience') {
      const message = 'skip';
      handleChatSubmit(message);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-black via-black to-gray-900">
      {/* Header */}
      <header className="p-4 border-b border-white/10 flex items-center justify-between bg-black/30 backdrop-blur-sm fixed top-0 left-0 right-0 z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/home')}
          className="text-gray-300 hover:text-white hover:bg-white/10"
        >
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-lg font-medium text-white">Business Onboarding</h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/home')}
          className="text-gray-300 hover:text-white hover:bg-white/10"
        >
          <X size={20} />
        </Button>
      </header>
      
      {/* Main chat container */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 pt-20 pb-24">
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
                      ? 'bg-gradient-to-r from-orange-500 to-red-500' 
                      : 'bg-gray-600'
                  } ${message.role === 'user' ? 'ml-3' : 'mr-3'}`}>
                    {message.role === 'assistant' ? <SisoIcon className="w-6 h-6 text-white" /> : <User size={20} className="text-white" />}
                  </div>
                  
                  <div className="flex flex-col">
                    {message.role === 'assistant' && (
                      <span className="text-xs text-gray-400 ml-2 mb-1">SISO</span>
                    )}
                    <div className={`rounded-2xl p-4 ${
                      message.role === 'assistant'
                        ? 'bg-black/40 text-white border border-white/10'
                        : 'bg-orange-600 text-white'
                    }`}>
                      {message.content}
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
                  <div className="flex items-center justify-center h-10 w-10 rounded-full shrink-0 bg-gradient-to-r from-orange-500 to-red-500 mr-3">
                    <SisoIcon className="w-6 h-6 text-white" />
                  </div>
                  
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-400 ml-2 mb-1">SISO</span>
                    <div className="rounded-2xl p-4 bg-black/40 text-white border border-white/10">
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

      {/* Input area - only show if waiting for user input and communication method is set */}
      {waitingForUserInput && (communicationMethod === 'chat' || communicationMethod === 'voice') && (
        <div className="fixed bottom-0 left-0 right-0 bg-black/30 backdrop-blur-sm border-t border-white/10 p-4">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center space-x-2">
              <div className="flex-1 relative">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={communicationMethod === 'voice' ? "Speak or type your response..." : "Type your response..."}
                  onKeyPress={(e) => e.key === 'Enter' && handleChatSubmit(input)}
                  className="bg-black/30 border-white/20 text-white placeholder:text-gray-500 pr-12"
                />
                
                {/* Voice button for voice mode */}
                {communicationMethod === 'voice' && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleVoiceToggle}
                    className={`absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 ${
                      isRecording ? 'text-red-500 bg-red-500/10' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </Button>
                )}
              </div>
              
              <Button
                onClick={() => handleChatSubmit(input)}
                size="icon"
                className="bg-orange-600 hover:bg-orange-700 text-white"
                disabled={!input.trim() || loading}
              >
                <Send className="h-4 w-4" />
              </Button>
              
              {/* Skip button for optional questions */}
              {(currentStep === 'industry' || currentStep === 'targetAudience') && (
                <Button
                  onClick={handleSkip}
                  variant="outline"
                  size="sm"
                  className="border-white/20 text-gray-300 hover:bg-white/10"
                >
                  Skip
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 