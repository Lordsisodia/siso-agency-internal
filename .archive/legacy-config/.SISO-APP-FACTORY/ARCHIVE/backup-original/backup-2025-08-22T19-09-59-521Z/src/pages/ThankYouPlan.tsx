
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Clock, DollarSign, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GradientHeading } from '@/components/ui/gradient-heading';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useOnboardingAuth } from '@/hooks/useOnboardingAuth';

const ThankYouPlan = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showVideoSection, setShowVideoSection] = useState(false);
  const [showWhatsappForm, setShowWhatsappForm] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(true);
  const { userId, isLoading } = useOnboardingAuth();
  
  const planData = location.state?.planData || {
    totalCost: 0,
    timeline: 30,
    agencyName: 'Your Agency'
  };
  
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // If user is already logged in, show video section first
        setShowWhatsappForm(false);
        setShowVideoSection(true);
      }
    };
    
    checkSession();
  }, []);
  
  const handleWhatsappSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!whatsappNumber.trim()) {
      toast({
        variant: "destructive",
        title: "WhatsApp number required",
        description: "Please enter your WhatsApp number to continue",
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const { error } = await supabase
        .from('onboarding')
        .insert([
          { 
            name: planData.agencyName || 'Unknown',
            organization: planData.agencyName || 'Unknown',
            app_idea: 'OnlyFans Management Platform',
            social_links: { whatsapp: whatsappNumber },
            whatsapp_number: whatsappNumber,
            status: 'confirmed',
            user_id: userId
          }
        ]);
      
      if (error) {
        console.error('Database error:', error);
        throw error;
      }
      
      toast({
        title: "Information saved",
        description: "Your WhatsApp number has been saved",
      });
      
      // After saving WhatsApp, always show video section next
      setShowWhatsappForm(false);
      setShowVideoSection(true);
      
      // If not logged in, after video we'll show auth form
      if (!userId) {
        // We'll prompt to login when they click "Go to Dashboard"
        // so we don't interrupt the CEO welcome video
      }
      
    } catch (error: any) {
      console.error('Error saving WhatsApp number:', error);
      toast({
        variant: "destructive",
        title: "Error saving information",
        description: error.message || "There was a problem saving your WhatsApp number",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const validatePassword = () => {
    if (password.length < 6) {
      toast({
        variant: "destructive",
        title: "Password too short",
        description: "Password must be at least 6 characters long",
      });
      return false;
    }
    
    if (isSignUp && password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Passwords don't match",
        description: "Please ensure your passwords match",
      });
      return false;
    }
    
    return true;
  };
  
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({
        variant: "destructive",
        title: "Email required",
        description: "Please enter your email address",
      });
      return;
    }
    
    if (!validatePassword()) return;
    
    setIsSubmitting(true);
    
    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: planData.agencyName || 'Decora User'
            }
          }
        });
        
        if (error) throw error;
        
        toast({
          title: "Account created",
          description: "Your account has been created successfully!",
        });
        
        if (data.user) {
          const { error: updateError } = await supabase
            .from('onboarding')
            .update({ user_id: data.user.id })
            .eq('whatsapp_number', whatsappNumber);
            
          if (updateError) {
            console.error('Error updating onboarding entry:', updateError);
          }
        }
        
        // After successful signup, go to dashboard
        navigate('/home');
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        
        toast({
          title: "Signed in",
          description: "You have successfully signed in!",
        });
        
        if (data.user) {
          const { error: updateError } = await supabase
            .from('onboarding')
            .update({ user_id: data.user.id })
            .eq('whatsapp_number', whatsappNumber)
            .is('user_id', null);
            
          if (updateError) {
            console.error('Error updating onboarding entry:', updateError);
          }
        }
        
        // After successful login, go to dashboard
        navigate('/home');
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      toast({
        variant: "destructive",
        title: `Error ${isSignUp ? 'creating account' : 'signing in'}`,
        description: error.message || "There was a problem with authentication",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp);
    setPassword('');
    setConfirmPassword('');
  };

  const handleDashboardClick = () => {
    // Check if user is logged in before going to dashboard
    if (userId) {
      navigate('/home');
    } else {
      setShowVideoSection(false);
      setShowLoginForm(true);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black via-siso-bg to-black p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        <div className="bg-black/40 backdrop-blur-md rounded-lg border border-siso-text/10 shadow-xl p-8">
          {showWhatsappForm && (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="mx-auto bg-gradient-to-r from-siso-red to-siso-orange w-16 h-16 rounded-full flex items-center justify-center mb-6"
              >
                <CheckCircle className="h-8 w-8 text-white" />
              </motion.div>
              
              <GradientHeading className="text-3xl mb-4 text-center">
                Plan Confirmed!
              </GradientHeading>
              
              <div className="space-y-6 mb-8">
                <div className="bg-black/30 rounded-lg p-4 border border-siso-text/10">
                  <h3 className="font-semibold text-white mb-2">MVP Information</h3>
                  
                  <div className="flex items-center text-siso-text mb-2">
                    <DollarSign className="h-4 w-4 text-siso-orange mr-2" />
                    <span>Estimated Cost: <span className="text-white">FREE</span></span>
                  </div>
                  
                  <div className="flex items-center text-siso-text">
                    <Clock className="h-4 w-4 text-siso-orange mr-2" />
                    <span>Build Time: <span className="text-white">{planData.timeline || 30} days</span></span>
                  </div>
                </div>
                
                <form onSubmit={handleWhatsappSubmit}>
                  <h3 className="font-medium text-white mb-2">Connect with Us</h3>
                  <p className="text-sm text-siso-text mb-4">
                    Enter your WhatsApp number to receive updates about your project
                  </p>
                  
                  <div className="space-y-4">
                    <div>
                      <Input
                        type="text"
                        placeholder="WhatsApp Number (with country code)"
                        value={whatsappNumber}
                        onChange={(e) => setWhatsappNumber(e.target.value)}
                        className="bg-black/20 border-siso-text/20 text-white"
                      />
                    </div>
                    
                    <Button 
                      type="submit"
                      className="w-full bg-gradient-to-r from-siso-red to-siso-orange hover:opacity-90"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>Processing...</>
                      ) : (
                        <>
                          Continue
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </>
          )}
          
          {showLoginForm && (
            <>
              <GradientHeading className="text-3xl mb-4 text-center">
                {isSignUp ? 'Create an Account' : 'Sign In'}
              </GradientHeading>
              
              <p className="text-siso-text text-center mb-6">
                {isSignUp 
                  ? 'Sign up to access your dashboard and project updates' 
                  : 'Sign in to access your dashboard and project updates'}
              </p>
              
              <form className="space-y-4 mb-6" onSubmit={handleAuth}>
                <div>
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-black/20 border-siso-text/20 text-white"
                  />
                </div>
                
                <div>
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-black/20 border-siso-text/20 text-white"
                  />
                </div>
                
                {isSignUp && (
                  <div>
                    <Input
                      type="password"
                      placeholder="Confirm Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="bg-black/20 border-siso-text/20 text-white"
                    />
                  </div>
                )}
                
                <Button 
                  type="submit"
                  className="w-full bg-gradient-to-r from-siso-red to-siso-orange hover:opacity-90"
                  disabled={isSubmitting}
                >
                  {isSubmitting 
                    ? (isSignUp ? 'Creating Account...' : 'Signing In...') 
                    : (isSignUp ? 'Create Account' : 'Sign In')}
                </Button>
              </form>
              
              <div className="text-center mt-6">
                <p className="text-sm text-siso-text mb-2">
                  {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                </p>
                <Button
                  variant="link"
                  className="text-siso-orange p-0"
                  onClick={toggleAuthMode}
                  type="button"
                >
                  {isSignUp ? 'Sign In' : 'Create Account'}
                </Button>
              </div>
            </>
          )}
          
          {showVideoSection && (
            <>
              <GradientHeading className="text-3xl mb-4 text-center">
                Welcome to Our Agency Platform!
              </GradientHeading>
              
              <p className="text-siso-text text-center mb-6">
                A message from our CEO about your new Agency Management Platform
              </p>
              
              <div className="aspect-video rounded-lg bg-black/50 mb-6 overflow-hidden flex items-center justify-center">
                <div className="text-center p-4">
                  <h3 className="text-white font-semibold mb-2">CEO Welcome Video</h3>
                  <p className="text-siso-text text-sm">
                    Welcome to your new platform! We're excited to help you build amazing apps for your clients.
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <Button 
                  onClick={handleDashboardClick}
                  className="w-full bg-gradient-to-r from-siso-red to-siso-orange hover:opacity-90"
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => navigate('/onboarding-chat')}
                  className="w-full border-siso-orange/30 text-siso-orange hover:bg-siso-orange/10"
                >
                  Complete Onboarding
                </Button>
                
                <p className="text-xs text-siso-text/60 text-center">
                  Have questions? Contact us on WhatsApp for support
                </p>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ThankYouPlan;
