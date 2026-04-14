# Mission Control (tenacitOS) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deploy tenacitOS Mission Control dashboard — Tailscale-only access, PM2 process manager, local SQLite backup.

**Architecture:** 
Mission Control runs as a Next.js app managed by PM2, exposed only on the Tailscale VPN network. It reads OpenClaw data from `/root/.openclaw/` locally. SQLite database backed up daily via cron to `/root/backups/mc/` with 7-day rotation.

**Tech Stack:** Node.js 22, Next.js, PM2, Tailscale, SQLite (better-sqlite3), bash cron

---

## File Structure

```
/root/.openclaw/workspace/mission-control/     # Mission Control app (git clone)
/root/.openclaw/workspace/mission-control/.env.local   # Credentials (NOT committed)
/root/backups/mc/                              # Daily SQLite backups
/root/scripts/backup-mc.sh                     # Backup script
/root/.openclaw/workspace/docs/superpowers/plans/2026-04-14-mission-control-deploy.md  # This plan
```

---

## Task 1: Clone Repository

**Files:**
- Create: `/root/.openclaw/workspace/mission-control/`

- [ ] **Step 1: Clone tenacitOS repo**

Run:
```bash
cd /root/.openclaw/workspace
git clone https://github.com/carlosazaustre/tenacitOS.git mission-control
cd mission-control
```

Expected: Clone completes, `ls` shows `package.json`, `src/`, `README.md`

- [ ] **Step 2: Commit**

```bash
cd /root/.openclaw/workspace
git add mission-control
git commit -m "feat: add tenacitOS mission-control codebase"
```

---

## Task 2: Install Dependencies

**Files:**
- Modify: `/root/.openclaw/workspace/mission-control/` (npm install)

- [ ] **Step 1: Install npm dependencies**

Run:
```bash
cd /root/.openclaw/workspace/mission-control
npm install
```

Expected: Install completes, `node_modules/` exists, no ERR errors

- [ ] **Step 2: Commit**

```bash
cd /root/.openclaw/workspace
git add mission-control/package-lock.json
git commit -m "feat: install mission-control npm dependencies"
```

---

## Task 3: Generate Credentials

**Files:**
- Create: `/root/.openclaw/workspace/mission-control/.env.local` (NOT committed)

- [ ] **Step 1: Generate AUTH_SECRET (32+ chars)**

Run:
```bash
openssl rand -base64 32
```

Output: Something like `Xx9k2mN3pQ7rT5vB8wE1fH6gL0jK4sD=` (copy this)

- [ ] **Step 2: Generate ADMIN_PASSWORD (strong password)**

Run:
```bash
openssl rand -base64 24
```

Output: Something like `Ym4kN8pQ2rT5vX9zA1cE3fH` (copy this)

- [ ] **Step 3: Create .env.local**

Run:
```bash
cat > /root/.openclaw/workspace/mission-control/.env.local << 'EOF'
# Auth (required)
ADMIN_PASSWORD=<password-from-step2>
AUTH_SECRET=<secret-from-step1>

# Branding (optional - customize for your instance)
NEXT_PUBLIC_AGENT_NAME=Mission Control
NEXT_PUBLIC_AGENT_EMOJI=🤖
NEXT_PUBLIC_AGENT_DESCRIPTION=Your AI co-pilot, powered by OpenClaw
NEXT_PUBLIC_APP_TITLE=Mission Control
EOF
```

Replace `<password-from-step2>` and `<secret-from-step1>` with the actual values from steps 1 and 2.

- [ ] **Step 4: Verify .env.local exists**

Run:
```bash
cat /root/.openclaw/workspace/mission-control/.env.local
```

Expected: Shows ADMIN_PASSWORD and AUTH_SECRET (redacted values ok)

- [ ] **Step 5: Add .env.local to gitignore**

Run:
```bash
echo ".env.local" >> /root/.openclaw/workspace/mission-control/.gitignore
git add mission-control/.gitignore
git commit -m "chore: ignore .env.local in mission-control"
```

---

## Task 4: Test Local Dev

**Files:**
- Test: `/root/.openclaw/workspace/mission-control/`

- [ ] **Step 1: Start dev server (background)**

Run:
```bash
cd /root/.openclaw/workspace/mission-control
npm run dev &
sleep 10
```

Expected: Next.js starts on port 3000, no ERR

- [ ] **Step 2: Test local response**

Run:
```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
```

Expected: `200` (or redirect to login)

