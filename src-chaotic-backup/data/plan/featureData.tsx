import React from 'react';
import { FeatureCategory, FeatureItem, Feature, PlanTier } from '@/models/plan/features';
import { 
  Users, 
  FileText, 
  MessageSquare, 
  BarChart, 
  Shield, 
  Settings,
  Tag,
  Smartphone,
  Zap,
  Heart,
  Target,
  Calendar,
  BookOpen,
  CheckSquare,
  UserCog,
  DollarSign,
  File, // Replaced FileContract with File
  UserPlus,
  Share2,
  Clipboard,
  Lightbulb,
  HelpCircle,
  GraduationCap,
  Plug
} from 'lucide-react';

// Define model-facing feature categories
export const modelFacingCategories: FeatureCategory[] = [
  {
    id: 'profile',
    name: 'Profile Management',
    icon: <Users className="h-5 w-5" />,
    userFacing: 'model',
    description: 'Tools for models to manage their profiles and information',
    features: [
      { 
        id: 'model-profile', 
        name: 'Profile Management', 
        description: 'View and update profiles with details like hobbies and communication style',
        timeEstimate: 1,
        category: 'profile',
        tier: 'mvp',
        userFacing: 'model',
        recommended: true
      },
      { 
        id: 'profile-customization', 
        name: 'Profile Customization', 
        description: 'Personalize profile with photos, bio, and preferences',
        timeEstimate: 0.5,
        category: 'profile',
        tier: 'mvp',
        userFacing: 'model'
      }
    ]
  },
  {
    id: 'tasks',
    name: 'To-Do Lists',
    icon: <CheckSquare className="h-5 w-5" />,
    userFacing: 'model',
    description: 'Task management tools for daily productivity',
    features: [
      { 
        id: 'daily-tasks', 
        name: 'Daily To-Do Lists', 
        description: 'Manage daily tasks to stay focused and productive',
        timeEstimate: 1,
        category: 'tasks',
        tier: 'mvp',
        userFacing: 'model',
        recommended: true
      },
      { 
        id: 'weekly-monthly-tasks', 
        name: 'Weekly & Monthly Tasks', 
        description: 'Plan longer-term tasks and goals',
        timeEstimate: 0.5,
        category: 'tasks',
        tier: 'advanced',
        userFacing: 'model'
      }
    ]
  },
  {
    id: 'performance',
    name: 'Targets & Performance',
    icon: <Target className="h-5 w-5" />,
    userFacing: 'model',
    description: 'Track goals and performance metrics',
    features: [
      { 
        id: 'model-targets', 
        name: 'Performance Targets', 
        description: 'View goals like subscription chatting ratios and revenue targets',
        timeEstimate: 1.5,
        category: 'performance',
        tier: 'mvp',
        userFacing: 'model',
        recommended: true,
        roi: 'Increases model performance by 30% through clear goal setting'
      },
      { 
        id: 'subscriber-tracking', 
        name: 'Subscriber Tracking', 
        description: 'Monitor subscriber numbers and growth over time',
        timeEstimate: 1,
        category: 'performance',
        tier: 'mvp',
        userFacing: 'model'
      }
    ]
  },
  {
    id: 'model-communication',
    name: 'Communication',
    icon: <MessageSquare className="h-5 w-5" />,
    userFacing: 'model',
    description: 'Tools for staying in contact with the agency',
    features: [
      { 
        id: 'model-chat', 
        name: 'Agency Chat Channels', 
        description: 'Dedicated chat channels including urgent ones for agency communication',
        timeEstimate: 2,
        category: 'model-communication',
        tier: 'mvp',
        userFacing: 'model',
        recommended: true
      }
    ]
  },
  {
    id: 'calendar',
    name: 'Calendar & Reminders',
    icon: <Calendar className="h-5 w-5" />,
    userFacing: 'model',
    description: 'Schedule management and reminder system',
    features: [
      { 
        id: 'meeting-calendar', 
        name: 'Meeting Calendar', 
        description: 'View scheduled meetings and events',
        timeEstimate: 1.5,
        category: 'calendar',
        tier: 'mvp',
        userFacing: 'model',
        recommended: true
      },
      { 
        id: 'sms-reminders', 
        name: 'SMS Reminders', 
        description: 'Receive SMS notifications before scheduled meetings',
        timeEstimate: 2,
        category: 'calendar',
        tier: 'advanced',
        userFacing: 'model'
      }
    ]
  },
  {
    id: 'learning',
    name: 'Learning Resources',
    icon: <BookOpen className="h-5 w-5" />,
    userFacing: 'model',
    description: 'Educational materials to improve skills',
    features: [
      { 
        id: 'model-guides', 
        name: 'Guides & SOPs', 
        description: 'Access to guides and SOPs to improve skills',
        timeEstimate: 1,
        category: 'learning',
        tier: 'mvp',
        userFacing: 'model'
      },
      { 
        id: 'training-videos', 
        name: 'Training Videos', 
        description: 'Visual learning resources for skill development',
        timeEstimate: 1.5,
        category: 'learning',
        tier: 'advanced',
        userFacing: 'model'
      }
    ]
  }
];

