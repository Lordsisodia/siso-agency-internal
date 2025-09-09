
export interface ResearchDocument {
  id: string;
  title: string;
  description: string;
  category: string;
  created_at: string;
  updated_at: string;
  tags: string[];
  fileUrl?: string;
  insights?: string[];
  nextSteps?: string[];
  code_snippet?: string;
  isPinned?: boolean;
}
