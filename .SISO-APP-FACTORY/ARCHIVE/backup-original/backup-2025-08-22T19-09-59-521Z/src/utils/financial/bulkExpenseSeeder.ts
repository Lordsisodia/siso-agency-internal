
import { supabase } from "@/integrations/supabase/client";

// List of raw expense lines from the user
const rawExpenses = [
  ["Virgin Media", "£132.50", "5/1/2024"],
  ["Notion", "£50.90", "11/1/2024"],
  ["Google Play", "£19.60", "12/1/2024"],
  ["OpenAI", "£56.45", "12/1/2024"],
  ["Airtable", "£19.07", "13/1/2024"],
  ["Midjourney", "£9.57", "27/1/2024"],
  ["FlutterFlow", "£55.04", "31/1/2024"],
  ["Google", "£10.00", "13/2/2024"],
  ["Notion", "£5.59", "24/2/2024"],
  ["TradingView", "£35.94", "28/2/2024"],
  ["Make", "£8.41", "29/2/2024"],
  ["Google Cloud", "£2.00", "1/3/2024"],
  ["Google", "£9.72", "1/3/2024"],
  ["OpenAI", "£4.81", "2/3/2024"],
  ["Virgin Media", "£65.50", "7/3/2024"],
  ["FlutterFlow", "£55.16", "9/3/2024"],
  ["Companies House", "£12.00", "9/3/2024"],
  ["Notion", "£19.29", "23/3/2024"],
  ["OpenAI", "£19.09", "24/3/2024"],
  ["Medium", "£4.02", "29/3/2024"],
  ["Envato", "£30.82", "30/3/2024"],
  ["Akismet", "£187.20", "30/3/2024"],
  ["Akismet", "£70.56", "30/3/2024"],
  ["Notion", "£19.04", "31/3/2024"],
  ["Elementor", "£78.55", "1/4/2024"],
  ["Replicate", "£2.83", "9/4/2024"],
  ["OpenAI", "£9.82", "23/4/2024"],
  ["OpenAI", "£19.24", "25/4/2024"],
  ["Virgin Media", "£94.54", "11/5/2024"],
  ["Virgin Media", "£94.54", "11/5/2024"],
  ["Google Drive", "£1.59", "12/5/2024"],
  ["Manychat", "£12.13", "12/5/2024"],
  ["Medium", "£3.99", "13/5/2024"],
  ["Apify", "£5.73", "25/5/2024"],
  ["OpenAI", "£19.09", "26/5/2024"],
  ["Notion", "£18.88", "27/5/2024"],
  ["Medium", "£3.91", "12/6/2024"],
  ["Airtable", "£18.79", "12/6/2024"],
  ["Tempmail", "£9.62", "23/6/2024"],
  ["Notion", "£19.04", "26/6/2024"],
  ["Marsproxy", "£3.97", "26/6/2024"],
  ["OpenAI", "£11.89", "28/6/2024"],
  ["Medium", "£4.01", "29/6/2024"],
  ["OpenAI", "£19.23", "29/6/2024"],
  ["Oai Widget", "£4.01", "30/6/2024"],
  ["WPstarterPack", "£4.25", "4/7/2024"],
  ["Virgin Media", "£51.14", "8/7/2024"],
  ["Amazon Web Services", "£3.56", "13/7/2024"],
  ["Render", "£14.94", "15/7/2024"],
  ["ElevenLabs", "£10.24", "23/7/2024"],
  ["Google", "£9.72", "25/7/2024"],
  ["Loom", "£15.74", "27/7/2024"],
  ["Google Workspace", "£7.99", "29/7/2024"],
  ["OpenAI", "£18.84", "1/8/2024"],
  ["Google", "£9.72", "8/8/2024"],
  ["Kode Lab", "£2.37", "11/8/2024"],
  ["Kode Lab", "£2.37", "11/8/2024"],
  ["Kode Lab", "£7.85", "13/8/2024"],
  ["Kode Lab", "£7.79", "16/8/2024"],
  ["Notion", "£15.80", "29/8/2024"],
  ["Kode Lab", "£15.25", "2/9/2024"],
  ["Esuit Dev Basic Plan", "£3.84", "11/9/2024"],
  ["OpenAI", "£18.52", "15/9/2024"],
  ["ElevenLabs", "£4.59", "16/9/2024"],
  ["ElevenLabs", "£23.98", "22/9/2024"],
  ["Esuit Dev Basic Plan", "£3.83", "11/10/2024"],
  ["OpenAI", "£18.50", "16/10/2024"],
  ["Manychat", "£11.57", "30/10/2024"],
  ["Google", "£1.59", "2/11/2024"],
  ["Virgin Media", "£47.59", "8/11/2024"],
  ["OpenAI", "£9.52", "14/11/2024"],
  ["OpenAI", "£9.52", "14/11/2024"],
  ["OpenAI", "£19.28", "16/11/2024"],
  ["OpenAI", "£19.28", "16/11/2024"],
  ["Lovable", "£22.52", "1/12/2024"],
  ["Lovable", "£35.30", "1/12/2024"],
  ["Lovable", "£16.59", "1/12/2024"],
  ["Lovable", "£0.60", "2/12/2024"],
  ["OpenAI", "£19.36", "10/12/2024"],
  ["Voiceflow SaaS", "£39.92", "13/12/2024"],
  ["Midjourney", "£9.57", "24/12/2024"],
  ["Manychat", "£0.87", "29/12/2024"],
  ["Notion", "£19.07", "31/12/2024"],
  ["Proxy Services", "£5.73", "2/1/2025"],
  ["Supabase", "£19.93", "2/1/2025"],
  ["OpenAI", "£19.14", "2/1/2025"],
  ["Google", "£1.59", "2/1/2025"],
  ["GoDaddy", "£10.07", "2/1/2025"],
  ["OpenAI", "£19.69", "2/1/2025"],
  ["Vercel", "£7.99", "2/1/2025"],
  ["Google Workspace", "£10.00", "2/1/2025"],
  ["Virgin Media", "£38.58", "2/1/2025"],
  ["Proxy Services", "£8.06", "2/1/2025"],
  ["Proxy Services", "£4.03", "2/1/2025"],
  ["Vercel", "£15.97", "2/1/2025"],
  ["Lovable", "£20.99", "2/1/2025"],
  ["Lovable", "£15.95", "2/1/2025"],
  ["Proxy Services", "£8.02", "1/2/2025"],
  ["Lovable", "£53.06", "1/2/2025"],
  ["Lovable", "£30.90", "17/2/2025"],
  ["Lovable", "£8.39", "2/3/2025"],
  ["Cursor", "£16.05", "12/3/2025"],
  ["Sim Cards 20", "£20.00", "22/1/2025"],
  ["GCP", "£20.00", "22/1/2025"],
  ["10 Sim cards", "£5.00", "7/4/2025"],
  ["Lovable", "£58.60", "31/3/2025"],
  ["Lovable", "£34.00", "30/4/2025"],
];

