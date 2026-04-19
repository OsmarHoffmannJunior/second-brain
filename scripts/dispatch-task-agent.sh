#!/bin/bash
# ============================================================
# Dispatch Task Agent subagent for a specific task
# Uses Python WebSocket to call OpenClaw gateway RPC sessions.spawn
# ============================================================

set -euo pipefail

ID="$1"
TITLE="$2"
DESC="${3:-Sem descrição}"
PRIO="${4:-normal}"
CAT="${5:-work}"
DUE="${6:-}"
TRACK="${7:-on_track}"

AUTH_COOKIE="mc_auth=vpwpAfpLG2plBgk9MD+sUsSU+KXAlJl2Ut7TDoUmKw4="
SPAWN_SCRIPT="/tmp/spawn-subagent.py"
PROMPT_FILE="/tmp/task-prompt-${ID}.txt"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] [dispatcher] $1"; }

# ─── Ensure spawn script exists ────────────────────────────
if [ ! -f "$SPAWN_SCRIPT" ]; then
    cat > "$SPAWN_SCRIPT" << 'PYEOF'
#!/usr/bin/env python3
"""Spawn a subagent via OpenClaw gateway WebSocket RPC."""
import sys, os, json, time, threading, uuid

try:
    import websocket as ws_module
except ImportError:
    print("websocket-client not installed", file=sys.stderr)
    sys.exit(1)

GW_URL = "ws://127.0.0.1:18789"
TOKEN = "e05f77d029aa4b05d7138adc52ad26abb6848bcfcdba7248"

def spawn(task_prompt: str, workspace: str) -> str:
    req_id = [0]
    result = {"done": False, "output": "", "sessionKey": ""}
    ws = None

    def send(wc, msg):
        req_id[0] += 1
        wc.send(json.dumps({**msg, "id": str(req_id[0])}))

    ws = ws_module.WebSocket()
    ws.connect(GW_URL)

    def reader():
        while not result["done"]:
            try:
                msg = json.loads(ws.recv())
                # Handle connect challenge
                if msg.get("event") == "connect.challenge":
                    send(ws, {
                        "type": "req", "method": "connect",
                        "params": {
                            "minProtocol": 3, "maxProtocol": 3,
                            "client": {"id": "cli", "version": "2026.4.12", "platform": "linux", "mode": "cli"},
                            "role": "operator",
                            "scopes": ["operator.admin", "operator.write"],
                            "caps": [], "commands": [], "permissions": {},
                            "auth": {"token": TOKEN},
                            "locale": "pt-BR", "userAgent": "openclaw-cli/2026.4.12"
                        }
                    })
                    return
                # Handle hello-ok (authenticated)
                if msg.get("payload", {}).get("type") == "hello-ok":
                    print("[spawn] Authenticated as operator", flush=True)
                    send(ws, {
                        "type": "req", "method": "sessions.spawn",
                        "params": {
                            "task": task_prompt,
                            "workspace": workspace,
                            "runtime": "subagent",
                            "model": "minimax-portal/MiniMax-M2.7"
                        }
                    })
                    return
                # Handle sessions.spawn response
                if msg.get("result", {}).get("sessionKey"):
                    result["sessionKey"] = msg["result"]["sessionKey"]
                    print(f"[spawn] Session created: {result['sessionKey']}", flush=True)
                if "output" in msg.get("result", {}):
                    result["output"] += msg["result"].get("output", "")
                if msg.get("result", {}).get("done"):
                    result["done"] = True
            except Exception as e:
                print(f"[spawn] Read error: {e}", flush=True)
                break

    t = threading.Thread(target=reader, daemon=True)
    t.start()

    # Wait for connection + challenge response
    for _ in range(20):
        if result["sessionKey"] or result["done"]:
            break
        time.sleep(0.5)

    # Wait for subagent to finish (up to 5 min)
    for _ in range(60):
        if result["done"]:
            break
        time.sleep(5)

    ws.close()
    return result.get("output", "")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: spawn-subagent.py <prompt-file> <workspace>", file=sys.stderr)
        sys.exit(1)
    with open(sys.argv[1]) as f:
        prompt = f.read()
    output = spawn(prompt, sys.argv[2])
    print(output if output else "[no output]", flush=True)
PYEOF
    chmod +x "$SPAWN_SCRIPT"
fi

# ─── Build task prompt ─────────────────────────────────────
cat > "$PROMPT_FILE" << PROMPT_EOF
## Task a executar

**Título:** $TITLE
**Descrição:** $DESC
**Categoria:** $CAT
**Prioridade:** $PRIO
**Vencimento:** ${DUE:-não definido}
**ID:** $ID

## Suas instruções

Você é @clara, analista de SEO. Execute a task acima seguindo:
1. Leia a descrição com atenção
2. Execute usando as ferramentas disponíveis (web search, fetch, análise)
3. Documente o resultado da execução (o que fez, descobriu, gerou)
4. Atualize o status da task via API (usar exec tool com curl):
   - Iniciar: \`curl -s -X PUT http://localhost:3000/api/tasks -H "Content-Type: application/json" -H "Cookie: $AUTH_COOKIE" -d "{\\"id\\":\\"$ID\\",\\"status\\":\\"in_progress\\",\\"track_status\\":\\"on_track\\"}"\`
   - Concluir: \`curl -s -X PUT http://localhost:3000/api/tasks -H "Content-Type: application/json" -H "Cookie: $AUTH_COOKIE" -d "{\\"id\\":\\"$ID\\",\\"status\\":\\"review\\",\\"track_status\\":\\"on_track\\"}"\`
5. Se bloqueado: curl PUT com "review" + "at_risk" e explique o bloqueio

## Notificação Telegram (enviar via message tool, channel=telegram, target=852627132):
\`\`\`
✅ Task concluída

📋 ID: $ID
📌 Título: $TITLE
📁 Categoria: $CAT
⚡ Prioridade: $PRIO
📅 Vencimento: ${DUE:-não definido}
⏱️ Concluída em: $(date '+%d/%m/%Y às %H:%M BRT')

📝 Resumo:
[resumo do que foi feito]

🔗 Ver task: http://100.64.39.113:3000/tasks
\`\`\`

Se bloqueado:
\`\`\`
⚠️ Task bloqueada

📋 ID: $ID
📌 Título: $TITLE
📁 Motivo: [explicação do que falta]
📝 O que preciso: [input necessário]

🔗 Ver task: http://100.64.39.113:3000/tasks
\`\`\`
PROMPT_EOF

log "Disparando subagent para task $ID: $TITLE"

# ─── Spawn via WebSocket ────────────────────────────────────
python3 "$SPAWN_SCRIPT" "$PROMPT_FILE" /root/.openclaw/workspace 2>&1

rm -f "$PROMPT_FILE"
log "Dispatcher finished for task $ID"
