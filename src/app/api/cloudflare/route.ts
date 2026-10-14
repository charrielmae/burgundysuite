import { NextResponse } from 'next/server';
import {
  testCloudflareD1Connection,
  saveCloudflareD1ConfigToEnv,
  syncAllStoreDataToCloudflareD1,
  getCloudflareD1Config,
} from '@/lib/cloudflare-d1';
import { readDb } from '@/lib/db';

export async function GET() {
  try {
    const config = getCloudflareD1Config();
    const probe = await testCloudflareD1Connection();

    const safeConfig = {
      accountId: config.accountId
        ? `${config.accountId.substring(0, 4)}...${config.accountId.substring(config.accountId.length - 4)}`
        : null,
      databaseId: config.databaseId
        ? `${config.databaseId.substring(0, 4)}...${config.databaseId.substring(config.databaseId.length - 4)}`
        : null,
      apiTokenConfigured: Boolean(config.apiToken && config.apiToken.length > 5),
    };

    return NextResponse.json({
      success: true,
      data: {
        ...probe,
        config: safeConfig,
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
    const { accountId, databaseId, apiToken, action } = body;

    // Action 1: Manual Sync only (using current credentials)
    if (action === 'sync_now') {
      const db = readDb();
      const syncResult = await syncAllStoreDataToCloudflareD1(db);
      const probe = await testCloudflareD1Connection();
      return NextResponse.json({
        success: true,
        message: syncResult.message,
        data: {
          syncResult,
          probe,
        },
      });
    }

    // Action 2: Save Credentials & Sync
    if (!accountId?.trim() || !databaseId?.trim() || !apiToken?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Account ID, Database ID, and API Token are all required.',
        },
        { status: 400 }
      );
    }

    // Save to process.env and .env.local
    saveCloudflareD1ConfigToEnv({
      accountId: accountId.trim(),
      databaseId: databaseId.trim(),
      apiToken: apiToken.trim(),
    });

    // Test live connection immediately
    const probe = await testCloudflareD1Connection();
    if (!probe.connected) {
      return NextResponse.json(
        {
          success: false,
          error: `Credentials saved, but failed to connect to Cloudflare D1: ${probe.message}. Please check that your API Token has 'D1:Edit' permissions and Account ID/Database ID are correct.`,
          data: probe,
        },
        { status: 400 }
      );
    }

    // Sync all existing store data immediately into Cloudflare D1
    const db = readDb();
    const syncResult = await syncAllStoreDataToCloudflareD1(db);

    return NextResponse.json({
      success: true,
      message: `Cloudflare D1 successfully verified! ${syncResult.message}`,
      data: {
        probe,
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
