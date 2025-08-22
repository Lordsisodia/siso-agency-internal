
import { Bot, Brain, Network, Newspaper, PlayCircle, Sparkles } from 'lucide-react';
import { AgentCategory } from '@/types/chat';

export const agentThoughts: Record<AgentCategory | 'initial' | 'context' | 'synthesis', string[]> = {
  'initial': [
    "Analyzing query intent...",
    "Extracting key topics...",
    "Determining context...",
  ],
  'context': [
    "Applying agency context...",
    "Checking industry relevance...",
    "Identifying specific needs...",
  ],
  'ai-tools': [
    "Scanning AI tool database...",
    "Matching tools to needs...",
    "Ranking by relevance...",
  ],
  'videos': [
    "Searching educational content...",
    "Filtering by topic...",
    "Finding best tutorials...",
  ],
  'networking': [
    "Identifying communities...",
    "Finding industry experts...",
    "Locating discussions...",
  ],
  'assistants': [
    "Matching assistant types...",
    "Evaluating capabilities...",
    "Preparing recommendations...",
  ],
  'educators': [
    "Finding learning resources...",
    "Checking expertise levels...",
    "Curating content...",
  ],
  'news': [
    "Scanning recent updates...",
    "Finding relevant trends...",
    "Analyzing impact...",
  ],
  'synthesis': [
    "Combining insights...",
    "Organizing information...",
    "Preparing response...",
  ],
};

export const agentIcons: Record<AgentCategory, typeof Bot> = {
  'ai-tools': Sparkles,
  'videos': PlayCircle,
  'networking': Network,
  'assistants': Bot,
  'educators': Brain,
  'news': Newspaper,
};

export const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
};

export const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};
