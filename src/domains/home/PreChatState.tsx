import React from 'react';
import { motion } from 'framer-motion';
import { PlaceholdersAndVanishInput } from '@/components/ui/placeholders-and-vanish-input';

interface PreChatStateProps {
  handleSubmit: (message: string) => Promise<void>;
  isLoading: boolean;
}

export const PreChatState = ({ handleSubmit, isLoading }: PreChatStateProps) => {
  const searchPlaceholders = [
    "How can AI help my business grow?",
    "What tools do you recommend for automation?",
    "How to implement AI in my workflow?",
    "Best practices for agency scaling",
    "Latest AI trends for agencies",
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Search input changed:', e.target.value);
  };

  const handleInputSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const message = e.currentTarget.querySelector('input')?.value;
    if (message?.trim()) {
      handleSubmit(message.trim());
    }
  };

  return (
    <motion.div
      key="initial"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-center h-full max-w-3xl mx-auto px-4"
      role="main"
      aria-label="Welcome Screen"
    >
      <motion.div
        className="mb-8"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <img 
          src="/lovable-uploads/dee36671-c662-422f-a9a0-deb2eeb03973.png" 
          alt="SISO Lion Logo" 
          className="w-24 h-24 object-contain rounded-full bg-black/30 p-2 border border-white/10"
          loading="eager"
        />
      </motion.div>

      <motion.h1
        className="text-2xl md:text-3xl lg:text-4xl font-bold mb-8 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <span className="bg-gradient-to-r from-siso-red to-siso-orange bg-clip-text text-transparent">
          Welcome to SISO Resources
        </span>
      </motion.h1>

      <motion.div
        className="w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        role="search"
        aria-label="Search SISO Resources"
      >
        <PlaceholdersAndVanishInput 
          placeholders={searchPlaceholders}
          onChange={handleInputChange}
          onSubmit={handleInputSubmit}
          className="bg-black/30 border-white/10 focus:border-siso-orange/50 text-white placeholder-gray-400"
          aria-label="Search input"
          aria-describedby="search-description"
        />
        <div id="search-description" className="sr-only">
          Type your question or select from suggested queries to get started
        </div>
      </motion.div>
    </motion.div>
  );
};