# CollabEdit — Real-Time Collaborative Text Editor

A production-grade Google Docs clone built with **Yjs CRDTs**, **Tiptap**, **WebSockets (Hocuspocus)**, **Redis**, **PostgreSQL**, and **React**.

---

## ✨ Features

| Feature | Details |
|---|---|
| **CRDT Sync** | Conflict-free simultaneous editing via Yjs — no locking, no conflicts |
| **Live Cursors** | See every collaborator's cursor and selection in real-time with their name |
| **User Presence** | Avatar stack showing who is online in the document |
| **Offline Mode** | Edit offline — changes persist to IndexedDB and auto-sync on reconnect |
| **Rich Text** | Bold, Italic, Underline, Strike, Headings (H1-H3), Lists, Code Blocks, Links, Highlights |
| **Auth** | JWT-based register/login with persistent sessions |
| **Document Dashboard** | Create, rename, delete documents |
| **Sharing** | Generate shareable links; invite collaborators by email with editor/viewer roles |
| **Scalable** | Redis pub/sub relay means multiple server instances can be run behind a load balancer |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│                  Browser Client                  │
│  React + Tiptap + Yjs (CRDT) + y-indexeddb      │
│  @hocuspocus/provider (WebSocket + Awareness)   │
└───────────┬─────────────────────┬───────────────┘
            │  REST API           │  WebSocket
            ▼                     ▼
┌───────────────────┐   ┌──────────────────────────┐
│   Express API     │   │  Hocuspocus WS Server    │
│  (Auth, Docs)     │   │  (CRDT sync, Awareness)  │
└────────┬──────────┘   └──────────┬───────────────┘
         │                         │
         ▼                         ▼
┌─────────────────┐       ┌────────────────────────┐
│   PostgreSQL    │       │         Redis           │
│ Users, Docs,    │       │  CRDT state cache       │
│ Permissions     │       │  Pub/Sub relay          │
└─────────────────┘       └────────────────────────┘
```

### How CRDT Sync Works

1. Each document is a `Y.Doc` — a distributed data structure.
2. Every keystroke generates a **binary Yjs update** (a small diff).
3. The client sends this update to the Hocuspocus server over WebSocket.
4. The server stores the update in **Redis** and broadcasts it to all other connected clients.
5. Yjs **automatically merges** all updates — order doesn't matter, there are no conflicts.
6. On first connection, the client receives the full document state (a merge of all updates).
7. **Offline**: `y-indexeddb` caches the full state locally. When the user reconnects, Yjs computes the diff and only sends what the server missed.

---

## 🚀 Quick Start

### Prerequisites

- [Node.js 20+](https://nodejs.org/)
- [Docker + Docker Compose](https://docs.docker.com/get-docker/)

### Option A: Docker (Recommended for Production)

```bash
# 1. Clone and enter the project
git clone <your-repo-url>
cd collab-editor

# 2. Create environment file
cp .env.example .env
# Edit .env and set a strong JWT_SECRET

# 3. Start the entire stack
docker compose up --build

# 4. Open the app
open http://localhost
```

### Option B: Local Development

```bash
# 1. Start dependencies
docker compose up postgres redis -d

# 2. Install all packages
npm install

# 3. Set up environment
cp .env.example .env
# Edit .env — use localhost for DB_HOST and REDIS_HOST

