import { useState, useCallback, useMemo } from 'react';
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Sidebar } from '@/components/Sidebar';
import { AutomationDetails } from '@/components/automations/AutomationDetails';
import { Automation, AutomationCategory } from '@/components/automations/types';
import { AutomationSearch } from '@/components/automations/AutomationSearch';
import { AutomationCategories } from '@/components/automations/AutomationCategories';
import { AutomationGrid } from '@/components/automations/AutomationGrid';

export default function Automations() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAutomation, setSelectedAutomation] = useState<Automation | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<AutomationCategory>('all');
  const [isLoading, setIsLoading] = useState(false);

  // Mock automation data
  const automations: Automation[] = useMemo(() => [
    {
      id: '1',
      name: 'Email Automation',
      description: 'Automatically send personalized emails to customers',
      category: 'marketing',
      platform: 'zapier',
      complexity: 'medium',
      setup_guide: 'Connect your email provider to Zapier and setup triggers',
      integration_time: '30 minutes',
      integration_url: 'https://zapier.com/apps/email',
      profile_image_url: ''
    },
    {
      id: '2',
      name: 'Social Media Scheduler',
      description: 'Schedule posts across multiple platforms',
      category: 'marketing',
      platform: 'buffer',
      complexity: 'simple',
      setup_guide: 'Connect your social accounts and create a posting schedule',
      integration_time: '15 minutes',
      integration_url: 'https://buffer.com',
      profile_image_url: ''
    },
    {
      id: '3',
      name: 'CRM Integration',
      description: 'Sync customer data across platforms',
      category: 'sales',
      platform: 'make',
      complexity: 'advanced',
      setup_guide: 'Create bidirectional sync between your CRM and other tools',
      integration_time: '1 hour',
      integration_url: 'https://make.com',
      profile_image_url: ''
    }
  ], []);

  const filteredAutomations = useMemo(() => {
    if (!automations) return [];
    
    return automations.filter(automation => {
      const matchesSearch = !searchQuery || 
        automation.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        automation.description?.toLowerCase().includes(searchQuery.toLowerCase());

      if (selectedCategory === 'all') return matchesSearch;
      if (selectedCategory === 'featured') {
        return matchesSearch && automation.platform === 'Multiple';
      }
      return matchesSearch && 
        (automation.platform?.toLowerCase() === selectedCategory);
    });
  }, [automations, searchQuery, selectedCategory]);

  const getCategoryCount = useCallback((category: AutomationCategory) => {
    if (!automations) return 0;
    
    if (category === 'all') return automations.length;
    if (category === 'featured') {
      return automations.filter(a => a.platform === 'Multiple').length;
    }
    return automations.filter(a => a.platform?.toLowerCase() === category).length;
  }, [automations]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  const handleCategoryChange = useCallback((category: AutomationCategory) => {
    setSelectedCategory(category);
  }, []);

  const handleSelectAutomation = useCallback((automation: Automation) => {
    setSelectedAutomation(automation);
  }, []);

  return (
    <div className="flex min-h-screen w-full bg-gradient-to-b from-siso-bg to-siso-bg/95">
      <Sidebar />
      <div className="flex-1 p-8 relative overflow-hidden">
        {/* Background animations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-siso-red/20 to-siso-orange/20 rounded-full blur-3xl animate-float-slow opacity-30" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-siso-orange/20 to-siso-red/20 rounded-full blur-3xl animate-float-slower opacity-30" />
        </div>

        <div className="max-w-7xl mx-auto relative space-y-8">
          <div className="space-y-6">
            <h1 className="text-4xl font-bold text-siso-text-bold">
              Automations
            </h1>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <AutomationSearch 
                value={searchQuery}
                onChange={handleSearchChange}
              />
              <AutomationCategories
                selectedCategory={selectedCategory}
                onCategoryChange={handleCategoryChange}
                getCategoryCount={getCategoryCount}
              />
            </div>
          </div>

          <AutomationGrid
            automations={filteredAutomations}
            isLoading={isLoading}
            onSelectAutomation={handleSelectAutomation}
          />

          <Sheet 
            open={!!selectedAutomation} 
            onOpenChange={() => setSelectedAutomation(null)}
          >
            <SheetContent className="bg-siso-bg border-l border-siso-text/10 w-full sm:max-w-xl backdrop-blur-xl bg-opacity-95">
              {selectedAutomation && (
                <AutomationDetails automation={selectedAutomation} />
              )}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
}
