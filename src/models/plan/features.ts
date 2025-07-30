
import { ReactNode } from 'react';

export interface FeatureCategory {
  id: string;
  name: string;
  icon: ReactNode;
  features: FeatureItem[];
  info?: string;  // Make info optional
  description?: string; // Keep description for backward compatibility
  userFacing?: 'model' | 'agency' | 'both'; // Add new property to indicate target user
}

export interface FeatureItem {
  id: string;
  name: string;
  description: string;
  timeEstimate: number;
  category: string;
  tier: 'mvp' | 'advanced' | 'premium';
  recommended?: boolean;
  included?: boolean;
  roi?: string;
  userFacing?: 'model' | 'agency' | 'both'; // Add new property to indicate target user
}

// Add these interfaces to support src/data/plan/featureData.tsx
export interface Feature {
  id: string;
  name: string;
  description: string;
  price: number;
  included: boolean;
}

export interface PlanTier {
  id: string;
  name: string;
  price: number;
  maxFeatures: number | string;
  timeline: string;
  supportLevel: string;
  description: string;
  recommended?: boolean;
}