# 4. Run server + client concurrently
npm run dev
```

- **Client** → http://localhost:5173
- **API** → http://localhost:3001
- **WebSocket** → ws://localhost:1234
- **Health Check** → http://localhost:3001/health

---

## 📁 Project Structure

```
collab-editor/
├── packages/
│   ├── client/                     # React + TypeScript + Vite
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── Auth/           # Login & Register forms
│   │   │   │   ├── Dashboard/      # Document list & cards
│   │   │   │   └── Editor/         # Toolbar, Cursors, Presence, CollabEditor
│   │   │   ├── hooks/
│   │   │   │   ├── useCollabEditor.ts   # Yjs + Tiptap + Hocuspocus wiring
│   │   │   │   └── useAwareness.ts      # Cursor/presence state
│   │   │   ├── pages/              # Auth, Dashboard, Editor pages
│   │   │   ├── store/              # Zustand auth state
│   │   │   └── lib/                # Axios API client
│   │   ├── Dockerfile
│   │   └── nginx.conf
│   │
│   └── server/                     # Node.js + TypeScript
│       ├── src/
│       │   ├── routes/             # auth.ts, documents.ts
│       │   ├── middleware/         # authenticate.ts (JWT)
│       │   ├── services/
│       │   │   └── RedisDocStore.ts    # CRDT state persistence
│       │   ├── db/
│       │   │   ├── postgres.ts
│       │   │   └── migrations/         # SQL schema
│       │   ├── wsServer.ts             # Hocuspocus WS server
│       │   └── app.ts                  # Express entrypoint
│       └── Dockerfile
│
├── docker-compose.yml
├── .env.example
└── package.json
```

---

## 🔌 API Reference

### Auth
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Create account |
| `POST` | `/api/auth/login` | Login, returns JWT |
| `GET` | `/api/auth/me` | Get current user |

### Documents
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/documents` | List user's documents |
| `POST` | `/api/documents` | Create new document |
| `GET` | `/api/documents/:id` | Get document by ID |
| `PATCH` | `/api/documents/:id/title` | Update title |
| `DELETE` | `/api/documents/:id` | Delete document |
| `GET` | `/api/documents/share/:token` | Get document by share token |
| `POST` | `/api/documents/:id/members` | Add collaborator by email |
| `GET` | `/api/documents/:id/members` | List collaborators |

### WebSocket
Connect to `ws://localhost:1234` with query params:
- `room` = document ID
- `token` = JWT access token

---

## 🎯 Key Design Decisions

### Why Yjs over rolling our own CRDT/OT?
Yjs is the production CRDT library used by VS Code Live Share, Notion, and Linear. Building a correct OT or CRDT implementation from scratch is a months-long, PhD-level problem with many edge cases. Using Yjs is the correct engineering decision — the same one real companies make.

### Why Hocuspocus over raw y-websocket?
Hocuspocus is an official Yjs server framework that adds authentication hooks, database persistence hooks, and awareness management on top of y-websocket. It's production-ready and used by Tiptap Cloud.

### Why Redis for CRDT storage?
- **Speed**: Yjs updates are small binary diffs; Redis keeps them in memory for microsecond access.
- **Scalability**: Redis Pub/Sub allows multiple server instances to relay updates to all clients, enabling horizontal scaling.
- **TTL-free persistence**: We store the merged state periodically so Redis doesn't need to be a source of truth — it's a fast cache.

### Offline-first with y-indexeddb
Every client also persists the full Yjs state to **IndexedDB**. This means:
1. Users can edit with no internet connection.
2. On reconnect, Yjs computes the diff automatically and sends only new changes.
3. Page reloads are instant — no waiting for the server to send the full document.

---

## 🔒 Security

- Passwords hashed with **bcryptjs** (10 rounds)
- JWT tokens validated on **every WebSocket upgrade handshake**
- CORS restricted to `CLIENT_URL` environment variable
- SQL uses **parameterized queries** throughout (no SQL injection)
- Document access validated server-side before serving CRDT state

---

## 📊 Tech Stack

| Layer | Technology |
|---|---|
| Frontend Framework | React 18 + TypeScript + Vite |
| Rich Text Editor | Tiptap v2 (ProseMirror-based) |
| CRDT Engine | Yjs |
| WS Provider | @hocuspocus/provider |
| Offline Persistence | y-indexeddb |
| State Management | Zustand |
| HTTP Client | Axios |
| Backend Framework | Express + TypeScript |
| WS Server | Hocuspocus |
| Database | PostgreSQL 16 |
| Cache / Pub-Sub | Redis 7 |
| Container | Docker + Docker Compose |
| Reverse Proxy | Nginx |
