/**
 * Cloudflare D1 Database Client for Burgundy Suite & Resort
 *
 * Supports two runtime modes:
 * 1. Cloudflare Workers / Pages Binding (env.DB) when deployed on Cloudflare.
 * 2. Cloudflare D1 REST API (CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_DATABASE_ID, CLOUDFLARE_API_TOKEN)
 *    when running in Next.js development, node runtime, or hybrid deployment.
 */

import fs from 'fs';
import path from 'path';

interface CloudflareD1Response<T = any> {
  result: Array<{
    results: T[];
    success: boolean;
    meta?: {
      served_by?: string;
      duration?: number;
      changes?: number;
      last_row_id?: number;
    };
  }>;
  success: boolean;
  errors: Array<{ code: number; message: string }>;
  messages: string[];
}

export interface D1Config {
  accountId?: string;
  databaseId?: string;
  apiToken?: string;
}

export function getCloudflareD1Config(): D1Config {
  return {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
    databaseId: process.env.CLOUDFLARE_DATABASE_ID,
    apiToken: process.env.CLOUDFLARE_API_TOKEN,
  };
}

export function isCloudflareD1Configured(): boolean {
  const cfg = getCloudflareD1Config();
  return Boolean(cfg.accountId && cfg.databaseId && cfg.apiToken);
}

/**
 * Execute a SQL statement or query against Cloudflare D1 Database via REST API
 */
export async function queryCloudflareD1<T = any>(
  sql: string,
  params: any[] = []
): Promise<{ results: T[]; changes?: number; lastRowId?: number }> {
  const { accountId, databaseId, apiToken } = getCloudflareD1Config();

  if (!accountId || !databaseId || !apiToken) {
    throw new Error(
      'Cloudflare D1 is not fully configured. Missing CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_DATABASE_ID, or CLOUDFLARE_API_TOKEN.'
    );
  }

  const endpoint = `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sql,
      params,
    }),
  });

  const data = (await response.json()) as CloudflareD1Response<T>;

  if (!response.ok || !data.success) {
    const errorMsg = data.errors?.map((e) => e.message).join(', ') || response.statusText;
    throw new Error(`Cloudflare D1 Query Failed: ${errorMsg}`);
  }

  const firstBatch = data.result?.[0];
  return {
    results: firstBatch?.results || [],
    changes: firstBatch?.meta?.changes,
    lastRowId: firstBatch?.meta?.last_row_id,
  };
}

/**
 * Execute multiple statements in a batch transaction on Cloudflare D1
 */
export async function batchCloudflareD1(
  statements: Array<{ sql: string; params?: any[] }>
): Promise<any[]> {
  const { accountId, databaseId, apiToken } = getCloudflareD1Config();

  if (!accountId || !databaseId || !apiToken) {
    throw new Error(
      'Cloudflare D1 is not configured. Missing CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_DATABASE_ID, or CLOUDFLARE_API_TOKEN.'
    );
  }

  const endpoint = `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(
      statements.map((s) => ({
        sql: s.sql,
        params: s.params || [],
      }))
    ),
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    const errorMsg = data.errors?.map((e: any) => e.message).join(', ') || response.statusText;
    throw new Error(`Cloudflare D1 Batch Failed: ${errorMsg}`);
  }

  return data.result;
}

/**
 * Perform a live probe test against Cloudflare D1
 */
export async function testCloudflareD1Connection(): Promise<{
  connected: boolean;
  configured: boolean;
  message: string;
  missingConfig?: string[];
  tables?: string[];
  serverUtc?: string;
  counts?: Record<string, number>;
}> {
  const { accountId, databaseId, apiToken } = getCloudflareD1Config();
  const missing: string[] = [];
  if (!accountId || !accountId.trim()) missing.push('CLOUDFLARE_ACCOUNT_ID');
  if (!databaseId || !databaseId.trim()) missing.push('CLOUDFLARE_DATABASE_ID');
  if (!apiToken || !apiToken.trim()) missing.push('CLOUDFLARE_API_TOKEN');

  if (missing.length > 0) {
    return {
      connected: false,
      configured: false,
      message: `Cloudflare D1 is not configured. Missing variables in .env.local: ${missing.join(', ')}`,
      missingConfig: missing,
    };
  }

  try {
    // 1. Basic Ping Query
    const ping = await queryCloudflareD1<{ live_ping: number; cloudflare_utc: string }>(
      `SELECT 1 as live_ping, datetime('now') as cloudflare_utc;`
    );

    const serverUtc = ping.results?.[0]?.cloudflare_utc;

    // 2. Discover tables
    const tableQuery = await queryCloudflareD1<{ name: string }>(
      `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE '_cf_%' ORDER BY name;`
    );
    const tables = tableQuery.results.map((t) => t.name);

    // 3. Optional quick row counts
    const counts: Record<string, number> = {};
    for (const tbl of tables) {
      try {
        const countQuery = await queryCloudflareD1<{ cnt: number }>(
          `SELECT COUNT(*) as cnt FROM ${tbl};`
        );
        counts[tbl] = countQuery.results?.[0]?.cnt ?? 0;
      } catch {
        // ignore individual table count error
      }
    }

    return {
      connected: true,
      configured: true,
      message: `Successfully connected to Cloudflare D1 Database! (${tables.length} tables found)`,
      tables,
      serverUtc,
      counts,
    };
  } catch (err) {
    return {
      connected: false,
      configured: true,
      message: `Failed connecting to Cloudflare D1: ${(err as Error).message}`,
    };
  }
}

