// =====================================================
// AUTOMATED WORKFLOW SERVICE
// Agent 3 Task 52: Comprehensive Workflow Automation
// =====================================================

import { supabase } from '@/integrations/supabase/client';
import type {
  WorkflowDefinition,
  WorkflowInstance,
  WorkflowStep,
  WorkflowExecution,
  AutomatedEmail,
  PaymentAutomation,
  WorkflowTriggerRequest,
  WorkflowTriggerResponse,
  WorkflowStatusUpdate,
  WorkflowMetrics,
  WorkflowDashboardData,
  CreateWorkflowRequest,
  UpdateWorkflowRequest,
  WorkflowListResponse,
  WorkflowInstanceListResponse,
  WorkflowType,
  TriggerEvent,
  EntityType,
  WorkflowStatus,
  ExecutionStatus,
  EmailStatus,
  PaymentStatus
} from '@/types/workflow';

// =====================================================
// WORKFLOW DEFINITION MANAGEMENT
// =====================================================

export class WorkflowService {
  
  /**
   * Create a new workflow definition
   */
  static async createWorkflow(request: CreateWorkflowRequest): Promise<WorkflowDefinition> {
    try {
      // Create workflow definition
      const { data: workflow, error: workflowError } = await supabase
        .from('workflow_definitions')
        .insert({
          name: request.name,
          description: request.description,
          workflow_type: request.workflow_type,
          trigger_event: request.trigger_event,
          configuration: request.configuration,
          is_active: true
        })
        .select()
        .single();

      if (workflowError) throw workflowError;

      // Create workflow steps
      const stepsWithWorkflowId = request.steps.map(step => ({
        ...step,
        workflow_definition_id: workflow.id
      }));

      const { error: stepsError } = await supabase
        .from('workflow_steps')
        .insert(stepsWithWorkflowId);

      if (stepsError) throw stepsError;

      return workflow;
    } catch (error) {
      console.error('Error creating workflow:', error);
      throw new Error('Failed to create workflow');
    }
  }

  /**
   * Get all workflow definitions
   */
  static async getWorkflows(
    page: number = 1,
    pageSize: number = 20,
    workflowType?: WorkflowType
  ): Promise<WorkflowListResponse> {
    try {
      let query = supabase
        .from('workflow_definitions')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (workflowType) {
        query = query.eq('workflow_type', workflowType);
      }

      const { data, error, count } = await query
        .range((page - 1) * pageSize, page * pageSize - 1);

      if (error) throw error;

      return {
        workflows: data || [],
        total_count: count || 0,
        page,
        page_size: pageSize
      };
    } catch (error) {
      console.error('Error fetching workflows:', error);
      throw new Error('Failed to fetch workflows');
    }
  }

  /**
   * Get workflow definition by ID
   */
  static async getWorkflow(id: string): Promise<WorkflowDefinition | null> {
    try {
      const { data, error } = await supabase
        .from('workflow_definitions')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching workflow:', error);
      return null;
    }
  }

  /**
   * Update workflow definition
   */
  static async updateWorkflow(id: string, updates: UpdateWorkflowRequest): Promise<WorkflowDefinition> {
    try {
      const { data, error } = await supabase
        .from('workflow_definitions')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating workflow:', error);
      throw new Error('Failed to update workflow');
    }
  }

