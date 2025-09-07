import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

// Types for referral management
export interface ReferralLink {
  id: string;
  partner_id: string;
  campaign_name: string;
  link_code: string;
  full_url: string;
  clicks: number;
  conversions: number;
  revenue: number;
  status: 'active' | 'paused' | 'expired';
  created_at: string;
  expires_at?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  notes?: string;
}

export interface ReferralLead {
  id: string;
  partner_id: string;
  referral_link_id?: string;
  client_name: string;
  client_email: string;
  client_phone?: string;
  company_name?: string;
  project_type: string;
  estimated_value: number;
  status: 'new' | 'contacted' | 'qualified' | 'proposal_sent' | 'negotiating' | 'closed_won' | 'closed_lost';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  source: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  expected_close_date?: string;
  last_contact_date?: string;
  next_follow_up_date?: string;
  commission_rate: number;
  commission_amount?: number;
  tags?: string[];
}

export interface ReferralAnalytics {
  totalLinks: number;
  activeLinks: number;
  totalClicks: number;
  totalConversions: number;
  conversionRate: number;
  totalRevenue: number;
  totalCommissions: number;
  averageDealSize: number;
  topPerformingLinks: ReferralLink[];
  recentActivity: any[];
  monthlyStats: {
    month: string;
    clicks: number;
    conversions: number;
    revenue: number;
    commissions: number;
  }[];
  leadsByStatus: {
    status: string;
    count: number;
    value: number;
  }[];
  performanceMetrics: {
    clickThroughRate: number;
    leadQualityScore: number;
    averageTimeToClose: number;
    customerLifetimeValue: number;
  };
}

export interface ReferralFilters {
  status?: string[];
  priority?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  searchTerm?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  tags?: string[];
}

