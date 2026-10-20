import { Module, Global } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { CloudflareModule } from '../modules/cloudflare/cloudflare.module';

@Global()
@Module({
  imports: [CloudflareModule],
  providers: [DatabaseService],
  exports: [DatabaseService, CloudflareModule],
})
export class DatabaseModule {}
