
import { PricingCard } from '@/shared/ui/pricing-card';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Rocket, Shield, Star, Check, ArrowUp, Award, DollarSign } from 'lucide-react';

export const PricingSection = () => {
  const navigate = useNavigate();
  const handleGetStarted = () => navigate('/auth');

  return (
    <section id="pricing" className="py-20 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/50" />
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-siso-orange via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-siso-red via-transparent to-transparent" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Main Pricing Card Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative max-w-4xl mx-auto"
        >
          {/* Early Access Banner */}
          <motion.div 
            className="text-center mb-8 space-y-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-center gap-2 text-2xl font-bold text-white">
              <Rocket className="w-6 h-6 text-siso-orange" />
              <h2>Exclusive Early Access - First 1,000 Agencies</h2>
            </div>
            <p className="text-siso-text/80 text-lg">
              After that, just £249/year. Lock in your free access now!
            </p>
          </motion.div>

          {/* Main Pricing Card */}
          <PricingCard
            title="Complete Platform Access"
            description="Get instant access to our complete platform with all premium features."
            price={249}
            features={[
              {
                title: "Core Features",
                items: [
                  <div key="automation" className="flex items-center gap-2">
                    <Rocket className="w-4 h-4 text-siso-orange" />
                    <span>Enterprise-grade AI automation suite - Used by 500+ agencies</span>
                  </div>,
                  <div key="integrations" className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-siso-orange" />
                    <span>Unlimited platform integrations with enterprise security</span>
                  </div>,
                  <div key="updates" className="flex items-center gap-2">
                    <ArrowUp className="w-4 h-4 text-siso-orange" />
                    <span>Regular feature updates & improvements</span>
                  </div>,
                  <div key="card" className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-siso-orange" />
                    <span>No credit card required to start</span>
                  </div>,
                ],
              },
              {
                title: "Enterprise Features",
                items: [
                  <div key="support" className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-siso-orange" />
                    <span>24/7 Priority support & consulting - 4.9/5 rating</span>
                  </div>,
                  <div key="sessions" className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-siso-orange" />
                    <span>Expert strategy sessions included</span>
                  </div>,
                  "Standard Plan: £249/year",
                  "Enterprise Plan: £999/year",
                ],
              },
            ]}
            buttonText="Claim Your Free Access"
            onButtonClick={handleGetStarted}
            trustMessage={
              <div className="flex items-center justify-center gap-2">
                <Award className="w-5 h-5 text-siso-orange" />
                <span>764/1,000 Free Spots Taken – Claim yours now!</span>
              </div>
            }
          />
        </motion.div>

        {/* Trust Banner */}
        <motion.div 
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex items-center justify-center gap-4 text-sm flex-wrap">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span className="text-siso-text/70">30-day money-back guarantee</span>
            </div>
            <span className="text-siso-text/30">•</span>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span className="text-siso-text/70">No credit card required</span>
            </div>
            <span className="text-siso-text/30">•</span>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span className="text-siso-text/70">Cancel anytime</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
