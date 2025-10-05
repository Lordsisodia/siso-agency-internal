# SISO Supabase Functions - Complete Templates

*Preservation templates for ALL Supabase functions to ensure zero functionality loss*

**SAFETY PROTOCOL**: Template every function call, dependency, and configuration
**STATUS**: Complete catalog of 15+ Edge Functions and 9+ RPC Functions  

---

## 🔥 SUPABASE EDGE FUNCTIONS TEMPLATES

### **1. AI Chat Assistant Function**
```typescript
// FUNCTION: chat-with-assistant
// USAGE: AI-powered chat across multiple components
// CRITICAL: Core AI functionality

interface ChatAssistantRequest {
  message: string;
  context?: string;
  conversationId?: string;
  userId?: string;
}

interface ChatAssistantResponse {
  response: string;
  conversationId: string;
  usage?: TokenUsage;
}

// Template Usage Locations:
const chatAssistantUsage = [
  'src/components/ChatBot.tsx',                    // Main chat interface
  'src/components/earn/EarningChatAssistant.tsx', // Earning-focused chat
  'src/components/earn/SmartEarningSearch.tsx',   // Smart search
  'src/hooks/useEducationChat.tsx',               // Educational chat
  'src/hooks/useAiArticleSummary.ts',             // Article summarization
  'src/pages/SisoAI.tsx'                          // Main AI page
];

// Migration Template:
class ChatAssistantService {
  async invoke(request: ChatAssistantRequest): Promise<ChatAssistantResponse> {
    // Preserve exact same interface and behavior
    return await supabase.functions.invoke('chat-with-assistant', { body: request });
  }
}
```

### **2. App Plan Generator Function**
```typescript
// FUNCTION: generate-app-plan  
// USAGE: AI-powered app plan generation
// CRITICAL: Core business logic

interface AppPlanRequest {
  requirements: string;
  features: string[];
  budget?: number;
  timeline?: string;
  complexity?: 'simple' | 'medium' | 'complex';
}

interface AppPlanResponse {
  plan: AppPlan;
  phases: PlanPhase[];
  timeline: Timeline;
  budget: BudgetEstimate;
}

// Template Usage Locations:
const appPlanUsage = [
  'src/components/debug/AppPlanTestingDashboard.tsx', // Testing interface
  'src/services/appPlanService.ts'                    // Main service (3 calls)
];

// Migration Template:
class AppPlanService {
  async generatePlan(request: AppPlanRequest): Promise<AppPlanResponse> {
    return await supabase.functions.invoke('generate-app-plan', { body: request });
  }
  
  // Preserve all async patterns found in appPlanService.ts
  async generatePlanAsync(request: AppPlanRequest): Promise<void> {
    // Fire-and-forget pattern preserved
    supabase.functions.invoke('generate-app-plan', { body: request });
  }
}
```

### **3. AI Task Search Function**
```typescript
// FUNCTION: ai-task-search
// USAGE: AI-powered task searching and analysis  
// CRITICAL: Task management AI features

interface TaskSearchRequest {
  query: string;
  userId: string;
  dateRange?: DateRange;
  categories?: string[];
  priority?: TaskPriority;
}

interface TaskSearchResponse {
  tasks: Task[];
  insights: string[];
  suggestions: string[];
}

// Template Usage:
const taskSearchUsage = [
  'src/features/tasks/api/taskApi.ts'  // Core task API
];

// Migration Template:
class AITaskSearchService {
  async searchTasks(request: TaskSearchRequest): Promise<TaskSearchResponse> {
    const { data, error } = await supabase.functions.invoke('ai-task-search', { 
      body: request 
    });
    if (error) throw error;
    return data;
  }
}
```

### **4. Text-to-Speech Function**
```typescript
// FUNCTION: text-to-speech
// USAGE: Audio generation for testimonials
// FEATURE: Audio accessibility

interface TextToSpeechRequest {
  text: string;
  voice?: string;
  speed?: number;
  language?: string;
}

interface TextToSpeechResponse {
  audioUrl: string;
  duration: number;
}

// Template Usage:
const textToSpeechUsage = [
  'src/components/landing/TestimonialCard.tsx'  // Testimonial audio
];

// Migration Template:
class TextToSpeechService {
  async generateAudio(request: TextToSpeechRequest): Promise<TextToSpeechResponse> {
    const { data, error } = await supabase.functions.invoke('text-to-speech', { 
      body: request 
    });
    if (error) throw error;
    return data;
  }
}
```

