import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'tasks.db');

export function getDb() {
  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  return db;
}

// ─── Clients ───────────────────────────────────────────────────────────────

export interface Client {
  id?: number;
  name: string;
  company?: string;
  domain: string;
  niche?: string;
  monthly_clicks_goal?: number;
  monthly_leads_goal?: number;
  main_keywords?: string;
  competitors?: string;
  created_at?: string;
  updated_at?: string;
}

export function getAllClients(): Client[] {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM clients ORDER BY name ASC').all() as Client[];
  db.close();
  return rows;
}

export function getClientById(id: number): Client | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM clients WHERE id = ?').get(id) as Client | undefined;
  db.close();
  return row ?? null;
}

export function createClient(data: Omit<Client, 'id' | 'created_at' | 'updated_at'>): number {
  const db = getDb();
  const result = db.prepare(`
    INSERT INTO clients (name, company, domain, niche, monthly_clicks_goal, monthly_leads_goal, main_keywords, competitors)
    VALUES (@name, @company, @domain, @niche, @monthly_clicks_goal, @monthly_leads_goal, @main_keywords, @competitors)
  `).run(data);
  db.close();
  return result.lastInsertRowid as number;
}

export function updateClient(id: number, data: Partial<Client>): boolean {
  const db = getDb();
  const fields = Object.keys(data).filter(k => k !== 'id' && k !== 'created_at');
  if (!fields.length) return false;
  const setClause = fields.map(f => `${f} = @${f}`).join(', ');
  const result = db.prepare(`UPDATE clients SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = @id`).run({ ...data, id });
  db.close();
  return result.changes > 0;
}

export function deleteClient(id: number): boolean {
  const db = getDb();
  const result = db.prepare('DELETE FROM clients WHERE id = ?').run(id);
  db.close();
  return result.changes > 0;
}

// ─── GSC Daily ────────────────────────────────────────────────────────────

