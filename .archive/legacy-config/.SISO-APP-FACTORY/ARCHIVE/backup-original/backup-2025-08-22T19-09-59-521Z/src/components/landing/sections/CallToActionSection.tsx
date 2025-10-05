
import { RainbowButton } from '@/components/ui/rainbow-button';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BadgeCheck, ArrowRight, PhoneCall } from 'lucide-react';

export const CallToActionSection = () => {
  const navigate = useNavigate();
  const handleGetStarted = () => navigate('/auth');

  return (
    <section className="py-24 px-4 relative overflow-hidden">
      <div className="container mx-auto">
        {/* Gradient Container */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative max-w-6xl mx-auto"
        >
          {/* Background Glow Effects */}
          <div className="absolute inset-0 bg-gradient-to-r from-siso-red/10 to-siso-orange/10 blur-3xl" />
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm rounded-2xl" />
          
          {/* Content Container */}
          <div className="relative p-12 rounded-2xl border border-siso-orange/20 bg-gradient-to-b from-black/60 to-transparent">
            {/* Particle Effects */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-4 left-1/4 w-24 h-24 bg-siso-red/20 rounded-full blur-xl animate-float-slow" />
              <div className="absolute -bottom-8 right-1/4 w-32 h-32 bg-siso-orange/20 rounded-full blur-xl animate-float-slower" />
            </div>

            {/* Two Column Layout */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Left Column - Main Content */}
              <div className="space-y-8">
                {/* Badge */}
                <motion.div 
                  className="inline-flex items-center gap-2 px-4 py-2 bg-siso-orange/10 rounded-full border border-siso-orange/30"
                  whileHover={{ scale: 1.05 }}
                >
                  <span className="w-2 h-2 bg-siso-orange rounded-full animate-pulse" />
                  <span className="text-sm font-semibold text-siso-orange">
                    Join 2,000+ Agency Owners
                  </span>
                </motion.div>

                {/* Main Copy */}
                <div className="space-y-4">
                  <h3 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                    Transform Your Agency with AI-Powered Solutions
                  </h3>
                  <p className="text-xl text-gray-300 leading-relaxed">
                    Stop struggling with manual processes. Start delivering 3x faster results 
                    to your clients with our proven frameworks and templates.
                  </p>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <RainbowButton 
                      className="text-lg px-8 py-4 font-semibold shadow-2xl w-full sm:w-auto"
                      onClick={handleGetStarted}
                    >
                      Start Free Trial <ArrowRight className="w-5 h-5 ml-2" />
                    </RainbowButton>
                  </motion.div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-8 py-4 rounded-lg border border-siso-orange/30 bg-siso-orange/10 
                      text-siso-orange hover:bg-siso-orange/20 transition-colors flex items-center 
                      justify-center gap-2 font-semibold"
                  >
                    <PhoneCall className="w-5 h-5" />
                    Schedule Demo
                  </motion.button>
                </div>

                {/* Trust Badges */}
                <div className="flex items-center gap-6 text-gray-400">
                  <div className="flex items-center gap-2">
                    <BadgeCheck className="w-5 h-5 text-siso-orange" />
                    <span className="text-sm">14-day free trial</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BadgeCheck className="w-5 h-5 text-siso-orange" />
                    <span className="text-sm">No credit card required</span>
                  </div>
                </div>
              </div>

              {/* Right Column - Social Proof */}
              <div className="space-y-8 backdrop-blur-sm bg-black/20 p-8 rounded-xl border border-white/10">
                {/* Rating */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-white font-semibold">4.9/5 rating</span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-white/5 rounded-lg">
                    <div className="text-2xl font-bold text-siso-orange">90%</div>
                    <div className="text-sm text-gray-400">Satisfaction Rate</div>
                  </div>
                  <div className="text-center p-4 bg-white/5 rounded-lg">
                    <div className="text-2xl font-bold text-siso-orange">3x</div>
                    <div className="text-sm text-gray-400">Faster Delivery</div>
                  </div>
                </div>

                {/* Testimonial */}
                <div className="relative">
                  <div className="absolute -top-2 -left-2 text-4xl text-siso-orange">"</div>
                  <blockquote className="pt-4 px-6 text-gray-300 italic">
                    SISO has completely transformed how we deliver results to our clients. 
                    The AI tools have cut our workflow time in half.
                    <footer className="mt-4 text-sm text-gray-400 not-italic">
                      - Sarah K., Digital Marketing Director
                    </footer>
                  </blockquote>
                </div>

                {/* Integrations */}
                <div className="flex flex-col items-center gap-2">
                  <div className="text-sm text-gray-400">Integrates with your favorite tools</div>
                  <div className="flex items-center gap-4">
                    {/* Add integration logos here if needed */}
                    <div className="w-8 h-8 bg-white/10 rounded-full"></div>
                    <div className="w-8 h-8 bg-white/10 rounded-full"></div>
                    <div className="w-8 h-8 bg-white/10 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
