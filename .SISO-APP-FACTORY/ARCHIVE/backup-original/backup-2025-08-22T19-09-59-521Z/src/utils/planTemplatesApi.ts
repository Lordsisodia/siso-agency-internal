import { supabase } from '@/integrations/supabase/client';

export interface PlanTemplate {
  id: string;
  title: string;
  slug: string;
  raw_content: string;
  formatted_content: any;
  meta_data: any;
  created_by: string;
  created_at: string;
  updated_at: string;
  is_public: boolean;
  view_count: number;
  status: 'active' | 'archived' | 'draft';
}

export interface CreatePlanTemplateData {
  title: string;
  raw_content: string;
  formatted_content?: any;
  meta_data?: any;
  is_public?: boolean;
  status?: 'active' | 'archived' | 'draft';
}

// Auto-formatting patterns for ChatGPT content
export const formatPatterns = {
  // Headers (##, ###, or **Header**)
  headers: /^(#{1,6}|(?:\*\*.*\*\*))(.+)$/gm,
  
  // Numbered lists
  numberedLists: /^\d+\.\s+(.+)$/gm,
  
  // Bullet points
  bulletPoints: /^[•\-\*]\s+(.+)$/gm,
  
  // Bold text
  boldText: /\*\*(.*?)\*\*/g,
  
  // Common sections
  sections: {
    overview: /(?:project\s+overview|overview|summary)/i,
    features: /(?:features|key\s+features|functionality)/i,
    timeline: /(?:timeline|phases|schedule|milestones)/i,
    pricing: /(?:pricing|cost|investment|budget)/i,
    contact: /(?:contact|next\s+steps|get\s+started)/i
  }
};

// Auto-format ChatGPT content into structured sections
export const autoFormatContent = (rawContent: string) => {
  const lines = rawContent.split('\n').filter(line => line.trim());
  const sections: any = {};
  let currentSection = 'overview';
  let currentContent: string[] = [];

  const detectSection = (line: string): string | null => {
    const lowerLine = line.toLowerCase();
    for (const [sectionKey, pattern] of Object.entries(formatPatterns.sections)) {
      if (pattern.test(lowerLine)) {
        return sectionKey;
      }
    }
    return null;
  };

  const processCurrentSection = () => {
    if (currentContent.length > 0) {
      sections[currentSection] = {
        type: currentSection,
        content: currentContent.join('\n'),
        items: extractListItems(currentContent.join('\n'))
      };
    }
  };

  lines.forEach((line) => {
    const detectedSection = detectSection(line);
    
    if (detectedSection) {
      // Save previous section
      processCurrentSection();
      
      // Start new section
      currentSection = detectedSection;
      currentContent = [];
    } else {
      currentContent.push(line);
    }
  });

  // Process final section
  processCurrentSection();

  return {
    sections,
    formatted_html: generateFormattedHTML(sections),
    summary: generateSummary(sections)
  };
};

// Extract list items from content
const extractListItems = (content: string): string[] => {
  const items: string[] = [];
  const lines = content.split('\n');
  
  lines.forEach(line => {
    // Check for numbered lists
    const numberedMatch = line.match(/^\d+\.\s+(.+)$/);
    if (numberedMatch) {
      items.push(numberedMatch[1]);
      return;
    }
    
    // Check for bullet points
    const bulletMatch = line.match(/^[•\-\*]\s+(.+)$/);
    if (bulletMatch) {
      items.push(bulletMatch[1]);
      return;
    }
  });
  
  return items;
};

// Generate formatted HTML from sections
const generateFormattedHTML = (sections: any): string => {
  let html = '';
  
  const sectionOrder = ['overview', 'features', 'timeline', 'pricing', 'contact'];
  const sectionTitles = {
    overview: '📋 Project Overview',
    features: '✨ Key Features',
    timeline: '📅 Timeline & Phases',
    pricing: '💰 Investment',
    contact: '📞 Next Steps'
  };

  sectionOrder.forEach(sectionKey => {
    const section = sections[sectionKey];
    if (!section) return;

    html += `<div class="section-${sectionKey}">`;
    html += `<h2>${sectionTitles[sectionKey]}</h2>`;
    
    if (section.items && section.items.length > 0) {
      html += '<ul>';
      section.items.forEach((item: string) => {
        html += `<li>${item}</li>`;
      });
      html += '</ul>';
    } else {
      html += `<p>${section.content.replace(/\n/g, '<br>')}</p>`;
    }
    
    html += '</div>';
  });

  return html;
};

// Generate summary for the plan
const generateSummary = (sections: any): string => {
  const overview = sections.overview?.content || '';
  const features = sections.features?.items || [];
  
  let summary = '';
  if (overview) {
    summary += overview.split('\n')[0]; // First line of overview
  }
  if (features.length > 0) {
    summary += ` Features include: ${features.slice(0, 3).join(', ')}`;
    if (features.length > 3) {
      summary += ` and ${features.length - 3} more`;
    }
  }
  
  return summary.substring(0, 200) + (summary.length > 200 ? '...' : '');
};

// Generate unique slug from title
export const generateSlug = async (title: string): Promise<string> => {
  const { data, error } = await supabase
    .rpc('generate_plan_slug', { plan_title: title });
  
  if (error) {
    console.error('Error generating slug:', error);
    // Fallback slug generation
    return title.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim('-') + '-' + Date.now();
  }
  
  return data;
};

// API Functions
export const planTemplatesApi = {
  // Get all plan templates for current user
  async getAll(): Promise<PlanTemplate[]> {
    const { data, error } = await supabase
      .from('plan_templates')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Get plan template by ID
  async getById(id: string): Promise<PlanTemplate | null> {
    const { data, error } = await supabase
      .from('plan_templates')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get plan template by slug (public access)
  async getBySlug(slug: string): Promise<PlanTemplate | null> {
    const { data, error } = await supabase
      .from('plan_templates')
      .select('*')
      .eq('slug', slug)
      .eq('is_public', true)
      .eq('status', 'active')
      .single();
    
    if (error) throw error;
    
    // Increment view count
    if (data) {
      await supabase
        .from('plan_templates')
        .update({ view_count: data.view_count + 1 })
        .eq('id', data.id);
    }
    
    return data;
  },

  // Create new plan template
  async create(planData: CreatePlanTemplateData): Promise<PlanTemplate> {
    const slug = await generateSlug(planData.title);
    const formatted_content = autoFormatContent(planData.raw_content);
    
    const { data, error } = await supabase
      .from('plan_templates')
      .insert({
        ...planData,
        slug,
        formatted_content
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update plan template
  async update(id: string, updates: Partial<CreatePlanTemplateData>): Promise<PlanTemplate> {
    let formatted_content;
    if (updates.raw_content) {
      formatted_content = autoFormatContent(updates.raw_content);
    }

    const updateData: any = { ...updates };
    if (formatted_content) {
      updateData.formatted_content = formatted_content;
    }

    const { data, error } = await supabase
      .from('plan_templates')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete plan template
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('plan_templates')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Get plan template stats
  async getStats(): Promise<{ total: number; public: number; views: number }> {
    const { data, error } = await supabase
      .from('plan_templates')
      .select('is_public, view_count');
    
    if (error) throw error;
    
    const total = data?.length || 0;
    const publicPlans = data?.filter(p => p.is_public).length || 0;
    const totalViews = data?.reduce((sum, p) => sum + (p.view_count || 0), 0) || 0;
    
    return { total, public: publicPlans, views: totalViews };
  }
}; 