// Define agency-facing feature categories
export const agencyFacingCategories: FeatureCategory[] = [
  {
    id: 'model-management',
    name: 'Model Management',
    icon: <UserCog className="h-5 w-5" />,
    userFacing: 'agency',
    description: 'Tools for managing models and their performance',
    features: [
      { 
        id: 'manage-profiles', 
        name: 'Model Profile Management', 
        description: 'Manage model profiles, set targets, and monitor performance',
        timeEstimate: 2,
        category: 'model-management',
        tier: 'mvp',
        userFacing: 'agency',
        recommended: true,
        roi: 'Centralizes model management, saving 10+ hours per week'
      },
      { 
        id: 'performance-analytics', 
        name: 'Performance Analytics', 
        description: 'Advanced analytics on model performance and earnings',
        timeEstimate: 2.5,
        category: 'model-management',
        tier: 'advanced',
        userFacing: 'agency'
      }
    ]
  },
  {
    id: 'financial',
    name: 'Financial Management',
    icon: <DollarSign className="h-5 w-5" />,
    userFacing: 'agency',
    description: 'Tools for managing finances and payments',
    features: [
      { 
        id: 'expense-tracking', 
        name: 'Expense Tracking', 
        description: 'Track expenses and financial transactions',
        timeEstimate: 1.5,
        category: 'financial',
        tier: 'mvp',
        userFacing: 'agency',
        recommended: true
      },
      { 
        id: 'invoicing', 
        name: 'Invoice Generation', 
        description: 'Create and manage invoices directly from the dashboard',
        timeEstimate: 2,
        category: 'financial',
        tier: 'mvp',
        userFacing: 'agency'
      },
      { 
        id: 'payment-processing', 
        name: 'Payment Processing', 
        description: 'Process payments and track financial histories',
        timeEstimate: 2.5,
        category: 'financial',
        tier: 'advanced',
        userFacing: 'agency'
      }
    ]
  },
  {
    id: 'employee',
    name: 'Employee Management',
    icon: <Users className="h-5 w-5" />,
    userFacing: 'agency',
    description: 'Tools for managing agency staff and chatters',
    features: [
      { 
        id: 'hour-tracking', 
        name: 'Staff Hour Tracking', 
        description: 'Track hours for agency staff and chatters',
        timeEstimate: 1.5,
        category: 'employee',
        tier: 'mvp',
        userFacing: 'agency'
      },
      { 
        id: 'staff-management', 
        name: 'Staff Performance', 
        description: 'Monitor and manage staff performance metrics',
        timeEstimate: 2,
        category: 'employee',
        tier: 'advanced',
        userFacing: 'agency'
      }
    ]
  },
  {
    id: 'contracts',
    name: 'Contract Templating',
    icon: <File className="h-5 w-5" />, // Changed from FileContract to File
    userFacing: 'agency',
    description: 'Contract management and generation tools',
    features: [
      { 
        id: 'contract-generation', 
        name: 'Contract Generation', 
        description: 'Generate contracts for models, staff, and chatters',
        timeEstimate: 2,
        category: 'contracts',
        tier: 'mvp',
        userFacing: 'agency',
        recommended: true
      },
      { 
        id: 'pdf-export', 
        name: 'PDF Export', 
        description: 'Download contracts as ready-to-sign PDFs',
        timeEstimate: 1,
        category: 'contracts',
        tier: 'mvp',
        userFacing: 'agency'
      }
    ]
  },
  {
    id: 'onboarding',
    name: 'Onboarding Process',
    icon: <UserPlus className="h-5 w-5" />,
    userFacing: 'agency',
    description: 'Tools for onboarding new models',
    features: [
      { 
        id: 'model-onboarding', 
        name: 'Model Onboarding', 
        description: 'Streamlined collection and organization of info for new models',
        timeEstimate: 1.5,
        category: 'onboarding',
        tier: 'mvp',
        userFacing: 'agency',
        recommended: true,
        roi: 'Reduces onboarding time by 65%, improving time-to-revenue'
      },
      { 
        id: 'onboarding-automation', 
        name: 'Onboarding Automation', 
        description: 'Automate parts of the onboarding workflow',
        timeEstimate: 2.5,
        category: 'onboarding',
        tier: 'advanced',
        userFacing: 'agency'
      }
    ]
  },
  {
    id: 'social-media',
    name: 'Social Media Management',
    icon: <Share2 className="h-5 w-5" />,
    userFacing: 'agency',
    description: 'Tools for managing social media accounts',
    features: [
      { 
        id: 'login-storage', 
        name: 'Secure Login Storage', 
        description: 'Securely store login details for social media accounts',
        timeEstimate: 1,
        category: 'social-media',
        tier: 'mvp',
        userFacing: 'agency'
      },
      { 
        id: 'outreach-planning', 
        name: 'Outreach Strategy', 
        description: 'Plan and manage social media outreach strategies',
        timeEstimate: 2,
        category: 'social-media',
        tier: 'advanced',
        userFacing: 'agency'
      }
    ]
  },
  {
    id: 'sop',
    name: 'SOP Section',
    icon: <Clipboard className="h-5 w-5" />,
    userFacing: 'agency',
    description: 'Standard Operating Procedures library',
    features: [
      { 
        id: 'sop-library', 
        name: 'SOP Library', 
        description: 'Library of standard operating procedures for staff alignment',
        timeEstimate: 1,
        category: 'sop',
        tier: 'mvp',
        userFacing: 'agency',
        recommended: true
      },
      { 
        id: 'training-materials', 
        name: 'Training Videos', 
        description: 'Training videos for staff development',
        timeEstimate: 1.5,
        category: 'sop',
        tier: 'advanced',
        userFacing: 'agency'
      }
    ]
  },
  {
    id: 'tools',
    name: 'Tool Section',
    icon: <Lightbulb className="h-5 w-5" />,
    userFacing: 'agency',
    description: 'Automation tools and sales resources',
    features: [
      { 
        id: 'automations', 
        name: 'Automations', 
        description: 'Time-saving automations for agency processes',
        timeEstimate: 2.5,
        category: 'tools',
        tier: 'advanced',
        userFacing: 'agency'
      },
      { 
        id: 'sales-resources', 
        name: 'Sales Resources', 
        description: 'Resources to boost revenue and sales',
        timeEstimate: 1.5,
        category: 'tools',
        tier: 'mvp',
        userFacing: 'agency'
      }
    ]
  },
  {
    id: 'agency-communication',
    name: 'Communication',
    icon: <MessageSquare className="h-5 w-5" />,
    userFacing: 'agency',
    description: 'Communication tools for agency staff',
    features: [
      { 
        id: 'agency-chat', 
        name: 'Team Chat Channels', 
        description: 'Multiple chat channels for staff and model communication',
        timeEstimate: 2,
        category: 'agency-communication',
        tier: 'mvp',
        userFacing: 'agency',
        recommended: true
      },
      { 
        id: 'urgent-channel', 
        name: 'Urgent Communication', 
        description: 'Dedicated channels for urgent matters',
        timeEstimate: 1,
        category: 'agency-communication',
        tier: 'mvp',
        userFacing: 'agency'
      }
    ]
  },
  {
    id: 'course',
    name: 'Course Section',
    icon: <GraduationCap className="h-5 w-5" />,
    userFacing: 'agency',
    description: 'Learning materials for agency growth',
    features: [
      { 
        id: 'learning-materials', 
        name: 'Learning Materials', 
        description: 'Access to courses and videos for agency scaling',
        timeEstimate: 1.5,
        category: 'course',
        tier: 'advanced',
        userFacing: 'agency'
      },
      { 
        id: 'growth-resources', 
        name: 'Growth Resources', 
        description: 'Resources to scale the agency to 100x',
        timeEstimate: 1,
        category: 'course',
        tier: 'premium',
        userFacing: 'agency'
      }
    ]
  },
  {
    id: 'integrations',
    name: 'Future Integrations',
    icon: <Plug className="h-5 w-5" />,
    userFacing: 'agency',
    description: 'Planned API integrations for growth',
    features: [
      { 
        id: 'dm-automation', 
        name: 'DM Automation', 
        description: 'Automate direct messages via API integrations',
        timeEstimate: 3,
        category: 'integrations',
        tier: 'premium',
        userFacing: 'agency'
      },
      { 
        id: 'whatsapp-integration', 
        name: 'WhatsApp Integration', 
        description: 'Connect WhatsApp for streamlined communication',
        timeEstimate: 3.5,
        category: 'integrations',
        tier: 'premium',
        userFacing: 'agency'
      }
    ]
  }
];

