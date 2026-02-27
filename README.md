# Agent Control Plane — Hackathon Demo

This is the full demo for the hackathon: an **autonomous coding agent** that researches security vulnerabilities before writing code, running under the **Agent Control Plane** (Pulse + Watchdog).

## System Overview

```
┌─────────────────────────────┐
│   Judge / User (browser)   │
│   Dashboard + Approval UI  │
└───────────┬─────────────────┘
            │
    ┌───────┴───────┐
    ▼               ▼
┌──────────┐  ┌──────────┐
│  Pulse   │  │ Watchdog │
│ :4020    │  │  :3000  │
│ Scoped   │  │ Firewall │
│ Access   │  │ + Alerts │
└─────┬────┘  └─────┬────┘
      │              │
      │ request     │ monitor
      │ grants      │ agent
      ▼              ▼
┌─────────────────────────────────┐
│      Hackathon Agent (Mastra)    │
│  • Tavily: research security    │
│  • Pulse: request approval     │
│  • Writes secure code          │
└─────────────────────────────────┘
```

## Quick Start (All-in-One)

### 1. Start Pulse (Portal + Dashboard)

```bash
cd pulse/local-portal
cp .env.example .env
# Edit .env: set LOCAL_PORTAL_SHARED_SECRET

npm install
npm run build
npm start   # Runs on http://0.0.0.0:4020
```

Open **http://localhost:4020/dashboard** — you should see:
- Agent Activity (Watchdog)
- Audit Log
- Scoped Access (grants)

### 2. Start Watchdog (Firewall)

```bash
cd watchdog
cargo xtask build-ebpf   # Build eBPF (requires root)
cargo build --release
sudo ./target/release/watchdog   # Runs on :3000
```

Or for development (no eBPF):
```bash
cargo run
```

### 3. Start the Agent (Chat UI)

```bash
cd agent
cp .env.example .env
# Edit .env:
#   GROQ_API_KEY=your_groq_key   (or OPENAI_API_KEY)
#   TAVILY_API_KEY=your_tavily_key
#   PULSE_BASE_URL=http://localhost:4020

npm install
npm run build
npm run start:ui   # Runs on http://0.0.0.0:4021
```

Open **http://localhost:4021** — the chat UI.

---

## Demo Flow (3 minutes)

1. **Show Dashboard** (0:00–0:30)  
   Open http://localhost:4020/dashboard — "This is our Agent Control Plane."

2. **Start Agent** (0:30–1:00)  
   In the agent UI (http://localhost:4021), enter a goal:
   ```
   Write a secure authentication module in JavaScript. Research common vulnerabilities first.
   ```
   Click Send. The agent requests Scoped Access — approve it in the dashboard.

3. **Watch Research** (1:00–2:00)  
   The agent uses Tavily to search for:
   - Common auth vulnerabilities (OWASP)
   - Secure password handling best practices
   - Node.js security advisories

   The right panel shows each `tavily_search` call and result.

4. **Agent Writes Code** (2:00–2:30)  
   After research, the agent writes secure code citing the sources it found.

5. **Audit Trail** (2:30–3:00)  
   Switch to the dashboard Audit Log — shows the Tavily searches and Scoped Access grant.

---

## Environment Variables

### Pulse (`pulse/local-portal/.env`)

| Variable | Description |
|----------|-------------|
| `PORT` | Portal port (default: 4020) |
| `LOCAL_PORTAL_SHARED_SECRET` | **Required.** Secret for HMAC auth |
| `PUBLIC_BASE_URL` | For remote access (e.g. `http://YOUR_IP:4020`) |

### Agent (`agent/.env`)

| Variable | Description |
|----------|-------------|
| `GROQ_API_KEY` | Groq API key (or use OpenAI) |
| `OPENAI_API_KEY` | OpenAI API key (fallback) |
| `GROQ_MODEL` | Groq model (default: `groq/llama-3.1-8b-instant`) |
| `TAVILY_API_KEY` | Tavily API key for web search |
| `PULSE_BASE_URL` | Portal URL (default: `http://localhost:4020`) |
| `AGENT_UI_PORT` | Agent UI port (default: 4021) |

### Watchdog

No env vars needed for basic run. For production, see `watchdog/README.md`.

---

## Troubleshooting

- **Agent can't reach Pulse:** Ensure `PULSE_BASE_URL` matches the portal's address.
- **Approval URL doesn't work:** Set `PUBLIC_BASE_URL` on the portal server to the address users will use.
- **Groq rate limits:** Use the default `groq/llama-3.1-8b-instant` model or switch to OpenAI.
- **Watchdog eBPF fails:** Run with `cargo run` (no eBPF, logs only).

---

## What This Demo Shows

| Criterion | How It's Met |
|-----------|---------------|
| **Autonomy** | Agent researches + writes code without manual steps after approval |
| **Idea** | Security-first coding — grounds agent in real-time vulnerability research |
| **Technical** | Mastra + Pulse + Watchdog + Tavily all working together |
| **Tool Use** | Tavily (sponsor), Pulse (our stack), Render (hosting) |
| **Presentation** | Single dashboard shows grant, research, audit — 3-minute demo |

---

## Optional: Deploy on Render

1. **Pulse:** Deploy `pulse/local-portal` on Render (Node.js service). Set `LOCAL_PORTAL_SHARED_SECRET` and `PUBLIC_BASE_URL`.
2. **Watchdog:** Not deployable (requires eBPF) — run locally.
3. **Agent:** Deploy `agent/` on Render. Set env vars in Render dashboard.

Then judges can access from their machines without local setup.
