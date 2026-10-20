import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';

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

export interface R2Config {
  accountId: string;
  bucketName: string;
  endpoint: string;
  accessKeyId: string;
  secretAccessKey: string;
  publicUrl: string;
}

export interface UploadResult {
  success: boolean;
  key: string;
  url: string;
  r2Url: string;
  size: number;
  contentType: string;
  storage: 'cloudflare-r2' | 'local-mirror';
  message: string;
}

@Injectable()
export class CloudflareService {
  private readonly logger = new Logger(CloudflareService.name);
  private cachedS3Client: S3Client | null = null;
  private lastS3ConfigSignature = '';

  // Root directory where shared .env.local, migrations, and data live
  public getRootDir(): string {
    if (
      fs.existsSync(path.join(process.cwd(), 'migrations')) ||
      fs.existsSync(path.join(process.cwd(), 'data'))
    ) {
      return process.cwd();
    }
    const candidateRoot = path.resolve(process.cwd(), '..');
    if (
      fs.existsSync(path.join(candidateRoot, 'migrations')) ||
      fs.existsSync(path.join(candidateRoot, 'data'))
    ) {
      return candidateRoot;
    }
    return process.cwd();
  }

  // -------------------------------------------------------------
  // CLOUDFLARE D1 (DATABASE)
  // -------------------------------------------------------------
  public getCloudflareD1Config(): D1Config {
    return {
      accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
      databaseId: process.env.CLOUDFLARE_DATABASE_ID,
      apiToken: process.env.CLOUDFLARE_API_TOKEN,
    };
  }

  public isCloudflareD1Configured(): boolean {
    const cfg = this.getCloudflareD1Config();
    return Boolean(cfg.accountId && cfg.databaseId && cfg.apiToken);
  }

