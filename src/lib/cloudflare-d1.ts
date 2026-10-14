/**
 * Cloudflare D1 Database Client for Burgundy Suite & Resort
 *
 * Supports two runtime modes:
 * 1. Cloudflare Workers / Pages Binding (env.DB) when deployed on Cloudflare.
 * 2. Cloudflare D1 REST API (CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_DATABASE_ID, CLOUDFLARE_API_TOKEN)
 *    when running in Next.js development, node runtime, or hybrid deployment.
 */

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
