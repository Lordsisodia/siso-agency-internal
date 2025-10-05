import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SmartEarningSearch } from '@/components/earn/SmartEarningSearch';
import { EarningChatAssistant } from '@/components/earn/EarningChatAssistant';
import { EarnHeader } from '@/components/earn/header/EarnHeader';
import { SkillTreeContent } from '@/components/earn/content/SkillTreeContent';
import { SkillPath, Skill, UserSkillProgress } from '@/types/skills';
import { useAuthSession } from '@/hooks/useAuthSession';
import { MainLayout } from '@/components/layout/MainLayout';
import { toast } from 'sonner';

const HowToEarn = () => {
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuthSession();

  const { data: skillPaths, isLoading: isLoadingPaths } = useQuery({
    queryKey: ['skillPaths'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('skill_paths')
        .select('*')
        .order('level', { ascending: true });
      
      if (error) throw error;
      return data as SkillPath[];
    }
  });

  const { data: skills, isLoading: isLoadingSkills } = useQuery({
    queryKey: ['skills', selectedPath],
    queryFn: async () => {
      const query = supabase
        .from('skills')
        .select('*')
        .order('level', { ascending: true });
        
      if (selectedPath) {
        query.eq('path_id', selectedPath);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return (data as any[]).map(skill => ({
        ...skill,
        requirements: typeof skill.requirements === 'string' 
          ? JSON.parse(skill.requirements)
          : skill.requirements
      })) as Skill[];
    },
    enabled: !!skillPaths
  });

  const { data: userProgress, isLoading: isLoadingProgress } = useQuery({
    queryKey: ['userSkillProgress', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('user_skill_progress')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data as UserSkillProgress[];
    },
    enabled: !!user?.id
  });

  const handleExternalLink = (url: string) => {
    if (!url) {
      toast.error("Invalid resource link");
      return;
    }

    // [Analysis] Validate URL format before opening
    try {
      new URL(url);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (e) {
      toast.error("Invalid URL format");
    }
  };

  const isLoading = isLoadingPaths || isLoadingSkills || isLoadingProgress;

  return (
    <AppLayout>
      <div className="flex-1 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <EarnHeader navigate={navigate} />
          <SmartEarningSearch onSearch={(query: string) => {}} />
          <SkillTreeContent 
            skillPaths={skillPaths || []}
            skills={skills || []}
            userProgress={userProgress || []}
            selectedPath={selectedPath}
            setSelectedPath={setSelectedPath}
            isLoading={isLoading}
            onExternalLinkClick={handleExternalLink}
          />
        </div>
      </div>
      <EarningChatAssistant />
    </AppLayout>
  );
};

export default HowToEarn;
