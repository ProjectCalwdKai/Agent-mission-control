const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bxnunccjqnuobinhnyml.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4bnVuY2NqcW51b2JpbmhueW1sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDAzNjMwMSwiZXhwIjoyMDg5NjEyMzAxfQ.osaizgdNfX0GF_RplfnoYi9Mm_N3sxAq-QGN69zZFHI';

console.log('🔗 Connecting to Supabase...\n');

const supabase = createClient(supabaseUrl, supabaseKey);

async function testThread() {
  const { data: thread, error } = await supabase
    .from('conversation_threads')
    .select('*')
    .eq('id', '00000000-0000-0000-0000-000000000001')
    .single();

  if (error) {
    console.log('❌ Test thread not found. Creating...');
    const { data: newThread, error: insertError } = await supabase
      .from('conversation_threads')
      .insert({
        id: '00000000-0000-0000-0000-000000000001',
        title: 'Test Thread - Session Chaining Demo',
        current_model: 'qwen',
        status: 'active'
      })
      .select()
      .single();
    
    if (insertError) {
      console.log('❌ Failed to create thread:', insertError.message);
      return null;
    }
    console.log('✅ Test thread created!\n');
    console.log('   ID:', newThread.id);
    console.log('   Title:', newThread.title);
    console.log('   Model:', newThread.current_model);
    console.log('');
    return newThread;
  }

  console.log('✅ Test thread found:');
  console.log('   ID:', thread.id);
  console.log('   Title:', thread.title);
  console.log('   Current Model:', thread.current_model);
  console.log('   Status:', thread.status);
  console.log('   Session Count:', thread.session_count);
  console.log('');
  return thread;
}

testThread().catch(console.error);
