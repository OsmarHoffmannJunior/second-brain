#!/bin/bash
# organize-files.sh — Organiza arquivos e estrutura
# Usage: ./organize-files.sh <folder_path> [dry-run]

FOLDER="${1:-/root}"
DRYRUN="$2"
STATE_DIR="/root/.openclaw/workspace/automation/state"
TELEGRAM_CHAT_ID="852627132"

send_telegram() {
  curl -s -X POST "https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage" \
    -d chat_id="$TELEGRAM_CHAT_ID" \
    -d text="$1" \
    -d parse_mode="Markdown" 2>/dev/null
}

# Categorização por extensão
organize_folder() {
  local target="$1"
  local changes=0

  declare -A categories=(
    ["images"]="jpg jpeg png gif webp svg ico"
    ["documents"]="pdf doc docx txt md rtf odt"
    ["spreadsheets"]="xls xlsx csv ods"
    ["code"]="js ts py html css php rb java go rs sh"
    ["archives"]="zip tar gz rar 7z"
    ["videos"]="mp4 mkv avi mov wmv flv"
    ["audio"]="mp3 wav flac aac ogg"
  )

  for cat in "${!categories[@]}"; do
    exts="${categories[$cat]}"
    for ext in $exts; do
      files=$(find "$target" -maxdepth 2 -type f -iname "*.${ext}" 2>/dev/null)
      [ -z "$files" ] && continue

      mkdir -p "${target}/${cat}"
      while IFS= read -r f; do
        fname=$(basename "$f")
        if [ -f "${target}/${cat}/${fname}" ]; then
          fname="${cat}_${fname}"
        fi
        if [ "$DRYRUN" = "dry-run" ]; then
          echo "DRY: mv '$f' -> '${target}/${cat}/${fname}'"
        else
          mv "$f" "${target}/${cat}/${fname}"
        fi
        changes=$((changes+1))
      done <<< "$files"
    done
  done

  echo "$changes"
}

send_telegram "📁 *Organizando:* ${FOLDER}\n\nAguarde..."

result=$(organize_folder "$FOLDER" "$DRYRUN")

if [ "$DRYRUN" = "dry-run" ]; then
  send_telegram "🔍 *Dry Run — Preview*\n\n\`\`\`\n${result}\n\`\`\`\n\nUse sem 'dry-run' pra aplicar."
else
  send_telegram "✅ *Organização concluída!*\n\n📁 ${FOLDER}\n📦 $result arquivos movidos."
fi
