import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';
import { insertHistoricalUsageEvent, estimateCost } from './usageTracker.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Parse Claude CLI logs exactly like Claude GUI does
 * Based on Claudia GUI's usage.rs implementation
 */

// Claude 4 pricing constants (per million tokens) - matching Claudia GUI
const PRICING = {
  'claude-sonnet-4': {
    input: 3.0,
    output: 15.0,
    cacheWrite: 3.75,
    cacheRead: 0.30
  },
  'claude-opus-4': {
    input: 15.0,
    output: 75.0,
    cacheWrite: 18.75,
    cacheRead: 1.50
  },
  'claude-3.5-sonnet': {
    input: 3.0,
    output: 15.0,
    cacheWrite: 3.75,
    cacheRead: 0.30
  },
  'claude-3.5-sonnet-20241022': {
    input: 3.0,
    output: 15.0,
    cacheWrite: 3.75,
    cacheRead: 0.30
  },
  'claude-3-opus': {
    input: 15.0,
    output: 75.0,
    cacheWrite: 18.75,
    cacheRead: 1.50
  },
  'claude-3-haiku': {
    input: 0.25,
    output: 1.25,
    cacheWrite: 0.30,
    cacheRead: 0.025
  }
};

function calculateCost(model, usage) {
  const inputTokens = usage.input_tokens || 0;
  const outputTokens = usage.output_tokens || 0;
  const cacheCreationTokens = usage.cache_creation_input_tokens || 0;
  const cacheReadTokens = usage.cache_read_input_tokens || 0;

  // Find pricing for model (look for partial matches like Claude GUI does)
  let pricing = null;
  for (const [modelKey, modelPricing] of Object.entries(PRICING)) {
    if (model.includes(modelKey) || model.includes(modelKey.replace('claude-', ''))) {
      pricing = modelPricing;
      break;
    }
  }

  if (!pricing) {
    console.log(`⚠️ Unknown model for pricing: ${model}, using Sonnet 3.5 pricing`);
    pricing = PRICING['claude-3.5-sonnet'];
  }

  // Calculate cost (prices are per million tokens)
  const cost = (inputTokens * pricing.input / 1_000_000) +
               (outputTokens * pricing.output / 1_000_000) +
               (cacheCreationTokens * pricing.cacheWrite / 1_000_000) +
               (cacheReadTokens * pricing.cacheRead / 1_000_000);

  return cost;
}

function parseJsonlFile(filePath, projectName) {
  const entries = [];
  const processedHashes = new Set();
  let actualProjectPath = null;

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Extract session ID from file path (like Claude GUI does)
    const sessionId = path.basename(filePath, '.jsonl');

    for (const line of content.split('\n')) {
      if (!line.trim()) continue;

      try {
        const jsonEntry = JSON.parse(line);

        // Extract actual project path from cwd (like Claude GUI does)
        if (!actualProjectPath && jsonEntry.cwd) {
          actualProjectPath = jsonEntry.cwd;
        }

        // Look for Claude API response messages with usage data
        if (jsonEntry.message && 
            jsonEntry.message.usage && 
            jsonEntry.message.role === 'assistant') {
          
          const message = jsonEntry.message;
          const usage = message.usage;

          // Skip entries without meaningful token usage
          if ((usage.input_tokens || 0) === 0 && 
              (usage.output_tokens || 0) === 0 &&
              (usage.cache_creation_input_tokens || 0) === 0 &&
              (usage.cache_read_input_tokens || 0) === 0) {
            continue;
          }

          // Deduplication based on message ID and request ID (like Claude GUI)
          if (message.id && jsonEntry.requestId) {
            const uniqueHash = `${message.id}:${jsonEntry.requestId}`;
            if (processedHashes.has(uniqueHash)) {
              continue; // Skip duplicate
            }
            processedHashes.add(uniqueHash);
          }

          const cost = calculateCost(message.model || 'claude-3.5-sonnet', usage);

          // Use actual project path if found, otherwise encoded name
          const projectPath = actualProjectPath || projectName;

          entries.push({
            timestamp: jsonEntry.timestamp,
            model: message.model || 'claude-3.5-sonnet',
            input_tokens: usage.input_tokens || 0,
            output_tokens: usage.output_tokens || 0,
            cache_creation_tokens: usage.cache_creation_input_tokens || 0,
            cache_read_tokens: usage.cache_read_input_tokens || 0,
            cost,
            session_id: jsonEntry.sessionId || sessionId,
            project_path: projectPath
          });
        }
      } catch (parseError) {
        // Skip invalid JSON lines
        continue;
      }
    }
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
  }

  return entries;
}

