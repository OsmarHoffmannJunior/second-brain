# 🚀 Automation Commands

## Como ativar cada automação

### 1. Monitoramento de Conteúdo
```bash
# Ver tudo (RSS + Reddit)
/runner.sh monitor all

# Só Reddit
/runner.sh monitor reddit
```
- **Automático:** 9h e 18h BRT
- **Filtra por:** keywords no config.yaml

---

### 2. Traduzir Conteúdo
```bash
/runner.sh translate <url> [idioma]
```
- Exemplo: `/runner.sh translate https://exemplo.com/artigo pt-BR`

---

### 3. Resumir Vídeo/Podcast
```bash
/runner.sh summarize <youtube_url>
```
- **Tempo:** ~10-15 min por vídeo
- Usa Whisper pra transcrever

---

### 4. Gerar Imagens
```bash
# Via tool native — me mande a descrição!
```
- **Tempo:** 1-2 min por imagem

---

### 5. Monitorar Preços
```bash
/runner.sh price add <nome> <url> <preco_alvo>
# Ex: /runner.sh price add "Teclado Keychron" "https://amazon.com/..." "350"

/runner.sh price list
/runner.sh price check
```
- **Automático:** a cada 6h
- Te alerta quando cair abaixo do target

---

### 6. Gerenciar Tarefas
```bash
/runner.sh task add <descrição> <deadline>
# Ex: /runner.sh task add "Review proposal" "2026-04-15 14:00"

/runner.sh task list
/runner.sh task done <id>
```
- **Automático:** lembrete 1h antes do prazo

---

### 7. Gerar Drafts
```bash
/runner.sh draft <tipo> <tópico> [tom]
# Tipos: email, post, proposal, ata
# Ex: /runner.sh draft email "Proposta SEO cliente X" direto
```

---

### 8. Pesquisa de Mercado
```bash
/runner.sh research <tema> [competidor1] [competidor2]
# Ex: /runner.sh research "SEO tools" semrush ahrefs
```
- **Tempo:** ~20-30 min

---

### 9. Organizar Arquivos
```bash
/runner.sh organize <pasta> [dry-run]
# Ex: /runner.sh organize /home/user/Downloads dry-run
```

---

## Via Telegram (comando direto)

As automações funcionam via cron, mas você também pode acionar manualmente pela conversa. É só me mandar a instrução em texto livre que eu executo.

---

## Config

- **Keywords:** `automation/config.yaml`
- **State/DB:** `automation/state/`
- **Scripts:** `automation/scripts/`
- **Logs:** `automation/logs/` ou `~/.openclaw/logs/automation.log`
