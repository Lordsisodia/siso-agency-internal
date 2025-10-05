
import { LucideIcon } from 'lucide-react';

export interface TaskRequirements {
  description?: string;
  [key: string]: any;
}

export interface EarningTask {
  action: string;
  points: string;
  cooldown_minutes?: number;
  requirements?: TaskRequirements;
}

export interface EarningSection {
  title: string;
  icon: LucideIcon;
  description: string;
  items: EarningTask[];
}

export interface HeaderProps {
  navigate: (path: string) => void;
}

export interface MainContentProps {
  selectedCategory: number;
  setSelectedCategory: (index: number) => void;
  pointConfigs: any[];
  isLoading: boolean;
}
