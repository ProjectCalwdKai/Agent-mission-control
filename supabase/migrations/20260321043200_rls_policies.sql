-- Supabase RLS Policies for Session Chaining
-- Run this in Supabase SQL Editor after creating tables

-- Enable RLS on both tables
ALTER TABLE conversation_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_chain ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLICY 1: Users can manage their own threads
-- ============================================
CREATE POLICY "Users can view own threads"
  ON conversation_threads
  FOR SELECT
  USING (user_id = auth.uid()::text OR user_id IS NULL);

CREATE POLICY "Users can insert own threads"
  ON conversation_threads
  FOR INSERT
  WITH CHECK (user_id = auth.uid()::text OR user_id IS NULL);

CREATE POLICY "Users can update own threads"
  ON conversation_threads
  FOR UPDATE
  USING (user_id = auth.uid()::text OR user_id IS NULL);

CREATE POLICY "Users can delete own threads"
  ON conversation_threads
  FOR DELETE
  USING (user_id = auth.uid()::text OR user_id IS NULL);

-- ============================================
-- POLICY 2: Users can manage session chains for their threads
-- ============================================
CREATE POLICY "Users can view session chains for own threads"
  ON session_chain
  FOR SELECT
  USING (
    thread_id IN (
      SELECT id FROM conversation_threads 
      WHERE user_id = auth.uid()::text OR user_id IS NULL
    )
  );

CREATE POLICY "Users can insert session chains for own threads"
  ON session_chain
  FOR INSERT
  WITH CHECK (
    thread_id IN (
      SELECT id FROM conversation_threads 
      WHERE user_id = auth.uid()::text OR user_id IS NULL
    )
  );

CREATE POLICY "Users can update session chains for own threads"
  ON session_chain
  FOR UPDATE
  USING (
    thread_id IN (
      SELECT id FROM conversation_threads 
      WHERE user_id = auth.uid()::text OR user_id IS NULL
    )
  );

CREATE POLICY "Users can delete session chains for own threads"
  ON session_chain
  FOR DELETE
  USING (
    thread_id IN (
      SELECT id FROM conversation_threads 
      WHERE user_id = auth.uid()::text OR user_id IS NULL
    )
  );

-- ============================================
-- POLICY 3: Service role has full access (for backend operations)
-- ============================================
CREATE POLICY "Service role has full access to threads"
  ON conversation_threads
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role')
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role has full access to session chains"
  ON session_chain
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role')
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- ============================================
-- Grant permissions to authenticated users
-- ============================================
GRANT ALL ON conversation_threads TO authenticated;
GRANT ALL ON session_chain TO authenticated;

-- Grant service role explicit permissions
GRANT ALL ON conversation_threads TO service_role;
GRANT ALL ON session_chain TO service_role;

-- ============================================
-- Verification Queries
-- ============================================
-- Run these to verify policies are set up correctly:

-- Check RLS is enabled
-- SELECT tablename, rowsecurity FROM pg_tables WHERE tablename IN ('conversation_threads', 'session_chain');

-- Check policies
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
-- FROM pg_policies 
-- WHERE tablename IN ('conversation_threads', 'session_chain')
-- ORDER BY tablename, policyname;