export interface GscDaily {
  client_id: number;
  date: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export function importGscDaily(clientId: number, rows: Omit<GscDaily, 'client_id'>[]): number {
  const db = getDb();
  const insert = db.prepare(`
    INSERT OR REPLACE INTO gsc_daily (client_id, date, clicks, impressions, ctr, position)
    VALUES (@client_id, @date, @clicks, @impressions, @ctr, @position)
  `);
  const insertMany = db.transaction((rows: Omit<GscDaily, 'client_id'>[]) => {
    for (const row of rows) insert.run({ client_id: clientId, ...row });
    return rows.length;
  });
  const count = insertMany(rows);
  db.close();
  return count;
}

export function getGscDaily(clientId: number, from?: string, to?: string): GscDaily[] {
  const db = getDb();
  let sql = 'SELECT * FROM gsc_daily WHERE client_id = ?';
  const params: (string | number)[] = [clientId];
  if (from) { sql += ' AND date >= ?'; params.push(from); }
  if (to) { sql += ' AND date <= ?'; params.push(to); }
  sql += ' ORDER BY date ASC';
  const rows = db.prepare(sql).all(...params) as GscDaily[];
  db.close();
  return rows;
}

export function getGscMonthly(clientId: number, from?: string, to?: string) {
  const db = getDb();
  let sql = `
    SELECT
      strftime('%Y-%m', date) as month,
      SUM(clicks) as clicks,
      SUM(impressions) as impressions,
      AVG(ctr) as ctr,
      AVG(position) as position
    FROM gsc_daily
    WHERE client_id = ?
  `;
  const params: (string | number)[] = [clientId];
  if (from) { sql += ' AND date >= ?'; params.push(from); }
  if (to) { sql += ' AND date <= ?'; params.push(to); }
  sql += ' GROUP BY strftime(\'%Y-%m\', date) ORDER BY month ASC';
  const rows = db.prepare(sql).all(...params);
  db.close();
  return rows;
}

// ─── GSC Queries ─────────────────────────────────────────────────────────

export interface GscQuery {
  client_id: number;
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  period_start?: string;
  period_end?: string;
}

export function importGscQueries(clientId: number, rows: Omit<GscQuery, 'client_id'>[], periodStart?: string, periodEnd?: string): number {
  const db = getDb();
  // Clear old queries for same period
  if (periodStart && periodEnd) {
    db.prepare('DELETE FROM gsc_queries WHERE client_id = ? AND period_start = ? AND period_end = ?').run(clientId, periodStart, periodEnd);
  }
  const insert = db.prepare(`
    INSERT INTO gsc_queries (client_id, query, clicks, impressions, ctr, position, period_start, period_end)
    VALUES (@client_id, @query, @clicks, @impressions, @ctr, @position, @period_start, @period_end)
  `);
  const insertMany = db.transaction((rows: Omit<GscQuery, 'client_id'>[]) => {
    for (const row of rows) insert.run({ client_id: clientId, ...row, period_start: periodStart ?? null, period_end: periodEnd ?? null });
    return rows.length;
  });
  const count = insertMany(rows);
  db.close();
  return count;
}

export function getGscQueries(clientId: number, limit = 50, periodStart?: string, periodEnd?: string): GscQuery[] {
  const db = getDb();
  let sql = 'SELECT * FROM gsc_queries WHERE client_id = ?';
  const params: (string | number)[] = [clientId];
  if (periodStart) { sql += ' AND period_start >= ?'; params.push(periodStart); }
  if (periodEnd) { sql += ' AND period_end <= ?'; params.push(periodEnd); }
  sql += ' ORDER BY clicks DESC LIMIT ?';
  params.push(limit);
  const rows = db.prepare(sql).all(...params) as GscQuery[];
  db.close();
  return rows;
}

// ─── GSC Pages ────────────────────────────────────────────────────────────

export interface GscPage {
  client_id: number;
  url: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  period_start?: string;
  period_end?: string;
}

export function importGscPages(clientId: number, rows: Omit<GscPage, 'client_id'>[], periodStart?: string, periodEnd?: string): number {
  const db = getDb();
  if (periodStart && periodEnd) {
    db.prepare('DELETE FROM gsc_pages WHERE client_id = ? AND period_start = ? AND period_end = ?').run(clientId, periodStart, periodEnd);
  }
  const insert = db.prepare(`
    INSERT INTO gsc_pages (client_id, url, clicks, impressions, ctr, position, period_start, period_end)
    VALUES (@client_id, @url, @clicks, @impressions, @ctr, @position, @period_start, @period_end)
  `);
  const insertMany = db.transaction((rows: Omit<GscPage, 'client_id'>[]) => {
    for (const row of rows) insert.run({ client_id: clientId, ...row, period_start: periodStart ?? null, period_end: periodEnd ?? null });
    return rows.length;
  });
  const count = insertMany(rows);
  db.close();
  return count;
}

export function getGscPages(clientId: number, limit = 50, periodStart?: string, periodEnd?: string): GscPage[] {
  const db = getDb();
  let sql = 'SELECT * FROM gsc_pages WHERE client_id = ?';
  const params: (string | number)[] = [clientId];
  if (periodStart) { sql += ' AND period_start >= ?'; params.push(periodStart); }
  if (periodEnd) { sql += ' AND period_end <= ?'; params.push(periodEnd); }
  sql += ' ORDER BY clicks DESC LIMIT ?';
  params.push(limit);
  const rows = db.prepare(sql).all(...params) as GscPage[];
  db.close();
  return rows;
}

// ─── Data Imports ─────────────────────────────────────────────────────────

export function logImport(clientId: number, importType: string, periodStart?: string, periodEnd?: string, rowsImported = 0) {
  const db = getDb();
  db.prepare(`
    INSERT INTO data_imports (client_id, import_type, period_start, period_end, rows_imported)
    VALUES (?, ?, ?, ?, ?)
  `).run(clientId, importType, periodStart ?? null, periodEnd ?? null, rowsImported);
  db.close();
}

export function getImports(clientId: number) {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM data_imports WHERE client_id = ? ORDER BY created_at DESC').all(clientId);
  db.close();
  return rows;
}

export function getLastImport(clientId: number, importType: string) {
  const db = getDb();
  const row = db.prepare(`
    SELECT * FROM data_imports WHERE client_id = ? AND import_type = ?
    ORDER BY created_at DESC LIMIT 1
  `).get(clientId, importType);
  db.close();
  return row;
}

// ─── Keywords ────────────────────────────────────────────────────────────

export interface Keyword {
  id?: number;
  client_id: number;
  keyword: string;
  initial_position?: number;
  initial_month?: string;
  created_at?: string;
}

export interface KeywordMonthly {
  keyword_id: number;
  month: string;
  position: number;
}

export function getKeywords(clientId: number): (Keyword & { latest_position?: number; latest_month?: string; monthly?: KeywordMonthly[] })[] {
  const db = getDb();
  const keywords = db.prepare('SELECT * FROM keywords WHERE client_id = ? ORDER BY keyword ASC').all(clientId) as Keyword[];
  const result = keywords.map(kw => {
    const monthly = db.prepare('SELECT * FROM keyword_monthly WHERE keyword_id = ? ORDER BY month ASC').all(kw.id) as KeywordMonthly[];
    const last = monthly.length > 0 ? monthly[monthly.length - 1] : null;
    return { ...kw, monthly, latest_position: last?.position, latest_month: last?.month };
  });
  db.close();
  return result;
}

export function createKeyword(clientId: number, keyword: string, initialPosition?: number, initialMonth?: string): number {
  const db = getDb();
  const result = db.prepare('INSERT INTO keywords (client_id, keyword, initial_position, initial_month) VALUES (?, ?, ?, ?)')
    .run(clientId, keyword, initialPosition ?? null, initialMonth ?? null);
  db.close();
  return result.lastInsertRowid as number;
}

export function deleteKeyword(id: number): boolean {
  const db = getDb();
  const result = db.prepare('DELETE FROM keywords WHERE id = ?').run(id);
  db.close();
  return result.changes > 0;
}

export function addKeywordPosition(keywordId: number, month: string, position: number): void {
  const db = getDb();
  db.prepare('INSERT OR REPLACE INTO keyword_monthly (keyword_id, month, position) VALUES (?, ?, ?)')
    .run(keywordId, month, position);
  db.close();
}

export function deleteKeywordPosition(keywordId: number, month: string): boolean {
  const db = getDb();
  const result = db.prepare('DELETE FROM keyword_monthly WHERE keyword_id = ? AND month = ?').run(keywordId, month);
  db.close();
  return result.changes > 0;
}
