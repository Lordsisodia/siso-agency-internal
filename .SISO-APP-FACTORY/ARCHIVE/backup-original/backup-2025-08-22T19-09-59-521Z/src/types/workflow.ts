// =====================================================
// AUTOMATED WORKFLOW SYSTEM TYPES
// Agent 3 Task 52: Comprehensive Workflow Automation
// =====================================================

export type WorkflowType = 'onboarding' | 'email_campaign' | 'commission_payment' | 'lead_nurturing';
export type TriggerEvent = 'partner_approved' | 'lead_created' | 'commission_earned' | 'manual' | 'scheduled';
export type EntityType = 'partner' | 'client_lead' | 'commission';
export type WorkflowStatus = 'active' | 'completed' | 'paused' | 'failed' | 'cancelled';
export type StepType = 'email' | 'delay' | 'condition' | 'webhook' | 'payment' | 'notification';
export type ExecutionStatus = 'pending' | 'executing' | 'completed' | 'failed' | 'skipped';
export type EmailStatus = 'pending' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'failed';
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
export type PaymentMethod = 'bank_transfer' | 'paypal' | 'stripe' | 'manual';

// =====================================================
// WORKFLOW DEFINITION INTERFACES
// =====================================================

export interface WorkflowDefinition {
  id: string;
  name: string;
  description?: string;
  workflow_type: WorkflowType;
  trigger_event: TriggerEvent;
  is_active: boolean;
  configuration: WorkflowConfiguration;
  created_at: string;
  updated_at: string;
}

export interface WorkflowConfiguration {
  // Email campaign settings
  email_settings?: {
    from_name: string;
    from_email: string;
    reply_to?: string;
    template_id?: string;
  };
  
  // Onboarding settings
  onboarding_settings?: {
    welcome_delay_hours: number;
    setup_reminder_days: number[];
    completion_reward?: number;
  };
  
  // Payment settings
  payment_settings?: {
    auto_process: boolean;
    minimum_amount: number;
    payment_schedule: 'immediate' | 'weekly' | 'monthly';
    payment_method: PaymentMethod;
  };
  
  // General settings
  max_retries?: number;
  retry_delay_minutes?: number;
  timeout_hours?: number;
}

// =====================================================
// WORKFLOW INSTANCE INTERFACES
// =====================================================

export interface WorkflowInstance {
  id: string;
  workflow_definition_id: string;
  entity_type: EntityType;
  entity_id: string;
  status: WorkflowStatus;
  current_step_index: number;
  started_at: string;
  completed_at?: string;
  context_data: WorkflowContextData;
  created_at: string;
  updated_at: string;
}

export interface WorkflowContextData {
  // Partner context
  partner_id?: string;
  partner_name?: string;
  partner_email?: string;
  partner_tier?: string;
  
  // Lead context
  lead_id?: string;
  client_name?: string;
  client_email?: string;
  project_value?: number;
  
  // Commission context
  commission_id?: string;
  commission_amount?: number;
  commission_rate?: number;
  
  // Custom variables
  variables?: Record<string, any>;
  
  // Execution metadata
  execution_count?: number;
  last_execution?: string;
  next_execution?: string;
}

// =====================================================
// WORKFLOW STEP INTERFACES
// =====================================================

export interface WorkflowStep {
  id: string;
  workflow_definition_id: string;
  step_order: number;
  step_name: string;
  step_type: StepType;
  configuration: StepConfiguration;
  conditions: StepConditions;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StepConfiguration {
  // Email step configuration
  email_config?: {
    template_id: string;
    subject: string;
    variables: Record<string, string>;
    delay_hours?: number;
  };
  
  // Delay step configuration
  delay_config?: {
    delay_type: 'hours' | 'days' | 'weeks';
    delay_amount: number;
    business_hours_only?: boolean;
  };
  
  // Condition step configuration
  condition_config?: {
    field: string;
    operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains';
    value: any;
    true_step?: number;
    false_step?: number;
  };
  
  // Webhook step configuration
  webhook_config?: {
    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    headers: Record<string, string>;
    body?: Record<string, any>;
    timeout_seconds?: number;
  };
  
  // Payment step configuration
  payment_config?: {
    payment_method: PaymentMethod;
    auto_process: boolean;
    notification_email?: string;
  };
  
  // Notification step configuration
  notification_config?: {
    notification_type: 'email' | 'sms' | 'slack' | 'webhook';
    recipients: string[];
    message: string;
    variables: Record<string, string>;
  };
}

export interface StepConditions {
  // Execution conditions
  execute_if?: {
    field: string;
    operator: string;
    value: any;
  }[];
  
