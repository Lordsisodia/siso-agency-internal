-- AI Chat Assistant Enhanced Database Schema
-- Non-breaking additions to existing database

-- Chat Threads Table
CREATE TABLE IF NOT EXISTS ai_chat_threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(50) DEFAULT 'general' CHECK (type IN ('morning_routine', 'task_planning', 'general', 'project_specific')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_message_at TIMESTAMP WITH TIME ZONE,
    message_count INTEGER DEFAULT 0,
    is_archived BOOLEAN DEFAULT FALSE,
    metadata JSONB,
    
    -- Indexes for performance
    INDEX idx_ai_chat_threads_user_id (user_id),
    INDEX idx_ai_chat_threads_type (type),
    INDEX idx_ai_chat_threads_last_message (last_message_at DESC),
    INDEX idx_ai_chat_threads_created (created_at DESC)
);

-- Chat Messages Table
CREATE TABLE IF NOT EXISTS ai_chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID NOT NULL REFERENCES ai_chat_threads(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    type VARCHAR(50) DEFAULT 'normal' CHECK (type IN ('normal', 'suggestion', 'task', 'timer', 'analysis')),
    metadata JSONB,
    
    -- Indexes for performance
    INDEX idx_ai_chat_messages_thread_id (thread_id),
    INDEX idx_ai_chat_messages_timestamp (timestamp DESC),
    INDEX idx_ai_chat_messages_role (role),
    INDEX idx_ai_chat_messages_type (type)
);

-- Conversation Insights Table
CREATE TABLE IF NOT EXISTS ai_conversation_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID REFERENCES ai_chat_threads(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL,
    insight_type VARCHAR(50) NOT NULL CHECK (insight_type IN ('pattern', 'preference', 'improvement', 'summary')),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    relevance_score FLOAT DEFAULT 0.0 CHECK (relevance_score >= 0.0 AND relevance_score <= 1.0),
    
    -- Indexes for performance
    INDEX idx_ai_insights_user_id (user_id),
    INDEX idx_ai_insights_thread_id (thread_id),
    INDEX idx_ai_insights_type (insight_type),
    INDEX idx_ai_insights_relevance (relevance_score DESC),
    INDEX idx_ai_insights_created (created_at DESC)
);

-- Morning Routine Sessions Table
CREATE TABLE IF NOT EXISTS ai_morning_routine_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    thread_id UUID REFERENCES ai_chat_threads(id) ON DELETE SET NULL,
    session_date DATE NOT NULL,
    duration INTEGER, -- duration in seconds
    planning_phase JSONB,
    timboxing_phase JSONB,
    completion_status VARCHAR(20) DEFAULT 'in_progress' CHECK (completion_status IN ('in_progress', 'completed', 'interrupted')),
    task_ids JSONB, -- array of task IDs created during session
    insights JSONB, -- array of insights from the session
    satisfaction_rating INTEGER CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes for performance
    INDEX idx_ai_morning_sessions_user_id (user_id),
    INDEX idx_ai_morning_sessions_date (session_date DESC),
    INDEX idx_ai_morning_sessions_status (completion_status),
    INDEX idx_ai_morning_sessions_rating (satisfaction_rating DESC),
    
    -- Unique constraint: one session per user per day
    UNIQUE(user_id, session_date)
);

-- AI Personality Configuration Table
CREATE TABLE IF NOT EXISTS ai_personality_configs (
    user_id VARCHAR(255) PRIMARY KEY,
    personality JSONB NOT NULL,
    preferences JSONB NOT NULL,
    learning_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Task Integration Table (links chat messages to created tasks)
CREATE TABLE IF NOT EXISTS ai_chat_task_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES ai_chat_messages(id) ON DELETE CASCADE,
    task_id VARCHAR(255) NOT NULL, -- Reference to your existing task system
    extraction_confidence FLOAT DEFAULT 1.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes
    INDEX idx_ai_task_links_message_id (message_id),
    INDEX idx_ai_task_links_task_id (task_id),
    
    -- Prevent duplicate links
    UNIQUE(message_id, task_id)
);

