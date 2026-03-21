const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Connecting to Supabase...');

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupSchema() {
  console.log('\n🔧 Setting up session chaining schema...\n');

  // Create conversation_threads table
  const { error: threadsError } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS conversation_threads (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT,
        current_session_key TEXT,
        current_model TEXT,
        title TEXT,
        status TEXT DEFAULT 'active',
        total_tokens BIGINT DEFAULT 0,
        session_count INTEGER DEFAULT 1,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `
  });

  if (threadsError) {
    console.log('⚠️  Direct SQL execution not available via anon key.');
    console.log('   Please run the SQL manually in Supabase Dashboard:\n');
    console.log('   1. Go to https://bxnunccjqnuobinhnyml.supabase.co');
    console.log('   2. Open SQL Editor');
    console.log('   3. Paste contents of: supabase-setup.sql');
    console.log('   4. Click Run\n');
    return false;
  }

  console.log('✅ Schema setup complete!\n');
  return true;
}

setupSchema().catch(console.error);