/**
 * Persist Cloudflare credentials to process.env and .env.local file
 */
export function saveCloudflareD1ConfigToEnv(config: {
  accountId: string;
  databaseId: string;
  apiToken: string;
}) {
  process.env.CLOUDFLARE_ACCOUNT_ID = config.accountId.trim();
  process.env.CLOUDFLARE_DATABASE_ID = config.databaseId.trim();
  process.env.CLOUDFLARE_API_TOKEN = config.apiToken.trim();

  const envPath = path.join(process.cwd(), '.env.local');
  let content = '';
  if (fs.existsSync(envPath)) {
    content = fs.readFileSync(envPath, 'utf8');
  }

  const replaceOrAppend = (key: string, val: string) => {
    const regex = new RegExp(`^${key}=.*$`, 'm');
    if (regex.test(content)) {
      content = content.replace(regex, `${key}=${val}`);
    } else {
      content += `\n${key}=${val}`;
    }
  };

  replaceOrAppend('CLOUDFLARE_ACCOUNT_ID', config.accountId.trim());
  replaceOrAppend('CLOUDFLARE_DATABASE_ID', config.databaseId.trim());
  replaceOrAppend('CLOUDFLARE_API_TOKEN', config.apiToken.trim());

  fs.writeFileSync(envPath, content, 'utf8');
}

/**
 * Synchronize all current records from the store into Cloudflare D1
 */
