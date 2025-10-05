import { LucideIcon } from 'lucide-react';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  loading?: boolean;
  steps?: {
    thinking?: string;
    searching?: string;
    processing?: string;
    response?: string;
  };
}

export interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}