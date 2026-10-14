import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { batchCloudflareD1, isCloudflareD1Configured, testCloudflareD1Connection } from '@/lib/cloudflare-d1';

export async function POST() {
  try {
    if (!isCloudflareD1Configured()) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Cloudflare D1 is not configured. Please save CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_DATABASE_ID, and CLOUDFLARE_API_TOKEN in .env.local first.',
        },
        { status: 400 }
      );
    }

    const schemaPath = path.join(process.cwd(), 'migrations', '0001_initial_schema.sql');
    const seedPath = path.join(process.cwd(), 'migrations', 'seed.sql');

    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    const seedSql = fs.readFileSync(seedPath, 'utf8');

    // Split SQL by semicolon into individual valid statements
    const parseStatements = (raw: string) =>
      raw
        .split(';')
        .map((s) => s.trim())
        .filter((s) => s.length > 0 && !s.startsWith('--'))
        .map((sql) => ({ sql: sql + ';', params: [] }));

    const schemaStatements = parseStatements(schemaSql);
    const seedStatements = parseStatements(seedSql);

    // Run schema migrations first
    console.log(`[Cloudflare D1] Applying ${schemaStatements.length} schema statements...`);
    await batchCloudflareD1(schemaStatements);

    // Run seed data
    console.log(`[Cloudflare D1] Applying ${seedStatements.length} seed statements...`);
    await batchCloudflareD1(seedStatements);

    // Verify
    const testResult = await testCloudflareD1Connection();

    return NextResponse.json({
      success: true,
      message: 'Cloudflare D1 schema and seed successfully initialized and synced!',
      data: testResult,
    });
  } catch (error) {
    console.error('Cloudflare D1 sync error:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
