import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize the usage database
let usageDb;

function initializeUsageTracker() {
  try {
    const dbPath = path.join(__dirname, 'database/usage.db');
    usageDb = new Database(dbPath);
    console.log('✅ Usage tracker database connected');
  } catch (error) {
    console.error('❌ Failed to connect to usage tracker database:', error);
  }
}

// Initialize on module load
initializeUsageTracker();

/**
 * Extract usage data from Claude CLI response and save to database
 * @param {Object} claudeResponse - The response object from Claude CLI
 * @param {Object} metadata - Additional metadata about the session
 */
function trackClaudeUsage(claudeResponse, metadata = {}) {
  if (!usageDb) {
    console.log('📊 Usage database not available, skipping tracking');
    return;
  }

  try {
    // Extract token usage from Claude response
    // Claude CLI responses contain usage information in various formats
    let usageData = null;
    
    // Check if response has usage data
    if (claudeResponse.usage) {
      usageData = claudeResponse.usage;
    } else if (claudeResponse.response && claudeResponse.response.usage) {
      usageData = claudeResponse.response.usage;
    } else if (claudeResponse.tool_use_metadata?.usage) {
      usageData = claudeResponse.tool_use_metadata.usage;
    }

    // If no usage data found, skip tracking
    if (!usageData) {
      console.log('📊 No usage data found in Claude response, skipping tracking');
      return;
    }

    // Extract token counts
    const inputTokens = usageData.input_tokens || usageData.prompt_tokens || 0;
    const outputTokens = usageData.output_tokens || usageData.completion_tokens || 0;
    const cacheCreationTokens = usageData.cache_creation_input_tokens || 0;
    const cacheReadTokens = usageData.cache_read_input_tokens || 0;

    // Estimate cost based on model (approximate pricing)
    const model = metadata.model || claudeResponse.model || 'claude-3.5-sonnet';
    const costUsd = estimateCost(model, inputTokens, outputTokens, cacheCreationTokens, cacheReadTokens);

    // Prepare event data
    const eventData = {
      event_name: 'claude_api_call',
      session_id: metadata.sessionId || claudeResponse.session_id || 'unknown',
      model: model,
      cost_usd: costUsd,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      cache_creation_tokens: cacheCreationTokens,
      cache_read_tokens: cacheReadTokens,
      project_path: metadata.projectPath || 'unknown',
      user_id: metadata.userId || 'anonymous',
      properties: JSON.stringify({
        response_type: claudeResponse.type || 'unknown',
        tool_use: claudeResponse.tool_use ? true : false,
        has_attachments: metadata.hasAttachments || false,
        prompt_length: metadata.promptLength || 0
      })
    };

    // Insert into database
    const stmt = usageDb.prepare(`
      INSERT INTO usage_events (
        event_name, session_id, model, cost_usd, input_tokens, output_tokens,
        cache_creation_tokens, cache_read_tokens, project_path, user_id, properties
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      eventData.event_name,
      eventData.session_id,
      eventData.model,
      eventData.cost_usd,
      eventData.input_tokens,
      eventData.output_tokens,
      eventData.cache_creation_tokens,
      eventData.cache_read_tokens,
      eventData.project_path,
      eventData.user_id,
      eventData.properties
    );

    console.log(`📊 Usage tracked - Session: ${eventData.session_id}, Model: ${eventData.model}, Cost: $${eventData.cost_usd.toFixed(4)}, Tokens: ${inputTokens}+${outputTokens}`);

    // Update daily summary
    updateDailySummary();

    return { success: true, id: result.lastInsertRowid };

  } catch (error) {
    console.error('❌ Error tracking Claude usage:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Estimate cost based on model and token usage
 * @param {string} model - The Claude model used
 * @param {number} inputTokens - Input tokens
 * @param {number} outputTokens - Output tokens  
 * @param {number} cacheCreationTokens - Cache creation tokens
 * @param {number} cacheReadTokens - Cache read tokens
 * @returns {number} Estimated cost in USD
 */
function estimateCost(model, inputTokens, outputTokens, cacheCreationTokens, cacheReadTokens) {
  // Approximate Claude API pricing (as of 2024)
  const pricing = {
    'claude-4-opus': {
      input: 0.000015,    // $15 per 1M tokens
      output: 0.000075,   // $75 per 1M tokens
      cacheWrite: 0.000018,  // $18 per 1M tokens
      cacheRead: 0.0000015   // $1.5 per 1M tokens
    },
    'claude-3.5-sonnet': {
      input: 0.000003,    // $3 per 1M tokens
      output: 0.000015,   // $15 per 1M tokens
      cacheWrite: 0.0000045, // $4.5 per 1M tokens
      cacheRead: 0.0000003   // $0.3 per 1M tokens
    },
    'claude-3-opus': {
      input: 0.000015,    // $15 per 1M tokens
      output: 0.000075,   // $75 per 1M tokens
      cacheWrite: 0.000018,
      cacheRead: 0.0000015
    },
    'claude-3-sonnet': {
      input: 0.000003,    // $3 per 1M tokens
      output: 0.000015,   // $15 per 1M tokens
      cacheWrite: 0.0000045,
      cacheRead: 0.0000003
    },
    'claude-3-haiku': {
      input: 0.00000025, // $0.25 per 1M tokens
      output: 0.00000125, // $1.25 per 1M tokens
      cacheWrite: 0.0000003,
      cacheRead: 0.000000025
    }
  };

  // Default to Sonnet 3.5 pricing if model not found
  const modelPricing = pricing[model] || pricing['claude-3.5-sonnet'];

  const inputCost = inputTokens * modelPricing.input;
  const outputCost = outputTokens * modelPricing.output;
  const cacheWriteCost = cacheCreationTokens * modelPricing.cacheWrite;
  const cacheReadCost = cacheReadTokens * modelPricing.cacheRead;

  return inputCost + outputCost + cacheWriteCost + cacheReadCost;
}

/**
 * Update daily usage summary
 */
function updateDailySummary() {
  if (!usageDb) return;

  try {
    const today = new Date().toISOString().split('T')[0];
    
    const updateSummary = usageDb.prepare(`
      INSERT OR REPLACE INTO daily_usage_summary (
        date, total_cost, total_sessions, total_tokens, 
        total_input_tokens, total_output_tokens, 
        total_cache_creation_tokens, total_cache_read_tokens,
        models_used, updated_at
      ) 
      SELECT 
        ?, 
        COALESCE(SUM(cost_usd), 0),
        COUNT(DISTINCT session_id),
        COALESCE(SUM(input_tokens + output_tokens + cache_creation_tokens + cache_read_tokens), 0),
        COALESCE(SUM(input_tokens), 0),
        COALESCE(SUM(output_tokens), 0),
        COALESCE(SUM(cache_creation_tokens), 0),
        COALESCE(SUM(cache_read_tokens), 0),
        JSON_GROUP_ARRAY(DISTINCT model),
        CURRENT_TIMESTAMP
      FROM usage_events 
      WHERE DATE(timestamp) = ?
    `);

    updateSummary.run(today, today);
  } catch (error) {
    console.error('❌ Error updating daily summary:', error);
  }
}

/**
 * Track session start event
 * @param {string} sessionId - Session ID
 * @param {Object} metadata - Session metadata
 */
function trackSessionStart(sessionId, metadata = {}) {
  if (!usageDb) return;

  try {
    const stmt = usageDb.prepare(`
      INSERT INTO usage_events (
        event_name, session_id, model, project_path, user_id, properties
      ) VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      'session_started',
      sessionId,
      metadata.model || 'claude-3.5-sonnet',
      metadata.projectPath || 'unknown',
      metadata.userId || 'anonymous',
      JSON.stringify({
        permission_mode: metadata.permissionMode || 'default',
        has_mcp: metadata.hasMcp || false,
        resumed: metadata.resumed || false
      })
    );

    console.log(`📊 Session started tracked: ${sessionId}`);
  } catch (error) {
    console.error('❌ Error tracking session start:', error);
  }
}

