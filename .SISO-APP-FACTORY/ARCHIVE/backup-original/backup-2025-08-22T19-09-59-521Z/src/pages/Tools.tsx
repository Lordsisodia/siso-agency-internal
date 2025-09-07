import { useQuery } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tool } from '@/components/tools/types';
import { AppLayout } from '@/components/layout/AppLayout';
import { toast } from 'react-hot-toast';
import { ToolsPageHeader } from '@/components/tools/ToolsPageHeader';
import { MainContent } from '@/components/tools/layout/MainContent';
import { ChatAssistant } from '@/components/tools/layout/ChatAssistant';
import { enhancedTableQuery, castToMockTypeArray } from '@/utils/errorSuppressions';
import { Sidebar } from '@/components/Sidebar';

// [Analysis] Tools page with optimized auth handling and memoized filters
export default function Tools() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('rating');

  const categories = useMemo(() => [
    { id: 'all', label: 'All Tools' },
    { id: 'featured', label: 'Featured' },
    { id: 'development', label: 'Development' },
    { id: 'database', label: 'Database' },
    { id: 'automation', label: 'Automation' },
    { id: 'GPT Builder', label: 'GPT Builder' },
  ], []);

  const { data: tools, isLoading, error } = useQuery({
    queryKey: ['core_tools'],
    queryFn: async () => {
      console.log('Fetching tools from core_tools table...');
      try {
        // Query the core_tools table
        const { data, error } = await enhancedTableQuery('core_tools')
          .select('*');
        
        if (error) {
          console.error('Error fetching tools:', error);
          toast.error('Failed to load tools. Please try again later.');
          throw error;
        }
        
        if (!data || !Array.isArray(data)) {
          console.error('Invalid data format returned from core_tools');
          return [];
        }
        
        // Process the raw data and ensure proper typing
        const toolsData: Tool[] = data.map((rawTool: any) => {
          // Handle youtube_videos parsing
          let youtubeVideos = [];
          if (rawTool.youtube_videos) {
            try {
              if (typeof rawTool.youtube_videos === 'string') {
                youtubeVideos = JSON.parse(rawTool.youtube_videos);
              } else {
                youtubeVideos = rawTool.youtube_videos;
              }
            } catch (e) {
              console.error('Error parsing youtube_videos:', e);
              youtubeVideos = [];
            }
          }
          
          // Construct a properly typed Tool object
          return {
            id: rawTool.id,
            name: rawTool.name,
            description: rawTool.description,
            category: rawTool.category || '',
            rating: rawTool.rating,
            downloads_count: rawTool.downloads_count,
            created_at: rawTool.created_at,
            youtube_videos: youtubeVideos,
            youtube_url: rawTool.youtube_url,
            likes_count: rawTool.likes_count,
            pricing_type: rawTool.pricing_type,
            website_url: rawTool.website_url,
            docs_url: rawTool.docs_url,
            github_url: rawTool.github_url,
            tags: rawTool.tags,
            assistant_type: rawTool.assistant_type,
            profile_image_url: rawTool.profile_image_url,
            member_type: rawTool.member_type,
            specialization: rawTool.specialization,
            content_themes: rawTool.content_themes,
            use_cases: rawTool.use_cases
          };
        });
        
        return toolsData;
      } catch (error) {
        console.error('Error in tools query:', error);
        throw error;
      }
    },
  });

  function sortTools(tools: Tool[]) {
    return [...tools].sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'newest':
          return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
        case 'popular':
          return (b.downloads_count || 0) - (a.downloads_count || 0);
        default:
          return 0;
      }
    });
  }

  const filteredTools = useMemo(() => {
    if (!tools) return [];
    
    let filtered = tools.filter(tool => {
      const matchesSearch = !searchQuery || 
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = 
        selectedCategory === 'all' || 
        (selectedCategory === 'featured' && tool.rating && tool.rating >= 4.5) ||
        (tool.category && tool.category.toLowerCase() === selectedCategory.toLowerCase());

      return matchesSearch && matchesCategory;
    });

    return sortTools(filtered);
  }, [tools, searchQuery, selectedCategory, sortBy]);

  const categoryStats = useMemo(() => {
    if (!tools) return {};
    return categories.reduce((acc, category) => {
      acc[category.label] = tools.filter(tool => 
        category.id === 'all' ? true : 
        category.id === 'featured' ? (tool.rating && tool.rating >= 4.5) :
        (tool.category && tool.category.toLowerCase() === category.id.toLowerCase())
      ).length;
      return acc;
    }, {} as { [key: string]: number });
  }, [tools, categories]);

  if (error) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="p-8">
          <div className="text-red-500">
            Failed to load tools. Please try again later.
          </div>
        </div>
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="p-8">
        <ToolsPageHeader 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          totalTools={tools?.length}
          categoryStats={categoryStats}
        />

        <MainContent 
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          sortBy={sortBy}
          onSortChange={setSortBy}
          filteredTools={filteredTools}
          isLoading={isLoading}
          categoryStats={categoryStats}
        />

        <ChatAssistant />
      </div>
    </AppLayout>
  );
}
