
import { FinancialTransaction } from "./types";

// Define software expense categories
export const SOFTWARE_CATEGORIES = {
  SAAS: "SaaS",
  DEVELOPMENT: "Development Tools",
  AI_TOOLS: "AI Tools",
  CLOUD: "Cloud Services",
  HOSTING: "Hosting & Domains",
  COMMUNICATION: "Communication",
  DESIGN: "Design Tools",
  PRODUCTIVITY: "Productivity",
  SUBSCRIPTION: "Subscriptions",
  OTHER_SOFTWARE: "Other Software"
};

// Define other common categories
export const OTHER_CATEGORIES = {
  UTILITIES: "Utilities",
  MARKETING: "Marketing",
  SERVICES: "Services",
  HARDWARE: "Hardware",
  OFFICE: "Office Expenses",
  TRAVEL: "Travel & Entertainment",
  UNCATEGORIZED: "Uncategorized"
};

// Keywords mapping to categories
export const VENDOR_CATEGORY_MAPPING = {
  // SaaS
  "notion": SOFTWARE_CATEGORIES.SAAS,
  "airtable": SOFTWARE_CATEGORIES.SAAS,
  "manychat": SOFTWARE_CATEGORIES.SAAS,
  "loom": SOFTWARE_CATEGORIES.SAAS,
  "tempmail": SOFTWARE_CATEGORIES.SAAS,
  "make": SOFTWARE_CATEGORIES.SAAS,
  "esuit": SOFTWARE_CATEGORIES.SAAS,
  
  // Development Tools
  "supabase": SOFTWARE_CATEGORIES.DEVELOPMENT,
  "render": SOFTWARE_CATEGORIES.DEVELOPMENT,
  "vercel": SOFTWARE_CATEGORIES.DEVELOPMENT,
  "flutterflow": SOFTWARE_CATEGORIES.DEVELOPMENT,
  "kode lab": SOFTWARE_CATEGORIES.DEVELOPMENT,
  "cursor": SOFTWARE_CATEGORIES.DEVELOPMENT,
  
  // AI Tools
  "openai": SOFTWARE_CATEGORIES.AI_TOOLS,
  "elevenlabs": SOFTWARE_CATEGORIES.AI_TOOLS,
  "replicate": SOFTWARE_CATEGORIES.AI_TOOLS,
  "midjourney": SOFTWARE_CATEGORIES.AI_TOOLS,
  "lovable": SOFTWARE_CATEGORIES.AI_TOOLS,
  "oai widget": SOFTWARE_CATEGORIES.AI_TOOLS,
  
  // Cloud Services
  "google cloud": SOFTWARE_CATEGORIES.CLOUD,
  "aws": SOFTWARE_CATEGORIES.CLOUD,
  "amazon web services": SOFTWARE_CATEGORIES.CLOUD,
  "gcp": SOFTWARE_CATEGORIES.CLOUD,
  "google drive": SOFTWARE_CATEGORIES.CLOUD,
  
  // Hosting & Domains
  "godaddy": SOFTWARE_CATEGORIES.HOSTING,
  "akismet": SOFTWARE_CATEGORIES.HOSTING,
  "elementor": SOFTWARE_CATEGORIES.HOSTING,
  "wpstarterpack": SOFTWARE_CATEGORIES.HOSTING,
  
  // Communication
  "google workspace": SOFTWARE_CATEGORIES.COMMUNICATION,
  "voiceflow": SOFTWARE_CATEGORIES.COMMUNICATION,
  
  // Design Tools
  "envato": SOFTWARE_CATEGORIES.DESIGN,
  
  // Productivity
  "tradingview": SOFTWARE_CATEGORIES.PRODUCTIVITY,
  
  // Subscriptions
  "medium": SOFTWARE_CATEGORIES.SUBSCRIPTION,
  
  // Utilities
  "virgin media": OTHER_CATEGORIES.UTILITIES,
  
  // Misc
  "sim cards": OTHER_CATEGORIES.HARDWARE,
  "apify": SOFTWARE_CATEGORIES.DEVELOPMENT,
  "marsproxy": OTHER_CATEGORIES.SERVICES,
  "proxy": OTHER_CATEGORIES.SERVICES,
};

// Define return type for getExpensesByCategory
interface CategorySummary {
  total: number;
  count: number;
  expenses: FinancialTransaction[];
}

/**
 * Auto-categorize expenses based on vendor name and description
 */
export function categorizeExpenses(expenses: FinancialTransaction[]): FinancialTransaction[] {
  if (!Array.isArray(expenses)) return [];

  return expenses.map(expense => {
    const description = expense.description?.toLowerCase() || '';
    const vendorName = expense.vendor?.name?.toLowerCase() || '';
    
    // Find matching category by vendor name or expense description
    let detectedCategory = null;
    
    // First try to match the vendor name if available
    if (vendorName) {
      for (const [keyword, category] of Object.entries(VENDOR_CATEGORY_MAPPING)) {
        if (vendorName.includes(keyword.toLowerCase())) {
          detectedCategory = category;
          break;
        }
      }
    }
    
    // If no match by vendor, try using the description
    if (!detectedCategory) {
      for (const [keyword, category] of Object.entries(VENDOR_CATEGORY_MAPPING)) {
        if (description.includes(keyword.toLowerCase())) {
          detectedCategory = category;
          break;
        }
      }
    }
    
    // If still no category detected, use Uncategorized
    if (!detectedCategory) {
      detectedCategory = OTHER_CATEGORIES.UNCATEGORIZED;
    }
    
    return {
      ...expense,
      detected_category: detectedCategory
    };
  });
}

/**
 * Get summary of expenses by category
 */
export function getExpensesByCategory(expenses: FinancialTransaction[]): Record<string, CategorySummary> {
  const categorized = categorizeExpenses(expenses);
  const categories: Record<string, CategorySummary> = {};
  
  categorized.forEach(expense => {
    const category = expense.detected_category || OTHER_CATEGORIES.UNCATEGORIZED;
    if (!categories[category]) {
      categories[category] = {
        total: 0,
        count: 0,
        expenses: []
      };
    }
    
    categories[category].total += expense.amount;
    categories[category].count += 1;
    categories[category].expenses.push(expense);
  });
  
  return categories;
}
