#!/bin/bash
# summarize-video.sh — Resume vídeos e podcasts
# Usage: ./summarize-video.sh <youtube_url|podcast_url>

INPUT="$1"
STATE="/root/.openclaw/workspace/automation/state"
TELEGRAM_CHAT_ID="852627132"

send_telegram() {
  curl -s -X POST "https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage" \
    -d chat_id="$TELEGRAM_CHAT_ID" \
    -d text="$1" \
    -d parse_mode="Markdown" 2>/dev/null
}

TMP_DIR="/tmp/video-summary-$$"
mkdir -p "$TMP_DIR"

if echo "$INPUT" | grep -qi 'youtube\|youtu.be'; then
  send_telegram "🎬 *Processando YouTube...*\n\nIsso pode levar ~10-15 min. Te aviso quando terminar."

  youtube_id=$(echo "$INPUT" | grep -oE '[a-zA-Z0-9_-]{11}')
  yt-dlp --extract-audio --audio-format mp3 --output "${TMP_DIR}/audio.%(ext)s" "$INPUT" >/dev/null 2>&1

  if [ -f "${TMP_DIR}/audio.mp3" ]; then
    TRANSCRIPT=$(whisper "${TMP_DIR}/audio.mp3" --language pt --output_format txt 2>/dev/null | head -2000)
    SUMMARY=$(echo "$TRANSCRIPT" | sed -n '1,1500p')
    send_telegram "📺 *Resumo do Vídeo*\n\n${SUMMARY:0:3500}"
  else
    send_telegram "❌ Erro ao baixar áudio. Verifique o link."
  fi
else
  send_telegram "🎙 *Processando Podcast...*\n\nPode levar ~10 min."

  wget -q -O "${TMP_DIR}/audio.mp3" "$INPUT"
  if [ -f "${TMP_DIR}/audio.mp3" ]; then
    TRANSCRIPT=$(whisper "${TMP_DIR}/audio.mp3" --language pt --output_format txt 2>/dev/null | head -2000)
    send_telegram "🎙 *Resumo do Podcast*\n\n${TRANSCRIPT:0:3500}"
  fi
fi

rm -rf "$TMP_DIR"