function parseDate(d: string): string {
  // Converts dd/mm/yyyy to yyyy-mm-dd
  const [day, month, year] = d.split("/");
  if (day && month && year) {
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }
  return d;
}

function parseAmount(a: string): number {
  return parseFloat(a.replace("£", "").replace(",", ""));
}

/**
 * Inserts all expenses as 'expense' transactions into financial_transactions.
 * Call in your dev console or via a temp UI button.
 */
export async function seedExpensesFromList() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("You must be logged in to bulk-insert expenses.");
  }
  // Prepare expense rows
  const mappedExpenses = rawExpenses.map(([desc, amt, date]) => ({
    description: desc,
    amount: parseAmount(amt),
    date: parseDate(date),
    type: "expense",
    currency: "GBP",
    status: "completed",
    notes: "",
    user_id: user.id,
    // No category_id, vendor_id, payment_method_id in this fast import
    recurring_type: "one-time"
  }));

  // Insert in small batches to avoid hitting limits
  const CHUNK_SIZE = 40;
  for (let i = 0; i < mappedExpenses.length; i += CHUNK_SIZE) {
    const chunk = mappedExpenses.slice(i, i + CHUNK_SIZE);
    // Insert batch
    const { error } = await supabase
      .from("financial_transactions")
      .insert(chunk);
    if (error) {
      console.error("Insert error:", error, "Chunk:", chunk);
      throw error;
    }
  }
  return true;
}

// If called directly, will seed all expenses
if (typeof window !== "undefined") {
  // @ts-ignore
  window.seedExpensesFromList = seedExpensesFromList;
}
