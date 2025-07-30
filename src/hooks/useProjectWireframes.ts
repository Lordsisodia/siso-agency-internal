import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client'; 
import { toast } from '@/components/ui/use-toast';

// Types for wireframes and connections
export interface Wireframe {
  id: string;
  title: string;
  category: string;
  description: string;
  notionUiPlanLink?: string;
  wireframeStatus: 'planned' | 'in-progress' | 'complete';
  specsStatus: 'pending' | 'in-review' | 'approved';
  devStatus: 'pending' | 'in-progress' | 'complete';
  imageUrl?: string;
}

export interface Connection {
  from: string;
  to: string;
  label?: string;
}

// Complete list of hardcoded wireframes
const SAMPLE_WIREFRAMES: Wireframe[] = [
        {
          id: "1",
          title: "Login/Signup Page",
          category: "page",
    description: "Web3 wallet integration (MetaMask, Trust Wallet, Coinbase Wallet via Web3Modal), secure authentication.",
          notionUiPlanLink: "https://www.notion.so/Login-Signup-Page-1e849797be68802f8803e8671c05c518?pvs=21",
          wireframeStatus: "complete",
          specsStatus: "approved",
          devStatus: "pending"
        },
        {
          id: "2",
          title: "Onboarding/Tutorial Page",
          category: "page",
    description: "Guides new users through wallet setup, trading, staking, and community features.",
          notionUiPlanLink: "https://www.notion.so/Onboarding-Tutorial-Page-1e849797be68805a9d69f05b5781b9a1?pvs=21",
          wireframeStatus: "complete",
          specsStatus: "approved",
          devStatus: "pending"
        },
        {
          id: "3",
          title: "Dashboard",
          category: "page",
    description: "Portfolio overview, real-time market rates (via Chainlink), quick links to trading/staking/community.",
          notionUiPlanLink: "https://www.notion.so/Dashboard-1e849797be6880f89473f75ef252f8a9?pvs=21",
          wireframeStatus: "complete",
          specsStatus: "approved",
          devStatus: "pending"
        },
        {
          id: "4",
          title: "Markets Page",
          category: "page",
    description: "Detailed market data including crypto prices, market cap, and trends (via Chainlink or CoinGecko).",
          notionUiPlanLink: "https://www.notion.so/Markets-Page-1e849797be688011928ee483a7ccd276?pvs=21",
          wireframeStatus: "complete",
          specsStatus: "in-review",
          devStatus: "pending"
        },
        {
          id: "5",
          title: "News Page",
          category: "page",
    description: "Displays crypto news updates (via Crypto News API or News API), supports bookmarking and sharing.",
          notionUiPlanLink: "https://www.notion.so/News-Page-1e849797be68800d9409c5ac93576035?pvs=21",
          wireframeStatus: "in-progress",
          specsStatus: "pending",
          devStatus: "pending"
        },
        {
          id: "6",
          title: "Wallet Page",
          category: "page",
    description: "Manages wallet connections, displays balances, supports network selection.",
          notionUiPlanLink: "https://www.notion.so/Wallet-Page-1e849797be6880888511e402d0c8c22b?pvs=21",
          wireframeStatus: "complete",
          specsStatus: "approved",
          devStatus: "pending"
        },
        {
          id: "7",
          title: "Portfolio Page",
          category: "page",
    description: "Tracks crypto holdings, transaction history (via The Graph), staking performance.",
          notionUiPlanLink: "https://www.notion.so/Portfolio-Page-1e849797be6880e4bdfcd690c879e0c8?pvs=21",
          wireframeStatus: "complete",
          specsStatus: "approved",
          devStatus: "in-progress"
        },
        {
          id: "8",
          title: "Trading Page",
          category: "page",
    description: "Facilitates P2P trading with smart contract escrow (inspired by Hodl Hodl), real-time market rates.",
          notionUiPlanLink: "https://www.notion.so/Trading-Page-1e849797be688024a0fcc17a14ad2d24?pvs=21",
          wireframeStatus: "complete",
          specsStatus: "approved",
          devStatus: "in-progress"
        },
        {
          id: "9",
          title: "Open Orders Page",
          category: "page",
    description: "Displays and manages pending trades or open orders.",
          notionUiPlanLink: "https://www.notion.so/Open-Orders-Page-1e849797be688044b715c230b834da69?pvs=21",
          wireframeStatus: "complete",
          specsStatus: "pending",
          devStatus: "pending"
        },
        {
          id: "10",
          title: "Transaction History Page",
          category: "page",
    description: "Logs all transactions (trades, staking events) via The Graph.",
          notionUiPlanLink: "https://www.notion.so/Transaction-History-Page-1e849797be68804ebdc2c0e23e20109c?pvs=21",
          wireframeStatus: "complete",
          specsStatus: "pending",
          devStatus: "pending"
        },
        {
          id: "11",
          title: "Transaction Fee Estimator Page",
          category: "page",
    description: "Estimates fees for trades, staking, or withdrawals based on network conditions.",
          notionUiPlanLink: "https://www.notion.so/Transaction-Fee-Estimator-Page-1e849797be6880ae804ffe752399b065?pvs=21",
          wireframeStatus: "in-progress",
          specsStatus: "pending",
          devStatus: "pending"
        },
        {
          id: "12",
          title: "Staking Page",
          category: "page",
    description: "Supports token locking (3, 6, 12 months), auto-compounding, dynamic APY (using OpenZeppelin).",
          notionUiPlanLink: "https://www.notion.so/Staking-Page-1e849797be688000a6a9c1cd7cc61a3f?pvs=21",
          wireframeStatus: "complete",
          specsStatus: "pending",
          devStatus: "pending"
  },
  {
    id: "13",
    title: "Staking Comparison Page",
    category: "page",
    description: "Compares staking plans and visualizes rewards.",
    notionUiPlanLink: "https://www.notion.so/Staking-Comparison-Page-1e849797be6880c8a401dcd37ff4e08c?pvs=21",
    wireframeStatus: "complete",
    specsStatus: "approved",
    devStatus: "pending"
  },
  {
    id: "14",
    title: "Security Settings Page",
    category: "page",
    description: "Enables 2FA, initiates KYC (via Trulioo/Onfido), manages security options.",
    notionUiPlanLink: "https://www.notion.so/Security-Settings-Page-1e849797be6880f1a834ccfbc58adf55?pvs=21",
    wireframeStatus: "in-progress",
    specsStatus: "in-review",
    devStatus: "pending"
  },
  {
    id: "15",
    title: "KYC Management Page",
    category: "page",
    description: "Manages KYC status, allows document resubmission.",
    notionUiPlanLink: "https://www.notion.so/KYC-Management-Page-1e849797be68808b99cdf411e612fcdf?pvs=21",
    wireframeStatus: "complete",
    specsStatus: "approved",
    devStatus: "in-progress"
  },
  {
    id: "16",
    title: "Security Information Page",
    category: "page",
    description: "Explains security measures, data protection, and smart contract audits.",
    notionUiPlanLink: "https://www.notion.so/Security-Information-Page-1e849797be6880a99504cc1b47c6e2dd?pvs=21",
    wireframeStatus: "complete",
    specsStatus: "approved",
    devStatus: "complete"
  },
  {
    id: "17",
    title: "Educational Content Page",
    category: "page",
    description: "Hosts articles, tutorials, and guides for crypto education.",
    notionUiPlanLink: "https://www.notion.so/Educational-Content-Page-1e849797be6880949216c97ee43476ec?pvs=21",
    wireframeStatus: "complete",
    specsStatus: "in-review",
    devStatus: "pending"
  },
  {
    id: "18",
    title: "Educational Search/Categories Page",
    category: "page",
    description: "Organizes educational content with search and filtering.",
    notionUiPlanLink: "https://www.notion.so/Educational-Search-Categories-Page-1e849797be6880a99351dce125e4fb2e?pvs=21",
    wireframeStatus: "complete",
    specsStatus: "approved",
    devStatus: "complete"
  },
  {
    id: "19",
    title: "Community Forum Page",
    category: "page",
    description: "Facilitates social trading and discussions, integrates news sharing.",
    notionUiPlanLink: "https://www.notion.so/Community-Forum-Page-1e849797be6880e5bc0dd27d60c1cde9?pvs=21",
    wireframeStatus: "in-progress",
    specsStatus: "pending",
    devStatus: "pending"
  },
  {
    id: "20",
    title: "Affiliate Page",
    category: "page",
    description: "Manages referral rewards system, tracks progress.",
    notionUiPlanLink: "https://www.notion.so/Affiliate-Page-1e849797be6880ad8107d83094741b5d?pvs=21",
    wireframeStatus: "complete",
    specsStatus: "approved",
    devStatus: "in-progress"
  },
  {
    id: "21",
    title: "Referral Leaderboard Page",
    category: "page",
    description: "Gamifies referrals with a leaderboard.",
    notionUiPlanLink: "https://www.notion.so/Referral-Leaderboard-Page-1e849797be68807db567e1f2bbc7e27f?pvs=21",
    wireframeStatus: "complete",
    specsStatus: "approved",
    devStatus: "pending"
  },
  {
    id: "22",
    title: "Notifications Page",
    category: "page",
    description: "Centralizes updates on community interactions and app activities.",
    notionUiPlanLink: "https://www.notion.so/Notifications-Page-1e849797be6880288936f026eec4cdcf?pvs=21",
    wireframeStatus: "in-progress",
    specsStatus: "pending",
    devStatus: "pending"
  },
  {
    id: "23",
    title: "API Management Page",
    category: "page",
    description: "Allows users to generate and manage API keys for programmatic access.",
    notionUiPlanLink: "https://www.notion.so/API-Management-Page-1e849797be6880109099c72fa2a2c5ff?pvs=21",
    wireframeStatus: "complete",
    specsStatus: "approved",
    devStatus: "complete"
  },
  {
    id: "24",
    title: "Settings Page",
    category: "page",
    description: "Manages account preferences, notifications, and privacy.",
    notionUiPlanLink: "https://www.notion.so/Settings-Page-1e849797be6880d1b043ebbb4ab3e4e4?pvs=21",
    wireframeStatus: "complete",
    specsStatus: "approved",
    devStatus: "complete"
  },
  {
    id: "25",
    title: "Support/Help Page",
    category: "page",
    description: "Provides FAQs, troubleshooting, and support contact options.",
    notionUiPlanLink: "https://www.notion.so/Support-Help-Page-1e849797be6880bba09be35bdcd4bc2a?pvs=21",
    wireframeStatus: "in-progress",
    specsStatus: "in-review",
    devStatus: "pending"
  }
];

