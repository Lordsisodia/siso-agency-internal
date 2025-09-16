import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface ExecuteSqlParams {
  query: string;
  params?: Record<string, any>;
  readOnly?: boolean;
}

export class SupabaseMCPClient {
  private client: SupabaseClient;
  private allowedTables: Set<string> = new Set([
    'users',
    'light_work_tasks',
    'light_work_subtasks',
    'deep_work_tasks',
    'deep_work_subtasks',
    'morning_routine_tasks',
    'daily_reflections',
  ]);

  constructor() {
    const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const anon = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
    if (!url || !anon) {
      throw new Error('Supabase credentials not set (SUPABASE_URL and SUPABASE_ANON_KEY).');
    }
    this.client = createClient(url, anon);
  }

  /**
   * Minimal, read-only SQL executor. Only supports SELECT from allowlisted tables with optional
   * simple WHERE (eq) and LIMIT. Example:
   *   SELECT id, email FROM users WHERE supabase_id = 'prisma-user-123' LIMIT 5
   */
  async executeSql(params: ExecuteSqlParams): Promise<any[]> {
    const { query } = params || {};
    if (!query || typeof query !== 'string') throw new Error('Query is required');

    // Enforce read-only at this layer as well
    if (/^\s*(INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|TRUNCATE)\b/i.test(query)) {
      throw new Error('Only SELECT statements are allowed');
    }

    const parsed = this.parseSelect(query);
    if (!parsed) throw new Error('Unsupported SELECT format');

    const { table, columns, where, limit } = parsed;
    if (!this.allowedTables.has(table)) {
      throw new Error(`Table not allowed: ${table}`);
    }

    // Build query
    let qb = this.client.from(table).select(columns || '*');

    if (where.length) {
      for (const cond of where) {
        // eq only
        qb = (qb as any).eq(cond.column, cond.value);
      }
    }

    if (typeof limit === 'number') {
      qb = qb.limit(limit);
    }

    const { data, error } = await qb;
    if (error) throw error;
    return (data || []) as any[];
  }

  private parseSelect(sql: string): null | {
    table: string;
    columns: string | undefined;
    where: Array<{ column: string; value: string | number }>;
    limit?: number;
  } {
    const s = sql.trim().replace(/;\s*$/, '');
    const m = s.match(/^select\s+(.+?)\s+from\s+([a-zA-Z0-9_]+)(?:\s+where\s+(.+?))?(?:\s+limit\s+(\d+))?$/i);
    if (!m) return null;
    const [, colsRaw, table, whereRaw, limitRaw] = m;
    const columns = colsRaw.trim() === '*' ? '*' : colsRaw.trim();
    const where: Array<{ column: string; value: string | number }> = [];

    if (whereRaw) {
      // Check for unsupported OR conditions
      if (/\s+or\s+/i.test(whereRaw)) {
        return null; // Unsupported OR condition
      }
      // Support simple "col = value" AND chains
      const parts = whereRaw.split(/\s+and\s+/i).map((p) => p.trim());
      for (const p of parts) {
        const mm = p.match(/^([a-zA-Z0-9_]+)\s*=\s*(.+)$/);
        if (!mm) return null; // unsupported
        const col = mm[1];
        let valRaw = mm[2].trim();
        // Strip quotes
        if ((valRaw.startsWith("'") && valRaw.endsWith("'")) || (valRaw.startsWith('"') && valRaw.endsWith('"'))) {
          valRaw = valRaw.slice(1, -1);
        }
        // number?
        const num = Number(valRaw);
        const value = Number.isFinite(num) && String(num) === valRaw ? num : valRaw;
        where.push({ column: col, value });
      }
    }

    const limit = limitRaw ? parseInt(limitRaw, 10) : undefined;
    return { table, columns: columns === '*' ? undefined : columns, where, limit };
  }
}

export default SupabaseMCPClient;

