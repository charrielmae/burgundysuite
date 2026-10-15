import { NextResponse } from 'next/server';
import {
  testCloudflareD1Connection,
  saveCloudflareD1ConfigToEnv,
  syncAllStoreDataToCloudflareD1,
  getCloudflareD1Config,
} from '@/lib/cloudflare-d1';
import {
  testCloudflareR2Connection,
  saveCloudflareR2ConfigToEnv,
  getCloudflareR2Config,
} from '@/lib/cloudflare-r2';
import { readDb } from '@/lib/db';

export async function GET() {
  try {
    const d1Config = getCloudflareD1Config();
    const d1Probe = await testCloudflareD1Connection();
    const r2Config = getCloudflareR2Config();
    const r2Probe = await testCloudflareR2Connection();

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

    return NextResponse.json({
      success: true,
      data: {
        ...d1Probe,
        config: safeD1Config,
        r2: {
          ...r2Probe,
          config: safeR2Config,
        },
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
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

    // Action 1: Manual Sync only (using current credentials)
    if (action === 'sync_now') {
      const db = readDb();
      const syncResult = await syncAllStoreDataToCloudflareD1(db);
      const probe = await testCloudflareD1Connection();
      const r2Probe = await testCloudflareR2Connection();
      return NextResponse.json({
        success: true,
        message: syncResult.message,
        data: {
          syncResult,
          probe,
          r2: r2Probe,
        },
      });
    }

    // Action 2: Save R2 configuration only
    if (action === 'save_r2') {
      saveCloudflareR2ConfigToEnv({
        accountId,
        bucketName: r2BucketName,
        accessKeyId: r2AccessKeyId,
        secretAccessKey: r2SecretAccessKey,
        publicUrl: r2PublicUrl,
      });
      const r2Probe = await testCloudflareR2Connection();
      return NextResponse.json({
        success: true,
        message: 'Cloudflare R2 Object Storage settings saved!',
        data: { r2: r2Probe },
      });
    }

    // Action 3: Save D1 (& optional R2) Credentials & Sync
    if (accountId?.trim() && databaseId?.trim() && apiToken?.trim()) {
      saveCloudflareD1ConfigToEnv({
        accountId: accountId.trim(),
        databaseId: databaseId.trim(),
        apiToken: apiToken.trim(),
      });
    }

    if (r2AccessKeyId !== undefined || r2SecretAccessKey !== undefined || r2BucketName) {
      saveCloudflareR2ConfigToEnv({
        accountId: accountId?.trim(),
        bucketName: r2BucketName?.trim() || 'burgundy-bucket',
        accessKeyId: r2AccessKeyId?.trim(),
        secretAccessKey: r2SecretAccessKey?.trim(),
        publicUrl: r2PublicUrl?.trim(),
      });
    }

    // Test live connection immediately
    const probe = await testCloudflareD1Connection();
    const r2Probe = await testCloudflareR2Connection();

    // Sync all existing store data immediately into Cloudflare D1 if connected
    let syncResult = null;
    if (probe.connected) {
      const db = readDb();
      syncResult = await syncAllStoreDataToCloudflareD1(db);
    }

    return NextResponse.json({
      success: true,
      message: `Cloudflare services configured! ${syncResult?.message || ''}`,
      data: {
        probe,
        r2: r2Probe,
        syncResult,
      },
    });
  } catch (error) {
    console.error('Cloudflare route error:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