// Sample connections between wireframes
const SAMPLE_CONNECTIONS: Connection[] = [
  { from: '1', to: '2', label: 'After signup' },
  { from: '2', to: '3', label: 'Complete onboarding' },
  { from: '3', to: '4', label: 'View markets' },
  { from: '3', to: '5', label: 'View news' },
  { from: '3', to: '6', label: 'Access wallet' },
  { from: '3', to: '7', label: 'View portfolio' },
  { from: '4', to: '8', label: 'Trade' },
  { from: '6', to: '20', label: 'Get affiliate link' },
  { from: '6', to: '12', label: 'Stake crypto' },
  { from: '8', to: '9', label: 'View orders' },
  { from: '8', to: '10', label: 'View transaction history' },
  { from: '8', to: '11', label: 'Calculate fees' },
  { from: '7', to: '13', label: 'Compare staking options' },
  { from: '7', to: '22', label: 'Check notifications' },
  { from: '9', to: '16', label: 'View security info' },
  { from: '13', to: '17', label: 'Learn more' },
  { from: '17', to: '18', label: 'Search topics' },
  { from: '14', to: '19', label: 'Join community' },
  { from: '15', to: '24', label: 'Change settings' },
  { from: '21', to: '23', label: 'Get API access' },
  { from: '22', to: '25', label: 'Get help' },
  { from: '19', to: '25', label: 'Contact support' },
];

