import { supabase } from './supabase';

export async function createThread() {
  const { data, error } = await supabase.from('conversation_threads').insert({
    title: 'New Thread', // Default title
    current_model: 'gemini-flash', // Default model
    session_count: 0,
    status: 'active',
  }).select();

  if (error) {
    console.error('Error creating new thread:', error);
    return null;
  }

  return data ? data[0] : null;
}
