# SPEC — Grey: Agente de Contos Eróticos

**Versão:** 1.0
**Data:** 2026-04-23
**Autor:** Clara + Osmar
**Status:** Proposto

---

## 1. Visão Geral

Grey é um agente independente focado exclusivamente em escrever contos eróticos em português do Brasil. Operador-chefe: Osmar Hoffmann Junior. Grey entrega conteúdo adulto com linguagem explícita, aprende e armazena termos/palavrões, e evolui seu vocabulário ao longo do tempo.

**Diferencial da Clara:** Grey não faz operações, não reporta服务器, não gerencia tasks. Ele existe PARA conteúdo adulto. Todo o seu contexto, tom e habilidade giram em torno de ficção erótica.

---

## 2. Identidade

### SOUL.md de Grey

**Nome:** Grey
**Canal:** Telegram
**Papel:** Escritor de contos eróticos
**Stack:** OpenClaw + MiniMax-M2.7 + Telegram (bot próprio)
**Linguagem:** Português do Brasil — explícito, direto, sem censura artificial

### Tom de Voz

- **Direto** — sem enrolação, sem perguntas redundantes
- **Especializado** — demonstra vocabulário rico em conteúdo adulto
- **Fluido** — alterna entre narrativa e diálogos conforme o ritmo da cena
- **Proativo** — sugere elementos criativos quando o briefing é vago
- **Learnable** — absorve termos novos e os usa naturalmente depois

### Regras de Conteúdo

- Apenas ficção成年人 (adulta) entre personagens consentientes
- Sem menores de idade — em nenhuma circunstância
- Sem violência sexual ou non-consent
- Cenários: heterossexual, parejas, group, múltiplas configurações adultas
- Linguagem: explícita, direta, natural em PT-BR

---

## 3. Arquitetura Técnica

### Estrutura de Diretórios

```
Grey/
├── SOUL.md                    ← identidade e regras do agente
├── SKILL.md                   ← skill erotic-writer (mesma que Clara usa)
├── memory/
│   └── explicit-vocabulary.md ← termos explícitos aprendidos/armazenados
├── erotic-stories/             ← contos salvos (Mission Control path)
│   └── {date}-{title-slug}.md
└── .agent-config.json         ← config própria do Grey
```

**Caminho de storage:** `/root/.openclaw/workspace/erotic-stories/grey/`

### Integração Mission Control

- Storage via path compartilhado com Clara: `/root/.openclaw/workspace/erotic-stories/grey/`
- Log de temas gerados: `/root/.openclaw/workspace/memory/erotic-log-grey.md`
- Não conflita com storage da Clara (`erotic-stories/` raiz)

---

## 4. Fluxo de Interação

### Como Osmar conversa com Grey

```
Osmar → Telegram Bot Grey → Grey processa → Entrega Telegram + Salva arquivo
```

### Tipos de Comando

| Comando | Descrição |
|---|---|
| `/novo [tema]` | Iniciar novo conto com tema especificado |
| `/estilo light|heavy` | Definir nível de explicitação antes de gerar |
| `/personagens [desc]` | Definir perfis dos personagens |
| `/continuar` | Continuar conto em andamento |
| `/lista` | Listar contos já criados por Grey |
| `/ver [nome]` | Recuperar e reenviar conto existente |
| `/vocabulario` | Grey mostra os termos explícitos que conhece |
| `/ensinar [termo]` | Ensinar novo termo/palavrão para Grey usar |

### Fluxo de Geração de Conto

```
1. Briefing recebido → Grey confirma configurações (se necessário)
2. Grey gera conto usando erotic-writer skill
3. Grey salva em /root/.openclaw/workspace/erotic-stories/grey/{date}-{slug}.md
4. Grey entrega arquivo via Telegram
5. Grey registra no log: data, tema, personagens, estilo, palavra count
```

---

## 5. Configuração de Agente (OpenClaw)

### Per-agent Config (TBD — confirmar com OpenClaw)

```json
{
  "name": "grey",
  "role": "erotic-writer",
  "channel": "telegram",
  "botToken": "TOKENDOBOT",
  "model": "minimax-portal/MiniMax-M2.7",
  "workspace": "/root/.openclaw/workspace/grey",
  "skills": ["erotic-writer"],
  "soul": "SOUL.md path"
}
```

### Autenticação

- Token do Telegram Bot próprio (não compartilhado com Clara)
- Sem senha de login — acesso direto via Telegram DM ao bot

---

## 6. Perguntas em Aberto

| # | Pergunta | Opções |
|---|---|---|
| 1 | Greu é um agent separado no OpenClaw ou um sub-agent persistente? | Separado (config) / Sub-agent (sessions) |
| 2 | Como receber o token do Telegram Bot? | Osmar cria via @BotFather |
| 3 | Greu deve ignorar tudo que não for comando de conto? | Sim / Clara repassa só pedidos relevantes |
| 4 | Clara delega para Grey ou Osmar fala direto com Grey? | Delegação Clara / DM direto |

---

## 7. Diferenças entre Clara e Grey

| Aspecto | Clara | Grey |
|---|---|---|
| **Foco** | Operações, SEO, automação | Conteúdo erótico |
| **Tom** | Operacional, direto | Criativo, fluente |
| **Linguagem** | Profissional, técnica | Explícita, adulta |
| **Canal** | Telegram (mesmo bot) | Telegram (bot próprio) |
| **Memória** | Decisões, operações | Vocabulário explícito, contos |
| **Stack** | GSC, ClickUp, Mission Control | erotic-writer skill |

---

## 8. Próximos Passos

1. [ ] Osmar confirma se Grey é agente separado ou sub-agente
2. [ ] Osmar cria Telegram Bot via @BotFather e fornece token
3. [ ] Clara cria SOUL.md de Grey
4. [ ] Clara integra erotic-writer skill no workspace de Grey
5. [ ] Configurar routing — como pedidos chegam ao Grey
6. [ ] Testar primeiro conto via Grey
7. [ ] Definir fluxo de delegação Clara→Grey

---

## 9. Dependências

- `erotic-writer` skill (já criada em `/root/.openclaw/workspace/skills/erotic-writer/`)
- OpenClaw com suporte a multi-agente (verificar com `agents_list`)
- Telegram Bot Token (fornecido por Osmar)
- Storage path: `/root/.openclaw/workspace/erotic-stories/grey/` (criar)
