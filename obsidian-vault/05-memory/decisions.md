# decisions.md — Decisões Permanentes e Irreversíveis

**Regra**: Uma decisão aqui = não volta atrás. Se algo mudar, apagar e mover para lessons.md como "reversão de decisão".

---

## Regras de Comunicação

| Decisão | Data | Motivo |
|---------|------|--------|
| Português apenas em todas as respostas | 2026-04-13 | Osmar solicitou; erro anterior: responder em inglês |
| Zero fluff: sem "Boa pergunta!", "Ficarei feliz em ajudar!" | 2026-04-13 | Osmar detesta; direto e técnico sempre |
| Canal único: Telegram | 2026-04-13 | Osmar configurou e usa só Telegram |

---

## Regras Técnicas

| Decisão | Data | Motivo |
|---------|------|--------|
| **Firewall NGFW Hetzner bloqueia portas** | 2026-04-18 | Portas 3000 (MC), 22000 (Syncthing), 3100 (Paperclip) não são acessíveis publicamente — bloqueadas pelo firewall da cloud. Services escutam em 0.0.0.0 mas cloud firewall impõe filtro de entrada. Não reportar como vulnerabilidade real. |
| **PaperclipAI removido** | 2026-04-18 | Osmar solicitou descontinuação. Processo morto, npm uninstall, dados em /home/mission/.paperclip removidos. |
| **SMB restrito a localhost** | 2026-04-18 | smbd agora escuta apenas 127.0.0.1:445/139 — não mais exposto em 0.0.0.0. Bind interfaces only = yes com IP Tailscale. |
| **SSH: PasswordAuthentication=no** | 2026-04-18 | Config explícito no sshd_config — sem possibility de fallback para auth por senha. |
| Backups antes de mudanças destructivas | 2026-04-13 | Regra AGENTS.md |
| `trash` > `rm` | 2026-04-13 | Recuperável > gone forever |
| **Senhas: .env apenas** | 2026-04-13 | NUNCA armazenar senhas em outro lugar além de .env ✅ Migrado |
| ~~Composio para Google Data~~ | ❌ removido 2026-04-19 | Usar API direta do Google (GSC/GA) ou CSV manual |
| **Revisão PT-BR em relatórios** | 2026-04-16 | Sempre fazer varredura final em português BR antes de entregar relatórios HTML/materiais. Corrigir: concordância, grafia, termos técnicos, caracteres estranho (ex: chinês residual), frases incompletas. |

---

## Arquitetura

| Decisão | Data | Motivo |
|---------|------|--------|
| Agent nome: Clara | 2026-04-13 | Escolhido por Osmar |
| MiniMax-M2.7 como modelo principal | 2026-04-13 | Padrão do sistema |

---

## Reversões de Decisão ( Histórico )

_Nenhuma ainda._

---

## Task Agent — Retry em falha (2026-04-20)

**Regra:** Se uma task falhar durante execução, movê-la para `backlog` e tentar pelo menos mais uma vez antes de marcar como bloqueada ou reportar erro definitivo.

**Contexto:** O Task Agent (cron das 8-19h BRT) dá timeout quando muitas tasks são processadas de uma vez. A solução é processar tasks individualmente, com retry automático em caso de falha.

## Skill Install — Sempre vetting antes de instalar (2026-04-20)
- **Regra**: Antes de instalar qualquer nova skill (de ClawHub, GitHub ou outra fonte), rodar o **skill-vetter** para auditoria de segurança.
- ** skill-vetter location**: `/root/openclaw/skills/skill-vetter/SKILL.md`
- **Ação**: Ler o SKILL.md do skill-vetter, seguir o protocolo, gerar relatório antes de prosseguir.
- **Exceção**: Skills já verificadas por Osmar diretamente podem ser instaladas sem vetting extra.
