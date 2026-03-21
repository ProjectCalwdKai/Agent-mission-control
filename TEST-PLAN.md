# Agent Mission Control — Integration Test Plan

## 🎯 Goal
Ensure dashboard works **seamlessly with real backend** (OpenClaw Gateway + Supabase) with **zero mock data**.

---

## ✅ Backend Systems

### 1. OpenClaw Gateway (Local)
- **URL:** `http://localhost:63624`
- **Token:** `7njZB6xWp6bXY77xw86GX5yvkEX57gOm`
- **Key APIs:**
  - `GET /api/sessions/status?sessionKey=<key>` — Token usage
  - `POST /api/sessions/spawn` — Create new session
  - `GET /api/sessions/history?sessionKey=<key>` — Message history
  - `GET /api/sessions/list` — List active sessions

### 2. Supabase Database
- **Project:** `bxnunccjqnuobinhnyml`
- **Tables:**
  - `agents` — Agent definitions
  - `tasks` — Task management
  - `approvals` — Approval workflow
  - `outputs` — Generated outputs
  - `activity_events` — Activity log
  - `conversation_threads` — Conversation threads
  - `session_chain` — Session history per thread

---

## 🧪 Test Scenarios

### TEST 1: Agent List (Real-time)
**Route:** `/agents`  
**Component:** `AgentsCenter.tsx`

**Steps:**
1. Open `/agents` page
2. Verify agents load from Supabase `agents` table
3. Check search/filter functionality
4. Refresh button fetches latest data

**Expected:**
- ✅ Shows all agents from database
- ✅ No hardcoded/mock agents
- ✅ Search filters by name/model/role
- ✅ Status filter (online/offline/busy) works
- ✅ Refresh updates data

**Queries:**
```sql
SELECT * FROM agents ORDER BY name;
```

---

### TEST 2: Overview Dashboard (Live Stats)
**Route:** `/` (Overview)  
**Component:** `Overview.tsx`

**Steps:**
1. Open home page
2. Verify all 6 stat cards show real counts
3. Click refresh button
4. Check counts match database

**Expected:**
- ✅ Total Tasks = `COUNT(tasks)`
- ✅ Pending Approvals = `COUNT(approvals WHERE status='pending')`
- ✅ Active Agents = `COUNT(agents WHERE availability='online')`
- ✅ Outputs Generated = `COUNT(outputs)`
- ✅ Office Activity = `COUNT(activity_events)`
- ✅ Delegation Flows = (implement or show 0)

**Verify with SQL:**
```sql
SELECT COUNT(*) FROM tasks;
SELECT COUNT(*) FROM approvals WHERE status='pending';
SELECT COUNT(*) FROM agents WHERE availability='online';
SELECT COUNT(*) FROM outputs;
SELECT COUNT(*) FROM activity_events;
```

---

### TEST 3: Session Switching (OpenClaw Integration)
**Route:** `/threads`  
**Component:** `ThreadList.tsx` + `AgentSwitcher.tsx`

**Steps:**
1. Open `/threads` page
2. Select a thread → Click "Switch Model"
3. Choose different model (e.g., `qwen` → `gemini-pro`)
4. Select reason → Click "Switch to ..."
5. Verify new session created in OpenClaw
6. Check `session_chain` table updated
7. Verify `conversation_threads.current_session_key` updated

**Expected:**
- ✅ Modal shows all 6 model options
- ✅ Current model disabled in dropdown
- ✅ API call to `/api/session/switch` succeeds
- ✅ OpenClaw session created with new model
- ✅ Database updated:
  - New row in `session_chain`
  - `conversation_threads` updated with new session key
- ✅ Success message with new session key

**API Flow:**
```
Frontend → POST /api/session/switch
  → session-chain.ts: switchAgentModel()
    → OpenClaw: POST /api/sessions/spawn
    → Supabase: INSERT session_chain
    → Supabase: UPDATE conversation_threads
```

**Verify:**
```sql
-- Check thread
SELECT * FROM conversation_threads WHERE id = '<thread-id>';

-- Check session chain
SELECT * FROM session_chain WHERE thread_id = '<thread-id>' ORDER BY created_at DESC;
```

---

### TEST 4: Thread List (Real Data)
**Route:** `/threads`  
**Component:** `ThreadList.tsx`

**Steps:**
1. Open `/threads`
2. Verify threads load from `conversation_threads`
3. Each thread shows:
   - Title
   - Current model
   - Session count
   - Recent switches (from `session_chain`)
   - Status badge
4. Refresh button works

**Expected:**
- ✅ All threads visible
- ✅ Session count matches `COUNT(session_chain WHERE thread_id=...)`
- ✅ Recent switches shown (last 3)
- ✅ Status badges correct (active/paused/archived)
- ✅ No mock data

**Verify:**
```sql
SELECT 
  ct.id,
  ct.title,
  ct.current_model,
  COUNT(sc.id) as session_count
FROM conversation_threads ct
LEFT JOIN session_chain sc ON ct.id = sc.thread_id
GROUP BY ct.id
ORDER BY ct.updated_at DESC;
```

---

### TEST 5: Auto-Switch Monitor
**Route:** `/api/auto-switch/run`

**Steps:**
1. Call `POST /api/auto-switch/run` manually
2. Or trigger from UI (if button exists)
3. Monitor checks all active threads
4. Auto-switches if over threshold