-- Functions for automatic updates
CREATE OR REPLACE FUNCTION update_ai_chat_thread_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update thread message count and last message time
    UPDATE ai_chat_threads 
    SET 
        message_count = (
            SELECT COUNT(*) 
            FROM ai_chat_messages 
            WHERE thread_id = NEW.thread_id
        ),
        last_message_at = NEW.timestamp,
        updated_at = NOW()
    WHERE id = NEW.thread_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update thread stats when messages are added
CREATE TRIGGER trigger_update_thread_stats
    AFTER INSERT ON ai_chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_ai_chat_thread_stats();

-- Function to clean up old data (optional)
CREATE OR REPLACE FUNCTION cleanup_old_ai_chat_data(
    retention_days INTEGER DEFAULT 365
) RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete old insights with low relevance scores
    DELETE FROM ai_conversation_insights 
    WHERE created_at < NOW() - INTERVAL '%s days' AND relevance_score < 0.3;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Archive old threads instead of deleting
    UPDATE ai_chat_threads 
    SET is_archived = TRUE
    WHERE created_at < NOW() - INTERVAL '%s days' 
    AND message_count < 5 
    AND is_archived = FALSE;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Views for common queries
CREATE OR REPLACE VIEW ai_chat_thread_summary AS
SELECT 
    t.id,
    t.user_id,
    t.title,
    t.type,
    t.created_at,
    t.last_message_at,
    t.message_count,
    t.is_archived,
    COALESCE(recent_message.content, '') as last_message_preview
FROM ai_chat_threads t
LEFT JOIN LATERAL (
    SELECT content 
    FROM ai_chat_messages 
    WHERE thread_id = t.id 
    ORDER BY timestamp DESC 
    LIMIT 1
) recent_message ON true
WHERE t.is_archived = FALSE
ORDER BY t.last_message_at DESC NULLS LAST;

-- View for morning routine statistics
CREATE OR REPLACE VIEW ai_morning_routine_stats AS
SELECT 
    user_id,
    COUNT(*) as total_sessions,
    AVG(duration) as avg_duration_seconds,
    AVG(satisfaction_rating) as avg_satisfaction,
    COUNT(CASE WHEN completion_status = 'completed' THEN 1 END) as completed_sessions,
    MAX(session_date) as last_session_date,
    -- Calculate current streak
    (
        SELECT COUNT(*) 
        FROM ai_morning_routine_sessions s2 
        WHERE s2.user_id = s1.user_id 
        AND s2.session_date >= (
            SELECT MAX(session_date) - INTERVAL '30 days'
            FROM ai_morning_routine_sessions s3 
            WHERE s3.user_id = s1.user_id
        )
        AND s2.completion_status = 'completed'
    ) as recent_streak_days
FROM ai_morning_routine_sessions s1
GROUP BY user_id;

-- Indexes on views
CREATE INDEX IF NOT EXISTS idx_ai_thread_summary_user_last_message 
ON ai_chat_threads(user_id, last_message_at DESC) 
WHERE is_archived = FALSE;

-- Grant permissions (adjust as needed for your setup)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO your_app_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO your_app_user;

-- Comments for documentation
COMMENT ON TABLE ai_chat_threads IS 'Stores chat conversation threads for AI assistant';
COMMENT ON TABLE ai_chat_messages IS 'Individual messages within chat threads';
COMMENT ON TABLE ai_conversation_insights IS 'AI-generated insights and patterns from conversations';
COMMENT ON TABLE ai_morning_routine_sessions IS 'Morning routine planning sessions with timing and outcomes';
COMMENT ON TABLE ai_personality_configs IS 'User-specific AI personality and preference settings';
COMMENT ON TABLE ai_chat_task_links IS 'Links between chat messages and created tasks';

COMMENT ON COLUMN ai_chat_threads.type IS 'Categories: morning_routine, task_planning, general, project_specific';
COMMENT ON COLUMN ai_chat_messages.role IS 'Message sender: user, assistant, or system';
COMMENT ON COLUMN ai_conversation_insights.relevance_score IS 'Score 0-1 indicating how relevant/useful this insight is';