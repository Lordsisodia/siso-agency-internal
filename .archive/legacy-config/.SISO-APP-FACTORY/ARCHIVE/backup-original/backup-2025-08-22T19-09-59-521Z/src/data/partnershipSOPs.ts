import { 
  Network, 
  Linkedin, 
  Instagram, 
  UserPlus,
  MessageSquare,
  Target,
  Users,
  TrendingUp
} from 'lucide-react';

export interface SOPSection {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'checklist' | 'tips' | 'warning' | 'example';
  items?: string[];
}

export interface SOPTemplate {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  timeToRead: string;
  successRate: string;
  sections: SOPSection[];
  resources: {
    title: string;
    description: string;
    url: string;
    type: 'template' | 'video' | 'article' | 'tool';
  }[];
  keyTakeaways: string[];
  nextSteps: string[];
}

export const partnershipSOPs: Record<string, SOPTemplate> = {
  'internal-network-sop': {
    title: 'Internal Network Outreach',
    description: 'Leverage your existing professional network to generate high-quality referrals with warm introductions.',
    icon: Network,
    difficulty: 'Beginner',
    timeToRead: '8 min',
    successRate: '67%',
    sections: [
      {
        id: 'overview',
        title: 'Understanding Internal Network Outreach',
        type: 'text',
        content: 'Your internal network consists of colleagues, former coworkers, business associates, and professional contacts who already know and trust you. This warm network is your most valuable asset for generating high-quality referrals because introductions come with built-in credibility and trust.'
      },
      {
        id: 'network-mapping',
        title: 'Mapping Your Network',
        type: 'checklist',
        content: 'Before reaching out, systematically identify and categorize your network contacts:',
        items: [
          'Current and former colleagues from all previous jobs',
          'Business partners and vendors you\'ve worked with',
          'Professional associations and industry contacts',
          'Alumni networks from schools and programs',
          'Clients from previous roles or businesses',
          'Consultants, freelancers, and service providers you\'ve hired',
          'Industry peers from conferences and networking events'
        ]
      },
      {
        id: 'qualification',
        title: 'Qualifying Your Network Contacts',
        type: 'tips',
        content: 'Not all network contacts are equal for referral purposes. Focus on those who:',
        items: [
          'Work in industries that need our services (tech, e-commerce, SaaS)',
          'Hold decision-making positions or influence',
          'Have entrepreneurial or business development roles',
          'Run their own businesses or startups',
          'Work at growing companies that might need development services',
          'Have previously shown interest in tech or digital solutions'
        ]
      },
      {
        id: 'outreach-template',
        title: 'The Perfect Internal Network Message',
        type: 'example',
        content: 'Here\'s a proven template for reaching out to your network:',
        items: [
          'Subject: Quick catch-up + exciting partnership opportunity',
          'Hey [Name], hope you\'re doing well at [Company]!',
          'I wanted to reach out because I\'ve partnered with SISO Agency to help refer development projects to them.',
          'Given your role at [Company], I thought you might know businesses that could use custom web apps, mobile apps, or e-commerce solutions.',
          'SISO has an incredible track record, and I earn a commission for successful referrals.',
          'Would love to catch up and see if there\'s anyone in your network who might be a good fit.',
          'Let me know if you\'d like to chat over coffee/zoom this week!'
        ]
      },
      {
        id: 'follow-up',
        title: 'Follow-up Strategy',
        type: 'checklist',
        content: 'Systematic follow-up is crucial for network outreach success:',
        items: [
          'Send initial message and wait 3-5 business days',
          'First follow-up: "Just wanted to make sure you saw my message..."',
          'Second follow-up after 1 week: Share a specific case study or success story',
          'Third follow-up after 2 weeks: Offer something of value (industry report, introduction)',
          'Final follow-up after 1 month: "Last message, but thought you\'d find this interesting..."',
          'Track all interactions in your CRM or spreadsheet'
        ]
      },
      {
        id: 'value-proposition',
        title: 'Making the Value Clear',
        type: 'tips',
        content: 'When talking to your network, emphasize these key points:',
        items: [
          'You\'re not asking them to buy anything - just introductions',
          'SISO provides free consultations and project scoping',
          'Their referrals help their contacts get better development solutions',
          'You handle all the work - they just make introductions',
          'Success stories and case studies from previous projects',
          'Specific types of projects SISO excels at'
        ]
      },
      {
        id: 'warning',
        title: 'Common Mistakes to Avoid',
        type: 'warning',
        content: 'Avoid these pitfalls that can damage your network relationships:',
        items: [
          'Don\'t lead with the commission - focus on helping businesses',
          'Don\'t spam your entire network with the same generic message',
          'Don\'t forget to catch up personally before diving into business',
          'Don\'t pressure for immediate responses or referrals',
          'Don\'t ignore the relationship after getting a referral',
          'Don\'t overpromise what SISO can deliver'
        ]
      }
    ],
    resources: [
      {
        title: 'Network Mapping Template',
        description: 'Spreadsheet template to organize and track your network contacts',
        url: '/templates/network-mapping.xlsx',
        type: 'template'
      },
      {
        title: 'Internal Network Outreach Scripts',
        description: 'Collection of proven email and message templates',
        url: '/templates/network-outreach-scripts.pdf',
        type: 'template'
      },
      {
        title: 'SISO Case Studies Pack',
        description: 'Success stories to share with your network',
        url: '/resources/case-studies.pdf',
        type: 'article'
      },
      {
        title: 'CRM for Network Management',
        description: 'Recommended tools for tracking your network interactions',
        url: 'https://hubspot.com',
        type: 'tool'
      }
    ],
    keyTakeaways: [
      'Your existing network is your most valuable referral source',
      'Warm introductions have 3x higher conversion rates than cold outreach',
      'Focus on relationships first, business opportunities second',
      'Systematic tracking and follow-up increases success by 40%',
      'Quality of contacts matters more than quantity'
    ],
    nextSteps: [
      'Complete your network mapping exercise',
      'Identify your top 20 highest-potential contacts',
      'Craft personalized messages for your first 5 contacts',
      'Send initial outreach messages',
      'Set up tracking system for follow-ups',
      'Schedule regular network maintenance activities'
    ]
  },

  'linkedin-outreach-sop': {
    title: 'LinkedIn Outreach Mastery',
    description: 'Professional LinkedIn outreach strategies to connect with decision-makers and generate qualified leads.',
    icon: Linkedin,
    difficulty: 'Intermediate',
    timeToRead: '12 min',
    successRate: '28%',
    sections: [
      {
        id: 'profile-optimization',
        title: 'Optimizing Your LinkedIn Profile',
        type: 'checklist',
        content: 'Your profile is your first impression. Optimize it for partnership outreach:',
        items: [
          'Professional headshot with good lighting and clear background',
          'Headline mentioning "Partnership Development" or "Business Development"',
          'Summary highlighting your SISO partnership and how you help businesses',
          'Experience section showing relevant business development background',
          'Skills section including "Business Development", "Partnerships", "Lead Generation"',
          'Recommendations from colleagues or clients',
          'Regular posting about industry insights and SISO success stories'
        ]
      },
      {
        id: 'target-identification',
        title: 'Identifying Target Prospects',
        type: 'tips',
        content: 'Use LinkedIn\'s advanced search to find decision-makers:',
        items: [
          'Job titles: CEO, CTO, Founder, VP Marketing, Head of Digital',
          'Industries: Technology, E-commerce, SaaS, Startups, Digital Agencies',
          'Company size: 10-500 employees (sweet spot for SISO services)',
          'Location: Focus on English-speaking markets initially',
          'Recent activity: Posted about growth, funding, or digital transformation',
          'Connections: 2nd or 3rd degree connections for warm introductions'
        ]
      },
      {
        id: 'connection-strategy',
        title: 'Connection Request Strategy',
        type: 'example',
        content: 'Your connection request message is crucial. Here\'s what works:',
        items: [
          'Hi [Name], I noticed your recent post about [specific topic].',
          'I help growing companies like [Company] connect with top development partners.',
          'Would love to connect and share some insights that might be valuable for [Company].',
          'Keep it under 200 characters',
          'Always reference something specific about them or their company',
          'Don\'t mention SISO in the connection request'
        ]
      },
      {
        id: 'first-message',
        title: 'The Follow-up Message That Converts',
        type: 'example',
        content: 'Once connected, wait 2-3 days then send this follow-up:',
        items: [
          'Thanks for connecting, [Name]!',
          'I\'ve been following [Company]\'s growth and impressed by [specific achievement].',
          'I partner with SISO Agency to help companies like yours scale their digital presence.',
          'They\'ve helped similar companies increase their revenue by 40-60% through custom development.',
          'Would you be open to a 15-minute conversation about how this might apply to [Company]?',
          'I can share some relevant case studies that might interest you.',
          'Best regards, [Your name]'
        ]
      },
      {
        id: 'content-strategy',
        title: 'LinkedIn Content Strategy',
        type: 'tips',
        content: 'Posting regular content builds credibility and attracts prospects:',
        items: [
          'Share 2-3 posts per week about digital transformation trends',
          'Post SISO case studies and success stories (with permission)',
          'Comment thoughtfully on prospects\' posts before reaching out',
          'Share industry insights and market research',
          'Create polls about business challenges SISO solves',
          'Write articles about partnership success stories'
        ]
      },
      {
        id: 'objection-handling',
        title: 'Handling Common Objections',
        type: 'tips',
        content: 'Prepare responses for these common LinkedIn objections:',
        items: [
          '"We\'re not looking right now" → "I understand timing is important. Would you like me to check back in 3 months?"',
          '"We have a dev team" → "That\'s great! Many of our clients use us to supplement during busy periods or for specialized projects."',
          '"What\'s the cost?" → "It varies by project. SISO offers free consultations to discuss your specific needs."',
          '"How do I know you\'re legitimate?" → "Happy to share references and case studies. Here\'s a recent success story..."',
          '"I don\'t have time" → "I completely understand. Would a 10-minute call work better than back-and-forth messages?"'
        ]
      },
      {
        id: 'automation-tools',
        title: 'LinkedIn Automation Best Practices',
        type: 'warning',
        content: 'If using automation tools, follow these guidelines to avoid account restrictions:',
        items: [
          'Never send more than 20 connection requests per day',
          'Limit messages to 20-30 per day maximum',
          'Personalize every message - avoid generic templates',
          'Don\'t auto-connect with everyone - be selective',
          'Take breaks between batches of outreach',
          'Monitor your response rates and adjust accordingly'
        ]
      }
    ],
    resources: [
      {
        title: 'LinkedIn Outreach Templates',
        description: '20+ proven message templates for different scenarios',
        url: '/templates/linkedin-outreach.pdf',
        type: 'template'
      },
      {
        title: 'LinkedIn Profile Optimization Guide',
        description: 'Step-by-step guide to optimize your profile for business development',
        url: '/guides/linkedin-profile-optimization.pdf',
        type: 'article'
      },
      {
        title: 'LinkedIn Sales Navigator Tutorial',
        description: 'Video walkthrough of advanced prospecting features',
        url: 'https://linkedin.com/sales/navigator',
        type: 'video'
      },
      {
        title: 'LinkedIn Automation Tools Comparison',
        description: 'Review of the best LinkedIn automation tools and their features',
        url: '/tools/linkedin-automation-comparison.pdf',
        type: 'article'
      }
    ],
    keyTakeaways: [
      'Personalization is key - generic messages get ignored',
      'Your profile is your credibility - invest time in optimization',
      'Consistency beats intensity - steady outreach wins',
      'Content marketing attracts prospects to you',
      'Follow-up separates successful outreach from spam'
    ],
    nextSteps: [
      'Optimize your LinkedIn profile using the checklist',
      'Identify 50 high-potential prospects using advanced search',
      'Send 5 personalized connection requests daily',
      'Create a content calendar for weekly posts',
      'Set up tracking system for outreach metrics',
      'Schedule regular time blocks for LinkedIn activity'
    ]
  },

  'social-media-sop': {
    title: 'Social Media Partnership Marketing',
    description: 'Leverage Instagram, Facebook, and other social platforms to attract and engage potential clients.',
    icon: Instagram,
    difficulty: 'Intermediate',
    timeToRead: '10 min',
    successRate: '25%',
    sections: [
      {
        id: 'platform-strategy',
        title: 'Choosing the Right Platforms',
        type: 'text',
        content: 'Different social media platforms serve different purposes for partnership marketing. Focus your efforts on platforms where your target audience is most active and engaged.'
      },
      {
        id: 'instagram-strategy',
        title: 'Instagram for B2B Partnerships',
        type: 'tips',
        content: 'Instagram can be surprisingly effective for B2B outreach:',
        items: [
          'Use Stories to share behind-the-scenes content about SISO projects',
          'Post case study carousels showing before/after transformations',
          'Share industry insights and tips through infographics',
          'Use relevant hashtags: #webdevelopment #startup #entrepreneur #saas',
          'Engage with business owners\' content through thoughtful comments',
          'Create Reels showcasing website launches and success stories'
        ]
      },
      {
        id: 'facebook-groups',
        title: 'Facebook Groups for Lead Generation',
        type: 'checklist',
        content: 'Facebook groups are goldmines for finding prospects:',
        items: [
          'Join entrepreneur and startup-focused groups in your area',
          'Participate in SaaS and tech industry groups',
          'Find e-commerce and online business communities',
          'Look for local business networking groups',
          'Join groups for specific industries (real estate, healthcare, finance)',
          'Engage authentically before promoting services'
        ]
      },
      {
        id: 'content-calendar',
        title: 'Social Media Content Calendar',
        type: 'example',
        content: 'Plan your content strategically across the week:',
        items: [
          'Monday: Motivational Monday - Success story or achievement',
          'Tuesday: Tips Tuesday - Development or business growth tip',
          'Wednesday: Work Wednesday - Behind-the-scenes SISO project',
          'Thursday: Throwback Thursday - Transformation story',
          'Friday: Feature Friday - Highlight a SISO service or capability',
          'Weekend: Personal touch - Industry insights or thought leadership'
        ]
      },
      {
        id: 'engagement-tactics',
        title: 'Engagement and Relationship Building',
        type: 'tips',
        content: 'Build relationships before pitching services:',
        items: [
          'Comment meaningfully on prospects\' posts (not just emojis)',
          'Share their content with thoughtful commentary',
          'Answer questions in groups to establish expertise',
          'Send direct messages only after building rapport',
          'Offer free value before asking for anything',
          'Remember personal details they share and reference them later'
        ]
      },
      {
        id: 'dm-strategy',
        title: 'Direct Message Outreach',
        type: 'example',
        content: 'When you\'re ready to reach out privately:',
        items: [
          'Hi [Name], loved your recent post about [specific topic]!',
          'I\'ve been following [Company] and really impressed by [specific achievement].',
          'I help companies like yours connect with development partners who can scale their digital presence.',
          'Just worked with a similar company that increased their revenue 45% after their app launch.',
          'Would you be interested in hearing how they did it?',
          'No pressure at all - just thought it might be relevant!'
        ]
      },
      {
        id: 'metrics-tracking',
        title: 'Tracking Social Media ROI',
        type: 'checklist',
        content: 'Monitor these metrics to optimize your social media efforts:',
        items: [
          'Follower growth rate and quality of new followers',
          'Engagement rate on partnership-related content',
          'Direct messages received and response rates',
          'Click-through rates on links to SISO resources',
          'Leads generated from each platform',
          'Conversion rate from social media to referrals'
        ]
      }
    ],
    resources: [
      {
        title: 'Social Media Content Templates',
        description: 'Ready-to-use post templates for different platforms and purposes',
        url: '/templates/social-media-content.zip',
        type: 'template'
      },
      {
        title: 'SISO Brand Assets',
        description: 'Logos, images, and graphics you can use in your social posts',
        url: '/brand/social-media-assets.zip',
        type: 'template'
      },
      {
        title: 'Social Media Scheduler Tools',
        description: 'Comparison of tools like Buffer, Hootsuite, and Later',
        url: 'https://buffer.com',
        type: 'tool'
      },
      {
        title: 'Facebook Groups Directory',
        description: 'List of recommended Facebook groups for B2B networking',
        url: '/resources/facebook-groups-list.pdf',
        type: 'article'
      }
    ],
    keyTakeaways: [
      'Authenticity beats promotion on social media',
      'Consistent posting builds awareness and trust',
      'Engagement comes before outreach',
      'Different platforms require different strategies',
      'Track metrics to optimize your approach'
    ],
    nextSteps: [
      'Audit your current social media profiles',
      'Create a content calendar for the next month',
      'Join 5-10 relevant Facebook groups',
      'Set up tracking for social media metrics',
      'Start engaging with prospects\' content daily',
      'Schedule time blocks for social media activities'
    ]
  },

  'direct-referrals-sop': {
    title: 'Direct Referral System',
    description: 'Master the art of direct referrals through personal relationships and strategic partnerships.',
    icon: UserPlus,
    difficulty: 'Advanced',
    timeToRead: '15 min',
    successRate: '80%',
    sections: [
      {
        id: 'referral-psychology',
        title: 'Psychology of Referrals',
        type: 'text',
        content: 'Understanding why people give referrals is crucial to your success. People refer when they trust you, believe in the solution, and feel good about helping others. Your job is to create an environment where referrals feel natural and rewarding.'
      },
      {
        id: 'referral-readiness',
        title: 'Preparing for Referral Conversations',
        type: 'checklist',
        content: 'Before asking for referrals, ensure you have these elements ready:',
        items: [
          'Clear understanding of SISO\'s ideal client profile',
          'Success stories and case studies you can share',
          'Specific examples of problems SISO solves',
          'Referral process explanation and next steps',
          'Your personal story of partnering with SISO',
          'Commission structure and mutual benefits'
        ]
      },
      {
        id: 'timing-strategy',
        title: 'Perfect Timing for Referral Requests',
        type: 'tips',
        content: 'Timing is everything in referral requests:',
        items: [
          'After successfully helping someone with a business challenge',
          'During positive conversations about business growth',
          'When someone mentions challenges SISO could solve',
          'After sharing a relevant success story or case study',
          'During networking events or business social gatherings',
          'When someone asks "How can I help you?" or "What are you working on?"'
        ]
      },
      {
        id: 'referral-script',
        title: 'The Direct Referral Conversation',
        type: 'example',
        content: 'Here\'s a proven script for referral conversations:',
        items: [
          '"I\'ve been having great success partnering with SISO Agency to help businesses with their development needs."',
          '"They specialize in [specific services relevant to your contact\'s network]."',
          '"I\'m looking to connect with business owners who might benefit from their services."',
          '"Do you know anyone who\'s mentioned needing help with their website, app, or digital presence?"',
          '"I\'d be happy to make an introduction - SISO provides free consultations."',
          '"And if it works out, I earn a referral fee, so it\'s a win-win."'
        ]
      },
      {
        id: 'objection-handling-direct',
        title: 'Handling Referral Objections',
        type: 'tips',
        content: 'Common objections and how to address them:',
        items: [
          '"I don\'t want to bother my contacts" → "SISO provides real value - you\'d be helping them solve problems"',
          '"What if they\'re not interested?" → "No pressure - just a friendly introduction and they can decide"',
          '"I don\'t know anyone right now" → "No worries! Keep me in mind if you hear of anyone"',
          '"How much do you make?" → "I earn a percentage of successful projects - it aligns my interests with helping businesses succeed"',
          '"I need to think about it" → "Of course! Here\'s my card - reach out when you\'re ready"'
        ]
      },
      {
        id: 'follow-through',
        title: 'Following Through on Referrals',
        type: 'checklist',
        content: 'Once you get a referral, professional follow-through is crucial:',
        items: [
          'Thank the referrer immediately and specifically',
          'Contact the referral within 24 hours',
          'Keep the referrer updated on progress',
          'Provide feedback after initial conversations',
          'Thank the referrer again if the deal closes',
          'Ask if they know anyone else who might benefit'
        ]
      },
      {
        id: 'referral-system',
        title: 'Building a Referral System',
        type: 'tips',
        content: 'Create systematic approaches to generate consistent referrals:',
        items: [
          'Maintain a list of your top 50 referral sources',
          'Schedule regular check-ins with key referrers',
          'Send quarterly updates about your partnership success',
          'Recognize and reward your best referrers',
          'Create referral partnerships with complementary businesses',
          'Ask every satisfied contact for referrals'
        ]
      },
      {
        id: 'advanced-strategies',
        title: 'Advanced Referral Strategies',
        type: 'tips',
        content: 'Take your referral system to the next level:',
        items: [
          'Host networking events where you can facilitate introductions',
          'Create a referral rewards program for your network',
          'Partner with other service providers (accountants, lawyers, consultants)',
          'Join mastermind groups and business associations',
          'Speak at industry events to build credibility',
          'Write articles about business development to attract referrers'
        ]
      }
    ],
    resources: [
      {
        title: 'Referral Tracking Spreadsheet',
        description: 'Template to track referral sources, conversations, and outcomes',
        url: '/templates/referral-tracking.xlsx',
        type: 'template'
      },
      {
        title: 'SISO Referral Presentation',
        description: 'PowerPoint presentation to explain SISO services to potential referrers',
        url: '/presentations/siso-referral-deck.pptx',
        type: 'template'
      },
      {
        title: 'Referral Conversation Scripts',
        description: 'Word-for-word scripts for different referral scenarios',
        url: '/scripts/referral-conversations.pdf',
        type: 'template'
      },
      {
        title: 'Thank You Templates',
        description: 'Email and note templates for thanking referral sources',
        url: '/templates/thank-you-notes.pdf',
        type: 'template'
      }
    ],
    keyTakeaways: [
      'Direct referrals have the highest conversion rate of all methods',
      'Relationships are built over time - invest in long-term connections',
      'Always follow through professionally on every referral',
      'Make referring easy and rewarding for your network',
      'Systematic approaches beat random referral requests'
    ],
    nextSteps: [
      'Identify your top 20 potential referral sources',
      'Practice the referral conversation script until it feels natural',
      'Schedule coffee meetings with 5 key contacts this month',
      'Set up a referral tracking system',
      'Create a quarterly touchpoint calendar for your network',
      'Draft a referral partnership proposal for complementary businesses'
    ]
  }
};