import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Twitter, Linkedin, Instagram, Youtube, Mail, MapPin } from 'lucide-react';
import { useIsMobile } from '@/lib/hooks/ui/useMobile';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const isMobile = useIsMobile();
  
  return (
    <footer className="relative z-50 bg-siso-bg-alt border-t border-gray-800 py-12 md:py-16">
      <div className="container mx-auto px-4 flex flex-col items-center text-center">
        {/* Logo only - bigger and centered */}
        <div className="flex flex-col items-center space-y-3 md:space-y-4 mb-8 md:mb-10">
          <img 
            src="/lovable-uploads/c5921a2f-8856-42f4-bec5-2d08b81c5691.png" 
            alt="SISO Logo" 
            className={`${isMobile ? 'w-16 h-16' : 'w-20 h-20'}`}
          />
          <p className="text-sm sm:text-base text-siso-text-muted max-w-md px-4">
            Your one-stop AI knowledge source for agencies looking to scale with the latest technology
          </p>
        </div>

        {/* Newsletter signup */}
        <div className="mb-8 md:mb-10 w-full max-w-md space-y-3 md:space-y-4 px-4">
          <h3 className="text-lg sm:text-xl font-semibold text-siso-text-bold">Stay updated with our latest AI innovations</h3>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input 
              type="email" 
              placeholder="Enter your email" 
              className="bg-siso-bg-alt border-siso-border"
            />
            <Button 
              className="bg-gradient-to-r from-siso-red to-siso-orange hover:from-siso-red/90 hover:to-siso-orange/90 text-white"
            >
              Subscribe
            </Button>
          </div>
        </div>

        {/* Social media icons */}
        <div className="flex flex-wrap justify-center space-x-4 sm:space-x-6 mb-6 sm:mb-8">
          <a href="https://x.com/sisoofficial" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="text-siso-text-muted hover:text-siso-red transition-colors p-1.5 sm:p-2">
            <Twitter size={isMobile ? 20 : 24} />
          </a>
          <a href="https://www.linkedin.com/in/shaan-sisodia-a10ba0194/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-siso-text-muted hover:text-siso-red transition-colors p-1.5 sm:p-2">
            <Linkedin size={isMobile ? 20 : 24} />
          </a>
          <a href="https://www.instagram.com/siso.agency/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-siso-text-muted hover:text-siso-red transition-colors p-1.5 sm:p-2">
            <Instagram size={isMobile ? 20 : 24} />
          </a>
          <a href="https://www.youtube.com/@SISOAGENCY" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="text-siso-text-muted hover:text-siso-red transition-colors p-1.5 sm:p-2">
            <Youtube size={isMobile ? 20 : 24} />
          </a>
        </div>

        {/* Contact information */}
        <div className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-siso-text-muted">
            <Mail size={isMobile ? 16 : 18} />
            <span className="text-sm">siso@sisoinnovatorshub.io</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-siso-text-muted">
            <MapPin size={isMobile ? 16 : 18} />
            <span className="text-sm">London, UK</span>
          </div>
        </div>

        {/* Legal links */}
        <div className="flex space-x-4 sm:space-x-6 mb-4 sm:mb-6">
          <a href="/terms" className="text-xs sm:text-sm text-siso-text-muted hover:text-siso-orange transition-colors">
            Terms
          </a>
          <a href="/privacy-policy" className="text-xs sm:text-sm text-siso-text-muted hover:text-siso-orange transition-colors">
            Privacy
          </a>
        </div>

        {/* Copyright */}
        <div className="text-xs sm:text-sm text-siso-text-muted">
          ©{currentYear}. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
