import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { OtpModule } from './otp/otp.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { SubscribersModule } from './subscribers/subscribers.module';
import { TelegramModule } from './telegram/telegram.module';
import { BroadcastModule } from './broadcast/broadcast.module';
import { HttpModule, HttpService } from '@nestjs/axios';
import { OnModuleInit } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGODB_URI as string, {
      dbName: 'broadcast',
    }),
    HttpModule,
    AuthModule,
    OtpModule,
    DatabaseModule,
    SubscriptionModule,
    SubscribersModule,
    TelegramModule,
    BroadcastModule,
  ],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly httpService: HttpService) {}

  async onModuleInit() {
    // Set Telegram webhook
    const webhookUrl = `${process.env.SERVER_URL}/telegram-webhook`;
    try {
      await firstValueFrom(
        this.httpService.post(
          `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/setWebhook`,
          { url: webhookUrl },
        ),
      );
      console.log(`Telegram webhook set to ${webhookUrl}`);
    } catch (error) {
      console.error('Error setting Telegram webhook:', error.message);
    }
  }
}
