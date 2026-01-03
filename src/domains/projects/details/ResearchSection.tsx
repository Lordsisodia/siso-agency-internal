import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ResearchFilters } from './research/ResearchFilters';
import { ResearchCategories } from './research/ResearchCategories';
import { PinnedResearchAsset } from './research/PinnedResearchAsset';
import { ResearchDocumentCard } from './research/ResearchDocument';
import { ResearchDocumentSkeleton, PinnedResearchAssetSkeleton } from './research/ResearchDocumentSkeleton';
import { ResearchDocument } from './types';
import { Skeleton } from '@/components/ui/skeleton';
import React from 'react';

// Mock data - would be replaced with real data from API/database
const researchDocuments: ResearchDocument[] = [
  {
    id: '1',
    title: 'Cryptocurrency Market Analysis 2025',
    description: 'In-depth analysis of current market trends, key players, and future projections for the cryptocurrency landscape.',
    category: 'Market Research',
    created_at: '2025-03-15T10:30:00Z',
    updated_at: '2025-04-01T14:20:00Z',
    tags: ['market', 'trends', 'analysis'],
    insights: ['Key trends predict a 30% rise in DeFi adoption by 2025', 'NFT marketplaces forecasted to consolidate by 40%'],
    nextSteps: ['Consider DeFi integration in phase 2', 'Monitor regulation developments in EU markets'],
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
    insights: ['75% of vulnerabilities come from reentrancy attacks', 'Formal verification reduces exploits by 62%'],
    nextSteps: ['Recommendation: Adopt multi-sig wallets for enhanced security', 'Schedule quarterly security audits'],
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
    insights: ['Simple onboarding increases conversion by 46%', 'Educational tooltips reduce support tickets by 32%'],
    nextSteps: ['Implement guided wallet setup', 'Add interactive tutorials for new users'],
  },
  {
    id: '4',
    title: 'Regulatory Compliance Framework',
    description: 'Analysis of global regulatory requirements and compliance frameworks for cryptocurrency platforms.',
    category: 'Legal',
    created_at: '2025-03-05T11:20:00Z',
    updated_at: '2025-04-15T10:10:00Z',
    tags: ['legal', 'compliance', 'regulation'],
    insights: ['KYC implementation needed in 89% of jurisdictions', 'AML policies required for all fiat on/off ramps'],
    nextSteps: ['Develop compliance checklist for each target market', 'Consult with legal team on KYC implementation'],
    fileUrl: '#',
  },
];

const pinnedAssets: ResearchDocument[] = [
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

const categories = ['All', 'Market Research', 'Technical', 'UX Research', 'Legal', 'Competition'];

const categoryColors: Record<string, string> = {
  'Market Research': 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  'Technical': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  'UX Research': 'bg-green-500/10 text-green-500 border-green-500/20',
  'Legal': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  'Competition': 'bg-red-500/10 text-red-500 border-red-500/20',
  'Project Planning': 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20'
};

export function ResearchSection() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('updated');
  const [expandedDocs, setExpandedDocs] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  
  // Simulate loading state for demo purposes
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const toggleExpanded = (id: string) => {
    setExpandedDocs(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const getCategoryCount = (category: string) => {
    return researchDocuments.filter(doc => 
      category === 'All' ? true : doc.category === category
    ).length;
  };

  const filteredDocuments = [...pinnedAssets, ...researchDocuments].filter(doc => {
    const categoryMatch = activeCategory === 'All' || doc.category === activeCategory;
    const searchMatch = 
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return categoryMatch && searchMatch;
  });

  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    if (sortBy === 'updated') {
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    } else if (sortBy === 'title') {
      return a.title.localeCompare(b.title);
    } else if (sortBy === 'category') {
      return a.category.localeCompare(b.category);
    }
    return 0;
  });

  const pinnedDocs = sortedDocuments.filter(doc => doc.isPinned);
  const regularDocs = sortedDocuments.filter(doc => !doc.isPinned);
  
  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Research Documents</h2>
            <p className="text-neutral-400">Explore our research findings and background information for UbahCryp.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Skeleton className="h-10 w-64 bg-slate-800 rounded-md" />
            <Skeleton className="h-10 w-32 bg-slate-800 rounded-md" />
          </div>
        </div>
        
        <div className="flex overflow-auto pb-2 gap-2">
          {categories.map((_, i) => (
            <Skeleton key={i} className="h-9 w-28 bg-slate-800 rounded-md flex-shrink-0" />
          ))}
        </div>
        
        {/* Pinned Skeletons */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white/90 mb-3 border-b border-white/10 pb-2">
            Pinned Project Assets
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2].map((i) => (
              <PinnedResearchAssetSkeleton key={i} />
            ))}
          </div>
        </div>
        
        {/* Regular Document Skeletons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, i) => (
            <ResearchDocumentSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Research Documents</h2>
          <p className="text-neutral-400">Explore our research findings and background information for UbahCryp.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <ResearchFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button className="bg-[#9b87f5] hover:bg-[#8a76e4] text-white">
                  Add Document
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                Upload PDFs or links (admin access required)
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
      <ResearchCategories
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        categoryColors={categoryColors}
        getCategoryCount={getCategoryCount}
      />
      
      {pinnedDocs.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white/90 mb-3 border-b border-white/10 pb-2">
            Pinned Project Assets
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pinnedDocs.map((doc) => (
              <PinnedResearchAsset 
                key={doc.id} 
                doc={doc} 
                categoryColors={categoryColors} 
              />
            ))}
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {regularDocs.map((doc) => (
          <ResearchDocumentCard
            key={doc.id}
            doc={doc}
            isExpanded={expandedDocs[doc.id]}
            onToggleExpand={() => toggleExpanded(doc.id)}
            categoryColors={categoryColors}
          />
        ))}
        
        {activeCategory === 'Competition' && regularDocs.filter(d => d.category === 'Competition').length === 0 && (
          <Card className="border border-white/10 bg-black/20 flex flex-col items-center justify-center p-6 h-64">
            <FileText className="h-12 w-12 text-neutral-500 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No Competition Research Yet</h3>
            <p className="text-neutral-400 text-sm text-center mb-4">
              Help the project by contributing research on competitors.
            </p>
            <Button className="bg-[#9b87f5] hover:bg-[#8a76e4] text-white">
              Contribute Research
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
