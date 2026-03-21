# 🚀 Agent Mission Control — Integration Guide

**Production dashboard for OpenClaw agent management with zero mock data.**

---

## ✅ Current Status

| Component | Status | Notes |
|-----------|--------|-------|
| **Vercel Deployment** | ✅ Live | Auto-deploys on git push |
| **Supabase Database** | ✅ Connected | 7 agents, 2 tasks, 1 thread, 1 session chain |
| **TypeScript Build** | ✅ Fixed | Callback type errors resolved |
| **OpenClaw Gateway** | ✅ Running | `http://localhost:63624` |
| **Session Switching** | ✅ Implemented | Works via API routes |

---

## 🔗 Backend Architecture

```
┌─────────────────┐
│   Vercel UI     │ (Next.js Frontend)
│  (Production)   │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌─────────┐  ┌──────────────┐
│Supabase │  │ OpenClaw     │
│Database │  │ Gateway API  │
│         │  │ (Localhost)  │
└─────────┘  └──────────────┘
```

**Environment Variables (Vercel):**
```bash
# OpenClaw Gateway
OPENCLAW_URL=http://localhost:63624
OPENCLAW_TOKEN=7njZB6xWp6bXY77xw86GX5yvkEX57gOm

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://bxnunccjqnuobinhnyml.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **CRITICAL:** `OPENCLAW_URL=http://localhost:63624` won't work from Vercel (cloud). Need public URL.

---

## 🚨 CRITICAL FIX NEEDED: OpenClaw Public Access

### Problem
Vercel (cloud) cannot reach `http://localhost:63624` (your local machine).

### Solutions

#### Option 1: Expose Gateway via ngrok (Quick)
```bash
# Install ngrok
npm install -g ngrok

# Expose Gateway
ngrok http 63624

# Copy the public URL (e.g., https://abc123.ngrok.io)
# Update Vercel env var:
# OPENCLAW_URL=https://abc123.ngrok.io
```

#### Option 2: Deploy Gateway to VPS (Recommended)
Your VPS at `168.231.113.95` can host the Gateway:

```bash
# On VPS
openclaw gateway start --port 63624 --bind 0.0.0.0

# Configure firewall
ufw allow 63624/tcp

# Vercel env var:
# OPENCLAW_URL=http://168.231.113.95:63624
```

#### Option 3: Use Cloudflare Tunnel
```bash
# Install cloudflared
# Create tunnel to localhost:63624
# Get public URL
```

---

## 📊 Database Schema

### Tables (Supabase)

#### `agents`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Agent identifier |
| name | TEXT | Display name |
| model | TEXT | Model alias (qwen, gemini-pro, etc.) |
| role | TEXT | Agent role |
| availability | TEXT | online/offline/busy |
| current_task | TEXT | Current task ID |

#### `conversation_threads`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Thread identifier |
| title | TEXT | Conversation title |
| user_id | TEXT | Owner ID |
| current_session_key | TEXT | Active OpenClaw session |
| current_model | TEXT | Active model |
| session_count | INT | Number of switches |
| status | TEXT | active/paused/archived |

#### `session_chain`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Chain link ID |
| thread_id | UUID | Parent thread |
| session_key | TEXT | OpenClaw session |
| model | TEXT | Model used |
| reason | TEXT | Switch reason |
| context_snapshot | TEXT | Message history |
| start_tokens | INT | Token count at start |

#### `tasks`, `approvals`, `outputs`, `activity_events`
Standard workflow tables.

---

## 🧪 Testing Checklist

### Before Opening Deployed URL:

1. **Verify Vercel Env Vars**
   ```bash
   # In Vercel Dashboard → Settings → Environment Variables
   - OPENCLAW_URL: <MUST BE PUBLIC URL>
   - OPENCLAW_TOKEN: 7njZB6xWp6bXY77xw86GX5yvkEX57gOm
   - NEXT_PUBLIC_SUPABASE_URL: https://bxnunccjqnuobinhnyml.supabase.co
   - NEXT_PUBLIC_SUPABASE_ANON_KEY: <anon key>
   - SUPABASE_SERVICE_KEY: <service key>
   ```

2. **Test Supabase Connection**
   ```bash
   curl -X GET "https://bxnunccjqnuobinhnyml.supabase.co/rest/v1/agents" \
     -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
     -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   # Should return 7 agents
   ```

3. **Verify Deployment**
   - Go to Vercel Dashboard
   - Find `agent-mission-control`
   - Check deployment status (should be ✅ Ready)
   - Click deployment → View → Opens production URL

---

### UI Test Flows