// Shared features category
export const sharedFeatureCategories: FeatureCategory[] = [
  {
    id: 'help',
    name: 'Help Center',
    icon: <HelpCircle className="h-5 w-5" />,
    userFacing: 'both',
    description: 'Support hub for both models and agency staff',
    features: [
      { 
        id: 'support-hub', 
        name: 'Support Hub', 
        description: 'Access to answers and tool links for troubleshooting',
        timeEstimate: 1.5,
        category: 'help',
        tier: 'mvp',
        userFacing: 'both',
        recommended: true
      },
      { 
        id: 'quick-guides', 
        name: 'Quick Guides', 
        description: 'Easy access to common questions and solutions',
        timeEstimate: 1,
        category: 'help',
        tier: 'mvp',
        userFacing: 'both'
      }
    ]
  }
];

// Combine all categories for backward compatibility
export const featureCategories: FeatureCategory[] = [
  ...modelFacingCategories,
  ...agencyFacingCategories,
  ...sharedFeatureCategories
];

export const additionalFeatures: Feature[] = [
  {
    id: 'white-label',
    name: 'White Label Branding',
    description: 'Remove all Siso branding and use your own logo and colors throughout the platform.',
    price: 1200,
    included: false
  },
  {
    id: 'mobile-apps',
    name: 'Native Mobile Apps',
    description: 'iOS and Android mobile apps for your team and clients to access the platform on the go.',
    price: 2500,
    included: false
  },
  {
    id: 'api-integration',
    name: 'Custom API Integrations',
    description: 'Connect with additional platforms and services beyond our standard integrations.',
    price: 1800,
    included: false
  },
  {
    id: 'ai-insights',
    name: 'AI Content Insights',
    description: 'Advanced AI tools to analyze content performance and suggest improvements.',
    price: 1500,
    included: false
  },
  {
    id: 'premium-support',
    name: 'Premium Support Package',
    description: '24/7 dedicated support team with 1-hour response time and monthly strategy calls.',
    price: 950,
    included: false
  }
];

