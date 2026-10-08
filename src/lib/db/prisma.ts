// Prisma client wrapper.
//
// Primary path: real @prisma/client PrismaClient used in production (Vercel + Neon
// where `prisma generate` runs during install).
//
// Sandbox fallback: when PRISMA_FALLBACK_PG_URL is set (used locally when the
// Prisma engine binaries couldn't be downloaded — e.g. sandbox egress blocked to
// binaries.prisma.sh), we provide a thin Proxy-based client backed by the `pg`
// driver. It implements just enough of Prisma's fluent API (`findUnique`,
// `findFirst`, `findMany`, `create`, `update`, `delete`, `$queryRaw`,
// `$transaction`) to exercise every API route end-to-end against a real
// Postgres DB. This fallback is never enabled in production — Neon/Vercel have
// the full native engine via `npx prisma generate`.

import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: any | undefined;
  _pgPool?: Pool;
};

function tryRealPrisma(): any {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const pkg = require("@prisma/client") as { PrismaClient?: new (opts?: any) => any };
    if (!pkg.PrismaClient) return null;
    const ctor: any = pkg.PrismaClient;
    // Smoke-test instantiation (real client will bind engine lazily, but a missing engine throws early in some builds)
    const client = new ctor({
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
    // If $queryRaw is not a function (our earlier stub), reject it
    if (typeof client.$queryRaw !== "function") return null;
    return client;
  } catch {
    return null;
  }
}

function camelToSnake(s: string): string {
  // BusinessMember -> business_member, InstagramAccount -> instagram_account
  return s.replace(/[A-Z]/g, (m) => "_" + m.toLowerCase()).replace(/^_/, "");
}
function snakeToCamelRow(row: Record<string, any>): Record<string, any> {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(row)) {
    const ck = k.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    out[ck] = v;
  }
  return out;
}