  // Skip conditions
  skip_if?: {
    field: string;
    operator: string;
    value: any;
  }[];
  
  // Time-based conditions
  time_conditions?: {
    days_of_week?: number[]; // 0-6 (Sunday-Saturday)
    hours_of_day?: number[]; // 0-23
    timezone?: string;
  };
}

// =====================================================
// WORKFLOW EXECUTION INTERFACES
// =====================================================

export interface WorkflowExecution {
  id: string;
  workflow_instance_id: string;
  workflow_step_id: string;
  status: ExecutionStatus;
  started_at?: string;
  completed_at?: string;
  execution_data: ExecutionData;
  error_message?: string;
  retry_count: number;
  max_retries: number;
  next_retry_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ExecutionData {
  // Input data
  input_variables?: Record<string, any>;
  
  // Output data
  output_variables?: Record<string, any>;
  
  // Execution metadata
  execution_time_ms?: number;
  memory_usage_mb?: number;
  
  // Step-specific data
  email_data?: {
    message_id?: string;
    recipient_count?: number;
    delivery_status?: string;
  };
  
  webhook_data?: {
    response_status?: number;
    response_body?: any;
    response_headers?: Record<string, string>;
  };
  
  payment_data?: {
    transaction_id?: string;
    payment_reference?: string;
    processing_fee?: number;
  };
}

// =====================================================
// AUTOMATED EMAIL INTERFACES
// =====================================================

export interface AutomatedEmail {
  id: string;
  workflow_execution_id?: string;
  email_type: string;
  recipient_email: string;
  recipient_name?: string;
  subject: string;
  html_content: string;
  text_content?: string;
  template_id?: string;
  template_variables: Record<string, any>;
  status: EmailStatus;
  sent_at?: string;
  delivered_at?: string;
  opened_at?: string;
  clicked_at?: string;
  error_message?: string;
  provider_message_id?: string;
  created_at: string;
  updated_at: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  description?: string;
  subject_template: string;
  html_template: string;
  text_template?: string;
  variables: EmailTemplateVariable[];
  category: string;
  is_active: boolean;
}

export interface EmailTemplateVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date';
  description: string;
  required: boolean;
  default_value?: any;
}

// =====================================================
// PAYMENT AUTOMATION INTERFACES
// =====================================================

export interface PaymentAutomation {
  id: string;
  workflow_execution_id?: string;
  commission_id: string;
  partner_id: string;
  payment_amount: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  payment_reference?: string;
  payment_date?: string;
  failure_reason?: string;
  retry_count: number;
  max_retries: number;
  next_retry_at?: string;
  metadata: PaymentMetadata;
  created_at: string;
  updated_at: string;
}

export interface PaymentMetadata {
  // Stripe metadata
  stripe_payment_intent_id?: string;
  stripe_charge_id?: string;
  stripe_fee?: number;
  
  // PayPal metadata
  paypal_payment_id?: string;
  paypal_payer_id?: string;
  paypal_fee?: number;
  
  // Bank transfer metadata
  bank_reference?: string;
  bank_account_last4?: string;
  bank_routing_number?: string;
  
  // General metadata
  currency?: string;
  exchange_rate?: number;
  processing_fee?: number;
  net_amount?: number;
  tax_amount?: number;
  
  // Audit trail
  initiated_by?: string;
  approved_by?: string;
  processed_by?: string;
}

// =====================================================
// WORKFLOW SERVICE INTERFACES
// =====================================================

export interface WorkflowTriggerRequest {
  workflow_type: WorkflowType;
  trigger_event: TriggerEvent;
  entity_type: EntityType;
  entity_id: string;
  context_data?: WorkflowContextData;
  immediate_execution?: boolean;
}

export interface WorkflowTriggerResponse {
  success: boolean;
  workflow_instance_id?: string;
  message: string;
  error?: string;
}

export interface WorkflowStatusUpdate {
  instance_id: string;
  status: WorkflowStatus;
  current_step_index?: number;
  context_data?: Partial<WorkflowContextData>;
  error_message?: string;
}

export interface WorkflowMetrics {
  total_workflows: number;
  active_workflows: number;
  completed_workflows: number;
  failed_workflows: number;
  