- [ ] **Step 3: Kill dev server**

Run:
```bash
pkill -f "next dev" && sleep 2 && echo "killed"
```

Expected: `killed`

---

## Task 5: Install PM2

**Files:**
- Install: PM2 process manager

- [ ] **Step 1: Check if PM2 is installed**

Run:
```bash
pm2 --version 2>/dev/null && echo "installed" || echo "not installed"
```

If `not installed`:

- [ ] **Step 2: Install PM2 globally**

Run:
```bash
npm install -g pm2
pm2 --version
```

Expected: Version output (e.g., `6.x.x`)

- [ ] **Step 3: Commit**

```bash
git add mission-control
git commit -m "feat: add pm2 to mission-control setup"
```

---

## Task 6: Start Mission Control with PM2

**Files:**
- Modify: PM2 process list

- [ ] **Step 1: Start Mission Control via PM2**

Run:
```bash
cd /root/.openclaw/workspace/mission-control
pm2 start npm --name "mission-control" -- start
```

Expected: PM2 starts process, shows `mission-control` in list

- [ ] **Step 2: Verify status**

Run:
```bash
pm2 status mission-control
```

Expected: Status `online`, CPU/RAM usage shown, restarts `0`

- [ ] **Step 3: Test MC response via curl**

Run:
```bash
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000
```

Expected: `200` (login page or dashboard)

- [ ] **Step 4: Configure PM2 startup script**

Run:
```bash
pm2 startup
pm2 save
```

Expected: PM2 saves current process list, shows startup command for systemd

- [ ] **Step 5: Commit workspace**

```bash
cd /root/.openclaw/workspace
git add mission-control
git commit -m "feat: start mission-control with PM2"
```

---

## Task 7: Install Tailscale

**Files:**
- Install: Tailscale VPN

- [ ] **Step 1: Check if Tailscale is installed**

Run:
```bash
tailscale --version 2>/dev/null && echo "installed" || echo "not installed"
```

If `not installed`:

- [ ] **Step 2: Install Tailscale**

Run:
```bash
curl -fsSL https://tailscale.com/install.sh | sh
```

Expected: Tailscale installed, instructions shown for `tailscale up`

- [ ] **Step 3: Authenticate**

Run:
```bash
tailscale up
```

Expected: Opens authentication URL, waits for login

⚠️ **ATTENTION:** Complete the Tailscale authentication in your browser. The command will block until authenticated.

- [ ] **Step 4: Verify connection**

Run:
```bash
tailscale status
```

Expected: Shows your Tailscale IP (100.x.x.x), connection status `Connected`

- [ ] **Step 5: Get Tailscale IP**

Run:
```bash
tailscale ip -4
```

Expected: IPv4 address like `100.x.x.x` — save this for access

---

## Task 8: Test Tailscale Access to Mission Control

**Files:**
- Test: Tailscale network access

- [ ] **Step 1: Get Tailscale IP**

Run:
```bash
tailscale ip -4
```

Output: `100.x.x.x` — use this in next step

- [ ] **Step 2: Test access via Tailscale network**

Run:
```bash
curl -s -o /dev/null -w "%{http_code}" http://100.x.x.x:3000
```

Expected: `200` (or redirect to login) — Mission Control is accessible via Tailscale!

- [ ] **Step 3: Note access URL**

Save: `http://<tailscale-ip>:3000` — this is your Mission Control URL

---

## Task 9: Create Backup Script

**Files:**
- Create: `/root/scripts/backup-mc.sh`
- Create: `/root/backups/mc/`

- [ ] **Step 1: Create backup directory**

Run:
```bash
mkdir -p /root/backups/mc && echo "OK"
```

- [ ] **Step 2: Create backup script**

Run:
```bash
cat > /root/scripts/backup-mc.sh << 'EOF'
#!/bin/bash
# Mission Control SQLite Backup Script
# Runs daily via cron

BACKUP_DIR="/root/backups/mc"
MC_DATA="/root/.openclaw/workspace/mission-control/.data"
DATE=$(date +%Y-%m-%d)
KEEP_DAYS=7

# Create backup dir if not exists
mkdir -p "$BACKUP_DIR"

# Find and copy all SQLite databases
if [ -d "$MC_DATA" ]; then
  find "$MC_DATA" -name "*.db" -exec cp {} "$BACKUP_DIR/mission-control-$DATE.db" \;
  echo "[$(date)] Backup completed: mission-control-$DATE.db"
else
  echo "[$(date)] WARNING: MC data directory not found: $MC_DATA"
  exit 1
fi

# Remove backups older than KEEP_DAYS
find "$BACKUP_DIR" -name "mission-control-*.db" -mtime +$KEEP_DAYS -delete
echo "[$(date)] Cleanup completed: removed backups older than $KEEP_DAYS days"
EOF
chmod +x /root/scripts/backup-mc.sh
```

