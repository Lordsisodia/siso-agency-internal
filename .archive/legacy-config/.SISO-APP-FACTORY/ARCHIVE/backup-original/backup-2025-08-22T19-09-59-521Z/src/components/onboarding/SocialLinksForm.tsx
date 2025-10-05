
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { GradientText } from '@/components/ui/gradient-text';
import { Linkedin, Globe, Twitter, Phone } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SocialLinksFormProps {
  userId: string | null;
}

export const SocialLinksForm = ({ userId }: SocialLinksFormProps) => {
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [twitterUrl, setTwitterUrl] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationStates, setValidationStates] = useState({
    linkedin: true,
    website: true,
    twitter: true,
    whatsapp: true
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  const validateUrl = (url: string, type: 'linkedin' | 'website' | 'twitter') => {
    if (!url) return true; // Empty URLs are valid (optional fields)
    
    const urlPattern = /^https?:\/\/.+\..+/;
    let isValid = urlPattern.test(url);
    
    if (type === 'linkedin') {
      isValid = isValid && url.includes('linkedin.com');
    } else if (type === 'twitter') {
      isValid = isValid && (url.includes('twitter.com') || url.includes('x.com'));
    }
    
    setValidationStates(prev => ({
      ...prev,
      [type]: isValid
    }));
    
    return isValid;
  };
  
  const validateWhatsapp = (number: string) => {
    if (!number) return false; // WhatsApp is required
    
    const isValid = /^[+]?[\d\s()-]{8,20}$/.test(number);
    
    setValidationStates(prev => ({
      ...prev,
      whatsapp: isValid
    }));
    
    return isValid;
  };

  const getFilledLinksCount = () => {
    let count = [linkedinUrl, websiteUrl, twitterUrl]
      .filter(url => url.trim().length > 0).length;
    
    if (whatsappNumber.trim().length > 0) count++;
    
    return count;
  };

  const handleSubmit = async () => {
    // Validate all fields
    const isLinkedinValid = validateUrl(linkedinUrl, 'linkedin');
    const isWebsiteValid = validateUrl(websiteUrl, 'website');
    const isTwitterValid = validateUrl(twitterUrl, 'twitter');
    const isWhatsappValid = validateWhatsapp(whatsappNumber);

    if (!isLinkedinValid || !isWebsiteValid || !isTwitterValid) {
      toast({
        variant: "destructive",
        title: "Invalid URLs",
        description: "Please check your social media links",
      });
      return;
    }
    
    if (!isWhatsappValid) {
      toast({
        variant: "destructive",
        title: "WhatsApp Number Required",
        description: "Please enter a valid WhatsApp number with country code",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      if (userId) {
        const { error } = await supabase
          .from('profiles')
          .update({
            linkedin_url: linkedinUrl,
            website_url: websiteUrl,
            twitter_url: twitterUrl,
            whatsapp_number: whatsappNumber,
            has_completed_social_info: true,
            social_info_completed_at: new Date().toISOString()
          })
          .eq('id', userId);

        if (error) throw error;
      } else {
        // For guest users, create an onboarding entry
        const { error } = await supabase
          .from('onboarding')
          .insert([
            { 
              linkedin_url: linkedinUrl,
              website_url: websiteUrl,
              twitter_url: twitterUrl,
              whatsapp_number: whatsappNumber,
              app_idea: 'OnlyFans Management Platform',
              status: 'pending_account'
            }
          ]);
          
        if (error) throw error;
      }

      toast({
        title: "Information saved!",
        description: "Moving to the next step...",
      });

      navigate('/thank-you-plan');
    } catch (error: any) {
      console.error('Error saving information:', error);
      toast({
        variant: "destructive",
        title: "Error saving information",
        description: error.message || "Please try again",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const SocialInput = ({ 
    icon: Icon, 
    placeholder, 
    value, 
    onChange, 
    tooltip, 
    type,
    isValid,
    required = false
  }: { 
    icon: any, 
    placeholder: string, 
    value: string, 
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    tooltip: string,
    type: 'linkedin' | 'website' | 'twitter' | 'whatsapp',
    isValid: boolean,
    required?: boolean
  }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-siso-text/70">
              <Icon className="w-5 h-5" />
            </div>
            <Input
              type={type === 'whatsapp' ? 'tel' : 'url'}
              placeholder={placeholder}
              value={value}
              onChange={(e) => {
                onChange(e);
                if (type === 'whatsapp') {
                  validateWhatsapp(e.target.value);
                } else {
                  validateUrl(e.target.value, type as any);
                }
              }}
              className={`pl-11 w-full bg-white/5 border-siso-border text-siso-text transition-colors duration-300
                ${!isValid ? 'border-red-500' : 'hover:border-siso-border-hover focus:border-siso-red'}`}
              required={required}
            />
            {required && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 text-xs">*</span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <GradientText className="text-2xl font-bold">
          Almost There! Connect With Us
        </GradientText>
        <p className="text-siso-text">
          Share your contact information so we can update you on your MVP progress
        </p>
      </div>

      <div className="space-y-4">
        <SocialInput
          icon={Phone}
          placeholder="WhatsApp Number (with country code)"
          value={whatsappNumber}
          onChange={(e) => setWhatsappNumber(e.target.value)}
          tooltip="We'll update you on your MVP progress via WhatsApp"
          type="whatsapp"
          isValid={validationStates.whatsapp}
          required={true}
        />
        
        <div className="pt-2 pb-1">
          <h3 className="text-white text-sm font-medium mb-2">Social Profiles (Optional)</h3>
        </div>
        
        <SocialInput
          icon={Linkedin}
          placeholder="LinkedIn Profile URL"
          value={linkedinUrl}
          onChange={(e) => setLinkedinUrl(e.target.value)}
          tooltip="Connect with other professionals and showcase your expertise"
          type="linkedin"
          isValid={validationStates.linkedin}
        />
        <SocialInput
          icon={Globe}
          placeholder="Website URL"
          value={websiteUrl}
          onChange={(e) => setWebsiteUrl(e.target.value)}
          tooltip="Share your personal or business website"
          type="website"
          isValid={validationStates.website}
        />
        <SocialInput
          icon={Twitter}
          placeholder="Twitter Profile URL"
          value={twitterUrl}
          onChange={(e) => setTwitterUrl(e.target.value)}
          tooltip="Join the conversation and stay updated with the latest trends"
          type="twitter"
          isValid={validationStates.twitter}
        />
      </div>

      <div className="flex justify-between items-center">
        <span className="text-sm text-siso-text">
          {getFilledLinksCount()} of 4 fields completed
        </span>
        <div className="space-x-4">
          <Button
            variant="outline"
            onClick={() => navigate('/thank-you-plan')}
            className="bg-white/10 text-white hover:bg-white/20"
          >
            Skip
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !validateWhatsapp(whatsappNumber)}
            className="bg-gradient-to-r from-siso-red to-siso-orange hover:opacity-90"
          >
            {isSubmitting ? 'Saving...' : 'Continue'}
          </Button>
        </div>
      </div>
    </div>
  );
};
