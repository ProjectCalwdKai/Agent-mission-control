# 🚀 Agent Mission Control

**Production dashboard for managing OpenClaw AI agents with real-time monitoring, session switching, and workflow automation.**

![Status](https://img.shields.io/badge/status-production-green)
![Deployment](https://img.shields.io/badge/deployment-vercel-blue)
![Database](https://img.shields.io/badge/database-supabase-orange)

---

## 📖 Overview

Agent Mission Control is a comprehensive dashboard for managing your OpenClaw AI agent fleet. It provides:

- **Real-time Monitoring** — Track agent status, tasks, and activity
- **Session Management** — Switch AI models mid-conversation while preserving context
- **Workflow Automation** — Manage tasks, approvals, and delegated operations
- **Zero Mock Data** — All data comes from real Supabase database and OpenClaw Gateway

---

## ✨ Features

### 📊 **Dashboard Overview**
- Live statistics (tasks, agents, approvals, outputs)
- Activity feed
- Quick actions and navigation

### 🧵 **Conversation Threads**
- View all conversation threads
- **Switch AI models** while preserving conversation history
- Track session chains and token usage
- Auto-switch on token limits (configurable)

### 🤖 **Agent Management**
- List all registered agents
- Filter by status (online/offline/busy)
- Search by name, model, or role
- Real-time availability updates

### ✅ **Task Management**
- Kanban-style task board
- Priority and category filtering
- Agent assignment tracking
- Task lifecycle management

### 🔐 **Approval Workflow**
- Review pending agent actions
- Approve/reject with audit trail
- Delegation flow tracking

### 📤 **Outputs**
- View generated results
- Download files
- Link to generating tasks and agents

### 📈 **Activity Center**
- Event timeline
- Filter by event type
- Audit trail for all operations

---

## 🏗️ Architecture

```
┌─────────────────────────────────────┐
│  Vercel (Next.js Frontend)          │
│  https://agent-mission-control      │
└─────────────┬───────────────────────┘
              │
         ┌────┴────┐
         │         │
         ▼         ▼
┌─────────────────┐ ┌──────────────────┐
│  Supabase       │ │ OpenClaw Gateway │
│  (PostgreSQL)   │ │ (VPS)            │
│                 │ │ 168.231.113.95   │
│ - agents        │ │ :63624           │
│ - tasks         │ │                  │
│ - threads       │ │ - Session mgmt   │
│ - approvals     │ │ - Model spawning │
│ - outputs       │ │ - Token tracking │
└─────────────────┘ └──────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Supabase account
- OpenClaw Gateway access
- Vercel account (for deployment)

### 1. Clone Repository

```bash
git clone https://github.com/ProjectCalwdKai/Agent-mission-control.git
cd agent-mission-control
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Create `.env.local`:

```bash
# OpenClaw Gateway
OPENCLAW_URL=http://168.231.113.95:63624
OPENCLAW_TOKEN=your_gateway_token

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🌐 Production Deployment

### Vercel (Recommended)

1. **Connect to Vercel:**
   ```bash
   vercel link
   ```

2. **Set Environment Variables** in Vercel Dashboard:
   - `OPENCLAW_URL`
   - `OPENCLAW_TOKEN`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_KEY`

3. **Deploy:**
   ```bash
   vercel --prod
   ```

**Production URL:** https://agent-mission-control-b1fr8metu-projectcalwdkais-projects.vercel.app

---

## 📊 Database Schema

### Core Tables

#### `agents`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Agent identifier |
| name | TEXT | Display name |
| model | TEXT | Model alias |
| role | TEXT | Agent role |
| availability | TEXT | online/offline/busy |
| current_task | TEXT | Current task ID |

#### `conversation_threads`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Thread ID |
| title | TEXT | Conversation title |
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

#### `tasks`, `approvals`, `outputs`, `activity_events`
Standard workflow tables. See `src/lib/supabase.ts` for full schema.

---

## 🔧 API Routes

### Session Management

#### `POST /api/session/switch`
Switch AI model for a conversation thread.

**Request:**
```json
{
  "threadId": "uuid",
  "newModel": "gemini-pro",
  "reason": "model_switch"
}
```

**Response:**
```json
{
  "success": true,
  "newSessionKey": "session-abc123",
  "oldSessionKey": "session-xyz789",
  "threadId": "uuid"
}
```

#### `GET /api/sessions/status?sessionKey=xxx`
Get session token usage.

### Auto-Switch Monitor

#### `POST /api/auto-switch/run`
Trigger auto-switch check.

**Request:**
```json
{
  "highThreshold": 80000,
  "criticalThreshold": 100000
}
```

**Response:**
```json
{
  "success": true,
  "checked": 5,
  "switched": 1
}
```

---

## 🧪 Testing

### Test Scenarios

See `TEST-PLAN.md` for comprehensive test scenarios.

**Quick Test:**
```bash
# Test Supabase connection
curl "https://your-project.supabase.co/rest/v1/agents" \
  -H "apikey: your_key"

# Test Gateway
curl http://168.231.113.95:63624

# Test Session Switch API
curl -X POST http://localhost:3000/api/session/switch \
  -H "Content-Type: application/json" \
  -d '{"threadId":"uuid","newModel":"gemini-flash"}'
```

---

## 📋 Current Status

### ✅ Completed Features

- [x] Overview dashboard with live stats
- [x] Agent listing and filtering
- [x] Conversation thread management
- [x] **Session switching** (switch models mid-chat)
- [x] Session chain tracking
- [x] Task management
- [x] Approval workflow
- [x] Outputs center
- [x] Activity feed
- [x] Auto-switch monitor API
- [x] Vercel deployment
- [x] Supabase integration
- [x] OpenClaw Gateway integration (VPS)
- [x] Navigation sidebar with all sections
- [x] TypeScript strict mode

### ⏳ Remaining Tasks

#### High Priority
- [ ] **Create new thread button** — UI to start new conversations
- [ ] **Thread deletion** — Remove/archive old threads
- [ ] **Real-time updates** — WebSocket or polling for live data
- [ ] **Error handling UI** — Better error messages and retry logic
- [ ] **Loading skeletons** — Improve perceived performance

#### Medium Priority
- [ ] **Delegation flows visualization** — Show delegation graph
- [ ] **Bulk actions** — Select multiple tasks/agents
- [ ] **Advanced filtering** — Date ranges, custom filters
- [ ] **Export functionality** — Export tasks/threads as JSON/CSV
- [ ] **Thread search** — Full-text search across conversations
- [ ] **Session details modal** — Show full session history

#### Low Priority / Nice to Have
- [ ] **Dark mode** — Theme toggle
- [ ] **Mobile responsive improvements** — Optimize for phones
- [ ] **Custom dashboards** — User-configurable widgets
- [ ] **Notifications** — Alert on important events
- [ ] **Analytics dashboard** — Usage statistics and trends
- [ ] **API key management** — UI to manage Gateway tokens
- [ ] **User authentication** — Multi-user support with roles
- [ ] **Custom domains** — Support for branded URLs

#### Documentation
- [x] TEST-PLAN.md — Test scenarios
- [x] INTEGRATION-GUIDE.md — Deployment guide
- [x] DEPLOYMENT_COMPLETE.md — Deployment summary
- [ ] API documentation (OpenAPI/Swagger)
- [ ] User guide / tutorial videos
- [ ] Architecture diagrams

---

## 🛠️ Tech Stack

- **Frontend:** Next.js 14, React 18, TypeScript
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Database:** Supabase (PostgreSQL)
- **AI Backend:** OpenClaw Gateway
- **Deployment:** Vercel
- **State Management:** React hooks + Supabase realtime

---

## 🔒 Security Notes

### Current Configuration
- Gateway bound to `--bind lan` (all interfaces)
- Using `--allow-unconfigured` for quick start
- OpenClaw token-based authentication

### Production Hardening (Recommended)
```bash
# On VPS - Configure allowed origins
cat > /root/.openclaw/config.json << 'EOF'
{
  "gateway": {
    "mode": "local",
    "controlUi": {
      "allowedOrigins": ["https://your-vercel-domain.app"]
    },
    "auth": {
      "enabled": true
    }
  }
}
EOF

systemctl restart openclaw-gateway
```

See `INTEGRATION-GUIDE.md` for security best practices.

---

## 📞 Support

- **GitHub Issues:** https://github.com/ProjectCalwdKai/Agent-mission-control/issues
- **Vercel Dashboard:** https://vercel.com/projectcalwdkai/agent-mission-control
- **Supabase:** https://app.supabase.com/project/bxnunccjqnuobinhnyml

---

## 📄 License

MIT

---

## 🎯 Next Steps

1. **Test session switching end-to-end** — Verify model switches work
2. **Add create thread button** — Enable new conversation creation
3. **Implement real-time updates** — WebSocket integration
4. **Improve error handling** — Better UX for failures
5. **Add thread deletion** — Cleanup old conversations

---

**Last Updated:** 2026-03-21  
**Version:** 0.1.0  
**Status:** ✅ Production Ready