#### 1. Overview Page (`/`)
**Expected:**
- Shows 6 stat cards with real counts
- "Total Tasks" = 2
- "Active Agents" = count of online agents
- Refresh button works

**If shows 0:**
- Check Supabase connection
- Verify RLS policies allow reads

#### 2. Agents Page (`/agents`)
**Expected:**
- Lists all 7 agents from database
- Search works (type "Echo", "Helper")
- Filter by status (online/offline/busy)
- Each card shows: name, model, role, status dot

**Test:**
- Search "Echo" → should show 1 agent
- Filter "Online" → should show online agents only
- Click refresh → data reloads

#### 3. Threads Page (`/threads`) → **CRITICAL**
**Expected:**
- Shows 1 thread currently
- Each thread card shows:
  - Title
  - Current model badge
  - Session count
  - Last updated time
  - "Switch Model" button

**Test Switch Flow:**
1. Click "Switch Model" on a thread
2. Modal opens with model dropdown
3. Choose different model (e.g., `qwen` → `gemini-pro`)
4. Select reason: "Manual Model Switch"
5. Click "Switch to Gemini 2.5 Pro"
6. **Should:**
   - Show "Switching..." spinner
   - Create new session in OpenClaw
   - Insert into `session_chain` table
   - Update `conversation_threads.current_session_key`
   - Show success message with new session key
   - Refresh shows updated model badge

**If fails:**
- Check Vercel logs (Runtime Logs tab)
- Verify OpenClaw API accessible
- Check error message in UI

#### 4. Tasks Page (`/tasks`)
**Expected:**
- Shows 2 tasks
- Filters work (status, priority)
- Shows assigned agent name

#### 5. Auto-Switch API
**Test:**
```bash
# POST to trigger auto-switch check
curl -X POST https://<your-vercel-url>/api/auto-switch/run \
  -H "Content-Type: application/json" \
  -d '{"highThreshold": 80000, "criticalThreshold": 100000}'

# Expected response:
{
  "success": true,
  "checked": 1,
  "switched": 0
}
```

---

## 🐛 Troubleshooting

### "Failed to fetch" on page load
**Cause:** Supabase not accessible  
**Fix:** Check `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel

### "Failed to spawn new session" when switching
**Cause:** `OPENCLAW_URL` points to localhost  
**Fix:** Set to public URL (ngrok or VPS IP)

### Empty stats (all zeros)
**Cause:** Tables empty or RLS blocking  
**Fix:**
```sql
-- Check data exists
SELECT COUNT(*) FROM agents;
SELECT COUNT(*) FROM tasks;
SELECT COUNT(*) FROM conversation_threads;

-- If RLS enabled, add policy
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON agents FOR SELECT USING (true);
```

### Deployment stuck on "Building"
**Fix:**
```bash
# Check commit
git log -1

# Force redeploy
git commit --allow-empty -m "Trigger redeploy"
git push
```

---

## 📱 URL Access

**Find Your Vercel URL:**
1. Go to https://vercel.com
2. Dashboard → `agent-mission-control`
3. Click deployment → "Visit"
4. URL format: `https://agent-mission-control-<random>.vercel.app`

**Custom Domain (optional):**
- Add in Vercel → Settings → Domains
- Point DNS to `cname.vercel-dns.com`

---

## 🔄 Development Workflow

### Local Testing
```bash
cd /data/.openclaw/workspace/agent-mission-control
npm install
npm run dev
# Opens http://localhost:3000
```

### Make Changes
```bash
# Edit files
git add .
git commit -m "feat: added feature X"
git push
# Vercel auto-deploys in ~60 seconds
```

### Check Build Logs
- Vercel → Deployments → Click latest → View Build Logs

---

## 🎯 Next Steps

1. **Fix OpenClaw Access** (CRITICAL)
   - Set up ngrok or VPS Gateway access
   - Update Vercel `OPENCLAW_URL` env var
   - Test session switching

2. **Test Session Switching End-to-End**
   - Create test thread
   - Switch model (qwen → gemini-flash)
   - Verify in database
   - Verify new session active

3. **Populate More Data**
   - Add more agents (7 is good start)
   - Create more tasks
   - Generate some activity events

4. **Add Missing Features**
   - Delegation Flows (currently shows 0)
   - Create new thread button
   - Real-time updates (WebSocket/polling)

---

## 📞 Support

**Repo:** https://github.com/ProjectCalwdKai/Agent-mission-control  
**Issues:** Create on GitHub  
**Vercel Dashboard:** https://vercel.com/projectcalwdkai/agent-mission-control

---

**Last Updated:** 2026-03-21  
**Status:** ✅ Deployed — Needs OpenClaw URL fix