  /**
   * Delete workflow definition
   */
  static async deleteWorkflow(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('workflow_definitions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting workflow:', error);
      throw new Error('Failed to delete workflow');
    }
  }

  // =====================================================
  // WORKFLOW EXECUTION MANAGEMENT
  // =====================================================

  /**
   * Trigger a workflow for an entity
   */
  static async triggerWorkflow(request: WorkflowTriggerRequest): Promise<WorkflowTriggerResponse> {
    try {
      // Find matching workflow definition
      const { data: workflows, error: workflowError } = await supabase
        .from('workflow_definitions')
        .select('*')
        .eq('workflow_type', request.workflow_type)
        .eq('trigger_event', request.trigger_event)
        .eq('is_active', true);

      if (workflowError) throw workflowError;

      if (!workflows || workflows.length === 0) {
        return {
          success: false,
          message: 'No active workflow found for this trigger'
        };
      }

      const workflow = workflows[0]; // Use first matching workflow

      // Check if instance already exists for this entity
      const { data: existingInstance } = await supabase
        .from('workflow_instances')
        .select('id')
        .eq('workflow_definition_id', workflow.id)
        .eq('entity_type', request.entity_type)
        .eq('entity_id', request.entity_id)
        .eq('status', 'active')
        .single();

      if (existingInstance) {
        return {
          success: false,
          message: 'Workflow already active for this entity'
        };
      }

      // Create workflow instance
      const { data: instance, error: instanceError } = await supabase
        .from('workflow_instances')
        .insert({
          workflow_definition_id: workflow.id,
          entity_type: request.entity_type,
          entity_id: request.entity_id,
          status: 'active',
          context_data: request.context_data || {}
        })
        .select()
        .single();

      if (instanceError) throw instanceError;

      // Start first step if immediate execution requested
      if (request.immediate_execution) {
        await this.processNextStep(instance.id);
      }

      return {
        success: true,
        workflow_instance_id: instance.id,
        message: 'Workflow triggered successfully'
      };
    } catch (error) {
      console.error('Error triggering workflow:', error);
      return {
        success: false,
        message: 'Failed to trigger workflow',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Process next step in workflow instance
   */
  static async processNextStep(instanceId: string): Promise<boolean> {
    try {
      // Call database function to process next step
      const { data, error } = await supabase.rpc('process_next_workflow_step', {
        instance_uuid: instanceId
      });

      if (error) throw error;
      return data || false;
    } catch (error) {
      console.error('Error processing next step:', error);
      return false;
    }
  }

  /**
   * Update workflow instance status
   */
  static async updateWorkflowStatus(update: WorkflowStatusUpdate): Promise<void> {
    try {
      const updateData: any = {
        status: update.status,
        updated_at: new Date().toISOString()
      };

      if (update.current_step_index !== undefined) {
        updateData.current_step_index = update.current_step_index;
      }

      if (update.context_data) {
        // Merge with existing context data
        const { data: currentInstance } = await supabase
          .from('workflow_instances')
          .select('context_data')
          .eq('id', update.instance_id)
          .single();

        if (currentInstance) {
          updateData.context_data = {
            ...currentInstance.context_data,
            ...update.context_data
          };
        }
      }

      if (update.status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      if (update.error_message) {
        updateData.context_data = {
          ...updateData.context_data,
          error_message: update.error_message
        };
      }

      const { error } = await supabase
        .from('workflow_instances')
        .update(updateData)
        .eq('id', update.instance_id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating workflow status:', error);
      throw new Error('Failed to update workflow status');
    }
  }

  /**
   * Get workflow instances
   */
  static async getWorkflowInstances(
    page: number = 1,
    pageSize: number = 20,
    status?: WorkflowStatus,
    entityType?: EntityType
  ): Promise<WorkflowInstanceListResponse> {
    try {
      let query = supabase
        .from('workflow_instances')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      if (entityType) {
        query = query.eq('entity_type', entityType);
      }

      const { data, error, count } = await query
        .range((page - 1) * pageSize, page * pageSize - 1);

      if (error) throw error;

      return {
        instances: data || [],
        total_count: count || 0,
        page,
        page_size: pageSize
      };
    } catch (error) {
      console.error('Error fetching workflow instances:', error);
      throw new Error('Failed to fetch workflow instances');
    }
  }

  // =====================================================
  // EMAIL AUTOMATION MANAGEMENT
  // =====================================================

  /**
   * Send automated email
   */
  static async sendAutomatedEmail(
    workflowExecutionId: string,
    emailType: string,
    recipientEmail: string,
    recipientName: string,
    subject: string,
    htmlContent: string,
    templateVariables: Record<string, any> = {}
  ): Promise<AutomatedEmail> {
    try {
      const { data, error } = await supabase
        .from('automated_emails')
        .insert({
          workflow_execution_id: workflowExecutionId,
          email_type: emailType,
          recipient_email: recipientEmail,
          recipient_name: recipientName,
          subject,
          html_content: htmlContent,
          template_variables: templateVariables,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      // TODO: Integrate with actual email service (SendGrid, Mailgun, etc.)
      // For now, mark as sent
      await this.updateEmailStatus(data.id, 'sent');

      return data;
    } catch (error) {
      console.error('Error sending automated email:', error);
      throw new Error('Failed to send automated email');
    }
  }

  /**
   * Update email status
   */
  static async updateEmailStatus(emailId: string, status: EmailStatus, metadata?: any): Promise<void> {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString()
      };

      switch (status) {
        case 'sent':
          updateData.sent_at = new Date().toISOString();
          break;
        case 'delivered':
          updateData.delivered_at = new Date().toISOString();
          break;
        case 'opened':
          updateData.opened_at = new Date().toISOString();
          break;
        case 'clicked':
          updateData.clicked_at = new Date().toISOString();
          break;
        case 'failed':
          updateData.error_message = metadata?.error_message;
          break;
      }

      if (metadata?.provider_message_id) {
        updateData.provider_message_id = metadata.provider_message_id;
      }

      const { error } = await supabase
        .from('automated_emails')
        .update(updateData)
        .eq('id', emailId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating email status:', error);
      throw new Error('Failed to update email status');
    }
  }

  /**
   * Get email performance metrics
   */
  static async getEmailMetrics(days: number = 30): Promise<any> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('automated_emails')
        .select('*')
        .gte('created_at', startDate.toISOString());

      if (error) throw error;

      const emails = data || [];
      const totalSent = emails.filter(e => e.status !== 'pending' && e.status !== 'failed').length;
      const delivered = emails.filter(e => e.delivered_at).length;
      const opened = emails.filter(e => e.opened_at).length;
      const clicked = emails.filter(e => e.clicked_at).length;

      return {
        total_sent: totalSent,
        delivery_rate: totalSent > 0 ? (delivered / totalSent) * 100 : 0,
        open_rate: delivered > 0 ? (opened / delivered) * 100 : 0,
        click_rate: opened > 0 ? (clicked / opened) * 100 : 0
      };
    } catch (error) {
      console.error('Error fetching email metrics:', error);
      return {
        total_sent: 0,
        delivery_rate: 0,
        open_rate: 0,
        click_rate: 0
      };
    }
  }

  // =====================================================
  // PAYMENT AUTOMATION MANAGEMENT
  // =====================================================

  /**
   * Process automated payment
   */
  static async processAutomatedPayment(
    workflowExecutionId: string,
    commissionId: string,
    partnerId: string,
    paymentAmount: number,
    paymentMethod: string
  ): Promise<PaymentAutomation> {
    try {
      const { data, error } = await supabase
        .from('payment_automations')
        .insert({
          workflow_execution_id: workflowExecutionId,
          commission_id: commissionId,
          partner_id: partnerId,
          payment_amount: paymentAmount,
          payment_method: paymentMethod,
          payment_status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      // TODO: Integrate with actual payment processor
      // For now, simulate processing
      await this.updatePaymentStatus(data.id, 'processing');
      
      // Simulate successful payment after delay
      setTimeout(async () => {
        await this.updatePaymentStatus(data.id, 'completed', {
          payment_reference: `PAY_${Date.now()}`,
          payment_date: new Date().toISOString()
        });
      }, 5000);

      return data;
    } catch (error) {
      console.error('Error processing automated payment:', error);
      throw new Error('Failed to process automated payment');
    }
  }

  /**
   * Update payment status
   */
  static async updatePaymentStatus(paymentId: string, status: PaymentStatus, metadata?: any): Promise<void> {
    try {
      const updateData: any = {
        payment_status: status,
        updated_at: new Date().toISOString()
      };

      if (status === 'completed' && metadata) {
        updateData.payment_reference = metadata.payment_reference;
        updateData.payment_date = metadata.payment_date;
      }

      if (status === 'failed' && metadata) {
        updateData.failure_reason = metadata.failure_reason;
        updateData.retry_count = (metadata.retry_count || 0) + 1;
      }

      if (metadata?.metadata) {
        updateData.metadata = metadata.metadata;
      }

      const { error } = await supabase
        .from('payment_automations')
        .update(updateData)
        .eq('id', paymentId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw new Error('Failed to update payment status');
    }
  }

  // =====================================================
  // WORKFLOW ANALYTICS & METRICS
  // =====================================================

  /**
   * Get comprehensive workflow metrics
   */
  static async getWorkflowMetrics(): Promise<WorkflowMetrics> {
    try {
      // Get workflow instances
      const { data: instances, error: instancesError } = await supabase
        .from('workflow_instances')
        .select('*');

      if (instancesError) throw instancesError;

      // Get email metrics
      const emailMetrics = await this.getEmailMetrics();

      // Get payment metrics
      const { data: payments, error: paymentsError } = await supabase
        .from('payment_automations')
        .select('*');

      if (paymentsError) throw paymentsError;

      const totalWorkflows = instances?.length || 0;
      const activeWorkflows = instances?.filter(i => i.status === 'active').length || 0;
      const completedWorkflows = instances?.filter(i => i.status === 'completed').length || 0;
      const failedWorkflows = instances?.filter(i => i.status === 'failed').length || 0;

      const successfulPayments = payments?.filter(p => p.payment_status === 'completed').length || 0;
      const totalPayments = payments?.length || 0;

      return {
        total_workflows: totalWorkflows,
        active_workflows: activeWorkflows,
        completed_workflows: completedWorkflows,
        failed_workflows: failedWorkflows,
        average_completion_time_hours: 24, // TODO: Calculate from actual data
        success_rate_percentage: totalWorkflows > 0 ? (completedWorkflows / totalWorkflows) * 100 : 0,
        total_emails_sent: emailMetrics.total_sent,
        email_delivery_rate: emailMetrics.delivery_rate,
        email_open_rate: emailMetrics.open_rate,
        email_click_rate: emailMetrics.click_rate,
        total_payments_processed: totalPayments,
        payment_success_rate: totalPayments > 0 ? (successfulPayments / totalPayments) * 100 : 0,
        average_payment_processing_time_hours: 2, // TODO: Calculate from actual data
        metrics_by_type: {
          onboarding: { total: 0, active: 0, completed: 0, failed: 0, success_rate: 0 },
          email_campaign: { total: 0, active: 0, completed: 0, failed: 0, success_rate: 0 },
          commission_payment: { total: 0, active: 0, completed: 0, failed: 0, success_rate: 0 },
          lead_nurturing: { total: 0, active: 0, completed: 0, failed: 0, success_rate: 0 }
        }
      };
    } catch (error) {
      console.error('Error fetching workflow metrics:', error);
      throw new Error('Failed to fetch workflow metrics');
    }
  }

  /**
   * Get workflow dashboard data
   */
  static async getWorkflowDashboardData(): Promise<WorkflowDashboardData> {
    try {
      const [
        metrics,
        recentExecutions,
        activeInstances,
        failedInstances
      ] = await Promise.all([
        this.getWorkflowMetrics(),
        this.getRecentExecutions(),
        this.getActiveInstances(),
        this.getFailedInstances()
      ]);

      return {
        overview: metrics,
        recent_executions: recentExecutions,
        active_instances: activeInstances,
        failed_instances: failedInstances,
        email_performance: {
          total_sent: metrics.total_emails_sent,
          delivery_rate: metrics.email_delivery_rate,
          open_rate: metrics.email_open_rate,
          click_rate: metrics.email_click_rate,
          bounce_rate: 2.5, // TODO: Calculate from actual data
          unsubscribe_rate: 0.5, // TODO: Calculate from actual data
          performance_by_type: {},
          daily_metrics: []
        },
        payment_performance: {
          total_processed: metrics.total_payments_processed,
          success_rate: metrics.payment_success_rate,
          average_processing_time: metrics.average_payment_processing_time_hours,
          total_amount: 0, // TODO: Calculate from actual data
          total_fees: 0, // TODO: Calculate from actual data
          performance_by_method: {
            bank_transfer: { count: 0, success_rate: 0, average_amount: 0, total_fees: 0 },
            paypal: { count: 0, success_rate: 0, average_amount: 0, total_fees: 0 },
            stripe: { count: 0, success_rate: 0, average_amount: 0, total_fees: 0 },
            manual: { count: 0, success_rate: 0, average_amount: 0, total_fees: 0 }
          },
          daily_metrics: []
        }
      };
    } catch (error) {
      console.error('Error fetching workflow dashboard data:', error);
      throw new Error('Failed to fetch workflow dashboard data');
    }
  }

  // =====================================================
  // HELPER METHODS
  // =====================================================

  private static async getRecentExecutions(): Promise<WorkflowExecution[]> {
    const { data, error } = await supabase
      .from('workflow_executions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;
    return data || [];
  }

  private static async getActiveInstances(): Promise<WorkflowInstance[]> {
    const { data, error } = await supabase
      .from('workflow_instances')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;
    return data || [];
  }

  private static async getFailedInstances(): Promise<WorkflowInstance[]> {
    const { data, error } = await supabase
      .from('workflow_instances')
      .select('*')
      .eq('status', 'failed')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;
    return data || [];
  }
}

// =====================================================
// WORKFLOW AUTOMATION TRIGGERS
// =====================================================

/**
 * Trigger partner onboarding workflow
 */
export const triggerPartnerOnboarding = async (partnerId: string): Promise<WorkflowTriggerResponse> => {
  return WorkflowService.triggerWorkflow({
    workflow_type: 'onboarding',
    trigger_event: 'partner_approved',
    entity_type: 'partner',
    entity_id: partnerId,
    immediate_execution: true
  });
};

/**
 * Trigger commission payment workflow
 */
export const triggerCommissionPayment = async (commissionId: string): Promise<WorkflowTriggerResponse> => {
  return WorkflowService.triggerWorkflow({
    workflow_type: 'commission_payment',
    trigger_event: 'commission_earned',
    entity_type: 'commission',
    entity_id: commissionId,
    immediate_execution: true
  });
};

/**
 * Trigger lead nurturing workflow
 */
export const triggerLeadNurturing = async (leadId: string): Promise<WorkflowTriggerResponse> => {
  return WorkflowService.triggerWorkflow({
    workflow_type: 'lead_nurturing',
    trigger_event: 'lead_created',
    entity_type: 'client_lead',
    entity_id: leadId,
    immediate_execution: false // Start with delay
  });
};

export default WorkflowService; 