# Learnings

Corrections, insights, and knowledge gaps captured during development.

**Categories**: correction | insight | knowledge_gap | best_practice

---

## [LRN-20260415-001] best_practice

**Logged**: 2026-04-15T16:58:00Z
**Priority**: medium
**Status**: pending
**Area**: config

### Summary
openclaw doctor --fix removed stale composio plugin entry that had invalid keys (consumerKey, mcpUrl)

### Details
Ao rodar `openclaw doctor --fix` pela primeira vez, ele removeu uma entrada estanha do plugin composio em `plugins.entries` que tinha chaves não reconhecidas (`consumerKey`, `mcpUrl`). Isso desbloqueou o comando `skills install`.

### Suggested Action
Se `openclaw skills install` falhar com erro de config, rodar `openclaw doctor --fix` antes — pode resolver problemas de config inválida.

### Metadata
- Source: error
- Related Files: /root/.openclaw/openclaw.json
- Tags: openclaw, skills, install, config
- See Also: 

---
