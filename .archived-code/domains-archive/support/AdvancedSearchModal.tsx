/**
 * Advanced Search Modal
 * 
 * Full-screen modal with comprehensive search functionality
 * integrated with the support system
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AdvancedSearch } from './AdvancedSearch';
import { cn } from '@/lib/utils';

interface AdvancedSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
  className?: string;
}

interface SearchResult {
  id: string;
  title: string;
  content: string;
  category: string;
  type: 'article' | 'faq' | 'resource' | 'featured';
  relevanceScore: number;
  lastUpdated: string;
  views?: number;
  helpful?: number;
  tags?: string[];
  url?: string;
}

export function AdvancedSearchModal({ 
  isOpen, 
  onClose, 
  initialQuery = '',
  className 
}: AdvancedSearchModalProps) {
  const handleResultClick = (result: SearchResult) => {
    console.log('Opening result:', result);
    
    // Handle different types of results
    if (result.url) {
      if (result.url.startsWith('http')) {
        // External link
        window.open(result.url, '_blank');
      } else {
        // Internal link
        window.location.href = result.url;
      }
    }
    
    // Close modal after clicking result
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className={cn(
            "w-full max-w-6xl max-h-[90vh] bg-black border border-orange-500/20 rounded-xl overflow-hidden",
            className
          )}
        >
          {/* Modal Header */}
          <div className="border-b border-orange-500/20 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                  <Search className="h-5 w-5 text-orange-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Advanced Search</h2>
                  <p className="text-gray-400 text-sm">
                    Search through our comprehensive knowledge base
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Modal Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            <AdvancedSearch 
              onResultClick={handleResultClick}
              className="space-y-6"
            />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}