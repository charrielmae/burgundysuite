import { NextRequest, NextResponse } from 'next/server';
import { getAssetFromR2 } from '@/lib/cloudflare-r2';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ key: string[] }> }
) {
  try {
    const { key: keyParts } = await context.params;
    const fullKey = Array.isArray(keyParts) ? keyParts.join('/') : keyParts;

    if (!fullKey) {
      return NextResponse.json({ error: 'Missing object key' }, { status: 400 });
    }

    const asset = await getAssetFromR2(fullKey);

    if (!asset) {
      return NextResponse.json(
        { error: `Media object "${fullKey}" not found` },
        { status: 404 }
      );
    }

    return new NextResponse(asset.buffer as any, {
      status: 200,
      headers: {
        'Content-Type': asset.contentType,
        'Content-Length': asset.buffer.length.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (err) {
    console.error('[API /api/media error]:', err);
    return NextResponse.json(
      { error: 'Internal server error retrieving media' },
      { status: 500 }
    );
  }
}
