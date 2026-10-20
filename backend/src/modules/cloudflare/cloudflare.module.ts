import { Module, Global } from '@nestjs/common';
import { CloudflareService } from './cloudflare.service';
import { CloudflareController } from './cloudflare.controller';

@Global()
@Module({
  controllers: [CloudflareController],
  providers: [CloudflareService],
  exports: [CloudflareService],
})
export class CloudflareModule {}