- [ ] **Step 3: Test backup script manually**

Run:
```bash
/root/scripts/backup-mc.sh
```

Expected: Output shows backup completed, `ls /root/backups/mc/` shows new `.db` file

- [ ] **Step 4: Commit**

```bash
mkdir -p /root/scripts
git add /root/scripts/backup-mc.sh
git commit -m "feat: add mission-control backup script"
```

---

## Task 10: Configure Backup Cron

**Files:**
- Modify: crontab

- [ ] **Step 1: Add cron job (daily at 3am BRT = 6:00 UTC)**

Run:
```bash
(crontab -l 2>/dev/null | grep -v "backup-mc.sh"; echo "0 6 * * * /root/scripts/backup-mc.sh >> /var/log/mc-backup.log 2>&1") | crontab -
```

- [ ] **Step 2: Verify cron entry**

Run:
```bash
crontab -l | grep backup-mc
```

Expected: Shows the cron line with `backup-mc.sh`

---

## Task 11: Extend Watchdog to Include Mission Control

**Files:**
- Modify: existing watchdog cron job (ID: `dc81998c-0f25-4dfb-be83-85c81f57b98e`)

- [ ] **Step 1: Get current watchdog message**

Run:
```bash
openclaw cron list --json 2>/dev/null | jq '.[] | select(.name | contains("Watchdog")) | {id, message}'
```

Expected: Shows current watchdog job ID and message

- [ ] **Step 2: Update watchdog message to include MC checks**

Run:
```bash
openclaw cron edit dc81998c-0f25-4dfb-be83-85c81f57b98e \
  --message "Checar saúde do servidor. Checklist:
✅ UFW ativo e configurado corretamente
✅ Fail2ban rodando com regras SSH
✅ Portas expostas = mínimo necessário
✅ SSH: PasswordAuthentication no, PermitRootLogin no
✅ Credenciais no 1Password (NUNCA hardcoded)
✅ Certificados SSL válidos (se aplicável)
✅ Packages atualizados (apt update + upgrade)
✅ Mission Control: pm2 status mission-control (online)
✅ Mission Control: curl localhost:3000 (200 OK)
✅ Mission Control DB: ls /root/.openclaw/workspace/mission-control/.data/*.db (existe)

Se algo falhar, alertar com detalhes. Se tudo ok, silêncio."
```

Expected: Cron updated successfully

---

## Task 12: Final Verification

**Files:**
- Test: full stack verification

- [ ] **Step 1: Verify PM2 is running**

Run:
```bash
pm2 status mission-control
```

Expected: `online` status, 0 restarts

- [ ] **Step 2: Verify Mission Control responds**

Run:
```bash
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000
```

Expected: `200`

- [ ] **Step 3: Verify Tailscale is connected**

Run:
```bash
tailscale status | head -3
```

Expected: Shows IP, `Connected`

- [ ] **Step 4: Verify backup exists**

Run:
```bash
ls -lh /root/backups/mc/
```

Expected: Shows at least one `.db` file with recent date

- [ ] **Step 5: Commit final state**

```bash
cd /root/.openclaw/workspace
git add .
git commit -m "feat: mission-control fully deployed and configured"
```

---

## Verification Commands Summary

After deployment, access Mission Control at:
```
http://<tailscale-ip>:3000
```

Login with `ADMIN_PASSWORD` from `.env.local`.

| Check | Command |
|---|---|
| PM2 status | `pm2 status mission-control` |
| MC response | `curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000` |
| Tailscale IP | `tailscale ip -4` |
| Backup | `ls /root/backups/mc/` |
| Cron | `crontab -l | grep mc-backup` |
| Watchdog | `openclaw cron list` |

---

## Spec Coverage Check

- [x] Phase 1 (Setup) → Tasks 1-4
- [x] Phase 2 (PM2) → Tasks 5-6
- [x] Phase 3 (Tailscale) → Tasks 7-8
- [x] Phase 4 (Backup) → Tasks 9-10
- [x] Monitoring extension → Task 11
- [x] Final verification → Task 12

All spec requirements covered.
