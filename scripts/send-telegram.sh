#!/bin/bash
# ============================================================
# Envia mensagem Telegram para @osmar
# Uso: send-telegram.sh "mensagem"
# ============================================================

TELEGRAM_BOT_TOKEN="${TELEGRAM_BOT_TOKEN:-}"
TELEGRAM_CHAT_ID="${TELEGRAM_CHAT_ID:-852627132}"

send_telegram() {
    local message="$1"
    if [ -z "$TELEGRAM_BOT_TOKEN" ]; then
        echo "[WARN] TELEGRAM_BOT_TOKEN not set — skip notification"
        return 0
    fi
    curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
        -d "chat_id=${TELEGRAM_CHAT_ID}" \
        -d "text=${message}" \
        -d "parse_mode=HTML" \
        2>/dev/null || true
}

if [ $# -ge 1 ]; then
    send_telegram "$1"
fi
