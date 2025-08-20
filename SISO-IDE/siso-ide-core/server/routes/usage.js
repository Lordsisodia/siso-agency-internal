import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Initialize SQLite database for usage analytics
let usageDb;

function initializeUsageDatabase() {
  try {
    const dbPath = path.join(__dirname, '../database/usage.db');
    usageDb = new Database(dbPath);
    
    // Create tables for usage analytics (adapted from Claudia-GUI structure)
    usageDb.exec(`
      CREATE TABLE IF NOT EXISTS usage_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_name TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        session_id TEXT,
        model TEXT,
        cost_usd REAL DEFAULT 0,
        input_tokens INTEGER DEFAULT 0,
        output_tokens INTEGER DEFAULT 0,
        cache_creation_tokens INTEGER DEFAULT 0,
        cache_read_tokens INTEGER DEFAULT 0,
        project_path TEXT,
        user_id TEXT,
        properties TEXT -- JSON string for additional properties
      );
      
      CREATE TABLE IF NOT EXISTS daily_usage_summary (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL UNIQUE,
        total_cost REAL DEFAULT 0,
        total_sessions INTEGER DEFAULT 0,
        total_tokens INTEGER DEFAULT 0,
        total_input_tokens INTEGER DEFAULT 0,
        total_output_tokens INTEGER DEFAULT 0,
        total_cache_creation_tokens INTEGER DEFAULT 0,
        total_cache_read_tokens INTEGER DEFAULT 0,
        models_used TEXT, -- JSON array of models used that day
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS project_usage_summary (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_path TEXT NOT NULL,
        date_range TEXT NOT NULL,
        total_cost REAL DEFAULT 0,
        session_count INTEGER DEFAULT 0,
        total_tokens INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(project_path, date_range)
      );
      
      CREATE TABLE IF NOT EXISTS model_usage_summary (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        model TEXT NOT NULL,
        date_range TEXT NOT NULL,
        total_cost REAL DEFAULT 0,
        session_count INTEGER DEFAULT 0,
        input_tokens INTEGER DEFAULT 0,
        output_tokens INTEGER DEFAULT 0,
        cache_creation_tokens INTEGER DEFAULT 0,
        cache_read_tokens INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(model, date_range)
      );
      
      CREATE INDEX IF NOT EXISTS idx_usage_events_timestamp ON usage_events(timestamp);
      CREATE INDEX IF NOT EXISTS idx_usage_events_session ON usage_events(session_id);
      CREATE INDEX IF NOT EXISTS idx_usage_events_model ON usage_events(model);
      CREATE INDEX IF NOT EXISTS idx_usage_events_project ON usage_events(project_path);
      CREATE INDEX IF NOT EXISTS idx_daily_summary_date ON daily_usage_summary(date);
    `);
    
    console.log('✅ Usage analytics database initialized');
  } catch (error) {
    console.error('❌ Failed to initialize usage database:', error);
  }
}

// Initialize the database
initializeUsageDatabase();

// Helper function to calculate date range
function getDateRangeFilter(range) {
  const now = new Date();
  let startDate;
  
  switch (range) {
    case '7d':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case 'all':
      startDate = new Date('2020-01-01'); // Far back enough to include all data
      break;
    default:
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }
  
  return startDate.toISOString();
}

// Helper function to generate mock data for fallback
function generateMockUsageData(range = '7d') {
  const models = ['claude-4-opus', 'claude-3.5-sonnet', 'claude-3-opus'];
  const projects = [
    '/Users/user/dev/siso-ide',
    '/Users/user/projects/web-app', 
    '/Users/user/work/backend-api',
    '/Users/user/personal/blog',
    '/Users/user/learning/ml-project'
  ];

  const mockStats = {
    total_cost: Math.random() * 50 + 10,
    total_sessions: Math.floor(Math.random() * 100) + 20,
    total_tokens: Math.floor(Math.random() * 1000000) + 500000,
    total_input_tokens: Math.floor(Math.random() * 600000) + 300000,
    total_output_tokens: Math.floor(Math.random() * 400000) + 200000,
    total_cache_creation_tokens: Math.floor(Math.random() * 50000) + 10000,
    total_cache_read_tokens: Math.floor(Math.random() * 100000) + 50000,
    by_model: models.map(model => ({
      model,
      session_count: Math.floor(Math.random() * 30) + 5,
      total_cost: Math.random() * 20 + 2,
      input_tokens: Math.floor(Math.random() * 200000) + 50000,
      output_tokens: Math.floor(Math.random() * 150000) + 30000,
      cache_creation_tokens: Math.floor(Math.random() * 20000) + 2000,
      cache_read_tokens: Math.floor(Math.random() * 40000) + 10000
    })),
    by_project: projects.map(project => ({
      project_path: project,
      session_count: Math.floor(Math.random() * 20) + 3,
      total_cost: Math.random() * 15 + 1,
      total_tokens: Math.floor(Math.random() * 200000) + 50000
    })),
    by_date: Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return {
        date: date.toISOString().split('T')[0],
        total_cost: Math.random() * 8 + 0.5,
        total_tokens: Math.floor(Math.random() * 50000) + 10000,
        models_used: models.slice(0, Math.floor(Math.random() * 3) + 1)
      };
    }).reverse()
  };

  return mockStats;
}

