import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Building, Users, MapPin, Calendar, DollarSign, Award } from 'lucide-react';

interface CompanyIntelligenceData {
  companyName: string;
  legalStructure: string;
  registrationLocation: string;
  yearsInOperation: string;
  companySize: string;
  fundingStatus: string;
  industryCategory: string;
  leadershipTeam: string;
  previousVentures: string;
  businessRegistrationNumber?: string;
  website?: string;
  socialMediaPresence?: string;
}

interface Props {
  onComplete: (data: CompanyIntelligenceData) => void;
}

const CompanyIntelligenceForm = ({ onComplete }: Props) => {
  const [formData, setFormData] = useState<CompanyIntelligenceData>({
    companyName: '',
    legalStructure: '',
    registrationLocation: '',
    yearsInOperation: '',
    companySize: '',
    fundingStatus: '',
    industryCategory: '',
    leadershipTeam: '',
    previousVentures: '',
    businessRegistrationNumber: '',
    website: '',
    socialMediaPresence: ''
  });

  const [currentSection, setCurrentSection] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const sections = [
    {
      title: "🏢 Basic Company Information",
      icon: <Building className="w-5 h-5" />,
      fields: ['companyName', 'legalStructure', 'registrationLocation', 'businessRegistrationNumber']
    },
    {
      title: "📊 Company Profile & Scale",
      icon: <Users className="w-5 h-5" />,
      fields: ['yearsInOperation', 'companySize', 'fundingStatus', 'industryCategory']
    },
    {
      title: "👥 Leadership & Experience",
      icon: <Award className="w-5 h-5" />,
      fields: ['leadershipTeam', 'previousVentures']
    },
    {
      title: "🌐 Online Presence",
      icon: <MapPin className="w-5 h-5" />,
      fields: ['website', 'socialMediaPresence']
    }
  ];

  const handleInputChange = (field: keyof CompanyIntelligenceData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(prev => prev + 1);
    } else {
      setIsComplete(true);
      onComplete(formData);
    }
  };

  const handleBack = () => {
    if (currentSection > 0) {
      setCurrentSection(prev => prev - 1);
    }
  };

  const isCurrentSectionValid = () => {
    const requiredFields = sections[currentSection].fields.filter(field => 
      !['businessRegistrationNumber', 'website', 'socialMediaPresence', 'previousVentures'].includes(field)
    );
    return requiredFields.every(field => formData[field as keyof CompanyIntelligenceData]?.trim());
  };

  const progress = ((currentSection + 1) / sections.length) * 100;

  if (isComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 bg-green-500/10 border border-green-500/30 rounded-lg"
      >
        <div className="flex items-center gap-2 text-green-400 mb-2">
          <Building className="h-5 w-5" />
          <span className="font-semibold">Company Intelligence Complete!</span>
        </div>
        <p className="text-sm text-gray-300">
          Comprehensive company profile captured. Moving to business analysis phase...
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 p-6 bg-gray-900/50 border border-gray-700/50 rounded-xl"
    >
      {/* Progress indicator */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-300">Company Intelligence Progress</span>
          <span className="text-blue-400 font-medium">{Math.round(progress)}%</span>
        </div>
        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
          />
        </div>
      </div>

      {/* Current section */}
      <motion.div
        key={currentSection}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-3 text-white">
          {sections[currentSection].icon}
          <h3 className="text-lg font-semibold">{sections[currentSection].title}</h3>
        </div>

        <div className="grid gap-4">
          {sections[currentSection].fields.map((field) => {
            switch (field) {
              case 'companyName':
                return (
                  <div key={field}>
                    <label className="text-sm text-gray-300 mb-2 block">Company Name *</label>
                    <Input
                      placeholder="Enter your company name"
                      value={formData.companyName}
                      onChange={(e) => handleInputChange('companyName', e.target.value)}
                      className="bg-black/30 border-gray-600 text-white"
                    />
                  </div>
                );

              case 'legalStructure':
                return (
                  <div key={field}>
                    <label className="text-sm text-gray-300 mb-2 block">Legal Structure *</label>
                    <Select value={formData.legalStructure} onValueChange={(value) => handleInputChange('legalStructure', value)}>
                      <SelectTrigger className="bg-black/30 border-gray-600 text-white">
                        <SelectValue placeholder="Select legal structure" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sole-proprietorship">Sole Proprietorship</SelectItem>
                        <SelectItem value="partnership">Partnership</SelectItem>
                        <SelectItem value="limited-company">Limited Company</SelectItem>
                        <SelectItem value="plc">Public Limited Company (PLC)</SelectItem>
                        <SelectItem value="llp">Limited Liability Partnership (LLP)</SelectItem>
                        <SelectItem value="cic">Community Interest Company (CIC)</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                );

              case 'registrationLocation':
                return (
                  <div key={field}>
                    <label className="text-sm text-gray-300 mb-2 block">Registration Location *</label>
                    <Input
                      placeholder="e.g., England & Wales, Scotland, Northern Ireland"
                      value={formData.registrationLocation}
                      onChange={(e) => handleInputChange('registrationLocation', e.target.value)}
                      className="bg-black/30 border-gray-600 text-white"
                    />
                  </div>
                );

              case 'businessRegistrationNumber':
                return (
                  <div key={field}>
                    <label className="text-sm text-gray-300 mb-2 block">Company Registration Number</label>
                    <Input
                      placeholder="Companies House number (optional)"
                      value={formData.businessRegistrationNumber}
                      onChange={(e) => handleInputChange('businessRegistrationNumber', e.target.value)}
                      className="bg-black/30 border-gray-600 text-white"
                    />
                  </div>
                );

              case 'yearsInOperation':
                return (
                  <div key={field}>
                    <label className="text-sm text-gray-300 mb-2 block">Years in Operation *</label>
                    <Select value={formData.yearsInOperation} onValueChange={(value) => handleInputChange('yearsInOperation', value)}>
                      <SelectTrigger className="bg-black/30 border-gray-600 text-white">
                        <SelectValue placeholder="Select years in operation" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="startup">Startup (Less than 1 year)</SelectItem>
                        <SelectItem value="1-2">1-2 years</SelectItem>
                        <SelectItem value="3-5">3-5 years</SelectItem>
                        <SelectItem value="6-10">6-10 years</SelectItem>
                        <SelectItem value="11-20">11-20 years</SelectItem>
                        <SelectItem value="20+">20+ years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                );

              case 'companySize':
                return (
                  <div key={field}>
                    <label className="text-sm text-gray-300 mb-2 block">Company Size *</label>
                    <Select value={formData.companySize} onValueChange={(value) => handleInputChange('companySize', value)}>
                      <SelectTrigger className="bg-black/30 border-gray-600 text-white">
                        <SelectValue placeholder="Select company size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="solopreneur">Solo Founder</SelectItem>
                        <SelectItem value="micro">Micro (1-9 employees)</SelectItem>
                        <SelectItem value="small">Small (10-49 employees)</SelectItem>
                        <SelectItem value="medium">Medium (50-249 employees)</SelectItem>
                        <SelectItem value="large">Large (250+ employees)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                );

              case 'fundingStatus':
                return (
                  <div key={field}>
                    <label className="text-sm text-gray-300 mb-2 block">Funding Status *</label>
                    <Select value={formData.fundingStatus} onValueChange={(value) => handleInputChange('fundingStatus', value)}>
                      <SelectTrigger className="bg-black/30 border-gray-600 text-white">
                        <SelectValue placeholder="Select funding status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bootstrapped">Bootstrapped/Self-funded</SelectItem>
                        <SelectItem value="friends-family">Friends & Family Round</SelectItem>
                        <SelectItem value="angel">Angel Investors</SelectItem>
                        <SelectItem value="seed">Seed Funding</SelectItem>
                        <SelectItem value="series-a">Series A+</SelectItem>
                        <SelectItem value="government">Government Grants</SelectItem>
                        <SelectItem value="revenue">Revenue Generating</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                );

              case 'industryCategory':
                return (
                  <div key={field}>
                    <label className="text-sm text-gray-300 mb-2 block">Industry Category *</label>
                    <Select value={formData.industryCategory} onValueChange={(value) => handleInputChange('industryCategory', value)}>
                      <SelectTrigger className="bg-black/30 border-gray-600 text-white">
                        <SelectValue placeholder="Select industry category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technology">Technology & Software</SelectItem>
                        <SelectItem value="fintech">Fintech & Finance</SelectItem>
                        <SelectItem value="healthcare">Healthcare & Medical</SelectItem>
                        <SelectItem value="ecommerce">E-commerce & Retail</SelectItem>
                        <SelectItem value="education">Education & EdTech</SelectItem>
                        <SelectItem value="real-estate">Real Estate & PropTech</SelectItem>
                        <SelectItem value="food-beverage">Food & Beverage</SelectItem>
                        <SelectItem value="travel">Travel & Hospitality</SelectItem>
                        <SelectItem value="media">Media & Entertainment</SelectItem>
                        <SelectItem value="automotive">Automotive & Transport</SelectItem>
                        <SelectItem value="energy">Energy & Sustainability</SelectItem>
                        <SelectItem value="manufacturing">Manufacturing & Industrial</SelectItem>
                        <SelectItem value="professional-services">Professional Services</SelectItem>
                        <SelectItem value="non-profit">Non-profit & Social Impact</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                );

              case 'leadershipTeam':
                return (
                  <div key={field}>
                    <label className="text-sm text-gray-300 mb-2 block">Leadership Team *</label>
                    <Textarea
                      placeholder="Brief overview of key team members, their roles, and relevant experience..."
                      value={formData.leadershipTeam}
                      onChange={(e) => handleInputChange('leadershipTeam', e.target.value)}
                      className="bg-black/30 border-gray-600 text-white min-h-[100px]"
                    />
                  </div>
                );

              case 'previousVentures':
                return (
                  <div key={field}>
                    <label className="text-sm text-gray-300 mb-2 block">Previous Ventures & Track Record</label>
                    <Textarea
                      placeholder="Any previous successful ventures, exits, or relevant experience (optional)..."
                      value={formData.previousVentures}
                      onChange={(e) => handleInputChange('previousVentures', e.target.value)}
                      className="bg-black/30 border-gray-600 text-white min-h-[80px]"
                    />
                  </div>
                );

              case 'website':
                return (
                  <div key={field}>
                    <label className="text-sm text-gray-300 mb-2 block">Company Website</label>
                    <Input
                      placeholder="https://yourcompany.com (optional)"
                      value={formData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      className="bg-black/30 border-gray-600 text-white"
                    />
                  </div>
                );

              case 'socialMediaPresence':
                return (
                  <div key={field}>
                    <label className="text-sm text-gray-300 mb-2 block">Social Media Presence</label>
                    <Textarea
                      placeholder="LinkedIn, Twitter, Instagram handles or URLs (optional)..."
                      value={formData.socialMediaPresence}
                      onChange={(e) => handleInputChange('socialMediaPresence', e.target.value)}
                      className="bg-black/30 border-gray-600 text-white min-h-[60px]"
                    />
                  </div>
                );

              default:
                return null;
            }
          })}
        </div>
      </motion.div>

      {/* Navigation buttons */}
      <div className="flex justify-between pt-4">
        <Button
          onClick={handleBack}
          disabled={currentSection === 0}
          variant="outline"
          className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800"
        >
          Back
        </Button>

        <Button
          onClick={handleNext}
          disabled={!isCurrentSectionValid()}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
        >
          {currentSection === sections.length - 1 ? 'Complete Company Intelligence' : 'Next Section'}
        </Button>
      </div>

      {/* Section indicators */}
      <div className="flex justify-center gap-2 pt-2">
        {sections.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-200 ${
              index === currentSection
                ? 'bg-blue-500 w-6'
                : index < currentSection
                ? 'bg-green-500'
                : 'bg-gray-600'
            }`}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default CompanyIntelligenceForm;