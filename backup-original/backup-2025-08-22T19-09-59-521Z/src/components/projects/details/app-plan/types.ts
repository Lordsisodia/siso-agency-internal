
import { ReactNode } from 'react';

export interface PhaseSubsection {
  id: string;
  title: string;
  content: ReactNode | string;
  bestPractices?: string[];
  actionableSteps?: string[];
  expectedOutcomes?: string[];
  notionUrl?: string; // Added notion URL property
}

export interface PhaseData {
  id: string;
  title: string;
  description: string;
  subsections: PhaseSubsection[];
}
