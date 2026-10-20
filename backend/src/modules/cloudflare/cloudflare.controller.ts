import { Controller, Get, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { CloudflareService } from './cloudflare.service';
import * as fs from 'fs';
import * as path from 'path';

@Controller('cloudflare')
export class CloudflareController {
  constructor(private readonly cloudflareService: CloudflareService) {}

  @Get()
  async getStatus() {
    try {
      const d1Config = this.cloudflareService.getCloudflareD1Config();
      const d1Probe = await this.cloudflareService.testCloudflareD1Connection();
      const r2Config = this.cloudflareService.getCloudflareR2Config();
      const r2Probe = await this.cloudflareService.testCloudflareR2Connection();

      const safeD1Config = {
        accountId: d1Config.accountId
          ? `${d1Config.accountId.substring(0, 4)}...${d1Config.accountId.substring(d1Config.accountId.length - 4)}`
          : null,
        databaseId: d1Config.databaseId
          ? `${d1Config.databaseId.substring(0, 4)}...${d1Config.databaseId.substring(d1Config.databaseId.length - 4)}`
          : null,
        apiTokenConfigured: Boolean(d1Config.apiToken && d1Config.apiToken.length > 5),
      };

      const safeR2Config = {
        accountId: r2Config.accountId,
        bucketName: r2Config.bucketName,
        endpoint: r2Config.endpoint,
        hasS3Credentials: Boolean(r2Config.accessKeyId && r2Config.secretAccessKey),
        publicUrl: r2Config.publicUrl,
      };

      return {
        success: true,
        data: {
          ...d1Probe,
          config: safeD1Config,
          r2: {
            ...r2Probe,
            config: safeR2Config,
          },
        },
      };
    } catch (error) {
      throw new HttpException(
        { success: false, error: (error as Error).message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post()
  async configureOrSync(@Body() body: any) {
    try {
      const {
        accountId,
        databaseId,
        apiToken,
        action,
        r2BucketName,
        r2AccessKeyId,
        r2SecretAccessKey,
        r2PublicUrl,
      } = body;

      // 1. Manual Sync only
      if (action === 'sync_now') {
        const rootDir = this.cloudflareService.getRootDir();
        const storePath = path.join(rootDir, 'data', 'burgundy_store.json');
        let db = { USER_ACCOUNT: [], STAFF_DETAILS: [], GUEST_DETAILS: [], ROOM_TYPE_DETAILS: [], ROOM_DETAILS: [], ROOM_BOOKING: [], PAYMENT_DETAILS: [] };
        if (fs.existsSync(storePath)) {
          db = JSON.parse(fs.readFileSync(storePath, 'utf8'));
        }

        const syncResult = await this.cloudflareService.syncAllStoreDataToCloudflareD1(db);
        const probe = await this.cloudflareService.testCloudflareD1Connection();
        const r2Probe = await this.cloudflareService.testCloudflareR2Connection();

        return {
          success: true,
          message: syncResult.message,
          data: {
            syncResult,
            probe,
            r2: r2Probe,
          },
        };
      }

      // 2. Save R2 configuration
      if (action === 'save_r2') {
        this.cloudflareService.saveCloudflareR2ConfigToEnv({
          accountId,
          bucketName: r2BucketName,
          accessKeyId: r2AccessKeyId,
          secretAccessKey: r2SecretAccessKey,
          publicUrl: r2PublicUrl,
        });
        const r2Probe = await this.cloudflareService.testCloudflareR2Connection();
        return {
          success: true,
          message: 'Cloudflare R2 Object Storage settings saved!',
          data: { r2: r2Probe },
        };
      }

      // 3. Save D1 Credentials & Probe
      if (accountId?.trim() && databaseId?.trim() && apiToken?.trim()) {
        this.cloudflareService.saveCloudflareD1ConfigToEnv({
          accountId: accountId.trim(),
          databaseId: databaseId.trim(),
          apiToken: apiToken.trim(),
        });
      }

      if (r2AccessKeyId !== undefined || r2SecretAccessKey !== undefined || r2BucketName) {
        this.cloudflareService.saveCloudflareR2ConfigToEnv({
          accountId: accountId?.trim(),
          bucketName: r2BucketName?.trim() || 'burgundy-bucket',
          accessKeyId: r2AccessKeyId?.trim(),
          secretAccessKey: r2SecretAccessKey?.trim(),
          publicUrl: r2PublicUrl?.trim(),
        });
      }

      const probe = await this.cloudflareService.testCloudflareD1Connection();
      const r2Probe = await this.cloudflareService.testCloudflareR2Connection();

      let syncResult = null;
      if (probe.connected) {
        const rootDir = this.cloudflareService.getRootDir();
        const storePath = path.join(rootDir, 'data', 'burgundy_store.json');
        if (fs.existsSync(storePath)) {
          const db = JSON.parse(fs.readFileSync(storePath, 'utf8'));
          syncResult = await this.cloudflareService.syncAllStoreDataToCloudflareD1(db);
        }
      }

      return {
        success: true,
        message: `Cloudflare services configured! ${syncResult?.message || ''}`,
        data: {
          probe,
          r2: r2Probe,
          syncResult,
        },
      };
    } catch (error) {
      throw new HttpException(
        { success: false, error: (error as Error).message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('sync')
  async syncSqlFiles() {
    try {
      if (!this.cloudflareService.isCloudflareD1Configured()) {
        throw new HttpException(
          {
            success: false,
            error:
              'Cloudflare D1 is not configured. Please save CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_DATABASE_ID, and CLOUDFLARE_API_TOKEN in .env.local first.',
          },
          HttpStatus.BAD_REQUEST
        );
      }

      const rootDir = this.cloudflareService.getRootDir();
      const schemaPath = path.join(rootDir, 'migrations', '0001_initial_schema.sql');
      const seedPath = path.join(rootDir, 'migrations', 'seed.sql');

      if (!fs.existsSync(schemaPath) || !fs.existsSync(seedPath)) {
        throw new Error('Migration SQL files not found in migrations/ directory.');
      }

      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      const seedSql = fs.readFileSync(seedPath, 'utf8');

      const parseStatements = (raw: string) =>
        raw
          .split(';')
          .map((s) =>
            s
              .split('\n')
              .filter((line) => !line.trim().startsWith('--'))
              .join('\n')
              .trim()
          )
          .filter((s) => s.length > 0)
          .map((sql) => ({ sql: sql + ';', params: [] }));

      const schemaStatements = parseStatements(schemaSql);
      const seedStatements = parseStatements(seedSql);

      await this.cloudflareService.batchCloudflareD1(schemaStatements);
      await this.cloudflareService.batchCloudflareD1(seedStatements);

      const testResult = await this.cloudflareService.testCloudflareD1Connection();

      return {
        success: true,
        message: 'Cloudflare D1 schema and seed successfully initialized and synced!',
        data: testResult,
      };
    } catch (error) {
      throw new HttpException(
        { success: false, error: (error as Error).message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
