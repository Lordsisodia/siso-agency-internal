/**
 * Motivational Quotes Component
 *
 * Displays rotating motivational quotes in morning routine header.
 */

import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion, type PanInfo } from 'framer-motion';

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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<1 | -1>(1);

  const hasQuotes = quotes.length > 0;

  const activeQuote = useMemo(() => {
    if (!hasQuotes) return null;
    const boundedIndex = ((currentIndex % quotes.length) + quotes.length) % quotes.length;
    return quotes[boundedIndex];
  }, [currentIndex, hasQuotes, quotes]);

  const showNextQuote = () => {
    if (!hasQuotes) return;
    setSwipeDirection(1);
    setCurrentIndex(prev => prev + 1);
  };

  const showPreviousQuote = () => {
    if (!hasQuotes) return;
    setSwipeDirection(-1);
    setCurrentIndex(prev => prev - 1);
  };

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (!hasQuotes) return;

    const swipeOffset = info.offset.x;
    const swipeVelocity = info.velocity.x;
    const swipeThreshold = 80;

    if (swipeOffset < -swipeThreshold || swipeVelocity < -300) {
      showNextQuote();
    } else if (swipeOffset > swipeThreshold || swipeVelocity > 300) {
      showPreviousQuote();
    }
  };

  return (
    <div>
      <div className="relative">
        <div className="bg-gradient-to-br from-orange-900/10 to-orange-900/10 border border-orange-600/30 rounded-lg overflow-hidden">
          <AnimatePresence mode="wait" custom={swipeDirection}>
            {hasQuotes && activeQuote ? (
              <motion.div
                key={`${currentIndex}-${activeQuote.text}`}
                custom={swipeDirection}
                initial={{ opacity: 0, x: swipeDirection > 0 ? 60 : -60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: swipeDirection > 0 ? -60 : 60 }}
                transition={{ type: 'spring', stiffness: 260, damping: 30 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={handleDragEnd}
                className="p-4 cursor-grab active:cursor-grabbing touch-pan-y select-none"
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl">💡</div>
                  <div className="flex-1">
                    <p className="text-orange-100/90 text-sm leading-relaxed font-medium">
                      "{activeQuote.text}"
                    </p>
                    <p className="text-orange-400/60 text-xs mt-2 font-semibold">
                      — {activeQuote.author}
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="p-4 text-orange-200/70 text-sm">
                No motivational quotes available right now.
              </div>
            )}
          </AnimatePresence>
        </div>

        {hasQuotes && quotes.length > 1 && (
          <div className="mt-3 flex items-center justify-between text-xs text-orange-300/70">
            <button
              type="button"
              onClick={showPreviousQuote}
              aria-label="Show previous motivational quote"
              className="px-2 py-1 rounded border border-orange-600/40 hover:border-orange-500/70 transition-colors"
            >
              Swipe ←
            </button>
            <span>
              {((currentIndex % quotes.length) + quotes.length) % quotes.length + 1} / {quotes.length}
            </span>
            <button
              type="button"
              onClick={showNextQuote}
              aria-label="Show next motivational quote"
              className="px-2 py-1 rounded border border-orange-600/40 hover:border-orange-500/70 transition-colors"
            >
              Swipe →
            </button>
          </div>
        )}

        {hasQuotes && quotes.length > 1 && (
          <p className="mt-2 text-[11px] text-orange-300/60 text-center">
            Swipe left or right to reveal a fresh quote.
          </p>
        )}
      </div>
    </div>
  );
};
