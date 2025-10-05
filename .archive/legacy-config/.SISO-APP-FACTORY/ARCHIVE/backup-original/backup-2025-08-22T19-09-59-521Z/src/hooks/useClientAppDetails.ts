import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePlanData, PlanDataType } from '@/hooks/usePlanData';
import { useClientDetails } from '@/hooks/client/useClientDetails';
import { ClientData } from '@/types/client.types';

interface ClientAppDetailsResult {
  appData: PlanDataType | null;
  clientData: ClientData | null;
  loading: boolean;
  error: Error | null;
}

// Project data for real projects from the leaderboard
const getProjectData = (projectId: string): PlanDataType => {
  const projectsData = {
    'project-1': {
      id: 'project-1',
      username: 'optimal-construction',
      company_name: 'Optimal Construction',
      app_name: 'Optimal Construction',
      description: 'A comprehensive building maintenance and construction management platform.',
      features: [
        'Project Timeline Management',
        'Estimating & Invoicing',
        'Team Coordination',
        'Client Portal',
        'Document Management'
      ],
      estimated_cost: 15000,
      estimated_days: 90,
      website_url: 'https://optimal-building-maintenance.vercel.app/',
      status: 'in_progress',
      branding: {
        primary_color: '#3182CE',
        secondary_color: '#805AD5'
      },
      industry_type: 'construction'
    },
    'project-2': {
      id: 'project-2',
      username: 'ubahcryp',
      company_name: 'UbahCryp',
      app_name: 'UbahCryp',
      description: 'Cryptocurrency trading and portfolio management platform.',
      features: [
        'Real-time Market Data',
        'Portfolio Tracking',
        'Trading Automation',
        'Security Features',
        'Analytics Dashboard'
      ],
      estimated_cost: 5000,
      estimated_days: 60,
      website_url: 'https://ubahcrypcom.vercel.app/',
      status: 'completed',
      branding: {
        primary_color: '#38A169',
        secondary_color: '#D69E2E'
      },
      industry_type: 'finance'
    },
    'project-3': {
      id: 'project-3',
      username: 'gritness',
      company_name: 'Gritness',
      app_name: 'Gritness',
      description: 'Fitness studio management platform with class scheduling and member management.',
      features: [
        'Class Scheduling',
        'Member Management',
        'Payment Processing',
        'Digital Waivers',
        'Trainer Portal'
      ],
      estimated_cost: 249,
      estimated_days: 30,
      website_url: 'https://gritnessgym.vercel.app/',
      status: 'in_progress',
      branding: {
        primary_color: '#E53E3E',
        secondary_color: '#2D3748'
      },
      industry_type: 'fitness'
    },
    'project-4': {
      id: 'project-4',
      username: 'trojan-mma',
      company_name: 'Trojan MMA',
      app_name: 'Trojan MMA',
      description: 'MMA gym management platform with membership and competition tracking.',
      features: [
        'Member Management',
        'Competition Tracking',
        'Training Plans',
        'Progress Tracking',
        'Communication Portal'
      ],
      estimated_cost: 249,
      estimated_days: 30,
      website_url: 'https://trojan-mma.vercel.app/',
      status: 'in_progress',
      branding: {
        primary_color: '#DD6B20',
        secondary_color: '#1A202C'
      },
      industry_type: 'fitness'
    },
    'project-5': {
      id: 'project-5',
      username: 'lets-go',
      company_name: 'Lets Go',
      app_name: 'Lets Go',
      description: 'Travel planning and management app for adventure seekers.',
      features: [
        'Trip Planning',
        'Itinerary Creation',
        'Location Sharing',
        'Budget Tracking',
        'Photo Albums'
      ],
      estimated_cost: 249,
      estimated_days: 30,
      website_url: 'https://lets-go-u7hh.vercel.app/',
      status: 'near_complete',
      branding: {
        primary_color: '#3182CE',
        secondary_color: '#48BB78'
      },
      industry_type: 'travel'
    },
    'project-6': {
      id: 'project-6',
      username: 'nm-construction',
      company_name: 'NM Construction',
      app_name: 'NM Construction',
      description: 'Construction project management and client communication platform.',
      features: [
        'Project Planning',
        'Resource Management',
        'Client Communication',
        'Document Sharing',
        'Progress Tracking'
      ],
      estimated_cost: 0,
      estimated_days: 60,
      website_url: 'https://nm-construction.vercel.app/',
      status: 'in_progress',
      branding: {
        primary_color: '#F6E05E',
        secondary_color: '#4A5568'
      },
      industry_type: 'construction'
    }
  };

  return projectsData[projectId as keyof typeof projectsData] || {
    id: projectId,
    username: 'custom-project',
    company_name: 'Custom Project',
    app_name: 'Custom Project',
    description: 'A custom development project.',
    features: ['Feature 1', 'Feature 2', 'Feature 3'],
    estimated_cost: 0,
    estimated_days: 0,
    status: 'pending',
    branding: {
      primary_color: '#3182CE',
      secondary_color: '#805AD5'
    },
    industry_type: 'other'
  };
};

