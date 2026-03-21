-- Session Chaining Schema for Agent Mission Control
-- Run this in Supabase SQL Editor or via psql

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table 1: Conversation Threads (persistent conversation containers)
CREATE TABLE IF NOT EXISTS conversation_threads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT,
  current_session_key TEXT,
  current_model TEXT,
  title TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'archived')),
  total_tokens BIGINT DEFAULT 0,
  session_count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 2: Session Chain (audit trail of all session switches)
CREATE TABLE IF NOT EXISTS session_chain (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id UUID REFERENCES conversation_threads(id) ON DELETE CASCADE,
  session_key TEXT UNIQUE NOT NULL,
  model TEXT NOT NULL,
  start_tokens INTEGER DEFAULT 0,
  end_tokens INTEGER DEFAULT 0,
  reason TEXT, -- 'token_limit', 'model_switch', 'task_change', 'cost_optimization'
  context_snapshot TEXT, -- Last N messages captured for continuity
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_threads_current_session ON conversation_threads(current_session_key);
CREATE INDEX IF NOT EXISTS idx_threads_user_id ON conversation_threads(user_id);
CREATE INDEX IF NOT EXISTS idx_threads_status ON conversation_threads(status);
CREATE INDEX IF NOT EXISTS idx_chain_thread_id ON session_chain(thread_id);
CREATE INDEX IF NOT EXISTS idx_chain_session_key ON session_chain(session_key);

-- View: Thread with latest session info
CREATE OR REPLACE VIEW thread_summary AS
SELECT 
  ct.id,
  ct.title,
  ct.status,
  ct.current_model,
  ct.session_count,
  ct.total_tokens,
  sc.created_at as last_switch_at,
  sc.reason as last_switch_reason
FROM conversation_threads ct
LEFT JOIN session_chain sc ON ct.id = sc.thread_id
WHERE sc.created_at = (
  SELECT MAX(created_at) FROM session_chain WHERE thread_id = ct.id
);

-- Insert a test thread
INSERT INTO conversation_threads (id, title, current_model, status, session_count)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Test Thread - Session Chaining Demo',
  'qwen',
  'active',
  1
);
