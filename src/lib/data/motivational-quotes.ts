/**
 * Motivational Quotes Database
 * Curated quotes from Elon Musk, Andrew Tate, and Alex Hormozi
 */

export interface Quote {
  text: string;
  author: 'Elon Musk' | 'Andrew Tate' | 'Alex Hormozi';
  category: 'discipline' | 'success' | 'business' | 'mindset' | 'action';
}

export const MOTIVATIONAL_QUOTES: Quote[] = [
  // ELON MUSK QUOTES
  {
    text: "When something is important enough, you do it even if the odds are not in your favor.",
    author: "Elon Musk",
    category: "discipline"
  },
  {
    text: "Persistence is very important. You should not give up unless you are forced to give up.",
    author: "Elon Musk",
    category: "success"
  },
  {
    text: "Work like hell. I mean you just have to put in 80 to 100 hour weeks every week. This improves the odds of success.",
    author: "Elon Musk",
    category: "discipline"
  },
  {
    text: "I think it is possible for ordinary people to choose to be extraordinary.",
    author: "Elon Musk",
    category: "mindset"
  },
  {
    text: "People should pursue what they're passionate about. That will make them happier than pretty much anything else.",
    author: "Elon Musk",
    category: "success"
  },
  {
    text: "I think it's very important to have a feedback loop, where you're constantly thinking about what you've done and how you could be doing it better.",
    author: "Elon Musk",
    category: "mindset"
  },
  {
    text: "Pay attention to negative feedback and solicit it, particularly from friends. Hardly anyone does that, and it's incredibly helpful.",
    author: "Elon Musk",
    category: "mindset"
  },
  {
    text: "Some people don't like change, but you need to embrace change if the alternative is disaster.",
    author: "Elon Musk",
    category: "action"
  },
  {
    text: "If something is important enough, even if the odds are stacked against you, you should still do it.",
    author: "Elon Musk",
    category: "action"
  },
  {
    text: "The first step is to establish that something is possible; then probability will occur.",
    author: "Elon Musk",
    category: "success"
  },

  // ANDREW TATE QUOTES
  {
    text: "Discipline is the foundation of freedom.",
    author: "Andrew Tate",
    category: "discipline"
  },
  {
    text: "Discipline is the key to success. If you cannot force yourself to do something you don't want to do, how are you ever gonna put yourself through the suffering required for greatness?",
    author: "Andrew Tate",
    category: "discipline"
  },
  {
    text: "Your mindset is the single most important factor in determining your success or failure.",
    author: "Andrew Tate",
    category: "mindset"
  },
  {
    text: "The most successful people in the world have a mindset of abundance, not scarcity.",
    author: "Andrew Tate",
    category: "mindset"
  },
  {
    text: "The difference between those who succeed and those who fail is often their mindset.",
    author: "Andrew Tate",
    category: "success"
  },
  {
    text: "Success isn't about being lucky. It's about being disciplined enough to show up even when you don't feel like it.",
    author: "Andrew Tate",
    category: "discipline"
  },
  {
    text: "Turn every challenge into fuel for building resilience.",
    author: "Andrew Tate",
    category: "mindset"
  },
  {
    text: "The matrix is designed to keep you weak. Break free.",
    author: "Andrew Tate",
    category: "mindset"
  },
  {
    text: "Every morning is a chance to dominate. Don't waste it.",
    author: "Andrew Tate",
    category: "action"
  },
  {
    text: "Your excuses are the chains that bind you.",
    author: "Andrew Tate",
    category: "mindset"
  },
  {
    text: "Comfort is the enemy of greatness.",
    author: "Andrew Tate",
    category: "discipline"
  },
  {
    text: "Average is a choice. Choose excellence.",
    author: "Andrew Tate",
    category: "success"
  },

  // ALEX HORMOZI QUOTES
  {
    text: "Success comes down to discipline and consistency, not intensity.",
    author: "Alex Hormozi",
    category: "discipline"
  },
  {
    text: "Discipline is the ability to keep promises to yourself.",
    author: "Alex Hormozi",
    category: "discipline"
  },
  {
    text: "We don't rise to the standards we have when others are watching; we fall to the standards we have when no one is.",
    author: "Alex Hormozi",
    category: "discipline"
  },
  {
    text: "Every successful person starts with: 0 revenue, 0 subscribers, 0 customers, 0 fans. The only difference is they actually start.",
    author: "Alex Hormozi",
    category: "action"
  },
  {
    text: "I cannot lose if I do not quit.",
    author: "Alex Hormozi",
    category: "success"
  },
  {
    text: "If you can wait 90 days for a result, you can win. If you can wait a year, you can win big. If you can wait a decade, you can be the best.",
    author: "Alex Hormozi",
    category: "success"
  },
  {
    text: "One of the truest laws in business: The more money you make other people, the more money you make.",
    author: "Alex Hormozi",
    category: "business"
  },
  {
    text: "Business is just problem-solving at scale.",
    author: "Alex Hormozi",
    category: "business"
  },
  {
    text: "The market doesn't care about your passion; it cares about value.",
    author: "Alex Hormozi",
    category: "business"
  },
  {
    text: "A hundred imperfect actions will always beat one perfect plan.",
    author: "Alex Hormozi",
    category: "action"
  },
  {
    text: "The only shortcut in life is being consistent.",
    author: "Alex Hormozi",
    category: "discipline"
  },
  {
    text: "You don't become confident by shouting affirmations in the mirror, but by having a stack of undeniable proof that you are who you say you are.",
    author: "Alex Hormozi",
    category: "action"
  },
  {
    text: "Outwork your self-doubt.",
    author: "Alex Hormozi",
    category: "action"
  },
  {
    text: "During my hardest days, I repeated the same phrase to myself: I cannot lose if I do not quit.",
    author: "Alex Hormozi",
    category: "mindset"
  },
];

const QUOTES_PER_DAY = 10;

/**
 * Get rotating quotes based on the date
 * Returns 10 quotes that change daily
 */
export const getRotatingQuotes = (date: Date): Quote[] => {
  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000
  );
  const startIndex = (dayOfYear * QUOTES_PER_DAY) % MOTIVATIONAL_QUOTES.length;

  const quotes: Quote[] = [];
  for (let i = 0; i < QUOTES_PER_DAY; i++) {
    quotes.push(MOTIVATIONAL_QUOTES[(startIndex + i) % MOTIVATIONAL_QUOTES.length]);
  }
  return quotes;
};