export const useReferralsManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // State management
  const [referralLinks, setReferralLinks] = useState<ReferralLink[]>([]);
  const [referralLeads, setReferralLeads] = useState<ReferralLead[]>([]);
  const [analytics, setAnalytics] = useState<ReferralAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ReferralFilters>({});
  
  // Fetch referral links
  const fetchReferralLinks = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('referral_links')
        .select('*')
        .eq('partner_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setReferralLinks(data || []);
    } catch (err) {
      console.error('Error fetching referral links:', err);
      setError('Failed to load referral links');
      toast({
        title: "Error",
        description: "Failed to load referral links",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id, toast]);
  
  // Fetch referral leads
  const fetchReferralLeads = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('referral_leads')
        .select('*')
        .eq('partner_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setReferralLeads(data || []);
    } catch (err) {
      console.error('Error fetching referral leads:', err);
      setError('Failed to load referral leads');
    }
  }, [user?.id]);
  
  // Create referral link
  const createReferralLink = useCallback(async (linkData: Partial<ReferralLink>) => {
    if (!user?.id) return null;
    
    try {
      const linkCode = linkData.link_code || generateLinkCode();
      const fullUrl = `${window.location.origin}/partnership?ref=${linkCode}`;
      
      const { data, error } = await supabase
        .from('referral_links')
        .insert({
          partner_id: user.id,
          campaign_name: linkData.campaign_name,
          link_code: linkCode,
          full_url: fullUrl,
          status: 'active',
          utm_source: linkData.utm_source || 'partner',
          utm_medium: linkData.utm_medium || 'referral',
          utm_campaign: linkData.utm_campaign || linkData.campaign_name,
          utm_content: linkData.utm_content,
          notes: linkData.notes,
          expires_at: linkData.expires_at
        })
        .select()
        .single();
      
      if (error) throw error;
      
      setReferralLinks(prev => [data, ...prev]);
      toast({
        title: "Success",
        description: "Referral link created successfully"
      });
      
      return data;
    } catch (err) {
      console.error('Error creating referral link:', err);
      toast({
        title: "Error",
        description: "Failed to create referral link",
        variant: "destructive"
      });
      return null;
    }
  }, [user?.id, toast]);
  
  // Update referral link
  const updateReferralLink = useCallback(async (id: string, updates: Partial<ReferralLink>) => {
    try {
      const { data, error } = await supabase
        .from('referral_links')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      setReferralLinks(prev => prev.map(link => 
        link.id === id ? { ...link, ...data } : link
      ));
      
      toast({
        title: "Success",
        description: "Referral link updated successfully"
      });
      
      return data;
    } catch (err) {
      console.error('Error updating referral link:', err);
      toast({
        title: "Error",
        description: "Failed to update referral link",
        variant: "destructive"
      });
      return null;
    }
  }, [toast]);
  
  // Delete referral link
  const deleteReferralLink = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('referral_links')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setReferralLinks(prev => prev.filter(link => link.id !== id));
      toast({
        title: "Success",
        description: "Referral link deleted successfully"
      });
      
      return true;
    } catch (err) {
      console.error('Error deleting referral link:', err);
      toast({
        title: "Error",
        description: "Failed to delete referral link",
        variant: "destructive"
      });
      return false;
    }
  }, [toast]);
  
  // Create referral lead
  const createReferralLead = useCallback(async (leadData: Partial<ReferralLead>) => {
    if (!user?.id) return null;
    
    try {
      const { data, error } = await supabase
        .from('referral_leads')
        .insert({
          partner_id: user.id,
          ...leadData,
          status: leadData.status || 'new',
          priority: leadData.priority || 'medium',
          commission_rate: leadData.commission_rate || 0.1
        })
        .select()
        .single();
      
      if (error) throw error;
      
      setReferralLeads(prev => [data, ...prev]);
      toast({
        title: "Success",
        description: "Lead added successfully"
      });
      
      return data;
    } catch (err) {
      console.error('Error creating referral lead:', err);
      toast({
        title: "Error",
        description: "Failed to add lead",
        variant: "destructive"
      });
      return null;
    }
  }, [user?.id, toast]);
  
  // Update referral lead
  const updateReferralLead = useCallback(async (id: string, updates: Partial<ReferralLead>) => {
    try {
      const { data, error } = await supabase
        .from('referral_leads')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      setReferralLeads(prev => prev.map(lead => 
        lead.id === id ? { ...lead, ...data } : lead
      ));
      
      toast({
        title: "Success",
        description: "Lead updated successfully"
      });
      
      return data;
    } catch (err) {
      console.error('Error updating referral lead:', err);
      toast({
        title: "Error",
        description: "Failed to update lead",
        variant: "destructive"
      });
      return null;
    }
  }, [toast]);
  
  // Calculate analytics
  const calculateAnalytics = useCallback((): ReferralAnalytics => {
    const totalLinks = referralLinks.length;
    const activeLinks = referralLinks.filter(link => link.status === 'active').length;
    const totalClicks = referralLinks.reduce((sum, link) => sum + link.clicks, 0);
    const totalConversions = referralLinks.reduce((sum, link) => sum + link.conversions, 0);
    const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
    const totalRevenue = referralLeads
      .filter(lead => lead.status === 'closed_won')
      .reduce((sum, lead) => sum + lead.estimated_value, 0);
    const totalCommissions = referralLeads
      .filter(lead => lead.status === 'closed_won')
      .reduce((sum, lead) => sum + (lead.commission_amount || 0), 0);
    const averageDealSize = totalConversions > 0 ? totalRevenue / totalConversions : 0;
    
    const topPerformingLinks = [...referralLinks]
      .sort((a, b) => b.conversions - a.conversions)
      .slice(0, 5);
    
    const leadsByStatus = Object.entries(
      referralLeads.reduce((acc, lead) => {
        acc[lead.status] = acc[lead.status] || { count: 0, value: 0 };
        acc[lead.status].count++;
        acc[lead.status].value += lead.estimated_value;
        return acc;
      }, {} as Record<string, { count: number; value: number }>)
    ).map(([status, data]) => ({ status, ...data }));
    
    return {
      totalLinks,
      activeLinks,
      totalClicks,
      totalConversions,
      conversionRate,
      totalRevenue,
      totalCommissions,
      averageDealSize,
      topPerformingLinks,
      recentActivity: [],
      monthlyStats: [],
      leadsByStatus,
      performanceMetrics: {
        clickThroughRate: conversionRate,
        leadQualityScore: 85,
        averageTimeToClose: 30,
        customerLifetimeValue: averageDealSize * 1.5
      }
    };
  }, [referralLinks, referralLeads]);
  
  // Filter and sort data
  const filteredLeads = useMemo(() => {
    let filtered = [...referralLeads];
    
    if (filters.status?.length) {
      filtered = filtered.filter(lead => filters.status!.includes(lead.status));
    }
    
    if (filters.priority?.length) {
      filtered = filtered.filter(lead => filters.priority!.includes(lead.priority));
    }
    
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(lead => 
        lead.client_name.toLowerCase().includes(term) ||
        lead.client_email.toLowerCase().includes(term) ||
        lead.company_name?.toLowerCase().includes(term) ||
        lead.project_type.toLowerCase().includes(term)
      );
    }
    
    if (filters.dateRange) {
      filtered = filtered.filter(lead => {
        const leadDate = new Date(lead.created_at);
        const startDate = new Date(filters.dateRange!.start);
        const endDate = new Date(filters.dateRange!.end);
        return leadDate >= startDate && leadDate <= endDate;
      });
    }
    
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        const aVal = a[filters.sortBy as keyof ReferralLead];
        const bVal = b[filters.sortBy as keyof ReferralLead];
        const order = filters.sortOrder === 'desc' ? -1 : 1;
        
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return aVal.localeCompare(bVal) * order;
        }
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return (aVal - bVal) * order;
        }
        return 0;
      });
    }
    
    return filtered;
  }, [referralLeads, filters]);
  
  // Utility functions
  const generateLinkCode = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };
  
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Link copied to clipboard"
      });
    } catch (err) {
      console.error('Failed to copy:', err);
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive"
      });
    }
  };
  
  // Initialize data
  useEffect(() => {
    if (user?.id) {
      fetchReferralLinks();
      fetchReferralLeads();
    }
  }, [user?.id, fetchReferralLinks, fetchReferralLeads]);
  
  // Update analytics when data changes
  useEffect(() => {
    setAnalytics(calculateAnalytics());
  }, [calculateAnalytics]);
  
  return {
    // Data
    referralLinks,
    referralLeads: filteredLeads,
    analytics,
    loading,
    error,
    filters,
    
    // Actions
    createReferralLink,
    updateReferralLink,
    deleteReferralLink,
    createReferralLead,
    updateReferralLead,
    setFilters,
    copyToClipboard,
    
    // Utilities
    refetch: () => {
      fetchReferralLinks();
      fetchReferralLeads();
    }
  };
};

export default useReferralsManagement; 