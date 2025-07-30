
import { ReactNode } from 'react';

export interface TabContent {
  badge: string;
  title: string;
  description: string;
  buttonText: string;
  imageSrc: string;
  imageAlt: string;
}

export interface Tab {
  value: string;
  icon: ReactNode;
  label: string;
  content: TabContent;
}

export interface ResourceHubProps {
  badge?: string;
  heading?: string;
  description?: string;
  tabs?: Tab[];
}

export interface CardStats {
  mainStat: string;
  mainLabel: string;
  secondaryStat: string;
  secondaryLabel: string;
  benefits: string[];
}
