import { memo } from 'react';
import { motion } from 'framer-motion';
import { Search, CheckCircle, Code, DollarSign } from 'lucide-react';

interface ProcessStep {
  icon: React.ComponentType<any>;
  title: string;
  description: string;
  highlight: string;
  number: number;
}

const processSteps: ProcessStep[] = [
  {
    icon: Search,
    title: "Identify Potential Clients",
    description: "Use your network to find businesses needing web solutions",
    highlight: "Find & Connect",
    number: 1
  },
  {
    icon: CheckCircle,
    title: "Confirm Interest",
    description: "Ensure business is serious about getting a web app or website",
    highlight: "Qualify & Confirm",
    number: 2
  },
  {
    icon: Code,
    title: "SISO Creates MVP",
    description: "We build a free MVP and demo it to your referred client",
    highlight: "We Build & Demo",
    number: 3
  },
  {
    icon: DollarSign,
    title: "Earn Commission",
    description: "Receive 20% commission once client makes final payment",
    highlight: "Get Paid",
    number: 4
  }
];

export const PartnershipProcess = memo(() => {
  return (
    <div id="process" className="w-full px-4">
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-xl md:text-3xl md:text-5xl tracking-tighter lg:max-w-xl font-regular text-center text-white mx-auto mb-6">
            How It <span className="text-transparent bg-gradient-to-r from-orange-400 via-orange-500 to-yellow-500 bg-clip-text">Works</span>
          </h2>
          <p className="text-lg leading-relaxed tracking-tight text-gray-300 max-w-2xl mx-auto">
            Our simple 4-step process makes it easy to start earning commissions
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
          {processSteps.map((step, index) => {
            const IconComponent = step.icon;
            
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ 
                  duration: 0.6, 
                  delay: index * 0.15,
                  type: "spring",
                  stiffness: 100
                }}
                className="relative group"
              >
                {/* Connecting Line - Hidden on mobile */}
                {index < processSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-orange-500/50 to-orange-500/20 z-0" />
                )}

                {/* Step Card */}
                <div className="relative bg-gradient-to-br from-gray-800/60 to-gray-900/60 
                  backdrop-blur-md border border-gray-700/50 rounded-2xl p-8 
                  hover:border-orange-500/50 transition-all duration-500 
                  hover:shadow-2xl hover:shadow-orange-500/20 text-center group-hover:scale-105">
                  
                  {/* Step Number Badge */}
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 
                    w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 
                    rounded-full flex items-center justify-center 
                    shadow-lg shadow-orange-500/30 border-2 border-white/10">
                    <span className="text-white font-bold text-sm">{step.number}</span>
                  </div>

                  {/* Icon */}
                  <motion.div 
                    className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-500/20 via-orange-600/30 to-red-500/20 
                      rounded-2xl flex items-center justify-center mb-6
                      shadow-lg shadow-orange-500/20 group-hover:shadow-orange-500/40
                      border border-orange-500/20 group-hover:border-orange-500/40
                      transition-all duration-500"
                    whileHover={{ 
                      scale: 1.1,
                      rotate: 5,
                      transition: { duration: 0.3 }
                    }}
                  >
                    <IconComponent className="w-8 h-8 text-orange-400 group-hover:text-orange-300 transition-colors duration-300" />
                  </motion.div>

                  {/* Highlight Badge */}
                  <div className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-orange-500/20 to-red-500/20 
                    rounded-full border border-orange-500/30 mb-4 
                    group-hover:from-orange-500/30 group-hover:to-red-500/30 
                    group-hover:border-orange-500/50 transition-all duration-300">
                    <span className="text-xs font-semibold text-orange-300 group-hover:text-orange-200 transition-colors duration-300">
                      {step.highlight}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-white mb-4 group-hover:text-orange-100 transition-colors duration-300">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                    {step.description}
                  </p>

                  {/* Glow Effect */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-500/0 via-orange-500/0 to-orange-500/0 
                    group-hover:from-orange-500/5 group-hover:via-orange-500/3 group-hover:to-orange-500/5 
                    transition-all duration-500 pointer-events-none" />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Process Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 
            backdrop-blur-md border border-gray-700/50 rounded-2xl p-8
            max-w-4xl mx-auto">
            <h3 className="text-xl md:text-3xl tracking-tighter font-regular text-white mb-4">
              It's That <span className="text-transparent bg-gradient-to-r from-orange-400 via-orange-500 to-yellow-500 bg-clip-text">Simple</span>
            </h3>
            <p className="text-lg leading-relaxed tracking-tight text-gray-300">
              You focus on relationships and referrals. We handle everything else - 
              from building the MVP to managing client communications and payments.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}); 