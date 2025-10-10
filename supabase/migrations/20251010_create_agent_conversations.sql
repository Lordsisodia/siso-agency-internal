-- Create agent_conversations table for AI chat transcript storage
-- Migration: 20251010_create_agent_conversations

CREATE TABLE IF NOT EXISTS public.agent_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  telegram_chat_id INTEGER,
  conversation_history JSONB DEFAULT '[]'::jsonb,
  context JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_agent_conversations_user_id
  ON public.agent_conversations(user_id);

CREATE INDEX IF NOT EXISTS idx_agent_conversations_telegram_chat_id
  ON public.agent_conversations(telegram_chat_id);

-- RLS Policies
ALTER TABLE public.agent_conversations ENABLE ROW LEVEL SECURITY;

-- Users can only see their own conversations
CREATE POLICY "Users can view own conversations"
  ON public.agent_conversations
  FOR SELECT
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Users can insert their own conversations
CREATE POLICY "Users can insert own conversations"
  ON public.agent_conversations
  FOR INSERT
  WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Users can update their own conversations
CREATE POLICY "Users can update own conversations"
  ON public.agent_conversations
  FOR UPDATE
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Comment
COMMENT ON TABLE public.agent_conversations IS 'Stores AI conversation transcripts for morning routine and task planning';
