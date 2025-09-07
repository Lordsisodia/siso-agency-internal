import { memo } from 'react';
import { motion } from 'framer-motion';
import { Utensils, Building, ShoppingCart, Heart, GraduationCap, Stethoscope } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface ClientType {
  icon: React.ComponentType<any>;
  title: string;
  description: string;
  priceRange: string;
  commission: string;
}

const clientTypes: ClientType[] = [
  {
    icon: Utensils,
    title: "Restaurants & Cafes",
    description: "Online ordering, booking systems, menu management",
    priceRange: "£499 - £1,499",
    commission: "£99 - £299"
  },
  {
    icon: Building,
    title: "Professional Services",
    description: "Portfolio sites, client portals, appointment booking",
    priceRange: "£299 - £999",
    commission: "£59 - £199"
  },
  {
    icon: ShoppingCart,
    title: "E-commerce",
    description: "Online stores, product catalogs, payment systems",
    priceRange: "£799 - £2,490",
    commission: "£159 - £498"
  },
  {
    icon: Heart,
    title: "Healthcare",
    description: "Appointment systems, patient portals, telehealth",
    priceRange: "£999 - £2,490",
    commission: "£199 - £498"
  },
  {
    icon: GraduationCap,
    title: "Education",
    description: "Course platforms, learning management, student portals",
    priceRange: "£699 - £1,999",
    commission: "£139 - £399"
  },
  {
    icon: Stethoscope,
    title: "Local Services",
    description: "Service showcases, booking systems, customer management",
    priceRange: "£349 - £1,299",
    commission: "£69 - £259"
  }
];

export const PartnershipClientTypes = memo(() => {
  return (
    <div id="clients" className="w-full px-4">
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
            Target <span className="text-orange-500">Client Types</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            These are the types of businesses that need our services most. Perfect referral opportunities!
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {clientTypes.map((clientType, index) => {
            const IconComponent = clientType.icon;
            
            return (
              <motion.div
                key={clientType.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ 
                  duration: 0.6, 
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 100
                }}
                className="group"
              >
                <Card className="relative h-full bg-gradient-to-br from-gray-800/60 to-gray-900/60 
                  border border-gray-700/50 hover:border-orange-500/50 backdrop-blur-md
                  transition-all duration-500 hover:shadow-2xl hover:shadow-orange-500/20
                  group-hover:scale-105">
                  
                  {/* Glow effect on hover */}
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-orange-500/0 via-orange-500/0 to-orange-500/0 
                    group-hover:from-orange-500/5 group-hover:via-orange-500/3 group-hover:to-orange-500/5 
                    transition-all duration-500 pointer-events-none" />
                  
                  <CardContent className="relative p-8 text-center space-y-6">
                    {/* Icon */}
                    <motion.div 
                      className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-500/20 via-orange-600/30 to-red-500/20 
                        rounded-2xl flex items-center justify-center
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

                    {/* Title */}
                    <h3 className="text-2xl font-bold text-white group-hover:text-orange-100 transition-colors duration-300">
                      {clientType.title}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-400 group-hover:text-gray-300 leading-relaxed transition-colors duration-300">
                      {clientType.description}
                    </p>

                    {/* Price Range */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Project Value:</span>
                        <span className="text-lg font-bold text-orange-500">{clientType.priceRange}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Your Commission:</span>
                        <span className="text-lg font-bold text-green-400">{clientType.commission}</span>
                      </div>
                    </div>

                    {/* Commission Badge */}
                    <div className="pt-4">
                      <motion.div 
                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 
                          rounded-full border border-green-500/30 group-hover:from-green-500/30 group-hover:to-emerald-500/30 
                          group-hover:border-green-500/50 transition-all duration-300
                          shadow-lg shadow-green-500/10 group-hover:shadow-green-500/20"
                        whileHover={{ scale: 1.05 }}
                      >
                        <span className="text-sm font-bold text-green-300 group-hover:text-green-200 transition-colors duration-300">
                          20% Commission
                        </span>
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Client Types Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 
            backdrop-blur-md border border-gray-700/50 rounded-2xl p-8
            max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">
              <span className="text-orange-500">Any Business</span> Can Benefit
            </h3>
            <p className="text-lg text-gray-300 leading-relaxed mb-6">
              These are just examples. Any business that needs a website, web app, or digital solution 
              is a potential referral opportunity.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="text-orange-400 font-bold text-lg">£49+</div>
                <div className="text-gray-400">Minimum Commission</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="text-orange-400 font-bold text-lg">£498</div>
                <div className="text-gray-400">Maximum Commission</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="text-orange-400 font-bold text-lg">20%</div>
                <div className="text-gray-400">Commission Rate</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}); 