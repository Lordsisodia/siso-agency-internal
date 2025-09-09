import { ResearchDocument } from '../types';

// Mock data - would be replaced with real data from API/database
export const researchDocuments: ResearchDocument[] = [
  {
    id: '1',
    title: 'Cryptocurrency Market Analysis 2025',
    description: 'In-depth analysis of current market trends, key players, and future projections for the cryptocurrency landscape.',
    category: 'Market Research',
    created_at: '2025-03-15T10:30:00Z',
    updated_at: '2025-04-01T14:20:00Z',
    tags: ['market', 'trends', 'analysis'],
    insights: ['Key trends predict a 30% rise in DeFi adoption by 2025', 'NFT marketplaces forecasted to consolidate by 40%', 'Regulatory clarity expected to improve in 5 major markets'],
    nextSteps: ['Consider DeFi integration in phase 2', 'Monitor regulation developments in EU markets', 'Plan for interoperability with major chains'],
    isPinned: true,
  },
  {
    id: '2',
    title: 'Smart Contract Security Best Practices',
    description: 'Comprehensive guide on implementing secure smart contracts, common vulnerabilities, and auditing procedures.',
    category: 'Technical',
    created_at: '2025-02-10T09:15:00Z',
    updated_at: '2025-04-10T11:45:00Z',
    tags: ['security', 'smart contracts', 'audit'],
    insights: ['75% of vulnerabilities come from reentrancy attacks', 'Formal verification reduces exploits by 62%', 'Multi-sig approaches increase security by 85%'],
    nextSteps: ['Recommendation: Adopt multi-sig wallets for enhanced security', 'Schedule quarterly security audits', 'Implement monitoring systems for unusual activity'],
    code_snippet: '// Example multi-signature wallet pattern\ncontract MultiSigWallet {\n  mapping(address => bool) public isOwner;\n  uint public required;\n\n  function execute(address dest, uint value, bytes data) public {\n    // Implementation\n  }\n}',
    fileUrl: '#',
  },
  {
    id: '3',
    title: 'User Experience in Crypto Applications',
    description: 'Research on optimizing user experience for cryptocurrency applications with focus on simplicity and security.',
    category: 'UX Research',
    created_at: '2025-01-25T15:40:00Z',
    updated_at: '2025-03-18T09:30:00Z',
    tags: ['UX', 'design', 'usability'],
    insights: ['Simple onboarding increases conversion by 46%', 'Educational tooltips reduce support tickets by 32%', 'Progressive disclosure improves user confidence by 28%'],
    nextSteps: ['Implement guided wallet setup', 'Add interactive tutorials for new users', 'Design simpler transaction confirmation screens'],
  },
  {
    id: '4',
    title: 'Regulatory Compliance Framework',
    description: 'Analysis of global regulatory requirements and compliance frameworks for cryptocurrency platforms.',
    category: 'Legal',
    created_at: '2025-03-05T11:20:00Z',
    updated_at: '2025-04-15T10:10:00Z',
    tags: ['legal', 'compliance', 'regulation'],
    insights: ['KYC implementation needed in 89% of jurisdictions', 'AML policies required for all fiat on/off ramps', 'Self-regulation initiatives gaining traction in 3 major markets'],
    nextSteps: ['Develop compliance checklist for each target market', 'Consult with legal team on KYC implementation', 'Monitor changing regulations in key territories'],
    fileUrl: '#',
  },
];

export const pinnedAssets: ResearchDocument[] = [
  {
    id: 'pin-1',
    title: 'UbahCryp Roadmap',
    description: 'View our development timeline and milestone tracking',
    category: 'Project Planning',
    created_at: '2025-04-01T08:00:00Z',
    updated_at: '2025-04-20T14:30:00Z',
    tags: ['roadmap', 'milestones', 'planning'],
    fileUrl: '#',
    isPinned: true,
  },
  {
    id: 'pin-2',
    title: 'API Documentation',
    description: 'Complete API reference for UbahCryp platform integration',
    category: 'Technical',
    created_at: '2025-04-05T11:45:00Z',
    updated_at: '2025-04-22T09:15:00Z',
    tags: ['api', 'integration', 'documentation'],
    fileUrl: '#',
    isPinned: true,
  }
]; 