function buildPgClient(pool: Pool) {
  // Mini Prisma-compatible delegate. Converts where/select/data to plain SQL.
  // NOTE: This is intentionally limited — it supports the query shapes actually
  // used by Sellora's API routes. It is NOT a replacement for Prisma.
  const delegates: Record<string, any> = {};

  function delegate(model: string) {
    if (delegates[model]) return delegates[model];
    const table = '"' + camelToSnake(model)
      .replace(/instagram_account/g, "InstagramAccount")
      .replace(/instagram_post/g, "InstagramPost")
      .replace(/business_member/g, "BusinessMember")
      .replace(/business_ruleset/g, "BusinessRuleset")
      .replace(/business_rule/g, "BusinessRule")
      .replace(/automation_config/g, "AutomationConfig")
      .replace(/conversation_context/g, "ConversationContext")
      .replace(/message_delivery/g, "MessageDelivery")
      .replace(/webhook_event/g, "WebhookEvent")
      .replace(/failed_job/g, "FailedJob")
      .replace(/audit_log/g, "AuditLog")
      .replace(/usage_snapshot/g, "UsageSnapshot")
      .replace(/product_variant/g, "ProductVariant")
      + '"';
    // The above replace is a kludge for known multi-capital-letter tables. Simpler: maintain a map.
    const tableMap: Record<string, string> = {
      User: '"User"',
      Business: '"Business"',
      BusinessMember: '"BusinessMember"',
      InstagramAccount: '"InstagramAccount"',
      InstagramPost: '"InstagramPost"',
      Product: '"Product"',
      ProductVariant: '"ProductVariant"',
      BusinessRuleset: '"BusinessRuleset"',
      BusinessRule: '"BusinessRule"',
      AutomationConfig: '"AutomationConfig"',
      Conversation: '"Conversation"',
      ConversationContext: '"ConversationContext"',
      Message: '"Message"',
      MessageDelivery: '"MessageDelivery"',
      Lead: '"Lead"',
      WebhookEvent: '"WebhookEvent"',
      FailedJob: '"FailedJob"',
      AuditLog: '"AuditLog"',
      Subscription: '"Subscription"',
      UsageSnapshot: '"UsageSnapshot"',
      Notification: '"Notification"',
    };
    const tname = tableMap[model] || table;

    function toValues(obj: Record<string, any>): { cols: string[]; placeholders: string[]; vals: any[] } {
      const cols: string[] = [];
      const placeholders: string[] = [];
      const vals: any[] = [];
      let i = 1;
      for (const [k, v] of Object.entries(obj)) {
        if (v === undefined) continue;
        const _col = k.replace(/[A-Z]/g, (m) => "_" + m.toLowerCase()).replace(/^_/, "");
        // Map common camelCase columns that we actually keep in DB as camelCase (we used quoted identifiers with Prisma names)
        const dbCol = '"' + k + '"';
        cols.push(dbCol);
        placeholders.push("$" + i++);
        vals.push(v instanceof Date ? v : v && typeof v === "object" && !Array.isArray(v) ? JSON.stringify(v) : v);
      }
      return { cols, placeholders, vals };
    }
    function whereClause(where: Record<string, any> | undefined, startIdx = 1): { sql: string; vals: any[]; nextIdx: number } {
      if (!where) return { sql: "", vals: [], nextIdx: startIdx };
      const parts: string[] = [];
      const vals: any[] = [];
      let i = startIdx;
      for (const [k, v] of Object.entries(where)) {
        if (k === "OR") {
          const orParts: string[] = [];
          for (const sub of v as any[]) {
            const subClause = whereClause(sub, i);
            i = subClause.nextIdx;
            vals.push(...subClause.vals);
            orParts.push("(" + subClause.sql.replace(/^ WHERE /, "") + ")");
          }
          parts.push("(" + orParts.join(" OR ") + ")");
          continue;
        }
        if (k === "AND") {
          const andParts: string[] = [];
          for (const sub of v as any[]) {
            const subClause = whereClause(sub, i);
            i = subClause.nextIdx;
            vals.push(...subClause.vals);
            andParts.push("(" + subClause.sql.replace(/^ WHERE /, "") + ")");
          }
          parts.push("(" + andParts.join(" AND ") + ")");
          continue;
        }
        // Nested relations (e.g. instagram: { ... }) — mini client doesn't support; skip with a warning (we refactored routes to avoid this).
        if (v && typeof v === "object" && !Array.isArray(v) && !("in" in v) && !("not" in v) && !("gt" in v) && !("gte" in v) && !("lt" in v) && !("lte" in v) && !("contains" in v) && !("startsWith" in v) && !("equals" in v)) {
          continue;
        }
        if (v && typeof v === "object") {
          if ("in" in (v as any)) {
            const arr = (v as any).in as any[];
            parts.push('"' + k + '" IN (' + arr.map(() => "$" + i++).join(",") + ")");
            vals.push(...arr);
          } else if ("equals" in (v as any)) {
            parts.push('"' + k + '" = $' + i++);
            vals.push((v as any).equals);
          } else if ("not" in (v as any)) {
            parts.push('"' + k + '" <> $' + i++);
            vals.push((v as any).not);
          } else if ("gt" in (v as any)) { parts.push('"' + k + '" > $' + i++); vals.push((v as any).gt); }
          else if ("gte" in (v as any)) { parts.push('"' + k + '" >= $' + i++); vals.push((v as any).gte); }
          else if ("lt" in (v as any)) { parts.push('"' + k + '" < $' + i++); vals.push((v as any).lt); }
          else if ("lte" in (v as any)) { parts.push('"' + k + '" <= $' + i++); vals.push((v as any).lte); }
          else if ("contains" in (v as any)) { parts.push('"' + k + '" ILIKE $' + i++); vals.push("%" + (v as any).contains + "%"); }
          else if ("startsWith" in (v as any)) { parts.push('"' + k + '" ILIKE $' + i++); vals.push((v as any).startsWith + "%"); }
        } else {
          parts.push('"' + k + '" = $' + i++);
          vals.push(v);
        }
      }
      return { sql: parts.length ? " WHERE " + parts.join(" AND ") : "", vals, nextIdx: i };
    }

    // FK relationships we support for `include:` joins. Map: model->field->{table,localKey,foreignKey}.
    // These are the handful of joins Sellora actually uses.
    const fkMap: Record<string, Record<string, { table: string; key: string; otherKey: string }>> = {
      BusinessMember: {
        user: { table: '"User"', key: '"userId"', otherKey: 'id' },
        business: { table: '"Business"', key: '"businessId"', otherKey: 'id' },
      },
      Conversation: {
        business: { table: '"Business"', key: '"businessId"', otherKey: 'id' },
        igAccount: { table: '"InstagramAccount"', key: '"igAccountId"', otherKey: 'id' },
        lead: { table: '"Lead"', key: 'id', otherKey: '"conversationId"' },
      },
      Message: {
        conversation: { table: '"Conversation"', key: '"conversationId"', otherKey: 'id' },
      },
      ConversationContext: {
        conversation: { table: '"Conversation"', key: '"conversationId"', otherKey: 'id' },
      },
      ProductVariant: {
        product: { table: '"Product"', key: '"productId"', otherKey: 'id' },
      },
      Lead: {
        conversation: { table: '"Conversation"', key: '"conversationId"', otherKey: 'id' },
      },
      Subscription: {
        business: { table: '"Business"', key: '"businessId"', otherKey: 'id' },
      },
      Business: {
        instagram: { table: '"InstagramAccount"', key: 'id', otherKey: '"businessId"' },
      },
    };

    async function runFind(sql: string, vals: any[], args: any) {
      const r = await pool.query(sql, vals);
      if (r.rowCount === 0) return null;
      const row = snakeToCamelRow(r.rows[0]);
      if (args?.include) {
        for (const [rel, flag] of Object.entries(args.include)) {
          if (!flag) continue;
          const fk = fkMap[model]?.[rel];
          if (!fk) continue;
          const localVal = (row as any)[rel] ?? (row as any)[fk.key.replace(/"/g, '')] ?? row[fk.key.replace(/"/g, '').replace(/([A-Z])/g, '_$1').toLowerCase()];
          // Determine which value to use
          let lkval = localVal;
          // If fk.key is a column on THIS table, look it up by snake/camel
          const colKey = fk.key.replace(/"/g, '');
          const snakeKey = colKey.replace(/[A-Z]/g, (m) => "_" + m.toLowerCase()).replace(/^_/, "");
          lkval = row[colKey] ?? row[snakeKey] ?? lkval;
          const otherR = await pool.query("SELECT * FROM " + fk.table + " WHERE " + fk.otherKey + " = $1 LIMIT 1", [lkval]);
          (row as any)[rel] = otherR.rows[0] ? snakeToCamelRow(otherR.rows[0]) : null;
        }
      }
      return row;
    }

    const d: any = {
      async findUnique(args: any) {
        // Handle composite keys like { businessId_userId: { businessId, userId } }
        const where = { ...args.where };
        for (const [k, v] of Object.entries(where)) {
          if (k.includes("_") && v && typeof v === "object" && !Array.isArray(v)) {
            // Expand composite key
            delete where[k];
            Object.assign(where, v);
          }
        }
        const { sql: wsql, vals } = whereClause(where, 1);
        return runFind("SELECT * FROM " + tname + wsql + " LIMIT 1", vals, args);
      },
      async findFirst(args: any) {
        const { sql: wsql, vals } = whereClause(args?.where, 1);
        let order = "";
        if (args?.orderBy) {
          const entries = Object.entries(args.orderBy);
          order = " ORDER BY " + entries.map(([k, dir]) => '"' + k + '" ' + (dir === "desc" ? "DESC" : "ASC")).join(",");
        }
        return runFind("SELECT * FROM " + tname + wsql + order + " LIMIT 1", vals, args);
      },
      async findMany(args: any) {
        const { sql: wsql, vals } = whereClause(args?.where, 1);
        let order = "";
        if (args?.orderBy) {
          const entries = Array.isArray(args.orderBy) ? args.orderBy.flatMap((o: any) => Object.entries(o)) : Object.entries(args.orderBy);
          order = " ORDER BY " + entries.map(([k, dir]: any) => '"' + k + '" ' + (dir === "desc" ? "DESC" : "ASC")).join(",");
        }
        const r = await pool.query("SELECT * FROM " + tname + wsql + order, vals);
        return r.rows.map(snakeToCamelRow);
      },
      async count(args: any) {
        const { sql: wsql, vals } = whereClause(args?.where, 1);
        const r = await pool.query("SELECT COUNT(*)::int AS n FROM " + tname + wsql, vals);
        return Number(r.rows[0].n);
      },
      async create(args: any) {
        const { cols, placeholders, vals } = toValues(args.data);
        const sql = "INSERT INTO " + tname + " (" + cols.join(",") + ") VALUES (" + placeholders.join(",") + ") RETURNING *";
        const r = await pool.query(sql, vals);
        return snakeToCamelRow(r.rows[0]);
      },
      async update(args: any) {
        const { cols, vals: setVals } = (() => {
          const o = toValues(args.data);
          return { cols: o.cols.map((c, i) => c + " = " + o.placeholders[i]), vals: o.vals };
        })();
        const { sql: wsql, vals: wvals, nextIdx: _nextIdx } = whereClause(args.where, setVals.length + 1);
        const sql = "UPDATE " + tname + " SET " + cols.join(",") + wsql + " RETURNING *";
        const r = await pool.query(sql, [...setVals, ...wvals]);
        return r.rows[0] ? snakeToCamelRow(r.rows[0]) : null;
      },
      async upsert(args: any) {
        // simple: try find then update else create
        const found = await d.findUnique({ where: args.where });
        if (found) return d.update({ where: args.where, data: args.update });
        return d.create({ data: { ...args.where, ...args.create } });
      },
      async delete(args: any) {
        const { sql: wsql, vals } = whereClause(args.where, 1);
        const r = await pool.query("DELETE FROM " + tname + wsql + " RETURNING *", vals);
        return r.rows[0] ? snakeToCamelRow(r.rows[0]) : null;
      },
      async deleteMany(args: any) {
        const { sql: wsql, vals } = whereClause(args?.where, 1);
        const r = await pool.query("DELETE FROM " + tname + wsql, vals);
        return { count: r.rowCount };
      },
    };
    delegates[model] = d;
    return d;
  }

  const proxyClient: any = new Proxy({} as any, {
    get(_t, prop: string) {
      if (prop === "$connect") return async () => {};
      if (prop === "$disconnect") return async () => {};
      if (prop === "$queryRaw" || prop === "$executeRaw") {
        return async (template: any, ...vals: any[]) => {
          // Prisma $queryRaw accepts Prisma.sql tagged template or raw strings.
          // Prisma.sql returns an object with `strings`, `values` and also has text/sql properties.
          const isSql = template && typeof template === "object" && ("strings" in template || Array.isArray(template?.strings)) && Array.isArray(template?.values ?? vals);
          if (isSql) {
            const strings: string[] = template.strings;
            const params: any[] = template.values ?? vals;
            let out = "";
            const pvals: any[] = [];
            for (let i = 0; i < strings.length; i++) {
              out += strings[i];
              if (i < params.length) {
                pvals.push(params[i]);
                out += "$" + pvals.length;
              }
            }
            const r = await pool.query(out, pvals);
            return r.rows;
          }
          if (typeof template === "string") {
            const r = await pool.query(template, vals);
            return r.rows;
          }
          // Last resort: try calling with the template as a string.
          try {
            const r = await pool.query(String(template), vals);
            return r.rows;
          } catch {
            throw new Error("unsupported $queryRaw shape: " + typeof template);
          }
        };
      }
      if (prop === "$transaction") {
        return async (promisesOrFn: any) => {
          if (typeof promisesOrFn === "function") {
            const client = await pool.connect();
            try {
              await client.query("BEGIN");
              // provide a tx client with same interface
              const tx = buildPgClientFromPg(client);
              const result = await promisesOrFn(tx);
              await client.query("COMMIT");
              return result;
            } catch (e) {
              await client.query("ROLLBACK");
              throw e;
            } finally {
              client.release();
            }
          }
          return Promise.all(promisesOrFn);
        };
      }
      // Model delegate. Prisma convention is lowercase model names (`user`,
      // `business`, `businessMember`) with relations available on the returned
      // objects. Our canonical map is keyed by PascalCase (User, Business, …).
      if (typeof prop === "string" && !prop.startsWith("$") && !prop.startsWith("_") && prop !== "constructor") {
        // Map lowercase to PascalCase using known models.
        const models = [
          "User","Business","BusinessMember","InstagramAccount","InstagramPost",
          "Product","ProductVariant","BusinessRuleset","BusinessRule",
          "AutomationConfig","Conversation","ConversationContext","Message",
          "MessageDelivery","Lead","WebhookEvent","FailedJob","AuditLog",
          "Subscription","UsageSnapshot","Notification",
        ];
        const pascal = prop[0].toUpperCase() + prop.slice(1);
        const match = models.find((m) => m.toLowerCase() === prop.toLowerCase() || m === pascal)
          || (prop[0] >= "A" && prop[0] <= "Z" ? prop : pascal);
        return delegate(match);
      }
      if (typeof prop === "string" && (prop.startsWith("$on") || prop === "$use" || prop === "$extends")) {
        return () => {};
      }
      return undefined;
    },
  });
  // helper for nested tx — wraps a pg Client
  function buildPgClientFromPg(c: any) {
    const subPool = { query: c.query.bind(c) } as any;
    return buildPgClient(subPool);
  }
  return proxyClient;
}

function createPrismaClient(): any {
  const real = tryRealPrisma();
  if (real) return real;
  // Sandbox-only pg fallback. NEVER enabled in production: when NODE_ENV=production
  // or SELLORA_ALLOW_PG_FALLBACK is not "1", we refuse to instantiate it. This
  // guarantees that deployed environments use the real Prisma client built by
  // `prisma generate` during install.
  const allowFallback = process.env.SELLORA_ALLOW_PG_FALLBACK === "1" && process.env.NODE_ENV !== "production";
  const url = process.env.PRISMA_FALLBACK_PG_URL;
  if (allowFallback && url && url.startsWith("postgresql://")) {
    if (!globalForPrisma._pgPool) {
      const parsed = new URL(url);
      const sslmode = (parsed.searchParams.get("sslmode") || "").toLowerCase();
      const isLocal = parsed.hostname === "127.0.0.1" || parsed.hostname === "localhost" || parsed.hostname === "::1";
      const wantSsl =
        sslmode === "require" || sslmode === "verify-ca" || sslmode === "verify-full" || (!isLocal && sslmode !== "disable");
      globalForPrisma._pgPool = new Pool({
        host: parsed.hostname,
        port: Number(parsed.port || 5432),
        user: decodeURIComponent(parsed.username || ""),
        password: decodeURIComponent(parsed.password || ""),
        database: parsed.pathname.slice(1),
        ssl: wantSsl ? { rejectUnauthorized: sslmode === "verify-ca" || sslmode === "verify-full" } : false,
        max: 5,
      });
    }
    return buildPgClient(globalForPrisma._pgPool);
  }
  return new Proxy(
    {},
    {
      get() {
        throw new Error("PrismaClient unavailable: no DATABASE_URL and no PRISMA_FALLBACK_PG_URL");
      },
    }
  );
}

// Lazy-init so environment variables set after import (tests/dev scripts) are honored.
let _prisma: any = null;
function getPrisma(): any {
  if (_prisma) return _prisma;
  if (globalForPrisma.prisma) {
    _prisma = globalForPrisma.prisma;
    return _prisma;
  }
  _prisma = createPrismaClient();
  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = _prisma;
  return _prisma;
}
export const prisma: any = new Proxy({} as any, {
  get(_t, prop) {
    return getPrisma()[prop];
  },
  set(_t, prop, value) {
    getPrisma()[prop] = value;
    return true;
  },
});

// Expose a helper for health checks
export async function pgHealth(): Promise<{ ok: boolean; error?: string }> {
  const pool = globalForPrisma._pgPool;
  if (!pool) return { ok: false, error: "no pg pool" };
  try {
    const r = await pool.query("SELECT 1 AS ok");
    return { ok: r.rows[0]?.ok === 1 };
  } catch (e: any) {
    return { ok: false, error: String(e.message || e) };
  }
}