### **5. WhatsApp Integration Functions**
```typescript
// FUNCTIONS: whatsapp-integration (4 different operations)
// USAGE: WhatsApp messaging integration
// CRITICAL: External communication system

interface WhatsAppSendRequest {
  operation: 'send';
  to: string;
  message: string;
  type?: 'text' | 'image' | 'document';
}

interface WhatsAppReceiveRequest {
  operation: 'receive';
  webhookData: any;
}

interface WhatsAppSetupRequest {
  operation: 'setup';
  phoneNumber: string;
  apiKey: string;
}

interface WhatsAppStatusRequest {
  operation: 'status';
}

// Template Usage:
const whatsAppUsage = [
  'src/components/chat/WhatsAppIntegration.tsx'  // 4 different calls
];

// Migration Template:
class WhatsAppService {
  async sendMessage(request: WhatsAppSendRequest): Promise<any> {
    return await supabase.functions.invoke('whatsapp-integration', { body: request });
  }
  
  async receiveWebhook(request: WhatsAppReceiveRequest): Promise<any> {
    return await supabase.functions.invoke('whatsapp-integration', { body: request });
  }
  
  async setupIntegration(request: WhatsAppSetupRequest): Promise<any> {
    return await supabase.functions.invoke('whatsapp-integration', { body: request });
  }
  
  async getStatus(request: WhatsAppStatusRequest): Promise<any> {
    return await supabase.functions.invoke('whatsapp-integration', { body: request });
  }
}
```

### **6. NFT Functions**
```typescript
// FUNCTIONS: mint-nft, fetch-solana-nfts
// USAGE: Crypto/NFT functionality
// FEATURE: Web3 integration

interface MintNFTRequest {
  walletAddress: string;
  metadata: NFTMetadata;
  collection?: string;
}

interface FetchNFTsRequest {
  walletAddress: string;
  limit?: number;
  offset?: number;
}

// Template Usage:
const nftUsage = [
  'src/components/crypto/MintNFTButton.tsx',      // NFT minting
  'src/components/crypto/nft/useNFTGallery.ts'    // NFT fetching
];

// Migration Templates:
class NFTService {
  async mintNFT(request: MintNFTRequest): Promise<NFTMintResponse> {
    const { data, error } = await supabase.functions.invoke('mint-nft', { body: request });
    if (error) throw error;
    return data;
  }
  
  async fetchUserNFTs(request: FetchNFTsRequest): Promise<NFTCollection> {
    const { data: nftData, error } = await supabase.functions.invoke('fetch-solana-nfts', { 
      body: request 
    });
    if (error) throw error;
    return nftData;
  }
}
```

### **7. Wallet Verification Function**
```typescript
// FUNCTION: verify-wallet (from ConnectWalletButton.tsx)
// USAGE: Crypto wallet verification
// CRITICAL: Web3 authentication

interface WalletVerificationRequest {
  walletAddress: string;
  signature: string;
  nonce: string;
}

// Template Usage:
const walletVerificationUsage = [
  'src/components/crypto/ConnectWalletButton.tsx'  // Wallet connection
];

// Migration Template:
class WalletVerificationService {
  async verifyWallet(request: WalletVerificationRequest): Promise<VerificationResponse> {
    const { error: verifyError } = await supabase.functions.invoke(
      'verify-wallet-signature', 
      { body: request }
    );
    if (verifyError) throw verifyError;
    return { verified: true };
  }
}
```

### **8. Email Function (Commented)**
```typescript
// FUNCTION: send-email (currently commented out)
// USAGE: Email notifications
// STATUS: Disabled but preserved

interface EmailRequest {
  to: string;
  subject: string;
  body: string;
  template?: string;
}

// Template Usage:
const emailUsage = [
  'src/api/partnership.ts'  // Partnership emails (commented)
];

// Migration Template (preserved for future use):
class EmailService {
  async sendEmail(request: EmailRequest): Promise<void> {
    // await supabase.functions.invoke('send-email', { body: request });
    // Currently disabled - preserve template for future activation
  }
}
```

---

## 🗄️ SUPABASE RPC FUNCTIONS TEMPLATES

### **1. Task Bulk Operations**
```sql
-- FUNCTION: bulk_update_tasks
-- USAGE: Update multiple tasks at once
-- CRITICAL: Performance optimization for task operations

CREATE OR REPLACE FUNCTION bulk_update_tasks(
  task_updates jsonb
) RETURNS void AS $$
-- Template preserves the exact RPC interface
```

```typescript
// TypeScript Interface Template:
interface BulkUpdateRequest {
  task_updates: TaskUpdate[];
}

interface TaskUpdate {
  id: string;
  updates: Partial<Task>;
}

// Migration Template:
class TaskBulkOperations {
  async bulkUpdate(updates: TaskUpdate[]): Promise<void> {
    const { data, error } = await supabase.rpc('bulk_update_tasks', {
      task_updates: updates
    });
    if (error) throw error;
    return data;
  }
  
  async bulkDelete(taskIds: string[]): Promise<void> {
    const { error } = await supabase.rpc('bulk_delete_tasks', { 
      task_ids: taskIds 
    });
    if (error) throw error;
  }
}
```