  // Performance metrics
  average_completion_time_hours: number;
  success_rate_percentage: number;
  
  // Email metrics
  total_emails_sent: number;
  email_delivery_rate: number;
  email_open_rate: number;
  email_click_rate: number;
  
  // Payment metrics
  total_payments_processed: number;
  payment_success_rate: number;
  average_payment_processing_time_hours: number;
  
  // By workflow type
  metrics_by_type: Record<WorkflowType, {
    total: number;
    active: number;
    completed: number;
    failed: number;
    success_rate: number;
  }>;
}

// =====================================================
// WORKFLOW DASHBOARD INTERFACES
// =====================================================

export interface WorkflowDashboardData {
  overview: WorkflowMetrics;
  recent_executions: WorkflowExecution[];
  active_instances: WorkflowInstance[];
  failed_instances: WorkflowInstance[];
  email_performance: EmailPerformanceMetrics;
  payment_performance: PaymentPerformanceMetrics;
}

export interface EmailPerformanceMetrics {
  total_sent: number;
  delivery_rate: number;
  open_rate: number;
  click_rate: number;
  bounce_rate: number;
  unsubscribe_rate: number;
  
  // By email type
  performance_by_type: Record<string, {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
  }>;
  
  // Recent trends
  daily_metrics: Array<{
    date: string;
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
  }>;
}

export interface PaymentPerformanceMetrics {
  total_processed: number;
  success_rate: number;
  average_processing_time: number;
  total_amount: number;
  total_fees: number;
  
  // By payment method
  performance_by_method: Record<PaymentMethod, {
    count: number;
    success_rate: number;
    average_amount: number;
    total_fees: number;
  }>;
  
  // Recent trends
  daily_metrics: Array<{
    date: string;
    processed: number;
    successful: number;
    total_amount: number;
  }>;
}

// =====================================================
// WORKFLOW BUILDER INTERFACES
// =====================================================

export interface WorkflowBuilderStep {
  id: string;
  type: StepType;
  name: string;
  configuration: StepConfiguration;
  conditions: StepConditions;
  position: { x: number; y: number };
  connections: string[]; // IDs of connected steps
}

export interface WorkflowBuilderData {
  definition: Omit<WorkflowDefinition, 'id' | 'created_at' | 'updated_at'>;
  steps: WorkflowBuilderStep[];
  connections: Array<{
    from: string;
    to: string;
    condition?: string;
  }>;
}

export interface WorkflowValidationResult {
  is_valid: boolean;
  errors: string[];
  warnings: string[];
  step_count: number;
  estimated_execution_time: number;
}

// =====================================================
// API REQUEST/RESPONSE TYPES
// =====================================================

export interface CreateWorkflowRequest {
  name: string;
  description?: string;
  workflow_type: WorkflowType;
  trigger_event: TriggerEvent;
  configuration: WorkflowConfiguration;
  steps: Omit<WorkflowStep, 'id' | 'workflow_definition_id' | 'created_at' | 'updated_at'>[];
}

export interface UpdateWorkflowRequest {
  name?: string;
  description?: string;
  is_active?: boolean;
  configuration?: Partial<WorkflowConfiguration>;
}

export interface WorkflowListResponse {
  workflows: WorkflowDefinition[];
  total_count: number;
  page: number;
  page_size: number;
}

export interface WorkflowInstanceListResponse {
  instances: WorkflowInstance[];
  total_count: number;
  page: number;
  page_size: number;
}

// =====================================================
// EXPORT ALL TYPES
// =====================================================

export type {
  WorkflowDefinition,
  WorkflowInstance,
  WorkflowStep,
  WorkflowExecution,
  AutomatedEmail,
  PaymentAutomation,
  WorkflowConfiguration,
  WorkflowContextData,
  StepConfiguration,
  StepConditions,
  ExecutionData,
  EmailTemplate,
  EmailTemplateVariable,
  PaymentMetadata,
  WorkflowTriggerRequest,
  WorkflowTriggerResponse,
  WorkflowStatusUpdate,
  WorkflowMetrics,
  WorkflowDashboardData,
  EmailPerformanceMetrics,
  PaymentPerformanceMetrics,
  WorkflowBuilderStep,
  WorkflowBuilderData,
  WorkflowValidationResult,
  CreateWorkflowRequest,
  UpdateWorkflowRequest,
  WorkflowListResponse,
  WorkflowInstanceListResponse
}; 