export async function syncAllStoreDataToCloudflareD1(store: {
  USER_ACCOUNT: any[];
  STAFF_DETAILS: any[];
  GUEST_DETAILS: any[];
  ROOM_TYPE_DETAILS: any[];
  ROOM_DETAILS: any[];
  ROOM_BOOKING: any[];
  PAYMENT_DETAILS: any[];
}): Promise<{
  success: boolean;
  message: string;
  syncedCounts: Record<string, number>;
}> {
  if (!isCloudflareD1Configured()) {
    throw new Error('Cloudflare D1 is not configured. Missing CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_DATABASE_ID, or CLOUDFLARE_API_TOKEN.');
  }

  // 1. Ensure 7 Tables exist in Cloudflare D1
  const ddlStatements = [
    `CREATE TABLE IF NOT EXISTS USER_ACCOUNT (
      user_id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_name VARCHAR(50) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      user_role VARCHAR(20) NOT NULL,
      acc_status VARCHAR(20) NOT NULL,
      created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );`,
    `CREATE TABLE IF NOT EXISTS STAFF_DETAILS (
      staff_id INTEGER PRIMARY KEY,
      user_id INTEGER UNIQUE NOT NULL,
      first_name VARCHAR(20) NOT NULL,
      last_name VARCHAR(20) NOT NULL,
      position VARCHAR(20) NOT NULL,
      contact_number VARCHAR(20) UNIQUE NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS GUEST_DETAILS (
      user_id INTEGER PRIMARY KEY,
      first_name VARCHAR(20) NOT NULL,
      last_name VARCHAR(20) NOT NULL,
      birth_date DATE NOT NULL,
      nationality VARCHAR(20) NOT NULL,
      civil_status VARCHAR(20) NOT NULL,
      contact_number VARCHAR(20) UNIQUE NOT NULL,
      email_address VARCHAR(50) UNIQUE NOT NULL,
      address VARCHAR(255) NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS ROOM_TYPE_DETAILS (
      room_type_id INTEGER PRIMARY KEY,
      room_type VARCHAR(100) NOT NULL,
      room_capacity INTEGER NOT NULL,
      rate_per_night DECIMAL(10,2) NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS ROOM_DETAILS (
      room_id INTEGER PRIMARY KEY,
      room_type_id INTEGER NOT NULL,
      room_number INTEGER UNIQUE NOT NULL,
      floor_number INTEGER NOT NULL,
      room_status VARCHAR(20) NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS ROOM_BOOKING (
      booking_id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      room_id INTEGER NOT NULL,
      booking_date DATE NOT NULL,
      check_in_date DATE NOT NULL,
      check_out_date DATE NOT NULL,
      total_amount DECIMAL(10,2) NOT NULL,
      booking_status VARCHAR(20) NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS PAYMENT_DETAILS (
      payment_id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_id INTEGER UNIQUE NOT NULL,
      payment_method VARCHAR(50) NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      payment_status VARCHAR(20) NOT NULL,
      payment_date DATETIME NULL
    );`,
  ];

  await batchCloudflareD1(ddlStatements.map((sql) => ({ sql, params: [] })));

  // 2. Build insert/replace statements for all store entities
  const dataStatements: Array<{ sql: string; params: any[] }> = [];

  for (const u of store.USER_ACCOUNT || []) {
    dataStatements.push({
      sql: `INSERT OR REPLACE INTO USER_ACCOUNT (user_id, user_name, password_hash, user_role, acc_status, created_date) VALUES (?, ?, ?, ?, ?, ?);`,
      params: [u.user_id, u.user_name, u.password_hash, u.user_role, u.acc_status, u.created_date],
    });
  }

  for (const s of store.STAFF_DETAILS || []) {
    dataStatements.push({
      sql: `INSERT OR REPLACE INTO STAFF_DETAILS (staff_id, user_id, first_name, last_name, position, contact_number) VALUES (?, ?, ?, ?, ?, ?);`,
      params: [s.staff_id, s.user_id, s.first_name, s.last_name, s.position, s.contact_number],
    });
  }

  for (const g of store.GUEST_DETAILS || []) {
    dataStatements.push({
      sql: `INSERT OR REPLACE INTO GUEST_DETAILS (user_id, first_name, last_name, birth_date, nationality, civil_status, contact_number, email_address, address) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      params: [
        g.user_id,
        g.first_name,
        g.last_name,
        g.birth_date,
        g.nationality,
        g.civil_status,
        g.contact_number,
        g.email_address,
        g.address,
      ],
    });
  }

  for (const rt of store.ROOM_TYPE_DETAILS || []) {
    dataStatements.push({
      sql: `INSERT OR REPLACE INTO ROOM_TYPE_DETAILS (room_type_id, room_type, room_capacity, rate_per_night) VALUES (?, ?, ?, ?);`,
      params: [rt.room_type_id, rt.room_type, rt.room_capacity, rt.rate_per_night],
    });
  }

  for (const r of store.ROOM_DETAILS || []) {
    dataStatements.push({
      sql: `INSERT OR REPLACE INTO ROOM_DETAILS (room_id, room_type_id, room_number, floor_number, room_status) VALUES (?, ?, ?, ?, ?);`,
      params: [r.room_id, r.room_type_id, r.room_number, r.floor_number, r.room_status],
    });
  }

  for (const b of store.ROOM_BOOKING || []) {
    dataStatements.push({
      sql: `INSERT OR REPLACE INTO ROOM_BOOKING (booking_id, user_id, room_id, booking_date, check_in_date, check_out_date, total_amount, booking_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
      params: [
        b.booking_id,
        b.user_id,
        b.room_id,
        b.booking_date,
        b.check_in_date,
        b.check_out_date,
        b.total_amount,
        b.booking_status,
      ],
    });
  }

  for (const p of store.PAYMENT_DETAILS || []) {
    dataStatements.push({
      sql: `INSERT OR REPLACE INTO PAYMENT_DETAILS (payment_id, booking_id, payment_method, amount, payment_status, payment_date) VALUES (?, ?, ?, ?, ?, ?);`,
      params: [
        p.payment_id,
        p.booking_id,
        p.payment_method,
        p.amount,
        p.payment_status,
        p.payment_date || null,
      ],
    });
  }

  // Cloudflare D1 batch supports up to 100 statements per request, so chunk in batches of 50
  const CHUNK_SIZE = 50;
  for (let i = 0; i < dataStatements.length; i += CHUNK_SIZE) {
    const chunk = dataStatements.slice(i, i + CHUNK_SIZE);
    await batchCloudflareD1(chunk);
  }

  return {
    success: true,
    message: `All ${dataStatements.length} store records successfully synchronized into Cloudflare D1!`,
    syncedCounts: {
      users: (store.USER_ACCOUNT || []).length,
      staff: (store.STAFF_DETAILS || []).length,
      guests: (store.GUEST_DETAILS || []).length,
      room_types: (store.ROOM_TYPE_DETAILS || []).length,
      rooms: (store.ROOM_DETAILS || []).length,
      bookings: (store.ROOM_BOOKING || []).length,
      payments: (store.PAYMENT_DETAILS || []).length,
    },
  };
}