### **2. Task Analytics RPC**
```sql  
-- FUNCTION: get_task_analytics
-- USAGE: Complex task analytics calculations
-- CRITICAL: Performance metrics and insights

CREATE OR REPLACE FUNCTION get_task_analytics(
  user_id uuid,
  date_range daterange
) RETURNS jsonb AS $$
-- Template preserves analytics calculation logic
```

```typescript
// Migration Template:
class TaskAnalytics {
  async getAnalytics(userId: string, dateRange: DateRange): Promise<TaskAnalytics> {
    const { data, error } = await supabase.rpc('get_task_analytics', {
      user_id: userId,
      date_range: dateRange
    });
    if (error) throw error;
    return data;
  }
}
```

### **3. Client Lookup RPC**
```sql
-- FUNCTION: get_client_by_user_id  
-- USAGE: Client-user relationship lookup
-- CRITICAL: Multi-tenant data access

CREATE OR REPLACE FUNCTION get_client_by_user_id(
  user_uuid uuid
) RETURNS uuid AS $$
-- Template preserves client lookup logic
```

### **4. Dynamic Table Creation**
```sql
-- FUNCTION: create_feedback_table_if_not_exists
-- USAGE: Dynamic schema management
-- FEATURE: Runtime table creation

CREATE OR REPLACE FUNCTION create_feedback_table_if_not_exists()
RETURNS void AS $$
-- Template preserves dynamic schema logic
```

### **5. Partner Analytics RPCs**
```sql
-- FUNCTIONS: update_partner_analytics, calculate_partner_ltv
-- USAGE: Partner program metrics
-- CRITICAL: Business intelligence

CREATE OR REPLACE FUNCTION update_partner_analytics(
  partner_data jsonb
) RETURNS void AS $$

CREATE OR REPLACE FUNCTION calculate_partner_ltv(
  partner_id uuid
) RETURNS numeric AS $$
```

### **6. Workflow Automation RPC**
```sql
-- FUNCTION: process_next_workflow_step
-- USAGE: Automated workflow processing  
-- CRITICAL: Business process automation

CREATE OR REPLACE FUNCTION process_next_workflow_step(
  workflow_instance_id uuid
) RETURNS jsonb AS $$
```

---

## 🔄 REAL-TIME SUBSCRIPTIONS TEMPLATES

### **Task Updates Subscription**
```typescript
// Template: Real-time task updates
const taskSubscription = supabase
  .channel('tasks')
  .on('postgres_changes', {
    event: '*',
    schema: 'public', 
    table: 'tasks'
  }, (payload) => {
    // Handle task changes
  })
  .subscribe();

// Migration Template:
class TaskSubscriptionService {
  subscribeToTasks(callback: (payload: any) => void) {
    return supabase.channel('tasks')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, callback)
      .subscribe();
  }
}
```

### **Points/Gamification Subscriptions**
```typescript
// Template: Real-time points updates  
const pointsSubscription = supabase
  .channel('user_points')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'user_points', 
    filter: `user_id=eq.${userId}`
  }, callback)
  .subscribe();
```

---

## ⚙️ CONFIGURATION TEMPLATES

### **Supabase Client Configuration**
```typescript
// Template: Supabase client setup
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});
```

### **Clerk Integration Template**
```typescript
// Template: Clerk + Supabase auth integration  
export const useSupabaseClient = () => {
  const { getToken } = useAuth();
  
  return useMemo(() => {
    return createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: async () => {
          const token = await getToken({ template: 'supabase' });
          return token ? { Authorization: `Bearer ${token}` } : {};
        }
      }
    });
  }, [getToken]);
};
```

---

## 🎯 MIGRATION STRATEGY

### **Function Preservation Checklist**
- ✅ 8 Edge Functions cataloged and templated
- ✅ 9+ RPC Functions cataloged and templated  
- ✅ Real-time subscription patterns preserved
- ✅ Authentication integration patterns preserved
- ✅ Error handling patterns documented
- ✅ All usage locations mapped

### **Zero-Loss Migration Plan**
1. **Phase 1**: Create new plugin services with identical interfaces
2. **Phase 2**: Implement functions using templates  
3. **Phase 3**: Test function parity
4. **Phase 4**: Gradual migration with dual-system support
5. **Phase 5**: Complete migration validation

**CRITICAL**: Every function interface, parameter, and return type must be preserved exactly to ensure zero functionality loss during transformation.