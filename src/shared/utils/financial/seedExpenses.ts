
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { addMultipleTransactions } from './transactionModifications';
import { toast } from '@/components/ui/use-toast';

const sampleExpenses = [
  {
    description: "Virgin Media Internet",
    amount: 132.50,
    date: "2024-01-05",
    category: "Utilities",
    vendor: "Virgin Media",
    type: "expense" as const
  },
  {
    description: "Notion Subscription",
    amount: 50.90,
    date: "2024-01-11",
    category: "Services",
    vendor: "Notion",
    type: "expense" as const
  },
  {
    description: "Google Play Store",
    amount: 19.60,
    date: "2024-01-12",
    category: "Services",
    vendor: "Google",
    type: "expense" as const
  },
  {
    description: "OpenAI Subscription",
    amount: 56.45,
    date: "2024-01-12",
    category: "Services",
    vendor: "OpenAI",
    type: "expense" as const
  },
  {
    description: "Airtable Subscription",
    amount: 19.07,
    date: "2024-01-13",
    category: "Services",
    vendor: "Airtable",
    type: "expense" as const
  },
  {
    description: "Midjourney Subscription",
    amount: 9.57,
    date: "2024-01-27",
    category: "Services",
    vendor: "Midjourney",
    type: "expense" as const
  },
  {
    description: "FlutterFlow Subscription",
    amount: 55.04,
    date: "2024-01-31",
    category: "Services",
    vendor: "FlutterFlow",
    type: "expense" as const
  },
  {
    description: "Google Services",
    amount: 10.00,
    date: "2024-02-13",
    category: "Services",
    vendor: "Google",
    type: "expense" as const
  },
  {
    description: "Notion Additional Services",
    amount: 5.59,
    date: "2024-02-24",
    category: "Services",
    vendor: "Notion",
    type: "expense" as const
  },
  {
    description: "TradingView Subscription",
    amount: 35.94,
    date: "2024-02-28",
    category: "Services",
    vendor: "TradingView",
    type: "expense" as const
  },
  {
    description: "Make Subscription",
    amount: 8.41,
    date: "2024-02-29",
    category: "Services",
    vendor: "Make",
    type: "expense" as const
  },
  {
    description: "Google Cloud Services",
    amount: 2.00,
    date: "2024-03-01",
    category: "Services",
    vendor: "Google Cloud",
    type: "expense" as const
  },
  {
    description: "Google Services",
    amount: 9.72,
    date: "2024-03-01",
    category: "Services",
    vendor: "Google",
    type: "expense" as const
  },
  {
    description: "OpenAI API Usage",
    amount: 4.81,
    date: "2024-03-02",
    category: "Services",
    vendor: "OpenAI",
    type: "expense" as const
  },
  {
    description: "Virgin Media Services",
    amount: 65.50,
    date: "2024-03-07",
    category: "Utilities",
    vendor: "Virgin Media",
    type: "expense" as const
  },
  {
    description: "FlutterFlow Platform",
    amount: 55.16,
    date: "2024-03-09",
    category: "Services",
    vendor: "FlutterFlow",
    type: "expense" as const
  },
  {
    description: "Companies House Filing",
    amount: 12.00,
    date: "2024-03-09",
    category: "Services",
    vendor: "Companies House",
    type: "expense" as const
  },
  {
    description: "Notion Workspace",
    amount: 19.29,
    date: "2024-03-23",
    category: "Services",
    vendor: "Notion",
    type: "expense" as const
  },
  {
    description: "OpenAI Usage",
    amount: 19.09,
    date: "2024-03-24",
    category: "Services",
    vendor: "OpenAI",
    type: "expense" as const
  },
  {
    description: "Medium Subscription",
    amount: 4.02,
    date: "2024-03-29",
    category: "Services",
    vendor: "Medium",
    type: "expense" as const
  },
  {
    description: "Envato Elements",
    amount: 30.82,
    date: "2024-03-30",
    category: "Services",
    vendor: "Envato",
    type: "expense" as const
  },
  {
    description: "Akismet Service 1",
    amount: 187.20,
    date: "2024-03-30",
    category: "Services",
    vendor: "Akismet",
    type: "expense" as const
  },
  {
    description: "Akismet Service 2",
    amount: 70.56,
    date: "2024-03-30",
    category: "Services",
    vendor: "Akismet",
    type: "expense" as const
  },
  {
    description: "Notion Team Plan",
    amount: 19.04,
    date: "2024-03-31",
    category: "Services",
    vendor: "Notion",
    type: "expense" as const
  },
  {
    description: "Elementor Pro",
    amount: 78.55,
    date: "2024-04-01",
    category: "Services",
    vendor: "Elementor",
    type: "expense" as const
  },
  {
    description: "Replicate API",
    amount: 2.83,
    date: "2024-04-09",
    category: "Services",
    vendor: "Replicate",
    type: "expense" as const
  },
  {
    description: "OpenAI Credits",
    amount: 9.82,
    date: "2024-04-23",
    category: "Services",
    vendor: "OpenAI",
    type: "expense" as const
  },
  {
    description: "OpenAI Additional Credits",
    amount: 19.24,
    date: "2024-04-25",
    category: "Services",
    vendor: "OpenAI",
    type: "expense" as const
  },
  {
    description: "Virgin Media Broadband",
    amount: 94.54,
    date: "2024-05-11",
    category: "Utilities",
    vendor: "Virgin Media",
    type: "expense" as const
  },
  {
    description: "Virgin Media TV",
    amount: 94.54,
    date: "2024-05-11",
    category: "Utilities",
    vendor: "Virgin Media",
    type: "expense" as const
  },
  {
    description: "Google Drive Storage",
    amount: 1.59,
    date: "2024-05-12",
    category: "Services",
    vendor: "Google",
    type: "expense" as const
  },
  {
    description: "Manychat Pro",
    amount: 12.13,
    date: "2024-05-12",
    category: "Services",
    vendor: "Manychat",
    type: "expense" as const
  },
  {
    description: "Medium Membership",
    amount: 3.99,
    date: "2024-05-13",
    category: "Services",
    vendor: "Medium",
    type: "expense" as const
  },
  {
    description: "Apify Services",
    amount: 5.73,
    date: "2024-05-25",
    category: "Services",
    vendor: "Apify",
    type: "expense" as const
  },
  {
    description: "OpenAI Monthly",
    amount: 19.09,
    date: "2024-05-26",
    category: "Services",
    vendor: "OpenAI",
    type: "expense" as const
  },
  {
    description: "Notion Premium",
    amount: 18.88,
    date: "2024-05-27",
    category: "Services",
    vendor: "Notion",
    type: "expense" as const
  },
  {
    description: "Medium Pro",
    amount: 3.91,
    date: "2024-06-12",
    category: "Services",
    vendor: "Medium",
    type: "expense" as const
  },
  {
    description: "Airtable Plus",
    amount: 18.79,
    date: "2024-06-12",
    category: "Services",
    vendor: "Airtable",
    type: "expense" as const
  },
  {
    description: "Tempmail Service",
    amount: 9.62,
    date: "2024-06-23",
    category: "Services",
    vendor: "Tempmail",
    type: "expense" as const
  },
  {
    description: "Notion Business",
    amount: 19.04,
    date: "2024-06-26",
    category: "Services",
    vendor: "Notion",
    type: "expense" as const
  },
  {
    description: "Marsproxy Service",
    amount: 3.97,
    date: "2024-06-26",
    category: "Services",
    vendor: "Marsproxy",
    type: "expense" as const
  },
  {
    description: "OpenAI Usage",
    amount: 11.89,
    date: "2024-06-28",
    category: "Services",
    vendor: "OpenAI",
    type: "expense" as const
  },
  {
    description: "Medium Premium",
    amount: 4.01,
    date: "2024-06-29",
    category: "Services",
    vendor: "Medium",
    type: "expense" as const
  },
  {
    description: "OpenAI Monthly",
    amount: 19.23,
    date: "2024-06-29",
    category: "Services",
    vendor: "OpenAI",
    type: "expense" as const
  },
  {
    description: "OAI Widget",
    amount: 4.01,
    date: "2024-06-30",
    category: "Services",
    vendor: "Oai Widget",
    type: "expense" as const
  },
  {
    description: "WP Starter Pack",
    amount: 4.25,
    date: "2024-07-04",
    category: "Services",
    vendor: "WPstarterPack",
    type: "expense" as const
  },
  {
    description: "Virgin Media Services",
    amount: 51.14,
    date: "2024-07-08",
    category: "Utilities",
    vendor: "Virgin Media",
    type: "expense" as const
  },
  {
    description: "AWS Services",
    amount: 3.56,
    date: "2024-07-13",
    category: "Services",
    vendor: "Amazon Web Services",
    type: "expense" as const
  },
  {
    description: "Render Hosting",
    amount: 14.94,
    date: "2024-07-15",
    category: "Services",
    vendor: "Render",
    type: "expense" as const
  },
  {
    description: "ElevenLabs Voice AI",
    amount: 10.24,
    date: "2024-07-23",
    category: "Services",
    vendor: "ElevenLabs",
    type: "expense" as const
  },
  {
    description: "Google Services",
    amount: 9.72,
    date: "2024-07-25",
    category: "Services",
    vendor: "Google",
    type: "expense" as const
  },
  {
    description: "Loom Pro",
    amount: 15.74,
    date: "2024-07-27",
    category: "Services",
    vendor: "Loom",
    type: "expense" as const
  },
  {
    description: "Google Workspace",
    amount: 7.99,
    date: "2024-07-29",
    category: "Services",
    vendor: "Google",
    type: "expense" as const
  },
  {
    description: "OpenAI Monthly",
    amount: 18.84,
    date: "2024-08-01",
    category: "Services",
    vendor: "OpenAI",
    type: "expense" as const
  },
  {
    description: "Google One",
    amount: 9.72,
    date: "2024-08-08",
    category: "Services",
    vendor: "Google",
    type: "expense" as const
  },
  {
    description: "Kode Lab Service 1",
    amount: 2.37,
    date: "2024-08-11",
    category: "Services",
    vendor: "Kode Lab",
    type: "expense" as const
  },
  {
    description: "Kode Lab Service 2",
    amount: 2.37,
    date: "2024-08-11",
    category: "Services",
    vendor: "Kode Lab",
    type: "expense" as const
  },
  {
    description: "Kode Lab Service 3",
    amount: 7.85,
    date: "2024-08-13",
    category: "Services",
    vendor: "Kode Lab",
    type: "expense" as const
  },
  {
    description: "Kode Lab Service 4",
    amount: 7.79,
    date: "2024-08-16",
    category: "Services",
    vendor: "Kode Lab",
    type: "expense" as const
  },
  {
    description: "Notion Team",
    amount: 15.80,
    date: "2024-08-29",
    category: "Services",
    vendor: "Notion",
    type: "expense" as const
  },
  {
    description: "Kode Lab Pro",
    amount: 15.25,
    date: "2024-09-02",
    category: "Services",
    vendor: "Kode Lab",
    type: "expense" as const
  },
  {
    description: "Esuit Dev Basic Plan 1",
    amount: 3.84,
    date: "2024-09-11",
    category: "Services",
    vendor: "Esuit",
    type: "expense" as const
  },
  {
    description: "OpenAI Services",
    amount: 18.52,
    date: "2024-09-15",
    category: "Services",
    vendor: "OpenAI",
    type: "expense" as const
  },
  {
    description: "ElevenLabs Basic",
    amount: 4.59,
    date: "2024-09-16",
    category: "Services",
    vendor: "ElevenLabs",
    type: "expense" as const
  },
  {
    description: "ElevenLabs Pro",
    amount: 23.98,
    date: "2024-09-22",
    category: "Services",
    vendor: "ElevenLabs",
    type: "expense" as const
  },
  {
    description: "Esuit Dev Basic Plan 2",
    amount: 3.83,
    date: "2024-10-11",
    category: "Services",
    vendor: "Esuit",
    type: "expense" as const
  },
  {
    description: "OpenAI Credits",
    amount: 18.50,
    date: "2024-10-16",
    category: "Services",
    vendor: "OpenAI",
    type: "expense" as const
  },
  {
    description: "Manychat Premium",
    amount: 11.57,
    date: "2024-10-30",
    category: "Services",
    vendor: "Manychat",
    type: "expense" as const
  },
  {
    description: "Google Storage",
    amount: 1.59,
    date: "2024-11-02",
    category: "Services",
    vendor: "Google",
    type: "expense" as const
  },
  {
    description: "Virgin Media Bundle",
    amount: 47.59,
    date: "2024-11-08",
    category: "Utilities",
    vendor: "Virgin Media",
    type: "expense" as const
  },
  {
    description: "OpenAI Usage 1",
    amount: 9.52,
    date: "2024-11-14",
    category: "Services",
    vendor: "OpenAI",
    type: "expense" as const
  },
  {
    description: "OpenAI Usage 2",
    amount: 9.52,
    date: "2024-11-14",
    category: "Services",
    vendor: "OpenAI",
    type: "expense" as const
  },
  {
    description: "OpenAI Usage 3",
    amount: 19.28,
    date: "2024-11-16",
    category: "Services",
    vendor: "OpenAI",
    type: "expense" as const
  },
  {
    description: "OpenAI Usage 4",
    amount: 19.28,
    date: "2024-11-16",
    category: "Services",
    vendor: "OpenAI",
    type: "expense" as const
  },
  {
    description: "Lovable Service 1",
    amount: 22.52,
    date: "2024-12-01",
    category: "Services",
    vendor: "Lovable",
    type: "expense" as const
  },
  {
    description: "Lovable Service 2",
    amount: 35.30,
    date: "2024-12-01",
    category: "Services",
    vendor: "Lovable",
    type: "expense" as const
  },
  {
    description: "Lovable Service 3",
    amount: 16.59,
    date: "2024-12-01",
    category: "Services",
    vendor: "Lovable",
    type: "expense" as const
  },
  {
    description: "Lovable Service 4",
    amount: 0.60,
    date: "2024-12-02",
    category: "Services",
    vendor: "Lovable",
    type: "expense" as const
  },
  {
    description: "OpenAI Monthly",
    amount: 19.36,
    date: "2024-12-10",
    category: "Services",
    vendor: "OpenAI",
    type: "expense" as const
  },
  {
    description: "Voiceflow SaaS",
    amount: 39.92,
    date: "2024-12-13",
    category: "Services",
    vendor: "Voiceflow",
    type: "expense" as const
  },
  {
    description: "Midjourney Sub",
    amount: 9.57,
    date: "2024-12-24",
    category: "Services",
    vendor: "Midjourney",
    type: "expense" as const
  },
  {
    description: "Manychat Basic",
    amount: 0.87,
    date: "2024-12-29",
    category: "Services",
    vendor: "Manychat",
    type: "expense" as const
  },
  {
    description: "Notion Premium",
    amount: 19.07,
    date: "2024-12-31",
    category: "Services",
    vendor: "Notion",
    type: "expense" as const
  },
  {
    description: "Proxy Services Basic",
    amount: 5.73,
    date: "2025-01-02",
    category: "Services",
    vendor: "Proxy Services",
    type: "expense" as const
  },
  {
    description: "Supabase Platform",
    amount: 19.93,
    date: "2025-01-02",
    category: "Services",
    vendor: "Supabase",
    type: "expense" as const
  },
  {
    description: "OpenAI API",
    amount: 19.14,
    date: "2025-01-02",
    category: "Services",
    vendor: "OpenAI",
    type: "expense" as const
  },
  {
    description: "Google Drive",
    amount: 1.59,
    date: "2025-01-02",
    category: "Services",
    vendor: "Google",
    type: "expense" as const
  },
  {
    description: "GoDaddy Domain",
    amount: 10.07,
    date: "2025-01-02",
    category: "Services",
    vendor: "GoDaddy",
    type: "expense" as const
  },
  {
    description: "OpenAI Credits",
    amount: 19.69,
    date: "2025-01-02",
    category: "Services",
    vendor: "OpenAI",
    type: "expense" as const
  },
  {
    description: "Vercel Hosting",
    amount: 7.99,
    date: "2025-01-02",
    category: "Services",
    vendor: "Vercel",
    type: "expense" as const
  },
  {
    description: "Google Workspace",
    amount: 10.00,
    date: "2025-01-02",
    category: "Services",
    vendor: "Google",
    type: "expense" as const
  },
  {
    description: "Virgin Media Services",
    amount: 38.58,
    date: "2025-01-02",
    category: "Utilities",
    vendor: "Virgin Media",
    type: "expense" as const
  },
  {
    description: "Proxy Services Pro 1",
    amount: 8.06,
    date: "2025-01-02",
    category: "Services",
    vendor: "Proxy Services",
    type: "expense" as const
  },
  {
    description: "Proxy Services Pro 2",
    amount: 4.03,
    date: "2025-01-02",
    category: "Services",
    vendor: "Proxy Services",
    type: "expense" as const
  },
  {
    description: "Vercel Pro",
    amount: 15.97,
    date: "2025-01-02",
    category: "Services",
    vendor: "Vercel",
    type: "expense" as const
  },
  {
    description: "Lovable Service 5",
    amount: 20.99,
    date: "2025-01-02",
    category: "Services",
    vendor: "Lovable",
    type: "expense" as const
  },
  {
    description: "Lovable Service 6",
    amount: 15.95,
    date: "2025-01-02",
    category: "Services",
    vendor: "Lovable",
    type: "expense" as const
  },
  {
    description: "Proxy Services Premium",
    amount: 8.02,
    date: "2025-02-01",
    category: "Services",
    vendor: "Proxy Services",
    type: "expense" as const
  },
  {
    description: "Lovable Service 7",
    amount: 53.06,
    date: "2025-02-01",
    category: "Services",
    vendor: "Lovable",
    type: "expense" as const
  },
  {
    description: "Lovable Service 8",
    amount: 30.90,
    date: "2025-02-17",
    category: "Services",
    vendor: "Lovable",
    type: "expense" as const
  },
  {
    description: "Lovable Service 9",
    amount: 8.39,
    date: "2025-03-02",
    category: "Services",
    vendor: "Lovable",
    type: "expense" as const
  },
  {
    description: "Cursor Pro",
    amount: 16.05,
    date: "2025-03-12",
    category: "Services",
    vendor: "Cursor",
    type: "expense" as const
  },
  {
    description: "Sim Cards 20",
    amount: 20.00,
    date: "2025-01-22",
    category: "Equipment",
    vendor: "Mobile Provider",
    type: "expense" as const
  },
  {
    description: "GCP Services",
    amount: 20.00,
    date: "2025-01-22",
    category: "Services",
    vendor: "Google Cloud Platform",
    type: "expense" as const
  },
  {
    description: "10 Sim Cards",
    amount: 5.00,
    date: "2025-04-07",
    category: "Equipment",
    vendor: "Mobile Provider",
    type: "expense" as const
  },
  {
    description: "Lovable Service 10",
    amount: 58.60,
    date: "2025-03-31",
    category: "Services",
    vendor: "Lovable",
    type: "expense" as const
  },
  {
    description: "Lovable Service 11",
    amount: 34.00,
    date: "2025-04-30",
    category: "Services",
    vendor: "Lovable",
    type: "expense" as const
  }
];

/**
 * Seeds initial sample expenses with improved error handling
 */
export async function seedInitialExpenses(): Promise<boolean> {
  try {
    // Check if expenses already exist to prevent duplicates
    const { count, error: countError } = await supabase
      .from('financial_transactions')
      .select('*', { count: 'exact' });

    if (countError) {
      console.error("Error checking existing expenses:", countError);
      toast({
        title: "Error",
        description: "Failed to check existing expenses",
        variant: "destructive"
      });
      return false;
    }

    // Only seed if no existing expenses
    if (count === 0) {
      const result = await addMultipleTransactions(sampleExpenses);
      
      if (result) {
        toast({
          title: "Success",
          description: `${sampleExpenses.length} expenses added successfully`,
        });
        return true;
      }
    } else {
      toast({
        title: "Info",
        description: `${count} expenses already exist. Skipping seeding.`,
      });
      return false;
    }
  } catch (error) {
    console.error("Comprehensive error seeding expenses:", error);
    toast({
      title: "Error",
      description: "Failed to seed sample expenses",
      variant: "destructive"
    });
    return false;
  }
}
