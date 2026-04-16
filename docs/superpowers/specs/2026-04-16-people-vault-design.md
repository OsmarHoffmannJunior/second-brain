# People Vault — Obsidian + OpenClaw Integration

**Data:** 2026-04-16
**Autor:** Clara
**Status:** Aprovado

---

## Objetivo

Transformar o cadastro de pessoas do OpenClaw (people.md) em uma estrutura Obsidian que permita tanto referência rápida quanto anotações detalhadas. Cada pessoa tem um arquivo individual rico, e um INDEX central faz a porta de entrada.

---

## Estrutura de Arquivos

```
05-memory/people/
  INDEX.md                                   ← porta de entrada
  andreia-grasiele-de-oliveira-hoffmann.md    ← esposa do Osmar
  odete-solange-dos-santos-hoffmann.md        ← mãe do Osmar
  osmar-hoffmann.md                           ← pai do Osmar
  victor-lima.md                               ← dev Laravel Santtas
```

---

## INDEX.md — Porta de Entrada

```markdown
---
title: People Index
tags: [people, index]
---

# Pessoas — Índice

| Nome | Relação | Aniversário | Tags |
|------|---------|-------------|------|
| [[andreia-grasiele-de-oliveira-hoffmann|Andreia Grasiele]] | Esposa do Osmar | 17/06 | #familia #pessoal |
| [[odete-solange-dos-santos-hoffmann|Odete Solange]] | Mãe do Osmar | — | #familia |
| [[osmar-hoffmann|Osmar Hoffmann]] | Pai do Osmar | — | #familia |
| [[victor-lima|Victor Lima]] | Dev Laravel | — | #equipe #dev |

## Links
- [[people/INDEX|Voltar ao índice]]
- [[05-memory/people/INDEX|Índice completo]]
```

---

## Formato do Arquivo Individual

Frontmatter YAML + conteúdo markdown estruturado:

```yaml
---
nome: Andreia Grasiele de Oliveira Hoffmann
relacao: Esposa do Osmar
aniversario: 17/06/1991
instagram: https://www.instagram.com/andreiahof/
tags: [familia, pessoal]
criado: 2026-04-16
ultimaAtualizacao: 2026-04-16
---

## Dados Pessoais

| Campo | Valor |
|-------|-------|
| Nome completo | Andreia Grasiele de Oliveira Hoffmann |
| Aniversário | 17/06/1991 |
| Instagram | [andreiahof](https://www.instagram.com/andreiahof/) |
| Relação | Esposa do Osmar |

## Notas

- Casada com Osmar Hoffmann Junior
- Criada em Itapema/SC

## Histórico

| Data | Evento |
|------|--------|
| 2026-04-16 | Cadastrada no sistema |
```

---

## Sincronização — OpenClaw ↔ Obsidian

| Direção | Fonte | Destino | Mecanismo |
|---------|-------|---------|-----------|
| OpenClaw → Obsidian | `memory/context/people.md` | `05-memory/people/` | Sync script a cada 15min |
| Obsidian → OpenClaw | Anotações manuais | `memory/context/people.md` | Manual ou próximo sync |

---

## Interligação

- **INDEX.md** linka para cada arquivo individual via `[[wikilink]]`
- **Arquivos individuais** linkam de volta para `[[INDEX|people/INDEX]]`
- **people.md do OpenClaw** é a fonte primária (tabela simples)
- **Arquivos Obsidian** são a fonte rica (anotações detalhadas)
- **memory_search** busca em ambos — contexto rápido na tabela, detalhes nos arquivos

---

## Tags usadas

| Tag | Uso |
|-----|-----|
| #familia | Pessoas da família Osmar |
| #pessoal | Contacts pessoais |
| #equipe | Pessoas da equipe/projetos |
| #dev | Desenvolvedores |
| #cliente | Clientes |
| #parceiro | Parceiros de negócio |

---

## Estratégia de Migração

1. Criar pasta `05-memory/people/`
2. Gerar INDEX.md com links vazios primeiro
3. Criar arquivos individuais a partir do people.md atual
4. Adicionar campos enriquecidos (historico, preferências, contexto)
5. Atualizar sync-memory.sh para entender estrutura people/

---

_Last updated: 2026-04-16_