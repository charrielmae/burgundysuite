import { NextRequest, NextResponse } from 'next/server';
import { uploadAssetToR2, getCloudflareR2Config } from '@/lib/cloudflare-r2';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided in form data' },
        { status: 400 }
      );
    }

    // Validate mime type
    const validTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/svg+xml',
      'image/avif',
    ];

    if (!validTypes.includes(file.type) && !file.type.startsWith('image/')) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid file type: ${file.type}. Please upload a JPG, PNG, WEBP, or GIF image.`,
        },
        { status: 400 }
      );
    }

    // Limit size to 15MB
    const MAX_SIZE = 15 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds maximum 15MB limit' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Sanitize filename
    const safeName = file.name
      .toLowerCase()
      .replace(/[^a-z0-9._-]/g, '-')
      .replace(/-+/g, '-');
    const folder = (formData.get('folder') as string) || 'suites';
    const key = `${folder}/${Date.now()}-${safeName}`;

    const uploadRes = await uploadAssetToR2({
      key,
      buffer,
      contentType: file.type || 'image/jpeg',
      metadata: {
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
      },
    });

    const cfg = getCloudflareR2Config();

    return NextResponse.json({
      success: true,
      message: uploadRes.message,
      data: {
        url: uploadRes.url,
        r2Url: uploadRes.r2Url,
        key: uploadRes.key,
        size: uploadRes.size,
        contentType: uploadRes.contentType,
        storage: uploadRes.storage,
        bucket: cfg.bucketName,
        endpoint: cfg.endpoint,
      },
    });
  } catch (err) {
    console.error('[API /api/upload error]:', err);
    return NextResponse.json(
      { success: false, error: (err as Error).message || 'Failed to upload image' },
      { status: 500 }
    );
  }
}