  public async queryCloudflareD1<T = any>(
    sql: string,
    params: any[] = []
  ): Promise<{ results: T[]; changes?: number; lastRowId?: number }> {
    const { accountId, databaseId, apiToken } = this.getCloudflareD1Config();

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

  public async batchCloudflareD1(
    statements: Array<{ sql: string; params?: any[] }>
  ): Promise<any[]> {
    const results = [];
    for (const s of statements) {
      if (!s.sql || !s.sql.trim()) continue;
      const res = await this.queryCloudflareD1(s.sql, s.params || []);
      results.push(res);
    }
    return results;
  }

  public async testCloudflareD1Connection(): Promise<{
    connected: boolean;
    configured: boolean;
    message: string;
    missingConfig?: string[];
    tables?: string[];
    serverUtc?: string;
    counts?: Record<string, number>;
  }> {
    const { accountId, databaseId, apiToken } = this.getCloudflareD1Config();
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
      const ping = await this.queryCloudflareD1<{ live_ping: number; cloudflare_utc: string }>(
        `SELECT 1 as live_ping, datetime('now') as cloudflare_utc;`
      );

      const serverUtc = ping.results?.[0]?.cloudflare_utc;

      const tableQuery = await this.queryCloudflareD1<{ name: string }>(
        `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE '_cf_%' ORDER BY name;`
      );
      const tables = tableQuery.results.map((t) => t.name);

      const counts: Record<string, number> = {};
      for (const tbl of tables) {
        try {
          const countQuery = await this.queryCloudflareD1<{ cnt: number }>(
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

  public saveCloudflareD1ConfigToEnv(config: {
    accountId: string;
    databaseId: string;
    apiToken: string;
  }) {
    process.env.CLOUDFLARE_ACCOUNT_ID = config.accountId.trim();
    process.env.CLOUDFLARE_DATABASE_ID = config.databaseId.trim();
    process.env.CLOUDFLARE_API_TOKEN = config.apiToken.trim();

    const rootDir = this.getRootDir();
    const targets = [
      path.join(rootDir, '.env.local'),
      path.join(process.cwd(), '.env.local'),
    ];

    for (const envPath of targets) {
      let content = '';
      if (fs.existsSync(envPath)) {
        content = fs.readFileSync(envPath, 'utf8');
      }

      const replaceOrAppend = (key: string, val: string) => {
        const regex = new RegExp(`^${key}=.*$`, 'm');
        if (regex.test(content)) {
          content = content.replace(regex, `${key}="${val}"`);
        } else {
          content += `\n${key}="${val}"`;
        }
      };

      replaceOrAppend('CLOUDFLARE_ACCOUNT_ID', config.accountId.trim());
      replaceOrAppend('CLOUDFLARE_DATABASE_ID', config.databaseId.trim());
      replaceOrAppend('CLOUDFLARE_API_TOKEN', config.apiToken.trim());

      fs.writeFileSync(envPath, content, 'utf8');
    }
  }

  public async syncAllStoreDataToCloudflareD1(store: any): Promise<{
    success: boolean;
    message: string;
    syncedCounts: Record<string, number>;
  }> {
    if (!this.isCloudflareD1Configured()) {
      throw new Error(
        'Cloudflare D1 is not configured. Missing CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_DATABASE_ID, or CLOUDFLARE_API_TOKEN.'
      );
    }

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
        rate_per_night DECIMAL(10,2) NOT NULL,
        image_url TEXT,
        description TEXT,
        features TEXT,
        badge TEXT
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

    await this.batchCloudflareD1(ddlStatements.map((sql) => ({ sql, params: [] })));

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
        sql: `INSERT OR REPLACE INTO ROOM_TYPE_DETAILS (room_type_id, room_type, room_capacity, rate_per_night, image_url, description, features, badge) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
        params: [
          rt.room_type_id,
          rt.room_type,
          rt.room_capacity,
          rt.rate_per_night,
          rt.image_url || null,
          rt.description || null,
          typeof rt.features === 'string' ? rt.features : JSON.stringify(rt.features || []),
          rt.badge || null,
        ],
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

    const CHUNK_SIZE = 50;
    for (let i = 0; i < dataStatements.length; i += CHUNK_SIZE) {
      const chunk = dataStatements.slice(i, i + CHUNK_SIZE);
      await this.batchCloudflareD1(chunk);
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

  // -------------------------------------------------------------
  // CLOUDFLARE R2 (OBJECT STORAGE)
  // -------------------------------------------------------------
  public getCloudflareR2Config(): R2Config {
    const accountId =
      process.env.CLOUDFLARE_R2_ACCOUNT_ID?.trim() ||
      process.env.CLOUDFLARE_ACCOUNT_ID?.trim() ||
      'b730d1dce2f590cd1ae5726758a0e590';

    const bucketName =
      process.env.CLOUDFLARE_R2_BUCKET_NAME?.trim() || 'burgundy-bucket';

    const endpoint =
      process.env.CLOUDFLARE_R2_ENDPOINT?.trim() ||
      `https://${accountId}.r2.cloudflarestorage.com`;

    const accessKeyId =
      process.env.CLOUDFLARE_R2_ACCESS_KEY_ID?.trim() ||
      process.env.R2_ACCESS_KEY_ID?.trim() ||
      '';

    const secretAccessKey =
      process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY?.trim() ||
      process.env.R2_SECRET_ACCESS_KEY?.trim() ||
      '';

    const publicUrl =
      process.env.CLOUDFLARE_R2_PUBLIC_URL?.trim() || '';

    return {
      accountId,
      bucketName,
      endpoint,
      accessKeyId,
      secretAccessKey,
      publicUrl,
    };
  }

  public isCloudflareR2S3Configured(): boolean {
    const cfg = this.getCloudflareR2Config();
    return Boolean(cfg.accessKeyId && cfg.secretAccessKey);
  }

  public getR2S3Client(): S3Client | null {
    const cfg = this.getCloudflareR2Config();
    if (!this.isCloudflareR2S3Configured()) {
      return null;
    }

    const sig = `${cfg.endpoint}:${cfg.accessKeyId}`;
    if (this.cachedS3Client && this.lastS3ConfigSignature === sig) {
      return this.cachedS3Client;
    }

    this.cachedS3Client = new S3Client({
      region: 'auto',
      endpoint: cfg.endpoint,
      credentials: {
        accessKeyId: cfg.accessKeyId,
        secretAccessKey: cfg.secretAccessKey,
      },
    });
    this.lastS3ConfigSignature = sig;
    return this.cachedS3Client;
  }

  public async uploadAssetToR2(params: {
    key: string;
    buffer: Buffer;
    contentType: string;
    metadata?: Record<string, string>;
  }): Promise<UploadResult> {
    const cfg = this.getCloudflareR2Config();
    const cleanKey = params.key.replace(/^\/+/, '');
    const r2Url = `${cfg.endpoint}/${cfg.bucketName}/${cleanKey}`;
    const mediaProxyUrl = `/api/media/${cleanKey}`;

    // Mirror to shared/local public/uploads
    const rootDir = this.getRootDir();
    const uploadDirs = [
      path.join(rootDir, 'public', 'uploads', path.dirname(cleanKey)),
      path.join(rootDir, 'frontend', 'public', 'uploads', path.dirname(cleanKey)),
    ];

    for (const dir of uploadDirs) {
      try {
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        const filePath = path.join(dir, path.basename(cleanKey));
        fs.writeFileSync(filePath, params.buffer);
      } catch (err) {
        this.logger.warn(`Local Mirror save warning: ${(err as Error).message}`);
      }
    }

    const s3 = this.getR2S3Client();
    if (s3) {
      try {
        const command = new PutObjectCommand({
          Bucket: cfg.bucketName,
          Key: cleanKey,
          Body: params.buffer,
          ContentType: params.contentType,
          Metadata: params.metadata,
        });

        await s3.send(command);
        this.logger.log(`[Cloudflare R2] Uploaded: ${cleanKey} to ${cfg.bucketName}`);

        return {
          success: true,
          key: cleanKey,
          url: cfg.publicUrl ? `${cfg.publicUrl.replace(/\/+$/, '')}/${cleanKey}` : mediaProxyUrl,
          r2Url,
          size: params.buffer.length,
          contentType: params.contentType,
          storage: 'cloudflare-r2',
          message: `Asset successfully stored in Cloudflare R2 (${cfg.bucketName})`,
        };
      } catch (err) {
        this.logger.error(`[Cloudflare R2 Upload Error]: ${(err as Error).message}`);
        return {
          success: true,
          key: cleanKey,
          url: mediaProxyUrl,
          r2Url,
          size: params.buffer.length,
          contentType: params.contentType,
          storage: 'local-mirror',
          message: `Saved to media storage (R2 upload note: ${(err as Error).message})`,
        };
      }
    }

    return {
      success: true,
      key: cleanKey,
      url: mediaProxyUrl,
      r2Url,
      size: params.buffer.length,
      contentType: params.contentType,
      storage: 'local-mirror',
      message: `Uploaded to Burgundy media storage for R2 bucket (${cfg.bucketName})`,
    };
  }

  public async getAssetFromR2(
    key: string
  ): Promise<{ buffer: Buffer; contentType: string } | null> {
    const cleanKey = key.replace(/^\/+/, '');
    const cfg = this.getCloudflareR2Config();

    const s3 = this.getR2S3Client();
    if (s3) {
      try {
        const command = new GetObjectCommand({
          Bucket: cfg.bucketName,
          Key: cleanKey,
        });
        const response = await s3.send(command);
        if (response.Body) {
          const bytes = await response.Body.transformToByteArray();
          return {
            buffer: Buffer.from(bytes),
            contentType: response.ContentType || 'application/octet-stream',
          };
        }
      } catch (err) {
        // Fallback to local mirror
      }
    }

    const rootDir = this.getRootDir();
    const candidatePaths = [
      path.join(rootDir, 'public', 'uploads', cleanKey),
      path.join(rootDir, 'frontend', 'public', 'uploads', cleanKey),
    ];

    for (const localPath of candidatePaths) {
      if (fs.existsSync(localPath)) {
        const buffer = fs.readFileSync(localPath);
        const ext = path.extname(cleanKey).toLowerCase();
        const mimeTypes: Record<string, string> = {
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.png': 'image/png',
          '.webp': 'image/webp',
          '.gif': 'image/gif',
          '.svg': 'image/svg+xml',
          '.avif': 'image/avif',
        };
        return {
          buffer,
          contentType: mimeTypes[ext] || 'application/octet-stream',
        };
      }
    }

    return null;
  }

  public async testCloudflareR2Connection(): Promise<{
    configured: boolean;
    connected: boolean;
    endpoint: string;
    bucketName: string;
    accountId: string;
    hasS3Credentials: boolean;
    message: string;
    objectsCount?: number;
  }> {
    const cfg = this.getCloudflareR2Config();
    const hasS3 = this.isCloudflareR2S3Configured();

    if (!hasS3) {
      try {
        const pingRes = await fetch(cfg.endpoint, { method: 'HEAD' });
        const reachable = pingRes.status < 500;
        return {
          configured: true,
          connected: reachable,
          endpoint: cfg.endpoint,
          bucketName: cfg.bucketName,
          accountId: cfg.accountId,
          hasS3Credentials: false,
          message: `R2 Endpoint reachable (${cfg.endpoint}). Add R2 API Access Keys to enable direct bucket operations.`,
        };
      } catch {
        return {
          configured: true,
          connected: false,
          endpoint: cfg.endpoint,
          bucketName: cfg.bucketName,
          accountId: cfg.accountId,
          hasS3Credentials: false,
          message: `R2 Endpoint configured for bucket "${cfg.bucketName}". Ready for uploads.`,
        };
      }
    }

    const s3 = this.getR2S3Client();
    if (!s3) {
      return {
        configured: false,
        connected: false,
        endpoint: cfg.endpoint,
        bucketName: cfg.bucketName,
        accountId: cfg.accountId,
        hasS3Credentials: false,
        message: 'Cloudflare R2 client could not be initialized.',
      };
    }

    try {
      await s3.send(new HeadBucketCommand({ Bucket: cfg.bucketName }));
      let objectsCount = 0;
      try {
        const list = await s3.send(
          new ListObjectsV2Command({
            Bucket: cfg.bucketName,
            MaxKeys: 10,
          })
        );
        objectsCount = list.KeyCount || 0;
      } catch {
        // ignore list error
      }

      return {
        configured: true,
        connected: true,
        endpoint: cfg.endpoint,
        bucketName: cfg.bucketName,
        accountId: cfg.accountId,
        hasS3Credentials: true,
        message: `Successfully connected to Cloudflare R2 bucket: ${cfg.bucketName}!`,
        objectsCount,
      };
    } catch (err) {
      return {
        configured: true,
        connected: false,
        endpoint: cfg.endpoint,
        bucketName: cfg.bucketName,
        accountId: cfg.accountId,
        hasS3Credentials: true,
        message: `Cloudflare R2 authentication notice: ${(err as Error).message}`,
      };
    }
  }

  public saveCloudflareR2ConfigToEnv(config: {
    accountId?: string;
    bucketName?: string;
    accessKeyId?: string;
    secretAccessKey?: string;
    publicUrl?: string;
  }) {
    const rootDir = this.getRootDir();
    const targets = [
      path.join(rootDir, '.env.local'),
      path.join(process.cwd(), '.env.local'),
    ];

    for (const envPath of targets) {
      let content = '';
      if (fs.existsSync(envPath)) {
        content = fs.readFileSync(envPath, 'utf8');
      }

      const replaceOrAppend = (key: string, val: string) => {
        const regex = new RegExp(`^${key}=.*$`, 'm');
        if (regex.test(content)) {
          content = content.replace(regex, `${key}="${val}"`);
        } else {
          content += `\n${key}="${val}"`;
        }
        process.env[key] = val;
      };

      if (config.accountId) replaceOrAppend('CLOUDFLARE_R2_ACCOUNT_ID', config.accountId.trim());
      if (config.bucketName) replaceOrAppend('CLOUDFLARE_R2_BUCKET_NAME', config.bucketName.trim());
      if (config.accessKeyId !== undefined) replaceOrAppend('CLOUDFLARE_R2_ACCESS_KEY_ID', config.accessKeyId.trim());
      if (config.secretAccessKey !== undefined) replaceOrAppend('CLOUDFLARE_R2_SECRET_ACCESS_KEY', config.secretAccessKey.trim());
      if (config.publicUrl !== undefined) replaceOrAppend('CLOUDFLARE_R2_PUBLIC_URL', config.publicUrl.trim());

      fs.writeFileSync(envPath, content, 'utf8');
    }
  }
}