// Route: Get usage statistics
router.get('/stats', (req, res) => {
  try {
    const { range = '7d' } = req.query;
    const startDate = getDateRangeFilter(range);
    
    if (!usageDb) {
      // Return mock data if database is not available
      console.log('📊 Usage database not available, returning mock data');
      return res.json(generateMockUsageData(range));
    }
    
    // Get total statistics for the date range
    const totalStats = usageDb.prepare(`
      SELECT 
        COALESCE(SUM(cost_usd), 0) as total_cost,
        COUNT(DISTINCT session_id) as total_sessions,
        COALESCE(SUM(input_tokens + output_tokens + cache_creation_tokens + cache_read_tokens), 0) as total_tokens,
        COALESCE(SUM(input_tokens), 0) as total_input_tokens,
        COALESCE(SUM(output_tokens), 0) as total_output_tokens,
        COALESCE(SUM(cache_creation_tokens), 0) as total_cache_creation_tokens,
        COALESCE(SUM(cache_read_tokens), 0) as total_cache_read_tokens
      FROM usage_events 
      WHERE timestamp >= ?
    `).get(startDate);
    
    // Get usage by model
    const modelStats = usageDb.prepare(`
      SELECT 
        model,
        COUNT(DISTINCT session_id) as session_count,
        COALESCE(SUM(cost_usd), 0) as total_cost,
        COALESCE(SUM(input_tokens), 0) as input_tokens,
        COALESCE(SUM(output_tokens), 0) as output_tokens,
        COALESCE(SUM(cache_creation_tokens), 0) as cache_creation_tokens,
        COALESCE(SUM(cache_read_tokens), 0) as cache_read_tokens
      FROM usage_events 
      WHERE timestamp >= ? AND model IS NOT NULL
      GROUP BY model
      ORDER BY total_cost DESC
    `).all(startDate);
    
    // Get usage by project
    const projectStats = usageDb.prepare(`
      SELECT 
        project_path,
        COUNT(DISTINCT session_id) as session_count,
        COALESCE(SUM(cost_usd), 0) as total_cost,
        COALESCE(SUM(input_tokens + output_tokens + cache_creation_tokens + cache_read_tokens), 0) as total_tokens
      FROM usage_events 
      WHERE timestamp >= ? AND project_path IS NOT NULL
      GROUP BY project_path
      ORDER BY total_cost DESC
    `).all(startDate);
    
    // Get daily usage data
    const dailyStats = usageDb.prepare(`
      SELECT 
        DATE(timestamp) as date,
        COALESCE(SUM(cost_usd), 0) as total_cost,
        COALESCE(SUM(input_tokens + output_tokens + cache_creation_tokens + cache_read_tokens), 0) as total_tokens,
        GROUP_CONCAT(DISTINCT model) as models_used
      FROM usage_events 
      WHERE timestamp >= ?
      GROUP BY DATE(timestamp)
      ORDER BY date ASC
    `).all(startDate);
    
    // Format the response to match the expected structure
    const response = {
      total_cost: totalStats.total_cost || 0,
      total_sessions: totalStats.total_sessions || 0,
      total_tokens: totalStats.total_tokens || 0,
      total_input_tokens: totalStats.total_input_tokens || 0,
      total_output_tokens: totalStats.total_output_tokens || 0,
      total_cache_creation_tokens: totalStats.total_cache_creation_tokens || 0,
      total_cache_read_tokens: totalStats.total_cache_read_tokens || 0,
      by_model: modelStats.length > 0 ? modelStats : generateMockUsageData(range).by_model,
      by_project: projectStats.length > 0 ? projectStats : generateMockUsageData(range).by_project,
      by_date: dailyStats.length > 0 ? dailyStats.map(day => ({
        date: day.date,
        total_cost: day.total_cost,
        total_tokens: day.total_tokens,
        models_used: day.models_used ? day.models_used.split(',') : []
      })) : generateMockUsageData(range).by_date
    };
    
    // If no real data, fall back to mock data
    if (response.total_cost === 0 && response.total_sessions === 0) {
      console.log('📊 No usage data found, returning mock data');
      return res.json(generateMockUsageData(range));
    }
    
    res.json(response);
  } catch (error) {
    console.error('❌ Error fetching usage stats:', error);
    // Return mock data on error
    res.json(generateMockUsageData(req.query.range || '7d'));
  }
});

