#!/bin/bash
# market-research.sh — Pesquisa de mercado leve
# Usage: ./market-research.sh <topic> [competitor1] [competitor2]

TOPIC="$1"
shift
COMPETITORS="$@"
STATE_DIR="/root/.openclaw/workspace/automation/state"
TELEGRAM_CHAT_ID="852627132"

send_telegram() {
  curl -s -X POST "https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage" \
    -d chat_id="$TELEGRAM_CHAT_ID" \
    -d text="$1" \
    -d parse_mode="Markdown" 2>/dev/null
}

send_telegram "🔍 *Pesquisando:* ${TOPIC}\n\nAguarde ~20-30 min. Te entrego o relatório."

REPORT="📊 *Relatório de Pesquisa: ${TOPIC}*\n\n"

# Google Trends
TRENDS=$(curl -s "https://trends.google.com/trends/api/dailytrends?hl=pt-BR&geo=BR&nsd=1" 2>/dev/null | grep -oP '"topic":\s*"\K[^"]+' | head -10)
REPORT+="*Tendências Google BR:*\n${TRENDS:-'Não disponível'}\n\n"

# Keywords related
KEYWORDS=$(curl -s "https://suggestqueries.google.com/complete/search?client=chrome&q=${TOPIC}&hl=pt" 2>/dev/null | grep -oP '\[\K[^\]]+' | tr ',' '\n' | head -10)
REPORT+="*Keywords Relacionadas:*\n${KEYWORDS:-'Não disponível'}\n\n"

# Competitors if provided
if [ -n "$COMPETITORS" ]; then
  REPORT+="*Competidores:*\n"
  for comp in $COMPETITORS; do
    REPORT+="• ${comp}\n"
    # Tenta pegar traffic estimate (via SEMrush/Ahrefs - quando disponível)
    REPORT+="  [Análise detalhada: ${comp}]\n"
  done
  REPORT+="\n"
fi

# Reddit mentions
REDDIT=$(curl -s "https://www.reddit.com/search.json?q=${TOPIC}&limit=5&sort=relevance" \
  -H "User-Agent: Mozilla/5.0" 2>/dev/null)
TITLES=$(echo "$REDDIT" | grep -oP '"title":"\K[^"]+' | head -5)
REPORT+="*Discussões em Alta (Reddit):*\n${TITLES:-'Não disponível'}\n\n"

# SEO metrics básicos
REPORT+="*Fontes consultadas:*\n"
REPORT+="• Google Trends\n• Reddit\n• Suggest Queries\n\n"
REPORT+="_Para análise mais profunda (backlinks, DA, traffic real), use ferramentas como Ahrefs/SEMrush._"

send_telegram "$REPORT"
