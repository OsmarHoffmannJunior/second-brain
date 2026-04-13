#!/bin/bash
# monitor-content.sh — Monitora RSS feeds e Reddit
# Usage: ./monitor-content.sh [reddit|all]

MODE="${1:-all}"
CONFIG="/root/.openclaw/workspace/automation/config.yaml"
STATE="/root/.openclaw/workspace/automation/state"
TELEGRAM_CHAT_ID="852627132"

source "$STATE/config-bridge.sh" 2>/dev/null || eval "$(grep -oP '(?<=^export ).+' "$CONFIG" | tr '\n' ' ' | sed 's/#.*//g')"

KEYWORDS=$(grep -A50 '^keywords:' "$CONFIG" | grep -E '^\s+-' | sed 's/^- //' | tr '\n' '|')
KEYWORDS="${KEYWORDS%|}"

send_telegram() {
  local msg="$1"
  curl -s -X POST "https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage" \
    -d chat_id="$TELEGRAM_CHAT_ID" \
    -d text="$msg" \
    -d parse_mode="Markdown" 2>/dev/null
}

filter_rss() {
  local feed="$1"
  local items=$(curl -s "$feed" | grep -o '<item>.*?</item>' | head -10)
  local relevant=""

  while IFS= read -r item; do
    title=$(echo "$item" | grep -o '<title>.*?</title>' | sed 's/<[^>]*>//g')
    link=$(echo "$item" | grep -o '<link>.*?</link>' | sed 's/<[^>]*>//g')
    description=$(echo "$item" | grep -o '<description>.*?</description>' | sed 's/<[^>]*>//g')

    if echo "$title $description" | grep -Ei "$KEYWORDS" >/dev/null; then
      relevant+="📢 *${title}*\n${link}\n\n"
    fi
  done <<< "$items"

  echo -e "$relevant"
}

monitor_reddit() {
  local subreddits=$(grep -A10 '^subreddits:' "$CONFIG" | grep -E '^\s+-' | sed 's/^- //' | tr '\n' ',' | sed 's/,$//')
  local result=""

  IFS=',' read -ra SUBS <<< "$subreddits"
  for sub in "${SUBS[@]}"; do
    sub=$(echo "$sub" | tr -d ' ')
    local posts=$(curl -s "https://www.reddit.com/r/${sub}/hot.json?limit=5" \
      -H "User-Agent: Mozilla/5.0" 2>/dev/null)

    local titles=$(echo "$posts" | grep -o '"title":"[^"]*"' | sed 's/"title":"//;s/"$//' | head -5)
    local urls=$(echo "$posts" | grep -o '"url":"[^"]*"' | sed 's/"url":"//;s/"$//' | head -5)

    while IFS= read -r title && IFS= read -r url in <<< "$titles" <<< "$urls"; do
      if echo "$title" | grep -Ei "$KEYWORDS" >/dev/null; then
        result+="🔵 r/${sub}: *${title}*\nhttps://reddit.com${url}\n\n"
      fi
    done
  done

  echo -e "$result"
}

# Main
case "$MODE" in
  reddit)
    output=$(monitor_reddit)
    ;;
  all)
    output="🔍 *Digest de Conteúdo — $(date '+%d/%m %H:%M')*\n\n"
    output+="*RSS Feeds:*\n"
    while IFS= read -r feed; do
      [ -z "$feed" ] && continue
      feed_name=$(basename "$feed" | cut -d'.' -f1)
      output+="\n📡 *${feed_name}:*\n"
      output+=$(filter_rss "$feed")
    done < <(grep -A10 '^rss_feeds:' "$CONFIG" | grep -E '^\s+- https?://')

    output+="\n*Reddit:*\n"
    output+=$(monitor_reddit)
    ;;
esac

if [ -n "$output" ] && [ ${#output} -gt 50 ]; then
  send_telegram "$output"
fi