// Route: Record usage event (for tracking new events)
router.post('/events', (req, res) => {
  try {
    const {
      event_name,
      session_id,
      model,
      cost_usd = 0,
      input_tokens = 0,
      output_tokens = 0,
      cache_creation_tokens = 0,
      cache_read_tokens = 0,
      project_path,
      user_id,
      properties = {}
    } = req.body;
    
    if (!usageDb) {
      console.log('📊 Usage database not available, event not recorded');
      return res.json({ success: false, error: 'Database not available' });
    }
    
    if (!event_name) {
      return res.status(400).json({ error: 'event_name is required' });
    }
    
    // Insert the event
    const stmt = usageDb.prepare(`
      INSERT INTO usage_events (
        event_name, session_id, model, cost_usd, input_tokens, output_tokens,
        cache_creation_tokens, cache_read_tokens, project_path, user_id, properties
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      event_name,
      session_id,
      model,
      cost_usd,
      input_tokens,
      output_tokens,
      cache_creation_tokens,
      cache_read_tokens,
      project_path,
      user_id,
      JSON.stringify(properties)
    );
    
    // Update daily summary
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
    
    res.json({ success: true, id: result.lastInsertRowid });
  } catch (error) {
    console.error('❌ Error recording usage event:', error);
    res.status(500).json({ error: error.message });
  }
});

// Route: Get project usage breakdown
router.get('/projects', (req, res) => {
  try {
    const { range = '7d' } = req.query;
    const startDate = getDateRangeFilter(range);
    
    if (!usageDb) {
      return res.json(generateMockUsageData(range).by_project);
    }
    
    const projectStats = usageDb.prepare(`
      SELECT 
        project_path,
        COUNT(DISTINCT session_id) as session_count,
        COALESCE(SUM(cost_usd), 0) as total_cost,
        COALESCE(SUM(input_tokens + output_tokens + cache_creation_tokens + cache_read_tokens), 0) as total_tokens,
        COUNT(*) as event_count
      FROM usage_events 
      WHERE timestamp >= ? AND project_path IS NOT NULL
      GROUP BY project_path
      ORDER BY total_cost DESC
    `).all(startDate);
    
    res.json(projectStats.length > 0 ? projectStats : generateMockUsageData(range).by_project);
  } catch (error) {
    console.error('❌ Error fetching project usage:', error);
    res.json(generateMockUsageData(req.query.range || '7d').by_project);
  }
});

// Route: Get model usage breakdown
router.get('/models', (req, res) => {
  try {
    const { range = '7d' } = req.query;
    const startDate = getDateRangeFilter(range);
    
    if (!usageDb) {
      return res.json(generateMockUsageData(range).by_model);
    }
    
    const modelStats = usageDb.prepare(`
      SELECT 
        model,
        COUNT(DISTINCT session_id) as session_count,
        COALESCE(SUM(cost_usd), 0) as total_cost,
        COALESCE(SUM(input_tokens), 0) as input_tokens,
        COALESCE(SUM(output_tokens), 0) as output_tokens,
        COALESCE(SUM(cache_creation_tokens), 0) as cache_creation_tokens,
        COALESCE(SUM(cache_read_tokens), 0) as cache_read_tokens,
        COUNT(*) as event_count
      FROM usage_events 
      WHERE timestamp >= ? AND model IS NOT NULL
      GROUP BY model
      ORDER BY total_cost DESC
    `).all(startDate);
    
    res.json(modelStats.length > 0 ? modelStats : generateMockUsageData(range).by_model);
  } catch (error) {
    console.error('❌ Error fetching model usage:', error);
    res.json(generateMockUsageData(req.query.range || '7d').by_model);
  }
});

// Route: Get daily timeline data
router.get('/timeline', (req, res) => {
  try {
    const { range = '7d' } = req.query;
    const startDate = getDateRangeFilter(range);
    
    if (!usageDb) {
      return res.json(generateMockUsageData(range).by_date);
    }
    
    const dailyStats = usageDb.prepare(`
      SELECT 
        DATE(timestamp) as date,
        COALESCE(SUM(cost_usd), 0) as total_cost,
        COALESCE(SUM(input_tokens + output_tokens + cache_creation_tokens + cache_read_tokens), 0) as total_tokens,
        COUNT(DISTINCT session_id) as session_count,
        GROUP_CONCAT(DISTINCT model) as models_used
      FROM usage_events 
      WHERE timestamp >= ?
      GROUP BY DATE(timestamp)
      ORDER BY date ASC
    `).all(startDate);
    
    const formatted = dailyStats.map(day => ({
      date: day.date,
      total_cost: day.total_cost,
      total_tokens: day.total_tokens,
      session_count: day.session_count,
      models_used: day.models_used ? day.models_used.split(',') : []
    }));
    
    res.json(formatted.length > 0 ? formatted : generateMockUsageData(range).by_date);
  } catch (error) {
    console.error('❌ Error fetching timeline data:', error);
    res.json(generateMockUsageData(req.query.range || '7d').by_date);
  }
});

// Route: Get daily spending analysis
router.get('/daily-spending', (req, res) => {
  try {
    const { days = 30 } = req.query;
    
    if (!usageDb) {
      return res.json({ daily_spending: [] });
    }
    
    const dailySpending = usageDb.prepare(`
      SELECT 
        DATE(timestamp) as date,
        COUNT(*) as api_calls,
        ROUND(SUM(cost_usd), 2) as daily_cost,
        SUM(input_tokens + output_tokens + cache_creation_tokens + cache_read_tokens) as total_tokens,
        ROUND(AVG(cost_usd), 4) as avg_cost_per_call,
        COUNT(DISTINCT session_id) as unique_sessions,
        COUNT(DISTINCT model) as models_used,
        COUNT(DISTINCT project_path) as projects_used
      FROM usage_events 
      WHERE datetime(timestamp) >= datetime('now', '-${days} days')
      GROUP BY DATE(timestamp)
      ORDER BY date ASC
    `).all();
    
    res.json({ daily_spending: dailySpending });
  } catch (error) {
    console.error('❌ Error fetching daily spending:', error);
    res.json({ daily_spending: [] });
  }
});

// Route: Get model efficiency analysis
router.get('/model-efficiency', (req, res) => {
  try {
    const { range = '30d' } = req.query;
    const startDate = getDateRangeFilter(range);
    
    if (!usageDb) {
      return res.json({ model_efficiency: [] });
    }
    
    const modelEfficiency = usageDb.prepare(`
      SELECT 
        model,
        COUNT(*) as usage_count,
        ROUND(SUM(cost_usd), 2) as total_cost,
        SUM(input_tokens + output_tokens + cache_creation_tokens + cache_read_tokens) as total_tokens,
        ROUND(SUM(cost_usd) / SUM(input_tokens + output_tokens + cache_creation_tokens + cache_read_tokens) * 1000000, 2) as cost_per_million_tokens,
        ROUND(AVG(output_tokens * 1.0 / NULLIF(input_tokens, 0)), 2) as avg_output_input_ratio,
        ROUND(AVG(cost_usd), 4) as avg_cost_per_call,
        COUNT(DISTINCT session_id) as unique_sessions,
        ROUND(SUM(output_tokens) * 1.0 / COUNT(*), 0) as avg_output_per_call
      FROM usage_events 
      WHERE timestamp >= ? AND model IS NOT NULL AND cost_usd > 0
      GROUP BY model
      ORDER BY total_cost DESC
    `).all(startDate);
    
    res.json({ model_efficiency: modelEfficiency });
  } catch (error) {
    console.error('❌ Error fetching model efficiency:', error);
    res.json({ model_efficiency: [] });
  }
});

// Route: Get project productivity analysis
router.get('/project-productivity', (req, res) => {
  try {
    const { range = '30d' } = req.query;
    const startDate = getDateRangeFilter(range);
    
    if (!usageDb) {
      return res.json({ project_productivity: [] });
    }
    
    const projectProductivity = usageDb.prepare(`
      SELECT 
        project_path,
        CASE 
          WHEN LENGTH(project_path) > 50 THEN '...' || SUBSTR(project_path, -47)
          ELSE project_path 
        END as display_name,
        COUNT(*) as api_calls,
        COUNT(DISTINCT session_id) as sessions,
        ROUND(SUM(cost_usd), 2) as total_cost,
        ROUND(SUM(cost_usd) / COUNT(DISTINCT session_id), 2) as cost_per_session,
        ROUND(COUNT(*) * 1.0 / COUNT(DISTINCT session_id), 1) as calls_per_session,
        SUM(output_tokens) as output_tokens,
        ROUND(SUM(output_tokens) * 1.0 / COUNT(*), 0) as avg_output_per_call,
        ROUND(SUM(input_tokens + output_tokens + cache_creation_tokens + cache_read_tokens) * 1.0 / COUNT(DISTINCT session_id), 0) as tokens_per_session,
        MIN(DATE(timestamp)) as first_used,
        MAX(DATE(timestamp)) as last_used
      FROM usage_events 
      WHERE timestamp >= ? AND project_path IS NOT NULL
      GROUP BY project_path
      ORDER BY total_cost DESC
    `).all(startDate);
    
    res.json({ project_productivity: projectProductivity });
  } catch (error) {
    console.error('❌ Error fetching project productivity:', error);
    res.json({ project_productivity: [] });
  }
});

// Route: Get cost prediction and trends
router.get('/cost-prediction', (req, res) => {
  try {
    if (!usageDb) {
      return res.json({ 
        monthly_projection: 0,
        weekly_trend: 0,
        efficiency_trend: 0,
        recommendations: []
      });
    }
    
    // Get recent 30 days for trend analysis
    const recentData = usageDb.prepare(`
      SELECT 
        DATE(timestamp) as date,
        SUM(cost_usd) as daily_cost,
        COUNT(*) as daily_calls,
        AVG(cost_usd) as avg_cost_per_call
      FROM usage_events 
      WHERE datetime(timestamp) >= datetime('now', '-30 days')
      GROUP BY DATE(timestamp)
      ORDER BY date ASC
    `).all();
    
    if (recentData.length < 7) {
      return res.json({ 
        monthly_projection: 0,
        weekly_trend: 0,
        efficiency_trend: 0,
        recommendations: ['Need more usage data for accurate predictions']
      });
    }
    
    // Calculate trends and projections
    const last7Days = recentData.slice(-7);
    const previous7Days = recentData.slice(-14, -7);
    
    const recent7DaysSpend = last7Days.reduce((sum, day) => sum + day.daily_cost, 0);
    const previous7DaysSpend = previous7Days.reduce((sum, day) => sum + day.daily_cost, 0);
    
    const weeklyTrend = previous7DaysSpend > 0 ? 
      ((recent7DaysSpend - previous7DaysSpend) / previous7DaysSpend) * 100 : 0;
    
    const avgDailySpend = recent7DaysSpend / 7;
    const monthlyProjection = avgDailySpend * 30;
    
    // Efficiency trend
    const recentEfficiency = last7Days.reduce((sum, day) => sum + day.avg_cost_per_call, 0) / last7Days.length;
    const previousEfficiency = previous7Days.reduce((sum, day) => sum + day.avg_cost_per_call, 0) / previous7Days.length;
    const efficiencyTrend = previousEfficiency > 0 ? 
      ((recentEfficiency - previousEfficiency) / previousEfficiency) * 100 : 0;
    
    // Generate recommendations
    const recommendations = [];
    
    if (weeklyTrend > 20) {
      recommendations.push('Spending increased by >20% this week - consider monitoring usage patterns');
    }
    
    if (efficiencyTrend > 15) {
      recommendations.push('Cost per API call is increasing - consider using more cost-effective models');
    }
    
    if (monthlyProjection > 1000) {
      recommendations.push('Monthly projection exceeds $1000 - review high-cost projects and optimize usage');
    }
    
    const highSpendDays = last7Days.filter(day => day.daily_cost > avgDailySpend * 2);
    if (highSpendDays.length > 2) {
      recommendations.push('Multiple high-spend days detected - investigate usage spikes');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Usage patterns look healthy and cost-effective');
    }
    
    res.json({
      monthly_projection: Math.round(monthlyProjection * 100) / 100,
      weekly_trend: Math.round(weeklyTrend * 100) / 100,
      efficiency_trend: Math.round(efficiencyTrend * 100) / 100,
      avg_daily_spend: Math.round(avgDailySpend * 100) / 100,
      recent_efficiency: Math.round(recentEfficiency * 10000) / 10000,
      recommendations
    });
  } catch (error) {
    console.error('❌ Error generating cost prediction:', error);
    res.json({ 
      monthly_projection: 0,
      weekly_trend: 0,
      efficiency_trend: 0,
      recommendations: ['Error calculating predictions']
    });
  }
});

export default router;