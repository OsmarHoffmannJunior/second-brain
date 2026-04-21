# ClickUp — Hoff Consultoria: Design de Estrutura

**Data:** 2026-04-21
**Autor:** Clara (gerente de operações)
**Status:** Rascunho — aguardando aprovação do Osmar

---

## 1. Visão Geral

Estrutura de gestão de tarefas no ClickUp para a Hoff Consultoria, focada em simplicidade e separação clara por cliente. Sem permissões complexas (operação solo). Integrações mínimas.

---

## 2. Hierarquia de Spaces

### Opção escolhida: Space por Cliente

```
Hoff Consultoria (Organization)
├── 📁 Backlog              → tarefas sem cliente definido
├── 📁 Santtas              → cliente principal
├── 📁 MGM                  → cliente
├── 📁 Liven Casa           → cliente
└── 📁 Operações            → admin, financeiro, comercial
```

### Listas por Space

**Santtas, MGM, Liven Casa:**
```
📋 SEO
📋 Conteúdo
```

**Operações:**
```
📋 Admin
📋 Financeiro
📋 Comercial
```

**Backlog:**
```
📋 Backlog Geral
```

---

## 3. Fluxo de Entrada (Task Lifecycle)

### 3.1 Como uma tarefa entra

**Porta A — Backlog:**
→ Tarefa entra no `Backlog > Backlog Geral`
→ Depois avaliada e movida para a List correta do cliente

**Porta B — Direto na List:**
→ Tarefa já nasce na List do cliente (quando a origem é óbvia)

### 3.2 Status / Workflow

```
Backlog → Em Progresso → Revisão → Bloqueado → Feito
```

| Status | Significado |
|---|---|
| Backlog | Aguardando triagem / definição |
| Em Progresso | Em execução |
| Revisão | Pronto, aguardando validação |
| Bloqueado | Impedido por fator externo |
| Feito | Concluído |

---

## 4. Prioridade

**3 níveis:**

| Prioridade | ClickUp | Cor |
|---|---|---|
| Alta | 🔴 | Red |
| Normal | 🟡 | Yellow (默认) |
| Baixa | 🟢 | Green |

---

## 5. Tags de Identificação

| Tag | Uso |
|---|---|
| `precisa-cliente` | Tarefa que requer ação/aprovação do cliente |
| `seo` | Categoria: auditoria, otimização, relatório SEO |
| `conteúdo` | Categoria: blog post, copy, textos |

---

## 6. Tipos de Tarefa (Categories)

Duas categorias principais, usadas como **Tags**:

- `seo` — todas as tarefas de SEO (auditorias, otimizações, relatórios)
- `conteúdo` — todas as tarefas de conteúdo (blog posts, copies, textos)

---

## 7. Atribuição

**Operação solo:** todas as tarefas são atribuídas ao Osmar (`yours`).

Sem necessidade de configurar Members além do próprio.

---

## 8. Integrações

**Nenhuma integração** — uso básico do ClickUp apenas.

Sem Gmail, Calendar, Drive, Telegram ou Mission Control conectados ao ClickUp neste momento.

---

## 9. Estrutura Detalhada

### Space: Backlog
```
📁 Backlog
 └── 📋 Backlog Geral
      └── Tasks sem cliente definido
```

### Space: Santtas
```
📁 Santtas
 ├── 📋 SEO
 │    └── Tasks: auditorias, otimizações, relatórios, análise de keywords
 └── 📋 Conteúdo
      └── Tasks: blog posts, copies, textos
```

### Space: MGM
```
📁 MGM
 ├── 📋 SEO
 └── 📋 Conteúdo
```

### Space: Liven Casa
```
📁 Liven Casa
 ├── 📋 SEO
 └── 📋 Conteúdo
```

### Space: Operações
```
📁 Operações
 ├── 📋 Admin
 ├── 📋 Financeiro
 └── 📋 Comercial
```

---

## 10. Regras de Uso

1. **Nova task de cliente conhecido** → cria direto na List correta (SEO ou Conteúdo)
2. **Task sem contexto claro** → cria no Backlog Geral primeiro
3. **Task que depende de cliente** → adicionar tag `precisa-cliente`
4. **Prioridade** → definir ao criar (default: Normal)
5. **Revisão** → quando tarefa precisa de double-check antes de marcar Feito
6. **Bloqueado** → quando aguarda fator externo (resposta de cliente, dev, etc.)

---

## 11. Checklist de Implementação

- [ ] Criar Organization "Hoff Consultoria"
- [ ] Criar Space "Backlog" com List "Backlog Geral"
- [ ] Criar Space "Santtas" com Lists "SEO" e "Conteúdo"
- [ ] Criar Space "MGM" com Lists "SEO" e "Conteúdo"
- [ ] Criar Space "Liven Casa" com Lists "SEO" e "Conteúdo"
- [ ] Criar Space "Operações" com Lists "Admin", "Financeiro", "Comercial"
- [ ] Configurar Status workflow: Backlog → Em Progresso → Revisão → Bloqueado → Feito
- [ ] Configurar Prioridades: Alta (🔴), Normal (🟡), Baixa (🟢)
- [ ] Criar Tags: `precisa-cliente`, `seo`, `conteúdo`

---

## 12. Próximos Passos

1. Osmar aprova ou sugere mudanças neste design
2. Se aprovado → criar plano de implementação
3. Implementar estrutura no ClickUp
4. Documentar credenciais de acesso (se necessário)

---

_Last updated: 2026-04-21 19:45 UTC_
