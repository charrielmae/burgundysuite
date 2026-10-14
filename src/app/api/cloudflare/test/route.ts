import { NextResponse } from 'next/server';
import { testCloudflareD1Connection, getCloudflareD1Config } from '@/lib/cloudflare-d1';

export async function GET() {
  try {
    const config = getCloudflareD1Config();
    const result = await testCloudflareD1Connection();

    // Mask sensitive API token for security in response
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
      ...result,
      config: safeConfig,
    });
  } catch (error) {
    return NextResponse.json(
      {
        connected: false,
        configured: false,
        message: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
