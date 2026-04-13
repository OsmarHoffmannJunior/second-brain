# HEARTBEAT.md

---

# Auto-compactação de contexto

## Configuração (via Osmar — 2026-04-13)

| Parâmetro | Valor |
|-----------|-------|
| `contextTokens` | 160,000 |
| `reserveTokensFloor` | 30,000 |
| Limiar de trigger | ~90% (~144k tokens) |
| Modo | `default` |

---

## Regra INVIOLÁVEL

Ao atingir ~90% da janela de contexto (~144k tokens), ANTES de qualquer compactação triggered pelo sistema:

### Checklist de Extração (SEMPRE executar antes de compactar)

1. [ ] **Decisões novas** → `memory/context/decisions.md`
2. [ ] **Lições novas** → `memory/context/lessons.md`
3. [ ] **Pessoas mencionadas** → `memory/context/people.md`
4. [ ] **Projetos atualizados** → `memory/projects/*.md`
5. [ ] **Pendências** → `memory/pending.md`
6. [ ] **Feedback do turno** → `memory/feedback/YYYY-MM-DD.json`

⚠️ **NUNCA compactar sem extrair primeiro. Se não extrair, perde 80% do valor — é como formatar o HD sem backup.**

---

## Outras tarefas de heartbeat (aqui para referência)

- Verificar `memory/pending.md` por pendências antigas
- Atualizar `memory/sessions/YYYY-MM-DD.md` com eventos do dia
