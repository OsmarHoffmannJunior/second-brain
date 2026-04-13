#!/bin/bash
# monitor-prices.sh — Monitora preços de produtos
# Usage: ./monitor-prices.sh [add <name> <url> <target> | list | check]

ACTION="$1"
CONFIG="/root/.openclaw/workspace/automation/config.yaml"
STATE_DIR="/root/.openclaw/workspace/automation/state"
PRICE_DB="${STATE_DIR}/prices.db"
TELEGRAM_CHAT_ID="852627132"

mkdir -p "$STATE_DIR"

send_telegram() {
  curl -s -X POST "https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage" \
    -d chat_id="$TELEGRAM_CHAT_ID" \
    -d text="$1" \
    -d parse_mode="Markdown" 2>/dev/null
}

add_product() {
  local name="$2" url="$3" target="$4"
  echo "${name}|${url}|${target}|$(date +%s)" >> "$PRICE_DB"
  send_telegram "✅ Adicionado ao monitoramento:\n*${name}*\nURL: ${url}\nPreço alvo: ${target}"
}

list_products() {
  if [ ! -f "$PRICE_DB" ]; then
    send_telegram "📦 Nenhum produto monitorado ainda.\n\nUse: /price add <nome> <url> <preco_alvo>"
    return
  fi

  local msg="📦 *Produtos Monitorados:*\n\n"
  while IFS='|' read -r name url target _; do
    current=$(curl -s "$url" | grep -oP 'R\$\s*[\d.,]+' | head -1)
    msg+="• *${name}*\n  Alvo: ${target} | Atual: ${current:-'?'}\n"
  done < "$PRICE_DB"
  send_telegram "$msg"
}

check_prices() {
  [ ! -f "$PRICE_DB" ] && return

  while IFS='|' read -r name url target _; do
    current=$(curl -s "$url" | grep -oP 'R\$\s*[\d.,]+' | head -1)
    current_num=$(echo "$current" | tr -d 'R$ .' | tr ',' '.')
    target_num=$(echo "$target" | tr -d 'R$ .' | tr ',' '.')

    if (( $(echo "$current_num < $target_num" | bc -l) )); then
      send_telegram "🚨 *PREÇO BAIXOU!*\n\n*${name}*\n\nValor atual: ${current}\nAlvo: ${target}\n\n👉 ${url}"
    fi
  done < "$PRICE_DB"
}

case "$ACTION" in
  add) add_product "$@" ;;
  list) list_products ;;
  check) check_prices ;;
  *) send_telegram "Usage:\n• /price add <nome> <url> <preco_alvo>\n• /price list\n• /price check" ;;
esac
