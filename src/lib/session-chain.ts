/**
 * Session Chain Management for Agent Mission Control
 * 
 * Handles conversation continuity across model switches by:
 * 1. Capturing context before switching
 * 2. Spawning new session with context injection
 * 3. Updating thread to point to new session
 */

import { supabase } from './supabase';
import type { Database } from './supabase';

export type ConversationThread = Database['public']['Tables']['conversation_threads']['Row'];
export type SessionChain = Database['public']['Tables']['session_chain']['Row'];

export interface SessionSwitchResult {
  success: boolean;
  newSessionKey: string;
  oldSessionKey: string;
  threadId: string;
  error?: string;
}

/**
 * Switch agent model while preserving conversation continuity
 */
export async function switchAgentModel(
  threadId: string,
  newModel: string,
  reason: string = 'model_switch'
): Promise<SessionSwitchResult> {
  try {
    // 1. Get current thread state
    const { data: thread, error: threadError } = await supabase
      .from('conversation_threads')
      .select('*')
      .eq('id', threadId)
      .single();

    if (threadError || !thread) {
      throw new Error(`Thread not found: ${threadId}`);
    }

    const oldSessionKey = thread.current_session_key;

    // 2. Fetch conversation history from current session
    let contextSnapshot = '';
    if (oldSessionKey) {
      const historyRes = await fetch(`/api/sessions/history?sessionKey=${oldSessionKey}`);
      if (historyRes.ok) {
        const history = await historyRes.json();
        // Grab last 15 messages for context
        const recentMessages = history.messages?.slice(-15) || [];
        contextSnapshot = recentMessages
          .map((m: any) => `${m.role}: ${m.content}`)
          .join('\n');
      }
    }

    // 3. Spawn new session with context injection
    const spawnRes = await fetch('/api/sessions/spawn', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: newModel,
        initialContext: contextSnapshot
          ? `Continuing previous conversation:\n\n${contextSnapshot}\n\n(Please continue naturally, no need to acknowledge this context.)`
          : 'New conversation starting.',
        mode: 'session',
        runtime: 'subagent'
      })
    });

    if (!spawnRes.ok) {
      throw new Error('Failed to spawn new session');
    }

    const newSession = await spawnRes.json();
    const newSessionKey = newSession.sessionKey;

    // 4. Record session chain link
    await supabase.from('session_chain').insert({
      thread_id: threadId,
      session_key: newSessionKey,
      model: newModel,
      reason: reason,
      context_snapshot: contextSnapshot,
      start_tokens: 0
    });

    // 5. Update thread to point to new session
    await supabase
      .from('conversation_threads')
      .update({
        current_session_key: newSessionKey,
        current_model: newModel,
        session_count: thread.session_count + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', threadId);

    return {
      success: true,
      newSessionKey,
      oldSessionKey,
      threadId
    };
  } catch (error: any) {
    console.error('Session switch failed:', error);
    return {
      success: false,
      newSessionKey: '',
      oldSessionKey: '',
      threadId,
      error: error.message
    };
  }
}

/**
 * Create a new conversation thread with initial session
 */
export async function createThread(
  title: string,
  initialModel: string,
  userId?: string
): Promise<{ threadId: string; sessionKey: string; error?: string }> {
  try {
    // 1. Spawn initial session
    const spawnRes = await fetch('/api/sessions/spawn', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: initialModel,
        task: title,
        mode: 'session',
        runtime: 'subagent'
      })
    });

    if (!spawnRes.ok) {
      throw new Error('Failed to spawn initial session');
    }

    const session = await spawnRes.json();
    const sessionKey = session.sessionKey;

    // 2. Create thread record
    const { data: thread, error: insertError } = await supabase
      .from('conversation_threads')
      .insert({
        title,
        current_session_key: sessionKey,
        current_model: initialModel,
        user_id: userId,
        status: 'active'
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    // 3. Record initial session in chain
    await supabase.from('session_chain').insert({
      thread_id: thread.id,
      session_key: sessionKey,
      model: initialModel,
      reason: 'initial'
    });

    return {
      threadId: thread.id,
      sessionKey
    };
  } catch (error: any) {
    console.error('Thread creation failed:', error);
    return {
      threadId: '',
      sessionKey: '',
      error: error.message
    };
  }
}

/**
 * Get thread with full session history
 */
export async function getThreadWithHistory(threadId: string) {
  const { data: thread } = await supabase
    .from('conversation_threads')
    .select('*')
    .eq('id', threadId)
    .single();

  const { data: chain } = await supabase
    .from('session_chain')
    .select('*')
    .eq('thread_id', threadId)
    .order('created_at', { ascending: false });

  return {
    thread,
    sessionChain: chain || []
  };
}
