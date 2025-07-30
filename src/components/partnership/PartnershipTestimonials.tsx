import { memo } from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface Testimonial {
  name: string;
  role: string;
  quote: string;
  earnings: string;
}

const testimonials: Testimonial[] = [
  {
    name: "Sarah Johnson",
    role: "Business Consultant",
    quote: "Made £1,200 in my first month just from my existing network. The MVP approach makes it so easy to close deals.",
    earnings: "£1,200/month"
  },
  {
    name: "Mike Chen",
    role: "Sales Professional",
    quote: "SISO handles everything technical - I just focus on relationships. Best partnership program I've ever joined.",
    earnings: "£800/month"
  },
  {
    name: "Emma Davis",
    role: "Marketing Freelancer",
    quote: "The zero-risk promise removes all objections. Clients love seeing the MVP before committing.",
    earnings: "£950/month"
  }
];

export const PartnershipTestimonials = memo(() => {
  return (
    <div id="testimonials" className="w-full px-4">
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
            Success <span className="text-orange-500">Stories</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Real partners, real results. See what our partners are saying about the program.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ 
                duration: 0.6, 
                delay: index * 0.15,
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
                
                <CardContent className="relative p-8 space-y-6">
                  {/* Quote Icon */}
                  <div className="flex justify-between items-start">
                    <motion.div 
                      className="w-12 h-12 bg-gradient-to-br from-orange-500/20 via-orange-600/30 to-red-500/20 
                        rounded-xl flex items-center justify-center
                        shadow-lg shadow-orange-500/20 group-hover:shadow-orange-500/40
                        border border-orange-500/20 group-hover:border-orange-500/40
                        transition-all duration-500"
                      whileHover={{ 
                        scale: 1.1,
                        rotate: 15,
                        transition: { duration: 0.3 }
                      }}
                    >
                      <Quote className="w-6 h-6 text-orange-400 group-hover:text-orange-300 transition-colors duration-300" />
                    </motion.div>

                    {/* Star Rating */}
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 + i * 0.1 }}
                        >
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Quote */}
                  <blockquote className="text-gray-300 group-hover:text-gray-200 leading-relaxed text-lg italic transition-colors duration-300">
                    "{testimonial.quote}"
                  </blockquote>

                  {/* Earnings Badge */}
                  <div className="flex justify-center">
                    <motion.div 
                      className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 
                        rounded-full border border-green-500/30 group-hover:from-green-500/30 group-hover:to-emerald-500/30 
                        group-hover:border-green-500/50 transition-all duration-300
                        shadow-lg shadow-green-500/10 group-hover:shadow-green-500/20"
                      whileHover={{ scale: 1.05 }}
                    >
                      <span className="text-sm font-bold text-green-300 group-hover:text-green-200 transition-colors duration-300">
                        {testimonial.earnings}
                      </span>
                    </motion.div>
                  </div>

                  {/* Author */}
                  <div className="border-t border-gray-700/50 pt-6">
                    <div className="text-center">
                      <h4 className="text-lg font-bold text-white group-hover:text-orange-100 transition-colors duration-300">
                        {testimonial.name}
                      </h4>
                      <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Testimonials CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 
            backdrop-blur-md border border-gray-700/50 rounded-2xl p-8
            max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">
              Join <span className="text-orange-500">Successful Partners</span>
            </h3>
            <p className="text-lg text-gray-300 leading-relaxed mb-6">
              These partners started just like you. With dedication and our support, 
              you can achieve similar results in your first few months.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="text-2xl font-bold text-orange-400 mb-2">95%</div>
                <div className="text-sm text-gray-400">Partner Satisfaction</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="text-2xl font-bold text-orange-400 mb-2">£750</div>
                <div className="text-sm text-gray-400">Average Monthly Earnings</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="text-2xl font-bold text-orange-400 mb-2">30 Days</div>
                <div className="text-sm text-gray-400">Average Time to First Commission</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}); 