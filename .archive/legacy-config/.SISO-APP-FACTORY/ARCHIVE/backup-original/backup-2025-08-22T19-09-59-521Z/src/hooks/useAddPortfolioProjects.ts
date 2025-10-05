
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuthSession } from '@/hooks/useAuthSession';

export const useAddPortfolioProjects = () => {
  const { toast } = useToast();
  const { user } = useAuthSession();

  const addProjects = useCallback(async () => {
    if (!user?.id) {
      toast({
        title: "Authentication required",
        description: "Please login to add projects",
        variant: "destructive"
      });
      return;
    }

    const projects = [
      {
        title: "Gritness Gym",
        description: "A comprehensive gym management platform",
        category_id: await getCategoryId('gym-fitness'),
        client_name: "Nick Merson",
        client_source: "Personal Network",
        project_status: "Pending",
        development_status: "In Progress",
        notion_url: "https://sprout-draw-9ec.notion.site/Gym-Client-1b549797be6880a9a8bbdae7bd70e8d7?pvs=4",
        live_url: "https://gritnessgym.vercel.app/",
        invoice_status: "Not Invoiced",
        user_id: user.id
      },
      {
        title: "NM Construction",
        description: "Construction project management application",
        category_id: await getCategoryId('construction'),
        client_name: "Nick Merson",
        client_source: "Personal Network",
        project_status: "Pending",
        development_status: "In Progress",
        notion_url: "https://sprout-draw-9ec.notion.site/APP-PLAN-1c149797be6880eb9ddcea624886102e?pvs=4",
        live_url: "https://nm-construction.vercel.app/",
        invoice_status: "Not Invoiced",
        user_id: user.id
      },
      {
        title: "OPTIMAL CONSTRUCTION",
        description: "Construction and maintenance management system",
        category_id: await getCategoryId('construction'),
        client_name: "Nick Merson",
        client_source: "Personal Network",
        project_status: "Pending",
        development_status: "In Progress",
        notion_url: "https://sprout-draw-9ec.notion.site/Optimal-Construction-App-Plan-1c449797be688094a7f4caed01d5c992?pvs=4",
        live_url: "https://optimal-building-maintenance.vercel.app/",
        invoice_status: "Not Invoiced",
        user_id: user.id
      },
      {
        title: "UbahCryp",
        description: "Web3 trading platform",
        category_id: await getCategoryId('web3'),
        client_name: "SISO",
        client_source: "Snapchat",
        project_status: "Confirmed",
        development_status: "Completed",
        notion_url: "https://sprout-draw-9ec.notion.site/APP-PLAN-1c349797be6880a18876de37e53f1c61?pvs=4",
        live_url: "https://ubahcrypcom.vercel.app/",
        invoice_status: "Not Invoiced",
        user_id: user.id
      },
      {
        title: "Elementree",
        description: "Restaurant management system",
        category_id: await getCategoryId('restaurant'),
        client_name: "ALJ",
        client_source: "Personal Network",
        project_status: "Pending",
        development_status: "In Progress",
        notion_url: "https://sprout-draw-9ec.notion.site/Elementree-Client-1be49797be688097a460d838c4db0178?pvs=4",
        live_url: "https://elementree.vercel.app/",
        invoice_status: "Not Invoiced",
        user_id: user.id
      },
      {
        title: "Trojan MMA",
        description: "MMA gym management platform",
        category_id: await getCategoryId('martial-arts'),
        client_name: "IBBY",
        client_source: "Personal Network",
        project_status: "Pending",
        development_status: "In Progress",
        notion_url: "https://sprout-draw-9ec.notion.site/Trojan-MMA-Client-1bd49797be688012965cf72cea1aa939?pvs=4",
        live_url: "https://trojan-mma.vercel.app/",
        invoice_status: "Not Invoiced",
        user_id: user.id
      },
      {
        title: "Lets go",
        description: "Social networking application",
        category_id: await getCategoryId('web3'),
        client_name: "Stevie",
        client_source: "Personal Network",
        project_status: "Confirmed",
        development_status: "In Progress",
        notion_url: "https://sprout-draw-9ec.notion.site/APP-PLAN-1c249797be6880619c93e589737f78ae?pvs=4",
        live_url: "https://lets-go-u7hh.vercel.app/",
        invoice_status: "Not Invoiced",
        user_id: user.id
      },
      {
        title: "Mu Shin",
        description: "Self Defense Course Platform",
        category_id: await getCategoryId('martial-arts'),
        client_name: "SISO",
        client_source: "Personal Network",
        project_status: "Declined",
        development_status: "Completed",
        notion_url: "https://sprout-draw-9ec.notion.site/Martial-Arts-Court-Client-1bd49797be68805d9002d52c394cebbb?pvs=4",
        live_url: "https://siso-mu-shin.vercel.app/",
        invoice_status: "Not Invoiced",
        user_id: user.id
      },
      {
        title: "5 Star Hire",
        description: "Car hire management system",
        category_id: await getCategoryId('car-hire'),
        client_name: "Nick Merson",
        client_source: "Personal Network",
        project_status: "Pending",
        development_status: "In Progress",
        notion_url: "https://sprout-draw-9ec.notion.site/APP-PLAN-1c149797be688001b792ee95b65ce6fb?pvs=4",
        live_url: "https://5-star-hire.vercel.app/",
        invoice_status: "Not Invoiced",
        user_id: user.id
      }
    ];

    try {
      const { error } = await supabase
        .from('portfolio_items')
        .insert(projects);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Projects have been added to your portfolio",
      });
    } catch (error) {
      console.error('Error adding projects:', error);
      toast({
        title: "Error",
        description: "Failed to add projects. Please try again.",
        variant: "destructive"
      });
    }
  }, [user, toast]);

  return { addProjects };
};

async function getCategoryId(slug: string): Promise<string> {
  const { data } = await supabase
    .from('portfolio_categories')
    .select('id')
    .eq('slug', slug)
    .single();
  
  return data?.id;
}
