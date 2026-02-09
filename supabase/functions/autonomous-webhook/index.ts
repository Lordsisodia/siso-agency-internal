/**
 * Autonomous Task Webhook
 *
 * Receives completion reports from spawned agents.
 * Agents call this endpoint when they finish work.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

interface AgentReport {
  subtask_id: string;
  status: 'completed' | 'failed' | 'verifying';
  agent_metadata: Record<string, any>;
  summary?: string;
  verification_notes?: string;
  artifacts?: string[];
}

Deno.serve(async (req) => {
  try {
    // Only accept POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verify authorization (simple token check)
    const authHeader = req.headers.get('authorization');
    const expectedToken = Deno.env.get('AUTONOMOUS_WEBHOOK_TOKEN');

    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const report: AgentReport = await req.json();

    // Validate required fields
    if (!report.subtask_id) {
      return new Response(
        JSON.stringify({ error: 'subtask_id is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!report.status) {
      return new Response(
        JSON.stringify({ error: 'status is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get current subtask
    const { data: subtask, error: fetchError } = await supabase
      .from('autonomous_subtasks')
      .select('*')
      .eq('id', report.subtask_id)
      .single();

    if (fetchError || !subtask) {
      return new Response(
        JSON.stringify({ error: 'Subtask not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Build update
    const updates: any = {
      status: report.status,
      updated_at: new Date().toISOString()
    };

    // Add completion timestamp if completed or failed
    if (report.status === 'completed' || report.status === 'failed') {
      updates.completed_at = new Date().toISOString();
    }

    // Add summary if provided
    if (report.summary) {
      updates.summary = report.summary;
    }

    // Add verification notes if provided
    if (report.verification_notes) {
      updates.verification_notes = report.verification_notes;
    }

    // Merge agent metadata
    const mergedMetadata = {
      ...subtask.agent_metadata,
      ...report.agent_metadata,
      completed_by_agent: true,
      completed_at: new Date().toISOString(),
      artifacts: report.artifacts || []
    };

    updates.agent_metadata = mergedMetadata;

    // Update subtask
    const { data: updated, error: updateError } = await supabase
      .from('autonomous_subtasks')
      .update(updates)
      .eq('id', report.subtask_id)
      .select()
      .single();

    if (updateError) {
      throw new Error(`Failed to update subtask: ${updateError.message}`);
    }

    // If this was a verifier completing, check if all subtasks are done
    if (subtask.assigned_agent_role === 'verifier' && report.status === 'completed') {
      await checkParentTaskCompletion(subtask.parent_task_id, supabase);
    }

    // If status is completed and verification is required, transition to verifying
    if (report.status === 'completed' && subtask.verification_required) {
      await createVerificationSubtask(subtask, supabase);
    }

    return new Response(
      JSON.stringify({
        status: 'success',
        subtask_id: report.subtask_id,
        new_status: report.status,
        message: `Subtask updated to ${report.status}`
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('Webhook error:', errorMsg);

    return new Response(
      JSON.stringify({ error: errorMsg }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * Create a verification subtask for completed work
 */
async function createVerificationSubtask(completedSubtask: any, supabase: any): Promise<void> {
  const { error } = await supabase
    .from('autonomous_subtasks')
    .insert({
      parent_task_id: completedSubtask.parent_task_id,
      title: `Verify: ${completedSubtask.title}`,
      description: `Verify the work completed in subtask ${completedSubtask.id}`,
      status: 'pending',
      priority: completedSubtask.priority,
      assigned_agent_role: 'verifier',
      verification_required: false,
      agent_metadata: {
        verifies_subtask_id: completedSubtask.id,
        original_subtask_metadata: completedSubtask.agent_metadata
      }
    });

  if (error) {
    console.error('Failed to create verification subtask:', error);
  }
}

/**
 * Check if all subtasks for a parent task are complete
 */
async function checkParentTaskCompletion(parentTaskId: string, supabase: any): Promise<void> {
  const { data: incompleteSubtasks, error } = await supabase
    .from('autonomous_subtasks')
    .select('id')
    .eq('parent_task_id', parentTaskId)
    .not('status', 'in', ['completed', 'failed']);

  if (error) {
    console.error('Failed to check parent task completion:', error);
    return;
  }

  if (incompleteSubtasks && incompleteSubtasks.length === 0) {
    // All subtasks complete - could update parent task status here
    console.log(`All subtasks complete for parent task ${parentTaskId}`);

    // Optionally update the parent deep_work_task
    // await supabase
    //   .from('deep_work_tasks')
    //   .update({ status: 'completed' })
    //   .eq('id', parentTaskId);
  }
}
