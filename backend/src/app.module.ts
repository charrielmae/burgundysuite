import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { CloudflareModule } from './modules/cloudflare/cloudflare.module';
import { AuthModule } from './modules/auth/auth.module';
import { RoomsModule } from './modules/rooms/rooms.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { AdminModule } from './modules/admin/admin.module';
import { MediaModule } from './modules/media/media.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['../.env.local', '.env.local', '../.env', '.env'],
    }),
    DatabaseModule,
    CloudflareModule,
    AuthModule,
    RoomsModule,
    BookingsModule,
    AdminModule,
    MediaModule,
  ],
})
export class AppModule {}