/**
 * Track session end event
 * @param {string} sessionId - Session ID
 * @param {Object} metadata - Session metadata
 */
function trackSessionEnd(sessionId, metadata = {}) {
  if (!usageDb) return;

  try {
    const stmt = usageDb.prepare(`
      INSERT INTO usage_events (
        event_name, session_id, properties
      ) VALUES (?, ?, ?)
    `);

    stmt.run(
      'session_ended',
      sessionId,
      JSON.stringify({
        exit_code: metadata.exitCode || 0,
        duration_ms: metadata.duration || 0,
        reason: metadata.reason || 'normal'
      })
    );

    console.log(`📊 Session ended tracked: ${sessionId}`);
  } catch (error) {
    console.error('❌ Error tracking session end:', error);
  }
}

/**
 * Insert historical usage event with custom timestamp
 * @param {Object} eventData - Event data to insert
 */
function insertHistoricalUsageEvent(eventData) {
  if (!usageDb) {
    console.log('📊 Usage database not available, skipping historical data insert');
    return { success: false, error: 'Database not available' };
  }

  try {
    const stmt = usageDb.prepare(`
      INSERT INTO usage_events (
        event_name, session_id, model, cost_usd, input_tokens, output_tokens,
        cache_creation_tokens, cache_read_tokens, project_path, user_id, properties, timestamp
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      eventData.event_name,
      eventData.session_id,
      eventData.model,
      eventData.cost_usd || 0,
      eventData.input_tokens || 0,
      eventData.output_tokens || 0,
      eventData.cache_creation_tokens || 0,
      eventData.cache_read_tokens || 0,
      eventData.project_path,
      eventData.user_id || 'anonymous',
      eventData.properties || '{}',
      eventData.timestamp
    );

    return { success: true, id: result.lastInsertRowid };

  } catch (error) {
    console.error('❌ Error inserting historical usage event:', error);
    return { success: false, error: error.message };
  }
}

export {
  trackClaudeUsage,
  trackSessionStart,
  trackSessionEnd,
  estimateCost,
  insertHistoricalUsageEvent
};