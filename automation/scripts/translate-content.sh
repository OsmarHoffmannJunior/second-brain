#!/bin/bash
# translate-content.sh — Traduz e resume conteúdo
# Usage: ./translate-content.sh <url|file> [target_lang]

INPUT="$1"
TARGET="${2:-pt-BR}"
STATE="/root/.openclaw/workspace/automation/state"
TELEGRAM_CHAT_ID="852627132"

send_telegram() {
  curl -s -X POST "https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage" \
    -d chat_id="$TELEGRAM_CHAT_ID" \
    -d text="$1" \
    -d parse_mode="Markdown" 2>/dev/null
}

if [[ "$INPUT" =~ ^https?:// ]]; then
  CONTENT=$(curl -s "$INPUT" | sed -n '/<article/,/<\/article>/p' | sed 's/<[^>]*>//g' | tr -s ' \n' ' ')
else
  CONTENT=$(cat "$INPUT")
fi

TRANSLATED=$(echo "$CONTENT" | deep Translator 2>/dev/null || echo "$CONTENT")
SUMMARY=$(echo "$TRANSLATED" | sed -n '1,500p')

send_telegram "🌐 *Tradução*\n\n📝 *Resumo:*\n${SUMMARY:0:1000}..."