function getAllUsageEntries() {
  const allEntries = [];
  const claudePath = path.join(os.homedir(), '.claude');
  const projectsDir = path.join(claudePath, 'projects');

  if (!fs.existsSync(projectsDir)) {
    console.log('No Claude projects directory found');
    return allEntries;
  }

  try {
    const projects = fs.readdirSync(projectsDir);
    
    for (const project of projects) {
      const projectPath = path.join(projectsDir, project);
      
      if (fs.statSync(projectPath).isDirectory()) {
        const files = fs.readdirSync(projectPath);
        
        for (const file of files) {
          if (file.endsWith('.jsonl')) {
            const filePath = path.join(projectPath, file);
            const entries = parseJsonlFile(filePath, project);
            allEntries.push(...entries);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error reading Claude projects:', error.message);
  }

  // Sort by timestamp (like Claude GUI does)
  allEntries.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  return allEntries;
}

/**
 * Import real Claude usage data from logs
 */
async function importRealClaudeUsage() {
  console.log('📊 Importing REAL Claude usage data from logs...');
  console.log('🔍 Analyzing ~/.claude/projects/ for usage data...');

  const entries = getAllUsageEntries();
  
  if (entries.length === 0) {
    console.log('❌ No Claude usage data found in logs');
    return { success: false, message: 'No usage data found' };
  }

  console.log(`📈 Found ${entries.length} real Claude API calls across projects`);

  let imported = 0;
  let errors = 0;

  for (const entry of entries) {
    try {
      // Insert real usage event
      const result = insertHistoricalUsageEvent({
        event_name: 'claude_api_call',
        session_id: entry.session_id,
        model: entry.model,
        cost_usd: entry.cost,
        input_tokens: entry.input_tokens,
        output_tokens: entry.output_tokens,
        cache_creation_tokens: entry.cache_creation_tokens,
        cache_read_tokens: entry.cache_read_tokens,
        project_path: entry.project_path,
        user_id: 'SISOGOLDMINER',
        timestamp: entry.timestamp,
        properties: JSON.stringify({
          source: 'claude_cli_logs',
          real_data: true
        })
      });

      if (result.success) {
        imported++;
      } else {
        errors++;
        console.error(`Error importing entry: ${result.error}`);
      }
    } catch (error) {
      errors++;
      console.error(`Error processing entry:`, error);
    }
  }

  console.log(`✅ Successfully imported ${imported} real Claude usage entries`);
  if (errors > 0) {
    console.log(`⚠️ ${errors} entries failed to import`);
  }

  // Calculate summary stats
  const totalCost = entries.reduce((sum, e) => sum + e.cost, 0);
  const totalTokens = entries.reduce((sum, e) => sum + e.input_tokens + e.output_tokens, 0);
  const uniqueProjects = new Set(entries.map(e => e.project_path)).size;
  const uniqueSessions = new Set(entries.map(e => e.session_id)).size;

  console.log('\n📊 Real Usage Summary:');
  console.log(`💰 Total cost: $${totalCost.toFixed(2)}`);
  console.log(`🎯 Total tokens: ${totalTokens.toLocaleString()}`);
  console.log(`📁 Projects: ${uniqueProjects}`);
  console.log(`🔄 Sessions: ${uniqueSessions}`);

  return {
    success: true,
    imported,
    errors,
    totalCost,
    totalTokens,
    uniqueProjects,
    uniqueSessions
  };
}

export {
  importRealClaudeUsage,
  getAllUsageEntries,
  parseJsonlFile,
  calculateCost
};