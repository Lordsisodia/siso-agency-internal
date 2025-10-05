import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { LeaderboardEntry, LeaderboardFilter, LeaderboardStats, TrendStats } from '../types';
import { safeGet } from '@/utils/typeHelpers'; 

export const useLeaderboardData = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [stats, setStats] = useState<LeaderboardStats>({
    totalParticipants: 0,
    avgPoints: 0,
    topScore: 0
  });
  
  const [trends, setTrends] = useState<TrendStats>({
    trend: 'stable',
    percentage: 0,
    points: 0,
    users: 0,
    tokens: 0
  });
  
  const [filter, setFilter] = useState<LeaderboardFilter>({
    timeframe: 'week'
  });
  
  const { toast } = useToast();

  const fetchLeaderboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Real project data provided by the user
      const projectData = [
        {
          name: 'Optimal Construction',
          url: 'https://optimal-building-maintenance.vercel.app/',
          points: 1500,
          spending: 15000,
          sisoTokens: 3000,
          milestones: '4/8',
          clientEngagement: 60,
          communityImpact: 5,
          lastActive: '2025-03-01',
          status: 'Waiting on client'
        },
        {
          name: 'UbahCryp',
          url: 'https://ubahcrypcom.vercel.app/',
          points: 500,
          spending: 5000,
          sisoTokens: 1000,
          milestones: '8/8',
          clientEngagement: 90,
          communityImpact: 10,
          lastActive: '2025-03-20',
          status: 'Feedback from app'
        },
        {
          name: 'Gritness',
          url: 'https://gritnessgym.vercel.app/',
          points: 25,
          spending: 249,
          sisoTokens: 50,
          milestones: '6/8',
          clientEngagement: 40,
          communityImpact: 3,
          lastActive: '2025-05-09',
          status: 'Not contacted'
        },
        {
          name: 'Trojan MMA',
          url: 'https://trojan-mma.vercel.app/',
          points: 25,
          spending: 249,
          sisoTokens: 50,
          milestones: '6/8',
          clientEngagement: 35,
          communityImpact: 2,
          lastActive: '2025-03-27',
          status: 'Not contacted'
        },
        {
          name: 'Lets Go',
          url: 'https://lets-go-u7hh.vercel.app/',
          points: 25,
          spending: 249,
          sisoTokens: 50,
          milestones: '7/8',
          clientEngagement: 80,
          communityImpact: 4,
          lastActive: '2025-03-26',
          status: 'Feedback from app'
        },
        {
          name: 'NM Construction',
          url: 'https://nm-construction.vercel.app/',
          points: 0,
          spending: 0,
          sisoTokens: 0,
          milestones: '4/8',
          clientEngagement: 50,
          communityImpact: 1,
          lastActive: '2025-03-01',
          status: 'Contacted'
        },
        {
          name: 'Elementree',
          url: 'https://elementree.vercel.app/',
          points: 0,
          spending: 0,
          sisoTokens: 0,
          milestones: '5/8',
          clientEngagement: 30,
          communityImpact: 1,
          lastActive: '2025-05-09',
          status: 'Not contacted'
        },
        {
          name: 'Mu Shin',
          url: 'https://siso-mu-shin.vercel.app/',
          points: 0,
          spending: 0,
          sisoTokens: 0,
          milestones: '8/8',
          clientEngagement: 20,
          communityImpact: 0,
          lastActive: '2025-03-20',
          status: 'Declined'
        },
        {
          name: '5 Star Hire',
          url: 'https://5-star-hire.vercel.app/',
          points: 0,
          spending: 0,
          sisoTokens: 0,
          milestones: '3/8',
          clientEngagement: 25,
          communityImpact: 0,
          lastActive: '2025-05-09',
          status: 'Not contacted'
        },
        {
          name: 'Keegan Saas',
          url: '',
          points: 0,
          spending: 0,
          sisoTokens: 0,
          milestones: '0/8',
          clientEngagement: 15,
          communityImpact: 0,
          lastActive: '2025-05-09',
          status: 'Waiting on client'
        }
      ];
      
      // Map the project data to leaderboard entries
      const mappedEntries: LeaderboardEntry[] = projectData.map((project, index) => {
        // Calculate rank based on points
        let rank = 'Novice';
        if (project.points >= 1000) rank = 'Master';
        else if (project.points >= 500) rank = 'Expert';
        else if (project.points >= 100) rank = 'Advanced';
        else if (project.points >= 25) rank = 'Intermediate';
        
        return {
          id: `project-${index + 1}`,
          user_id: `project-${index + 1}`,
          points: project.points,
          level: Math.floor(project.points / 100) + 1,
          streak_days: Math.floor(Math.random() * 30),
          rank: rank,
          siso_tokens: project.sisoTokens,
          updated_at: project.lastActive,
          contribution_count: project.communityImpact,
          referral_count: Math.floor(project.clientEngagement / 10),
          achievements: [
            { name: project.status, icon: '🏆' }
          ],
          profile: {
            full_name: project.name,
            email: `info@${project.name.toLowerCase().replace(/\s+/g, '-')}.com`,
            bio: `${project.milestones} milestones completed`,
            avatar_url: '',
            professional_role: project.status,
            business_name: project.name,
            industry: 'Construction & Development',
            website_url: project.url
          }
        };
      });
      
      // Sort entries by points (highest first)
      const sortedEntries = mappedEntries.sort((a, b) => b.points - a.points);
      setEntries(sortedEntries);
      
      // Calculate stats
      const totalPoints = sortedEntries.reduce((sum, entry) => sum + entry.points, 0);
      const totalTokens = sortedEntries.reduce((sum, entry) => sum + entry.siso_tokens, 0);
      
        setStats({
        totalParticipants: sortedEntries.length,
        avgPoints: Math.floor(totalPoints / sortedEntries.length),
        topScore: Math.max(...sortedEntries.map(entry => entry.points))
      });
      
      // Set trends
        setTrends({
          trend: 'up',
        percentage: 15,
        points: Math.floor(totalPoints * 0.15),
        users: 2,
        tokens: Math.floor(totalTokens * 0.1)
      });
      
    } catch (error) {
      console.error('Error setting up leaderboard data:', error);
      toast({
        variant: "destructive",
        title: "Failed to load leaderboard",
        description: "There was an error loading the leaderboard data.",
      });
      
      // Set empty data on error
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [filter, toast]);

  useEffect(() => {
    fetchLeaderboardData();
  }, [fetchLeaderboardData, filter]);

  const refreshLeaderboard = () => {
    fetchLeaderboardData();
  };

  return {
    entries,
    stats,
    trends,
    loading,
    filter,
    setFilter,
    refreshLeaderboard
  };
};