export function useProjectWireframes() {
  // All React hooks must be called unconditionally at the top level
  const { id: projectId } = useParams();
  const [wireframes, setWireframes] = useState<Wireframe[]>([]);
  const [connections, setConnections] = useState<Connection[]>(SAMPLE_CONNECTIONS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeWireframeId, setActiveWireframeId] = useState<string>('');
  
  // Use refs to track component mounting state
  const isMountedRef = useRef(true);
  const timeoutRef = useRef<number | null>(null);
  
  // Load the hardcoded wireframes
  const loadWireframes = useCallback(() => {
    if (!isMountedRef.current) return;
    
    console.log("Loading hardcoded wireframe data");
    setWireframes(SAMPLE_WIREFRAMES);
    setConnections(SAMPLE_CONNECTIONS);
    
    if (SAMPLE_WIREFRAMES.length > 0) {
      setActiveWireframeId(SAMPLE_WIREFRAMES[0].id);
    }
    
    setLoading(false);
  }, []);

  // Load the wireframes on mount
  useEffect(() => {
    // Set mounted ref to true on mount
    isMountedRef.current = true;
    
    // Short timeout to simulate loading for a better UX
    timeoutRef.current = window.setTimeout(() => {
      if (isMountedRef.current) {
        loadWireframes();
      }
    }, 500);
    
    // Cleanup function
    return () => {
      isMountedRef.current = false;
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [loadWireframes]);

  // Find active wireframe from the current state
  const activeWireframe = wireframes.find(w => w.id === activeWireframeId) || null;

  // Function for downloading a wireframe
  const downloadWireframe = useCallback(() => {
    toast({
      title: "No Download Available",
      description: `Wireframe images are not currently available for ${activeWireframe?.title || 'this wireframe'}`,
    });
  }, [activeWireframe]);

  // Return hook data
  return {
    wireframes,
    connections,
    loading,
    error,
    activeWireframeId,
    setActiveWireframeId,
    activeWireframe,
    downloadWireframe
  };
}
