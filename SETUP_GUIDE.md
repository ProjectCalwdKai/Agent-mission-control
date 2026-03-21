# Session Chaining Setup Guide

## Overview

This enables **agent model switching** while preserving conversation continuity. Users can swap between Qwen, Gemini, Claude, etc. mid-conversation without losing context.

---

## Step 1: Database Setup (Required)

### Run SQL in Supabase Dashboard

1. Go to: **https://bxnunccjqnuobinhnyml.supabase.co**
2. Click **SQL Editor** (left sidebar)
3. Paste and run the contents of `supabase-setup.sql`:

```bash
# Or view the file
cat supabase-setup.sql
```

**What this creates:**
- `conversation_threads` - Persistent conversation containers
- `session_chain` - Audit trail of all session switches
- Test thread with ID `00000000-0000-0000-0000-000000000001`

---

## Step 2: Environment Variables

### Copy and Configure `.env.local`

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```bash
# Get this from OpenClaw Gateway config
OPENCLAW_URL=http://localhost:8080
OPENCLAW_TOKEN=your-gateway-token-here

# Get from Supabase Dashboard → Project Settings → API → service_role key
SUPABASE_SERVICE_KEY=eyJhbGc...your-full-service-key
```

---

## Step 3: OpenClaw Gateway Configuration

Your OpenClaw config already has the models. Verify they're available:

```bash
openclaw config.get | grep -A 5 "models"
```

Required models (aliases from your config):
- `qwen` (Qwen 3.5 Plus) ✅
- `gemini-flash` (Gemini 2.5 Flash) ✅
- `gemini-pro` (Gemini 2.5 Pro) ✅
- `sonnet` (Claude Sonnet 4) ✅
- `opus` (Claude Opus 4.6) ✅
- `minimax` (MiniMax M2.5) ✅

---

## Step 4: Test the Flow

### Option A: Use the AgentSwitcher Component

Add to your dashboard (e.g., in `AgentsCenter.tsx` or a new modal):

```tsx
import AgentSwitcher from '@/components/agents/AgentSwitcher';

// In your component
<AgentSwitcher
  threadId="00000000-0000-0000-0000-000000000001"
  currentModel="qwen"
  onSwitchComplete={(result) => {
    console.log('Switch complete:', result);
    // Refresh your UI state
  }}
/>
```

### Option B: Manual API Test

```bash
# 1. Spawn initial session
curl -X POST http://localhost:3000/api/sessions/spawn \
  -H "Content-Type: application/json" \
  -d '{"model": "qwen", "task": "Test conversation"}'

# Response: { "sessionKey": "xxx", "model": "qwen" }

# 2. Switch model
curl -X POST http://localhost:3000/api/session/switch \
  -H "Content-Type: application/json" \
  -d '{
    "threadId": "00000000-0000-0000-0000-000000000001",
    "newModel": "gemini-flash",
    "reason": "test_switch"
  }'

# Response: { "success": true, "newSessionKey": "yyy", ... }

# 3. Verify continuity - send message to new session
curl -X POST http://localhost:3000/api/sessions/send \
  -H "Content-Type: application/json" \
  -d '{
    "sessionKey": "yyy",
    "message": "What were we talking about?"
  }'
```

---

## Step 5: Integration Points

### Where to Add in Your Dashboard

1. **Overview Page** (`/`) - Show active threads with current model
2. **Agents Center** (`/agents`) - Add AgentSwitcher component
3. **Tasks Center** (`/tasks`) - Allow per-task model selection
4. **Activity Center** (`/activity`) - Show session switch history

### Example: Update AgentsCenter.tsx

```tsx
// Add AgentSwitcher import
import AgentSwitcher from '@/components/agents/AgentSwitcher';

// In your agent card, add switch button
<div className="agent-card">
  <h3>{agent.name}</h3>
  <p>Model: {agent.model}</p>
  
  {/* Show switcher when agent is clicked/selected */}
  {selectedAgent && (
    <AgentSwitcher
      threadId={selectedAgent.thread_id}
      currentModel={selectedAgent.model}
      onSwitchComplete={() => refetchAgents()}
    />
  )}
</div>
```

---

## Architecture Flow

```
User clicks "Switch to Gemini"
         ↓
Dashboard calls switchAgentModel(threadId, "gemini-flash")
         ↓
1. Fetch last 15 messages from current session
2. Spawn new session with Gemini + context injection
3. Record session in session_chain table
4. Update conversation_threads.current_session_key
         ↓
New session responds, continuing the conversation
```

---

## Troubleshooting

### Session Spawn Fails
- Check `OPENCLAW_URL` and `OPENCLAW_TOKEN` are correct
- Verify OpenClaw Gateway is running: `openclaw gateway status`
- Check model alias exists in your config

### Database Errors
- Ensure Supabase tables are created (run SQL from Step 1)
- Check `SUPABASE_SERVICE_KEY` has admin permissions
- Verify RLS policies allow inserts (or disable RLS for testing)

### Context Not Preserved
- Check `session_chain.context_snapshot` is being populated
- Verify history API is returning messages
- Ensure `initialContext` is being passed to spawn

---

## Next Steps

1. ✅ Run database setup SQL
2. ✅ Configure environment variables
3. ✅ Test with AgentSwitcher component
4. 🔄 Add to your dashboard UI
5. 🔄 Implement auto-switch trigger (token threshold monitoring)

Need help with a specific step? Let me know!