const getMockAppData = (userId: string): PlanDataType => {
  // Generate consistent mock data based on user ID
  const mockData = {
    'user-1': {
      app_name: 'FitFlow Manager',
      description: 'A comprehensive gym management platform with member tracking, class scheduling, and payment processing.',
      features: [
        'Member Management & Tracking',
        'Class Scheduling System',
        'Payment Processing',
        'Attendance Tracking',
        'Performance Analytics'
      ],
      estimated_cost: 7500,
      estimated_days: 45,
      status: 'active'
    },
    'user-2': {
      app_name: 'CreatorHub Studio',
      description: 'All-in-one content creator management platform for OnlyFans creators and agencies.',
      features: [
        'Content Calendar',
        'Analytics Dashboard',
        'Automated Scheduling',
        'Revenue Tracking',
        'Chat Management'
      ],
      estimated_cost: 12000,
      estimated_days: 60,
      status: 'in_progress'
    },
    'user-3': {
      app_name: 'Agency Suite Pro',
      description: 'Complete agency management solution for digital marketing and creative agencies.',
      features: [
        'Project Management',
        'Client Portal',
        'Team Collaboration',
        'Resource Planning',
        'Invoicing System'
      ],
      estimated_cost: 9500,
      estimated_days: 50,
      status: 'completed'
    }
  };

  const defaultData = {
    app_name: 'Custom Business Suite',
    description: 'Tailored business management platform designed to streamline operations and boost efficiency.',
    features: [
      'User Management',
      'Dashboard Analytics',
      'Task Management',
      'Reporting System',
      'Client Communication'
    ],
    estimated_cost: 5000,
    estimated_days: 30,
    status: 'pending'
  };

  const mockEntry = mockData[userId as keyof typeof mockData] || defaultData;

  return {
    id: userId,
    username: userId,
    company_name: `Company ${userId.split('-')[1]}`,
    ...mockEntry,
    branding: {
      primary_color: '#3182CE',
      secondary_color: '#805AD5'
    },
    industry_type: 'software'
  };
};

const getProjectClientData = (projectId: string): ClientData => {
  // Extract project number and map to milestone data
  const projectNum = projectId.split('-')[1];
  const milestoneMap = {
    '1': { currentStep: 4, totalSteps: 8 }, // Optimal Construction
    '2': { currentStep: 8, totalSteps: 8 }, // UbahCryp
    '3': { currentStep: 6, totalSteps: 8 }, // Gritness
    '4': { currentStep: 6, totalSteps: 8 }, // Trojan MMA
    '5': { currentStep: 7, totalSteps: 8 }, // Lets Go
    '6': { currentStep: 4, totalSteps: 8 }, // NM Construction
  };
  
  const milestone = milestoneMap[projectNum as keyof typeof milestoneMap] || { currentStep: 0, totalSteps: 8 };
  
  // Mapping project IDs to client names from the leaderboard
  const nameMap = {
    '1': 'Optimal Construction',
    '2': 'UbahCryp',
    '3': 'Gritness',
    '4': 'Trojan MMA',
    '5': 'Lets Go',
    '6': 'NM Construction'
  };
  
  const clientName = nameMap[projectNum as keyof typeof nameMap] || `Project ${projectNum}`;

  return {
    id: projectId,
    full_name: clientName,
    email: `info@${clientName.toLowerCase().replace(/\s+/g, '-')}.com`,
    business_name: clientName,
    phone: null,
    avatar_url: null,
    status: 'active',
    current_step: milestone.currentStep,
    total_steps: milestone.totalSteps,
    completed_steps: Array(milestone.currentStep).fill('').map((_, i) => `step-${i+1}`),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    website_url: null,
    professional_role: 'Business Owner',
    bio: null,
    project_name: clientName,
    company_niche: 'Construction & Development',
    development_url: null,
    mvp_build_status: null,
    notion_plan_url: null,
    payment_status: null,
    estimated_price: null,
    initial_contact_date: null,
    start_date: null,
    estimated_completion_date: null,
    todos: [],
    next_steps: null,
    key_research: null,
    priority: null,
    contact_name: null,
    company_name: null
  };
};

