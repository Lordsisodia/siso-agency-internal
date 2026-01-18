import { memo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavigationSection {
  id: string;
  label: string;
}

interface PartnershipNavigationProps {
  navigationSections: NavigationSection[];
  activeSection: string;
  onSectionClick: (sectionId: string) => void;
  onApplyNow: () => void;
}

export const PartnershipNavigation = memo(({ 
  navigationSections, 
  activeSection, 
  onSectionClick,
  onApplyNow 
}: PartnershipNavigationProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSectionClick = (sectionId: string) => {
    onSectionClick(sectionId);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 bg-black backdrop-blur-xl border border-orange-500/40 
          p-3 rounded-full shadow-2xl shadow-orange-500/20 hover:bg-orange-500/20 hover:border-orange-400/60 
          transition-all duration-200 min-h-[48px] min-w-[48px]"
      >
        {isMobileMenuOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <Menu className="w-6 h-6 text-white" />
        )}
      </motion.button>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
            />
            
            {/* Mobile Menu */}
            <motion.nav
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed right-0 top-0 h-full w-80 bg-black backdrop-blur-xl 
                border-l border-orange-500/30 z-45 overflow-y-auto shadow-xl shadow-orange-500/10"
            >
              <div className="p-6 pt-20">
                <div className="space-y-2">
                  {navigationSections.map((section, index) => (
                    <motion.button
                      key={section.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => handleSectionClick(section.id)}
                      whileHover={{ scale: 1.02, x: 5 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition-all duration-300 
                        min-h-[48px] flex items-center relative
                        ${activeSection === section.id 
                          ? 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white shadow-md' 
                          : 'text-white hover:text-orange-300 hover:bg-orange-500/10'
                        }`}
                    >
                      <span className="relative z-10">{section.label}</span>
                      {activeSection === section.id && (
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-orange-300/20"
                          layoutId="activeMobileTab"
                          transition={{ type: "spring", duration: 0.5 }}
                        />
                      )}
                    </motion.button>
                  ))}
                </div>
                
                {/* Mobile CTA */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mt-8 pt-6 border-t border-gray-700/50"
                >
                  <Button 
                    onClick={() => {
                      onApplyNow();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 
                      hover:to-yellow-600 text-white min-h-[48px] shadow-lg shadow-orange-500/25"
                  >
                    Apply Now
                  </Button>
                </motion.div>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sticky Navigation */}
      <div className="fixed top-8 left-0 right-0 z-50 pointer-events-none hidden lg:block">
        <div className="flex justify-center w-full">
          <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className="bg-black/90 backdrop-blur-xl border border-orange-500/20 rounded-xl 
              shadow-xl shadow-orange-500/10 pointer-events-auto w-fit"
          >
          <div className="flex items-center gap-2 px-6 py-3 relative z-10">
            {navigationSections.map((section) => (
              <button
                key={section.id}
                onClick={() => onSectionClick(section.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 
                  whitespace-nowrap text-center min-w-fit relative
                  ${activeSection === section.id 
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md shadow-orange-500/30' 
                    : 'text-white/90 hover:text-orange-300 hover:bg-orange-500/10'
                  }`}
              >
                <span className="relative z-10">{section.label}</span>
              </button>
            ))}
          </div>
        </motion.nav>
        </div>
      </div>

      {/* CSS for enhanced styles */}
      <style>{`
        .scale-102 {
          transform: scale(1.02);
        }
      `}</style>
    </>
  );
}); 