# Mission Control (tenacitOS) — Design Specification

**Date:** 2026-04-14
**Status:** Approved
**Author:** Clara (via brainstorming)

---

## 1. Context

**What:** TenacitOS Mission Control — dashboard web para monitoramento do OpenClaw.

**Why:** Visibilidade em tempo real da operação — agentes, sessões, custos, cron jobs, memória, arquivos.

**What it reads:**
- `openclaw.json` — config e agentes
- `~/.openclaw/workspace/` — MEMORY.md, SOUL.md, IDENTITY.md, etc.
- SQLite sessions DB — token usage e custos
- Cron jobs e logs

**What it does NOT access:**
- Credenciais do Telegram, OpenAI ou outros serviços
- Não envia dados externos — tudo local

---

## 2. Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     INTERNET                             │
└────────────────────┬──────────────────────────────────────┘
                     │ (Tailscale VPN — não exposto na internet)
┌────────────────────▼──────────────────────────────────────┐
│              Tailscale Network (100.x.x.x)                │
│                                                          │
│   ┌─────────────────────────────────────────────────┐     │
│   │   Mission Control (Next.js :3000)                │     │
│   │   Admin auth (ADMIN_PASSWORD + AUTH_SECRET)     │     │
│   │   Lê: /root/.openclaw/*                        │     │
│   │   PM2 process manager (auto-restart)            │     │
│   └────────────────┬────────────────────────────────┘     │
│                    │ loopback only (127.0.0.1)            │
│                    ▼                                      │
│   ┌─────────────────────────────────────────────────┐     │
│   │   OpenClaw Gateway (:18789)                      │     │
│   └─────────────────────────────────────────────────┘     │
│                                                          │
│   Backup: cron diário SQLite → /root/backups/mc/          │
└─────────────────────────────────────────────────────────┘
```

**Access flow:**
1. Open Tailscale on mobile/desktop
2. Access `http://<tailnet-name>:3000`
3. Login with ADMIN_PASSWORD
4. View agents, sessions, cron, costs, etc.

---

## 3. Data & Storage

| File/Directory | What | Persists |
|---|---|---|
| `/root/.openclaw/*` | Reads: config, agents, sessions, memory | ✅ |
| `mission-control/*.db` | Local SQLite (costs, aggregated sessions) | ✅ |
| `/root/.openclaw/logs/` | Reads session logs | ✅ |
| `/var/log/mission-control-usage.log` | Usage collection cron | ✅ |

**SQLite schema (internal):**
- `usage_snapshots` — hourly token/cost aggregation
- `activities` — agent activity log
- Persists at `/root/.openclaw/workspace/mission-control/.data/`

**Backup:**
- Cron daily: `0 3 * * *` — copies `*.db` → `/root/backups/mc/`
- Retains 7 days (rotate)

---

## 4. Security

**Protection layers:**

| Layer | What it does |
|---|---|
| **Tailscale VPN** | Access only via private network — no public internet |
| **Mission Control Auth** | ADMIN_PASSWORD strong + AUTH_SECRET (cookie) |
| **Rate limiting** | Next.js built-in brute-force protection on login |
| **Credentials** | Only in `.env.local` (never committed) |
| **Loopback only** | MC connects to Gateway via `127.0.0.1:18789` |
| **No third-party creds** | Does not expose Telegram/OpenAI tokens |

**Credentials to generate:**
```bash
# Auth secret (32+ chars)
openssl rand -base64 32

# Admin password (generate something strong)
openssl rand -base64 24
```

**NOT exposed:**
- Port 3000 binds only to `127.0.0.1` (PM2 with `host: 127.0.0.1`)
- SSH access on port 22 continues as-is

---

## 5. Deploy Phases

### Phase 1 — Setup
- [ ] Clone repo → `/root/.openclaw/workspace/mission-control`
- [ ] `npm install`
- [ ] Generate `AUTH_SECRET` and `ADMIN_PASSWORD`
- [ ] Create `.env.local`
- [ ] Test locally: `npm run dev` → `curl localhost:3000`

### Phase 2 — PM2
- [ ] Install PM2 (if not): `npm install -g pm2`
- [ ] Start: `pm2 start npm --name "mission-control" -- start`
- [ ] Configure auto-restart: `pm2 startup` + `pm2 save`
- [ ] Verify: `pm2 status`

### Phase 3 — Tailscale
- [ ] Install Tailscale (if not): `curl -fsSL https://tailscale.com/install.sh | sh`
- [ ] Auth: `tailscale up`
- [ ] Verify Tailscale IP: `tailscale ip -4`
- [ ] Test access via tailnet: `curl <tailnet-ip>:3000`

### Phase 4 — Backup
- [ ] Create dir: `/root/backups/mc`
- [ ] Create script: `backup-mc.sh`
- [ ] Cron: `0 3 * * * /root/scripts/backup-mc.sh`
- [ ] Test backup manually

---

## 6. Monitoring & Error Handling

**Watchdog (existing):**
- Runs 01:00 BRT daily
- Checks: UFW, Fail2Ban, SSH config, SSL, packages

**Mission Control extension:**

| Check | What it does |
|---|---|
| **MC Uptime** | `pm2 status mission-control` → alert if down |
| **MC Response** | `curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000` → alert if != 200 |
| **MC DB** | `ls /root/.openclaw/workspace/mission-control/.data/*.db` → alert if missing |

**Auto-recovery:**
- PM2 auto-restart on crash
- If MC down + PM2 not responding → alert on Telegram

---

## 7. Decisions Made

| Decision | Choice |
|---|---|
| Access scope | Private (single user — Osmar only) |
| Exposure | Tailscale-only (no public internet) |
| Process manager | PM2 |
| Backup | Daily cron + 7-day rotation |

---

## 8. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| MC exposes internal data if Tailscale misconfigured | Auth required + loopback-only binding |
| PM2 crash leaves MC down | Auto-restart + watchdog monitoring |
| SQLite DB corruption | Daily backup + rotation |
| Tailscale disconnected | Watchdog alerts on MC down |

---

*Spec approved by Osmar — 2026-04-14*
