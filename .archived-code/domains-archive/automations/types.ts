
export type AutomationCategory = 
  | 'all' 
  | 'featured' 
  | 'zapier' 
  | 'make' 
  | 'n8n' 
  | 'linkedin' 
  | 'instagram' 
  | 'x' 
  | 'reddit'
  | 'youtube'
  | 'tiktok'
  | 'general';

export interface Automation {
  id: string;
  name: string;
  description: string;
  category: string;
  platform: string;
  complexity: string;
  setup_guide: string;
  integration_time: string;
  integration_url?: string;
  profile_image_url?: string;
}