**Expected:**
- ✅ Endpoint responds
- ✅ Checks all `conversation_threads` with status='active'
- ✅ Gets token usage from OpenClaw for each session
- ✅ Switches model if over 100k tokens (critical)
- ✅ Writes to `session_chain` on switch
- ✅ Returns: `{ success, checked, switched }`

**Test Command:**
```bash
curl -X POST http://localhost:3000/api/auto-switch/run \
  -H "Content-Type: application/json" \
  -d '{"highThreshold": 80000, "criticalThreshold": 100000}'
```

---

### TEST 6: Tasks Center
**Route:** `/tasks`  
**Component:** `TasksCenter.tsx`

**Steps:**
1. Open `/tasks`
2. Verify tasks load from `tasks` table
3. Check filtering by status/priority
4. Task details show:
   - Title, description
   - Assigned agent
   - Status, priority
   - Timestamps

**Expected:**
- ✅ All tasks visible
- ✅ Filter by status (pending/in-progress/completed)
- ✅ Filter by priority (low/medium/high/critical)
- ✅ Assigned agent name shown (join with `agents` table)
- ✅ No mock data

**Verify:**
```sql
SELECT 
  t.*,
  a.name as assigned_agent_name
FROM tasks t
LEFT JOIN agents a ON t.assigned_agent_id = a.id
ORDER BY t.created_at DESC;
```

---

### TEST 7: Approvals Center
**Route:** `/approvals`  
**Component:** `ApprovalsCenter.tsx`

**Steps:**
1. Open `/approvals`
2. Verify approvals load
3. Filter by status (pending/approved/rejected)
4. Approve/reject actions work
5. Updates database

**Expected:**
- ✅ Shows all approvals
- ✅ Status filter works
- ✅ Approve button updates status + resolved_at
- ✅ Reject button updates status
- ✅ Task linked correctly

---

### TEST 8: Outputs Center
**Route:** `/outputs`  
**Component:** `OutputsCenter.tsx`

**Steps:**
1. Open `/outputs`
2. Verify outputs load
3. Click an output to see details
4. Download file_url if present

**Expected:**
- ✅ All outputs visible
- ✅ Links to generating task and agent
- ✅ File downloads work
- ✅ Created_at timestamps correct

---

### TEST 9: Activity Center
**Route:** `/activity`  
**Component:** `ActivityCenter.tsx`

**Steps:**
1. Open `/activity`
2. Verify activity events load
3. Filter by event_type
4. Timeline view works

**Expected:**
- ✅ Shows recent activity events
- ✅ Filter by type (task_created, session_switch, approval_resolved, etc.)
- ✅ Timestamps formatted correctly
- ✅ No mock data

**Verify:**
```sql
SELECT * FROM activity_events ORDER BY created_at DESC LIMIT 20;
```

---

## 🔧 Database Seed Queries

If tables are empty, run these to populate test data:

```sql
-- Insert test agents
INSERT INTO agents (id, name, model, role, availability, current_task) VALUES
  ('agent-echo', 'Echo', 'qwen', 'Assistant', 'online', NULL),
  ('agent-helper', 'Helper', 'gemini-flash', 'Support', 'online', 'Task-123'),
  ('agent-analyst', 'Analyst', 'sonnet', 'Analysis', 'busy', 'Task-456'),
  ('agent-writer', 'Writer', 'opus', 'Content', 'offline', NULL);

-- Insert test thread
INSERT INTO conversation_threads (id, title, user_id, current_session_key, current_model, session_count, status)
VALUES 
  ('thread-1', 'My Conversation', 'user-ken', 'session-abc123', 'qwen', 1, 'active');

-- Insert test session chain
INSERT INTO session_chain (thread_id, session_key, model, reason, start_tokens)
VALUES
  ('thread-1', 'session-abc123', 'qwen', 'initial', 0);

-- Insert test tasks
INSERT INTO tasks (id, title, description, category, priority, status) VALUES
  ('task-1', 'Test Task 1', 'Description 1', 'development', 'high', 'pending'),
  ('task-2', 'Test Task 2', 'Description 2', 'research', 'medium', 'in-progress'),
  ('task-3', 'Test Task 3', 'Description 3', 'content', 'low', 'completed');
```

---

## 🐛 Known Limitations

### Current Gaps:
1. **Delegation Flows** — Not implemented yet (Overview shows 0)
2. **Session Status API** — May need to implement on Gateway
3. **Real-time Updates** — No WebSocket/polling yet (manual refresh only)
4. **Create New Thread** — UI doesn't expose thread creation yet

### Workarounds:
- Use Supabase Dashboard to insert test data
- Use OpenClaw CLI to create sessions manually
- Manual refresh buttons work for now

---

## ✅ Acceptance Criteria

**All tests pass when:**
- [ ] No mock data anywhere
- [ ] All components fetch from Supabase
- [ ] Session switching works end-to-end
- [ ] All counters match database queries
- [ ] Error states show proper messages
- [ ] Loading states work correctly
- [ ] No console errors on successful operations

---

## 📊 Monitoring Checklist

### Before Deployment:
- [ ] Supabase tables created and populated
- [ ] OpenClaw Gateway running and accessible
- [ ] Environment variables set in Vercel
- [ ] RLS policies configured (if needed)

### After Deployment:
- [ ] Load `/agents` → See real agents
- [ ] Load `/` → See real counts
- [ ] Open thread → Switch model → Verify in DB
- [ ] Check Vercel logs for errors
- [ ] Test on mobile (responsive)

---

**Last Updated:** 2026-03-21  
**Status:** In Progress
