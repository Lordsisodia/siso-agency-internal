import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/shared/hooks/use-toast';
import { Waves } from '@/shared/ui/waves-background';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/shared/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Users, Award } from 'lucide-react';

const authSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type AuthFormValues = z.infer<typeof authSchema>;

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  // Get partner context from navigation state
  const partnerContext = location.state as {
    userType?: 'partner';
    returnTo?: string;
    source?: string;
    formData?: any;
  } | null;
  
  const isPartnerSignup = partnerContext?.userType === 'partner';

  const form = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    // Check if user is already logged in
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/home', { replace: true });
      }
    };
    
    checkSession();
  }, [navigate]);

  const handleEmailAuth = async (values: AuthFormValues) => {
    setIsLoading(true);
    try {
      if (isSignUp) {
        // Handle sign up
        const { data, error } = await supabase.auth.signUp({
          email: values.email,
          password: values.password,
          options: {
            data: {
              full_name: values.email.split('@')[0], // Default name from email
              user_role: isPartnerSignup ? 'partner' : 'user', // Set role based on signup context
              partner_source: isPartnerSignup ? partnerContext?.source : null,
              partner_form_data: isPartnerSignup ? partnerContext?.formData : null,
            },
          },
        });
        
        if (error) throw error;
        
        // Create partner profile if this is a partner signup
        if (isPartnerSignup && data.user) {
          const { error: profileError } = await supabase
            .from('partner_profiles')
            .insert({
              user_id: data.user.id,
              email: values.email,
              status: 'pending',
              source: partnerContext?.source || 'partnership-landing',
              application_data: partnerContext?.formData || {},
              created_at: new Date().toISOString(),
            });
            
          if (profileError) {
            console.error('Error creating partner profile:', profileError);
          }
        }
        
        toast({
          title: isPartnerSignup ? "Partner application submitted!" : "Account created",
          description: isPartnerSignup 
            ? "Welcome to the SISO Partner Program! Check your email to verify your account."
            : "Welcome to SISO Agency Platform",
        });
        
        // Navigate to appropriate dashboard
        const redirectTo = partnerContext?.returnTo || '/home';
        navigate(redirectTo);
      } else {
        // Handle sign in
        const { data, error } = await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password,
        });
        
        if (error) throw error;
        
        toast({
          title: "Welcome back!",
          description: "Successfully signed in",
        });
        
        // Check if user is a partner and redirect accordingly
        if (data.user) {
          const { data: profile } = await supabase
            .from('partner_profiles')
            .select('*')
            .eq('user_id', data.user.id)
            .single();
            
          if (profile) {
            navigate('/partner-dashboard');
          } else {
            navigate('/home');
          }
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      
      // Handle specific error messages
      if (error.message.includes('Email not confirmed')) {
        toast({
          variant: "destructive",
          title: "Email not verified",
          description: "Please check your email and click the verification link",
        });
      } else if (error.message.includes('Invalid login')) {
        toast({
          variant: "destructive",
          title: "Invalid credentials",
          description: "Please check your email and password",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Authentication error",
          description: error.message || "Please try again",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-siso-bg to-black/95 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <Card className="bg-siso-bg-alt border-siso-border shadow-2xl">
          <CardHeader className="text-center space-y-4">
            {isPartnerSignup && (
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="flex items-center justify-center gap-2 mx-auto px-4 py-2 
                  bg-gradient-to-r from-orange-500/20 to-orange-600/20 rounded-full 
                  border border-orange-500/40"
              >
                <Award className="w-5 h-5 text-orange-400" />
                <span className="text-orange-400 font-semibold text-sm">
                  Partner Program
                </span>
              </motion.div>
            )}
            
            <div>
              <img
                src="/lovable-uploads/c5921a2f-8856-42f4-bec5-2d08b81c5691.png"
                alt="SISO Agency"
                className="h-16 w-16 mx-auto rounded-xl border border-siso-orange/60 shadow-lg bg-black/40 mb-4"
              />
              <CardTitle className="text-2xl font-bold text-siso-text">
                {isPartnerSignup 
                  ? (isSignUp ? 'Join SISO Partners' : 'Partner Portal')
                  : (isSignUp ? 'Create Account' : 'Welcome Back')
                }
              </CardTitle>
              <CardDescription className="text-siso-text-muted">
                {isPartnerSignup 
                  ? (isSignUp ? 'Create your partner account to start earning commissions' : 'Sign in to your partner dashboard')
                  : (isSignUp ? 'Join the SISO Agency platform' : 'Sign in to your account')
                }
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleEmailAuth)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-siso-text">Email</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="youremail@example.com" 
                          {...field} 
                          className="bg-black/20 border-siso-text/20 text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-siso-text">Password</FormLabel>
                      <FormControl>
                        <Input 
                          type={showPassword ? "text" : "password"} 
                          placeholder="••••••••" 
                          {...field} 
                          className="bg-black/20 border-siso-text/20 text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit"
                  className="w-full bg-gradient-to-r from-siso-red to-siso-orange hover:opacity-90"
                  disabled={isLoading}
                >
                  {isLoading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}
                </Button>
              </form>
            </Form>

            <div className="text-center">
              <Button 
                variant="ghost" 
                className="text-siso-text hover:text-siso-orange"
                onClick={() => setIsSignUp(!isSignUp)}
              >
                {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
              </Button>
            </div>

            <div className="text-center text-sm text-siso-text/70 mt-6">
              By signing in, you agree to our{" "}
              <a href="/terms" className="text-siso-red hover:text-siso-orange transition-colors">
                Terms of Service
              </a>
              {" "}and{" "}
              <a href="/privacy" className="text-siso-red hover:text-siso-orange transition-colors">
                Privacy Policy
              </a>
            </div>

            <div className="mt-4 text-center">
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/testing'}
                className="bg-black/30 border-white/20 text-white hover:bg-black/50"
              >
                🧪 Access AI Testing Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
