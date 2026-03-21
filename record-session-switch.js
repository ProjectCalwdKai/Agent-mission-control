const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bxnunccjqnuobinhnyml.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4bnVuY2NqcW51b2JpbmhueW1sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDAzNjMwMSwiZXhwIjoyMDg5NjEyMzAxfQ.osaizgdNfX0GF_RplfnoYi9Mm_N3sxAq-QGN69zZFHI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function recordSwitch() {
  console.log('📝 Recording session chain link in Supabase...\n');

  // Simulate switching from Qwen to Gemini-Flash
  const oldSessionKey = 'agent:main:subagent:8c09c34f-d1d3-4aab-9446-7ba3522d13cc';
  const newSessionKey = 'agent:main:subagent:475a3dc7-5d71-4120-bb5e-bc7eaf863eab';
  const threadId = '00000000-0000-0000-0000-000000000001';

  // 1. Record in session_chain
  const { data: chain, error: chainError } = await supabase
    .from('session_chain')
    .insert({
      thread_id: threadId,
      session_key: newSessionKey,
      model: 'gemini-flash',
      reason: 'test_switch',
      context_snapshot: 'Qwen session confirmed active. Switching to Gemini-Flash for cost optimization.'
    })
    .select()
    .single();

  if (chainError) {
    console.log('❌ Failed to record session chain:', chainError.message);
    return;
  }

  console.log('✅ Session chain recorded:');
  console.log('   Chain ID:', chain.id);
  console.log('   Session Key:', newSessionKey.slice(0, 40) + '...');
  console.log('   Model: gemini-flash');
  console.log('   Reason: test_switch');
  console.log('');

  // 2. Update thread to point to new session
  const { data: thread, error: threadError } = await supabase
    .from('conversation_threads')
    .update({
      current_session_key: newSessionKey,
      current_model: 'gemini-flash',
      session_count: 2,
      updated_at: new Date().toISOString()
    })
    .eq('id', threadId)
    .select()
    .single();

  if (threadError) {
    console.log('❌ Failed to update thread:', threadError.message);
    return;
  }

  console.log('✅ Thread updated:');
  console.log('   Thread ID:', thread.id);
  console.log('   New Model:', thread.current_model);
  console.log('   Session Count:', thread.session_count);
  console.log('   Updated At:', new Date(thread.updated_at).toLocaleString());
  console.log('');

  // 3. Show full chain history
  const { data: allChains } = await supabase
    .from('session_chain')
    .select('*')
    .eq('thread_id', threadId)
    .order('created_at', { ascending: true });

  console.log('📜 Full Session Chain History:');
  if (allChains && allChains.length > 0) {
    allChains.forEach((c, i) => {
      console.log(`   [${i + 1}] ${c.model} - ${c.reason}`);
      console.log(`       Session: ${c.session_key.slice(0, 40)}...`);
      console.log(`       Created: ${new Date(c.created_at).toLocaleString()}`);
    });
  } else {
    console.log('   (No chain entries yet)');
  }
}

recordSwitch().catch(console.error);
