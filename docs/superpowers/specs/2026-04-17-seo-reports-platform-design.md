# SEO Reports Platform — Design

_Criado: 2026-04-16 | Atualizado: 2026-04-16 | Status: Aprovado_

---

## Visão Geral

Sistema de gestão de relatórios SEO mensal por cliente. O Osmar exporta CSVs do GSC mensalmente, importa no Mission Control, e gera relatórios HTML agregados.

---

## Fontes de Dados

### 1. GSC Tráfego Diário
**CSV:** `Performance on Search` (Gráfico 2)
**Colunas:** `Data`, `Cliques`, `Impressões`, `CTR`, `Posição`
**Periodicidade:** diário
**Armazenamento:** `gsc_daily`

### 2. GSC Queries
**CSV:** `Consultas`
**Colunas:** `Top consultas`, `Cliques`, `Impressões`, `CTR`, `Posição`
**Periodicidade:** mensal (acumulado)
**Armazenamento:** `gsc_queries`

### 3. GSC Pages
**CSV:** `Páginas`
**Colunas:** `Páginas principais` (URL completa), `Cliques`, `Impressões`, `CTR`, `Posição`
**Periodicidade:** mensal (acumulado)
**Armazenamento:** `gsc_pages`

### 4. Ranking Tool (futuro)
**Estrutura:** a definir quando CSV estiver disponível

---

## Estrutura do Banco (SQLite)

### Tabela: `clients`
```sql
CREATE TABLE clients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  company TEXT,
  domain TEXT NOT NULL,
  niche TEXT,
  monthly_clicks_goal INTEGER,
  monthly_leads_goal INTEGER,
  main_keywords TEXT,  -- comma-separated
  competitors TEXT,   -- comma-separated
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Tabela: `gsc_daily`
```sql
CREATE TABLE gsc_daily (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id INTEGER NOT NULL REFERENCES clients(id),
  date DATE NOT NULL,
  clicks INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  ctr REAL DEFAULT 0,
  position REAL DEFAULT 0,
  UNIQUE(client_id, date)
);
```

### Tabela: `gsc_queries`
```sql
CREATE TABLE gsc_queries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id INTEGER NOT NULL REFERENCES clients(id),
  query TEXT NOT NULL,
  clicks INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  ctr REAL DEFAULT 0,
  position REAL DEFAULT 0,
  period_start DATE,
  period_end DATE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Tabela: `gsc_pages`
```sql
CREATE TABLE gsc_pages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id INTEGER NOT NULL REFERENCES clients(id),
  url TEXT NOT NULL,
  clicks INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  ctr REAL DEFAULT 0,
  position REAL DEFAULT 0,
  period_start DATE,
  period_end DATE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Tabela: `imports`
```sql
CREATE TABLE imports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id INTEGER NOT NULL REFERENCES clients(id),
  import_type TEXT NOT NULL,  -- 'gsc_daily', 'gsc_queries', 'gsc_pages', 'ranking'
  period_start DATE,
  period_end DATE,
  rows_imported INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## Páginas do Mission Control

### `/clients` — Gestão de Clientes
- Lista todos os clientes
- Adicionar / editar / remover cliente
- Ver resumo: último período importado, total de cliques

### `/clients/[id]` — Detalhe do Cliente
- Dados cadastrais
- Lista de imports feitos
- Botão: gerar relatório

### `/clients/[id]/import` — Importação de CSV
- Seleciona tipo de dados (Tráfego / Queries / Pages)
- Upload de CSV
- Preview: mostra primeiras 5 linhas
- Confirmação: importa para o banco
- Bloqueia se dados do período já existirem (evita duplicação)

### `/clients/[id]/reports` — Relatórios
- Seleciona período (data inicial / data final)
- Seleciona tipo de relatório
- Preview inline
- Exporta HTML

---

## Tipos de Relatório

### 1. Tráfego Mensal
- KPI: cliques total, impressões, CTR, posição
- Gráfico: cliques por dia
- Comparativo: mesmo período ano anterior (YoY)
- Tabela mensal resumida

### 2. Queries Top
- Top 20 queries por cliques
- Posição e CTR de cada query
- Queries que mais cresceram

### 3. Pages Top
- Top 20 páginas por cliques
- Posição e CTR de cada página

### 4. Comparativo
- Ano atual vs ano anterior (mesmo período)
- Crescimento em %

---

## Stack

- **Banco:** SQLite (já usado pelo Mission Control)
- **Backend:** Next.js API Routes (já existente)
- **Frontend:** Next.js Pages (reusekanban已有的 componentes)
- **CSV Parsing:** papaparse ou csv-parse
- **Gráficos:** Chart.js (já usado nos relatórios)

---

## Implementação — Ordem

1. [ ] Criar schema do banco (tabelas clients, gsc_daily, gsc_queries, gsc_pages, imports)
2. [ ] CRUD de clientes (`/clients`)
3. [ ] Página de importação com preview de CSV
4. [ ] Script de parse e importação (API route)
5. [ ] Página de relatórios com seletor de período
6. [ ] Template HTML do relatório (baseado no Santtas)
7. [ ] Geração de relatório agregados
8. [ ] Testar com dados reais do Santtas

---

## Notas

- Dados de ranking tool serão adicionados quando CSV estiver disponível
- Relatório inicial: HTML estático (mesmo padrão visual do Santtas)
- Autenticação: mesma do Mission Control (already protected by Tailscale)
- Armazenamento de CSVs: não necessário — só o parsed vai pro banco
