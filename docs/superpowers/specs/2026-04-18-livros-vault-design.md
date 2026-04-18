# livros — Sistema de Notas de Leitura

**Data:** 2026-04-18
**Status:** Aprovado

---

## Objetivo

Criar estrutura no Obsidian Vault para catalogar livros lidos e anotações, com acesso da Clara para pesquisa ativa, recomendações contextuais e resumos sob demanda.

---

## Estrutura de Pastas

```
/root/obsidian-vault/
  10-livros/              ← nova pasta principal
    INDEX.md               ← catálogo geral (tabela com todos os livros)
    livros/                ← notas individuais dos livros
      .gitkeep
    autores/               ← notas dos autores
      .gitkeep
```

**Decisão de numeração:** `10-` para ficar após as outras pastas existentes (vai de 00 a 09).

---

## Template — Livro

```markdown
# Livro — [Título]

## Meta
- Autor:: [[Autor]]
- Ano::
- Tags:: #area/tema
- Lido em::
- Status:: 🔄 Lendo | ✅ Lido | 📋 Na fila
- Minha nota:: ★★★★☆

## Por que li
Contexto: ...

## Resumo
Tese central, argumento geral do livro.

## Capítulos / Insights
### [Capítulo 1]
...

## Citações favoritas
> "..."

## Opinião
O que pensei. Críticas, concordância, o que levou de útil.

## Conexões
[[Livro X]] — comparação / complementa / contradiz
```

---

## Template — Autor

```markdown
# Autor — [Nome]

## Bio
Breve, 2-3 linhas.

## Outros livros
- [[Livro A]]
- [[Livro B]]
```

---

## INDEX.md — Catálogo

Tabela com todos os livros cadastrados:

| Título | Autor | Ano | Tags | Nota | Status |
|--------|-------|-----|------|------|--------|
| ... | ... | ... | ... | ... | ... |

Links para cada nota. Atualizado manualmente ao adicionar livros.

---

## Como Clara vai usar

1. **Pesquisa ativa** — Osmar pergunta sobre um livro/autor → Clara procura no vault
2. **Recomendações contextuais** — ao discutir temas, Clara sugere livros do vault relevantes
3. **Resumos sob demanda** — Osmar pede resumo → Clara extrai do INDEX

---

## Implementação

1. Criar pasta `10-livros/` com subpastas `livros/` e `autores/`
2. Criar `INDEX.md` com tabela vazia
3. Osmar começa a adicionar notas manualmente
4. Não requer código — apenas estrutura de arquivos

---

## Pendências

- [ ] Criar estrutura de pastas
- [ ] Criar INDEX.md com template de tabela
- [ ] Osmar adiciona primeiro livro
