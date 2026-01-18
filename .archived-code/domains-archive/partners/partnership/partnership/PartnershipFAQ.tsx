import { memo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    question: "How quickly do I get paid?",
    answer: "Commission is paid within 7 days of final client payment. We use secure bank transfers for all payments."
  },
  {
    question: "Is there a limit to how many clients I can refer?",
    answer: "No limit! Refer as many clients as you can handle. Our top partners refer 5-10 clients per month."
  },
  {
    question: "What if a client isn't satisfied?",
    answer: "We have a satisfaction guarantee. Commission is only paid on successful projects where the client is happy with the final result."
  },
  {
    question: "Do I need technical knowledge?",
    answer: "Not at all! We handle all technical aspects. You focus on relationship building and connecting us with potential clients."
  },
  {
    question: "What support do I get?",
    answer: "Complete training materials, marketing collateral, technical support, client communication templates, and a dedicated partner manager."
  },
  {
    question: "Can I see examples of previous work?",
    answer: "Yes! We provide a complete portfolio, case studies, and can arrange calls with existing clients for references."
  }
];

interface PartnershipFAQProps {
  onApplyNow: () => void;
}

export const PartnershipFAQ = memo(({ onApplyNow }: PartnershipFAQProps) => {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <div id="faq" className="w-full px-4">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
            Frequently Asked <span className="text-orange-500">Questions</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Got questions? We've got answers. Here are the most common questions from our partners.
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group"
            >
              <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 
                backdrop-blur-sm border border-gray-700/50 rounded-2xl
                hover:border-orange-500/50 transition-all duration-300
                hover:shadow-lg hover:shadow-orange-500/10">
                
                {/* Question Button */}
                <motion.button
                  onClick={() => toggleFaq(index)}
                  className="w-full p-6 text-left flex items-center justify-between 
                    hover:bg-orange-500/5 transition-all duration-300 rounded-2xl
                    focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="flex items-center space-x-4">
                    {/* Question Icon */}
                    <motion.div 
                      className="w-10 h-10 bg-gradient-to-br from-orange-500/20 via-orange-600/30 to-red-500/20 
                        rounded-xl flex items-center justify-center
                        shadow-lg shadow-orange-500/20 group-hover:shadow-orange-500/40
                        border border-orange-500/20 group-hover:border-orange-500/40
                        transition-all duration-300"
                      whileHover={{ rotate: 15 }}
                    >
                      <HelpCircle className="w-5 h-5 text-orange-400 group-hover:text-orange-300 transition-colors duration-300" />
                    </motion.div>

                    {/* Question Text */}
                    <h3 className="text-lg md:text-xl font-semibold text-white group-hover:text-orange-100 
                      transition-colors duration-300 pr-4">
                      {item.question}
                    </h3>
                  </div>

                  {/* Expand/Collapse Icon */}
                  <motion.div
                    animate={{ rotate: expandedFaq === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex-shrink-0"
                  >
                    {expandedFaq === index ? (
                      <ChevronUp className="w-6 h-6 text-orange-400" />
                    ) : (
                      <ChevronDown className="w-6 h-6 text-gray-400 group-hover:text-orange-400 transition-colors duration-300" />
                    )}
                  </motion.div>
                </motion.button>

                {/* Answer */}
                <AnimatePresence>
                  {expandedFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 pl-20">
                        <motion.div
                          initial={{ y: -10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: -10, opacity: 0 }}
                          transition={{ duration: 0.2, delay: 0.1 }}
                          className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/30"
                        >
                          <p className="text-gray-300 leading-relaxed text-lg">
                            {item.answer}
                          </p>
                        </motion.div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>

        {/* FAQ CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 
            backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white mb-4">
              Still Have <span className="text-orange-500">Questions?</span>
            </h3>
            <p className="text-lg text-gray-300 leading-relaxed mb-6">
              Our team is here to help. Get in touch and we'll answer any questions you have about the partnership program.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                onClick={onApplyNow}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 
                  hover:from-orange-600 hover:to-orange-700 text-white font-semibold 
                  rounded-xl shadow-lg shadow-orange-500/25 transition-all duration-300"
              >
                Apply Now
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gray-800/60 hover:bg-gray-700/60 text-white font-semibold 
                  border border-gray-600/50 hover:border-orange-500/50 rounded-xl 
                  transition-all duration-300"
              >
                Contact Support
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}); 