export const planTiers: PlanTier[] = [
  {
    id: 'mvp',
    name: 'MVP',
    price: 0,
    maxFeatures: 10,
    timeline: '90 days',
    supportLevel: 'Standard',
    description: 'Essential features included in the base price to get your platform up and running.',
  },
  {
    id: 'advanced',
    name: 'Advanced',
    price: 249,
    maxFeatures: 'Unlimited',
    timeline: '60 days',
    supportLevel: 'Standard',
    description: 'Enhanced functionality to improve user experience and operational efficiency.',
    recommended: true
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 499,
    maxFeatures: 'All Features',
    timeline: '21 days',
    supportLevel: 'Priority',
    description: 'Premium capabilities for maximum customization and competitive advantage.',
  }
];

export const caseStudies = [
  {
    title: 'OnlyFans Management Platform for Agency X',
    description: 'How we helped Agency X increase their client retention by 40% and double their revenue with our custom platform.',
    imageUrl: '/lovable-uploads/c7ac43fd-bc3e-478d-8b4f-809beafb6838.png',
    notionUrl: 'https://www.notion.so/Case-Study-OnlyFans-Management-Platform-123456'
  },
  {
    title: 'Creator Content Management System',
    description: 'A dedicated content scheduling and management system that improved workflow efficiency by 60%.',
    imageUrl: '/lovable-uploads/1f9eba1e-c2af-4ed8-84e7-a375872c9182.png',
    notionUrl: 'https://www.notion.so/Case-Study-Content-Management-System-789012'
  },
  {
    title: 'Fan Engagement & Analytics Dashboard',
    description: 'How our analytics tools helped boost fan engagement and increase subscription renewal rates.',
    imageUrl: '/lovable-uploads/19ca8c73-3736-4506-bfb2-de867b272e12.png',
    notionUrl: 'https://www.notion.so/Case-Study-Fan-Engagement-Analytics-345678'
  }
];
