# ClickUp — Hoff Consultoria: Plano de Implementação

> **Para agentes:** Steps usam checkbox (`- [ ]`) para tracking.

**Meta:** Configurar estrutura de tarefas no ClickUp para Hoff Consultoria.

**Stack:** ClickUp (web UI — tudo manual, sem API involved).

---

## Tarefas de Configuração

### Passo 1: Criar Organization

- [ ] Acessar [clickup.com](https://clickup.com) e fazer login/cadastro
- [ ] Criar Organization chamada: `Hoff Consultoria`

---

### Passo 2: Criar Spaces

- [ ] No ClickUp, criar Space: `Backlog`
- [ ] Criar Space: `Santtas`
- [ ] Criar Space: `MGM`
- [ ] Criar Space: `Liven Casa`
- [ ] Criar Space: `Operações`

---

### Passo 3: Configurar Workflow (Status)

Em cada Space, configurar o workflow:

**Status a criar em cada Space:**
```
Backlog
Em Progresso
Revisão
Bloqueado
Feito
```

- [ ] Configurar em `Santtas` (Apply to all lists → Yes)
- [ ] Configurar em `MGM` (Apply to all lists → Yes)
- [ ] Configurar em `Liven Casa` (Apply to all lists → Yes)
- [ ] Configurar em `Operações` (Apply to all lists → Yes)
- [ ] Configurar em `Backlog` (apenas `Backlog` e `Feito` são necessários, mas manter workflow completo)

---

### Passo 4: Criar Lists

**Santtas:**
- [ ] List: `SEO`
- [ ] List: `Conteúdo`

**MGM:**
- [ ] List: `SEO`
- [ ] List: `Conteúdo`

**Liven Casa:**
- [ ] List: `SEO`
- [ ] List: `Conteúdo`

**Operações:**
- [ ] List: `Admin`
- [ ] List: `Financeiro`
- [ ] List: `Comercial`

**Backlog:**
- [ ] List: `Backlog Geral`

---

### Passo 5: Configurar Prioridades

No ClickUp, prioridades já existem por padrão:
```
🔴 Urgent (Red) → renomear para "Alta"
🟡 High (Yellow) → renomear para "Normal"  
🟢 Normal (Green) → renomear para "Baixa"
⚪ Low (Gray) → desabilitar
```

- [ ] Ajustar prioridades na Organization

---

### Passo 6: Criar Tags

**Tags a criar (disponíveis globalmente na org):**
- [ ] Tag: `precisa-cliente` (cor: amarelo)
- [ ] Tag: `seo` (cor: roxo)
- [ ] Tag: `conteúdo` (cor: azul)

---

### Passo 7: Teste de Validação

- [ ] Criar 1 task de teste em `Santtas > SEO` com tag `seo` e prioridade Normal
- [ ] Criar 1 task de teste em `Backlog > Backlog Geral` com tag `precisa-cliente`
- [ ] Mover task pelo workflow: Backlog → Em Progresso → Feito
- [ ] Deletar tasks de teste após validação

---

## Checklist Final

| Item | Status |
|---|---|
| Organization criada | ⬜ |
| 5 Spaces criados | ⬜ |
| Workflow configurado em todos Spaces | ⬜ |
| 13 Lists criadas | ⬜ |
| Prioridades ajustadas | ⬜ |
| 3 Tags criadas | ⬜ |
| Tasks de teste validadas | ⬜ |

---

## Execução

Este é um plano de configuração manual no ClickUp — sem código, sem scripts.

**Você executa manualmente no ClickUp.** Não precisa de mim para isso.

Quando terminar, me avisa que marco como implementado na memória e atualizo o contexto da Hoff.

---

_Plan salvo em: `docs/superpowers/plans/2026-04-21-clickup-hoff-implementation-plan.md`_