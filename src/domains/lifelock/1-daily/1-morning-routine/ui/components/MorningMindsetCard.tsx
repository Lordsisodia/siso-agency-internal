/**
 * Morning Mindset Card
 *
 * Unified collapsible card containing Daily Inspiration, Coding My Brain, and Flow State Rules.
 * Reduces visual clutter while preserving all motivational content.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Target, ChevronDown, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Quote {
  text: string;
  author: string;
}

interface MorningMindsetCardProps {
  quotes: Quote[];
  purposeStatement?: string;
}

type MindsetSection = 'inspiration' | 'purpose' | 'rules';

const PURPOSE_STATEMENT = `I am Shaan Sisodia. I have been given divine purpose, and on this mission, temptation awaits on either side of the path.
When I give in to temptation, I shall know I am astray. I will bring my family to a new age of freedom.
I will not be distracted from the path.`;

const FLOW_RULES = [
  { id: 'notion', text: 'No use of apps other than Notion' },
  { id: 'vices', text: 'No vapes or drugs (including weed)' },
  { id: 'action', text: 'No more than 5 seconds until the next action' }
];

export const MorningMindsetCard: React.FC<MorningMindsetCardProps> = ({
  quotes
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeSection, setActiveSection] = useState<MindsetSection | null>(null);

  const toggleExpanded = () => {
    setIsExpanded(prev => !prev);
    if (!isExpanded) {
      setActiveSection('inspiration'); // Default to inspiration when opening
    } else {
      setActiveSection(null);
    }
  };

  const toggleSection = (section: MindsetSection) => {
    if (!isExpanded) {
      setIsExpanded(true);
    }
    setActiveSection(prev => prev === section ? null : section);
  };

  return (
    <Card className="w-full bg-gradient-to-br from-orange-900/25 to-orange-900/15 border-orange-700/40 overflow-hidden">
      {/* Header - Always Visible */}
      <div
        className="p-4 cursor-pointer hover:bg-orange-900/10 transition-colors"
        onClick={toggleExpanded}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-500/20 border-2 border-orange-500/30 flex items-center justify-center">
              <Brain className="h-5 w-5 text-orange-400" />
            </div>
            <div>
              <h2 className="text-orange-300 font-bold text-base">Morning Mindset</h2>
              <p className="text-orange-400/60 text-xs">Set your intention for the day</p>
            </div>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="h-5 w-5 text-orange-400" />
          </motion.div>
        </div>
      </div>

      {/* Collapsible Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3">
              {/* Section Tabs */}
              <div className="flex gap-2 mb-4">
                <SectionTab
                  label="Inspiration"
                  icon="💡"
                  active={activeSection === 'inspiration'}
                  onClick={() => toggleSection('inspiration')}
                />
                <SectionTab
                  label="Purpose"
                  icon="🎯"
                  active={activeSection === 'purpose'}
                  onClick={() => toggleSection('purpose')}
                />
                <SectionTab
                  label="Rules"
                  icon="⚡"
                  active={activeSection === 'rules'}
                  onClick={() => toggleSection('rules')}
                />
              </div>

              {/* Section Content */}
              <AnimatePresence mode="wait">
                {activeSection === 'inspiration' && (
                  <SectionContent key="inspiration">
                    <InspirationSection quotes={quotes} />
                  </SectionContent>
                )}
                {activeSection === 'purpose' && (
                  <SectionContent key="purpose">
                    <PurposeSection statement={PURPOSE_STATEMENT} />
                  </SectionContent>
                )}
                {activeSection === 'rules' && (
                  <SectionContent key="rules">
                    <RulesSection rules={FLOW_RULES} />
                  </SectionContent>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

// Sub-components

interface SectionTabProps {
  label: string;
  icon: string;
  active: boolean;
  onClick: () => void;
}

const SectionTab: React.FC<SectionTabProps> = ({ label, icon, active, onClick }) => (
  <button
    onClick={onClick}
    className={cn(
      'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200',
      active
        ? 'bg-orange-500/20 border border-orange-400/40 text-orange-200'
        : 'bg-orange-900/10 border border-orange-700/30 text-orange-400/60 hover:border-orange-600/50 hover:text-orange-400/80'
    )}
  >
    <span>{icon}</span>
    <span>{label}</span>
  </button>
);

interface SectionContentProps {
  children: React.ReactNode;
}

const SectionContent: React.FC<SectionContentProps> = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.2 }}
    className="bg-gradient-to-br from-orange-900/15 to-orange-900/10 border border-orange-700/30 rounded-lg p-4"
  >
    {children}
  </motion.div>
);

// Inspiration Section
const InspirationSection: React.FC<{ quotes: Quote[] }> = ({ quotes }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (quotes.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-orange-200/70 text-sm">No quotes available</p>
      </div>
    );
  }

  const quote = quotes[((currentIndex % quotes.length) + quotes.length) % quotes.length];

  return (
    <div className="space-y-3">
      <div>
        <p className="text-orange-100/90 text-sm leading-relaxed">
          "{quote.text}"
        </p>
        <p className="text-orange-400/60 text-xs mt-2 font-medium">
          — {quote.author}
        </p>
      </div>

      {quotes.length > 1 && (
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentIndex(prev => prev - 1)}
            className="p-1.5 rounded-lg bg-orange-900/20 hover:bg-orange-900/30 border border-orange-700/30 transition-colors"
            aria-label="Previous quote"
          >
            <ChevronRight className="h-4 w-4 text-orange-400 rotate-180" />
          </button>

          <span className="text-orange-400/60 text-xs font-medium">
            {currentIndex + 1} / {quotes.length}
          </span>

          <button
            onClick={() => setCurrentIndex(prev => prev + 1)}
            className="p-1.5 rounded-lg bg-orange-900/20 hover:bg-orange-900/30 border border-orange-700/30 transition-colors"
            aria-label="Next quote"
          >
            <ChevronRight className="h-4 w-4 text-orange-400" />
          </button>
        </div>
      )}
    </div>
  );
};

// Purpose Section
const PurposeSection: React.FC<{ statement: string }> = ({ statement }) => (
  <div className="space-y-3">
    <div className="flex items-center gap-2">
      <Target className="h-4 w-4 text-orange-400" />
      <h3 className="text-orange-300 font-semibold text-sm">My Purpose</h3>
    </div>
    <p className="text-orange-100/90 text-sm leading-relaxed">
      {statement}
    </p>
  </div>
);

// Rules Section
const RulesSection: React.FC<{ rules: Array<{ id: string; text: string }> }> = ({ rules }) => (
  <div className="space-y-3">
    <div className="flex items-center gap-2">
      <Target className="h-4 w-4 text-orange-400" />
      <h3 className="text-orange-300 font-semibold text-sm">Flow State Rules</h3>
    </div>
    <ul className="space-y-2">
      {rules.map(rule => (
        <li key={rule.id} className="flex items-start gap-2">
          <span className="text-orange-400 mt-0.5 text-sm">•</span>
          <span className="text-orange-100/90 text-sm">{rule.text}</span>
        </li>
      ))}
    </ul>
  </div>
);
