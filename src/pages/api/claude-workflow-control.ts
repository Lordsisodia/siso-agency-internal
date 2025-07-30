// Claude Workflow Control API
// This endpoint allows Claude to programmatically manage workflows

import { claudeWorkflowManager } from '../../lib/claude-workflow-manager'

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { action, ...params } = req.body

    let result
    switch (action) {
      case 'initialize':
        result = await claudeWorkflowManager.initializeDefaultWorkflow()
        break

      case 'get_status':
        result = await claudeWorkflowManager.getWorkflowAnalytics(params.workflowId)
        break

      case 'add_slack':
        result = await claudeWorkflowManager.addSlackIntegration(params.workflowId, params.slackWebhook)
        break

      case 'update_workflow':
        result = await claudeWorkflowManager.updateWorkflowLogic(params.workflowId, params.updates)
        break

      case 'create_custom':
        result = await claudeWorkflowManager.createCustomWorkflow(params.name, params.description, params.steps)
        break

      case 'toggle':
        result = await claudeWorkflowManager.toggleWorkflow(params.workflowId, params.active)
        break

      default:
        return res.status(400).json({ error: 'Unknown action' })
    }

    res.status(200).json({ success: true, result })
  } catch (error) {
    console.error('❌ Claude workflow control error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
} 