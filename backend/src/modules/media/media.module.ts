import { Module } from '@nestjs/common';
import { MediaController } from './media.controller';
import { CloudflareModule } from '../cloudflare/cloudflare.module';

@Module({
  imports: [CloudflareModule],
  controllers: [MediaController],
})
export class MediaModule {}
