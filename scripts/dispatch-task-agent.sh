#!/bin/bash
# ============================================================
# Dispatch Task Agent subagent for a specific task
# Uses OpenClaw gateway WebSocket RPC to spawn subagent
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
GW_URL="ws://127.0.0.1:18789"
GW_TOKEN="e05f77d029aa4b05d7138adc52ad26abb6848bcfcdba7248"
PROMPT_FILE="/tmp/task-prompt-${ID}.txt"
SPAWN_SCRIPT="/tmp/spawn-subagent.py"

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

result = {"done": False, "error": None}

def main():
    if len(sys.argv) < 3:
        print("Usage: spawn-subagent.py <prompt-file> <workspace>", file=sys.stderr)
        sys.exit(1)
    
    with open(sys.argv[1]) as f:
        task_prompt = f.read()
    workspace = sys.argv[2]

    req_id = [0]
    ws = None

    def send_method(method, params):
        req_id[0] += 1
        ws.send(json.dumps({
            "type": "req", "id": str(req_id[0]),
            "method": method, "params": params
        }))

    def on_message(ws, data):
        global result
        msg = json.loads(data)
        if msg.get("event") == "connect.challenge":
            send_method("connect", {
                "minProtocol": 3, "maxProtocol": 3,
                "client": {"id": "cli", "version": "2026.4.12", "platform": "linux", "mode": "cli"},
                "role": "operator",
                "scopes": [],
                "caps": [], "commands": [], "permissions": {},
                "auth": {"token": TOKEN},
                "locale": "en-US", "userAgent": "openclaw-cli/2026.4.12"
            })
            return
        if msg.get("payload", {}).get("type") == "hello-ok":
            print("[spawn] Authenticated", flush=True)
            send_method("sessions.create", {
                "sessionKey": f"agent:main:subagent:{uuid.uuid4()}",
                "type": "agent",
                "runtime": "subagent",
                "model": "minimax-portal/MiniMax-M2.7",
                "workspaceDir": workspace,
                "lane": "subagent"
            })
            return
        if msg.get("type") == "res":
            if msg.get("ok"):
                print(f"[spawn] Spawned: {str(msg.get('payload', {}))[:200]}", flush=True)
                result["done"] = True
                ws.close()
            else:
                print(f"[spawn] Error: {msg.get('error')}", flush=True)
                result["error"] = msg.get("error")
                result["done"] = True
                ws.close()

    def on_error(ws, err):
        print(f"[spawn] WS error: {err}", flush=True)
        result["error"] = str(err)
        result["done"] = True

    def on_close(ws, *args):
        result["done"] = True

    def on_open(ws):
        print("[spawn] Connected", flush=True)

    ws = ws_module.WebSocketApp(GW_URL,
        on_open=on_open, on_message=on_message,
        on_error=on_error, on_close=on_close,
        subprotocols=["json"])

    t = threading.Thread(target=ws.run_forever, daemon=True)
    t.start()

    for _ in range(10):
        if result["done"]: break
        time.sleep(1)

    ws.close()
    if result["error"]:
        print(f"[spawn] Failed: {result['error']}", file=sys.stderr, flush=True)
        sys.exit(1)
    print("[spawn] Subagent spawned", flush=True)
    sys.exit(0)

if __name__ == "__main__":
    main()
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
python3 "$SPAWN_SCRIPT" "$PROMPT_FILE" /root/.openclaw/workspace 2>&1 || log "ERRO: spawn falhou com código $?"

rm -f "$PROMPT_FILE"
log "Dispatcher finished for task $ID"