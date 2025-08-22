import { memo, useState, useEffect } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Waves } from '@/components/ui/waves-background';
import { AgencyPartnershipHeader } from '@/components/ui/agency-partnership-header';
import { Stats } from '@/components/ui/stats-section-with-text';
import { PartnershipNavigation } from '@/components/partnership/PartnershipNavigation';
import { PartnershipPortfolio } from '@/components/partnership/PartnershipPortfolio';
import { PartnershipBenefits } from '@/components/partnership/PartnershipBenefits';
import { PartnershipProcess } from '@/components/partnership/PartnershipProcess';
import { PartnershipAIChat } from '@/components/partnership/PartnershipAIChat';
import { PartnershipTraining } from '@/components/partnership/PartnershipTraining';
import Footer from '@/components/Footer';
import { PartnerRequirements } from '@/components/partnership/PartnerRequirements';

const PartnershipPage = memo(() => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('hero');

  // Scroll progress tracking
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const handleApplyNow = async () => {
    try {
      // Check if user is already authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // User is already logged in, redirect to partner dashboard
        navigate('/partner/dashboard');
      } else {
        // User is not logged in, redirect to partner login page
        navigate('/auth/login', { 
          state: { 
            userType: 'partner',
            returnTo: '/partner/dashboard',
            source: 'partnership-landing-apply-now'
          }
        });
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      // Fallback to login page if there's an error
      navigate('/auth/login', { 
        state: { 
          userType: 'partner',
          returnTo: '/partner/dashboard',
          source: 'partnership-landing-apply-now'
        }
      });
    }
  };

  // Navigation sections for the sticky nav - OPTIMIZED ORDER for better UX flow
  const navigationSections = [
    { id: 'hero', label: 'Get Started' },
    { id: 'portfolio', label: 'Our Work' },
    { id: 'process', label: 'How It Works' },
    { id: 'training', label: 'Training & Hub' },
    { id: 'stats', label: 'Program Stats' },
    { id: 'faq', label: 'AI Chat' },
    { id: 'requirements', label: 'Requirements' }
  ];

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(sectionId);
    }
  };

  // Update active section based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const sections = navigationSections.map(section => section.id);
      const currentSection = sections.find(sectionId => {
        const element = document.getElementById(sectionId);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 200 && rect.bottom >= 200;
        }
        return false;
      });
      
      if (currentSection && currentSection !== activeSection) {
        setActiveSection(currentSection);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeSection, navigationSections]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-black via-siso-bg to-black overflow-x-hidden">
      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-orange-500 transform-origin-left z-50"
        style={{ scaleX }}
      />

      {/* Navigation Component */}
      <PartnershipNavigation
        navigationSections={navigationSections}
        activeSection={activeSection}
        onSectionClick={scrollToSection}
        onApplyNow={handleApplyNow}
      />

      {/* SISO Swirly Animation Background - Matching Main Landing Page */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 -left-1/4 w-[250px] md:w-[600px] h-[250px] md:h-[600px] 
          bg-siso-red/15 rounded-full filter blur-[80px] md:blur-[120px] 
          animate-float-slow transform-gpu will-change-transform"
        />
        <div className="absolute bottom-1/4 -right-1/4 w-[250px] md:w-[600px] h-[250px] md:h-[600px] 
          bg-siso-orange/15 rounded-full filter blur-[80px] md:blur-[120px] 
          animate-float-slower transform-gpu will-change-transform"
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
          w-[350px] md:w-[1000px] h-[350px] md:h-[1000px] 
          bg-siso-red/8 rounded-full filter blur-[100px] md:blur-[150px] transform-gpu will-change-transform"
        />
      </div>

      {/* Waves Animation - Matching Main Landing Page HeroSection */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <Waves 
          lineColor="rgba(251, 146, 60, 0.3)"
          backgroundColor="transparent"
          waveSpeedX={0.018}
          waveSpeedY={0.015}
          waveAmpX={70}
          waveAmpY={35}
          friction={0.92}
          tension={0.012}
          maxCursorMove={180}
          xGap={22}
          yGap={55}
          className="-z-10"
        />
      </div>

      <div className="relative z-30">
        {/* Hero Section - Full Screen */}
        <section id="hero" className="min-h-screen flex items-center justify-center">
          <AgencyPartnershipHeader onApplyNow={handleApplyNow} />
        </section>


        {/* Portfolio Section - Full Screen */}
        <section id="portfolio" className="min-h-screen flex items-center justify-center">
          <PartnershipPortfolio onApplyNow={handleApplyNow} />
        </section>

        {/* Process Section - Full Screen */}
        <section id="process" className="min-h-screen flex items-center justify-center">
          <PartnershipProcess />
        </section>

        {/* Training & Hub Section - Full Screen */}
        <section id="training" className="min-h-screen flex items-center justify-center">
          <PartnershipTraining />
        </section>

        {/* SISO Platform Stats - Full Screen - MOVED DOWN for better trust building */}
        <section id="stats" className="min-h-screen flex items-center justify-center">
          <Stats />
        </section>

        {/* AI Chat Section - Full Screen */}
        <section id="faq" className="min-h-screen flex items-center justify-center">
          <PartnershipAIChat onApplyNow={handleApplyNow} />
        </section>

        {/* Partner Requirements Section - Full Screen */}
        <section id="requirements" className="min-h-screen flex items-center justify-center">
          <PartnerRequirements />
        </section>

        {/* Footer Section */}
        <Footer />
      </div>
    </div>
  );
});

export default PartnershipPage; 