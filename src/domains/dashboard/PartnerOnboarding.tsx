import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { 
  User, 
  Phone, 
  Building, 
  Network, 
  Target, 
  CheckCircle,
  ArrowRight,
  ArrowLeft 
} from 'lucide-react';
import { toast } from 'sonner';

interface PartnerOnboardingProps {
  onComplete: (data: PartnerOnboardingData) => void;
  onSkip?: () => void;
}

interface PartnerOnboardingData {
  fullName: string;
  phone: string;
  company: string;
  professionalBackground: string;
  networkDescription: string;
  expectedMonthlyReferrals: string;
}

export function PartnerOnboarding({ onComplete, onSkip }: PartnerOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<PartnerOnboardingData>({
    fullName: '',
    phone: '',
    company: '',
    professionalBackground: '',
    networkDescription: '',
    expectedMonthlyReferrals: ''
  });

  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

  const handleInputChange = (field: keyof PartnerOnboardingData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    // Validate required fields
    if (!formData.fullName || !formData.networkDescription) {
      toast.error('Please fill in all required fields');
      return;
    }

    onComplete(formData);
    toast.success('Partner profile completed! Welcome to the SISO Partner Program 🎉');
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.fullName.trim() !== '';
      case 2:
        return formData.networkDescription.trim() !== '';
      case 3:
        return formData.expectedMonthlyReferrals.trim() !== '';
      default:
        return true;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <User className="w-12 h-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Personal Information</h3>
              <p className="text-gray-400">Let's start with your basic details</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="fullName" className="text-white">Full Name *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white mt-2"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone" className="text-white">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white mt-2"
                  placeholder="+44 7700 900123"
                />
              </div>

              <div>
                <Label htmlFor="company" className="text-white">Company Name</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white mt-2"
                  placeholder="Your Company Ltd (optional)"
                />
              </div>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <Network className="w-12 h-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Your Network & Experience</h3>
              <p className="text-gray-400">Tell us about your professional background and connections</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="professionalBackground" className="text-white">Professional Background</Label>
                <Textarea
                  id="professionalBackground"
                  value={formData.professionalBackground}
                  onChange={(e) => handleInputChange('professionalBackground', e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white mt-2"
                  rows={3}
                  placeholder="Tell us about your professional background and sales experience..."
                />
              </div>

              <div>
                <Label htmlFor="networkDescription" className="text-white">Your Network *</Label>
                <Textarea
                  id="networkDescription"
                  value={formData.networkDescription}
                  onChange={(e) => handleInputChange('networkDescription', e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white mt-2"
                  rows={4}
                  placeholder="Describe your network and the types of businesses you have connections with..."
                  required
                />
              </div>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <Target className="w-12 h-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Goals & Expectations</h3>
              <p className="text-gray-400">Help us understand your partnership goals</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="expectedMonthlyReferrals" className="text-white">Expected Monthly Referrals *</Label>
                <Input
                  id="expectedMonthlyReferrals"
                  value={formData.expectedMonthlyReferrals}
                  onChange={(e) => handleInputChange('expectedMonthlyReferrals', e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white mt-2"
                  placeholder="e.g., 2-3 businesses per month"
                  required
                />
              </div>

              <div className="bg-gray-700/50 rounded-lg p-4 mt-6">
                <h4 className="text-white font-semibold mb-2">What happens next?</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Your application will be reviewed within 24 hours</li>
                  <li>• You'll receive welcome materials and resources</li>
                  <li>• We'll set up your partner tracking system</li>
                  <li>• You can start earning commissions immediately</li>
                </ul>
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-white">Complete Your Partner Profile</CardTitle>
          <p className="text-gray-400 mt-2">
            Step {currentStep} of {totalSteps}
          </p>
          <Progress value={progress} className="mt-4" />
        </CardHeader>

        <CardContent className="p-8">
          {renderStep()}

          <div className="flex justify-between mt-8">
            <Button
              onClick={handleBack}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
              disabled={currentStep === 1}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            <div className="flex gap-3">
              {onSkip && (
                <Button
                  onClick={onSkip}
                  variant="ghost"
                  className="text-gray-400 hover:text-gray-300"
                >
                  Skip for now
                </Button>
              )}

              <Button
                onClick={handleNext}
                className="bg-orange-500 hover:bg-orange-600 text-white"
                disabled={!isStepValid()}
              >
                {currentStep === totalSteps ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Complete Profile
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 