import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Building2, 
  Target, 
  Users, 
  Briefcase, 
  Clock, 
  DollarSign,
  Zap,
  ListChecks,
  ArrowRight,
  RefreshCw,
  Globe,
  Smartphone,
  ShoppingBag,
  BookOpen,
  CalendarDays
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';

export interface BusinessDataInput {
  businessName: string;
  appPurpose: string;
  industry: string;
  targetAudience: string;
  desiredFeatures?: string;
  budget?: string;
  timeline?: string;
  additionalRequirements?: string;
}

interface BusinessDataFormProps {
  onSubmit: (data: BusinessDataInput) => void;
  isSubmitting?: boolean;
  initialData?: Partial<BusinessDataInput>;
}

export function BusinessDataForm({ onSubmit, isSubmitting = false, initialData = {} }: BusinessDataFormProps) {
  const [businessData, setBusinessData] = useState<BusinessDataInput>({
    businessName: initialData.businessName || '',
    appPurpose: initialData.appPurpose || '',
    industry: initialData.industry || '',
    targetAudience: initialData.targetAudience || '',
    desiredFeatures: initialData.desiredFeatures || '',
    budget: initialData.budget || '',
    timeline: initialData.timeline || '',
    additionalRequirements: initialData.additionalRequirements || ''
  });
  
  const [step, setStep] = useState(1);
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);

  // Sample templates for quick input with strong feature focus
  const templates = {
    ecommerce: {
      businessName: 'StyleHub',
      appPurpose: 'A mobile-first e-commerce platform for sustainable fashion and lifestyle products',
      industry: 'Retail & E-commerce',
      targetAudience: 'Environmentally conscious consumers aged 25-45 who shop primarily on mobile',
      desiredFeatures: 'Product filtering by sustainability criteria, AR try-on for clothing items, carbon footprint tracking for purchases, loyalty program with sustainability rewards, social sharing of outfits',
      budget: '£25,000 - £50,000',
      timeline: '3-5 months'
    },
    fitness: {
      businessName: 'FitJourney',
      appPurpose: 'A comprehensive fitness app that creates personalized workout and nutrition plans',
      industry: 'Health & Fitness',
      targetAudience: 'Fitness enthusiasts of all levels looking for guided workout experiences',
      desiredFeatures: 'Workout plan generator, progress tracking with visual charts, meal planning with grocery lists, exercise video demonstrations, workout sharing with friends, integration with fitness wearables',
      budget: '£20,000 - £40,000',
      timeline: '2-4 months'
    },
    education: {
      businessName: 'SkillMaster',
      appPurpose: 'An interactive learning platform for professional skills development with a focus on tech',
      industry: 'Education & Learning',
      targetAudience: 'Young professionals and career-changers looking to upskill in technology fields',
      desiredFeatures: 'Interactive coding exercises, skill assessment quizzes, personalized learning paths, progress certificates, mentor matching, community forums for peer learning',
      budget: '£30,000 - £60,000',
      timeline: '3-6 months'
    },
    productivity: {
      businessName: 'TaskFlow',
      appPurpose: 'A project management tool for small to medium businesses with AI-powered insights',
      industry: 'Software & Productivity',
      targetAudience: 'Small business owners and team managers needing better project coordination',
      desiredFeatures: 'Task assignment and tracking, real-time collaboration, document sharing, automated reporting, meeting scheduling, time tracking, AI-powered project timeline predictions',
      budget: '£40,000 - £80,000',
      timeline: '4-6 months'
    }
  };

  // Industry options
  const industries = [
    'Retail & E-commerce',
    'Health & Fitness',
    'Finance & Banking',
    'Education & Learning',
    'Food & Beverage',
    'Travel & Hospitality',
    'Real Estate & Property',
    'Software & Technology',
    'Media & Entertainment',
    'Professional Services',
    'Manufacturing',
    'Healthcare',
    'Non-profit & Charity'
  ];

  // Timeline options
  const timelineOptions = [
    '1-2 months',
    '3-4 months',
    '5-6 months',
    '6-12 months',
    'Over 12 months',
    'Flexible'
  ];

  // Budget ranges
  const budgetRanges = [
    'Under £10,000',
    '£10,000 - £25,000',
    '£25,000 - £50,000',
    '£50,000 - £100,000',
    '£100,000+',
    'Flexible'
  ];

  const handleTemplateSelect = (templateKey: keyof typeof templates) => {
    setBusinessData(templates[templateKey]);
    setActiveTemplate(templateKey);
  };

  const handleChange = (
    field: keyof BusinessDataInput,
    value: string
  ) => {
    setBusinessData((prev) => ({
      ...prev,
      [field]: value
    }));
    
    if (activeTemplate) {
      setActiveTemplate(null);
    }
  };

  const handleSubmit = () => {
    onSubmit(businessData);
  };

  const nextStep = () => {
    setStep(2);
  };

  const prevStep = () => {
    setStep(1);
  };

  const isStep1Valid = 
    businessData.businessName.trim() !== '' && 
    businessData.appPurpose.trim() !== '' && 
    businessData.industry.trim() !== '';

  const isStep2Valid = 
    businessData.targetAudience.trim() !== '';

  return (
    <Card className="bg-gray-800 border border-gray-700">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-white flex items-center gap-3">
          <Building2 className="h-5 w-5 text-orange-500" />
          Business Requirements
        </CardTitle>
        <CardDescription className="text-gray-300">
          Tell us about your business to generate a feature list tailored to your needs
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          {/* Quick Templates */}
          <div>
            <Label className="text-gray-300 block mb-2">Quick Start Templates</Label>
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleTemplateSelect('ecommerce')}
                className={`border-gray-600 ${activeTemplate === 'ecommerce' ? 'bg-orange-500/20 border-orange-500/50 text-orange-300' : 'bg-gray-700 text-gray-300'}`}
              >
                <ShoppingBag className="h-3.5 w-3.5 mr-1" />
                E-commerce
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleTemplateSelect('fitness')}
                className={`border-gray-600 ${activeTemplate === 'fitness' ? 'bg-orange-500/20 border-orange-500/50 text-orange-300' : 'bg-gray-700 text-gray-300'}`}
              >
                <Zap className="h-3.5 w-3.5 mr-1" />
                Fitness
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleTemplateSelect('education')}
                className={`border-gray-600 ${activeTemplate === 'education' ? 'bg-orange-500/20 border-orange-500/50 text-orange-300' : 'bg-gray-700 text-gray-300'}`}
              >
                <BookOpen className="h-3.5 w-3.5 mr-1" />
                Education
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleTemplateSelect('productivity')}
                className={`border-gray-600 ${activeTemplate === 'productivity' ? 'bg-orange-500/20 border-orange-500/50 text-orange-300' : 'bg-gray-700 text-gray-300'}`}
              >
                <CalendarDays className="h-3.5 w-3.5 mr-1" />
                Productivity
              </Button>
            </div>
          </div>
          
          <Separator className="bg-gray-700" />
          
          {/* Multi-step Form */}
          <div>
            {/* Progress Indicator */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center font-medium ${step === 1 ? 'bg-orange-500 text-white' : 'bg-gray-700 text-gray-300'}`}>
                  1
                </div>
                <div className="h-0.5 w-6 bg-gray-700"></div>
                <div className={`h-8 w-8 rounded-full flex items-center justify-center font-medium ${step === 2 ? 'bg-orange-500 text-white' : 'bg-gray-700 text-gray-300'}`}>
                  2
                </div>
              </div>
              <p className="text-sm text-gray-400">Step {step} of 2</p>
            </div>
            
            {/* Step 1 - Basic Information */}
            {step === 1 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="businessName" className="text-gray-300">
                    Business Name <span className="text-orange-500">*</span>
                  </Label>
                  <Input
                    id="businessName"
                    value={businessData.businessName}
                    onChange={(e) => handleChange('businessName', e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white mt-1"
                    placeholder="e.g. TechSolutions Ltd"
                  />
                </div>
                
                <div>
                  <Label htmlFor="appPurpose" className="text-gray-300">
                    App Purpose <span className="text-orange-500">*</span>
                  </Label>
                  <Textarea
                    id="appPurpose"
                    value={businessData.appPurpose}
                    onChange={(e) => handleChange('appPurpose', e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white mt-1"
                    placeholder="Describe what your app will do and the main problems it solves..."
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="industry" className="text-gray-300">
                    Industry <span className="text-orange-500">*</span>
                  </Label>
                  <Select
                    value={businessData.industry}
                    onValueChange={(value) => handleChange('industry', value)}
                  >
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white mt-1">
                      <SelectValue placeholder="Select your industry" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700 text-white">
                      {industries.map((industry) => (
                        <SelectItem key={industry} value={industry}>
                          {industry}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end mt-6">
                  <Button 
                    onClick={nextStep} 
                    disabled={!isStep1Valid}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            )}
            
            {/* Step 2 - Feature-focused Information */}
            {step === 2 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="targetAudience" className="text-gray-300">
                    Target Audience <span className="text-orange-500">*</span>
                  </Label>
                  <Textarea
                    id="targetAudience"
                    value={businessData.targetAudience}
                    onChange={(e) => handleChange('targetAudience', e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white mt-1"
                    placeholder="Describe who will use your app and their key characteristics..."
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="desiredFeatures" className="text-gray-300 flex items-center gap-2">
                    Desired Features
                    <Badge variant="outline" className="bg-orange-500/10 text-orange-300 border-orange-500/30 font-normal">
                      Recommended
                    </Badge>
                  </Label>
                  <Textarea
                    id="desiredFeatures"
                    value={businessData.desiredFeatures}
                    onChange={(e) => handleChange('desiredFeatures', e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white mt-1"
                    placeholder="List specific features you'd like in your app (separated by commas)..."
                    rows={3}
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    The more specific you are about desired features, the better our AI can understand your needs.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="timeline" className="text-gray-300">
                      Timeline
                    </Label>
                    <Select
                      value={businessData.timeline}
                      onValueChange={(value) => handleChange('timeline', value)}
                    >
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white mt-1">
                        <SelectValue placeholder="Expected timeline" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700 text-white">
                        {timelineOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="budget" className="text-gray-300">
                      Budget
                    </Label>
                    <Select
                      value={businessData.budget}
                      onValueChange={(value) => handleChange('budget', value)}
                    >
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white mt-1">
                        <SelectValue placeholder="Budget range" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700 text-white">
                        {budgetRanges.map((range) => (
                          <SelectItem key={range} value={range}>
                            {range}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="additionalRequirements" className="text-gray-300">
                    Additional Requirements
                  </Label>
                  <Textarea
                    id="additionalRequirements"
                    value={businessData.additionalRequirements}
                    onChange={(e) => handleChange('additionalRequirements', e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white mt-1"
                    placeholder="Any specific technical requirements, integrations, or constraints..."
                    rows={2}
                  />
                </div>

                <div className="flex justify-between mt-6">
                  <Button 
                    variant="outline" 
                    onClick={prevStep} 
                    className="border-gray-600 text-gray-300"
                  >
                    Back
                  </Button>
                  
                  <Button 
                    onClick={handleSubmit} 
                    disabled={isSubmitting || !isStep2Valid}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Zap className="mr-2 h-4 w-4" />
                        Generate Features
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 