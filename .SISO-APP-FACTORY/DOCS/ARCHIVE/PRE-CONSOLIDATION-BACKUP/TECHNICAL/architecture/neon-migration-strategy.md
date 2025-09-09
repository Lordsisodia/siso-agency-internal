# SISO Personal Tasks: Migration to Neon Database

## Why Neon?

✅ **Official MCP Server** - I can directly manage your database via natural language  
✅ **AI-First Architecture** - Built for modern AI workloads with serverless scaling  
✅ **PostgreSQL + pgvector** - Full vector database for advanced AI features  
✅ **Database Branching** - Instant clones for testing without affecting production  
✅ **Free Tier** - 191.9 compute hours/month + 0.5GB storage  

## Migration Strategy

### Phase 1: Setup Neon (15 minutes)
1. **Create Neon account** at https://neon.tech
2. **Create new project** called "SISO-Personal-Tasks"
3. **Enable MCP** at https://mcp.neon.tech
4. **Get connection string** from Neon dashboard

### Phase 2: Update Environment (5 minutes)
```bash
# Add to .env
NEON_DATABASE_URL=postgresql://user:pass@host/db
NEON_API_KEY=your_neon_api_key
```

### Phase 3: Create Schema (10 minutes)
```sql
-- Personal tasks table optimized for AI workloads
CREATE TABLE personal_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT,
  work_type TEXT CHECK (work_type IN ('deep', 'light')) DEFAULT 'light',
  priority TEXT CHECK (priority IN ('critical', 'urgent', 'high', 'medium', 'low')) DEFAULT 'medium',
  completed BOOLEAN DEFAULT false,
  original_date DATE NOT NULL,
  current_date DATE NOT NULL,
  estimated_duration INTEGER DEFAULT 60,
  rollovers INTEGER DEFAULT 0,
  tags TEXT[],
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  device_id TEXT,
  
  -- AI-specific fields
  eisenhower_quadrant TEXT CHECK (eisenhower_quadrant IN ('do-first', 'schedule', 'delegate', 'eliminate')),
  urgency_score INTEGER CHECK (urgency_score BETWEEN 1 AND 10),
  importance_score INTEGER CHECK (importance_score BETWEEN 1 AND 10),
  ai_reasoning TEXT,
  
  -- Vector embedding for semantic search (future)
  embedding vector(1536)
);

-- Indexes for performance
CREATE INDEX idx_personal_tasks_user_date ON personal_tasks(user_id, current_date);
CREATE INDEX idx_personal_tasks_priority ON personal_tasks(user_id, priority, completed);
CREATE INDEX idx_personal_tasks_work_type ON personal_tasks(user_id, work_type);

-- RLS for security
ALTER TABLE personal_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own tasks" ON personal_tasks
  FOR ALL USING (user_id = auth.uid());

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_personal_tasks_updated_at BEFORE UPDATE
ON personal_tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Phase 4: Create Migration Service (20 minutes)
I'll create a service that:
- Exports current localStorage tasks
- Transforms data to Neon schema
- Handles conflicts and duplicates
- Preserves all existing functionality

### Phase 5: Update Application (30 minutes)
- Replace personalTaskService with neonTaskService
- Add real-time subscriptions
- Enable MCP integration for AI features

## Advanced AI Features Enabled

### 1. Natural Language Database Management
With Neon's MCP server, I can:
```
You: "Show me all urgent tasks from last week"
AI: [Queries database] "Found 3 urgent tasks from last week..."

You: "Create a new table for project milestones"
AI: [Executes SQL] "Created milestones table with columns..."
```

### 2. Semantic Task Search
```sql
-- Find similar tasks using vector embeddings
SELECT title, description 
FROM personal_tasks 
WHERE embedding <-> $1 < 0.8
ORDER BY embedding <-> $1;
```

### 3. AI-Powered Analytics
- Task completion patterns
- Productivity insights
- Smart rollover predictions
- Workload balancing suggestions

### 4. Database Branching for AI Experiments
```sql
-- Create experimental branch
SELECT neon_create_branch('ai-experiment');

-- Test AI features safely
-- Switch back to main if needed
```

## Migration Timeline

- **Day 1**: Setup Neon + Schema creation (30 min)
- **Day 2**: Create migration service (1 hour)
- **Day 3**: Test migration with sample data (30 min)
- **Day 4**: Full migration + UI updates (1 hour)
- **Day 5**: Enable MCP integration (30 min)

**Total effort: ~3.5 hours over 5 days**

## Rollback Plan

- Keep localStorage backup for 30 days
- Neon free tier allows easy data export
- Can switch back to Supabase anytime

## Cost Analysis

**Neon Free Tier:**
- 191.9 compute hours/month (enough for personal use)
- 0.5GB storage (thousands of tasks)
- Unlimited databases (for testing)

**Upgrade path:**
- $19/month for 2000 compute hours + 10GB storage
- Still much cheaper than most alternatives

## Next Steps

1. **Approve this strategy** ✅
2. **I'll create the migration service** (20 minutes)
3. **Set up your Neon account** (15 minutes)
4. **Run migration** (5 minutes)
5. **Enable MCP for AI features** (10 minutes)

**Ready to proceed?** This will give us the best foundation for AI-powered task management! 🚀