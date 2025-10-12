/**
 * Motivational Quotes Component
 *
 * Displays rotating motivational quotes in morning routine header.
 */

import React from 'react';
import { motion } from 'framer-motion';

interface Quote {
  text: string;
  author: string;
}

interface MotivationalQuotesProps {
  quotes: Quote[];
}

export const MotivationalQuotes: React.FC<MotivationalQuotesProps> = ({
  quotes
}) => {
  return (
    <div>
      <h3 className="font-bold text-yellow-300 mb-3 text-sm sm:text-base">💪 Daily Mindset</h3>
      <div className="space-y-3">
        {quotes.map((quote, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gradient-to-br from-yellow-900/10 to-orange-900/10 border border-yellow-600/30 rounded-lg p-4 hover:border-yellow-500/50 transition-all duration-300"
          >
            <div className="flex items-start gap-3">
              <div className="text-2xl">💡</div>
              <div className="flex-1">
                <p className="text-yellow-100/90 text-sm leading-relaxed font-medium">
                  "{quote.text}"
                </p>
                <p className="text-yellow-400/60 text-xs mt-2 font-semibold">
                  — {quote.author}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
