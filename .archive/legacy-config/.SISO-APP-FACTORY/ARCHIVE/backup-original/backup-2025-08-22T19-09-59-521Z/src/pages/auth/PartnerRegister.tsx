import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Phone, Building, ArrowRight, Shield, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
  import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const PartnerRegister = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    password: '',
    confirmPassword: '',
    experienceLevel: '',
    networkDescription: '',
    expectedReferrals: '',
    agreeToTerms: false,
    agreeToMarketing: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!formData.agreeToTerms) {
      toast.error('Please agree to the terms and conditions');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);

    try {
      console.log('PartnerRegister - Attempting registration for:', formData.email);
      
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
            user_role: 'partner',
            phone: formData.phone,
            company: formData.company || null,
          },
        },
      });
      
      if (authError) {
        console.error('PartnerRegister - Auth signup error:', authError);
        throw authError;
      }
      
      console.log('PartnerRegister - Auth user created:', authData.user?.id);
      
      // Create partner application if user was created
      if (authData.user) {
        const { error: applicationError } = await supabase
          .from('partner_applications')
          .insert({
            user_id: authData.user.id,
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            company: formData.company || null,
            experience_level: formData.experienceLevel,
            network_description: formData.networkDescription,
            expected_referrals: parseInt(formData.expectedReferrals) || 1,
            status: 'pending',
            source: 'partner-registration',
            application_data: {
              agreeToMarketing: formData.agreeToMarketing,
              registrationDate: new Date().toISOString(),
            },
          });
          
        if (applicationError) {
          console.error('PartnerRegister - Application creation error:', applicationError);
          // Don't throw here, auth user was created successfully
        } else {
          console.log('PartnerRegister - Partner application created successfully');
        }
      }
      
      toast.success('Registration successful! Please check your email to verify your account.');
      
      // Redirect to login with success message
      navigate('/auth/login', { 
        state: { 
          message: 'Registration successful! Please sign in with your new account.',
          email: formData.email
        }
      });
    } catch (error: any) {
      console.error('PartnerRegister - Registration error:', error);
      
      // Handle specific error messages
      if (error.message?.includes('already registered')) {
        toast.error('An account with this email already exists. Please sign in instead.');
      } else if (error.message?.includes('Password')) {
        toast.error('Password requirements not met. Please use a stronger password.');
      } else {
        toast.error('Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const experienceLevels = [
    { value: 'beginner', label: 'Beginner (0-1 years)' },
    { value: 'intermediate', label: 'Intermediate (2-5 years)' },
    { value: 'experienced', label: 'Experienced (5+ years)' },
    { value: 'expert', label: 'Expert (10+ years)' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center px-4 py-8">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-3 px-6 py-3 bg-gray-800/80 border border-orange-500/30 
              rounded-full backdrop-blur-sm mb-6"
          >
            <Shield className="w-5 h-5 text-orange-500" />
            <span className="text-orange-400 font-semibold">Partner Application</span>
          </motion.div>
          
          <h1 className="text-3xl font-bold text-white mb-2">Join Our Partner Program</h1>
          <p className="text-gray-400">Start earning £500 per successful referral</p>
        </div>

        {/* Registration Form */}
        <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white text-center">Partner Registration</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white">Full Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="bg-gray-700 border-gray-600 text-white pl-10 focus:border-orange-500"
                      placeholder="John Smith"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">Email Address *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="bg-gray-700 border-gray-600 text-white pl-10 focus:border-orange-500"
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-white">Phone Number *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="bg-gray-700 border-gray-600 text-white pl-10 focus:border-orange-500"
                      placeholder="+44 7123 456789"
                      required
                    />
                  </div>
                </div>

                {/* Company */}
                <div className="space-y-2">
                  <Label htmlFor="company" className="text-white">Company (Optional)</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="company"
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({...formData, company: e.target.value})}
                      className="bg-gray-700 border-gray-600 text-white pl-10 focus:border-orange-500"
                      placeholder="Your Company Ltd"
                    />
                  </div>
                </div>
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white">Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="bg-gray-700 border-gray-600 text-white pl-10 pr-10 focus:border-orange-500"
                      placeholder="Create password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-orange-500"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-white">Confirm Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                      className="bg-gray-700 border-gray-600 text-white pl-10 pr-10 focus:border-orange-500"
                      placeholder="Confirm password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-orange-500"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Experience Level */}
              <div className="space-y-2">
                <Label htmlFor="experienceLevel" className="text-white">Experience Level *</Label>
                <Select value={formData.experienceLevel} onValueChange={(value) => setFormData({...formData, experienceLevel: value})}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white focus:border-orange-500">
                    <SelectValue placeholder="Select your experience level" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    {experienceLevels.map((level) => (
                      <SelectItem key={level.value} value={level.value} className="text-white hover:bg-gray-600">
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Network Description */}
              <div className="space-y-2">
                <Label htmlFor="networkDescription" className="text-white">Describe Your Network *</Label>
                <Textarea
                  id="networkDescription"
                  value={formData.networkDescription}
                  onChange={(e) => setFormData({...formData, networkDescription: e.target.value})}
                  className="bg-gray-700 border-gray-600 text-white focus:border-orange-500 min-h-[100px]"
                  placeholder="Tell us about your professional network, industry connections, and how you plan to refer clients..."
                  required
                />
              </div>

              {/* Expected Referrals */}
              <div className="space-y-2">
                <Label htmlFor="expectedReferrals" className="text-white">Expected Monthly Referrals *</Label>
                <Select value={formData.expectedReferrals} onValueChange={(value) => setFormData({...formData, expectedReferrals: value})}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white focus:border-orange-500">
                    <SelectValue placeholder="How many referrals do you expect to make per month?" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    <SelectItem value="1-2" className="text-white hover:bg-gray-600">1-2 referrals</SelectItem>
                    <SelectItem value="3-5" className="text-white hover:bg-gray-600">3-5 referrals</SelectItem>
                    <SelectItem value="6-10" className="text-white hover:bg-gray-600">6-10 referrals</SelectItem>
                    <SelectItem value="10+" className="text-white hover:bg-gray-600">10+ referrals</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Terms and Conditions */}
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onCheckedChange={(checked) => setFormData({...formData, agreeToTerms: checked as boolean})}
                    className="border-gray-600 data-[state=checked]:bg-orange-500 mt-1"
                  />
                  <Label htmlFor="agreeToTerms" className="text-sm text-gray-300 leading-relaxed">
                    I agree to the{' '}
                    <Link to="/terms" className="text-orange-500 hover:text-orange-400">Terms and Conditions</Link>
                    {' '}and{' '}
                    <Link to="/privacy" className="text-orange-500 hover:text-orange-400">Privacy Policy</Link>
                  </Label>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="agreeToMarketing"
                    checked={formData.agreeToMarketing}
                    onCheckedChange={(checked) => setFormData({...formData, agreeToMarketing: checked as boolean})}
                    className="border-gray-600 data-[state=checked]:bg-orange-500 mt-1"
                  />
                  <Label htmlFor="agreeToMarketing" className="text-sm text-gray-300 leading-relaxed">
                    I would like to receive marketing communications and partner updates via email
                  </Label>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 text-lg font-semibold 
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating Account...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Create Partner Account
                    <ArrowRight className="w-5 h-5" />
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Login Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-6"
        >
          <p className="text-gray-400">
            Already have an account?{' '}
            <Link 
              to="/auth/login" 
              className="text-orange-500 hover:text-orange-400 font-semibold transition-colors"
            >
              Sign in here
            </Link>
          </p>
        </motion.div>

        {/* Back to Landing */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-4"
        >
          <Link 
            to="/partnership" 
            className="text-sm text-gray-500 hover:text-gray-400 transition-colors"
          >
            ← Back to Partnership Program
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default PartnerRegister; 