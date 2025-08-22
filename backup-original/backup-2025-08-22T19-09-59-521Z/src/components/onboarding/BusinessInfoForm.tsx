import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, ArrowRight, InfoIcon } from 'lucide-react';
import { AppPlanInput } from '@/types/appPlan.types';
import { saveBusinessOnboardingData } from '@/utils/clientData';

interface BusinessInfoFormProps {
  onComplete: (data: AppPlanInput) => void;
  initialData?: Partial<AppPlanInput>;
}

export const BusinessInfoForm: React.FC<BusinessInfoFormProps> = ({ onComplete, initialData = {} }) => {
  const [formData, setFormData] = useState<Partial<AppPlanInput>>({
    businessName: initialData.businessName || '',
    appPurpose: initialData.appPurpose || '',
    industry: initialData.industry || '',
    targetAudience: initialData.targetAudience || '',
    communicationPreference: initialData.communicationPreference || 'email',
    budget: initialData.budget || '',
    timeline: initialData.timeline || '',
    moreInfo: initialData.moreInfo || '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (field: keyof AppPlanInput, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    
    // Save to localStorage/context
    saveBusinessOnboardingData(formData as AppPlanInput);
    
    // Call the onComplete callback
    onComplete(formData as AppPlanInput);
  };

  const isFormValid = (): boolean => {
    return !!(
      formData.businessName &&
      formData.appPurpose &&
      formData.industry &&
      formData.targetAudience
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {!submitted ? (
        <form onSubmit={handleSubmit} className="space-y-6 bg-gray-900 p-6 rounded-lg border border-gray-700">
          <div className="flex items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Business Information</h2>
            <div className="ml-auto bg-gray-800 text-xs text-white px-3 py-1 rounded-full">
              Step 1 of 3
            </div>
          </div>
          
          <div className="mb-8 p-4 bg-gray-800 border border-gray-700 rounded-md">
            <div className="flex items-start">
              <InfoIcon className="h-5 w-5 text-orange-500 mr-2 mt-0.5" />
              <div>
                <h3 className="text-white font-medium">Enhanced App Plan Generation</h3>
                <p className="text-gray-300 text-sm">
                  Your business information will be used to perform industry research before generating your app plan. This multi-stage process analyzes market trends, competitors, and user behaviors to create a more tailored and effective plan.
                </p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="businessName" className="text-white">Business Name <span className="text-red-500">*</span></Label>
              <Input
                id="businessName"
                value={formData.businessName}
                onChange={(e) => handleChange('businessName', e.target.value)}
                placeholder="Enter your business name"
                className="bg-gray-800 border-gray-700 text-white"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry" className="text-white">Industry <span className="text-red-500">*</span></Label>
              <Select
                value={formData.industry}
                onValueChange={(value) => handleChange('industry', value)}
              >
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Select your industry" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                  <SelectItem value="E-commerce / Retail">E-commerce / Retail</SelectItem>
                  <SelectItem value="Healthcare / Fitness">Healthcare / Fitness</SelectItem>
                  <SelectItem value="Education / E-Learning">Education / E-Learning</SelectItem>
                  <SelectItem value="Finance / Banking">Finance / Banking</SelectItem>
                  <SelectItem value="Entertainment / Media">Entertainment / Media</SelectItem>
                  <SelectItem value="Travel / Hospitality">Travel / Hospitality</SelectItem>
                  <SelectItem value="Real Estate / Property">Real Estate / Property</SelectItem>
                  <SelectItem value="Food / Restaurant">Food / Restaurant</SelectItem>
                  <SelectItem value="Social Networking">Social Networking</SelectItem>
                  <SelectItem value="Technology / SaaS">Technology / SaaS</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="appPurpose" className="text-white">App Purpose <span className="text-red-500">*</span></Label>
              <Textarea
                id="appPurpose"
                value={formData.appPurpose}
                onChange={(e) => handleChange('appPurpose', e.target.value)}
                placeholder="Describe what your app will do"
                className="bg-gray-800 border-gray-700 text-white min-h-[80px]"
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="targetAudience" className="text-white">Target Audience <span className="text-red-500">*</span></Label>
              <Textarea
                id="targetAudience"
                value={formData.targetAudience}
                onChange={(e) => handleChange('targetAudience', e.target.value)}
                placeholder="Describe your target users"
                className="bg-gray-800 border-gray-700 text-white min-h-[80px]"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget" className="text-white">Budget (Optional)</Label>
              <Input
                id="budget"
                value={formData.budget}
                onChange={(e) => handleChange('budget', e.target.value)}
                placeholder="e.g. £5,000 - £10,000"
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeline" className="text-white">Timeline (Optional)</Label>
              <Input
                id="timeline"
                value={formData.timeline}
                onChange={(e) => handleChange('timeline', e.target.value)}
                placeholder="e.g. 3-6 months"
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="moreInfo" className="text-white">Additional Information (Optional)</Label>
              <Textarea
                id="moreInfo"
                value={formData.moreInfo}
                onChange={(e) => handleChange('moreInfo', e.target.value)}
                placeholder="Any other details that might be helpful"
                className="bg-gray-800 border-gray-700 text-white min-h-[80px]"
              />
            </div>
          </div>

          <div className="pt-2">
            <Button 
              type="submit" 
              disabled={!isFormValid()}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white"
            >
              Continue <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      ) : (
        <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 text-center">
          <div className="flex flex-col items-center justify-center space-y-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
            <h2 className="text-2xl font-bold text-white">Information Received</h2>
            <p className="text-gray-300">
              We're analyzing your industry and preparing your app plan. This comprehensive research process will help us deliver a tailored solution for <span className="font-semibold text-white">{formData.businessName}</span>.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}; 