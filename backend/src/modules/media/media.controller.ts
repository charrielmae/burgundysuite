import {
  Controller,
  Post,
  Get,
  Req,
  Res,
  UseInterceptors,
  UploadedFile,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request, Response } from 'express';
import { CloudflareService } from '../cloudflare/cloudflare.service';

export interface UploadedMulterFile {
  fieldname?: string;
  originalname: string;
  encoding?: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
  destination?: string;
  filename?: string;
  path?: string;
}

@Controller()
export class MediaController {
  constructor(private readonly cloudflareService: CloudflareService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: UploadedMulterFile,
    @Body('folder') folder = 'suites'
  ) {
    if (!file) {
      throw new HttpException(
        { success: false, error: 'No file provided in form data' },
        HttpStatus.BAD_REQUEST
      );
    }

    const validTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/svg+xml',
      'image/avif',
    ];

    if (!validTypes.includes(file.mimetype) && !file.mimetype.startsWith('image/')) {
      throw new HttpException(
        {
          success: false,
          error: `Invalid file type: ${file.mimetype}. Please upload a JPG, PNG, WEBP, or GIF image.`,
        },
        HttpStatus.BAD_REQUEST
      );
    }

    const MAX_SIZE = 15 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      throw new HttpException(
        { success: false, error: 'File size exceeds maximum 15MB limit' },
        HttpStatus.BAD_REQUEST
      );
    }

    const safeName = (file.originalname || 'upload.jpg')
      .toLowerCase()
      .replace(/[^a-z0-9._-]/g, '-')
      .replace(/-+/g, '-');
    const key = `${folder}/${Date.now()}-${safeName}`;

    const uploadRes = await this.cloudflareService.uploadAssetToR2({
      key,
      buffer: file.buffer,
      contentType: file.mimetype || 'image/jpeg',
      metadata: {
        originalName: file.originalname,
        uploadedAt: new Date().toISOString(),
      },
    });

    const cfg = this.cloudflareService.getCloudflareR2Config();

    return {
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
    };
  }

  @Get('media/*')
  async streamMedia(@Req() req: Request, @Res() res: Response) {
    try {
      const fullPath = req.params[0] || '';
      if (!fullPath) {
        throw new HttpException({ error: 'Missing object key' }, HttpStatus.BAD_REQUEST);
      }

      const asset = await this.cloudflareService.getAssetFromR2(fullPath);
      if (!asset) {
        throw new HttpException(
          { error: `Media object "${fullPath}" not found` },
          HttpStatus.NOT_FOUND
        );
      }

      res.setHeader('Content-Type', asset.contentType);
      res.setHeader('Content-Length', asset.buffer.length);
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      res.send(asset.buffer);
    } catch (err) {
      if (err instanceof HttpException) {
        res.status(err.getStatus()).json(err.getResponse());
        return;
      }
      res.status(500).json({ error: 'Internal server error retrieving media' });
    }
  }
}
