
import { memo, useEffect } from 'react';
import { GradientHeading } from '@/components/ui/gradient-heading';
import { Check, Code, Zap, Star } from 'lucide-react';
import { motion, useAnimation } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';
import { useInView } from 'react-intersection-observer';

export const FeaturesSection = memo(() => {
  const isMobile = useIsMobile();
  const controls = useAnimation();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  
  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);
  
  const features = [
    {
      icon: Code,
      title: "AI-Powered Development",
      description: "Leverage our cutting-edge AI solutions to streamline your agency's development workflow."
    },
    {
      icon: Zap,
      title: "Lightning Fast Performance",
      description: "Experience optimal performance with our optimized platforms and frameworks."
    },
    {
      icon: Check,
      title: "Ready-to-Use Solutions",
      description: "Access our library of pre-built solutions to accelerate your client projects."
    },
    {
      icon: Star,
      title: "Premium Resources",
      description: "Gain exclusive access to premium resources curated for agency success."
    }
  ];

  const containerVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <section id="features" className="py-12 sm:py-16 md:py-20">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={controls}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 }
          }}
          className="text-center mb-10 md:mb-16"
        >
          <GradientHeading className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">
            Platform Features
          </GradientHeading>
          
          <p className="text-base md:text-lg text-siso-text-muted max-w-2xl mx-auto">
            Discover how our platform can transform your agency's capabilities
          </p>
        </motion.div>

        <motion.div 
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={controls}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8"
        >
          {features.map((feature, index) => (
            <motion.div 
              key={feature.title}
              variants={itemVariants}
              className="bg-black/30 backdrop-blur-sm border border-siso-text/10 rounded-xl p-4 sm:p-6 hover:border-siso-orange/20 transition-all duration-300"
            >
              <div className="h-10 w-10 sm:h-12 sm:w-12 mb-3 sm:mb-4 p-2 sm:p-3 rounded-lg bg-gradient-to-br from-siso-red/10 to-siso-orange/10">
                <feature.icon className="w-full h-full text-siso-orange" />
              </div>
              
              <h3 className="text-lg sm:text-xl font-semibold text-siso-text-bold mb-1 sm:mb-2">
                {feature.title}
              </h3>
              
              <p className="text-sm text-siso-text/80">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
});

FeaturesSection.displayName = 'FeaturesSection';