const getMockClientData = (userId: string): ClientData => {
  return {
    id: userId,
    full_name: `Demo User ${userId.split('-')[1]}`,
    email: `user${userId.split('-')[1]}@example.com`,
    business_name: `Business ${userId.split('-')[1]}`,
    phone: null,
    avatar_url: null,
    status: 'active',
    current_step: 3,
    total_steps: 5,
    completed_steps: ['setup', 'design', 'development'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    website_url: null,
    professional_role: 'Business Owner',
    bio: null,
    project_name: null,
    company_niche: 'Technology',
    development_url: null,
    mvp_build_status: null,
    notion_plan_url: null,
    payment_status: null,
    estimated_price: null,
    initial_contact_date: null,
    start_date: null,
    estimated_completion_date: null,
    todos: [],
    next_steps: null,
    key_research: null,
    priority: null,
    contact_name: null,
    company_name: null
  };
};

export function useClientAppDetails(clientId?: string | null): ClientAppDetailsResult {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [username, setUsername] = useState<string | undefined>(undefined);
  
  // Use existing hooks
  const { clientData: realClientData, loading: clientLoading } = useClientDetails(clientId);
  const { planData, loading: planLoading } = usePlanData(username);

  useEffect(() => {
    if (!clientId) {
      setLoading(false);
      setError(new Error('No client ID provided'));
      return;
    }

    // For mock data (user-1, user-2, etc), skip the real data fetch
    if (clientId.startsWith('user-') || clientId.startsWith('project-')) {
      setUsername(clientId);
      setLoading(false);
      return;
    }

    const fetchUsername = async () => {
      if (!clientId) return;
      
      try {
        // Try to find a corresponding plan by looking up the client ID
        const { data, error } = await supabase
          .from('client_user_links')
          .select('user_id')
          .eq('client_id', clientId)
          .maybeSingle();
          
        if (error) {
          console.error('Error fetching user link:', error);
          return;
        }
        
        if (data?.user_id) {
          // Now get the profile for this user
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', data.user_id)
            .maybeSingle();
            
          if (profileError) {
            console.error('Error fetching profile:', profileError);
            return;
          }
          
          // Use client business name as username for plan lookup
          if (realClientData?.business_name) {
            const formattedUsername = realClientData.business_name.toLowerCase().replace(/\s+/g, '-');
            setUsername(formattedUsername);
          }
        }
      } catch (err) {
        console.error('Error in fetchUsername:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
      }
    };

    if (realClientData && !username) {
      fetchUsername();
    }
  }, [clientId, realClientData, username]);

  // Combine loading states
  useEffect(() => {
    setLoading(clientLoading || planLoading || !username);
    
  }, [clientLoading, planLoading, username]);

  return {
    // Return data based on ID type
    appData: clientId?.startsWith('user-') 
      ? getMockAppData(clientId) 
      : clientId?.startsWith('project-')
        ? getProjectData(clientId)
        : planData,
    clientData: clientId?.startsWith('user-') 
      ? getMockClientData(clientId) 
      : clientId?.startsWith('project-')
        ? getProjectClientData(clientId)
        : realClientData,
    loading: loading || (clientLoading && planLoading),
    error
  };
}
